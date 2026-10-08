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
  aliases?: { id: string; filename: string }[];
}

const csvRaw = `Registration ID,Name (নাম),Ticket Number,Total Amount (মোট টাকা),WhatsApp Number (হোয়াটসঅ্যাপ),Email (ইমেইল)
BR-2026-0037,Biplob Kumar Hazra,2,1000,01733454575,hazrabiplob@yahoo.com
BR-2026-0036,মাহবুবা রাখি,1,500,01615253954,mahbubaalam300@gmail.com
BR-2026-0035,Tahera Jabeen,1,500,1715325576,taherajabeen@yahoo.com
,Arif Chowdhury,1,500,1313434011,cmarif007@gmail.com
BR-2026-0034,AHM Emdadul Islam,2,1000,1797232977,emdadulislam936@gmail.com
BR-2026-0032,Mohammed Shoeb,1,500,01615253954,shoeb@trtradingbd.com
BR-2026-0031,Kishower Amin,2,1000,01766903903,kishowerca@gmail.com
BR-2026-0030,Juthi,1,500,01715458432,biswas.lipika05@gmail.com
BR-2026-0029,Bidhan Chandra Pal,3,1500,01730715222,bidhan.probhaaurora@gmail.com
BR-2026-0026,Saud Bin Jahan (Susan),2,1000,01714100924,saud.jahan@outlook.com
BR-2026-0025,Joya Tasnim,1,500,01911586356,joyatasnim229@gmail.com
BR-2026-0020,Delwar Hossain,1,500,01715458432,biswas.lipika05@gmail.com`;

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
  const lines = text.trim().split("\n");
  if (lines.length <= 1) return [];

  const headers = parseCsvLine(lines[0]).map((h) => h.toLowerCase());
  
  const findIndex = (...terms: string[]) => {
    return headers.findIndex((h) => terms.some((t) => h.includes(t.toLowerCase())));
  };

  const slIdx = findIndex("sl");
  const regIdIdx = findIndex("registration id", "reg id");
  const nameIdx = findIndex("name", "নাম");
  const countIdx = findIndex("ticket number", "ticket count", "tickets");
  const amountIdx = findIndex("total amount", "amount", "টাকা");
  const phoneIdx = findIndex("whatsapp", "phone", "mobile");
  const emailIdx = findIndex("email", "ইমেইল");

  const rows: CsvRow[] = [];

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    if (!line.trim() || line.replace(/,/g, "").trim() === "") continue;

    const cols = parseCsvLine(line);
    const sl = slIdx >= 0 ? cols[slIdx] || "" : "";
    const regId = regIdIdx >= 0 ? cols[regIdIdx] || "" : "";
    const name = nameIdx >= 0 ? cols[nameIdx] || "" : "";
    const ticketCount = countIdx >= 0 ? parseInt(cols[countIdx] || "1", 10) || 1 : 1;
    const totalAmount = amountIdx >= 0 ? cols[amountIdx] || "" : "";
    const phone = phoneIdx >= 0 ? cols[phoneIdx] || "" : "";
    const email = emailIdx >= 0 ? cols[emailIdx] || "" : "";

    rows.push({ sl, regId, dateTime: "", name, ticketCount, totalAmount, phone, email });
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

  const tempHtml = path.join("/tmp", `temp-ticket-${ticket.id.replace(/[^a-zA-Z0-9_-]/g, "_")}-${Date.now()}.html`);
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

  // Target output folder specified by user: 8oct2026
  const folderName = "8oct2026";
  const outputDir = path.join(process.cwd(), folderName);
  const localTicketsDir = path.join(process.cwd(), "local_tickets");

  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  if (!fs.existsSync(localTicketsDir)) {
    fs.mkdirSync(localTicketsDir, { recursive: true });
  }

  console.log(`Target folder: ${folderName} (${outputDir})\n`);

  const targets: TicketTarget[] = [];
  const pad = (n: number) => n.toString().padStart(2, "0");

  // Determine starting offline counter dynamically
  let offlineCounter = 1;
  const offlineIdRegex = /BR-OFFLINE-(\d+)/i;
  for (const r of localRegs) {
    const match = (r.ticketCode || r.id || "").match(offlineIdRegex);
    if (match) {
      const num = parseInt(match[1], 10);
      if (num >= offlineCounter) offlineCounter = num + 1;
    }
  }
  if (fs.existsSync(localTicketsDir)) {
    const files = fs.readdirSync(localTicketsDir);
    for (const f of files) {
      const match = f.match(offlineIdRegex);
      if (match) {
        const num = parseInt(match[1], 10);
        if (num >= offlineCounter) offlineCounter = num + 1;
      }
    }
  }

  for (const row of csvRows) {
    if (!row.name && !row.regId && !row.phone && !row.email) {
      continue;
    }

    // Try matching in database
    let dbMatch: any = null;
    let matchType = "";

    // 1. By Registration ID (with name or email verification if present)
    if (row.regId) {
      const matchCandidate = localRegs.find((r) => r.id === row.regId);
      if (matchCandidate) {
        const nameMatches = row.name && matchCandidate.name.trim().toLowerCase() === row.name.trim().toLowerCase();
        const emailMatches = row.email && matchCandidate.email.trim().toLowerCase() === row.email.trim().toLowerCase();
        if (nameMatches || emailMatches || !row.name) {
          dbMatch = matchCandidate;
          matchType = "Registration ID";
        }
      }
    }

    // 2. By Name
    if (!dbMatch && row.name) {
      const cleanCsvName = row.name.trim().toLowerCase();
      dbMatch = localRegs.find((r) => r.name.trim().toLowerCase() === cleanCsvName);
      if (dbMatch) matchType = "Exact Name";
    }

    // 3. By Email
    if (!dbMatch && row.email) {
      const cleanEmail = row.email.trim().toLowerCase();
      dbMatch = localRegs.find((r) => r.email && r.email.trim().toLowerCase() === cleanEmail);
      if (dbMatch) matchType = "Email";
    }

    // 4. By Phone
    if (!dbMatch && row.phone) {
      const cleanPhone = row.phone.replace(/\D/g, "");
      if (cleanPhone.length >= 8) {
        dbMatch = localRegs.find((r) => r.whatsapp && r.whatsapp.replace(/\D/g, "").endsWith(cleanPhone));
        if (dbMatch) matchType = "Phone";
      }
    }

    if (dbMatch) {
      // If DB match has a different ID than CSV row, keep both as aliases
      const aliases: { id: string; filename: string }[] = [];
      if (row.regId && row.regId !== dbMatch.id) {
        aliases.push({ id: row.regId, filename: `${row.regId}.png` });
      }
      const safeNameFile = `${row.name.trim().replace(/\s+/g, "_")}.png`;
      aliases.push({ id: dbMatch.id, filename: safeNameFile });

      targets.push({
        id: dbMatch.id,
        name: dbMatch.name,
        ticketCount: row.ticketCount || dbMatch.ticketCount || 1,
        email: dbMatch.email || row.email,
        phone: dbMatch.whatsapp || row.phone,
        source: "database",
        matchType: matchType + (row.regId && row.regId !== dbMatch.id ? ` (CSV: ${row.regId}, DB: ${dbMatch.id})` : ""),
        aliases,
      });
    } else if (row.name) {
      // Offline/manual attendee listed in CSV
      const primaryId = row.regId ? row.regId : `BR-OFFLINE-${pad(offlineCounter++)}`;
      const aliases: { id: string; filename: string }[] = [];
      const safeNameFile = `${row.name.trim().replace(/\s+/g, "_")}.png`;
      aliases.push({ id: primaryId, filename: safeNameFile });

      if (row.regId && !row.regId.startsWith("BR-OFFLINE-")) {
        const offId = `BR-OFFLINE-${pad(offlineCounter++)}`;
        aliases.push({ id: offId, filename: `${offId}.png` });
      }

      targets.push({
        id: primaryId,
        name: row.name,
        ticketCount: row.ticketCount || 1,
        email: row.email,
        phone: row.phone,
        source: "offline_csv",
        matchType: row.regId ? `Manual CSV ID (${row.regId})` : "Offline CSV Entry",
        aliases,
      });
    }
  }

  console.log(`Generating tickets for ${targets.length} attendees:\n`);

  for (const target of targets) {
    const filename = `${target.id}.png`;
    const outputPath = path.join(outputDir, filename);
    const localTicketPath = path.join(localTicketsDir, filename);

    process.stdout.write(`⏳ Generating ${filename} for ${target.name} (${target.ticketCount} ticket${target.ticketCount > 1 ? "s" : ""}) [${target.matchType}]... `);
    await renderTicketPng(target, outputPath);
    fs.copyFileSync(outputPath, localTicketPath);
    console.log("✅ Primary Done");

    // Render aliases / friendly copies
    if (target.aliases) {
      for (const alias of target.aliases) {
        const aliasOutputPath = path.join(outputDir, alias.filename);
        const aliasLocalPath = path.join(localTicketsDir, alias.filename);
        if (alias.id === target.id) {
          fs.copyFileSync(outputPath, aliasOutputPath);
          fs.copyFileSync(outputPath, aliasLocalPath);
        } else {
          // Render with alias ID in badge & QR
          await renderTicketPng({ id: alias.id, name: target.name, ticketCount: target.ticketCount }, aliasOutputPath);
          fs.copyFileSync(aliasOutputPath, aliasLocalPath);
        }
        console.log(`   ↳ Synced copy: ${alias.filename} (ID: ${alias.id})`);
      }
    }
  }

  console.log("\n================ SUMMARY ================");
  console.log(`Total attendees processed: ${targets.length}`);
  console.log(`Target folder: ${folderName} (${outputDir})`);
  console.log(`Synced to: ${localTicketsDir}`);
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
