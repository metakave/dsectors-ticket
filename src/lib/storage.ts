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

// In-memory cache for fast access
let inMemoryRegistrations: Registration[] = [];
let isCacheLoaded = false;

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
    // Read-only file system on Vercel is expected
  }
}

// -------------------------------------------------------------
// Cloud KV / Upstash Persistence (Zero-dependency REST API)
// -------------------------------------------------------------
function getKvConfig() {
  const url =
    process.env.KV_REST_API_URL ||
    process.env.UPSTASH_REDIS_REST_URL ||
    process.env.REDIS_REST_URL;
  const token =
    process.env.KV_REST_API_TOKEN ||
    process.env.UPSTASH_REDIS_REST_TOKEN ||
    process.env.REDIS_REST_TOKEN;

  if (url && token) {
    return { url: url.replace(/\/$/, ""), token };
  }
  return null;
}

async function fetchFromCloudKv(): Promise<Registration[] | null> {
  const kv = getKvConfig();
  if (!kv) return null;

  try {
    const res = await fetch(`${kv.url}/get/registrations`, {
      headers: {
        Authorization: `Bearer ${kv.token}`,
      },
      cache: "no-store",
    });

    if (!res.ok) return null;
    const json = await res.json();
    if (!json || json.result === null || json.result === undefined) return null;

    let items: Registration[] = [];
    if (typeof json.result === "string") {
      items = JSON.parse(json.result);
    } else if (Array.isArray(json.result)) {
      items = json.result;
    }
    return Array.isArray(items) ? items : null;
  } catch (err) {
    console.warn("⚠️ Cloud KV read error:", err);
    return null;
  }
}

async function saveToCloudKv(items: Registration[]): Promise<boolean> {
  const kv = getKvConfig();
  if (!kv) return false;

  try {
    const res = await fetch(`${kv.url}/set/registrations`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${kv.token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(items),
    });
    return res.ok;
  } catch (err) {
    console.warn("⚠️ Cloud KV write error:", err);
    return false;
  }
}

// -------------------------------------------------------------
// Core Storage Functions (Sync & Async)
// -------------------------------------------------------------
export function getXlsxFilePath(): string {
  if (fs.existsSync(PRIMARY_XLSX_PATH)) {
    return PRIMARY_XLSX_PATH;
  }
  if (fs.existsSync(PUBLIC_XLSX_PATH)) {
    return PUBLIC_XLSX_PATH;
  }
  return TMP_XLSX_PATH;
}

export function readRegistrationsFromDisk(): Registration[] {
  // 1. Try reading from primary local file
  try {
    if (fs.existsSync(JSON_FILE_PATH)) {
      const data = fs.readFileSync(JSON_FILE_PATH, "utf-8");
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (err) {
    // Ignore read errors
  }

  // 2. Try reading from /tmp fallback
  try {
    if (fs.existsSync(TMP_JSON_PATH)) {
      const data = fs.readFileSync(TMP_JSON_PATH, "utf-8");
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (err) {
    // Ignore
  }

  return [];
}

export function getRegistrations(): Registration[] {
  if (isCacheLoaded && inMemoryRegistrations.length > 0) {
    return inMemoryRegistrations;
  }

  const diskItems = readRegistrationsFromDisk();
  if (diskItems.length > 0) {
    inMemoryRegistrations = diskItems;
    isCacheLoaded = true;
    return diskItems;
  }

  return inMemoryRegistrations;
}

export async function getRegistrationsAsync(): Promise<Registration[]> {
  // 1. Try cloud KV first for serverless multi-instance sync
  const cloudItems = await fetchFromCloudKv();
  if (cloudItems) {
    inMemoryRegistrations = cloudItems;
    isCacheLoaded = true;
    // Also update /tmp locally
    try {
      fs.writeFileSync(TMP_JSON_PATH, JSON.stringify(cloudItems, null, 2), "utf-8");
    } catch {
      // ignore
    }
    return cloudItems;
  }

  // 2. Fallback to disk / memory
  return getRegistrations();
}

export function generateXlsxBuffer(items?: Registration[]): Buffer {
  const dataToExport = items || getRegistrations();

  const columns = [
    "SL",
    "Registration ID",
    "Date & Time",
    "Name (নাম)",
    "WhatsApp Number (হোয়াটসঅ্যাপ)",
    "Email (ইমেইল)",
    "bKash Number (বিকাশ নম্বর)",
    "Status",
    "Ticket Code",
    "Notes",
  ];

  const rows = dataToExport.map((reg, index) => ({
    "SL": index + 1,
    "Registration ID": reg.id,
    "Date & Time": reg.formattedDate,
    "Name (নাম)": reg.name,
    "WhatsApp Number (হোয়াটসঅ্যাপ)": reg.whatsapp,
    "Email (ইমেইল)": reg.email,
    "bKash Number (বিকাশ নম্বর)": reg.bkash,
    "Status": reg.status,
    "Ticket Code": reg.ticketCode || "-",
    "Notes": reg.notes || "",
  }));

  const worksheet = XLSX.utils.json_to_sheet(rows, { header: columns });

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
  inMemoryRegistrations = items;
  isCacheLoaded = true;

  ensureDirectories();
  const jsonContent = JSON.stringify(items, null, 2);

  // 1. Save JSON locally
  try {
    fs.writeFileSync(JSON_FILE_PATH, jsonContent, "utf-8");
  } catch (err) {
    // Expected on Vercel (read-only filesystem)
  }

  try {
    fs.writeFileSync(TMP_JSON_PATH, jsonContent, "utf-8");
  } catch (err) {
    // Ignore
  }

  // 2. Generate and save XLSX spreadsheet file
  const xlsxBuffer = generateXlsxBuffer(items);

  try {
    fs.writeFileSync(PRIMARY_XLSX_PATH, xlsxBuffer);
  } catch (err) {
    // Ignore
  }

  try {
    fs.writeFileSync(PUBLIC_XLSX_PATH, xlsxBuffer);
  } catch (err) {
    // Ignore
  }

  try {
    fs.writeFileSync(TMP_XLSX_PATH, xlsxBuffer);
  } catch (err) {
    // Ignore
  }
}

export async function saveRegistrationsAsync(items: Registration[]): Promise<void> {
  saveRegistrationsToDisk(items);
  // Also async persist to Cloud KV if configured
  await saveToCloudKv(items);
}

export async function addRegistrationAsync(input: RegisterFormInput): Promise<Registration> {
  const existing = await getRegistrationsAsync();

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
    status: "Ticket Not Sent",
    ticketCode: "",
    notes: "",
  };

  const updated = [newReg, ...existing];
  await saveRegistrationsAsync(updated);

  return newReg;
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
  const formattedDate =
    new Intl.DateTimeFormat("en-US", dateOptions).format(now) + " (BST)";

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
    status: "Ticket Not Sent",
    ticketCode: "",
    notes: "",
  };

  const updated = [newReg, ...existing];
  saveRegistrationsToDisk(updated);

  // Trigger non-blocking cloud KV update if available
  saveToCloudKv(updated).catch(() => {});

  return newReg;
}

export async function updateRegistrationStatusAsync(
  id: string,
  status: TicketStatus,
  ticketCode?: string,
  notes?: string
): Promise<Registration | null> {
  const existing = await getRegistrationsAsync();
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
  await saveRegistrationsAsync(existing);

  return updatedItem;
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
  saveRegistrationsToDisk(existing);
  saveToCloudKv(existing).catch(() => {});

  return updatedItem;
}
