"use client";

import { useState, useTransition } from "react";
import confetti from "canvas-confetti";
import {
  User,
  Phone,
  Mail,
  Smartphone,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Ticket,
  Sparkles,
  RefreshCw,
  Send,
  Plus,
  Minus,
} from "lucide-react";
import { RegisterFormInput, Registration } from "@/lib/types";

export default function RegistrationForm() {
  const [name, setName] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [email, setEmail] = useState("");
  const [bkash, setBkash] = useState("");
  const [bkashSameAsWhatsapp, setBkashSameAsWhatsapp] = useState(false);
  const [ticketCount, setTicketCount] = useState<number>(1);

  const [isPending, startTransition] = useTransition();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successData, setSuccessData] = useState<{
    registration: Registration;
    downloadUrl: string;
  } | null>(null);

  const perTicketPrice = 500;
  const totalAmount = ticketCount * perTicketPrice;

  // Handle ticket count stepper
  const handleDecrement = () => {
    setTicketCount((prev) => Math.max(1, prev - 1));
  };

  const handleIncrement = () => {
    setTicketCount((prev) => prev + 1);
  };

  const handleTicketChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value, 10);
    if (isNaN(val) || val < 1) {
      setTicketCount(1);
    } else {
      setTicketCount(Math.min(100, val));
    }
  };

  // Handle WhatsApp change: Only accept numbers, max 11 digits, and auto-sync bKash if checked
  const handleWhatsappChange = (val: string) => {
    const digitsOnly = val.replace(/\D/g, "").slice(0, 11);
    setWhatsapp(digitsOnly);
    if (bkashSameAsWhatsapp) {
      setBkash(digitsOnly);
    }
  };

  // Handle bKash change: Only accept numbers, max 11 digits
  const handleBkashChange = (val: string) => {
    const digitsOnly = val.replace(/\D/g, "").slice(0, 11);
    setBkash(digitsOnly);
    if (bkashSameAsWhatsapp && digitsOnly !== whatsapp) {
      setBkashSameAsWhatsapp(false);
    }
  };

  // Handle "Same as WhatsApp" Checkbox toggle
  const handleCheckboxToggle = (checked: boolean) => {
    setBkashSameAsWhatsapp(checked);
    if (checked) {
      setBkash(whatsapp);
    }
  };

  const triggerConfetti = () => {
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ["#d4af37", "#fef08a", "#38bdf8", "#ffffff"],
      });
    } catch {
      // ignore
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const trimmedName = name.trim();
    const cleanWhatsapp = whatsapp.replace(/\D/g, "");
    const cleanBkash = bkash.replace(/\D/g, "");
    const trimmedEmail = email.trim();

    // 1. Name validation
    if (!trimmedName) {
      setErrorMsg("অনুগ্রহ করে আপনার পুরো নাম লিখুন।");
      return;
    }

    // 2. WhatsApp Number validation (Must start with 0 and be exactly 11 digits)
    const phoneRegex = /^0\d{10}$/;
    if (!phoneRegex.test(cleanWhatsapp)) {
      setErrorMsg(
        "হোয়াটসঅ্যাপ নম্বরটি অবশ্যই 0 দিয়ে শুরু এবং ঠিক ১১ ডিজিট সংখ্যার হতে হবে (যেমন: 017XXXXXXXX)।"
      );
      return;
    }

    // 3. Email validation
    if (!trimmedEmail || !trimmedEmail.includes("@") || !trimmedEmail.includes(".")) {
      setErrorMsg("ডিজিটাল টিকিট পেতে অনুগ্রহ করে একটি সঠিক ইমেইল প্রদান করুন।");
      return;
    }

    // 4. Ticket Count validation
    if (ticketCount < 1) {
      setErrorMsg("টিকিটের সংখ্যা কমপক্ষে ১টি হতে হবে।");
      return;
    }

    // 5. bKash Number validation (Must start with 0 and be exactly 11 digits)
    if (!phoneRegex.test(cleanBkash)) {
      setErrorMsg(
        "টাকা পাঠানোর বিকাশ নম্বরটি অবশ্যই 0 দিয়ে শুরু এবং ঠিক ১১ ডিজিট সংখ্যার হতে হবে (যেমন: 01XXXXXXXXX)।"
      );
      return;
    }

    startTransition(async () => {
      try {
        const payload: RegisterFormInput = {
          name: name.trim(),
          whatsapp: whatsapp.trim(),
          email: email.trim(),
          bkash: bkash.trim(),
          bkashSameAsWhatsapp,
          ticketCount,
          totalAmount,
        };

        const res = await fetch("/api/register", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        });

        const json = await res.json();

        if (!res.ok || !json.success) {
          setErrorMsg(json.error || "নিবন্ধন সম্পন্ন করতে সমস্যা হয়েছে। আবার চেষ্টা করুন।");
          return;
        }

        setSuccessData(json.data);
        triggerConfetti();

        // Smoothly scroll into view just above the submit button
        setTimeout(() => {
          const el = document.getElementById("submission-success-banner");
          if (el) {
            el.scrollIntoView({ behavior: "smooth", block: "center" });
          }
        }, 100);
      } catch {
        setErrorMsg("সার্ভারের সাথে সংযোগ স্থাপন করা যায়নি। অনুগ্রহ করে কিছুক্ষণ পর আবার চেষ্টা করুন।");
      }
    });
  };

  const handleReset = () => {
    setName("");
    setWhatsapp("");
    setEmail("");
    setBkash("");
    setBkashSameAsWhatsapp(false);
    setTicketCount(1);
    setErrorMsg(null);
    setSuccessData(null);
  };

  return (
    <div id="registration-section" className="scroll-mt-10">
      <div className="gold-card rounded-2xl p-6 sm:p-10 border border-[#d4af37]/40 bg-[#091b33]/90 relative overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 bg-[#d4af37]/15 border border-[#d4af37]/40 px-4 py-1.5 rounded-full text-xs sm:text-sm font-bold text-[#fef3c7] mb-3">
            <Ticket className="w-4 h-4 text-[#e5c07b]" />
            <span>টিকিট বুকিং ফর্ম</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-serif-bn font-bold text-[#fef08a]">
            আপনার তথ্য প্রদান করুন
          </h2>
          <p className="text-sm sm:text-base text-slate-300 mt-2">
            ডিজিটাল টিকিট পেতে সঠিক তথ্য দিয়ে নিচের ফর্মটি পূরণ করুন
          </p>
        </div>

        {/* Top Error Message Alert */}
        {errorMsg && (
          <div className="mb-6 p-4 rounded-xl bg-rose-950/70 border border-rose-500/50 text-rose-200 text-sm sm:text-base flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* 1. Name Field */}
          <div>
            <label
              htmlFor="name"
              className="text-base sm:text-lg font-bold text-slate-100 mb-2 flex items-center justify-between"
            >
              <span className="flex items-center gap-2">
                <User className="w-5 h-5 text-[#e5c07b]" />
                <span>নাম (Name)</span>
                <span className="text-rose-400">*</span>
              </span>
              <span className="text-xs sm:text-sm text-slate-400 font-normal">
                আবেদনকারীর পুরো নাম
              </span>
            </label>
            <div className="relative">
              <input
                id="name"
                type="text"
                required
                placeholder="যেমন: কাজী নজরুল ইসলাম"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="form-input w-full px-4.5 py-3.5 rounded-xl text-base sm:text-lg font-medium placeholder:text-slate-500"
              />
            </div>
          </div>

          {/* 2. WhatsApp Number Field */}
          <div>
            <label
              htmlFor="whatsapp"
              className="text-base sm:text-lg font-bold text-slate-100 mb-2 flex items-center justify-between"
            >
              <span className="flex items-center gap-2">
                <Phone className="w-5 h-5 text-[#e5c07b]" />
                <span>হোয়াটসঅ্যাপ নম্বর (WhatsApp Number)</span>
                <span className="text-rose-400">*</span>
              </span>
              <span className="text-xs sm:text-sm text-slate-400 font-normal">
                ১১ ডিজিট (01XXXXXXXXX)
              </span>
            </label>
            <div className="relative">
              <input
                id="whatsapp"
                type="tel"
                inputMode="numeric"
                pattern="0[0-9]{10}"
                maxLength={11}
                required
                placeholder="01XXXXXXXXX (১১ ডিজিট)"
                value={whatsapp}
                onChange={(e) => handleWhatsappChange(e.target.value)}
                className="form-input w-full px-4.5 py-3.5 rounded-xl text-base sm:text-lg font-medium placeholder:text-slate-500 font-mono tracking-wider"
              />
            </div>
            <p className="text-xs text-slate-400 mt-1">
              অবশ্যই 0 দিয়ে শুরু ১১ ডিজিটের মোবাইল নম্বর হতে হবে (শুধুমাত্র সংখ্যা)।
            </p>
          </div>

          {/* 3. Email Field */}
          <div>
            <label
              htmlFor="email"
              className="text-base sm:text-lg font-bold text-slate-100 mb-2 flex flex-wrap items-center justify-between gap-2"
            >
              <span className="flex items-center gap-2">
                <Mail className="w-5 h-5 text-[#e5c07b]" />
                <span>ইমেইল (Email)</span>
                <span className="text-rose-400">*</span>
              </span>
              <span className="text-xs sm:text-sm text-[#fef08a] bg-[#d4af37]/20 px-2.5 py-0.5 rounded border border-[#d4af37]/40 font-semibold">
                ডিজিটাল টিকিট পেতে আবশ্যক
              </span>
            </label>
            <div className="relative">
              <input
                id="email"
                type="email"
                required
                placeholder="যেমন: yourname@gmail.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="form-input w-full px-4.5 py-3.5 rounded-xl text-base sm:text-lg font-medium placeholder:text-slate-500"
              />
            </div>
            <p className="text-xs sm:text-sm text-slate-400 mt-1.5">
              ভেরিফিকেশন সম্পন্ন হওয়ার পর এই ইমেইল ঠিকানায় আপনার ডিজিটাল ই-টিকিট প্রেরণ করা হবে।
            </p>
          </div>

          {/* 4. কয়টি টিকিট (Quantity of Ticket) */}
          <div className="p-4 sm:p-5 rounded-xl bg-[#061426] border border-[#d4af37]/40 shadow-inner">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 mb-3">
              <label
                htmlFor="ticketCount"
                className="text-base sm:text-lg font-bold text-slate-100 flex items-center gap-2"
              >
                <Ticket className="w-5 h-5 text-[#e5c07b]" />
                <span>কয়টি টিকিট (Quantity of Ticket)</span>
                <span className="text-rose-400">*</span>
              </label>
              <span className="text-xs sm:text-sm text-slate-300 font-medium">
                প্রতি টিকিট ফি: ৳ ৫০০ (Per Ticket: 500 Tk)
              </span>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              {/* Stepper with - on left, input in center, + on right */}
              <div className="flex items-center shadow-md">
                <button
                  type="button"
                  onClick={handleDecrement}
                  disabled={ticketCount <= 1}
                  className="w-12 h-12 rounded-l-xl bg-[#0a1e38] hover:bg-[#d4af37]/25 active:bg-[#d4af37]/40 border border-[#d4af37]/40 border-r-0 text-[#fef08a] text-2xl font-bold flex items-center justify-center transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed select-none"
                  aria-label="টিকিট কমান"
                >
                  <Minus className="w-5 h-5 text-[#fef08a]" />
                </button>
                <input
                  id="ticketCount"
                  type="number"
                  min={1}
                  max={100}
                  value={ticketCount}
                  onChange={handleTicketChange}
                  className="w-20 sm:w-24 h-12 text-center font-mono font-bold text-xl sm:text-2xl text-[#fef08a] bg-[#040c18] border-y border-[#d4af37]/40 focus:outline-none focus:border-[#d4af37] [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                />
                <button
                  type="button"
                  onClick={handleIncrement}
                  className="w-12 h-12 rounded-r-xl bg-[#0a1e38] hover:bg-[#d4af37]/25 active:bg-[#d4af37]/40 border border-[#d4af37]/40 border-l-0 text-[#fef08a] text-2xl font-bold flex items-center justify-center transition-colors cursor-pointer select-none"
                  aria-label="টিকিট বাড়ান"
                >
                  <Plus className="w-5 h-5 text-[#fef08a]" />
                </button>
              </div>

              {/* Dynamic Calculated Amount Badge */}
              <div className="bg-[#0b2242] border border-[#d4af37]/50 rounded-xl px-4 py-2.5 flex items-center justify-between sm:justify-end gap-3 shadow-lg">
                <span className="text-xs sm:text-sm text-slate-300 font-medium">
                  মোট পরিশোধযোগ্য ফি:
                </span>
                <div className="text-xl sm:text-2xl font-mono font-extrabold text-[#fef08a] flex items-center gap-1.5">
                  <span>৳</span>
                  <span>{totalAmount.toLocaleString()}</span>
                  <span className="text-xs text-slate-400 font-normal font-sans ml-1">
                    ({ticketCount} × ৫০০)
                  </span>
                </div>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-[#e5c07b] mt-3 flex items-center gap-1.5">
              <span>💡</span>
              <span>
                {ticketCount} টি টিকিটের জন্য সর্বমোট <strong>৳ {totalAmount.toLocaleString()}</strong> টাকা সেন্ড মানি করুন।
              </span>
            </p>
          </div>

          {/* 5. bKash Number & Checkbox */}
          <div className="pt-1">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 mb-2">
              <label
                htmlFor="bkash"
                className="text-base sm:text-lg font-bold text-slate-100 flex items-center gap-2"
              >
                <Smartphone className="w-5 h-5 text-[#e5c07b]" />
                <span>টাকা পাঠানোর বিকাশ নম্বর (bKash Number)</span>
                <span className="text-rose-400">*</span>
              </label>

              {/* Checkbox: Same as WhatsApp */}
              <label className="inline-flex items-center gap-2.5 cursor-pointer text-sm sm:text-base text-[#e5c07b] hover:text-[#fef08a] font-medium transition-colors select-none py-1">
                <input
                  type="checkbox"
                  checked={bkashSameAsWhatsapp}
                  onChange={(e) => handleCheckboxToggle(e.target.checked)}
                  className="w-4.5 h-4.5 rounded border-[#d4af37] bg-[#071526] text-[#d4af37] focus:ring-[#d4af37] focus:ring-offset-0 cursor-pointer accent-[#d4af37]"
                />
                <span>হোয়াটসঅ্যাপ নম্বরের মতো একই (Same as WhatsApp)</span>
              </label>
            </div>

            <div className="relative">
              <input
                id="bkash"
                type="tel"
                inputMode="numeric"
                pattern="0[0-9]{10}"
                maxLength={11}
                required
                placeholder="01XXXXXXXXX (যে নম্বর থেকে টাকা পাঠিয়েছেন)"
                value={bkash}
                onChange={(e) => handleBkashChange(e.target.value)}
                className="form-input w-full px-4.5 py-3.5 rounded-xl text-base sm:text-lg font-medium placeholder:text-slate-500 font-mono tracking-wider"
              />
            </div>
            <p className="text-xs text-slate-400 mt-1">
              যে বিকাশ নম্বর থেকে সর্বমোট <strong>{totalAmount.toLocaleString()}</strong> টাকা সেন্ড মানি করা হয়েছে (0 দিয়ে শুরু ১১ ডিজিট)।
            </p>
          </div>

          {/* Error Message Just Above Submit Button */}
          {errorMsg && (
            <div className="p-4 rounded-xl bg-rose-950/80 border border-rose-500/60 text-rose-200 text-sm sm:text-base flex items-start gap-3 animate-in fade-in">
              <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* SUCCESS MESSAGE BANNER: Appears just above the submit button */}
          {successData && (
            <div
              id="submission-success-banner"
              tabIndex={-1}
              className="p-5 sm:p-7 rounded-2xl bg-gradient-to-b from-[#072418] via-[#051a11] to-[#03110b] border-2 border-emerald-400/90 text-white shadow-[0_0_35px_rgba(16,185,129,0.35)] animate-in fade-in zoom-in-95 duration-500"
            >
              <div className="flex items-start gap-3.5 mb-4">
                <div className="w-12 h-12 rounded-full bg-emerald-500/20 border-2 border-emerald-400 flex items-center justify-center shrink-0 text-emerald-300 shadow-[0_0_20px_rgba(52,211,153,0.4)]">
                  <CheckCircle2 className="w-7 h-7 text-emerald-400" />
                </div>
                <div>
                  <div className="inline-block bg-emerald-500/20 border border-emerald-400/50 px-3 py-1 rounded-full text-xs font-bold text-emerald-300 mb-1">
                    ✓ নিবন্ধন সফলভাবে গ্রহণ করা হয়েছে (Registration Successful)
                  </div>
                  <h3 className="text-xl sm:text-2xl font-serif-bn font-bold text-[#fef08a]">
                    ধন্যবাদ, {successData.registration.name}!
                  </h3>
                  <p className="text-slate-200 text-sm sm:text-base mt-1 leading-relaxed">
                    আপনার টিকিট নিবন্ধন সফলভাবে গ্রহণ করা হয়েছে। আমাদের টিম আপনার বিকাশ পেমেন্ট ম্যানুয়ালি যাচাই করার পর আপনার প্রদত্ত ইমেইলে (<span className="text-[#38bdf8] font-bold">{successData.registration.email}</span>) ডিজিটাল টিকিট পাঠিয়ে দেবে।
                  </p>
                </div>
              </div>

              {/* Registration Details Summary Card */}
              <div className="bg-[#020b07] border border-emerald-500/40 rounded-xl p-4 sm:p-5 text-sm sm:text-base space-y-2.5 mb-4">
                <div className="flex justify-between items-center pb-2.5 border-b border-emerald-950/80">
                  <span className="text-slate-400 font-medium">রেজিস্ট্রেশন আইডি:</span>
                  <span className="font-mono font-bold text-[#fef08a] bg-[#d4af37]/20 px-3 py-1 rounded border border-[#d4af37]/40 text-base">
                    {successData.registration.id}
                  </span>
                </div>
                <div className="flex justify-between items-center py-1">
                  <span className="text-slate-400 font-medium">টিকিট সংখ্যা:</span>
                  <span className="font-bold text-white text-base">
                    {successData.registration.ticketCount || ticketCount} টি
                  </span>
                </div>
                <div className="flex justify-between items-center py-1">
                  <span className="text-slate-400 font-medium">মোট পরিশোধিত ফি:</span>
                  <span className="font-mono font-bold text-[#fef08a] text-lg">
                    ৳ {(successData.registration.totalAmount || totalAmount).toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between items-center py-1">
                  <span className="text-slate-400 font-medium">হোয়াটসঅ্যাপ নম্বর:</span>
                  <span className="font-semibold text-slate-100">
                    {successData.registration.whatsapp}
                  </span>
                </div>
                <div className="flex justify-between items-center py-1">
                  <span className="text-slate-400 font-medium">বিকাশ নম্বর:</span>
                  <span className="font-semibold text-[#fde047] font-mono">
                    {successData.registration.bkash}
                  </span>
                </div>
                <div className="flex justify-between items-center pt-2.5 border-t border-emerald-950/80">
                  <span className="text-slate-400 font-medium">বর্তমান স্ট্যাটাস:</span>
                  <span className="font-bold text-amber-400 flex items-center gap-1.5 text-xs sm:text-sm">
                    <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
                    পেমেন্ট ভেরিফিকেশন সাপেক্ষে (Pending)
                  </span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
                <p className="text-xs text-emerald-300/90 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>ইমেইলে প্রাপ্তি স্বীকার পাঠানো হয়েছে। স্প্যাম ফোল্ডারও চেক করতে পারেন।</span>
                </p>
                <button
                  type="button"
                  onClick={handleReset}
                  className="cursor-pointer w-full sm:w-auto px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-[#fef08a] text-xs sm:text-sm font-bold flex items-center justify-center gap-2 border border-slate-700 transition-colors shrink-0"
                >
                  <RefreshCw className="w-4 h-4" />
                  <span>নতুন টিকিট নিবন্ধন করুন</span>
                </button>
              </div>
            </div>
          )}

          {/* Submit Button */}
          <div className="pt-3">
            {successData ? (
              <button
                type="button"
                onClick={handleReset}
                className="cursor-pointer w-full py-4.5 rounded-xl font-bold text-lg sm:text-xl flex items-center justify-center gap-3 transition-all bg-emerald-700 hover:bg-emerald-600 text-white shadow-2xl border border-emerald-400/50"
              >
                <CheckCircle2 className="w-6 h-6 text-white" />
                <span>নিবন্ধন সফল হয়েছে • আরেকটি টিকিট নিবন্ধন করুন</span>
              </button>
            ) : (
              <button
                type="submit"
                disabled={isPending}
                className="gold-btn cursor-pointer w-full py-4.5 rounded-xl font-bold text-lg sm:text-xl flex items-center justify-center gap-3 transition-all disabled:opacity-60 disabled:cursor-not-allowed group shadow-2xl"
              >
                {isPending ? (
                  <>
                    <Loader2 className="w-6 h-6 animate-spin" />
                    <span>প্রক্রিয়াধীন রয়েছে...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-6 h-6 transition-transform group-hover:translate-x-1" />
                    <span>টিকিট নিবন্ধন জমা দিন (Submit Registration)</span>
                  </>
                )}
              </button>
            )}
          </div>

          {/* Reassurance text */}
          <div className="text-center pt-2">
            <p className="text-xs sm:text-sm text-slate-400 flex items-center justify-center gap-2">
              <Sparkles className="w-4 h-4 text-[#e5c07b]" />
              <span>আপনার তথ্য নিরাপদ এবং শুধুমাত্র টিকিট ইস্যুর কাজে ব্যবহৃত হবে।</span>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}
