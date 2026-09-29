import { NextRequest, NextResponse } from "next/server";
import { addRegistration, getXlsxFilePath } from "@/lib/storage";
import { sendRegistrationEmails } from "@/lib/email";
import { RegisterFormInput } from "@/lib/types";

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as RegisterFormInput;

    const { name, whatsapp, email, bkash } = body;

    if (!name || !name.trim()) {
      return NextResponse.json(
        { success: false, error: "অনুগ্রহ করে আপনার নাম লিখুন।" },
        { status: 400 }
      );
    }

    if (!whatsapp || !whatsapp.trim()) {
      return NextResponse.json(
        { success: false, error: "অনুগ্রহ করে হোয়াটসঅ্যাপ নম্বর লিখুন।" },
        { status: 400 }
      );
    }

    if (!email || !email.trim() || !email.includes("@")) {
      return NextResponse.json(
        {
          success: false,
          error: "ডিজিটাল টিকিট পেতে অনুগ্রহ করে একটি সঠিক ইমেইল প্রদান করুন।",
        },
        { status: 400 }
      );
    }

    if (!bkash || !bkash.trim()) {
      return NextResponse.json(
        {
          success: false,
          error: "অনুগ্রহ করে টাকা পাঠানোর বিকাশ নম্বরটি লিখুন।",
        },
        { status: 400 }
      );
    }

    // Add registration and update XLSX
    const newRegistration = addRegistration({
      name: name.trim(),
      whatsapp: whatsapp.trim(),
      email: email.trim().toLowerCase(),
      bkash: bkash.trim(),
      bkashSameAsWhatsapp: !!body.bkashSameAsWhatsapp,
    });

    // Detect request origin
    const origin =
      req.headers.get("origin") ||
      (req.headers.get("x-forwarded-host")
        ? `https://${req.headers.get("x-forwarded-host")}`
        : process.env.NEXT_PUBLIC_SITE_URL || "https://ticket.dsectors.org");

    // Await email dispatch so serverless runtime doesn't freeze/terminate before SMTP completes
    try {
      await sendRegistrationEmails(newRegistration, origin);
    } catch (err) {
      console.error("❌ Background email task error:", err);
    }

    const xlsxPath = getXlsxFilePath();

    return NextResponse.json({
      success: true,
      message: "আপনার টিকিট নিবন্ধন সফলভাবে জমা হয়েছে!",
      data: {
        registration: newRegistration,
        xlsxPath,
        downloadUrl: "/api/export-xlsx",
      },
    });
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "দুঃখিত, নিবন্ধন প্রক্রিয়া সম্পন্ন করতে একটি সমস্যা হয়েছে। আবার চেষ্টা করুন।",
      },
      { status: 500 }
    );
  }
}
