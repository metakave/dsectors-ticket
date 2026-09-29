import { NextResponse } from "next/server";
import { generateXlsxBuffer, getRegistrationsAsync } from "@/lib/storage";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  try {
    const items = await getRegistrationsAsync();
    const buffer = generateXlsxBuffer(items);

    const today = new Date().toISOString().split("T")[0];
    const filename = `Bimurto_Ratri_Registrations_${today}.xlsx`;

    // Convert Buffer to Uint8Array for standard web Response BodyInit compatibility
    const uint8Array = new Uint8Array(buffer);

    return new Response(uint8Array, {
      status: 200,
      headers: {
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Cache-Control": "no-store, max-age=0",
      },
    });
  } catch (error) {
    console.error("Error exporting XLSX:", error);
    return NextResponse.json(
      { success: false, error: "Excel ফাইল প্রস্তুত করতে ব্যর্থ হয়েছে।" },
      { status: 500 }
    );
  }
}
