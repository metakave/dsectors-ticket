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
} from "lucide-react";
import { RegisterFormInput, Registration } from "@/lib/types";

export default function RegistrationForm() {
  const [name, setName] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [email, setEmail] = useState("");
  const [bkash, setBkash] = useState("");
  const [bkashSameAsWhatsapp, setBkashSameAsWhatsapp] = useState(false);

  const [isPending, startTransition] = useTransition();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successData, setSuccessData] = useState<{
    registration: Registration;
    downloadUrl: string;
  } | null>(null);

  // Handle WhatsApp change: If checkbox is ticked, auto-sync bKash number
  const handleWhatsappChange = (val: string) => {
    setWhatsapp(val);
    if (bkashSameAsWhatsapp) {
      setBkash(val);
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

    // Basic client validation
    if (!name.trim()) {
      setErrorMsg("অনুগ্রহ করে আপনার পুরো নাম লিখুন।");
      return;
    }
    if (!whatsapp.trim()) {
      setErrorMsg("অনুগ্রহ করে আপনার হোয়াটসঅ্যাপ নম্বর লিখুন।");
      return;
    }
    if (!email.trim() || !email.includes("@")) {
      setErrorMsg("ডিজিটাল টিকিট পেতে অনুগ্রহ করে একটি সঠিক ইমেইল প্রদান করুন।");
      return;
    }
    if (!bkash.trim()) {
      setErrorMsg("অনুগ্রহ করে টাকা পাঠানোর বিকাশ নম্বরটি লিখুন।");
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
    setErrorMsg(null);
    setSuccessData(null);
  };

  return (
    <div id="registration-section" className="scroll-mt-10">
      {/* Success State Screen */}
      {successData ? (
        <div className="gold-card rounded-2xl p-6 sm:p-10 border-2 border-[#d4af37] bg-[#07172b] text-center relative overflow-hidden animate-in fade-in zoom-in-95 duration-500 shadow-2xl">
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-[#d4af37]/20 border-2 border-[#d4af37] flex items-center justify-center text-[#fef08a] mx-auto mb-5 shadow-[0_0_30px_rgba(212,175,55,0.4)]">
            <CheckCircle2 className="w-10 h-10 sm:w-12 sm:h-12 text-emerald-400" />
          </div>

          <div className="inline-block bg-[#d4af37]/15 border border-[#d4af37]/40 px-5 py-1.5 rounded-full text-sm sm:text-base font-semibold text-[#fef3c7] mb-3.5">
            নিবন্ধন সফল হয়েছে
          </div>

          <h2 className="text-2xl sm:text-4xl font-serif-bn font-bold text-[#fef08a] mb-2.5">
            ধন্যবাদ, {successData.registration.name}!
          </h2>

          <p className="text-slate-200 text-base sm:text-lg max-w-lg mx-auto mb-7 leading-relaxed">
            আপনার টিকিট নিবন্ধন সফলভাবে গ্রহণ করা হয়েছে। আমাদের টিম আপনার বিকাশ পেমেন্ট ম্যানুয়ালি যাচাই করার পর আপনার প্রদত্ত ইমেইলে (<span className="text-[#38bdf8] font-bold">{successData.registration.email}</span>) ডিজিটাল টিকিট পাঠিয়ে দেবে।
          </p>

          {/* Registration Details Summary Card */}
          <div className="bg-[#050f1d] border border-[#d4af37]/30 rounded-xl p-5 sm:p-6 max-w-md mx-auto text-left mb-7">
            <div className="flex justify-between items-center pb-3 border-b border-slate-800 text-sm sm:text-base">
              <span className="text-slate-400 font-medium">রেজিস্ট্রেশন আইডি:</span>
              <span className="font-mono font-bold text-[#fef08a] bg-[#d4af37]/15 px-3 py-1 rounded border border-[#d4af37]/30">
                {successData.registration.id}
              </span>
            </div>

            <div className="flex justify-between items-center py-3 border-b border-slate-800 text-sm sm:text-base">
              <span className="text-slate-400 font-medium">হোয়াটসঅ্যাপ নম্বর:</span>
              <span className="font-semibold text-slate-100">{successData.registration.whatsapp}</span>
            </div>

            <div className="flex justify-between items-center py-3 border-b border-slate-800 text-sm sm:text-base">
              <span className="text-slate-400 font-medium">বিকাশ নম্বর:</span>
              <span className="font-semibold text-[#fef08a]">{successData.registration.bkash}</span>
            </div>

            <div className="flex justify-between items-center pt-3 text-sm sm:text-base">
              <span className="text-slate-400 font-medium">বর্তমান স্ট্যাটাস:</span>
              <span className="font-bold text-amber-400 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
                {successData.registration.status} (পেন্ডিং)
              </span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5">
            <button
              onClick={handleReset}
              className="cursor-pointer w-full sm:w-auto px-7 py-3.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-100 text-base font-bold flex items-center justify-center gap-2 border border-slate-700 transition-colors"
            >
              <RefreshCw className="w-5 h-5" />
              <span>নতুন টিকিট নিবন্ধন করুন</span>
            </button>
          </div>
        </div>
      ) : (
        /* The Main Registration Form */
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

          {/* Error Message */}
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
                className="block text-base sm:text-lg font-bold text-slate-100 mb-2 flex items-center justify-between"
              >
                <span className="flex items-center gap-2">
                  <User className="w-5 h-5 text-[#e5c07b]" />
                  <span>নাম (Name)</span>
                  <span className="text-rose-400">*</span>
                </span>
                <span className="text-xs sm:text-sm text-slate-400 font-normal">আবেদনকারীর পুরো নাম</span>
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
                className="block text-base sm:text-lg font-bold text-slate-100 mb-2 flex items-center justify-between"
              >
                <span className="flex items-center gap-2">
                  <Phone className="w-5 h-5 text-[#e5c07b]" />
                  <span>হোয়াটসঅ্যাপ নম্বর (WhatsApp Number)</span>
                  <span className="text-rose-400">*</span>
                </span>
                <span className="text-xs sm:text-sm text-slate-400 font-normal">যোগাযোগের জন্য</span>
              </label>
              <div className="relative">
                <input
                  id="whatsapp"
                  type="tel"
                  required
                  placeholder="যেমন: 017XXXXXXXX"
                  value={whatsapp}
                  onChange={(e) => handleWhatsappChange(e.target.value)}
                  className="form-input w-full px-4.5 py-3.5 rounded-xl text-base sm:text-lg font-medium placeholder:text-slate-500 font-mono"
                />
              </div>
            </div>

            {/* 3. Email Field (Must to receive digital ticket) */}
            <div>
              <label
                htmlFor="email"
                className="block text-base sm:text-lg font-bold text-slate-100 mb-2 flex flex-wrap items-center justify-between gap-2"
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

            {/* 4. bKash Number & Checkbox */}
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
                  required
                  placeholder="যে বিকাশ নম্বর থেকে টাকা পাঠিয়েছেন (01XXXXXXXXX)"
                  value={bkash}
                  onChange={(e) => {
                    setBkash(e.target.value);
                    if (bkashSameAsWhatsapp && e.target.value !== whatsapp) {
                      setBkashSameAsWhatsapp(false);
                    }
                  }}
                  className="form-input w-full px-4.5 py-3.5 rounded-xl text-base sm:text-lg font-medium placeholder:text-slate-500 font-mono"
                />
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-3">
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
      )}
    </div>
  );
}
