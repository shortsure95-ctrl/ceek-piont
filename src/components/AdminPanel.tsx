import React, { useState } from "react";
import { Deposit, Product, Submission, UserStats, SystemConfig, Notice } from "../types";
import { Check, X, PlusCircle, Trash2, Edit, Upload, Settings, RefreshCw, AlertCircle, ListPlus, BellRing, ShieldCheck, UserMinus, ShieldAlert, DollarSign, ExternalLink, Network, GitFork } from "lucide-react";

interface AdminPanelProps {
  deposits: Deposit[];
  products: Product[];
  submissions: Submission[];
  users: UserStats[];
  config: SystemConfig;
  notices: Notice[];
  onApproveDeposit: (depositId: string) => Promise<void>;
  onRejectDeposit: (depositId: string) => Promise<void>;
  onAddProduct: (name: string, description: string, price: number) => Promise<void>;
  onDeleteProduct: (productId: string) => Promise<void>;
  onUploadMails: (productId: string, mailsList: string) => Promise<void>;
  onActionSubmission: (subId: string, status: "approved" | "rejected") => Promise<void>;
  onToggleBlockUser: (userId: string) => Promise<void>;
  onUpdateUserBalance: (userId: string, amount: number) => Promise<void>;
  onUpdateConfig: (config: Partial<SystemConfig>) => Promise<void>;
  onUpdateNotice: (content: string) => Promise<void>;
  onRefresh: () => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({
  deposits,
  products,
  submissions,
  users,
  config,
  notices,
  onApproveDeposit,
  onRejectDeposit,
  onAddProduct,
  onDeleteProduct,
  onUploadMails,
  onActionSubmission,
  onToggleBlockUser,
  onUpdateUserBalance,
  onUpdateConfig,
  onUpdateNotice,
  onRefresh
}) => {
  // Navigation inside Admin Panel
  const [activeTab, setActiveTab] = useState<"deposits" | "products" | "tasks" | "users" | "settings">("deposits");

  // Local Form states
  const [prodName, setProdName] = useState("");
  const [prodDesc, setProdDesc] = useState("");
  const [prodPrice, setProdPrice] = useState("");

  const [selectedUploadProdId, setSelectedUploadProdId] = useState("");
  const [rawMailsList, setRawMailsList] = useState("");
  const [uploading, setUploading] = useState(false);

  const [refBonusPercent, setRefBonusPercent] = useState(String(config.referralBonusPercent));
  const [bkashNumber, setBkashNumber] = useState(config.bkashNumber);
  const [tokenLink, setTokenLink] = useState(config.tokenToCodeLink);
  const [twoFaLink, setTwoFaLink] = useState(config.twoFactorCodeLink);
  const [whatsappGroupLink, setWhatsappGroupLink] = useState(config.whatsappGroupLink || "");
  const [adminWhatsApp, setAdminWhatsApp] = useState(config.adminWhatsApp);
  const [developerWhatsApp, setDeveloperWhatsApp] = useState(config.developerWhatsApp);

  const [noticeContent, setNoticeContent] = useState(notices[0]?.content || "");

  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [editBalanceVal, setEditBalanceVal] = useState("");
  const [selectedTreeUser, setSelectedTreeUser] = useState<any | null>(null);
  const [showTreeModal, setShowTreeModal] = useState<boolean>(false);

  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Set timeout messages
  const triggerAlert = (success: boolean, text: string) => {
    if (success) {
      setSuccessMsg(text);
      setTimeout(() => setSuccessMsg(null), 3000);
    } else {
      setErrorMsg(text);
      setTimeout(() => setErrorMsg(null), 3000);
    }
  };

  // Actions
  const handleApproveDep = async (depId: string) => {
    try {
      await onApproveDeposit(depId);
      triggerAlert(true, "ডিপোজিট সফলভাবে অ্যাপ্রুভ হয়েছে এবং রেফারারকে বোনাস দেওয়া হয়েছে!");
    } catch (err: any) {
      triggerAlert(false, err.message || "ডিপোজিট অ্যাপ্রুভ করতে ব্যর্থ হয়েছে।");
    }
  };

  const handleRejectDep = async (depId: string) => {
    try {
      await onRejectDeposit(depId);
      triggerAlert(true, "ডিপোজিট সফলভাবে বাতিল করা হয়েছে।");
    } catch (err: any) {
      triggerAlert(false, err.message || "ডিপোজিট বাতিল করতে ব্যর্থ হয়েছে।");
    }
  };

  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prodName || !prodPrice) return;
    try {
      await onAddProduct(prodName, prodDesc, Number(prodPrice));
      setProdName("");
      setProdDesc("");
      setProdPrice("");
      triggerAlert(true, "নতুন পণ্য সফলভাবে যোগ করা হয়েছে!");
    } catch (err: any) {
      triggerAlert(false, err.message || "পণ্য যোগ করতে সমস্যা হয়েছে।");
    }
  };

  const handleDeleteProd = async (id: string) => {
    if (!confirm("আপনি কি নিশ্চিতভাবে এই পণ্যটি ডিলিট করতে চান? স্টকের সব অবিক্রিত মেইলও ডিলিট হবে।")) return;
    try {
      await onDeleteProduct(id);
      triggerAlert(true, "পণ্যটি ডিলিট করা হয়েছে।");
    } catch (err: any) {
      triggerAlert(false, err.message || "পণ্য ডিলিট ব্যর্থ হয়েছে।");
    }
  };

  const handleMailsUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUploadProdId || !rawMailsList.trim()) {
      triggerAlert(false, "পণ্য সিলেক্ট করুন এবং মেইল লিস্ট প্রবেশ করান।");
      return;
    }
    setUploading(true);
    try {
      await onUploadMails(selectedUploadProdId, rawMailsList);
      setRawMailsList("");
      triggerAlert(true, "মেইলসমূহ সফলভাবে আপলোড করা হয়েছে!");
    } catch (err: any) {
      triggerAlert(false, err.message || "মেইল আপলোড করতে ব্যর্থ হয়েছে।");
    } finally {
      setUploading(false);
    }
  };

  const handleActionSub = async (subId: string, status: "approved" | "rejected") => {
    try {
      await onActionSubmission(subId, status);
      triggerAlert(true, `সাবমিশনটি সফলভাবে ${status === "approved" ? "গৃহীত" : "বাতিল"} করা হয়েছে।`);
    } catch (err: any) {
      triggerAlert(false, err.message || "অ্যাকশন সম্পন্ন করতে ব্যর্থ হয়েছে।");
    }
  };

  const handleToggleBlock = async (uid: string) => {
    try {
      await onToggleBlockUser(uid);
      triggerAlert(true, "ইউজার ব্লক স্ট্যাটাস আপডেট করা হয়েছে!");
    } catch (err: any) {
      triggerAlert(false, err.message || "ব্যর্থ হয়েছে।");
    }
  };

  const handleUpdateBalance = async (uid: string) => {
    if (!editBalanceVal) return;
    try {
      await onUpdateUserBalance(uid, Number(editBalanceVal));
      setEditingUserId(null);
      setEditBalanceVal("");
      triggerAlert(true, "ইউজারের ব্যালেন্স সফলভাবে পরিবর্তন করা হয়েছে!");
    } catch (err: any) {
      triggerAlert(false, err.message || "ব্যালেন্স আপডেট ব্যর্থ হয়েছে।");
    }
  };

  const handleUpdateConfigSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await onUpdateConfig({
        referralBonusPercent: Number(refBonusPercent),
        bkashNumber,
        tokenToCodeLink: tokenLink,
        twoFactorCodeLink: twoFaLink,
        whatsappGroupLink,
        adminWhatsApp,
        developerWhatsApp
      });
      triggerAlert(true, "কনফিগারেশন সফলভাবে আপডেট করা হয়েছে!");
    } catch (err: any) {
      triggerAlert(false, err.message || "কনফিগারেশন আপডেট ব্যর্থ হয়েছে।");
    }
  };

  const handleUpdateNoticeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await onUpdateNotice(noticeContent);
      triggerAlert(true, "জরুরী নোটিশ সফলভাবে আপডেট করা হয়েছে!");
    } catch (err: any) {
      triggerAlert(false, err.message || "নোটিশ আপডেট ব্যর্থ হয়েছে।");
    }
  };

  return (
    <div className="space-y-6">
      {/* Admin Panel Header Banner */}
      <div className="bg-slate-900 text-white rounded-2xl p-5 shadow-xs flex flex-wrap justify-between items-center gap-4 border border-slate-800">
        <div className="flex items-center gap-3">
          <div className="bg-rose-500 text-white p-2 rounded-xl">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm md:text-base font-bold uppercase tracking-wider">এডমিন কন্ট্রোল সেন্টার (Admin Control)</h2>
            <p className="text-xxs text-slate-400 mt-0.5">সবরকম ট্রানজেকশন, প্রোডাক্ট, মেইল স্টক এবং নোটিশ পরিচালনা করুন</p>
          </div>
        </div>
        <button
          onClick={onRefresh}
          className="bg-slate-800 hover:bg-slate-700 text-slate-200 text-xxs font-bold px-3 py-2 rounded-xl flex items-center gap-1.5 transition border border-slate-750"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          রিলোড ডেটা
        </button>
      </div>

      {/* Admin Tabs */}
      <div className="flex border-b border-slate-250 overflow-x-auto pb-px">
        <button
          onClick={() => setActiveTab("deposits")}
          className={`py-2.5 px-4 font-extrabold text-xs md:text-sm border-b-2 whitespace-nowrap shrink-0 transition-all ${activeTab === "deposits" ? "border-rose-500 text-rose-500" : "border-transparent text-slate-500 hover:text-slate-800"}`}
        >
          ডিপোজিট ভেরিফাই ({deposits.filter(d => d.status === "pending").length})
        </button>
        <button
          onClick={() => setActiveTab("products")}
          className={`py-2.5 px-4 font-extrabold text-xs md:text-sm border-b-2 whitespace-nowrap shrink-0 transition-all ${activeTab === "products" ? "border-rose-500 text-rose-500" : "border-transparent text-slate-500 hover:text-slate-800"}`}
        >
          পণ্য ও মেইল স্টক
        </button>
        <button
          onClick={() => setActiveTab("tasks")}
          className={`py-2.5 px-4 font-extrabold text-xs md:text-sm border-b-2 whitespace-nowrap shrink-0 transition-all ${activeTab === "tasks" ? "border-rose-500 text-rose-500" : "border-transparent text-slate-500 hover:text-slate-800"}`}
        >
          কর্মী সাবমিশন ({submissions.filter(s => s.status === "pending").length})
        </button>
        <button
          onClick={() => setActiveTab("users")}
          className={`py-2.5 px-4 font-extrabold text-xs md:text-sm border-b-2 whitespace-nowrap shrink-0 transition-all ${activeTab === "users" ? "border-rose-500 text-rose-500" : "border-transparent text-slate-500 hover:text-slate-800"}`}
        >
          ইউজার ব্যালেন্স ({users.length})
        </button>
        <button
          onClick={() => setActiveTab("settings")}
          className={`py-2.5 px-4 font-extrabold text-xs md:text-sm border-b-2 whitespace-nowrap shrink-0 transition-all ${activeTab === "settings" ? "border-rose-500 text-rose-500" : "border-transparent text-slate-500 hover:text-slate-800"}`}
        >
          লিঙ্ক ও নোটিশ আপডেট
        </button>
      </div>

      {/* Alert Notifications */}
      {successMsg && (
        <div className="bg-emerald-50 text-emerald-700 p-3.5 rounded-xl border border-emerald-100 text-xs font-semibold">
          {successMsg}
        </div>
      )}
      {errorMsg && (
        <div className="bg-rose-50 text-rose-700 p-3.5 rounded-xl border border-rose-100 text-xs font-semibold">
          {errorMsg}
        </div>
      )}

      {/* Tab Contents */}
      <div className="transition-all duration-300">
        {/* 1. Deposits Manager */}
        {activeTab === "deposits" && (
          <div className="bg-white rounded-2xl border border-slate-100 shadow-xs overflow-hidden">
            <h3 className="bg-slate-50 px-4 py-3 text-xs font-bold text-slate-700 border-b border-slate-100">ডিপোজিট রিকোয়েস্ট তালিকা</h3>
            
            {deposits.length === 0 ? (
              <div className="py-12 text-center text-slate-400 text-xs font-medium">
                কোনো ডিপোজিট রিকোয়েস্ট জমা পড়েনি।
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50/50 border-b border-slate-100 text-xxs font-bold text-slate-500 uppercase tracking-wider">
                      <th className="py-2.5 px-4">ইউজার আইডি</th>
                      <th className="py-2.5 px-4">পরিমাণ</th>
                      <th className="py-2.5 px-4">বিকাশ নাম্বার</th>
                      <th className="py-2.5 px-4">TxID</th>
                      <th className="py-2.5 px-4">স্ক্রিনশট</th>
                      <th className="py-2.5 px-4">তারিখ</th>
                      <th className="py-2.5 px-4 text-center">স্ট্যাটাস / একশন</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs">
                    {deposits.slice().reverse().map((dep) => (
                      <tr key={dep.id} className="hover:bg-slate-50/30">
                        <td className="py-3 px-4 font-mono font-bold text-slate-850">{dep.userId}</td>
                        <td className="py-3 px-4 font-bold text-slate-900 font-mono">৳{dep.amount}</td>
                        <td className="py-3 px-4 font-mono text-slate-600">{dep.bKashNumber}</td>
                        <td className="py-3 px-4 font-mono text-slate-700 font-medium uppercase">{dep.transactionId}</td>
                        <td className="py-3 px-4">
                          {dep.screenshot ? (
                            <a
                              href={dep.screenshot}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-block"
                              title="পূর্ণ আকারে দেখতে ক্লিক করুন"
                            >
                              <img
                                src={dep.screenshot}
                                alt="Tx SS"
                                className="w-8 h-8 rounded-md object-cover border border-slate-200 shadow-xxs hover:scale-110 transition cursor-pointer"
                              />
                            </a>
                          ) : (
                            <span className="text-slate-400 italic text-xxs">নেই</span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-xxs text-slate-400 whitespace-nowrap">
                          {new Date(dep.createdAt).toLocaleString()}
                        </td>
                        <td className="py-3 px-4">
                          {dep.status === "pending" ? (
                            <div className="flex items-center justify-center gap-1.5">
                              <button
                                onClick={() => handleApproveDep(dep.id)}
                                className="bg-emerald-600 hover:bg-emerald-700 text-white px-2.5 py-1 rounded-lg text-xxs font-bold flex items-center gap-0.5 shadow-sm transition"
                              >
                                <Check className="w-3 h-3" />
                                অ্যাপ্রুভ
                              </button>
                              <button
                                onClick={() => handleRejectDep(dep.id)}
                                className="bg-rose-600 hover:bg-rose-700 text-white px-2.5 py-1 rounded-lg text-xxs font-bold flex items-center gap-0.5 shadow-sm transition"
                              >
                                <X className="w-3 h-3" />
                                রিজেক্ট
                              </button>
                            </div>
                          ) : (
                            <div className="text-center">
                              <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${dep.status === "approved" ? "bg-emerald-50 text-emerald-700 border border-emerald-100" : "bg-rose-50 text-rose-700 border border-rose-100"}`}>
                                {dep.status === "approved" ? "অ্যাপ্রুভড" : "রিজেক্টেড"}
                              </span>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* 2. Products & stock controller */}
        {activeTab === "products" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left side: Add Product & Stock Upload Form */}
            <div className="space-y-6 lg:col-span-1">
              {/* Product creator */}
              <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-xs space-y-4">
                <h3 className="font-bold text-slate-900 text-xs uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-50 pb-2">
                  <PlusCircle className="w-4 h-4 text-rose-500" />
                  নতুন পণ্য তৈরি করুন
                </h3>
                <form onSubmit={handleCreateProduct} className="space-y-3.5">
                  <div className="space-y-1">
                    <label className="text-xxs font-bold text-slate-700 uppercase">পণ্যের নাম *</label>
                    <input
                      type="text"
                      required
                      placeholder="যেমন: Hotmail Old 2018"
                      value={prodName}
                      onChange={(e) => setProdName(e.target.value)}
                      className="w-full text-xs border border-slate-200 rounded-xl px-3 py-2 bg-slate-50 focus:bg-white outline-hidden"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xxs font-bold text-slate-700 uppercase">বিবরণ / শর্তাবলী</label>
                    <textarea
                      placeholder="মেইল কোয়ালিটি, গ্যারান্টি ইত্যাদি লিখুন..."
                      rows={2}
                      value={prodDesc}
                      onChange={(e) => setProdDesc(e.target.value)}
                      className="w-full text-xs border border-slate-200 rounded-xl px-3 py-2 bg-slate-50 focus:bg-white outline-hidden"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xxs font-bold text-slate-700 uppercase">মূল্য (৳ প্রতি পিস) *</label>
                    <input
                      type="number"
                      required
                      placeholder="যেমন: ১২"
                      value={prodPrice}
                      onChange={(e) => setProdPrice(e.target.value)}
                      className="w-full text-xs border border-slate-200 rounded-xl px-3 py-2 bg-slate-50 focus:bg-white outline-hidden"
                    />
                  </div>
                  <button type="submit" className="w-full bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold py-2 rounded-xl transition">
                    পণ্য সেভ করুন
                  </button>
                </form>
              </div>

              {/* Mail list stock uploader */}
              <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-xs space-y-4">
                <h3 className="font-bold text-slate-900 text-xs uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-50 pb-2">
                  <Upload className="w-4 h-4 text-rose-500" />
                  মেইল লিস্ট আপলোড (স্টক লোড)
                </h3>
                <form onSubmit={handleMailsUploadSubmit} className="space-y-3.5">
                  <div className="space-y-1">
                    <label className="text-xxs font-bold text-slate-700 uppercase">পণ্য সিলেক্ট করুন *</label>
                    <select
                      required
                      value={selectedUploadProdId}
                      onChange={(e) => setSelectedUploadProdId(e.target.value)}
                      className="w-full text-xs border border-slate-200 rounded-xl px-2 py-2 bg-slate-50 focus:bg-white outline-hidden font-semibold text-slate-700"
                    >
                      <option value="">পণ্য সিলেক্ট করুন...</option>
                      {products.map(p => (
                        <option key={p.id} value={p.id}>{p.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xxs font-bold text-slate-700 uppercase block">মেইল তালিকা (প্রতি লাইনে ১টি করে) *</label>
                    <textarea
                      required
                      placeholder="email1@hotmail.com:PassWord123&#10;email2@hotmail.com:PassWord456:recoveryMail"
                      rows={6}
                      value={rawMailsList}
                      onChange={(e) => setRawMailsList(e.target.value)}
                      className="w-full text-xxs font-mono border border-slate-200 rounded-xl p-2.5 bg-slate-50 focus:bg-white outline-hidden"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={uploading}
                    className={`w-full text-white text-xs font-bold py-2 rounded-xl transition flex items-center justify-center gap-1.5 ${uploading ? "bg-slate-400 cursor-not-allowed" : "bg-rose-600 hover:bg-rose-700"}`}
                  >
                    <ListPlus className="w-4 h-4" />
                    {uploading ? "আপলোড হচ্ছে..." : "স্টকে মেইল যুক্ত করুন"}
                  </button>
                </form>
              </div>
            </div>

            {/* Right side: Products stock overview list */}
            <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 shadow-xs overflow-hidden h-fit">
              <h3 className="bg-slate-50 px-4 py-3 text-xs font-bold text-slate-700 border-b border-slate-100">স্টক কন্ট্রোল ও মূল্য তালিকা</h3>
              
              {products.length === 0 ? (
                <div className="py-12 text-center text-slate-400 text-xs">
                  কোনো পণ্য পাওয়া যায়নি। দয়া করে প্রথমে পণ্য যোগ করুন।
                </div>
              ) : (
                <div className="divide-y divide-slate-150">
                  {products.map((p) => (
                    <div key={p.id} className="p-4 flex items-center justify-between gap-4 hover:bg-slate-50/50 transition">
                      <div className="space-y-1 flex-1">
                        <h4 className="font-bold text-slate-900 text-xs md:text-sm">{p.name}</h4>
                        <p className="text-slate-500 text-xxs md:text-xs leading-relaxed">{p.description}</p>
                        <div className="flex items-center gap-2 pt-1 font-mono text-xxs">
                          <span className="text-rose-600 font-bold">৳{p.price} / পিস</span>
                          <span className="text-slate-300">|</span>
                          <span className={`font-extrabold ${p.stock > 0 ? "text-emerald-600" : "text-rose-600"}`}>উপলব্ধ স্টক: {p.stock} টি</span>
                        </div>
                      </div>

                      <button
                        onClick={() => handleDeleteProd(p.id)}
                        className="bg-rose-50 text-rose-600 hover:bg-rose-100 p-2 rounded-xl transition"
                        title="পণ্য ডিলিট করুন"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* 3. Task Submissions Manager */}
        {activeTab === "tasks" && (
          <div className="bg-white rounded-2xl border border-slate-100 shadow-xs overflow-hidden">
            <h3 className="bg-slate-50 px-4 py-3 text-xs font-bold text-slate-700 border-b border-slate-100">কর্মী কাজ সাবমিশন তালিকা</h3>
            
            {submissions.length === 0 ? (
              <div className="py-12 text-center text-slate-400 text-xs">
                কোনো কাজের সাবমিশন পাওয়া যায়নি।
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-100 text-xxs font-bold text-slate-500 uppercase tracking-wider">
                      <th className="py-2.5 px-4">কর্মী বিকাশ নম্বর</th>
                      <th className="py-2.5 px-4">তারিখ</th>
                      <th className="py-2.5 px-4">কাজের ধরন</th>
                      <th className="py-2.5 px-4">গুগল শিট লিঙ্ক (Google Sheets)</th>
                      <th className="py-2.5 px-4">নোট / বিবরণ</th>
                      <th className="py-2.5 px-4 text-center">স্ট্যাটাস / একশন</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs">
                    {submissions.slice().reverse().map((sub) => (
                      <tr key={sub.id} className="hover:bg-slate-50/30">
                        <td className="py-3.5 px-4 font-mono font-bold text-slate-800">{sub.userId}</td>
                        <td className="py-3.5 px-4 text-xxs text-slate-400 whitespace-nowrap">
                          {new Date(sub.createdAt).toLocaleString()}
                        </td>
                        <td className="py-3.5 px-4">
                          <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${sub.taskType === "3day_old" ? "bg-amber-50 text-amber-700 border border-amber-100" : "bg-indigo-50 text-indigo-700 border border-indigo-100"}`}>
                            {sub.taskType === "3day_old" ? "৩ দিনের পুরনো" : "২-ফ্যাক্টর (2FA)"}
                          </span>
                        </td>
                        <td className="py-3.5 px-4">
                          <a
                            href={sub.sheetLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-indigo-600 font-bold hover:underline font-mono inline-flex items-center gap-1"
                          >
                            গুগল শিট
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        </td>
                        <td className="py-3.5 px-4 max-w-[200px] truncate font-mono text-xxs text-slate-600" title={sub.note}>
                          {sub.note || "কোনো মন্তব্য নেই"}
                        </td>
                        <td className="py-3.5 px-4">
                          {sub.status === "pending" ? (
                            <div className="flex items-center justify-center gap-1.5">
                              <button
                                onClick={() => handleActionSub(sub.id, "approved")}
                                className="bg-emerald-600 hover:bg-emerald-700 text-white px-2 py-1 rounded-lg text-xxs font-bold flex items-center gap-0.5 shadow-sm transition"
                              >
                                <Check className="w-3 h-3" />
                                গ্রহণ
                              </button>
                              <button
                                onClick={() => handleActionSub(sub.id, "rejected")}
                                className="bg-rose-600 hover:bg-rose-700 text-white px-2 py-1 rounded-lg text-xxs font-bold flex items-center gap-0.5 shadow-sm transition"
                              >
                                <X className="w-3 h-3" />
                                বাতিল
                              </button>
                            </div>
                          ) : (
                            <div className="text-center">
                              <span className={`inline-block px-2.5 py-0.5 rounded-full text-xxs font-bold ${sub.status === "approved" ? "bg-emerald-50 text-emerald-700 border border-emerald-100" : "bg-rose-50 text-rose-700 border border-rose-100"}`}>
                                {sub.status === "approved" ? "গৃহীত" : "বাতিলকৃত"}
                              </span>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* 4. Users Manager */}
        {activeTab === "users" && (
          <div className="bg-white rounded-2xl border border-slate-100 shadow-xs overflow-hidden">
            <h3 className="bg-slate-50 px-4 py-3 text-xs font-bold text-slate-700 border-b border-slate-100">সিস্টেম ইউজার তালিকা ও ব্যালেন্স নিয়ন্ত্রণ</h3>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100 text-xxs font-bold text-slate-500 uppercase tracking-wider">
                    <th className="py-3 px-4">বিকাশ মোবাইল আইডি</th>
                    <th className="py-3 px-4">বর্তমান ব্যালেন্স</th>
                    <th className="py-3 px-4">রেফারার</th>
                    <th className="py-3 px-4">টোটাল সাইনআপ (রেফার)</th>
                    <th className="py-3 px-4">ক্রয় সংখ্যা</th>
                    <th className="py-3 px-4">মোট ডিপোজিট</th>
                    <th className="py-3 px-4 text-center">ব্লক / ব্যালেন্স সম্পাদন</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {users.map((u) => (
                    <tr key={u.id} className="hover:bg-slate-50/30">
                      <td className="py-3 px-4 font-mono font-bold text-slate-800">
                        {u.id}
                        {u.isAdmin && <span className="ml-1.5 bg-rose-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-sm">ADMIN</span>}
                      </td>
                      <td className="py-3 px-4">
                        {editingUserId === u.id ? (
                          <div className="flex items-center gap-1.5">
                            <input
                              type="number"
                              placeholder="পরিমাণ"
                              value={editBalanceVal}
                              onChange={(e) => setEditBalanceVal(e.target.value)}
                              className="w-20 border border-slate-300 rounded px-1.5 py-1 text-xs font-mono"
                            />
                            <button
                              onClick={() => handleUpdateBalance(u.id)}
                              className="bg-emerald-600 text-white p-1 rounded hover:bg-emerald-700"
                              title="সেভ"
                            >
                              <Check className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => setEditingUserId(null)}
                              className="bg-slate-200 text-slate-600 p-1 rounded hover:bg-slate-300"
                            >
                              ✕
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1">
                            <span className="font-bold text-slate-900 font-mono">৳{u.balance}</span>
                            <button
                              onClick={() => { setEditingUserId(u.id); setEditBalanceVal(String(u.balance)); }}
                              className="text-slate-400 hover:text-indigo-600 p-0.5"
                              title="ব্যালেন্স এডিট করুন"
                            >
                              <Edit className="w-3 h-3" />
                            </button>
                          </div>
                        )}
                      </td>
                      <td className="py-3 px-4 font-mono text-slate-500">{u.referredBy || "-"}</td>
                      <td className="py-3 px-4 font-mono">{u.referralsCount} জন</td>
                      <td className="py-3 px-4 font-mono">{u.purchasesCount} টি</td>
                      <td className="py-3 px-4 font-mono font-semibold text-emerald-600">৳{u.totalDeposited}</td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => { setSelectedTreeUser(u); setShowTreeModal(true); }}
                            className="bg-indigo-50 text-indigo-700 border border-indigo-150 hover:bg-indigo-100 px-2.5 py-1 rounded-lg text-xxs font-bold flex items-center gap-1 transition"
                            title="রেফারেল নেটওয়ার্ক ট্রি ভিউ"
                          >
                            <Network className="w-3.5 h-3.5 text-indigo-600" />
                            ট্রি ভিউ
                          </button>
                          {!u.isAdmin ? (
                            <button
                              onClick={() => handleToggleBlock(u.id)}
                              className={`px-2 py-1 rounded-lg text-xxs font-bold flex items-center gap-0.5 transition ${u.isBlocked ? "bg-emerald-50 text-emerald-700 border border-emerald-100 hover:bg-emerald-100" : "bg-rose-50 text-rose-700 border border-rose-100 hover:bg-rose-100"}`}
                            >
                              {u.isBlocked ? <ShieldCheck className="w-3 h-3" /> : <ShieldAlert className="w-3 h-3" />}
                              {u.isBlocked ? "আনব্লক" : "ব্লক"}
                            </button>
                          ) : (
                            <span className="text-xxs text-slate-400 italic">একশন নিষিদ্ধ</span>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 5. Settings, Configs & Notice updates */}
        {activeTab === "settings" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* System Config forms */}
            <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-xs space-y-4">
              <h3 className="font-bold text-slate-900 text-xs uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-50 pb-2">
                <Settings className="w-4 h-4 text-rose-500" />
                সিস্টেম প্যারামিটার ও নম্বর কনফিগার
              </h3>
              <form onSubmit={handleUpdateConfigSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xxs font-bold text-slate-700 block uppercase">বিকাশ পার্সোনাল নম্বর</label>
                    <input
                      type="text"
                      required
                      value={bkashNumber}
                      onChange={(e) => setBkashNumber(e.target.value)}
                      className="w-full text-xs font-semibold border border-slate-200 rounded-xl px-3 py-2 bg-slate-50 focus:bg-white outline-hidden font-mono"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xxs font-bold text-slate-700 block uppercase">রেফারেল বোনাস হার (%)</label>
                    <input
                      type="number"
                      required
                      value={refBonusPercent}
                      onChange={(e) => setRefBonusPercent(e.target.value)}
                      className="w-full text-xs font-semibold border border-slate-200 rounded-xl px-3 py-2 bg-slate-50 focus:bg-white outline-hidden font-mono"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xxs font-bold text-slate-700 block uppercase">টোকেন টু কোড লিঙ্ক</label>
                  <input
                    type="text"
                    value={tokenLink}
                    onChange={(e) => setTokenLink(e.target.value)}
                    className="w-full text-xs border border-slate-200 rounded-xl px-3 py-2 bg-slate-50 focus:bg-white outline-hidden font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xxs font-bold text-slate-700 block uppercase">২-ফ্যাক্টর কোড জেনারেটর লিঙ্ক</label>
                  <input
                    type="text"
                    value={twoFaLink}
                    onChange={(e) => setTwoFaLink(e.target.value)}
                    className="w-full text-xs border border-slate-200 rounded-xl px-3 py-2 bg-slate-50 focus:bg-white outline-hidden font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xxs font-bold text-slate-700 block uppercase">হোয়াটসঅ্যাপ গ্রুপ লিঙ্ক</label>
                  <input
                    type="text"
                    value={whatsappGroupLink}
                    onChange={(e) => setWhatsappGroupLink(e.target.value)}
                    className="w-full text-xs border border-slate-200 rounded-xl px-3 py-2 bg-slate-50 focus:bg-white outline-hidden font-mono"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xxs font-bold text-slate-700 block uppercase">এডমিন WhatsApp নম্বর</label>
                    <input
                      type="text"
                      required
                      placeholder="যেমন: 88017..."
                      value={adminWhatsApp}
                      onChange={(e) => setAdminWhatsApp(e.target.value)}
                      className="w-full text-xs border border-slate-200 rounded-xl px-3 py-2 bg-slate-50 focus:bg-white outline-hidden font-mono"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xxs font-bold text-slate-700 block uppercase">ডেভেলপার WhatsApp নম্বর</label>
                    <input
                      type="text"
                      required
                      placeholder="যেমন: 88018..."
                      value={developerWhatsApp}
                      onChange={(e) => setDeveloperWhatsApp(e.target.value)}
                      className="w-full text-xs border border-slate-200 rounded-xl px-3 py-2 bg-slate-50 focus:bg-white outline-hidden font-mono"
                    />
                  </div>
                </div>

                <button type="submit" className="w-full bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold py-2.5 rounded-xl transition">
                  সেটিংস সেভ করুন
                </button>
              </form>
            </div>

            {/* System Notice updates */}
            <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-xs space-y-4 h-fit">
              <h3 className="font-bold text-slate-900 text-xs uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-50 pb-2">
                <BellRing className="w-4 h-4 text-rose-500" />
                জরুরী নোটিশ আপডেট (System Notice)
              </h3>
              <form onSubmit={handleUpdateNoticeSubmit} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xxs font-bold text-slate-700 block uppercase">নোটিশ কনটেন্ট</label>
                  <textarea
                    required
                    rows={6}
                    value={noticeContent}
                    onChange={(e) => setNoticeContent(e.target.value)}
                    className="w-full text-xs border border-slate-200 rounded-xl p-3 bg-slate-50 focus:bg-white outline-hidden leading-relaxed"
                  />
                </div>
                <button type="submit" className="w-full bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold py-2.5 rounded-xl transition shadow-sm shadow-rose-100">
                  নোটিশ পাবলিশ করুন
                </button>
              </form>
            </div>
          </div>
        )}
      </div>

      {/* Interactive Referral Tree Map Modal */}
      {showTreeModal && selectedTreeUser && (
        <div className="fixed inset-0 z-50 bg-slate-950/45 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-2xl overflow-hidden border border-slate-100 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="bg-slate-900 text-white p-5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Network className="w-5 h-5 text-indigo-400" />
                <div>
                  <h3 className="font-bold text-sm md:text-base">রেফারেল কানেকশন ট্রি (Referral Network Map)</h3>
                  <p className="text-slate-400 text-[10px] font-mono">ইউজার আইডি: {selectedTreeUser.id}</p>
                </div>
              </div>
              <button
                onClick={() => { setShowTreeModal(false); setSelectedTreeUser(null); }}
                className="text-slate-400 hover:text-white bg-slate-800 p-1.5 rounded-full transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 bg-slate-50 space-y-6 max-h-[70vh] overflow-y-auto">
              
              {/* Interactive Diagram Section */}
              <div className="bg-slate-900 rounded-2xl p-6 text-white relative flex flex-col items-center">
                
                {/* Upline Node (If exists) */}
                {selectedTreeUser.referredBy ? (
                  <div className="flex flex-col items-center">
                    <div className="bg-slate-850 border border-slate-700/80 px-3 py-1.5 rounded-xl text-center shadow-md">
                      <span className="text-[8px] font-bold text-slate-400 block uppercase tracking-wider">UPLINE (রেফারার)</span>
                      <span className="font-mono text-xxs font-bold text-slate-300">{selectedTreeUser.referredBy}</span>
                      {users.find(u => u.id === selectedTreeUser.referredBy) && (
                        <span className="text-[9px] text-emerald-400 font-mono block mt-0.5">
                          ডিপোজিট: ৳{users.find(u => u.id === selectedTreeUser.referredBy)?.totalDeposited}
                        </span>
                      )}
                    </div>
                    <div className="w-0.5 h-6 bg-indigo-500/50 my-1"></div>
                    <div className="text-[9px] text-indigo-400 font-bold -my-1">REFERRED BY</div>
                    <div className="w-0.5 h-6 bg-indigo-500/50 my-1"></div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center">
                    <div className="bg-slate-800/40 border border-slate-850 border-dashed px-3 py-1.5 rounded-xl text-center text-slate-500 text-xxs">
                      কোনো আপলাইন নেই (Direct Register)
                    </div>
                    <div className="w-0.5 h-6 bg-slate-800 border-dashed my-1"></div>
                  </div>
                )}

                {/* Central Target Node */}
                <div className="bg-indigo-600 border-2 border-indigo-400 px-5 py-2.5 rounded-2xl text-center shadow-lg shadow-indigo-500/30 z-10 scale-105 my-2">
                  <span className="text-[8px] font-extrabold text-indigo-200 block uppercase tracking-widest">TARGET ACCOUNT</span>
                  <span className="font-mono font-bold text-xs">{selectedTreeUser.id}</span>
                  <div className="grid grid-cols-2 gap-2 mt-1 pt-1.5 border-t border-indigo-500/40 text-[9px] text-indigo-100">
                    <div>ব্যালেন্স: <span className="font-bold">৳{selectedTreeUser.balance}</span></div>
                    <div>ডিপোজিট: <span className="font-bold">৳{selectedTreeUser.totalDeposited}</span></div>
                  </div>
                </div>

                {/* Downline Connecting Line */}
                {users.filter(u => u.referredBy === selectedTreeUser.id).length > 0 && (
                  <div className="w-0.5 h-6 bg-emerald-500/50 my-1"></div>
                )}

                {/* Downlines Grid */}
                {users.filter(u => u.referredBy === selectedTreeUser.id).length === 0 ? (
                  <div className="text-center bg-slate-850/60 border border-slate-850 border-dashed rounded-xl p-4 text-slate-500 text-xxs mt-2 w-full max-w-sm">
                    এই ইউজার এখনও কাউকে রেফার করেননি।
                  </div>
                ) : (
                  <div className="w-full mt-2">
                    <div className="relative flex justify-center">
                      <div className="absolute top-0 left-6 right-6 h-0.5 bg-emerald-500/50"></div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3">
                      {users.filter(u => u.referredBy === selectedTreeUser.id).map((down, dIdx) => (
                        <div key={down.id} className="flex flex-col items-center">
                          <div className="w-0.5 h-3 bg-emerald-500/50 -mt-3 mb-1"></div>
                          <div className="bg-slate-850 border border-slate-800 p-2.5 rounded-xl text-center w-full shadow-md">
                            <div className="flex items-center justify-between text-[10px] pb-1 border-b border-slate-800 mb-1.5">
                              <span className="font-mono font-bold text-slate-200">{down.id}</span>
                              <span className="bg-emerald-500/10 text-emerald-400 text-[8px] font-bold px-1.5 rounded-xs">D-{dIdx+1}</span>
                            </div>
                            <div className="grid grid-cols-2 gap-1 text-[9px] text-slate-400 text-left">
                              <div>ব্যালেন্স: <span className="font-bold text-slate-200">৳{down.balance}</span></div>
                              <div>ডিপোজিট: <span className="font-bold text-emerald-400">৳{down.totalDeposited}</span></div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

              </div>

              {/* Detailed User Stats */}
              <div className="bg-white border border-slate-100 rounded-2xl p-4 space-y-3 shadow-xs">
                <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider border-b border-slate-50 pb-1.5">ইউজার নেটওয়ার্ক বিবরণী</h4>
                <div className="grid grid-cols-3 gap-2.5 text-center text-xs">
                  <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                    <span className="text-xxs text-slate-400 block font-semibold">ডাইরেক্ট রেফারাল</span>
                    <span className="font-mono font-bold text-slate-800 mt-0.5 block">
                      {users.filter(u => u.referredBy === selectedTreeUser.id).length} জন
                    </span>
                  </div>
                  <div className="bg-indigo-50 p-2.5 rounded-xl border border-indigo-100">
                    <span className="text-xxs text-indigo-400 block font-semibold">মোট ব্যালেন্স</span>
                    <span className="font-mono font-bold text-indigo-700 mt-0.5 block">৳{selectedTreeUser.balance}</span>
                  </div>
                  <div className="bg-emerald-50 p-2.5 rounded-xl border border-emerald-100">
                    <span className="text-xxs text-emerald-500 block font-semibold">মোট কেনাকাটা</span>
                    <span className="font-mono font-bold text-emerald-700 mt-0.5 block">{selectedTreeUser.purchasesCount} টি মেইল</span>
                  </div>
                </div>
              </div>

            </div>

            {/* Modal Footer */}
            <div className="bg-slate-50 px-5 py-3 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => { setShowTreeModal(false); setSelectedTreeUser(null); }}
                className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold px-4 py-2 rounded-xl transition"
              >
                বন্ধ করুন
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
