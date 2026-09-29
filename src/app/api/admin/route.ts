import { NextRequest, NextResponse } from "next/server";
import {
  getRegistrationsAsync,
  updateRegistrationStatusAsync,
  getXlsxFilePath,
} from "@/lib/storage";
import { TicketStatus } from "@/lib/types";

export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get("x-admin-passcode");
    const configuredPasscode = process.env.ADMIN_PASSCODE || "admin123";

    // If passcode is configured and doesn't match
    if (authHeader && authHeader !== configuredPasscode) {
      return NextResponse.json(
        { success: false, error: "অননুমোদিত অ্যাক্সেস (ভুল পাসকোড)" },
        { status: 401 }
      );
    }

    const registrations = await getRegistrationsAsync();
    const total = registrations.length;
    const pending = registrations.filter(
      (r) => r.status === "Ticket Not Sent"
    ).length;
    const sent = registrations.filter((r) => r.status === "Ticket Sent").length;
    const xlsxPath = getXlsxFilePath();

    return NextResponse.json({
      success: true,
      data: {
        registrations,
        stats: {
          total,
          pending,
          sent,
        },
        xlsxPath,
        downloadUrl: "/api/export-xlsx",
      },
    });
  } catch (error) {
    console.error("Admin fetch error:", error);
    return NextResponse.json(
      { success: false, error: "ডাটা লোড করতে ব্যর্থ হয়েছে।" },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, status, ticketCode, notes } = body;

    if (!id || !status) {
      return NextResponse.json(
        { success: false, error: "ID এবং Status আবশ্যক।" },
        { status: 400 }
      );
    }

    if (status !== "Ticket Sent" && status !== "Ticket Not Sent") {
      return NextResponse.json(
        { success: false, error: "অবৈধ স্ট্যাটাস মান।" },
        { status: 400 }
      );
    }

    const updated = await updateRegistrationStatusAsync(
      id,
      status as TicketStatus,
      ticketCode,
      notes
    );

    if (!updated) {
      return NextResponse.json(
        { success: false, error: "রেজিস্ট্রেশন পাওয়া যায়নি।" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "স্ট্যাটাস সফলভাবে আপডেট করা হয়েছে।",
      data: updated,
    });
  } catch (error) {
    console.error("Admin update error:", error);
    return NextResponse.json(
      { success: false, error: "আপডেট সম্পন্ন করা যায়নি।" },
      { status: 500 }
    );
  }
}
