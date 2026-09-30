import { getRegistrationsAsync, saveRegistrationsAsync } from "../src/lib/storage";

async function main() {
  const data = await getRegistrationsAsync();
  console.log("Total registrations before:", data.length);
  
  const idsToDelete = [
    "BR-2026-0006",
    "BR-2026-0005",
    "BR-2026-0003",
    "BR-2026-0001"
  ];
  
  const filteredData = data.filter(r => !idsToDelete.includes(r.id));
  
  console.log(`Removed ${data.length - filteredData.length} test records.`);
  console.log("Total registrations after:", filteredData.length);
  
  await saveRegistrationsAsync(filteredData);
  console.log("Successfully updated database and regenerated XLSX.");
}

main().catch(console.error);
