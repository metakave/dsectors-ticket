"use client";

import { useState } from "react";
import { Copy, CheckCircle, Wallet, ArrowRight, ShieldCheck } from "lucide-react";

export default function PaymentInstruction() {
  const [copied, setCopied] = useState(false);
  const bkashNumber = "01700000000"; // Example organizer bKash number, easily customizable

  const handleCopy = () => {
    navigator.clipboard.writeText(bkashNumber);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  return (
    <div className="gold-card rounded-2xl p-5 sm:p-7 border border-[#d4af37]/35 bg-[#09182d]/90 relative overflow-hidden mb-8">
      {/* Decorative gradient strip */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#d4af37] to-transparent" />

      <div className="flex items-center gap-3 mb-4">
        <div className="w-9 h-9 rounded-lg bg-[#e2136e]/20 border border-[#e2136e]/40 flex items-center justify-center text-[#e2136e] shrink-0 font-bold text-base">
          ৳
        </div>
        <div>
          <h3 className="text-lg sm:text-xl font-bold text-[#f8fafc] flex items-center gap-2">
            বিকাশ পেমেন্ট ও রেজিস্ট্রেশন পদ্ধতি
          </h3>
          <p className="text-xs sm:text-sm text-[#94a3b8]">
            অনুগ্রহ করে নিচের নিয়মে পেমেন্ট সম্পন্ন করে ফর্মটি পূরণ করুন
          </p>
        </div>
      </div>

      {/* bKash Number Box */}
      <div className="bg-[#050f1d] border border-[#d4af37]/30 rounded-xl p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-4 my-4">
        <div className="flex items-center gap-3.5 text-center sm:text-left">
          <div className="w-11 h-11 rounded-full bg-[#d4af37]/15 flex items-center justify-center text-[#e5c07b] shrink-0">
            <Wallet className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs uppercase tracking-wider text-[#d4af37] font-semibold">
              বিকাশ পার্সোনাল / মার্চেন্ট নম্বর (Send Money)
            </span>
            <div className="text-xl sm:text-2xl font-mono font-bold text-[#fef08a] tracking-wide">
              {bkashNumber}
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={handleCopy}
          className="cursor-pointer w-full sm:w-auto px-4 py-2.5 rounded-lg text-sm font-semibold flex items-center justify-center gap-2 transition-all bg-[#d4af37]/20 hover:bg-[#d4af37]/30 text-[#fef3c7] border border-[#d4af37]/50"
        >
          {copied ? (
            <>
              <CheckCircle className="w-4 h-4 text-emerald-400" />
              <span className="text-emerald-300">কপি হয়েছে!</span>
            </>
          ) : (
            <>
              <Copy className="w-4 h-4" />
              <span>নম্বর কপি করুন</span>
            </>
          )}
        </button>
      </div>

      {/* 3 Steps Guide */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-xs sm:text-sm">
        <div className="bg-[#071526]/80 p-3 rounded-lg border border-slate-800 flex items-start gap-2.5">
          <span className="w-5 h-5 rounded-full bg-[#d4af37]/20 text-[#e5c07b] font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
            ১
          </span>
          <p className="text-slate-300">
            বিকাশ থেকে টিকেটের নির্ধারিত ফি উল্লেখিত নম্বরে পাঠিয়ে দিন।
          </p>
        </div>

        <div className="bg-[#071526]/80 p-3 rounded-lg border border-slate-800 flex items-start gap-2.5">
          <span className="w-5 h-5 rounded-full bg-[#d4af37]/20 text-[#e5c07b] font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
            ২
          </span>
          <p className="text-slate-300">
            যে বিকাশ নম্বর থেকে টাকা পাঠিয়েছেন তা নিচের ফর্মে সতর্কতার সাথে লিখুন।
          </p>
        </div>

        <div className="bg-[#071526]/80 p-3 rounded-lg border border-slate-800 flex items-start gap-2.5">
          <span className="w-5 h-5 rounded-full bg-[#d4af37]/20 text-[#e5c07b] font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
            ৩
          </span>
          <p className="text-slate-300">
            ম্যানুয়াল ভেরিফিকেশনের পর আপনার ইমেইলে <strong>ডিজিটাল টিকিট</strong> পৌঁছে যাবে।
          </p>
        </div>
      </div>

      {/* Security note */}
      <div className="mt-4 flex items-center gap-2 text-xs text-[#94a3b8] bg-[#0d223f]/50 px-3 py-2 rounded-lg border border-slate-700/50">
        <ShieldCheck className="w-4 h-4 text-[#e5c07b] shrink-0" />
        <span>
          পেমেন্ট ভেরিফিকেশন সাপেক্ষে প্রত্যেক নিবন্ধিত দর্শককে আসন নম্বর সংবলিত ডিজিটাল পাস পাঠানো হবে।
        </span>
      </div>
    </div>
  );
}
