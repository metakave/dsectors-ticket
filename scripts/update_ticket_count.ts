import { getRegistrationsAsync, saveRegistrationsAsync } from "../src/lib/storage";

async function main() {
  const data = await getRegistrationsAsync();
  let updated = false;

  const targetNames = ["Anindita Bhattacharjee"];

  for (const reg of data) {
    if (targetNames.includes(reg.name)) {
      reg.ticketCount = 2;
      reg.totalAmount = 1000;
      updated = true;
      console.log(`Updated ticketCount for ${reg.name}`);
    }
  }

  if (updated) {
    await saveRegistrationsAsync(data);
    console.log("Database updated successfully.");
  } else {
    console.log("No records needed updating.");
  }
}

main().catch(console.error);
