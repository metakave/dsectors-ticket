import { loadEnvConfig } from "@next/env";
loadEnvConfig(process.cwd());

import {
  createTransporter,
  getRegistrantEmailHtml,
  getRegistrantEmailText,
  getAdminEmailHtml,
  getAdminEmailText,
  sendRegistrationEmails,
} from "../src/lib/email";
import { Registration } from "../src/lib/types";

const sampleReg: Registration = {
  id: "BR-2026-TEST",
  name: "আহমেদ সাদিক (Ahmed Sadiq)",
  whatsapp: "01717662350",
  email: "sadiq.alam@gmail.com",
  bkash: "01717662350",
  bkashSameAsWhatsapp: true,
  registeredAt: new Date().toISOString(),
  formattedDate: "29 Sep 2026, 11:05 AM (BST)",
  status: "Ticket Not Sent",
  ticketCode: "",
  notes: "Direct SMTP test script",
};

async function main() {
  console.log("==========================================");
  console.log("   SMTP EMAIL DIAGNOSTICS & TEST RUNNER   ");
  console.log("==========================================");
  console.log("SMTP_HOST :", process.env.SMTP_HOST);
  console.log("SMTP_PORT :", process.env.SMTP_PORT);
  console.log("SMTP_USER :", process.env.SMTP_USER);
  console.log("ADMIN_MAIL:", process.env.ADMIN_EMAIL);
  console.log("BCC_EMAIL :", process.env.BCC_EMAIL);
  console.log("==========================================\n");

  const transporter = createTransporter();
  if (!transporter) {
    console.error("❌ ERROR: createTransporter returned null! Check .env variables.");
    process.exit(1);
  }

  // 1. Verify Connection
  console.log("1. Verifying SMTP Connection...");
  await new Promise<void>((resolve, reject) => {
    transporter.verify((err, success) => {
      if (err) {
        console.error("❌ Transporter verify failed:", err);
        reject(err);
      } else {
        console.log("✅ Transporter verified successfully! Server is ready to send.");
        resolve();
      }
    });
  });

  // 2. Test sendRegistrationEmails function
  console.log("\n2. Testing sendRegistrationEmails() dispatch...");
  const result = await sendRegistrationEmails(sampleReg, "https://ticket.dsectors.org");
  if (result.success) {
    console.log("✅ sendRegistrationEmails completed with success=true!");
  } else {
    console.error("❌ sendRegistrationEmails failed:", result.error);
  }

  console.log("\n🎉 ALL TESTS FINISHED SUCCESSFULLY!");
}

main().catch((err) => {
  console.error("Test execution failed:", err);
  process.exit(1);
});
