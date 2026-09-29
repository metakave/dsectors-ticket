import nodemailer from "nodemailer";
import { Registration } from "./types";

// Configure SMTP transport
function createTransporter() {
  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT) || 587;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!host || !user || !pass) {
    return null;
  }

  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: {
      user,
      pass,
    },
    tls: {
      rejectUnauthorized: false,
    },
  });
}

// 1. Registrant Confirmation Email Template (Bengali + English luxury theme)
export function getRegistrantEmailHtml(reg: Registration): string {
  return `
<!DOCTYPE html>
<html lang="bn">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>বিমূর্ত রাত্রি - টিকিট নিবন্ধন নিশ্চিতকরণ</title>
  <style>
    body {
      margin: 0;
      padding: 0;
      background-color: #050d18;
      font-family: 'Helvetica Neue', Arial, 'Segoe UI', sans-serif;
      color: #e2e8f0;
      -webkit-font-smoothing: antialiased;
    }
    .wrapper {
      max-width: 600px;
      margin: 20px auto;
      background: linear-gradient(180deg, #0a192f 0%, #06101e 100%);
      border: 1px solid #d4af37;
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 10px 30px rgba(0,0,0,0.5);
    }
    .header {
      background: linear-gradient(135deg, #112240 0%, #0a192f 100%);
      padding: 30px 20px;
      text-align: center;
      border-bottom: 2px solid #d4af37;
      position: relative;
    }
    .badge {
      display: inline-block;
      background: rgba(212, 175, 55, 0.15);
      border: 1px solid #d4af37;
      color: #f3e8c8;
      padding: 4px 14px;
      border-radius: 20px;
      font-size: 12px;
      letter-spacing: 1px;
      margin-bottom: 12px;
    }
    .event-title {
      color: #f3e8c8;
      font-size: 26px;
      font-weight: 700;
      margin: 0 0 6px 0;
      letter-spacing: 0.5px;
    }
    .event-subtitle {
      color: #d4af37;
      font-size: 15px;
      margin: 0;
    }
    .content {
      padding: 30px 24px;
    }
    .greeting {
      font-size: 18px;
      color: #ffffff;
      margin-bottom: 15px;
    }
    .status-alert {
      background: rgba(212, 175, 55, 0.1);
      border-left: 4px solid #d4af37;
      padding: 14px 18px;
      border-radius: 4px;
      margin: 20px 0;
    }
    .status-alert p {
      margin: 0;
      color: #fef3c7;
      font-size: 14px;
      line-height: 1.6;
    }
    .details-box {
      background: rgba(17, 34, 64, 0.6);
      border: 1px solid rgba(212, 175, 55, 0.25);
      border-radius: 8px;
      padding: 18px;
      margin: 20px 0;
    }
    .details-title {
      font-size: 14px;
      text-transform: uppercase;
      color: #d4af37;
      letter-spacing: 1px;
      margin-bottom: 12px;
      font-weight: 600;
    }
    .detail-row {
      display: flex;
      justify-content: space-between;
      padding: 8px 0;
      border-bottom: 1px dashed rgba(255,255,255,0.08);
      font-size: 14px;
    }
    .detail-row:last-child {
      border-bottom: none;
    }
    .detail-label {
      color: #94a3b8;
    }
    .detail-val {
      color: #f8fafc;
      font-weight: 600;
      text-align: right;
    }
    .event-info-card {
      background: linear-gradient(135deg, rgba(212, 175, 55, 0.08), rgba(11, 26, 46, 0.5));
      border: 1px solid rgba(212, 175, 55, 0.3);
      border-radius: 8px;
      padding: 16px;
      margin: 20px 0;
    }
    .event-info-item {
      margin: 6px 0;
      font-size: 13.5px;
      color: #cbd5e1;
    }
    .footer {
      text-align: center;
      padding: 20px;
      background: #030810;
      border-top: 1px solid rgba(212, 175, 55, 0.2);
      font-size: 12px;
      color: #64748b;
    }
    .gold-highlight {
      color: #f3e8c8;
      font-weight: bold;
    }
  </style>
</head>
<body>
  <div class="wrapper">
    <!-- Header -->
    <div class="header">
      <div class="badge">টিকিট নিবন্ধন প্রাপ্তি স্বীকার</div>
      <h1 class="event-title">শব্দ ও সুরে বিমূর্ত রাত্রি</h1>
      <p class="event-subtitle">গান ও কবিতায় এক সন্ধ্যা</p>
    </div>

    <!-- Main Content -->
    <div class="content">
      <div class="greeting">
        নমস্কার / প্রিয় <strong>${reg.name}</strong>,
      </div>

      <p style="line-height: 1.7; color: #cbd5e1; font-size: 14.5px;">
        <strong>"শব্দ ও সুরে বিমূর্ত রাত্রি"</strong> অনুষ্ঠানে আপনার টিকিট নিবন্ধন সফলভাবে গ্রহণ করা হয়েছে। 
      </p>

      <!-- Verification Alert Notice -->
      <div class="status-alert">
        <p>
          ⏳ <strong>পেমেন্ট যাচাই প্রক্রিয়াধীন:</strong><br/>
          আপনার প্রেরিত বিকাশ নম্বর (<span class="gold-highlight">${reg.bkash}</span>) হতে পেমেন্ট ম্যানুয়ালি ভেরিফাই করার পর অতি শীঘ্রই আপনার এই ইমেইলে <strong>ডিজিটাল টিকিট</strong> প্রেরণ করা হবে।
        </p>
      </div>

      <!-- Registration Summary -->
      <div class="details-box">
        <div class="details-title">নিবন্ধন বিবরণী (Registration Details)</div>
        
        <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
          <tr style="border-bottom: 1px dashed rgba(255,255,255,0.08);">
            <td style="padding: 8px 0; color: #94a3b8;">রেজিস্ট্রেশন আইডি:</td>
            <td style="padding: 8px 0; color: #f3e8c8; font-weight: bold; text-align: right;">${reg.id}</td>
          </tr>
          <tr style="border-bottom: 1px dashed rgba(255,255,255,0.08);">
            <td style="padding: 8px 0; color: #94a3b8;">আবেদনকারীর নাম:</td>
            <td style="padding: 8px 0; color: #ffffff; text-align: right;">${reg.name}</td>
          </tr>
          <tr style="border-bottom: 1px dashed rgba(255,255,255,0.08);">
            <td style="padding: 8px 0; color: #94a3b8;">হোয়াটসঅ্যাপ নম্বর:</td>
            <td style="padding: 8px 0; color: #ffffff; text-align: right;">${reg.whatsapp}</td>
          </tr>
          <tr style="border-bottom: 1px dashed rgba(255,255,255,0.08);">
            <td style="padding: 8px 0; color: #94a3b8;">ইমেইল ঠিকানা:</td>
            <td style="padding: 8px 0; color: #ffffff; text-align: right;">${reg.email}</td>
          </tr>
          <tr style="border-bottom: 1px dashed rgba(255,255,255,0.08);">
            <td style="padding: 8px 0; color: #94a3b8;">টাকা পাঠানোর বিকাশ নম্বর:</td>
            <td style="padding: 8px 0; color: #f3e8c8; font-weight: bold; text-align: right;">${reg.bkash}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #94a3b8;">বর্তমান স্ট্যাটাস:</td>
            <td style="padding: 8px 0; color: #f59e0b; font-weight: bold; text-align: right;">পেমেন্ট ভেরিফিকেশন সাপেক্ষে (Ticket Not Sent)</td>
          </tr>
        </table>
      </div>

      <!-- Event Info -->
      <div class="event-info-card">
        <div style="font-weight: bold; color: #d4af37; margin-bottom: 8px; font-size: 14px;">অনুষ্ঠান সূচি ও ভেন্যু:</div>
        <div class="event-info-item">📅 <strong>তারিখ:</strong> ৯ অক্টোবর ২০২৬ (শুক্রবার)</div>
        <div class="event-info-item">⏰ <strong>সময়:</strong> সন্ধ্যা ৬:৩০ টা - ৮:৩০ টা</div>
        <div class="event-info-item">📍 <strong>স্থান:</strong> আহারী বাহার মিলনায়তন, ধানমন্ডি ২৭, ঢাকা</div>
      </div>

      <p style="font-size: 13.5px; color: #94a3b8; line-height: 1.6;">
        আপনার যেকোনো জিজ্ঞাসা বা জরুরি প্রয়োজনে আমাদের সাপোর্ট টিমের সাথে সরাসরি যোগাযোগ করতে পারেন।
      </p>

      <p style="color: #cbd5e1; font-size: 14px; margin-top: 25px;">
        আন্তরিক ধন্যবাদসহ,<br/>
        <strong style="color: #f3e8c8;">বিমূর্ত রাত্রি আয়োজক কমিটি</strong>
      </p>
    </div>

    <!-- Footer -->
    <div class="footer">
      <p style="margin: 0 0 5px 0;">© ২০২৬ শব্দ ও সুরে বিমূর্ত রাত্রি। সর্বস্বত্ব সংরক্ষিত।</p>
      <p style="margin: 0; font-size: 11px;">এটি একটি স্বয়ংক্রিয়ভাবে প্রেরিত নিশ্চিতকরণ বার্তা।</p>
    </div>
  </div>
</body>
</html>
  `;
}

