import { loadEnvConfig } from "@next/env";
loadEnvConfig(process.cwd());

import fs from "fs";
import path from "path";
import nodemailer from "nodemailer";
import {
  updateRegistrationStatusAsync,
  getRegistrationsAsync,
  saveRegistrationsAsync,
} from "../src/lib/storage";

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

const getEmailHtml = (name: string, ticketCount: number) => `
<!DOCTYPE html>
<html lang="bn">
<head>
  <meta charset="UTF-8">
  <title>Your Digital Ticket</title>
</head>
<body style="font-family: Arial, sans-serif; background-color: #f4f4f4; margin: 0; padding: 20px; color: #333;">
  <div style="max-width: 600px; margin: 0 auto; background: #fff; padding: 30px; border-radius: 10px; box-shadow: 0 4px 15px rgba(0,0,0,0.1);">
    <h2 style="color: #d4af37; text-align: center;">শব্দ ও সুরে বিমূর্ত রাত্রি</h2>
    <p>শুভেচ্ছা, প্রিয় <strong>${name}</strong>,</p>
    <p>আপনাকে আন্তরিক ধন্যবাদ "শব্দ ও সুরে বিমূর্ত রাত্রি" অনুষ্ঠানে নিবন্ধন করার জন্য। আমরা আপনাকে এই মুগ্ধকর সন্ধ্যায় আমন্ত্রণ জানাচ্ছি।</p>
    <p>আপনার <strong>${ticketCount}</strong> টি ডিজিটাল টিকিট এই ইমেইলের সাথে সংযুক্ত করা হলো।</p>
    <div style="background-color: #fcf8e3; border-left: 5px solid #faebcc; padding: 15px; margin: 20px 0;">
      <p style="margin: 0; font-size: 15px;"><strong>অনুগ্রহ করে মনে রাখবেন:</strong> টিকিটটি প্রিন্ট করার কোনো প্রয়োজন নেই। ইভেন্টের দিন প্রবেশের সময় আপনার মোবাইল ফোন থেকে এই ডিজিটাল টিকিটটি দেখালেই হবে।</p>
    </div>
    <p><strong>স্থান:</strong> আহারী বাহার মিলনায়তন, ধানমন্ডি ২৭, ঢাকা</p>
    <p><strong>তারিখ:</strong> ৯ অক্টোবর ২০২৬ (শুক্রবার)</p>
    <p><strong>সময়:</strong> সন্ধ্যা ৬:৩০ টা</p>
    <p>আপনার উপস্থিতির অপেক্ষায় রইলাম।</p>
    <br/>
    <p>আন্তরিক ধন্যবাদসহ,<br/><strong>শব্দ ও সুরে বিমূর্ত রাত্রি আয়োজক কমিটি</strong></p>
  </div>
</body>
</html>
`;

interface TicketDispatch {
  id: string;
  name: string;
  ticketCount: number;
  email: string;
  filename: string;
  isDbRecord: boolean;
}

export const targets: TicketDispatch[] = [
  {
    id: "BR-2026-0037",
    name: "Biplob Kumar Hazra",
    ticketCount: 2,
    email: "hazrabiplob@yahoo.com",
    filename: "BR-2026-0037.png",
    isDbRecord: true,
  },
  {
    id: "BR-2026-0036",
    name: "মাহবুবা রাখি",
    ticketCount: 1,
    email: "mahbubaalam300@gmail.com",
    filename: "BR-2026-0036.png",
    isDbRecord: true,
  },
  {
    id: "BR-2026-0038",
    name: "Tahera Jabeen",
    ticketCount: 1,
    email: "taherajabeen@yahoo.com",
    filename: "BR-2026-0038.png",
    isDbRecord: true,
  },
  {
    id: "BR-OFFLINE-05",
    name: "Arif Chowdhury",
    ticketCount: 1,
    email: "cmarif007@gmail.com",
    filename: "BR-OFFLINE-05.png",
    isDbRecord: false,
  },
  {
    id: "BR-2026-0034",
    name: "AHM Emdadul Islam",
    ticketCount: 2,
    email: "emdadulislam936@gmail.com",
    filename: "BR-2026-0034.png",
    isDbRecord: false,
  },
  {
    id: "BR-2026-0032",
    name: "Mohammed Shoeb",
    ticketCount: 1,
    email: "shoeb@trtradingbd.com",
    filename: "BR-2026-0032.png",
    isDbRecord: true,
  },
  {
    id: "BR-2026-0031",
    name: "Kishower Amin",
    ticketCount: 2,
    email: "kishowerca@gmail.com",
    filename: "BR-2026-0031.png",
    isDbRecord: true,
  },
  {
    id: "BR-2026-0030",
    name: "Juthi",
    ticketCount: 1,
    email: "biswas.lipika05@gmail.com",
    filename: "BR-2026-0030.png",
    isDbRecord: true,
  },
  {
    id: "BR-2026-0029",
    name: "Bidhan Chandra Pal",
    ticketCount: 3,
    email: "bidhan.probhaaurora@gmail.com",
    filename: "BR-2026-0029.png",
    isDbRecord: true,
  },
  {
    id: "BR-2026-0026",
    name: "Saud Bin Jahan (Susan)",
    ticketCount: 2,
    email: "saud.jahan@outlook.com",
    filename: "BR-2026-0026.png",
    isDbRecord: true,
  },
  {
    id: "BR-2026-0025",
    name: "Joya Tasnim",
    ticketCount: 1,
    email: "joyatasnim229@gmail.com",
    filename: "BR-2026-0025.png",
    isDbRecord: true,
  },
  {
    id: "BR-2026-0020",
    name: "Delwar Hossain",
    ticketCount: 1,
    email: "biswas.lipika05@gmail.com",
    filename: "BR-2026-0020.png",
    isDbRecord: true,
  },
];

