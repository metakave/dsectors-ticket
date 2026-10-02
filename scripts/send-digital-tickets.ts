import { loadEnvConfig } from "@next/env";
loadEnvConfig(process.cwd());

import { createTransporter } from "../src/lib/email";
import { getRegistrationsAsync } from "../src/lib/storage";
import fs from "fs";
import path from "path";

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

async function main() {
  const isTest = process.argv.includes("--test");
  const isAll = process.argv.includes("--all");
  
  const idIndex = process.argv.indexOf("--id");
  const targetId = idIndex !== -1 ? process.argv[idIndex + 1] : null;

  if (!isTest && !isAll && !targetId) {
    console.error("❌ You must specify whom to send the ticket to.");
    console.error("Usage:");
    console.error("  --test           Send a single test email to sadiq.alam@gmail.com");
    console.error("  --id <ID>        Send email only to the specified Registration ID (e.g. BR-2026-0001)");
    console.error("  --all            Send emails to ALL registrations");
    process.exit(1);
  }

  console.log("Fetching registrations...");
  let data = await getRegistrationsAsync();
  if (data.length === 0) {
    console.log("No registrations found.");
    return;
  }

  if (targetId) {
    data = data.filter(reg => reg.id === targetId);
    if (data.length === 0) {
      console.error(`❌ No registration found with ID: ${targetId}`);
      process.exit(1);
    }
  }

  const transporter = createTransporter();
  if (!transporter) {
    console.error("Transporter could not be created.");
    process.exit(1);
  }

  const senderEmail = process.env.SMTP_USER || "contact@dsectors.org";
  const from = {
    name: "শব্দ ও সুরে বিমূর্ত রাত্রি",
    address: senderEmail,
  };

  const bccEmails = ["sabinakakoli@gmail.com", "sadiq.alam@gmail.com"];

  let count = 0;
  for (const reg of data) {
    const ticketPath = path.join(process.cwd(), "local_tickets", `${reg.id}.png`);
    if (!fs.existsSync(ticketPath)) {
      console.log(`Ticket not found for ${reg.id}, skipping.`);
      continue;
    }

    const emailTo = isTest ? "sadiq.alam@gmail.com" : reg.email;
    
    console.log(`Sending ticket for ${reg.name} (${reg.id}) to ${emailTo}...`);
    
    try {
      await transporter.sendMail({
        from,
        to: emailTo,
        bcc: isTest ? undefined : bccEmails,
        subject: `আপনার ডিজিটাল টিকিট - শব্দ ও সুরে বিমূর্ত রাত্রি (ID: ${reg.id})`,
        html: getEmailHtml(reg.name, reg.ticketCount || 1),
        attachments: [
          {
            filename: `Ticket-${reg.id}.png`,
            path: ticketPath,
            cid: `ticket-${reg.id}`
          }
        ]
      });
      console.log(`✅ Sent to ${emailTo}`);
    } catch (e) {
      console.error(`❌ Failed to send to ${emailTo}: `, e);
    }

    count++;

    if (isTest) {
      console.log("Test mode: stopping after 1 email.");
      break;
    }

    if (count < data.length) {
      console.log("Waiting 5 seconds...");
      await sleep(5000);
    }
  }

  console.log(`\nDone! Sent ${count} tickets.`);
}

main().catch(console.error);
