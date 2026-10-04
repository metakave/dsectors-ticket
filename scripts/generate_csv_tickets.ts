import fs from "fs";
import path from "path";
import QRCode from "qrcode";
import { execSync } from "child_process";

interface CsvRow {
  sl: string;
  regId: string;
  dateTime: string;
  name: string;
  ticketCount: number;
  totalAmount: string;
  phone: string;
  email: string;
}

interface TicketTarget {
  id: string;
  name: string;
  ticketCount: number;
  email: string;
  phone: string;
  source: "database" | "offline_csv";
  matchType: string;
}

const csvRaw = `SL,Registration ID,Date & Time,Name (নাম),Ticket Number,Total Amount (মোট টাকা),WhatsApp Number (হোয়াটসঅ্যাপ),Email (ইমেইল),Ticket Code,Notes
1,BR-2026-0019,"Oct 04, 2026, 10:35 AM (BST)",ইলোরা,1,500,01730599329,sselora.harmony19@gmail.com,-,
2,BR-2026-0018,"Oct 03, 2026, 08:34 PM (BST)",Kanika Chakraborty,4,2000,01713379897,borty.kanika@yahoo.com,-,
3,BR-2026-0017,"Oct 03, 2026, 07:54 PM (BST)",Sayema Mukarrama,1,500,01973091880,sayema14bd@gmail.com,-,
,,,Ferdoushi Begum,1,,1717144778,ferdoushi@yahoo.com,,
,,,,1,,1715665359,moradana14@gmail.com,,
5,BR-2026-0015,"Oct 03, 2026, 07:13 PM (BST)",কাজী নজরুল ইসলাম,1,500,01845972555,sarothy@gmail.com,-,
7,BR-2026-0013,"Oct 03, 2026, 12:06 PM (BST)",Ferdowsi Rita,2,1000,01732770345,ferdowsi.rita@gmail.com,-,
8,BR-2026-0012,"Oct 02, 2026, 11:09 PM (BST)",মো: হাবিবুর রহমান শিনু,1,500,01712286494,sassybd1978@gmail.com,-,
13,BR-2026-0007,"Oct 01, 2026, 11:38 PM (BST)",Nahida Parvin,1,500,1712011454,sayemachowdhury.anta@gmail.com,-,
,,,Mahenaw Wara,1,500,01030300120 ,manana.manamaya@gmail.com,,`;

function parseCsvLine(line: string): string[] {
  const cols: string[] = [];
  let cur = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === "\"") {
      inQuotes = !inQuotes;
    } else if (ch === "," && !inQuotes) {
      cols.push(cur.trim());
      cur = "";
    } else {
      cur += ch;
    }
  }
  cols.push(cur.trim());
  return cols;
}

function parseCsv(text: string): CsvRow[] {
  const lines = text.trim().split("\n").slice(1);
  const rows: CsvRow[] = [];

  for (const line of lines) {
    if (!line.trim() || line.replace(/,/g, "").trim() === "") continue;

    const cols = parseCsvLine(line);
    const sl = cols[0] || "";
    const regId = cols[1] || "";
    const dateTime = cols[2] || "";
    const name = cols[3] || "";
    const ticketCount = parseInt(cols[4] || "1", 10) || 1;
    const totalAmount = cols[5] || "";
    const phone = cols[6] || "";
    const email = cols[7] || "";

    rows.push({ sl, regId, dateTime, name, ticketCount, totalAmount, phone, email });
  }

  return rows;
}

