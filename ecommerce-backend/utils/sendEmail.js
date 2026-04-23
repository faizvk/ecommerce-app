import nodemailer from "nodemailer";
import { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_FROM } from "../config/env.js";

const createTransport = () => {
  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) return null;

  return nodemailer.createTransport({
    host: SMTP_HOST,
    port: Number(SMTP_PORT) || 587,
    secure: Number(SMTP_PORT) === 465,
    auth: { user: SMTP_USER, pass: SMTP_PASS },
  });
};

export const sendEmail = async ({ to, subject, html }) => {
  const transporter = createTransport();

  if (!transporter) {
    // SMTP not configured — log link to console in development
    console.log(`\n[EMAIL - SMTP NOT CONFIGURED]\nTo: ${to}\nSubject: ${subject}\n${html}\n`);
    return;
  }

  await transporter.sendMail({
    from: SMTP_FROM || SMTP_USER,
    to,
    subject,
    html,
  });
};
