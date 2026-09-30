import { getRegistrationsAsync } from "../src/lib/storage";

async function main() {
  const data = await getRegistrationsAsync();
  console.log("Total registrations:", data.length);
  
  console.log("All data:", JSON.stringify(data, null, 2));
}

main().catch(console.error);
