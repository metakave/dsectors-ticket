import { getRegistrationsAsync } from "../src/lib/storage";
import fs from "fs";
import path from "path";
import QRCode from "qrcode";
import { execSync } from "child_process";

async function main() {
  const data = await getRegistrationsAsync();
  // Find a registration with 1 ticket, or just take the first one
  let reg = data.find(r => r.ticketCount === 1) || data[0];
  
  if (!reg) {
    console.error("No registrations found.");
    return;
  }

  // Generate QR Code
  const qrData = `TicketID: ${reg.id}\nName: ${reg.name}\nTickets: ${reg.ticketCount}`;
  const qrImageBase64 = await QRCode.toDataURL(qrData, {
    color: {
      dark: "#000000",
      light: "#ffffff"
    },
    width: 200,
    margin: 2
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

    /* Ambient glow */
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
      
      <div class="qr-container">
        <img src="${qrImageBase64}" alt="QR Code">
      </div>
      
      <div class="details-box">
        <div class="detail-row">
          <div class="label">Name</div>
          <div class="value">${reg.name}</div>
        </div>
        
        <div class="detail-row">
          <div class="label">Tickets</div>
          <div class="value highlight">${reg.ticketCount}</div>
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
    
    <div class="footer">
      <div class="ticket-id">${reg.id}</div>
    </div>
  </div>
</body>
</html>
  `;

  const htmlPath = path.join(process.cwd(), "public", "ticket-template.html");
  const pdfPath = path.join(process.cwd(), "public", "sample-ticket.pdf");
  
  fs.writeFileSync(htmlPath, htmlContent);
  console.log("HTML Template generated.");

  try {
    const chromePath = "/Applications/Google\\ Chrome.app/Contents/MacOS/Google\\ Chrome";
    // Mobile viewport roughly 400x700
    // We use print-to-pdf to generate a PDF without margins
    const cmd = `${chromePath} --headless --disable-gpu --print-to-pdf="${pdfPath}" --print-to-pdf-no-header --no-pdf-header-footer --window-size=400,700 "${htmlPath}"`;
    execSync(cmd);
    console.log(`PDF successfully generated at ${pdfPath}`);
  } catch (e) {
    console.error("Failed to generate PDF with Chrome", e);
  }
}

main().catch(console.error);
