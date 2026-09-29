"use client";

import { useState, useEffect, useTransition } from "react";
import {
  Download,
  Search,
  CheckCircle,
  XCircle,
  Clock,
  RefreshCw,
  Copy,
  Check,
  Lock,
  ExternalLink,
  MessageCircle,
  Mail,
  FileSpreadsheet,
  ArrowLeft,
} from "lucide-react";
import Link from "next/link";
import { Registration, TicketStatus } from "@/lib/types";

export default function AdminPanel() {
  const [passcode, setPasscode] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [stats, setStats] = useState({ total: 0, pending: 0, sent: 0 });
  const [xlsxPath, setXlsxPath] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"ALL" | "NOT_SENT" | "SENT">("ALL");
  const [copiedPath, setCopiedPath] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Email Diagnostic State
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [testEmailAddress, setTestEmailAddress] = useState("sadiq.alam@gmail.com");
  const [isTestingEmail, setIsTestingEmail] = useState(false);
  const [emailTestResult, setEmailTestResult] = useState<any | null>(null);

  const [, startTransition] = useTransition();

  const handleTestEmail = async () => {
    setIsTestingEmail(true);
    setEmailTestResult(null);
    try {
      const res = await fetch("/api/admin/test-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-admin-passcode": passcode || "admin123",
        },
        body: JSON.stringify({
          targetEmail: testEmailAddress,
          templateType: "both",
        }),
      });
      const data = await res.json();
      setEmailTestResult(data);
    } catch (err: any) {
      setEmailTestResult({
        success: false,
        error: err?.message || "নেটওয়ার্ক অনুরোধ ব্যর্থ হয়েছে",
      });
    } finally {
      setIsTestingEmail(false);
    }
  };

  const fetchRegistrations = async (enteredPasscode = passcode) => {
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const res = await fetch("/api/admin", {
        headers: {
          "x-admin-passcode": enteredPasscode,
        },
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        setErrorMsg(json.error || "অথেনটিকেশন ব্যর্থ হয়েছে। সঠিক পাসকোড দিন।");
        setIsAuthenticated(false);
        return;
      }

      setIsAuthenticated(true);
      setRegistrations(json.data.registrations || []);
      setStats(json.data.stats || { total: 0, pending: 0, sent: 0 });
      setXlsxPath(json.data.xlsxPath || "");
    } catch {
      setErrorMsg("সার্ভার থেকে ডাটা আনতে সমস্যা হয়েছে।");
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    fetchRegistrations(passcode);
  };

  const handleToggleStatus = (reg: Registration) => {
    const nextStatus: TicketStatus =
      reg.status === "Ticket Sent" ? "Ticket Not Sent" : "Ticket Sent";

    startTransition(async () => {
      try {
        const res = await fetch("/api/admin", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id: reg.id,
            status: nextStatus,
          }),
        });

        const json = await res.json();
        if (json.success) {
          setRegistrations((prev) =>
            prev.map((r) => (r.id === reg.id ? { ...r, status: nextStatus } : r))
          );
          setStats((prev) => {
            const isNowSent = nextStatus === "Ticket Sent";
            return {
              ...prev,
              pending: isNowSent ? prev.pending - 1 : prev.pending + 1,
              sent: isNowSent ? prev.sent + 1 : prev.sent - 1,
            };
          });
        }
      } catch (err) {
        console.error("Failed to update status:", err);
      }
    });
  };

  const handleCopyPath = () => {
    if (xlsxPath) {
      navigator.clipboard.writeText(xlsxPath);
      setCopiedPath(true);
      setTimeout(() => setCopiedPath(false), 2500);
    }
  };

  // Filtered registrations
  const filtered = registrations.filter((r) => {
    const matchesSearch =
      r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.whatsapp.includes(searchQuery) ||
      r.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.bkash.includes(searchQuery) ||
      r.id.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    if (statusFilter === "NOT_SENT") return r.status === "Ticket Not Sent";
    if (statusFilter === "SENT") return r.status === "Ticket Sent";
    return true;
  });

  if (!isAuthenticated) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center px-4">
        <div className="gold-card rounded-2xl p-6 sm:p-8 max-w-md w-full border border-[#d4af37]/40 bg-[#08172c] text-center">
          <div className="w-14 h-14 rounded-full bg-[#d4af37]/15 border border-[#d4af37]/40 flex items-center justify-center text-[#e5c07b] mx-auto mb-4">
            <Lock className="w-7 h-7" />
          </div>

          <h2 className="text-xl font-bold text-[#fef08a] mb-1">অ্যাডমিন লগইন</h2>
          <p className="text-xs text-slate-400 mb-6">
            টিকিট নিবন্ধন ও Excel ডাটাবেজ পরিচালনার জন্য পাসকোড দিন
          </p>

          {errorMsg && (
            <div className="mb-4 p-3 rounded-lg bg-rose-950/80 border border-rose-500/50 text-rose-300 text-xs text-left">
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <input
                type="password"
                required
                placeholder="অ্যাডমিন পাসকোড লিখুন (Default: admin123)"
                value={passcode}
                onChange={(e) => setPasscode(e.target.value)}
                className="form-input w-full px-4 py-3 rounded-xl text-sm font-mono text-center"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="gold-btn cursor-pointer w-full py-3 rounded-xl font-bold text-sm shadow-md transition-all"
            >
              {isLoading ? "যাচাই করা হচ্ছে..." : "লগইন করুন"}
            </button>
          </form>

          <div className="mt-6 pt-4 border-t border-slate-800">
            <Link
              href="/"
              className="text-xs text-slate-400 hover:text-[#fef08a] flex items-center justify-center gap-1.5 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>মূল ওয়েবসাইটে ফিরে যান</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-[#d4af37]/20">
        <div>
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="p-2 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 transition-colors"
              title="ওয়েবসাইটে যান"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <h1 className="text-2xl sm:text-3xl font-bold font-serif-bn text-[#fef08a]">
              অ্যাডমিন ড্যাশবোর্ড ও টিকিট ব্যবস্থাপনা
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 pl-11">
            বিমূর্ত রাত্রি • সকল নিবন্ধনের তালিকা ও রিয়েলটাইম Excel ফাইল আপডেট
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => setShowEmailModal(true)}
            className="cursor-pointer px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-[#38bdf8] text-xs sm:text-sm font-semibold flex items-center gap-2 border border-sky-500/30 transition-colors"
          >
            <Mail className="w-4 h-4 text-sky-400" />
            <span>ইমেইল টেস্ট (Test SMTP)</span>
          </button>

          <button
            onClick={() => fetchRegistrations(passcode)}
            disabled={isLoading}
            className="cursor-pointer px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs sm:text-sm font-semibold flex items-center gap-2 border border-slate-700 transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
            <span>রিফ্রেশ</span>
          </button>

          <a
            href="/api/export-xlsx"
            download
            className="gold-btn cursor-pointer px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 shadow-lg"
          >
            <Download className="w-4 h-4" />
            <span>ডাউনলোড Excel (.xlsx)</span>
          </a>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 my-6">
        <div className="gold-card rounded-xl p-5 border border-[#d4af37]/30 bg-[#0a1a2e]/90">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              মোট নিবন্ধন (Total Registrations)
            </p>
            <span className="w-8 h-8 rounded-lg bg-[#d4af37]/15 text-[#e5c07b] flex items-center justify-center font-bold text-sm">
              ∑
            </span>
          </div>
          <p className="text-3xl font-bold text-[#fef08a] mt-2 font-mono">{stats.total}</p>
        </div>

        <div className="gold-card rounded-xl p-5 border border-amber-500/30 bg-[#0a1a2e]/90">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-amber-400 uppercase tracking-wider">
              টিকিট পাঠানো বাকি (Ticket Not Sent)
            </p>
            <Clock className="w-5 h-5 text-amber-400" />
          </div>
          <p className="text-3xl font-bold text-amber-400 mt-2 font-mono">{stats.pending}</p>
        </div>

        <div className="gold-card rounded-xl p-5 border border-emerald-500/30 bg-[#0a1a2e]/90">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">
              টিকিট পাঠানো সম্পন্ন (Ticket Sent)
            </p>
            <CheckCircle className="w-5 h-5 text-emerald-400" />
          </div>
          <p className="text-3xl font-bold text-emerald-400 mt-2 font-mono">{stats.sent}</p>
        </div>
      </div>

      {/* XLSX File Server Path Display */}
      {xlsxPath && (
        <div className="gold-card rounded-xl p-4 border border-[#d4af37]/30 bg-[#071424] mb-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-emerald-500/15 text-emerald-400 flex items-center justify-center shrink-0">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-semibold text-[#d4af37]">
                সার্ভারে সংরক্ষিত .xlsx ফাইলের পূর্ণ পাথ (Full Server Path):
              </p>
              <code className="text-xs sm:text-sm text-slate-200 font-mono break-all">
                {xlsxPath}
              </code>
            </div>
          </div>

          <button
            onClick={handleCopyPath}
            className="cursor-pointer shrink-0 px-3.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 flex items-center gap-1.5 border border-slate-700 transition-colors"
          >
            {copiedPath ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400">পাথ কপি হয়েছে!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>পাথ কপি করুন</span>
              </>
            )}
          </button>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mb-4">
        {/* Search */}
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="নাম, ফোন, বিকাশ বা ইমেইল দিয়ে খুঁজুন..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="form-input w-full pl-10 pr-4 py-2.5 rounded-xl text-xs sm:text-sm"
          />
        </div>

        {/* Status Filter Tabs */}
        <div className="flex items-center gap-1 bg-[#071526] p-1 rounded-xl border border-slate-800 w-full sm:w-auto">
          <button
            onClick={() => setStatusFilter("ALL")}
            className={`cursor-pointer px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              statusFilter === "ALL"
                ? "bg-[#d4af37] text-[#071526]"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            সব ({registrations.length})
          </button>
          <button
            onClick={() => setStatusFilter("NOT_SENT")}
            className={`cursor-pointer px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              statusFilter === "NOT_SENT"
                ? "bg-amber-500 text-[#071526]"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            পেন্ডিং ({stats.pending})
          </button>
          <button
            onClick={() => setStatusFilter("SENT")}
            className={`cursor-pointer px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              statusFilter === "SENT"
                ? "bg-emerald-500 text-[#071526]"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            টিকিট প্রেরিত ({stats.sent})
          </button>
        </div>
      </div>

      {/* Registrations Table */}
      <div className="gold-card rounded-2xl border border-[#d4af37]/30 bg-[#091b33]/90 overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-[#050f1d] text-slate-300 uppercase tracking-wider text-[11px] border-b border-[#d4af37]/20">
              <tr>
                <th className="py-3.5 px-4 font-semibold">আইডি / সময়</th>
                <th className="py-3.5 px-4 font-semibold">আবেদনকারীর নাম</th>
                <th className="py-3.5 px-4 font-semibold">যোগাযোগ</th>
                <th className="py-3.5 px-4 font-semibold">বিকাশ নম্বর</th>
                <th className="py-3.5 px-4 font-semibold">স্ট্যাটাস</th>
                <th className="py-3.5 px-4 font-semibold text-right">অ্যাকশন</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    কোনো নিবন্ধন পাওয়া যায়নি।
                  </td>
                </tr>
              ) : (
                filtered.map((reg) => (
                  <tr
                    key={reg.id}
                    className="hover:bg-slate-800/40 transition-colors"
                  >
                    {/* ID & Date */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span className="font-mono font-bold text-[#fef08a] bg-[#d4af37]/15 px-2 py-0.5 rounded border border-[#d4af37]/30">
                        {reg.id}
                      </span>
                      <p className="text-[11px] text-slate-400 mt-1">
                        {reg.formattedDate}
                      </p>
                    </td>

                    {/* Name */}
                    <td className="py-3.5 px-4 whitespace-nowrap font-medium text-slate-100">
                      {reg.name}
                    </td>

                    {/* WhatsApp & Email */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2">
                        <a
                          href={`https://wa.me/${reg.whatsapp.replace(/[^0-9]/g, "")}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-mono text-emerald-400 hover:text-emerald-300 flex items-center gap-1 font-semibold"
                        >
                          <MessageCircle className="w-3.5 h-3.5" />
                          <span>{reg.whatsapp}</span>
                        </a>
                      </div>
                      <div className="text-slate-400 text-xs flex items-center gap-1 mt-0.5">
                        <Mail className="w-3 h-3" />
                        <span className="truncate max-w-[180px]">{reg.email}</span>
                      </div>
                    </td>

                    {/* bKash Number */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span className="font-mono font-bold text-[#fef08a] bg-[#e2136e]/20 text-[#f472b6] px-2.5 py-1 rounded-md border border-[#e2136e]/40">
                        {reg.bkash}
                      </span>
                    </td>

                    {/* Status */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      {reg.status === "Ticket Sent" ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                          <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                          <span>Ticket Sent</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-500/15 text-amber-300 border border-amber-500/30">
                          <Clock className="w-3.5 h-3.5 text-amber-400" />
                          <span>Ticket Not Sent</span>
                        </span>
                      )}
                    </td>

                    {/* Action Toggle */}
                    <td className="py-3.5 px-4 whitespace-nowrap text-right">
                      <button
                        onClick={() => handleToggleStatus(reg)}
                        className={`cursor-pointer px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                          reg.status === "Ticket Sent"
                            ? "bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700"
                            : "bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-900/30"
                        }`}
                      >
                        {reg.status === "Ticket Sent"
                          ? "টিকিট পেন্ডিং করুন"
                          : "টিকিট পাঠানো মার্ক করুন ✓"}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Email Test & Diagnostic Modal */}
      {showEmailModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="gold-card rounded-2xl p-6 sm:p-7 max-w-xl w-full border border-[#d4af37]/40 bg-[#07172c] text-left shadow-2xl relative">
            <div className="flex items-center justify-between pb-4 border-b border-slate-700/60 mb-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-sky-500/15 border border-sky-500/30 flex items-center justify-center text-sky-400">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-[#fef08a]">ইমেইল ডেলিভারি ও SMTP টেস্ট</h3>
                  <p className="text-xs text-slate-400">Gmail SMTP কানেকশন ও লাইভ ডেলিভারি ভেরিফিকেশন</p>
                </div>
              </div>
              <button
                onClick={() => setShowEmailModal(false)}
                className="text-slate-400 hover:text-white p-2 rounded-lg hover:bg-slate-800 transition-colors"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  টেস্ট প্রাপক ইমেইল (Recipient Email Address):
                </label>
                <div className="flex gap-2">
                  <input
                    type="email"
                    value={testEmailAddress}
                    onChange={(e) => setTestEmailAddress(e.target.value)}
                    placeholder="sadiq.alam@gmail.com"
                    className="form-input flex-1 px-3.5 py-2.5 rounded-xl text-sm font-mono text-slate-100"
                  />
                  <button
                    onClick={handleTestEmail}
                    disabled={isTestingEmail || !testEmailAddress}
                    className="gold-btn cursor-pointer px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 whitespace-nowrap"
                  >
                    {isTestingEmail ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>পাঠানো হচ্ছে...</span>
                      </>
                    ) : (
                      <>
                        <Mail className="w-4 h-4" />
                        <span>টেস্ট পাঠান</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Live Test Result Box */}
              {emailTestResult && (
                <div
                  className={`p-4 rounded-xl border text-xs sm:text-sm ${
                    emailTestResult.success
                      ? "bg-emerald-950/40 border-emerald-500/50 text-emerald-200"
                      : "bg-rose-950/40 border-rose-500/50 text-rose-200"
                  }`}
                >
                  <div className="flex items-center gap-2 font-bold mb-2">
                    {emailTestResult.success ? (
                      <>
                        <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                        <span>{emailTestResult.message}</span>
                      </>
                    ) : (
                      <>
                        <XCircle className="w-4 h-4 text-rose-400 shrink-0" />
                        <span>{emailTestResult.error || "টেস্ট ব্যর্থ হয়েছে"}</span>
                      </>
                    )}
                  </div>

                  {emailTestResult.config && (
                    <div className="mt-2 pt-2 border-t border-slate-700/50 font-mono text-[11px] text-slate-300 space-y-1">
                      <div>SMTP Server: {emailTestResult.config.host}:{emailTestResult.config.port}</div>
                      <div>Sender User: {emailTestResult.config.user}</div>
                    </div>
                  )}

                  {emailTestResult.dispatchResults && (
                    <div className="mt-3 space-y-1.5">
                      {emailTestResult.dispatchResults.map((r: any, idx: number) => (
                        <div
                          key={idx}
                          className="bg-black/30 p-2 rounded-lg font-mono text-[11px] text-slate-200 border border-slate-700/40"
                        >
                          <div className="font-bold text-[#fef08a]">{r.template}</div>
                          <div>To: {r.to}</div>
                          {r.messageId && <div className="text-emerald-400">ID: {r.messageId}</div>}
                          {r.error && <div className="text-rose-400">Error: {r.error}</div>}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 text-[11.5px] text-slate-400 leading-relaxed">
                💡 <strong>টিপস:</strong> টিকিট নিবন্ধন সম্পন্ন হওয়ার সাথে সাথেই ব্যবহারকারীর ইমেইলে কনফার্মেশন কপি এবং আয়োজকদের ইমেইলে নোটিফিকেশন চলে যাবে।
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setShowEmailModal(false)}
                className="cursor-pointer px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300 transition-colors"
              >
                বন্ধ করুন
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
