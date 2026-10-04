import { loadEnvConfig } from "@next/env";
loadEnvConfig(process.cwd());

import fs from "fs";
import path from "path";
import nodemailer from "nodemailer";
import { updateRegistrationStatusAsync, saveRegistrationsToDisk } from "../src/lib/storage";

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

const targets: TicketDispatch[] = [
  {
    id: "BR-2026-0019",
    name: "ইলোরা",
    ticketCount: 1,
    email: "sselora.harmony19@gmail.com",
    filename: "BR-2026-0019.png",
    isDbRecord: true,
  },
  {
    id: "BR-2026-0018",
    name: "Kanika Chakraborty",
    ticketCount: 4,
    email: "borty.kanika@yahoo.com",
    filename: "BR-2026-0018.png",
    isDbRecord: true,
  },
  {
    id: "BR-2026-0017",
    name: "Sayema Mukarrama",
    ticketCount: 1,
    email: "sayema14bd@gmail.com",
    filename: "BR-2026-0017.png",
    isDbRecord: true,
  },
  {
    id: "BR-OFFLINE-01",
    name: "Ferdoushi Begum",
    ticketCount: 1,
    email: "ferdoushi@yahoo.com",
    filename: "BR-OFFLINE-01.png",
    isDbRecord: false,
  },
  {
    id: "BR-2026-0015",
    name: "কাজী নজরুল ইসলাম",
    ticketCount: 1,
    email: "sarothy@gmail.com",
    filename: "BR-2026-0015.png",
    isDbRecord: true,
  },
  {
    id: "BR-2026-0013",
    name: "Ferdowsi Rita",
    ticketCount: 2,
    email: "ferdowsi.rita@gmail.com",
    filename: "BR-2026-0013.png",
    isDbRecord: true,
  },
  {
    id: "BR-2026-0012",
    name: "মো: হাবিবুর রহমান শিনু",
    ticketCount: 1,
    email: "sassybd1978@gmail.com",
    filename: "BR-2026-0012.png",
    isDbRecord: true,
  },
  {
    id: "BR-2026-0007",
    name: "Nahida Parvin",
    ticketCount: 1,
    email: "sayemachowdhury.anta@gmail.com",
    filename: "BR-2026-0007.png",
    isDbRecord: true,
  },
  {
    id: "BR-OFFLINE-02",
    name: "Mahenaw Wara",
    ticketCount: 1,
    email: "manana.manamaya@gmail.com",
    filename: "BR-OFFLINE-02.png",
    isDbRecord: false,
  },
];

async function main() {
  const targetFolder = path.join(process.cwd(), "tickets_20261004_171318");

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

  const bccEmails = (process.env.BCC_EMAIL || "sabinakakoli@gmail.com,sadiq.alam@gmail.com")
    .split(",")
    .map((e) => e.trim())
    .filter(Boolean);

  console.log("================ SENDING TICKETS ================");
  console.log(`Source Folder: ${targetFolder}`);
  console.log(`Sender: ${from.name} <${from.address}>`);
  console.log(`BCC: ${bccEmails.join(", ")}`);
  console.log(`Total Emails to Dispatch: ${targets.length}\n`);

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

      // Update database status if it's a registered record
      if (item.isDbRecord) {
        try {
          await updateRegistrationStatusAsync(item.id, "Ticket Sent");
        } catch {
          // ignore error if any
        }
      }
    } catch (err: any) {
      console.error(`  ❌ Failed to send to ${item.email}:`, err.message || err);
      failCount++;
    }

    if (i < targets.length - 1) {
      console.log("  ⏳ Waiting 4 seconds before next email...");
      await sleep(4000);
    }
  }

  console.log("\n================ DISPATCH REPORT ================");
  console.log(`Total Attempted: ${targets.length}`);
  console.log(`Successfully Sent: ${successCount}`);
  console.log(`Failed: ${failCount}`);
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
