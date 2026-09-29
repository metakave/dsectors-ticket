import { NextRequest, NextResponse } from "next/server";
import {
  createTransporter,
  getRegistrantEmailHtml,
  getRegistrantEmailText,
  getAdminEmailHtml,
  getAdminEmailText,
} from "@/lib/email";
import { Registration } from "@/lib/types";

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get("x-admin-passcode");
    const configuredPasscode = process.env.ADMIN_PASSCODE || "admin123";

    if (authHeader && authHeader !== configuredPasscode) {
      return NextResponse.json(
        { success: false, error: "অননুমোদিত অ্যাক্সেস (ভুল পাসকোড)" },
        { status: 401 }
      );
    }

    const body = await req.json().catch(() => ({}));
    const targetEmail = body.targetEmail || process.env.SMTP_USER || "sadiq.alam@gmail.com";
    const templateType = body.templateType || "both"; // "registrant", "admin", "both", or "verify_only"

    const transporter = createTransporter();

    if (!transporter) {
      return NextResponse.json({
        success: false,
        error: "SMTP Credentials are missing or incomplete in environment variables.",
        config: {
          host: process.env.SMTP_HOST || "Not Set",
          port: process.env.SMTP_PORT || "Not Set",
          user: process.env.SMTP_USER || "Not Set",
          hasPass: !!process.env.SMTP_PASS,
        },
      });
    }

    // 1. Verify SMTP Connection
    const verifyPromise = new Promise<{ verified: boolean; error?: string }>(
      (resolve) => {
        transporter.verify((err) => {
          if (err) {
            resolve({ verified: false, error: err.message });
          } else {
            resolve({ verified: true });
          }
        });
      }
    );

    const verifyResult = await verifyPromise;
    if (!verifyResult.verified) {
      return NextResponse.json({
        success: false,
        error: `SMTP Verification Failed: ${verifyResult.error}`,
        config: {
          host: process.env.SMTP_HOST,
          port: process.env.SMTP_PORT,
          user: process.env.SMTP_USER,
        },
      });
    }

    if (templateType === "verify_only") {
      return NextResponse.json({
        success: true,
        message: "SMTP connection verified successfully!",
        config: {
          host: process.env.SMTP_HOST,
          port: process.env.SMTP_PORT,
          user: process.env.SMTP_USER,
        },
      });
    }

    // Mock registration for testing
    const sampleReg: Registration = {
      id: "TEST-2026-0001",
      name: "টেস্ট ব্যবহারকারী (Test User)",
      whatsapp: "01700000000",
      email: targetEmail,
      bkash: "01700000000",
      bkashSameAsWhatsapp: true,
      registeredAt: new Date().toISOString(),
      formattedDate: new Date().toLocaleString("en-US", {
        timeZone: "Asia/Dhaka",
        dateStyle: "medium",
        timeStyle: "short",
      }) + " (BST)",
      status: "Ticket Not Sent",
      ticketCode: "",
      notes: "System Verification Test",
    };

    const senderName = "শব্দ ও সুরে বিমূর্ত রাত্রি";
    const senderEmail = process.env.SMTP_USER || "contact@dsectors.org";
    const from = {
      name: senderName,
      address: senderEmail,
    };
    const replyTo = process.env.REPLY_TO || process.env.ADMIN_EMAIL || senderEmail;
    const originUrl =
      req.headers.get("origin") ||
      (req.headers.get("x-forwarded-host")
        ? `https://${req.headers.get("x-forwarded-host")}`
        : "https://ticket.dsectors.org");

    const dispatchResults: Array<{
      template: string;
      to: string;
      messageId?: string;
      response?: string;
      error?: string;
    }> = [];

    // Send Registrant Test
    if (templateType === "registrant" || templateType === "both") {
      try {
        const res = await transporter.sendMail({
          from,
          replyTo,
          to: targetEmail,
          subject: `বিমূর্ত রাত্রি - টিকিট নিবন্ধনের প্রাপ্তি স্বীকার (টেস্ট আইডি: ${sampleReg.id})`,
          text: getRegistrantEmailText(sampleReg),
          html: getRegistrantEmailHtml(sampleReg),
        });
        dispatchResults.push({
          template: "Registrant Confirmation",
          to: targetEmail,
          messageId: res.messageId,
          response: res.response,
        });
      } catch (err: unknown) {
        dispatchResults.push({
          template: "Registrant Confirmation",
          to: targetEmail,
          error: (err as Error).message,
        });
      }
    }

    // Send Admin Notification Test
    if (templateType === "admin" || templateType === "both") {
      try {
        const res = await transporter.sendMail({
          from,
          replyTo,
          to: targetEmail,
          subject: `[টেস্ট নোটিফিকেশন] বিমূর্ত রাত্রি - ${sampleReg.name}`,
          text: getAdminEmailText(sampleReg, originUrl),
          html: getAdminEmailHtml(sampleReg, originUrl),
        });
        dispatchResults.push({
          template: "Admin Notification",
          to: targetEmail,
          messageId: res.messageId,
          response: res.response,
        });
      } catch (err: unknown) {
        dispatchResults.push({
          template: "Admin Notification",
          to: targetEmail,
          error: (err as Error).message,
        });
      }
    }

    const allSuccessful = dispatchResults.every((r) => !r.error);

    return NextResponse.json({
      success: allSuccessful,
      message: allSuccessful
        ? `টেস্ট ইমেইল সফলভাবে পাঠানো হয়েছে (${targetEmail})`
        : "কিছু টেস্ট ইমেইল পাঠাতে ব্যর্থ হয়েছে।",
      dispatchResults,
      config: {
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT,
        user: process.env.SMTP_USER,
        adminEmail: process.env.ADMIN_EMAIL,
        bcc: process.env.BCC_EMAIL,
      },
    });
  } catch (error: unknown) {
    console.error("Test email route error:", error);
    return NextResponse.json(
      { success: false, error: (error as Error).message || "Unknown error" },
      { status: 500 }
    );
  }
}
