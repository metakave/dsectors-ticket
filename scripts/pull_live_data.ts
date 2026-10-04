import fs from "fs";
import path from "path";
import { generateXlsxBuffer } from "../src/lib/storage";

const BLOB_BASE_URL =
  process.env.BLOB_BASE_URL ||
  "https://vwlmrgvofxuhcqoe.public.blob.vercel-storage.com";

async function pullLiveData() {
  console.log("🌐 Connecting to live Vercel Blob storage...");
  const jsonUrl = `${BLOB_BASE_URL}/registrations.json?t=${Date.now()}`;
  
  const res = await fetch(jsonUrl, {
    cache: "no-store",
    headers: { "Cache-Control": "no-cache" },
  });

  if (!res.ok) {
    throw new Error(`Failed to fetch registrations.json: HTTP ${res.status} ${res.statusText}`);
  }

  const liveRegistrations = await res.json();
  if (!Array.isArray(liveRegistrations)) {
    throw new Error("Invalid response format: expected an array of registrations.");
  }

  console.log(`✅ Successfully fetched ${liveRegistrations.length} registrations from live.`);

  // Attempt to fetch live xlsx directly
  let xlsxBuffer: Buffer;
  try {
    const xlsxUrl = `${BLOB_BASE_URL}/registrations.xlsx?t=${Date.now()}`;
    const xlsxRes = await fetch(xlsxUrl, {
      cache: "no-store",
      headers: { "Cache-Control": "no-cache" },
    });

    if (xlsxRes.ok) {
      xlsxBuffer = Buffer.from(await xlsxRes.arrayBuffer());
      console.log(`✅ Downloaded live registrations.xlsx (${xlsxBuffer.length} bytes).`);
    } else {
      console.log("⚠️ Live XLSX not reachable directly, generating locally from fetched data...");
      xlsxBuffer = generateXlsxBuffer(liveRegistrations);
    }
  } catch (err) {
    console.log("⚠️ Failed to fetch remote XLSX, generating from JSON data locally...");
    xlsxBuffer = generateXlsxBuffer(liveRegistrations);
  }

  const dataDir = path.join(process.cwd(), "data");
  const publicDir = path.join(process.cwd(), "public", "downloads");

  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
  }

  const localJsonPath = path.join(dataDir, "registrations.json");
  const localXlsxPath = path.join(dataDir, "registrations.xlsx");
  const publicXlsxPath = path.join(publicDir, "registrations.xlsx");

  fs.writeFileSync(localJsonPath, JSON.stringify(liveRegistrations, null, 2), "utf-8");
  fs.writeFileSync(localXlsxPath, xlsxBuffer);
  fs.writeFileSync(publicXlsxPath, xlsxBuffer);

  console.log("\n📁 Local files updated successfully:");
  console.log(`  - ${localJsonPath}`);
  console.log(`  - ${localXlsxPath}`);
  console.log(`  - ${publicXlsxPath}`);
  console.log(`\n🎉 Total registrations synced: ${liveRegistrations.length}`);
}

pullLiveData().catch((err) => {
  console.error("❌ Error pulling live data:", err);
  process.exit(1);
});
