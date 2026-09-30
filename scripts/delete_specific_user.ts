import { getRegistrationsAsync, saveRegistrationsAsync } from "../src/lib/storage";

async function main() {
  const data = await getRegistrationsAsync();
  console.log("Total registrations before:", data.length);
  
  const searchName = "আহমেদ সাদিক (লাইভ ডাটাবেজ টেস্ট)";
  const filteredData = data.filter(r => r.name !== searchName);
  
  const removedCount = data.length - filteredData.length;
  console.log(`Removed ${removedCount} test records.`);
  
  if (removedCount > 0) {
    await saveRegistrationsAsync(filteredData);
    console.log("Successfully updated database and regenerated XLSX.");
  } else {
    console.log("Record not found in the database. It may have already been deleted.");
  }
}

main().catch(console.error);
