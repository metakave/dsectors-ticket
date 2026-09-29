export type TicketStatus = "Ticket Not Sent" | "Ticket Sent";

export interface Registration {
  id: string; // e.g. BR-2026-0001
  name: string; // নাম
  whatsapp: string; // হোয়াটসঅ্যাপ নম্বর
  email: string; // ইমেইল
  bkash: string; // টাকা পাঠানোর বিকাশ নম্বর
  bkashSameAsWhatsapp?: boolean;
  registeredAt: string; // ISO String
  formattedDate: string; // e.g. 29 Sep 2026, 10:30 AM (BST)
  status: TicketStatus; // "Ticket Not Sent" by default
  ticketCode?: string;
  notes?: string;
}

export interface RegisterFormInput {
  name: string;
  whatsapp: string;
  email: string;
  bkash: string;
  bkashSameAsWhatsapp?: boolean;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
}