async function renderTicketPng(ticket: { id: string; name: string; ticketCount: number }, outputPath: string) {
  const qrData = `TicketID: ${ticket.id}\nName: ${ticket.name}\nTickets: ${ticket.ticketCount}`;
  const qrImageBase64 = await QRCode.toDataURL(qrData, {
    color: { dark: "#000000", light: "#ffffff" },
    width: 200,
    margin: 2,
  });

  const htmlContent = `
<!DOCTYPE html>
<html lang="bn">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Event Ticket</title>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap" rel="stylesheet">
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Tiro+Bangla:ital@0;1&display=swap');
    
    body {
      margin: 0;
      padding: 0;
      font-family: 'Inter', 'Tiro Bangla', sans-serif;
      background-color: #071526;
      color: #f8fafc;
      width: 400px;
      height: 700px;
      display: flex;
      justify-content: center;
      align-items: center;
      -webkit-print-color-adjust: exact;
    }

    .ticket-container {
      width: 360px;
      height: 660px;
      background: linear-gradient(to bottom, rgba(212, 175, 55, 0.1), rgba(7, 21, 38, 1));
      border: 1px solid rgba(212, 175, 55, 0.4);
      border-radius: 20px;
      padding: 24px;
      box-sizing: border-box;
      position: relative;
      box-shadow: 0 10px 30px rgba(0,0,0,0.5);
      overflow: hidden;
      display: flex;
      flex-direction: column;
      align-items: center;
    }

    .glow {
      position: absolute;
      top: -50px;
      left: 50%;
      transform: translateX(-50%);
      width: 200px;
      height: 200px;
      background: rgba(212, 175, 55, 0.2);
      border-radius: 50%;
      filter: blur(50px);
      z-index: 0;
    }

    .content {
      z-index: 1;
      width: 100%;
      text-align: center;
      display: flex;
      flex-direction: column;
      align-items: center;
      flex-grow: 1;
    }

    h1 {
      color: #e5c07b;
      font-size: 22px;
      margin-bottom: 5px;
      font-weight: 700;
      margin-top: 10px;
    }

    .subtitle {
      color: #94a3b8;
      font-size: 14px;
      margin-bottom: 25px;
    }

    .qr-container {
      background: white;
      padding: 10px;
      border-radius: 12px;
      margin-bottom: 25px;
      box-shadow: 0 4px 15px rgba(212, 175, 55, 0.2);
    }

    .qr-container img {
      width: 160px;
      height: 160px;
      display: block;
    }

    .details-box {
      width: 100%;
      background: rgba(255, 255, 255, 0.03);
      border: 1px solid rgba(212, 175, 55, 0.2);
      border-radius: 12px;
      padding: 16px;
      box-sizing: border-box;
      text-align: left;
    }

    .detail-row {
      display: flex;
      justify-content: space-between;
      margin-bottom: 12px;
      border-bottom: 1px dashed rgba(255, 255, 255, 0.1);
      padding-bottom: 8px;
    }

    .detail-row:last-child {
      border-bottom: none;
      margin-bottom: 0;
      padding-bottom: 0;
    }

    .label {
      color: #94a3b8;
      font-size: 12px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .value {
      color: #f8fafc;
      font-size: 14px;
      font-weight: 600;
      text-align: right;
    }
    
    .value.highlight {
      color: #d4af37;
      font-size: 16px;
    }

    .footer {
      margin-top: auto;
      text-align: center;
      width: 100%;
      z-index: 1;
    }

    .ticket-id {
      font-family: monospace;
      font-size: 14px;
      color: #94a3b8;
      background: rgba(0,0,0,0.5);
      padding: 6px 12px;
      border-radius: 20px;
      display: inline-block;
      border: 1px solid rgba(255,255,255,0.1);
    }
    
    .cut-circle {
      position: absolute;
      width: 30px;
      height: 30px;
      background-color: #071526;
      border-radius: 50%;
      top: 50%;
      z-index: 5;
    }
    .cut-circle.left { left: -15px; border-right: 1px solid rgba(212, 175, 55, 0.4); }
    .cut-circle.right { right: -15px; border-left: 1px solid rgba(212, 175, 55, 0.4); }
    
    .dashed-line {
      position: absolute;
      top: calc(50% + 15px);
      left: 15px;
      right: 15px;
      height: 1px;
      border-top: 1px dashed rgba(212, 175, 55, 0.3);
      z-index: 4;
    }
  </style>
</head>
<body>
  <div class="ticket-container">
    <div class="glow"></div>
    <div class="cut-circle left"></div>
    <div class="cut-circle right"></div>
    <div class="dashed-line"></div>
    <div class="content">
      <h1>শব্দ ও সুরে বিমূর্ত রাত্রি</h1>
      <div class="subtitle">গান ও কবিতায় এক সন্ধ্যা</div>
      <div class="qr-container"><img src="${qrImageBase64}" alt="QR Code"></div>
      <div class="details-box">
        <div class="detail-row">
          <div class="label">Name</div>
          <div class="value">${ticket.name}</div>
        </div>
        <div class="detail-row">
          <div class="label">Tickets</div>
          <div class="value highlight">${ticket.ticketCount}</div>
        </div>
        <div class="detail-row">
          <div class="label">Date</div>
          <div class="value">9 Oct 2026, 6:30 PM</div>
        </div>
        <div class="detail-row">
          <div class="label">Venue</div>
          <div class="value" style="font-size: 11px;">আহারী বাহার, ধানমন্ডি ২৭</div>
        </div>
      </div>
    </div>
    <div class="footer"><div class="ticket-id">${ticket.id}</div></div>
  </div>
</body>
</html>`;

  const tempHtml = path.join("/tmp", `temp-ticket-${ticket.id.replace(/[^a-zA-Z0-9_-]/g, "_")}.html`);
  fs.writeFileSync(tempHtml, htmlContent, "utf-8");

  try {
    const chromePath = "/Applications/Google\\ Chrome.app/Contents/MacOS/Google\\ Chrome";
    const cmd = `${chromePath} --headless --disable-gpu --virtual-time-budget=2000 --screenshot="${outputPath}" --window-size=400,700 "${tempHtml}"`;
    execSync(cmd, { stdio: "ignore" });
  } finally {
    if (fs.existsSync(tempHtml)) {
      fs.unlinkSync(tempHtml);
    }
  }
}

