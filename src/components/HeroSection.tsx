"use client";

import Image from "next/image";
import { Calendar, Clock, MapPin, Sparkles, ChevronDown } from "lucide-react";

export default function HeroSection() {
  const scrollToForm = () => {
    const el = document.getElementById("registration-section");
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <section className="relative pt-6 pb-12 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto text-center">
      {/* Ambient background glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-[#d4af37]/10 rounded-full blur-3xl pointer-events-none -z-10 animate-pulse-glow" />

      {/* Hero Image Container with ornate gold border matching ratri.jpeg */}
      <div className="relative mx-auto rounded-2xl p-1.5 sm:p-2 bg-gradient-to-b from-[#d4af37]/60 via-[#d4af37]/20 to-[#d4af37]/60 shadow-[0_15px_50px_rgba(0,0,0,0.7)] group">
        <div className="relative rounded-xl overflow-hidden bg-[#071526]">
          <Image
            src="/ratri.jpeg"
            alt="শব্দ ও সুরে বিমূর্ত রাত্রি - গান ও কবিতায় এক সন্ধ্যা"
            width={1024}
            height={572}
            priority
            className="w-full h-auto object-cover transform transition-transform duration-700 hover:scale-[1.01]"
          />
        </div>
      </div>

      {/* Event Details Quick Bar with enlarged typography */}
      <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-3.5 sm:gap-4 max-w-4xl mx-auto">
        <div className="gold-card rounded-xl p-4 sm:p-5 flex items-center justify-center sm:justify-start gap-4 border border-[#d4af37]/30 bg-[#0a1b30]/80">
          <div className="w-12 h-12 rounded-xl bg-[#d4af37]/15 flex items-center justify-center text-[#e5c07b] shrink-0">
            <Calendar className="w-6 h-6" />
          </div>
          <div className="text-left">
            <p className="text-xs sm:text-sm text-[#94a3b8] font-medium">অনুষ্ঠানের তারিখ</p>
            <p className="text-base sm:text-lg font-bold text-[#f8fafc]">৯ অক্টোবর ২০২৬ (শুক্রবার)</p>
          </div>
        </div>

        <div className="gold-card rounded-xl p-4 sm:p-5 flex items-center justify-center sm:justify-start gap-4 border border-[#d4af37]/30 bg-[#0a1b30]/80">
          <div className="w-12 h-12 rounded-xl bg-[#d4af37]/15 flex items-center justify-center text-[#e5c07b] shrink-0">
            <Clock className="w-6 h-6" />
          </div>
          <div className="text-left">
            <p className="text-xs sm:text-sm text-[#94a3b8] font-medium">নির্ধারিত সময়</p>
            <p className="text-base sm:text-lg font-bold text-[#f8fafc]">সন্ধ্যা ৬:৩০ - ৮:৩০ টা</p>
          </div>
        </div>

        <div className="gold-card rounded-xl p-4 sm:p-5 flex items-center justify-center sm:justify-start gap-4 border border-[#d4af37]/30 bg-[#0a1b30]/80">
          <div className="w-12 h-12 rounded-xl bg-[#d4af37]/15 flex items-center justify-center text-[#e5c07b] shrink-0">
            <MapPin className="w-6 h-6" />
          </div>
          <div className="text-left">
            <p className="text-xs sm:text-sm text-[#94a3b8] font-medium">অনুষ্ঠানস্থল</p>
            <p className="text-base sm:text-lg font-bold text-[#f8fafc] leading-tight">আহারী বাহার, ধানমন্ডি ২৭, ঢাকা</p>
          </div>
        </div>
      </div>

      {/* CTA Button */}
      <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
        <button
          onClick={scrollToForm}
          className="gold-btn cursor-pointer px-9 py-4 rounded-xl font-bold text-lg sm:text-xl flex items-center gap-3 shadow-xl group"
        >
          <Sparkles className="w-5 h-5 transition-transform group-hover:rotate-12" />
          <span>অনলাইনে টিকিট নিবন্ধন করুন</span>
          <ChevronDown className="w-5 h-5 transition-transform group-hover:translate-y-0.5" />
        </button>
      </div>
    </section>
  );
}
