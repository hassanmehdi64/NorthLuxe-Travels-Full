import nodemailer from "nodemailer";
import { env } from "../config/env.js";

const hasSmtpConfig = Boolean(env.smtpHost && env.smtpUser && env.smtpPass);

const transporter = hasSmtpConfig
  ? nodemailer.createTransport({
      host: env.smtpHost,
      port: env.smtpPort,
      secure: env.smtpSecure,
      auth: {
        user: env.smtpUser,
        pass: env.smtpPass,
      },
    })
  : null;

const deliverMail = async ({ to, subject, text, html }) => {
  if (!transporter) {
    console.log(`[Email preview] To: ${to}\nSubject: ${subject}\n${text}`);
    return;
  }
  await transporter.sendMail({
    from: env.emailFrom,
    to,
    subject,
    text,
    html,
  });
};

export const sendMailSafely = async (mailOptions) => {
  try {
    await deliverMail(mailOptions);
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
