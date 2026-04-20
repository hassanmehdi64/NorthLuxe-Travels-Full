import net from "node:net";
import tls from "node:tls";
import { env } from "../config/env.js";

const hasSmtpConfig = Boolean(env.smtpHost && env.smtpUser && env.smtpPass);

const maskEmail = (value = "") => {
  const [name, domain] = String(value).split("@");
  if (!name || !domain) return Boolean(value) ? "<set>" : "";
  return `${name.slice(0, 2)}***@${domain}`;
};

export const getEmailConfigStatus = () => {
  const from = env.emailFrom
    ? env.emailFrom.replace(/<([^>]+)>/, (_match, email) => `<${maskEmail(email)}>`)
    : "";

  return {
    configured: hasSmtpConfig,
    hostSet: Boolean(env.smtpHost),
    port: env.smtpPort,
    secure: env.smtpSecure,
    userSet: Boolean(env.smtpUser),
    passSet: Boolean(env.smtpPass),
    user: maskEmail(env.smtpUser),
    fromSet: Boolean(env.emailFrom),
    from,
  };
};

const extractEmailAddress = (value = "") => {
  const match = String(value).match(/<([^>]+)>/);
  return (match?.[1] || value).trim();
};

const encodeBase64 = (value = "") => Buffer.from(String(value), "utf8").toString("base64");

const normalizeSmtpText = (value = "") =>
  String(value)
    .replace(/\r?\n/g, "\r\n")
    .split("\r\n")
    .map((line) => (line.startsWith(".") ? `.${line}` : line))
    .join("\r\n");

const createResponseReader = (socket) => {
  let buffer = "";
  const waiters = [];

  const flush = () => {
    const match = buffer.match(/(?:^|\r\n)(\d{3}) [^\r\n]*(?:\r\n|$)/);
    if (!match || !waiters.length) return;

    const endIndex = match.index + match[0].length;
    const response = buffer.slice(0, endIndex).trimEnd();
    buffer = buffer.slice(endIndex);
    const waiter = waiters.shift();
    waiter.resolve(response);
  };

  const handleData = (chunk) => {
    buffer += chunk;
    flush();
  };
  const handleError = (error) => {
    while (waiters.length) waiters.shift().reject(error);
  };
  const handleClose = () => {
    while (waiters.length) waiters.shift().reject(new Error("SMTP connection closed."));
  };

  socket.setEncoding("utf8");
  socket.on("data", handleData);
  socket.on("error", handleError);
  socket.on("close", handleClose);

  const read = () =>
    new Promise((resolve, reject) => {
      waiters.push({ resolve, reject });
      flush();
    });

  read.cleanup = () => {
    socket.off("data", handleData);
    socket.off("error", handleError);
    socket.off("close", handleClose);
  };

  return read;
};

const assertSmtpCode = (response, expectedCodes, action) => {
  const code = Number(String(response).slice(0, 3));
  if (!expectedCodes.includes(code)) {
    throw new Error(`SMTP ${action} failed with ${code || "unknown"}: ${response}`);
  }
};

const writeSmtp = (socket, command) =>
  new Promise((resolve, reject) => {
    socket.write(`${command}\r\n`, (error) => (error ? reject(error) : resolve()));
  });

const connectSocket = (secure) =>
  new Promise((resolve, reject) => {
    const options = {
      host: env.smtpHost,
      port: env.smtpPort,
      servername: env.smtpHost,
    };
    const socket = secure ? tls.connect(options, () => resolve(socket)) : net.connect(options, () => resolve(socket));
    socket.setTimeout(20000);
    socket.once("timeout", () => {
      socket.destroy();
      reject(new Error("SMTP connection timed out."));
    });
    socket.once("error", reject);
  });

const upgradeToTls = (socket) =>
  new Promise((resolve, reject) => {
    const secureSocket = tls.connect({ socket, servername: env.smtpHost }, () => resolve(secureSocket));
    secureSocket.once("error", reject);
  });