// 2. Admin Notification Email Template
export function getAdminEmailHtml(reg: Registration, siteUrl: string): string {
  const adminUrl = `${siteUrl}/admin`;
  const downloadUrl = `${siteUrl}/api/export-xlsx`;

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>New Ticket Registration Alert</title>
  <style>
    body {
      margin: 0;
      padding: 0;
      background-color: #0b1320;
      font-family: Arial, Helvetica, sans-serif;
      color: #e2e8f0;
    }
    .wrapper {
      max-width: 620px;
      margin: 20px auto;
      background: #111e33;
      border: 1px solid #d4af37;
      border-radius: 10px;
      overflow: hidden;
    }
    .header {
      background: #081220;
      padding: 24px;
      border-bottom: 2px solid #d4af37;
      text-align: center;
    }
    .header h2 {
      color: #f3e8c8;
      margin: 0 0 6px 0;
      font-size: 22px;
    }
    .header p {
      color: #94a3b8;
      margin: 0;
      font-size: 13px;
    }
    .content {
      padding: 24px;
    }
    .alert-banner {
      background: rgba(212, 175, 55, 0.15);
      border: 1px solid #d4af37;
      border-radius: 6px;
      padding: 14px;
      margin-bottom: 20px;
      color: #fef3c7;
      font-size: 14px;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 24px;
      font-size: 14px;
    }
    th, td {
      padding: 10px 12px;
      border-bottom: 1px solid rgba(255, 255, 255, 0.08);
      text-align: left;
    }
    th {
      color: #94a3b8;
      width: 38%;
      background: rgba(0, 0, 0, 0.2);
    }
    td {
      color: #f8fafc;
      font-weight: 500;
    }
    .highlight-cell {
      background: rgba(212, 175, 55, 0.1);
      color: #fef08a;
      font-weight: bold;
      font-size: 15px;
    }
    .btn-group {
      text-align: center;
      margin: 25px 0 10px 0;
    }
    .btn {
      display: inline-block;
      padding: 12px 24px;
      margin: 6px;
      border-radius: 6px;
      text-decoration: none;
      font-weight: bold;
      font-size: 14px;
    }
    .btn-primary {
      background: #d4af37;
      color: #081220;
    }
    .btn-secondary {
      background: rgba(255, 255, 255, 0.1);
      color: #f3e8c8;
      border: 1px solid #d4af37;
    }
    .footer {
      background: #081220;
      padding: 16px;
      text-align: center;
      font-size: 12px;
      color: #64748b;
      border-top: 1px solid rgba(255, 255, 255, 0.05);
    }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="header">
      <h2>🚨 নতুন টিকিট নিবন্ধন জমা পড়েছে</h2>
      <p>শব্দ ও সুরে বিমূর্ত রাত্রি - ইভেন্ট ম্যানেজমেন্ট</p>
    </div>

    <div class="content">
      <div class="alert-banner">
        <strong>অ্যাকশন দরকার:</strong> নিম্নে উল্লিখিত বিকাশ নম্বর (<strong style="color: #fef08a;">${reg.bkash}</strong>) থেকে টাকা প্রাপ্তি যাচাই করে টিকিট প্রেরণ নিশ্চিত করুন।
      </div>

      <table>
        <tr>
          <th>রেজিস্ট্রেশন আইডি (ID)</th>
          <td><strong>${reg.id}</strong></td>
        </tr>
        <tr>
          <th>তারিখ ও সময় (Date)</th>
          <td>${reg.formattedDate}</td>
        </tr>
        <tr>
          <th>আবেদনকারীর নাম (Name)</th>
          <td>${reg.name}</td>
        </tr>
        <tr>
          <th>হোয়াটসঅ্যাপ নম্বর (WhatsApp)</th>
          <td><a href="https://wa.me/${reg.whatsapp.replace(/[^0-9]/g, '')}" style="color: #38bdf8; text-decoration: none;">${reg.whatsapp} 💬</a></td>
        </tr>
        <tr>
          <th>ইমেইল (Email)</th>
          <td><a href="mailto:${reg.email}" style="color: #38bdf8; text-decoration: none;">${reg.email}</a></td>
        </tr>
        <tr>
          <th>বিকাশ নম্বর (bKash Number)</th>
          <td class="highlight-cell">${reg.bkash}</td>
        </tr>
        <tr>
          <th>স্ট্যাটাস (Status)</th>
          <td style="color: #f87171; font-weight: bold;">${reg.status}</td>
        </tr>
      </table>

      <div class="btn-group">
        <a href="${adminUrl}" class="btn btn-primary">অ্যাডমিন ড্যাশবোর্ডে দেখুন</a>
        <a href="${downloadUrl}" class="btn btn-secondary">ডাউনলোড Excel (.xlsx)</a>
      </div>
    </div>

    <div class="footer">
      Bimurto Ratri Ticketing System • Automated Admin Notification
    </div>
  </div>
</body>
</html>
  `;
}

// Send Registration Emails (both to Admin and Registrant)
export async function sendRegistrationEmails(
  reg: Registration,
  originUrl = "http://localhost:3000"
): Promise<{ success: boolean; error?: string }> {
  try {
    const transporter = createTransporter();

    if (!transporter) {
      console.log(
        "ℹ️ [SMTP Info] SMTP credentials not fully set in environment variables. Email simulation mode active."
      );
      console.log(`[Email Simulation] Target Registrant: ${reg.email}, Admin: ${process.env.ADMIN_EMAIL || "admin@example.com"}`);
      return { success: true };
    }

    const fromAddress = process.env.SMTP_FROM || `"বিমূর্ত রাত্রি" <noreply@bimurtoratri.com>`;
    const adminEmail = process.env.ADMIN_EMAIL || process.env.SMTP_USER || "admin@bimurtoratri.com";

    // 1. Send Registrant Confirmation Email
    const registrantMailPromise = transporter.sendMail({
      from: fromAddress,
      to: reg.email,
      subject: `বিমূর্ত রাত্রি - টিকিট নিবন্ধনের প্রাপ্তি স্বীকার (আইডি: ${reg.id})`,
      html: getRegistrantEmailHtml(reg),
    });

    // 2. Send Admin Notification Email
    const adminMailPromise = transporter.sendMail({
      from: fromAddress,
      to: adminEmail,
      subject: `[নতুন নিবন্ধন] বিমূর্ত রাত্রি - ${reg.name} (বিকাশ: ${reg.bkash})`,
      html: getAdminEmailHtml(reg, originUrl),
    });

    await Promise.allSettled([registrantMailPromise, adminMailPromise]);
    return { success: true };
  } catch (err) {
    console.error("❌ Error sending registration emails:", err);
    return { success: false, error: (err as Error).message };
  }
}
