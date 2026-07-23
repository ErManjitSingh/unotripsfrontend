import nodemailer from "nodemailer";

const SMTP_HOST = process.env.META_SMTP_HOST || "smtp.gmail.com";
const SMTP_PORT = Number(process.env.META_SMTP_PORT || 587);
const SMTP_USER = process.env.META_SMTP_USER || "unotripsit@gmail.com";
const SMTP_PASS = process.env.META_SMTP_PASS || "srwg qxtj izrw kcmw";
const MAIL_FROM = process.env.META_MAIL_FROM || "query@ptwhotels.com";
const MAIL_TO = (process.env.META_MAIL_TO || "unotripsit@gmail.com,manjitsingh012345@gmail.com")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);

export type MetaLeadMailInput = {
  name: string;
  phone: string;
  email?: string;
  destination: string;
  city?: string;
  packageTitle?: string;
  landingPage: string;
  captureType: string;
  message?: string;
};

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export async function sendMetaLeadMail(input: MetaLeadMailInput): Promise<boolean> {
  const transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: SMTP_PORT,
    secure: false,
    auth: {
      user: SMTP_USER,
      pass: SMTP_PASS,
    },
  });

  const isChat = input.captureType === "chatbot";
  const subject = isChat
    ? `Chatbot conversation - ${input.destination} Tour`
    : `${input.destination} Tour Query - ${input.landingPage}`;

  const lines = [
    `${input.name} wrote the following details:`,
    `Name: ${input.name}`,
    `Mobile: ${input.phone}`,
  ];
  if (input.email) lines.push(`Email: ${input.email}`);
  lines.push(`Destination: ${input.destination}`);
  if (input.city) lines.push(`City: ${input.city}`);
  if (input.packageTitle) lines.push(`Package: ${input.packageTitle}`);
  lines.push(`Landing: ${input.landingPage}`);
  lines.push(`Capture: ${input.captureType}`);
  if (input.message) {
    lines.push("", "Message / Chat:", input.message);
  }
  lines.push("", "--- Sent from Uno Trips meta landing (Next.js)");

  const plain = lines.join("\n");

  const rows: Array<[string, string]> = [
    ["Name", input.name],
    ["Mobile", input.phone],
  ];
  if (input.email) rows.push(["Email", input.email]);
  rows.push(["Destination", input.destination]);
  if (input.city) rows.push(["City", input.city]);
  if (input.packageTitle) rows.push(["Package", input.packageTitle]);
  rows.push(["Landing", input.landingPage]);
  rows.push(["Capture", input.captureType]);

  const detailHtml = rows
    .map(
      ([k, v]) =>
        `<tr><td style="color:#64748b;width:120px;padding:4px 0;">${escapeHtml(k)}</td><td style="font-weight:600;padding:4px 0;">${escapeHtml(v)}</td></tr>`,
    )
    .join("");

  const messageHtml = input.message
    ? `<tr><td colspan="2" style="padding-top:16px;"><p style="margin:0 0 8px;font-size:12px;color:#64748b;text-transform:uppercase;">Message / Conversation</p><div style="white-space:pre-wrap;background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;padding:12px;font-size:14px;line-height:1.5;color:#1e293b;">${escapeHtml(input.message)}</div></td></tr>`
    : "";

  const html = `<!DOCTYPE html><html><body style="margin:0;padding:0;font-family:Arial,sans-serif;background:#f5f5f5;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f5f5;padding:20px 0;"><tr><td align="center">
<table width="600" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:8px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.08);">
<tr><td style="background:#075e54;color:#fff;padding:16px 24px;font-size:18px;font-weight:bold;">${escapeHtml(subject)}</td></tr>
<tr><td style="padding:20px 24px;"><table width="100%" cellpadding="0" cellspacing="0" style="font-size:14px;color:#1e293b;">${detailHtml}${messageHtml}</table></td></tr>
<tr><td style="padding:12px 24px;font-size:11px;color:#94a3b8;border-top:1px solid #e5e7eb;">Sent from Uno Trips meta landing (Next.js)</td></tr>
</table></td></tr></table></body></html>`;

  await transporter.sendMail({
    from: `"Uno Trips" <${MAIL_FROM}>`,
    to: MAIL_TO,
    subject,
    text: plain,
    html,
  });

  return true;
}