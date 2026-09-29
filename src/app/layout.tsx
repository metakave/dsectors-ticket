import type { Metadata } from "next";
import { Hind_Siliguri, Noto_Serif_Bengali } from "next/font/google";
import "./globals.css";

const hindSiliguri = Hind_Siliguri({
  weight: ["300", "400", "500", "600", "700"],
  subsets: ["bengali", "latin"],
  variable: "--font-hind",
  display: "swap",
});

const notoSerifBengali = Noto_Serif_Bengali({
  weight: ["400", "600", "700"],
  subsets: ["bengali", "latin"],
  variable: "--font-noto-serif",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://bimurtoratri.vercel.app"),
  title: "শব্দ ও সুরে বিমূর্ত রাত্রি | টিকিট নিবন্ধন ও বুকিং",
  description:
    "গান ও কবিতায় এক মুগ্ধকর সন্ধ্যা - 'শব্দ ও সুরে বিমূর্ত রাত্রি'। ৯ অক্টোবর ২০২৬, আহারী বাহার মিলনায়তন, ধানমন্ডি ২৭, ঢাকা। অনলাইনে টিকিট নিশ্চিত করতে ফর্ম পূরণ করুন।",
  keywords: [
    "বিমূর্ত রাত্রি",
    "Bimurto Ratri",
    "গান ও কবিতা",
    "টিকিট বুকিং",
    "Ticket Registration",
    "আহারী বাহার মিলনায়তন",
    "ধানমন্ডি ২৭",
  ],
  openGraph: {
    title: "শব্দ ও সুরে বিমূর্ত রাত্রি | টিকিট নিবন্ধন",
    description:
      "গান ও কবিতায় এক মুগ্ধকর সন্ধ্যা। ৯ অক্টোবর ২০২৬, আহারী বাহার মিলনায়তন, ধানমন্ডি ২৭, ঢাকা।",
    images: [
      {
        url: "/ratri.jpeg",
        width: 1024,
        height: 572,
        alt: "শব্দ ও সুরে বিমূর্ত রাত্রি",
      },
    ],
    locale: "bn_BD",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="bn"
      className={`${hindSiliguri.variable} ${notoSerifBengali.variable} scroll-smooth antialiased`}
    >
      <body className="min-h-screen bg-[#06111f] text-[#f1f5f9] font-sans selection:bg-[#d4af37]/30 selection:text-[#fef08a]">
        {children}
      </body>
    </html>
  );
}
