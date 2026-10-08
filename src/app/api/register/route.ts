import { NextRequest, NextResponse } from "next/server";
import { addRegistrationAsync, getXlsxFilePath } from "@/lib/storage";
import { sendRegistrationEmails } from "@/lib/email";
import { RegisterFormInput } from "@/lib/types";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json().catch(() => ({}))) as RegisterFormInput;

    // Online registration is now closed
    return NextResponse.json(
      {
        success: false,
        error:
          "অনলাইন রেজিস্ট্রেশন এখন বন্ধ রয়েছে। তবে আপনারা সরাসরি অনুষ্ঠানস্থলে এসে শো শুরুর পূর্বে টিকিট ক্রয় করতে পারবেন।",
      },
      { status: 403 }
    );

    const { name, whatsapp, email, bkash } = body;

    if (!name || !name.trim()) {
      return NextResponse.json(
        { success: false, error: "অনুগ্রহ করে আপনার নাম লিখুন।" },
        { status: 400 }
      );
    }

    const cleanWhatsapp = (whatsapp || "").trim().replace(/\s+/g, "");
    const phoneRegex = /^0\d{10}$/;

    if (!cleanWhatsapp) {
      return NextResponse.json(
        { success: false, error: "অনুগ্রহ করে হোয়াটসঅ্যাপ নম্বর লিখুন।" },
        { status: 400 }
      );
    }

    if (!phoneRegex.test(cleanWhatsapp)) {
      return NextResponse.json(
        {
          success: false,
          error: "হোয়াটসঅ্যাপ নম্বরটি অবশ্যই 0 দিয়ে শুরু এবং ঠিক ১১ ডিজিট সংখ্যার হতে হবে (যেমন: 017XXXXXXXX)।",
        },
        { status: 400 }
      );
    }

    if (!email || !email.trim() || !email.includes("@") || !email.includes(".")) {
      return NextResponse.json(
        {
          success: false,
          error: "ডিজিটাল টিকিট পেতে অনুগ্রহ করে একটি সঠিক ইমেইল প্রদান করুন।",
        },
        { status: 400 }
      );
    }

    const cleanBkash = (bkash || "").trim().replace(/\s+/g, "");
    if (!cleanBkash) {
      return NextResponse.json(
        {
          success: false,
          error: "অনুগ্রহ করে টাকা পাঠানোর বিকাশ নম্বরটি লিখুন।",
        },
        { status: 400 }
      );
    }

    if (!phoneRegex.test(cleanBkash)) {
      return NextResponse.json(
        {
          success: false,
          error: "বিকাশ নম্বরটি অবশ্যই 0 দিয়ে শুরু এবং ঠিক ১১ ডিজিট সংখ্যার হতে হবে (যেমন: 01XXXXXXXXX)।",
        },
        { status: 400 }
      );
    }

    const ticketCount = Number(body.ticketCount) > 0 ? Math.floor(Number(body.ticketCount)) : 1;
    const totalAmount = ticketCount * 500;

    // Add registration and update XLSX
    const newRegistration = await addRegistrationAsync({
      name: name.trim(),
      whatsapp: cleanWhatsapp,
      email: email.trim().toLowerCase(),
      bkash: cleanBkash,
      bkashSameAsWhatsapp: !!body.bkashSameAsWhatsapp,
      ticketCount,
      totalAmount,
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
