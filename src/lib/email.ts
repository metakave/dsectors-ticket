import nodemailer from "nodemailer";
import { Registration } from "./types";

// Configure SMTP transport
function createTransporter() {
  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT) || 465;
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

// 1. Registrant Confirmation Email Template (High Contrast & Maximum Email Client Compatibility)
export function getRegistrantEmailHtml(reg: Registration): string {
  return `
<!DOCTYPE html>
<html lang="bn">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>বিমূর্ত রাত্রি - টিকিট নিবন্ধন নিশ্চিতকরণ</title>
</head>
<body style="margin: 0; padding: 0; background-color: #040d1a; font-family: Arial, 'Segoe UI', Tahoma, sans-serif; color: #ffffff; -webkit-font-smoothing: antialiased;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #040d1a; padding: 25px 10px;">
    <tr>
      <td align="center">
        <!-- Main Email Container -->
        <table role="presentation" width="100%" style="max-width: 620px; background-color: #091b33; border: 2px solid #d4af37; border-radius: 12px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.6);" cellspacing="0" cellpadding="0">
          
          <!-- Header Banner -->
          <tr>
            <td style="background-color: #061326; padding: 32px 20px; text-align: center; border-bottom: 2px solid #d4af37;">
              <span style="display: inline-block; background-color: #261f06; border: 1px solid #d4af37; color: #fef08a; padding: 5px 16px; border-radius: 20px; font-size: 13px; font-weight: bold; letter-spacing: 0.5px; margin-bottom: 12px;">
                ✓ টিকিট নিবন্ধন প্রাপ্তি স্বীকার
              </span>
              <h1 style="color: #fef08a; font-size: 28px; font-weight: bold; margin: 0 0 6px 0; letter-spacing: 0.5px;">
                শব্দ ও সুরে বিমূর্ত রাত্রি
              </h1>
              <p style="color: #ffffff; font-size: 16px; font-weight: 500; margin: 0;">
                গান ও কবিতায় এক মুগ্ধকর সন্ধ্যা
              </p>
            </td>
          </tr>

          <!-- Main Body Content -->
          <tr>
            <td style="padding: 28px 24px; background-color: #091b33; color: #ffffff;">
              <div style="font-size: 19px; font-weight: bold; color: #ffffff; margin-bottom: 14px;">
                নমস্কার / প্রিয় <span style="color: #fef08a;">${reg.name}</span>,
              </div>

              <p style="line-height: 1.7; color: #f1f5f9; font-size: 15.5px; margin: 0 0 18px 0;">
                <strong>"শব্দ ও সুরে বিমূর্ত রাত্রি"</strong> অনুষ্ঠানে আপনার টিকিট নিবন্ধন সফলভাবে গ্রহণ করা হয়েছে। 
              </p>

              <!-- Verification Alert Box (High Contrast Gold/Amber) -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #1e1b07; border-left: 5px solid #e5c07b; border-radius: 6px; margin: 18px 0;">
                <tr>
                  <td style="padding: 16px 18px;">
                    <p style="margin: 0; color: #ffffff; font-size: 15px; line-height: 1.6;">
                      ⏳ <strong style="color: #fef08a; font-size: 16px;">পেমেন্ট যাচাই প্রক্রিয়াধীন:</strong><br/>
                      আপনার প্রেরিত বিকাশ নম্বর (<strong style="color: #fde047; font-size: 16px;">${reg.bkash}</strong>) হতে ফি প্রাপ্তি ম্যানুয়ালি যাচাই করার পর অতি শীঘ্রই আপনার এই ইমেইলে <strong>ডিজিটাল টিকিট</strong> প্রেরণ করা হবে।
                    </p>
                  </td>
                </tr>
              </table>

              <!-- Registration Summary Table (Crisp High Contrast) -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #05101f; border: 1px solid #d4af37; border-radius: 8px; margin: 22px 0;">
                <tr>
                  <td style="padding: 14px 18px; border-bottom: 1px solid #1e3a5f; background-color: #030a14;">
                    <strong style="color: #fef08a; font-size: 15px; letter-spacing: 0.5px; text-transform: uppercase;">
                      📋 নিবন্ধন বিবরণী (Registration Summary)
                    </strong>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 14px 18px;">
                    <table width="100%" cellspacing="0" cellpadding="0" style="font-size: 15px; color: #ffffff;">
                      <tr>
                        <td style="padding: 9px 0; color: #cbd5e1; border-bottom: 1px solid #142842; width: 45%;">রেজিস্ট্রেশন আইডি:</td>
                        <td style="padding: 9px 0; color: #fef08a; font-weight: bold; text-align: right; font-family: monospace; font-size: 16px; border-bottom: 1px solid #142842;">${reg.id}</td>
                      </tr>
                      <tr>
                        <td style="padding: 9px 0; color: #cbd5e1; border-bottom: 1px solid #142842;">আবেদনকারীর নাম:</td>
                        <td style="padding: 9px 0; color: #ffffff; font-weight: bold; text-align: right; border-bottom: 1px solid #142842;">${reg.name}</td>
                      </tr>
                      <tr>
                        <td style="padding: 9px 0; color: #cbd5e1; border-bottom: 1px solid #142842;">হোয়াটসঅ্যাপ নম্বর:</td>
                        <td style="padding: 9px 0; color: #ffffff; font-weight: bold; text-align: right; border-bottom: 1px solid #142842;">${reg.whatsapp}</td>
                      </tr>
                      <tr>
                        <td style="padding: 9px 0; color: #cbd5e1; border-bottom: 1px solid #142842;">ইমেইল ঠিকানা:</td>
                        <td style="padding: 9px 0; color: #ffffff; font-weight: bold; text-align: right; border-bottom: 1px solid #142842;">${reg.email}</td>
                      </tr>
                      <tr>
                        <td style="padding: 9px 0; color: #cbd5e1; border-bottom: 1px solid #142842;">প্রেরক বিকাশ নম্বর:</td>
                        <td style="padding: 9px 0; color: #fef08a; font-weight: bold; text-align: right; font-size: 16px; border-bottom: 1px solid #142842;">${reg.bkash}</td>
                      </tr>
                      <tr>
                        <td style="padding: 9px 0; color: #cbd5e1; border-bottom: 1px solid #142842;">টিকিট ফি (Amount):</td>
                        <td style="padding: 9px 0; color: #fef08a; font-weight: bold; text-align: right; font-size: 16px; border-bottom: 1px solid #142842;">৳ ৫০০</td>
                      </tr>
                      <tr>
                        <td style="padding: 9px 0; color: #cbd5e1;">বর্তমান স্ট্যাটাস:</td>
                        <td style="padding: 9px 0; color: #fbbf24; font-weight: bold; text-align: right;">পেমেন্ট ভেরিফিকেশন সাপেক্ষে (Pending)</td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- Event Info Card (Solid High Contrast) -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #07172c; border: 1px solid #38bdf8; border-radius: 8px; margin: 20px 0;">
                <tr>
                  <td style="padding: 16px 18px;">
                    <div style="font-weight: bold; color: #38bdf8; margin-bottom: 10px; font-size: 15.5px;">
                      📍 অনুষ্ঠান সূচি ও ভেন্যু:
                    </div>
                    <div style="font-size: 15px; color: #ffffff; margin: 6px 0;">
                      📅 <strong>তারিখ:</strong> ৯ অক্টোবর ২০২৬ (শুক্রবার)
                    </div>
                    <div style="font-size: 15px; color: #ffffff; margin: 6px 0;">
                      ⏰ <strong>সময়:</strong> সন্ধ্যা ৬:৩০ টা - ৮:৩০ টা
                    </div>
                    <div style="font-size: 15px; color: #ffffff; margin: 6px 0;">
                      🏢 <strong>স্থান:</strong> আহারী বাহার মিলনায়তন, ধানমন্ডি ২৭, ঢাকা
                    </div>
                  </td>
                </tr>
              </table>

              <p style="font-size: 14.5px; color: #e2e8f0; line-height: 1.6; margin: 18px 0 0 0;">
                যেকোনো তথ্যের জন্য আমাদের সাপোর্ট নাম্বারে সরাসরি কল বা হোয়াটসঅ্যাপ করতে পারেন।
              </p>

              <div style="color: #ffffff; font-size: 15px; margin-top: 26px; border-top: 1px solid #1e3a5f; padding-top: 16px;">
                আন্তরিক ধন্যবাদসহ,<br/>
                <strong style="color: #fef08a; font-size: 16px;">শব্দ ও সুরে বিমূর্ত রাত্রি আয়োজক কমিটি</strong>
              </div>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #030810; padding: 20px; text-align: center; font-size: 13px; color: #94a3b8; border-top: 1px solid #142842;">
              <p style="margin: 0 0 4px 0; color: #cbd5e1;">© ২০২৬ শব্দ ও সুরে বিমূর্ত রাত্রি। সর্বস্বত্ব সংরক্ষিত।</p>
              <p style="margin: 0; font-size: 12px; color: #94a3b8;">এটি একটি স্বয়ংক্রিয়ভাবে প্রেরিত নিশ্চিতকরণ বার্তা।</p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;
}

// 2. Admin Notification Email Template (High Contrast & Clear Details)
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
</head>
<body style="margin: 0; padding: 0; background-color: #060e1a; font-family: Arial, sans-serif; color: #ffffff;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #060e1a; padding: 25px 10px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" style="max-width: 620px; background-color: #0d1e35; border: 2px solid #d4af37; border-radius: 10px; overflow: hidden;" cellspacing="0" cellpadding="0">
          
          <!-- Header -->
          <tr>
            <td style="background-color: #061120; padding: 26px 20px; border-bottom: 2px solid #d4af37; text-align: center;">
              <h2 style="color: #fef08a; margin: 0 0 6px 0; font-size: 24px;">🚨 নতুন টিকিট নিবন্ধন জমা পড়েছে</h2>
              <p style="color: #e2e8f0; margin: 0; font-size: 14px;">শব্দ ও সুরে বিমূর্ত রাত্রি - ইভেন্ট ম্যানেজমেন্ট</p>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding: 24px 20px;">
              <!-- Alert Box -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #241d06; border: 1px solid #d4af37; border-radius: 6px; margin-bottom: 20px;">
                <tr>
                  <td style="padding: 14px 16px; color: #ffffff; font-size: 15px; line-height: 1.6;">
                    <strong style="color: #fef08a;">অ্যাকশন দরকার:</strong> নিম্নে উল্লিখিত বিকাশ নম্বর (<strong style="color: #fde047; font-size: 17px;">${reg.bkash}</strong>) থেকে টাকা প্রাপ্তি যাচাই করে টিকিট প্রেরণ নিশ্চিত করুন।
                  </td>
                </tr>
              </table>

              <!-- Details Table -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #061120; border: 1px solid #1e3a5f; border-radius: 8px; font-size: 15px; color: #ffffff; margin-bottom: 24px;">
                <tr>
                  <td style="padding: 11px 14px; color: #cbd5e1; border-bottom: 1px solid #142842; width: 40%; background-color: #040a14;">রেজিস্ট্রেশন আইডি (ID)</td>
                  <td style="padding: 11px 14px; color: #fef08a; font-weight: bold; border-bottom: 1px solid #142842; font-family: monospace; font-size: 16px;">${reg.id}</td>
                </tr>
                <tr>
                  <td style="padding: 11px 14px; color: #cbd5e1; border-bottom: 1px solid #142842; background-color: #040a14;">তারিখ ও সময় (Date)</td>
                  <td style="padding: 11px 14px; color: #ffffff; font-weight: bold; border-bottom: 1px solid #142842;">${reg.formattedDate}</td>
                </tr>
                <tr>
                  <td style="padding: 11px 14px; color: #cbd5e1; border-bottom: 1px solid #142842; background-color: #040a14;">আবেদনকারীর নাম (Name)</td>
                  <td style="padding: 11px 14px; color: #ffffff; font-weight: bold; border-bottom: 1px solid #142842;">${reg.name}</td>
                </tr>
                <tr>
                  <td style="padding: 11px 14px; color: #cbd5e1; border-bottom: 1px solid #142842; background-color: #040a14;">হোয়াটসঅ্যাপ নম্বর (WhatsApp)</td>
                  <td style="padding: 11px 14px; font-weight: bold; border-bottom: 1px solid #142842;">
                    <a href="https://wa.me/${reg.whatsapp.replace(/[^0-9]/g, "")}" style="color: #38bdf8; text-decoration: none; font-size: 15.5px;">${reg.whatsapp} 💬</a>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 11px 14px; color: #cbd5e1; border-bottom: 1px solid #142842; background-color: #040a14;">ইমেইল (Email)</td>
                  <td style="padding: 11px 14px; font-weight: bold; border-bottom: 1px solid #142842;">
                    <a href="mailto:${reg.email}" style="color: #38bdf8; text-decoration: none;">${reg.email}</a>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 11px 14px; color: #cbd5e1; border-bottom: 1px solid #142842; background-color: #040a14;">বিকাশ নম্বর (bKash)</td>
                  <td style="padding: 11px 14px; color: #fde047; font-weight: bold; font-size: 17px; background-color: #211c06; border-bottom: 1px solid #142842;">${reg.bkash}</td>
                </tr>
                <tr>
                  <td style="padding: 11px 14px; color: #cbd5e1; background-color: #040a14;">স্ট্যাটাস (Status)</td>
                  <td style="padding: 11px 14px; color: #f87171; font-weight: bold;">${reg.status}</td>
                </tr>
              </table>

              <!-- Action Buttons -->
              <div style="text-align: center; margin: 20px 0 10px 0;">
                <a href="${adminUrl}" style="display: inline-block; padding: 12px 24px; margin: 6px; border-radius: 6px; text-decoration: none; font-weight: bold; font-size: 14.5px; background-color: #d4af37; color: #071526;">
                  অ্যাডমিন ড্যাশবোর্ডে দেখুন
                </a>
                <a href="${downloadUrl}" style="display: inline-block; padding: 12px 24px; margin: 6px; border-radius: 6px; text-decoration: none; font-weight: bold; font-size: 14.5px; background-color: #1e3a5f; color: #fef08a; border: 1px solid #d4af37;">
                  ডাউনলোড Excel (.xlsx)
                </a>
              </div>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #040a14; padding: 16px; text-align: center; font-size: 12.5px; color: #94a3b8; border-top: 1px solid #142842;">
              Bimurto Ratri Ticketing System • Automated Admin Notification
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
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
      console.log(
        `[Email Simulation] Target Registrant: ${reg.email}, Admin: ${process.env.ADMIN_EMAIL || "admin@example.com"}`
      );
      return { success: true };
    }

    const fromAddress =
      process.env.SMTP_FROM || `"শব্দ ও সুরে বিমূর্ত রাত্রি" <${process.env.SMTP_USER || "contact@dsectors.org"}>`;
    const adminEmail = process.env.ADMIN_EMAIL || "contact@dsectors.org";

    // Multiple BCC recipients
    const defaultBcc = ["sadiq.alam@gmail.com", "sabinakakoli@gmail.com"];
    const bccEmails = process.env.BCC_EMAIL
      ? process.env.BCC_EMAIL.split(",").map((e) => e.trim()).filter(Boolean)
      : defaultBcc;

    // 1. Send Registrant Confirmation Email (to the registered person)
    const registrantMailPromise = transporter.sendMail({
      from: fromAddress,
      to: reg.email,
      bcc: bccEmails,
      subject: `বিমূর্ত রাত্রি - টিকিট নিবন্ধনের প্রাপ্তি স্বীকার (আইডি: ${reg.id})`,
      html: getRegistrantEmailHtml(reg),
    });

    // 2. Send Separate Admin Notification Email (to contact@dsectors.org)
    const adminMailPromise = transporter.sendMail({
      from: fromAddress,
      to: adminEmail,
      bcc: bccEmails,
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
