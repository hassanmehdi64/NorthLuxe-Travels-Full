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

const deliverMail = async ({ to, subject, text }) => {
  if (!transporter) {
    console.log(`[Email preview] To: ${to}\nSubject: ${subject}\n${text}`);
    return;
  }
  await transporter.sendMail({
    from: env.emailFrom,
    to,
    subject,
    text,
  });
};

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

  await deliverMail({ to, subject, text });
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

  await deliverMail({ to, subject, text });
};
