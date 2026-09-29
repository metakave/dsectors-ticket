import fs from "fs";
import path from "path";
import * as XLSX from "xlsx";
import { Registration, RegisterFormInput, TicketStatus } from "./types";

// File paths
const DATA_DIR = path.join(process.cwd(), "data");
const JSON_FILE_PATH = path.join(DATA_DIR, "registrations.json");
const PRIMARY_XLSX_PATH = path.join(DATA_DIR, "registrations.xlsx");
const PUBLIC_XLSX_PATH = path.join(process.cwd(), "public", "downloads", "registrations.xlsx");
const TMP_JSON_PATH = "/tmp/bimurto_ratri_registrations.json";
const TMP_XLSX_PATH = "/tmp/bimurto_ratri_registrations.xlsx";

// In-memory cache for fast access & serverless persistence
let inMemoryRegistrations: Registration[] = [];
let isInitialized = false;

function ensureDirectories() {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    const publicDownloadsDir = path.join(process.cwd(), "public", "downloads");
    if (!fs.existsSync(publicDownloadsDir)) {
      fs.mkdirSync(publicDownloadsDir, { recursive: true });
    }
  } catch (err) {
    console.warn("Could not create project directories, using fallback in-memory/tmp:", err);
  }
}

export function getXlsxFilePath(): string {
  // Returns the full absolute path of the generated Excel file
  if (fs.existsSync(PRIMARY_XLSX_PATH)) {
    return PRIMARY_XLSX_PATH;
  }
  if (fs.existsSync(PUBLIC_XLSX_PATH)) {
    return PUBLIC_XLSX_PATH;
  }
  return TMP_XLSX_PATH;
}

export function getRegistrations(): Registration[] {
  if (isInitialized && inMemoryRegistrations.length > 0) {
    return inMemoryRegistrations;
  }

  ensureDirectories();

  // Try reading from JSON_FILE_PATH
  try {
    if (fs.existsSync(JSON_FILE_PATH)) {
      const data = fs.readFileSync(JSON_FILE_PATH, "utf-8");
      inMemoryRegistrations = JSON.parse(data);
      isInitialized = true;
      return inMemoryRegistrations;
    }
  } catch (err) {
    console.warn("Failed to read from primary JSON path:", err);
  }

  // Fallback to /tmp in serverless environment
  try {
    if (fs.existsSync(TMP_JSON_PATH)) {
      const data = fs.readFileSync(TMP_JSON_PATH, "utf-8");
      inMemoryRegistrations = JSON.parse(data);
      isInitialized = true;
      return inMemoryRegistrations;
    }
  } catch (err) {
    console.warn("Failed to read from tmp JSON path:", err);
  }

  isInitialized = true;
  return inMemoryRegistrations;
}

export function generateXlsxBuffer(items?: Registration[]): Buffer {
  const dataToExport = items || getRegistrations();

  // Prepare table data with proper columns for the user
  const rows = dataToExport.map((reg, index) => ({
    "SL": index + 1,
    "Registration ID": reg.id,
    "Date & Time": reg.formattedDate,
    "Name (নাম)": reg.name,
    "WhatsApp Number (হোয়াটসঅ্যাপ)": reg.whatsapp,
    "Email (ইমেইল)": reg.email,
    "bKash Number (বিকাশ নম্বর)": reg.bkash,
    "Status": reg.status, // "Ticket Not Sent" or "Ticket Sent"
    "Ticket Code": reg.ticketCode || "-",
    "Notes": reg.notes || "",
  }));

  const worksheet = XLSX.utils.json_to_sheet(rows);

  // Set column widths for beautiful excel viewing
  worksheet["!cols"] = [
    { wch: 6 },  // SL
    { wch: 18 }, // Registration ID
    { wch: 22 }, // Date & Time
    { wch: 25 }, // Name
    { wch: 20 }, // WhatsApp
    { wch: 30 }, // Email
    { wch: 20 }, // bKash
    { wch: 18 }, // Status
    { wch: 16 }, // Ticket Code
    { wch: 25 }, // Notes
  ];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Registrations");

  return XLSX.write(workbook, { type: "buffer", bookType: "xlsx" }) as Buffer;
}

export function saveRegistrationsToDisk(items: Registration[]): void {
  ensureDirectories();
  const jsonContent = JSON.stringify(items, null, 2);

  // 1. Save JSON locally
  try {
    fs.writeFileSync(JSON_FILE_PATH, jsonContent, "utf-8");
  } catch (err) {
    console.warn("Could not write to local JSON file, writing to /tmp:", err);
  }

  try {
    fs.writeFileSync(TMP_JSON_PATH, jsonContent, "utf-8");
  } catch (err) {
    console.warn("Could not write to tmp JSON file:", err);
  }

  // 2. Generate and save XLSX spreadsheet file
  const xlsxBuffer = generateXlsxBuffer(items);

  try {
    fs.writeFileSync(PRIMARY_XLSX_PATH, xlsxBuffer);
  } catch (err) {
    console.warn("Could not write to PRIMARY_XLSX_PATH:", err);
  }

  try {
    fs.writeFileSync(PUBLIC_XLSX_PATH, xlsxBuffer);
  } catch (err) {
    console.warn("Could not write to PUBLIC_XLSX_PATH:", err);
  }

  try {
    fs.writeFileSync(TMP_XLSX_PATH, xlsxBuffer);
  } catch (err) {
    console.warn("Could not write to TMP_XLSX_PATH:", err);
  }
}

export function addRegistration(input: RegisterFormInput): Registration {
  const existing = getRegistrations();

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
  const formattedDate = new Intl.DateTimeFormat("en-US", dateOptions).format(now) + " (BST)";

  const count = existing.length + 1;
  const id = `BR-${now.getFullYear()}-${count.toString().padStart(4, "0")}`;

  const newReg: Registration = {
    id,
    name: input.name.trim(),
    whatsapp: input.whatsapp.trim(),
    email: input.email.trim(),
    bkash: input.bkash.trim(),
    bkashSameAsWhatsapp: !!input.bkashSameAsWhatsapp,
    registeredAt: now.toISOString(),
    formattedDate,
    status: "Ticket Not Sent", // By default "Ticket Not Sent"
    ticketCode: "",
    notes: "",
  };

  const updated = [newReg, ...existing];
  inMemoryRegistrations = updated;
  saveRegistrationsToDisk(updated);

  return newReg;
}

export function updateRegistrationStatus(
  id: string,
  status: TicketStatus,
  ticketCode?: string,
  notes?: string
): Registration | null {
  const existing = getRegistrations();
  const index = existing.findIndex((r) => r.id === id);
  if (index === -1) return null;

  const target = existing[index];
  const updatedItem: Registration = {
    ...target,
    status,
    ticketCode: ticketCode !== undefined ? ticketCode : target.ticketCode,
    notes: notes !== undefined ? notes : target.notes,
  };

  existing[index] = updatedItem;
  inMemoryRegistrations = existing;
  saveRegistrationsToDisk(existing);

  return updatedItem;
}
