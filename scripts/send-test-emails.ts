import fs from "fs";
import nodemailer from "nodemailer";
import { getRegistrantEmailHtml, getAdminEmailHtml } from "../src/lib/email";
import { Registration } from "../src/lib/types";

// Read .env.local
const envContent = fs.readFileSync(".env.local", "utf-8");
const env: Record<string, string> = {};
envContent.split("\n").forEach((line) => {
  const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
  if (match) {
    let value = match[2] || "";
    if (value.startsWith('"') && value.endsWith('"')) value = value.slice(1, -1);
    env[match[1]] = value;
  }
});

const sampleReg: Registration = {
  id: "BR-2026-0001",
  name: "আহমেদ সাদিক",
  whatsapp: "01717662350",
  email: "sadiq.alam@gmail.com",
  bkash: "01717662350",
  bkashSameAsWhatsapp: true,
  registeredAt: new Date().toISOString(),
  formattedDate: "29 Sep 2026, 11:05 AM (BST)",
  status: "Ticket Not Sent",
  ticketCode: "",
  notes: "",
};

async function main() {
  console.log("=== Testing SMTP Email Dispatch ===");
  console.log("Host:", env.SMTP_HOST || "smtppro.zoho.com");
  console.log("Port:", env.SMTP_PORT || "465");
  console.log("User:", env.SMTP_USER || "contact@dsectors.org");
  console.log("Target recipient:", "sadiq.alam@gmail.com");
  console.log("BCC recipients:", "sadiq.alam@gmail.com, sabinakakoli@gmail.com");

  const transporter = nodemailer.createTransport({
    host: env.SMTP_HOST || "smtppro.zoho.com",
    port: Number(env.SMTP_PORT) || 465,
    secure: Number(env.SMTP_PORT) === 465,
    auth: {
      user: env.SMTP_USER,
      pass: env.SMTP_PASS,
    },
    tls: {
      rejectUnauthorized: false,
    },
  });

  try {
    // 1. Send Registrant Confirmation Email
    console.log("\n1. Sending Template 1: Registrant Confirmation Email...");
    const res1 = await transporter.sendMail({
      from: env.SMTP_FROM || '"শব্দ ও সুরে বিমূর্ত রাত্রি" <contact@dsectors.org>',
      to: "sadiq.alam@gmail.com",
      bcc: ["sadiq.alam@gmail.com", "sabinakakoli@gmail.com"],
      subject: `বিমূর্ত রাত্রি - টিকিট নিবন্ধনের প্রাপ্তি স্বীকার (আইডি: ${sampleReg.id}) [টেস্ট ইমেইল]`,
      html: getRegistrantEmailHtml(sampleReg),
    });
    console.log("✅ Template 1 Sent Successfully! Message ID:", res1.messageId);

    // 2. Send Admin Notification Email
    console.log("\n2. Sending Template 2: Admin Notification Email...");
    const res2 = await transporter.sendMail({
      from: env.SMTP_FROM || '"শব্দ ও সুরে বিমূর্ত রাত্রি" <contact@dsectors.org>',
      to: "sadiq.alam@gmail.com",
      bcc: ["sadiq.alam@gmail.com", "sabinakakoli@gmail.com"],
      subject: `[নতুন নিবন্ধন] বিমূর্ত রাত্রি - ${sampleReg.name} (বিকাশ: ${sampleReg.bkash}) [টেস্ট নোটিফিকেশন]`,
      html: getAdminEmailHtml(sampleReg, "http://localhost:3000"),
    });
    console.log("✅ Template 2 Sent Successfully! Message ID:", res2.messageId);

    console.log("\n🎉 Both test emails were successfully dispatched to sadiq.alam@gmail.com!");
  } catch (err: any) {
    console.error("\n❌ SMTP Dispatch Failed:");
    console.error("Message:", err.message);
    if (err.response) console.error("Server Response:", err.response);
  }
}

main();
