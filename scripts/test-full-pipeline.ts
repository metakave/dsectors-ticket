import { loadEnvConfig } from "@next/env";
loadEnvConfig(process.cwd());

import * as XLSX from "xlsx";
import {
  addRegistrationAsync,
  getRegistrationsAsync,
  generateXlsxBuffer,
  saveRegistrationsToDisk,
} from "../src/lib/storage";
import { sendRegistrationEmails, createTransporter } from "../src/lib/email";

async function runComprehensivePipelineTest() {
  console.log("========================================================");
  console.log("       COMPREHENSIVE PIPELINE & EXCEL TEST RUNNER       ");
  console.log("========================================================");

  // 1. Check SMTP
  console.log("\n[TEST 1] Testing SMTP Transporter Setup...");
  const transporter = createTransporter();
  if (!transporter) {
    throw new Error("SMTP Transporter failed to create");
  }
  await new Promise<void>((resolve, reject) => {
    transporter.verify((err) => {
      if (err) reject(err);
      else {
        console.log("✅ SMTP Transporter verified successfully!");
        resolve();
      }
    });
  });

  // 2. Submit a Test Registration
  console.log("\n[TEST 2] Submitting a Test Registration...");
  const testInput = {
    name: "সাদিক আলম (Pipeline Verification)",
    whatsapp: "01717662350",
    email: "sadiq.alam@gmail.com",
    bkash: "01717662350",
    bkashSameAsWhatsapp: true,
  };

  const newReg = await addRegistrationAsync(testInput);
  console.log(`✅ Registration Created: ${newReg.id} (${newReg.name})`);

  // 3. Verify Registrations Storage
  console.log("\n[TEST 3] Reading Back Registrations...");
  const allRegistrations = await getRegistrationsAsync();
  console.log(`✅ Total Registrations Count: ${allRegistrations.length}`);
  const found = allRegistrations.find((r) => r.id === newReg.id);
  if (!found) {
    throw new Error(`Failed to find newly created registration ${newReg.id}`);
  }
  console.log(`✅ Registration found in database: ID=${found.id}, Name=${found.name}`);

  // 4. Generate & Parse Excel Spreadsheet
  console.log("\n[TEST 4] Generating and Validating Excel (.xlsx) Spreadsheet...");
  const xlsxBuffer = generateXlsxBuffer(allRegistrations);
  console.log(`✅ Excel Buffer Generated. Size: ${xlsxBuffer.length} bytes`);

  const workbook = XLSX.read(xlsxBuffer, { type: "buffer" });
  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];
  const parsedRows: any[] = XLSX.utils.sheet_to_json(sheet);
  console.log(`✅ Excel Sheet Name: "${sheetName}"`);
  console.log(`✅ Excel Rows Count: ${parsedRows.length}`);
  console.log("Preview of latest row in Excel:", JSON.stringify(parsedRows[0], null, 2));

  // 5. Send Registration Emails (with attached Excel spreadsheet)
  console.log("\n[TEST 5] Shooting Registration Emails with attached Excel...");
  const emailResult = await sendRegistrationEmails(newReg, "https://ticket.dsectors.org");
  if (!emailResult.success) {
    throw new Error(`Email sending failed: ${emailResult.error}`);
  }
  console.log("✅ Registration Emails dispatched successfully with attached Excel spreadsheet!");

  console.log("\n========================================================");
  console.log("  🎉 ALL 5 INTERNAL PIPELINE TESTS PASSED SUCCESSFULLY!  ");
  console.log("========================================================");
}

runComprehensivePipelineTest().catch((err) => {
  console.error("❌ Pipeline test failed:", err);
  process.exit(1);
});