const createSmtpSession = async () => {
  if (!hasSmtpConfig) {
    throw new Error("SMTP is not configured. Add SMTP_HOST, SMTP_USER, and SMTP_PASS in the backend environment.");
  }

  let socket = await connectSocket(env.smtpSecure);
  let readResponse = createResponseReader(socket);

  assertSmtpCode(await readResponse(), [220], "greeting");
  await writeSmtp(socket, "EHLO northluxe.local");
  assertSmtpCode(await readResponse(), [250], "EHLO");

  if (!env.smtpSecure) {
    await writeSmtp(socket, "STARTTLS");
    assertSmtpCode(await readResponse(), [220], "STARTTLS");
    readResponse.cleanup?.();
    socket = await upgradeToTls(socket);
    readResponse = createResponseReader(socket);
    await writeSmtp(socket, "EHLO northluxe.local");
    assertSmtpCode(await readResponse(), [250], "EHLO after STARTTLS");
  }

  await writeSmtp(socket, "AUTH LOGIN");
  assertSmtpCode(await readResponse(), [334], "AUTH LOGIN");
  await writeSmtp(socket, encodeBase64(env.smtpUser));
  assertSmtpCode(await readResponse(), [334], "SMTP username");
  await writeSmtp(socket, encodeBase64(env.smtpPass));
  assertSmtpCode(await readResponse(), [235], "SMTP password");

  return { socket, readResponse };
};

const closeSmtpSession = async ({ socket, readResponse }) => {
  try {
    await writeSmtp(socket, "QUIT");
    await readResponse();
  } catch {
    // The message has already been sent or the verify flow has completed.
  } finally {
    socket.end();
  }
};

export const verifyEmailTransport = async () => {
  const session = await createSmtpSession();
  await closeSmtpSession(session);
  return true;
};

const deliverMail = async ({ to, subject, text, html }) => {
  const session = await createSmtpSession();
  const { socket, readResponse } = session;
  const fromAddress = extractEmailAddress(env.emailFrom);
  const toAddress = extractEmailAddress(to);
  const boundary = `northluxe-${Date.now()}`;
  const message = [
    `From: ${env.emailFrom}`,
    `To: ${toAddress}`,
    `Subject: ${subject}`,
    "MIME-Version: 1.0",
    `Content-Type: multipart/alternative; boundary="${boundary}"`,
    "",
    `--${boundary}`,
    "Content-Type: text/plain; charset=UTF-8",
    "Content-Transfer-Encoding: 8bit",
    "",
    normalizeSmtpText(text),
    "",
    `--${boundary}`,
    "Content-Type: text/html; charset=UTF-8",
    "Content-Transfer-Encoding: 8bit",
    "",
    normalizeSmtpText(html || text),
    "",
    `--${boundary}--`,
    ".",
  ].join("\r\n");

  try {
    await writeSmtp(socket, `MAIL FROM:<${fromAddress}>`);
    assertSmtpCode(await readResponse(), [250], "MAIL FROM");
    await writeSmtp(socket, `RCPT TO:<${toAddress}>`);
    assertSmtpCode(await readResponse(), [250, 251], "RCPT TO");
    await writeSmtp(socket, "DATA");
    assertSmtpCode(await readResponse(), [354], "DATA");
    await writeSmtp(socket, message);
    assertSmtpCode(await readResponse(), [250], "message delivery");
  } finally {
    await closeSmtpSession(session);
  }
};

export const sendMailSafely = async (mailOptions) => {
  try {
    await deliverMail(mailOptions);
    console.log(`[Email sent] To: ${mailOptions.to} | Subject: ${mailOptions.subject}`);
    return true;
  } catch (error) {
    console.error("[Email failed]", error?.message || error);
    return false;
  }
};

const escapeHtml = (value = "") =>
  String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");

const money = (currency, amount) => `${currency || "PKR"} ${Number(amount || 0).toLocaleString()}`;

const baseEmailHtml = ({ title, intro, rows = [], footer = "North Luxe Travels" }) => `
  <div style="margin:0;padding:24px;background:#f4faf8;font-family:Arial,sans-serif;color:#123245;">
    <div style="max-width:620px;margin:0 auto;background:#ffffff;border:1px solid #cbece3;border-radius:14px;overflow:hidden;">
      <div style="padding:20px 22px;background:#e9fbf4;border-bottom:1px solid #cbece3;">
        <p style="margin:0 0 6px;font-size:11px;letter-spacing:.16em;text-transform:uppercase;color:#0f8f74;font-weight:700;">North Luxe Travels</p>
        <h1 style="margin:0;font-size:22px;line-height:1.25;color:#0f172a;">${escapeHtml(title)}</h1>
      </div>
      <div style="padding:22px;">
        <p style="margin:0 0 18px;font-size:15px;line-height:1.7;color:#3b5568;">${escapeHtml(intro)}</p>
        <table style="width:100%;border-collapse:collapse;">
          ${rows
            .map(
              ([label, value]) => `
                <tr>
                  <td style="padding:10px 0;border-top:1px solid #eef4f2;font-size:12px;letter-spacing:.08em;text-transform:uppercase;color:#647a8a;font-weight:700;">${escapeHtml(label)}</td>
                  <td style="padding:10px 0;border-top:1px solid #eef4f2;text-align:right;font-size:14px;color:#123245;font-weight:700;">${escapeHtml(value)}</td>
                </tr>
              `,
            )
            .join("")}
        </table>
        <p style="margin:20px 0 0;font-size:14px;line-height:1.7;color:#3b5568;">${escapeHtml(footer)}</p>
      </div>
    </div>
  </div>
`;

