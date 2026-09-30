"use client";

import { useState } from "react";
import { Copy, CheckCircle, Wallet, Tag, Info } from "lucide-react";

export default function PaymentInstruction() {
  const [copied, setCopied] = useState(false);
  const bkashNumber = "01717662350";

  const handleCopy = () => {
    navigator.clipboard.writeText(bkashNumber);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  return (
    <div className="gold-card rounded-2xl p-5 sm:p-7 border border-[#d4af37]/40 bg-[#09182d]/95 relative overflow-hidden mb-8 shadow-2xl">
      {/* Decorative gradient top bar */}
      <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-transparent via-[#d4af37] to-transparent" />

      {/* Title Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#e2136e]/20 border border-[#e2136e]/40 flex items-center justify-center text-[#e2136e] shrink-0 font-bold text-lg">
            ৳
          </div>
          <div>
            <h3 className="text-lg sm:text-xl font-bold text-[#f8fafc] flex items-center gap-2">
              বিকাশ পেমেন্ট নির্দেশিকা (bKash Payment)
            </h3>
            <p className="text-sm sm:text-base text-slate-300">
              নিচের নিয়মে Send Money সম্পন্ন করে ফর্মটি পূরণ করুন
            </p>
          </div>
        </div>

        {/* Amount Badge */}
        <div className="inline-flex items-center gap-2 bg-[#d4af37]/20 border border-[#d4af37]/50 px-4 py-2 rounded-xl text-sm sm:text-base font-bold text-[#fef08a] w-fit">
          <Tag className="w-4 h-4 text-[#e5c07b]" />
          <span>টিকিট ফি: প্রতি টিকিট ৳ ৫০০ (500 Tk / Ticket)</span>
        </div>
      </div>

      {/* bKash Number Highlight Box */}
      <div className="bg-[#050f1d] border-2 border-[#d4af37]/40 rounded-xl p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-4 my-3 shadow-inner">
        <div className="flex items-center gap-3.5 text-center sm:text-left w-full sm:w-auto">
          <div className="w-12 h-12 rounded-xl bg-[#d4af37]/15 border border-[#d4af37]/30 flex items-center justify-center text-[#e5c07b] shrink-0">
            <Wallet className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs uppercase tracking-wider text-[#d4af37] font-semibold block">
              বিকাশে Send Money করুন (Personal Number)
            </span>
            <div className="text-2xl sm:text-3xl font-mono font-bold text-[#fef08a] tracking-wider">
              {bkashNumber}
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={handleCopy}
          className="cursor-pointer w-full sm:w-auto px-5 py-3 rounded-xl text-sm sm:text-base font-bold flex items-center justify-center gap-2 transition-all bg-[#d4af37] hover:bg-[#e5c07b] text-[#071526] shadow-md shadow-[#d4af37]/20"
        >
          {copied ? (
            <>
              <CheckCircle className="w-4 h-4 text-[#071526]" />
              <span>নম্বর কপি হয়েছে!</span>
            </>
          ) : (
            <>
              <Copy className="w-4 h-4" />
              <span>নম্বর কপি করুন</span>
            </>
          )}
        </button>
      </div>

      {/* Specific user requested instructions with increased font size */}
      <div className="mt-4 p-4 sm:p-5 rounded-xl bg-[#071930] border border-[#d4af37]/30 text-sm sm:text-base text-slate-200 space-y-3">
        <div className="flex items-start gap-3">
          <span className="w-6 h-6 rounded-full bg-[#d4af37]/25 text-[#fef08a] font-bold text-xs sm:text-sm flex items-center justify-center shrink-0 mt-0.5">
            ১
          </span>
          <p className="leading-relaxed">
            বিকাশে <strong className="text-[#fef08a]">Send Money</strong> অপশনে গিয়ে এই নাম্বারে <strong className="text-[#fef08a] font-mono font-bold">{bkashNumber}</strong> বিকাশ করুন। <strong className="text-[#e5c07b]">(প্রতি টিকিট ৫০০ টাকা হারে নির্ধারিত মোট ফি)</strong>
          </p>
        </div>

        <div className="flex items-start gap-3">
          <span className="w-6 h-6 rounded-full bg-[#d4af37]/25 text-[#fef08a] font-bold text-xs sm:text-sm flex items-center justify-center shrink-0 mt-0.5">
            ২
          </span>
          <p className="leading-relaxed">
            বিকাশ সেন্ড মানি করার সময়ে <strong className="text-[#fef08a]">Reference</strong> এ আপনার নাম লিখুন।
          </p>
        </div>

        <div className="flex items-start gap-3">
          <span className="w-6 h-6 rounded-full bg-[#d4af37]/25 text-[#fef08a] font-bold text-xs sm:text-sm flex items-center justify-center shrink-0 mt-0.5">
            ৩
          </span>
          <p className="leading-relaxed">
            পেমেন্ট ভেরিফিকেশনের পর আপনাদের ইমেইলে <strong>ডিজিটাল টিকিট</strong> পাঠানো হবে।
          </p>
        </div>
      </div>

      {/* Reference & Security note */}
      <div className="mt-3 flex items-center gap-2 text-xs sm:text-sm text-[#94a3b8] bg-[#050f1d]/70 px-3.5 py-2.5 rounded-lg border border-slate-800">
        <Info className="w-4 h-4 text-[#e5c07b] shrink-0" />
        <span>
          টাকা পাঠানো সম্পন্ন হলে নিচের ফর্মে আপনার নাম, যোগাযোগের নম্বর ও প্রেরক বিকাশ নম্বর প্রদান করুন।
        </span>
      </div>
    </div>
  );
}
