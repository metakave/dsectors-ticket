import { Metadata } from "next";
import AdminPanel from "@/components/AdminPanel";

export const metadata: Metadata = {
  title: "অ্যাডমিন প্যানেল | বিমূর্ত রাত্রি",
  description: "টিকিট নিবন্ধন তালিকা ও ডাটাবেজ অ্যাডমিন ড্যাশবোর্ড",
};

export default function AdminPage() {
  return (
    <main className="min-h-screen bg-[#06111f] text-slate-100">
      <AdminPanel />
    </main>
  );
}