async function main() {
  const jsonPath = path.join(process.cwd(), "data", "registrations.json");
  const localRegs: any[] = JSON.parse(fs.readFileSync(jsonPath, "utf-8"));

  const csvRows = parseCsv(csvRaw);
  console.log(`Parsed ${csvRows.length} rows from CSV.`);

  // Create date-time stamped folder: tickets_YYYYMMDD_HHMMSS
  const now = new Date();
  const pad = (n: number) => n.toString().padStart(2, "0");
  const folderStamp = `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}_${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}`;
  const folderName = `tickets_${folderStamp}`;
  const outputDir = path.join(process.cwd(), folderName);
  const localTicketsDir = path.join(process.cwd(), "local_tickets");

  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  if (!fs.existsSync(localTicketsDir)) {
    fs.mkdirSync(localTicketsDir, { recursive: true });
  }

  console.log(`Target folder: ${folderName}\n`);

  const targets: TicketTarget[] = [];
  const unmatchedRows: CsvRow[] = [];
  let offlineCounter = 1;

  for (const row of csvRows) {
    if (!row.name && !row.regId && !row.phone && !row.email) {
      continue;
    }

    // Try matching in database
    let dbMatch: any = null;
    let matchType = "";

    // 1. By Registration ID
    if (row.regId) {
      dbMatch = localRegs.find((r) => r.id === row.regId);
      if (dbMatch) matchType = "Registration ID";
    }

    // 2. By Name
    if (!dbMatch && row.name) {
      const cleanCsvName = row.name.trim().toLowerCase();
      dbMatch = localRegs.find((r) => r.name.trim().toLowerCase() === cleanCsvName);
      if (dbMatch) matchType = "Exact Name";
    }

    // 3. By Phone
    if (!dbMatch && row.phone) {
      const cleanPhone = row.phone.replace(/\D/g, "");
      if (cleanPhone.length >= 8) {
        dbMatch = localRegs.find((r) => r.whatsapp && r.whatsapp.replace(/\D/g, "").endsWith(cleanPhone));
        if (dbMatch) matchType = "Phone";
      }
    }

    // 4. By Email
    if (!dbMatch && row.email) {
      const cleanEmail = row.email.trim().toLowerCase();
      dbMatch = localRegs.find((r) => r.email && r.email.trim().toLowerCase() === cleanEmail);
      if (dbMatch) matchType = "Email";
    }

    if (dbMatch) {
      targets.push({
        id: dbMatch.id,
        name: dbMatch.name,
        ticketCount: row.ticketCount || dbMatch.ticketCount || 1,
        email: dbMatch.email,
        phone: dbMatch.whatsapp,
        source: "database",
        matchType,
      });
    } else if (row.name) {
      // Offline/manual attendee listed in CSV
      const manualId = `BR-OFFLINE-${pad(offlineCounter++)}`;
      targets.push({
        id: manualId,
        name: row.name,
        ticketCount: row.ticketCount || 1,
        email: row.email,
        phone: row.phone,
        source: "offline_csv",
        matchType: "Offline CSV Entry",
      });
    } else {
      unmatchedRows.push(row);
    }
  }

  // De-duplicate targets by ID if duplicate rows exist
  const uniqueTargets: TicketTarget[] = [];
  const seenIds = new Set<string>();
  for (const t of targets) {
    if (!seenIds.has(t.id)) {
      seenIds.add(t.id);
      uniqueTargets.push(t);
    }
  }

  console.log(`Generating tickets for ${uniqueTargets.length} matched/identified attendees:\n`);

  for (const target of uniqueTargets) {
    const filename = `${target.id}.png`;
    const outputPath = path.join(outputDir, filename);
    const localTicketPath = path.join(localTicketsDir, filename);

    process.stdout.write(`⏳ Generating ${filename} for ${target.name} (${target.ticketCount} ticket${target.ticketCount > 1 ? "s" : ""}) [${target.matchType}]... `);
    await renderTicketPng(target, outputPath);

    // Also copy to local_tickets for send-digital-tickets script
    fs.copyFileSync(outputPath, localTicketPath);

    // If it is an offline ticket, also make a copy named after the person for convenience
    if (target.source === "offline_csv") {
      const nameFilename = `${target.name.replace(/\s+/g, "_")}.png`;
      fs.copyFileSync(outputPath, path.join(outputDir, nameFilename));
      fs.copyFileSync(outputPath, path.join(localTicketsDir, nameFilename));
    }

    console.log("✅ Done");
  }

  console.log("\n================ SUMMARY ================");
  console.log(`Total generated tickets: ${uniqueTargets.length}`);
  console.log(`Folder: ${folderName} (${outputDir})`);
  console.log(`Also synced to: ${localTicketsDir}`);

  if (unmatchedRows.length > 0) {
    console.log(`\n⚠️ ${unmatchedRows.length} row(s) had no name or matching database record:`);
    for (const u of unmatchedRows) {
      console.log(`  - Row without name: Phone="${u.phone || "N/A"}", Email="${u.email || "N/A"}", Tickets=${u.ticketCount}`);
    }
  }
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