export const sendBookingConfirmationEmail = async ({
  to,
  customerName,
  bookingCode,
  tourTitle,
  travelDate,
  guests = 1,
  addOns = [],
  totalAmount,
  advanceAmount = 0,
  remainingAmount = 0,
  currency,
}) => {
  const subject = `Booking Confirmation - ${bookingCode}`;
  const rows = [
    ["Booking Code", bookingCode],
    ["Tour", tourTitle],
    ["Travel Date & Time", travelDate || "Flexible"],
    ["Guests", String(guests)],
    ["Selected Add-ons", addOns.length ? addOns.join(", ") : "None"],
    ["Total Amount", money(currency, totalAmount)],
    ["Advance Amount", money(currency, advanceAmount)],
    ["Remaining Balance", money(currency, remainingAmount)],
  ];
  const text = [
    `Dear ${customerName},`,
    "",
    "Your booking request has been received successfully.",
    `Booking Code: ${bookingCode}`,
    `Tour: ${tourTitle}`,
    `Travel Date & Time: ${travelDate || "Flexible"}`,
    `Guests: ${guests}`,
    `Selected Add-ons: ${addOns.length ? addOns.join(", ") : "None"}`,
    `Total Amount: ${currency} ${totalAmount}`,
    `Advance Amount: ${currency} ${advanceAmount}`,
    `Remaining Balance: ${currency} ${remainingAmount}`,
    "",
    "Next step: our concierge team will contact you with itinerary and payment verification details.",
    "North Luxe Travels",
  ].join("\n");
  const html = baseEmailHtml({
    title: "Booking Request Received",
    intro: `Dear ${customerName}, your booking request has been received successfully. Our team will contact you shortly.`,
    rows,
    footer: "Next step: our concierge team will contact you with itinerary and payment verification details.",
  });

  return sendMailSafely({ to, subject, text, html });
};

export const sendPaymentConfirmationEmail = async ({
  to,
  customerName,
  bookingCode,
  amountPaid,
  paymentMethod,
  transactionReference,
  remainingBalance,
  bookingStatus,
  currency,
}) => {
  const subject = `Payment Confirmation - ${bookingCode}`;
  const rows = [
    ["Booking Code", bookingCode],
    ["Amount Paid", money(currency, amountPaid)],
    ["Payment Method", paymentMethod],
    ["Transaction Reference", transactionReference || "N/A"],
    ["Remaining Balance", money(currency, remainingBalance)],
    ["Booking Status", bookingStatus],
  ];
  const text = [
    `Dear ${customerName},`,
    "",
    "We have confirmed your payment successfully.",
    `Booking Code: ${bookingCode}`,
    `Amount Paid: ${currency} ${amountPaid}`,
    `Payment Method: ${paymentMethod}`,
    `Transaction Reference: ${transactionReference || "N/A"}`,
    `Remaining Balance: ${currency} ${remainingBalance}`,
    `Booking Status: ${bookingStatus}`,
    "",
    "Thank you for choosing North Luxe Travels.",
  ].join("\n");
  const html = baseEmailHtml({
    title: "Payment Confirmed",
    intro: `Dear ${customerName}, we have confirmed your payment successfully.`,
    rows,
    footer: "Thank you for choosing North Luxe Travels.",
  });

  return sendMailSafely({ to, subject, text, html });
};

export const sendContactConfirmationEmail = async ({
  to,
  sender,
  subject: inquirySubject,
  message,
}) => {
  const subject = "We received your message - North Luxe Travels";
  const rows = [
    ["Name", sender],
    ["Subject", inquirySubject],
    ["Message", message],
  ];
  const text = [
    `Dear ${sender},`,
    "",
    "Thank you for contacting North Luxe Travels. We have received your message and our team will respond soon.",
    `Subject: ${inquirySubject}`,
    `Message: ${message}`,
    "",
    "North Luxe Travels",
  ].join("\n");
  const html = baseEmailHtml({
    title: "Message Received",
    intro: `Dear ${sender}, thank you for contacting North Luxe Travels. We have received your message and our team will respond soon.`,
    rows,
  });

  return sendMailSafely({ to, subject, text, html });
};
