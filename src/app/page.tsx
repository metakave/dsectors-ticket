import HeroSection from "@/components/HeroSection";
import PaymentInstruction from "@/components/PaymentInstruction";
import RegistrationForm from "@/components/RegistrationForm";
import { Music, Mic2, HelpCircle } from "lucide-react";

export default function Home() {
  return (
    <div className="relative overflow-hidden min-h-screen">
      {/* Decorative Top Accent Light */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[450px] bg-radial from-[#d4af37]/15 via-[#0d223f]/20 to-transparent pointer-events-none -z-10 blur-2xl" />

      {/* Main Container */}
      <main className="relative z-10">
        {/* 1. Hero Section with Banner Image */}
        <HeroSection />

        {/* 2. Content & Form Section */}
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
          {/* Artistic Introduction Card */}
          <div className="gold-card rounded-2xl p-7 sm:p-9 border border-[#d4af37]/30 bg-[#091b33]/70 text-center mb-8">
            <div className="flex items-center justify-center gap-3 text-[#d4af37] mb-3">
              <Music className="w-5 h-5" />
              <span className="text-sm sm:text-base uppercase tracking-widest font-bold text-[#e5c07b]">
                গান • কবিতা • আড্ডা
              </span>
              <Mic2 className="w-5 h-5" />
            </div>
            
            <h2 className="text-2xl sm:text-3xl font-serif-bn font-bold text-[#fef08a] mb-3.5 leading-snug">
              গান, কবিতা ও আড্ডায় আপনাকে আন্তরিক আমন্ত্রণ
            </h2>
            
            <p className="text-slate-200 text-base sm:text-lg leading-relaxed max-w-2xl mx-auto">
              শব্দ ও সুরের এক অনন্য মেলবন্ধনে অনুষ্ঠিত হতে যাচ্ছে <strong className="text-[#fef08a]">"বিমূর্ত রাত্রি"</strong>। আবৃত্তি, সুরের মূর্ছনা এবং প্রিয়জনদের সান্নিধ্যে মুখরিত হতে আপনার আসনটি এখনি অগ্রিম নিশ্চিত করুন।
            </p>
          </div>

          {/* 3. bKash Payment Instruction */}
          <PaymentInstruction />

          {/* 4. Bengali Registration Form */}
          <RegistrationForm />

          {/* 5. Frequently Asked Questions (FAQ) & Guidelines */}
          <div className="mt-12 gold-card rounded-2xl p-6 sm:p-9 border border-[#d4af37]/30 bg-[#071526]/85 shadow-xl">
            <div className="flex items-center gap-2.5 text-[#d4af37] mb-6">
              <HelpCircle className="w-6 h-6 text-[#e5c07b]" />
              <h3 className="text-xl sm:text-2xl font-serif-bn font-bold text-[#f8fafc]">
                জরুরি তথ্যাবলী ও প্রশ্নোত্তর
              </h3>
            </div>

            <div className="space-y-5 text-sm sm:text-base text-slate-200">
              <div className="border-b border-slate-800/80 pb-4">
                <p className="font-bold text-[#fef08a] text-base sm:text-lg mb-1.5 flex items-center gap-2">
                  <span>প্রশ্ন: আমি কখন ডিজিটাল টিকিট পাব?</span>
                </p>
                <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
                  উত্তর: ফর্ম সাবমিট করার পর আমাদের অ্যাডমিন টিম আপনার বিকাশ লেনদেনটি ম্যানুয়ালি যাচাই করবে। ভেরিফিকেশন সম্পন্ন হলে আপনার প্রদত্ত ইমেইল ঠিকানায় কিউআর/রেফারেন্স কোডসহ ডিজিটাল ই-টিকিট পৌঁছে যাবে।
                </p>
              </div>

              <div className="border-b border-slate-800/80 pb-4">
                <p className="font-bold text-[#fef08a] text-base sm:text-lg mb-1.5 flex items-center gap-2">
                  <span>প্রশ্ন: অনুষ্ঠানস্থলে কীভাবে টিকিট দেখাব?</span>
                </p>
                <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
                  উত্তর: অনুষ্ঠানস্থলে প্রবেশের সময় আপনার স্মার্টফোনে ইমেইলে প্রাপ্ত ডিজিটাল টিকিট বা রেজিস্ট্রেশন আইডি দেখালেই প্রবেশাধিকার পাওয়া যাবে। প্রিন্ট করার প্রয়োজন নেই।
                </p>
              </div>

              <div>
                <p className="font-bold text-[#fef08a] text-base sm:text-lg mb-1.5 flex items-center gap-2">
                  <span>প্রশ্ন: কোনো সহায়তা বা ভেরিফিকেশন সংক্রান্ত যোগাযোগ কীভাবে করব?</span>
                </p>
                <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
                  উত্তর: যেকোনো তথ্যের জন্য আমাদের সাপোর্ট নাম্বারে সরাসরি কল বা হোয়াটসঅ্যাপ করতে পারেন।
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-[#d4af37]/20 bg-[#030914] py-8 text-center text-sm text-slate-400">
        <div className="max-w-4xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
          <div>
            <p className="font-bold text-[#fef08a] text-base">শব্দ ও সুরে বিমূর্ত রাত্রি ২০২৬</p>
            <p className="text-slate-400 text-sm mt-0.5">আহারী বাহার মিলনায়তন, ধানমন্ডি ২৭, ঢাকা</p>
          </div>

          <p className="text-slate-400 text-xs sm:text-sm">
            © ২০২৬ বিমূর্ত রাত্রি। সর্বস্বত্ব সংরক্ষিত।
          </p>
        </div>
      </footer>
    </div>
  );
}