async function main() {
  const targetFolder = path.join(process.cwd(), "8oct2026");

  if (!fs.existsSync(targetFolder)) {
    console.error(`❌ Target folder does not exist: ${targetFolder}`);
    process.exit(1);
  }

  // Verify all files exist
  for (const t of targets) {
    const filePath = path.join(targetFolder, t.filename);
    if (!fs.existsSync(filePath)) {
      console.error(`❌ Ticket file missing: ${filePath}`);
      process.exit(1);
    }
  }

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || "smtp.gmail.com",
    port: Number(process.env.SMTP_PORT) || 465,
    secure: Number(process.env.SMTP_PORT) === 465,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
    tls: { rejectUnauthorized: false },
  });

  const from = {
    name: "শব্দ ও সুরে বিমূর্ত রাত্রি",
    address: process.env.SMTP_USER || "sadiq.alam@gmail.com",
  };

  const ccEmails = process.env.CC_EMAIL
    ? process.env.CC_EMAIL.split(",").map((e) => e.trim()).filter(Boolean)
    : undefined;

  const bccEmails = (process.env.BCC_EMAIL || "sabinakakoli@gmail.com,sadiq.alam@gmail.com")
    .split(",")
    .map((e) => e.trim())
    .filter(Boolean);

  console.log("================ SENDING TICKETS ================");
  console.log(`Source Folder: ${targetFolder}`);
  console.log(`Sender: ${from.name} <${from.address}>`);
  if (ccEmails) console.log(`CC: ${ccEmails.join(", ")}`);
  console.log(`BCC: ${bccEmails.join(", ")}`);
  console.log(`Total Emails to Dispatch: ${targets.length}\n`);

  interface DispatchResult {
    name: string;
    email: string;
    id: string;
    ticketCount: number;
    filename: string;
    status: "Sent" | "Failed";
    messageId?: string;
    error?: string;
  }

  const results: DispatchResult[] = [];
  let successCount = 0;
  let failCount = 0;

  for (let i = 0; i < targets.length; i++) {
    const item = targets[i];
    const ticketPath = path.join(targetFolder, item.filename);

    console.log(
      `[${i + 1}/${targets.length}] Sending to: ${item.name} <${item.email}> (${item.id}, ${item.ticketCount} ticket${item.ticketCount > 1 ? "s" : ""})...`
    );

    try {
      const info = await transporter.sendMail({
        from,
        to: item.email,
        cc: ccEmails,
        bcc: bccEmails,
        subject: `আপনার ডিজিটাল টিকিট - শব্দ ও সুরে বিমূর্ত রাত্রি (ID: ${item.id})`,
        html: getEmailHtml(item.name, item.ticketCount),
        attachments: [
          {
            filename: `Ticket-${item.id}.png`,
            path: ticketPath,
            cid: `ticket-${item.id}`,
          },
        ],
      });

      console.log(`  ✅ Successfully sent! MessageID: ${info.messageId}`);
      successCount++;
      results.push({
        name: item.name,
        email: item.email,
        id: item.id,
        ticketCount: item.ticketCount,
        filename: item.filename,
        status: "Sent",
        messageId: info.messageId,
      });

      // Update database status if it's a registered record
      if (item.isDbRecord) {
        try {
          await updateRegistrationStatusAsync(item.id, "Mail Sent");
        } catch {
          // ignore error if any
        }
      } else {
        try {
          const existing = await getRegistrationsAsync();
          if (!existing.some((r) => r.id === item.id || (r.email === item.email && r.name === item.name))) {
            const now = new Date();
            const dateOptions: Intl.DateTimeFormatOptions = {
              day: "2-digit",
              month: "short",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
              hour12: true,
              timeZone: "Asia/Dhaka",
            };
            const formattedDate =
              new Intl.DateTimeFormat("en-US", dateOptions).format(now) + " (BST)";
            const newOfflineReg = {
              id: item.id,
              name: item.name,
              whatsapp: "",
              email: item.email,
              bkash: "",
              bkashSameAsWhatsapp: false,
              ticketCount: item.ticketCount,
              totalAmount: item.ticketCount * 500,
              registeredAt: now.toISOString(),
              formattedDate,
              status: "Mail Sent" as const,
              ticketCode: item.id,
              notes: "Offline CSV registration",
            };
            await saveRegistrationsAsync([newOfflineReg, ...existing]);
          }
        } catch {
          // ignore error if any
        }
      }
    } catch (err: any) {
      console.error(`  ❌ Failed to send to ${item.email}:`, err.message || err);
      failCount++;
      results.push({
        name: item.name,
        email: item.email,
        id: item.id,
        ticketCount: item.ticketCount,
        filename: item.filename,
        status: "Failed",
        error: err.message || String(err),
      });
    }

    if (i < targets.length - 1) {
      console.log("  ⏳ Waiting 5 seconds before next email...");
      await sleep(5000);
    }
  }

  console.log("\n================ DISPATCH REPORT ================");
  console.log(`Total Attempted: ${targets.length}`);
  console.log(`Successfully Sent: ${successCount}`);
  console.log(`Failed: ${failCount}`);
  console.log("\nJSON_RESULTS_START");
  console.log(JSON.stringify(results, null, 2));
  console.log("JSON_RESULTS_END");
}

if (process.argv[1] === __filename) {
  main().catch((err) => {
    console.error("Fatal error:", err);
    process.exit(1);
  });
}
