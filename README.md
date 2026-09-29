# শব্দ ও সুরে বিমূর্ত রাত্রি (Bimurto Ratri) - Ticket Registration & Management

A high-performance, responsive event landing page and ticketing management system built with **Next.js (App Router)**, **Tailwind CSS**, **SheetJS (XLSX)**, and **Nodemailer**. Designed to run on **Vercel Free Tier (Serverless)** with zero server maintenance.

---

## ✨ Features

- **Hero Banner**: Displays `ratri.jpeg` framed with gold borders seamlessly matching the dark navy backdrop (`#06111f`).
- **Bengali Form**:
  - নাম (Full Name)
  - হোয়াটসঅ্যাপ নম্বর (WhatsApp Number)
  - ইমেইল (Email - *ডিজিটাল টিকিট পেতে আবশ্যক*)
  - টাকা পাঠানোর বিকাশ নম্বর (bKash Number)
  - ✅ **"হোয়াটসঅ্যাপ নম্বরের মতো একই"** Checkbox (Auto-syncs bKash number with WhatsApp number)
  - Submit button with Bengali loading and celebratory confetti feedback.
- **Excel (.xlsx) Database**:
  - Automatically appends every registration into an Excel spreadsheet.
  - Leaves a default **Status** column with `"Ticket Not Sent"` (which can be updated to `"Ticket Sent"`).
  - Can be downloaded anytime at `/api/export-xlsx` or via the Admin Dashboard.
- **Full Path to Excel File**:
  - `/Users/sadiq/antigravity/ticket-dsectors/data/registrations.xlsx`
  - (Also available under `public/downloads/registrations.xlsx`)
- **Dual Email Notification System (Nodemailer SMTP)**:
  1. **Registrant Confirmation Email**: Premium luxury HTML email confirming receipt, detailing submission info, and informing them that their digital ticket will be sent after manual bKash verification.
  2. **Admin Alert Email**: Notification to organizers with registrant info, highlighted bKash number for quick verification, direct link to admin panel, and link to download the updated Excel file.
- **Admin Management Panel (`/admin`)**:
  - Secure passcode access (Default: `admin123`).
  - Total, Pending ("Ticket Not Sent"), and Sent ("Ticket Sent") counters.
  - Status toggle buttons.
  - Search by Name, WhatsApp, bKash, or Email.
  - Direct WhatsApp chat link for each applicant.
  - Instant One-Click Excel `.xlsx` download.

---

## 🚀 Running Locally

```bash
# Start development server
npm run dev

# Visit in browser
http://localhost:3000
http://localhost:3000/admin (Passcode: admin123)
```

---

## ⚙️ Environment Variables (`.env.local`)

Copy `.env.example` to `.env.local` to configure live SMTP sending:

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_FROM="শব্দ ও সুরে বিমূর্ত রাত্রি" <noreply@bimurtoratri.com>
ADMIN_EMAIL=organizer@example.com
ADMIN_PASSCODE=admin123
```

*(Note: If SMTP credentials are left empty, the application runs in simulation mode without crashing)*.

---

## 🌐 Deploy to Vercel (Free Plan)

1. Push your repository to GitHub / GitLab.
2. Import project into [Vercel](https://vercel.com).
3. Set your environment variables (`SMTP_HOST`, `SMTP_USER`, `SMTP_PASS`, `ADMIN_EMAIL`, etc.).
4. Click **Deploy**. Vercel will build and serve the application globally with serverless execution.
