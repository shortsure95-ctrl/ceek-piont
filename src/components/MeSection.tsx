import React, { useState, useEffect } from "react";
import { Deposit, Purchase, Referral, SystemConfig } from "../types";
import { User, Wallet, Copy, Check, Calendar, ShoppingBag, ArrowDownLeft, Share2, Users, FileText, Settings, Image, CheckCircle, PlusCircle, Lock, Phone, MessageSquare } from "lucide-react";
import { motion } from "motion/react";

interface MeSectionProps {
  userId: string;
  userBalance: number;
  deposits: Deposit[];
  purchases: Purchase[];
  referrals: Referral[];
  config: SystemConfig;
  onSubmitDeposit: (amount: number, bKashNumber: string, transactionId: string, screenshot?: string) => Promise<void>;
  onRefresh: () => void;
  userDisplayName?: string;
  userAvatarUrl?: string;
  bKashNumber?: string;
  whatsAppNumber?: string;
  userPassword?: string;
  onUpdateProfile?: (
    displayName: string,
    avatarUrl: string,
    bKashNumber?: string,
    whatsAppNumber?: string,
    password?: string
  ) => Promise<void>;
  onOpenAddMoney?: () => void;
}

export const MeSection: React.FC<MeSectionProps> = ({
  userId,
  userBalance,
  deposits,
  purchases,
  referrals,
  config,
  onSubmitDeposit,
  onRefresh,
  userDisplayName = "",
  userAvatarUrl = "",
  bKashNumber = "",
  whatsAppNumber = "",
  userPassword = "",
  onUpdateProfile,
  onOpenAddMoney
}) => {
  // General UI state
  const [refCopied, setRefCopied] = useState<boolean>(false);
  const [copiedMailIndex, setCopiedMailIndex] = useState<number | null>(null);

  // Active sub-tab under Profile
  const [activeSubTab, setActiveSubTab] = useState<"profile_settings" | "purchase_history" | "deposit_history" | "referral">("profile_settings");

  // Profile Edit fields
  const [editName, setEditName] = useState(userDisplayName || "");
  const [editAvatar, setEditAvatar] = useState(userAvatarUrl || "");
  const [editBKashNumber, setEditBKashNumber] = useState(bKashNumber || userId || "");
  const [editWhatsAppNumber, setEditWhatsAppNumber] = useState(whatsAppNumber || "");
  const [editPassword, setEditPassword] = useState(userPassword || "");
  const [updatingProfile, setUpdatingProfile] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState<string | null>(null);
  const [profileError, setProfileError] = useState<string | null>(null);

  // Sync props to state
  useEffect(() => {
    if (userDisplayName) setEditName(userDisplayName);
    if (userAvatarUrl) setEditAvatar(userAvatarUrl);
    if (bKashNumber) setEditBKashNumber(bKashNumber);
    if (whatsAppNumber) setEditWhatsAppNumber(whatsAppNumber);
    if (userPassword) setEditPassword(userPassword);
  }, [userDisplayName, userAvatarUrl, bKashNumber, whatsAppNumber, userPassword]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!onUpdateProfile) return;
    setUpdatingProfile(true);
    setProfileSuccess(null);
    setProfileError(null);
    try {
      await onUpdateProfile(
        editName.trim(),
        editAvatar,
        editBKashNumber.trim(),
        editWhatsAppNumber.trim(),
        editPassword
      );
      setProfileSuccess("প্রোফাইল তথ্য সফলভাবে আপডেট হয়েছে!");
      setTimeout(() => setProfileSuccess(null), 3000);
      onRefresh();
    } catch (err: any) {
      setProfileError(err.message || "প্রোফাইল আপডেট করতে ব্যর্থ হয়েছে।");
    } finally {
      setUpdatingProfile(false);
    }
  };

  const downloadAllMails = (format: "txt" | "csv") => {
    if (purchases.length === 0) return;
    let content = "";
    let filename = `purchased_mails_${userId}`;
    
    if (format === "txt") {
      content = purchases.map(p => p.content).join("\n");
      filename += ".txt";
    } else {
      // Excel/CSV
      content = "\ufeffProduct,Credentials,Purchase Date,Price\n" + 
        purchases.map(p => `"${p.productName.replace(/"/g, '""')}","${p.content.replace(/"/g, '""')}","${new Date(p.soldAt).toLocaleString()}",${p.price}`).join("\n");
      filename += ".csv";
    }

    const blob = new Blob([content], { type: format === "txt" ? "text/plain;charset=utf-8;" : "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const copyReferralLink = () => {
    const link = `${window.location.origin}/?ref=${userId}`;
    navigator.clipboard.writeText(link);
    setRefCopied(true);
    setTimeout(() => setRefCopied(false), 2000);
  };

  const copyMailContent = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedMailIndex(index);
    setTimeout(() => setCopiedMailIndex(null), 2000);
  };

  const totalReferralBonusEarned = referrals.reduce((sum, ref) => {
    const rate = config.referralBonusPercent || 5;
    return sum + Number(((ref.totalDepositedByThem * rate) / 100).toFixed(2));
  }, 0);

  return (
    <div className="space-y-6">
      {/* Premium 3D Balance Card placed prominently at the very top of the user profile section */}
      <div className="bg-gradient-to-br from-rose-500 via-pink-500 to-rose-600 text-white rounded-3xl p-6 shadow-lg relative overflow-hidden border-2 border-rose-350 shadow-[0_8px_0_0_#f43f5e15] flex flex-col justify-between min-h-[140px] group transition-all duration-300 hover:shadow-[0_12px_24px_rgba(244,63,94,0.15)] hover:-translate-y-0.5">
        <div className="absolute -right-6 -bottom-6 opacity-10 text-white pointer-events-none">
          <Wallet className="w-36 h-36" />
        </div>

        <div className="flex items-center justify-between z-10">
          <div>
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-rose-100 block">CURRENT ACCOUNT BALANCE</span>
            <span className="text-3xl md:text-4xl font-black font-mono tracking-tight block mt-1">৳ {userBalance.toFixed(2)}</span>
          </div>
          {onOpenAddMoney && (
            <button
              onClick={onOpenAddMoney}
              className="bg-white hover:bg-rose-50 text-rose-600 text-xs font-black px-4.5 py-3 rounded-2xl flex items-center gap-1.5 shadow-md shadow-rose-950/20 transition duration-200 cursor-pointer active:scale-95"
            >
              <PlusCircle className="w-4 h-4 text-rose-500" />
              <span>টাকা এড করুন</span>
            </button>
          )}
        </div>

        <div className="flex items-center justify-between z-10 border-t border-white/10 pt-3.5 mt-3.5">
          <div className="flex items-center gap-1.5 text-[9px] font-extrabold bg-white/15 px-3 py-1 rounded-xl border border-white/10">
            <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
            <span>সক্রিয় অ্যাকাউন্ট (Verified User)</span>
          </div>
          <Wallet className="w-5 h-5 text-white/50" />
        </div>
      </div>

      {/* Dynamic User Identity Card right below the balance */}
      <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm flex flex-col sm:flex-row justify-between items-center gap-4 relative overflow-hidden">
        {/* Profile Avatar & Identity */}
        <div className="flex items-center gap-4 w-full sm:w-auto">
          <div className="relative shrink-0">
            <img
              src={userAvatarUrl || "https://api.dicebear.com/7.x/avataaars/svg?seed=Felix"}
              alt="Avatar"
              referrerPolicy="no-referrer"
              className="w-14 h-14 rounded-2xl border-2 border-rose-200 bg-slate-50 object-cover shadow-inner"
            />
            <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-emerald-500 border-2 border-white rounded-full animate-pulse" />
          </div>
          <div>
            <h2 className="text-base font-black tracking-wide text-slate-900 leading-snug">
              {userDisplayName || "RTN ইউজার"}
            </h2>
            <p className="text-xxs text-slate-400 font-mono mt-0.5 tracking-wider">মোবাইল নম্বর: {userId}</p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 w-full sm:w-auto border-t sm:border-t-0 border-slate-100 pt-3 sm:pt-0 justify-between sm:justify-end">
          <div className="text-left sm:text-right">
            <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wider">টোটাল ক্রয়কৃত মেইল</span>
            <span className="text-sm font-black text-slate-700 font-mono mt-0.5">{purchases.length} টি</span>
          </div>
          <span className="inline-block bg-rose-50 text-rose-600 text-[9px] font-black px-3 py-1 rounded-xl uppercase tracking-wider shrink-0 border border-rose-100">
            PREMIUM MEMBER
          </span>
        </div>
      </div>

      {/* Sub-Tab Navigation inside Profile */}
      <div className="flex border-b border-slate-200 overflow-x-auto pb-px scrollbar-none">
        <button
          onClick={() => setActiveSubTab("profile_settings")}
          className={`py-3 px-4 font-bold text-xs md:text-sm border-b-2 whitespace-nowrap shrink-0 transition-all ${activeSubTab === "profile_settings" ? "border-indigo-600 text-indigo-600 font-black" : "border-transparent text-slate-500 hover:text-slate-800"}`}
        >
          প্রোফাইল সেটিংস
        </button>
        <button
          onClick={() => setActiveSubTab("purchase_history")}
          className={`py-3 px-4 font-bold text-xs md:text-sm border-b-2 whitespace-nowrap shrink-0 transition-all ${activeSubTab === "purchase_history" ? "border-indigo-600 text-indigo-600 font-black" : "border-transparent text-slate-500 hover:text-slate-800"}`}
        >
          ক্রয়কৃত মেইলসমূহ ({purchases.length})
        </button>
        <button
          onClick={() => setActiveSubTab("deposit_history")}
          className={`py-3 px-4 font-bold text-xs md:text-sm border-b-2 whitespace-nowrap shrink-0 transition-all ${activeSubTab === "deposit_history" ? "border-indigo-600 text-indigo-600 font-black" : "border-transparent text-slate-500 hover:text-slate-800"}`}
        >
          ডিপোজিট হিস্ট্রি ({deposits.length})
        </button>
        <button
          onClick={() => setActiveSubTab("referral")}
          className={`py-3 px-4 font-bold text-xs md:text-sm border-b-2 whitespace-nowrap shrink-0 transition-all ${activeSubTab === "referral" ? "border-indigo-600 text-indigo-600 font-black" : "border-transparent text-slate-500 hover:text-slate-800"}`}
        >
          রেফারেল ও ট্রি
        </button>
      </div>

      {/* Sub-Tab Contents */}
      <div className="transition-all duration-300">
        
        {/* PROFILE SETTINGS TAB */}
        {activeSubTab === "profile_settings" && (
          <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-xs space-y-5">
            <div className="flex items-center gap-2 border-b border-slate-50 pb-2.5">
              <Settings className="w-4.5 h-4.5 text-indigo-600" />
              <h3 className="font-extrabold text-slate-900 text-sm">আপনার প্রোফাইল তথ্য পরিবর্তন করুন</h3>
            </div>

            <form onSubmit={handleUpdateProfile} className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Nickname Field */}
                <div className="space-y-2">
                  <label className="text-xxs font-bold text-slate-700 uppercase tracking-wide block flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-indigo-600" />
                    আপনার নাম/নিকনেম (Nickname) *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="যেমন: রানা আহমেদ"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="w-full text-xs font-bold border border-slate-200 rounded-xl px-3.5 py-2.5 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition outline-hidden"
                  />
                </div>

                {/* bKash Number Field */}
                <div className="space-y-2">
                  <label className="text-xxs font-bold text-slate-700 uppercase tracking-wide block flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-indigo-600" />
                    বিকাশ নম্বর (bKash Number) *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="যেমন: 017XXXXXXXX"
                    value={editBKashNumber}
                    onChange={(e) => setEditBKashNumber(e.target.value)}
                    className="w-full text-xs font-bold border border-slate-200 rounded-xl px-3.5 py-2.5 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition outline-hidden font-mono"
                  />
                </div>

                {/* WhatsApp Number Field */}
                <div className="space-y-2">
                  <label className="text-xxs font-bold text-slate-700 uppercase tracking-wide block flex items-center gap-1.5">
                    <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
                    হোয়াটসঅ্যাপ নম্বর (WhatsApp Number)
                  </label>
                  <input
                    type="text"
                    placeholder="যেমন: +88017XXXXXXXX"
                    value={editWhatsAppNumber}
                    onChange={(e) => setEditWhatsAppNumber(e.target.value)}
                    className="w-full text-xs font-bold border border-slate-200 rounded-xl px-3.5 py-2.5 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition outline-hidden font-mono"
                  />
                </div>

                {/* Password Change Field */}
                <div className="space-y-2">
                  <label className="text-xxs font-bold text-slate-700 uppercase tracking-wide block flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5 text-rose-500" />
                    অ্যাকাউন্ট পাসওয়ার্ড (Password) *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="আপনার পাসওয়ার্ড দিন"
                    value={editPassword}
                    onChange={(e) => setEditPassword(e.target.value)}
                    className="w-full text-xs font-bold border border-slate-200 rounded-xl px-3.5 py-2.5 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition outline-hidden font-mono"
                  />
                </div>
              </div>

              {/* Upload Profile Image & URL Option (No Presets) */}
              <div className="bg-slate-50 border border-slate-150 rounded-2xl p-4 space-y-4">
                <span className="text-xxs font-extrabold text-slate-800 uppercase tracking-wider block flex items-center gap-1.5">
                  <Image className="w-4 h-4 text-indigo-600" />
                  আপনার প্রোফাইল ছবি পরিবর্তন করুন (Profile Picture Settings)
                </span>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide block">আপনার ডিভাইস থেকে ছবি আপলোড করুন:</label>
                    <div className="flex items-center gap-3">
                      <label className="flex items-center justify-center gap-1.5 px-4 py-2 bg-white hover:bg-slate-50 text-slate-800 text-xs font-extrabold rounded-xl border border-slate-250 cursor-pointer transition active:scale-95 shadow-xxs">
                        <PlusCircle className="w-4 h-4 text-indigo-600" />
                        <span>ছবি নির্বাচন করুন</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              if (file.size > 1.5 * 1024 * 1024) {
                                setProfileError("ফাইলের সাইজ অনেক বড়! ১.৫ এমবি এর নিচের ছবি আপলোড করুন।");
                                return;
                              }
                              setProfileError(null);
                              const reader = new FileReader();
                              reader.onloadend = () => {
                                if (typeof reader.result === "string") {
                                  setEditAvatar(reader.result);
                                }
                              };
                              reader.readAsDataURL(file);
                            }
                          }}
                          className="hidden"
                        />
                      </label>
                      {editAvatar && (
                        <div className="flex items-center gap-1.5">
                          <img src={editAvatar} alt="preview" className="w-8 h-8 rounded-full object-cover border border-indigo-200" />
                          <span className="text-xxs font-bold text-emerald-600">রেডি!</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide block">অথবা কাস্টম ছবির লিংক (Direct Image URL) দিন:</label>
                    <input
                      type="text"
                      placeholder="যেমন: https://example.com/photo.jpg"
                      value={editAvatar.startsWith("data:") ? "" : editAvatar}
                      onChange={(e) => setEditAvatar(e.target.value)}
                      className="w-full text-xs border border-slate-250 rounded-xl px-3 py-2 bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition outline-hidden font-mono"
                    />
                  </div>
                </div>
              </div>

              {profileError && (
                <div className="bg-rose-50 text-rose-700 p-2.5 rounded-xl border border-rose-100 text-xxs font-semibold">
                  {profileError}
                </div>
              )}

              {profileSuccess && (
                <div className="bg-emerald-50 text-emerald-700 p-2.5 rounded-xl border border-emerald-100 text-xxs font-semibold">
                  {profileSuccess}
                </div>
              )}

              <button
                type="submit"
                disabled={updatingProfile}
                className={`w-full py-2.5 rounded-xl text-xs font-bold text-white transition ${updatingProfile ? "bg-indigo-400 cursor-not-allowed" : "bg-indigo-600 hover:bg-indigo-700 shadow-sm shadow-indigo-100 cursor-pointer"}`}
              >
                {updatingProfile ? "আপডেট হচ্ছে..." : "প্রোফাইল তথ্য আপডেট করুন"}
              </button>
            </form>
          </div>
        )}

        {/* PURCHASE HISTORY TAB */}
        {activeSubTab === "purchase_history" && (
          <div className="space-y-3">
            {purchases.length === 0 ? (
              <div className="bg-white border border-slate-100 rounded-2xl py-12 text-center text-slate-500 text-sm">
                আপনি এখনও কোনো মেইল ক্রয় করেননি।
              </div>
            ) : (
              <>
                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 shadow-xs">
                  <div>
                    <h4 className="font-bold text-slate-900 text-xs flex items-center gap-1">
                      <FileText className="w-4 h-4 text-indigo-600" />
                      সবগুলো ক্রয়কৃত মেইল ডাউনলোড
                    </h4>
                    <p className="text-slate-400 text-[10px] mt-0.5">আপনার কেনা মেইলগুলো এক ক্লিকেই সংরক্ষণ করুন</p>
                  </div>
                  <div className="flex gap-2 w-full sm:w-auto">
                    <button
                      onClick={() => downloadAllMails("txt")}
                      className="flex-1 sm:flex-none bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 text-[11px] font-bold py-2 px-3.5 rounded-xl cursor-pointer transition text-center"
                    >
                      Notepad (.txt)
                    </button>
                    <button
                      onClick={() => downloadAllMails("csv")}
                      className="flex-1 sm:flex-none bg-indigo-600 text-white hover:bg-indigo-700 text-[11px] font-bold py-2 px-3.5 rounded-xl cursor-pointer transition text-center"
                    >
                      Excel / CSV (.csv)
                    </button>
                  </div>
                </div>

                {purchases.map((purchase, index) => (
                  <div key={purchase.id} className="bg-white border border-slate-100 rounded-2xl p-4 shadow-xxs">
                    <div className="flex justify-between items-start gap-2 border-b border-slate-50 pb-2 mb-3">
                      <div>
                        <h4 className="font-bold text-slate-900 text-xs md:text-sm">{purchase.productName}</h4>
                        <span className="text-slate-400 text-xxs font-medium flex items-center gap-1 mt-0.5">
                          <Calendar className="w-3 h-3" />
                          {new Date(purchase.soldAt).toLocaleString()}
                        </span>
                      </div>
                      <span className="text-xs font-extrabold text-indigo-600 font-mono bg-indigo-50 px-2.5 py-1 rounded-full border border-indigo-100">
                        ৳{purchase.price}
                      </span>
                    </div>

                    <div className="bg-slate-50 border border-slate-200/60 rounded-xl p-3 flex justify-between items-center gap-3">
                      <p className="font-mono text-xs text-slate-700 break-all select-all leading-relaxed font-semibold">
                        {purchase.content}
                      </p>
                      <button
                        onClick={() => copyMailContent(purchase.content, index)}
                        className="bg-white border border-slate-250 p-2 rounded-lg text-indigo-600 hover:bg-indigo-50 transition shrink-0"
                        title="কপি করুন"
                      >
                        {copiedMailIndex === index ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                ))}
              </>
            )}
          </div>
        )}

        {/* DEPOSIT HISTORY TAB */}
        {activeSubTab === "deposit_history" && (
          <div className="bg-white rounded-2xl border border-slate-100 shadow-xs overflow-hidden">
            {deposits.length === 0 ? (
              <div className="py-12 text-center text-slate-500 text-sm">
                আপনার কোনো ডিপোজিট হিস্ট্রি নেই।
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-100 text-xxs font-bold text-slate-500 uppercase tracking-wider">
                      <th className="py-3 px-4">তারিখ</th>
                      <th className="py-3 px-4">পরিমাণ</th>
                      <th className="py-3 px-4">বিকাশ নম্বর</th>
                      <th className="py-3 px-4">TxID</th>
                      <th className="py-3 px-4 text-center">স্ট্যাটাস</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50 text-xs text-slate-700">
                    {deposits.map((dep) => (
                      <tr key={dep.id} className="hover:bg-slate-50/50">
                        <td className="py-3.5 px-4 font-mono text-slate-500 text-xxs whitespace-nowrap">
                          {new Date(dep.createdAt).toLocaleString()}
                        </td>
                        <td className="py-3.5 px-4 font-bold text-slate-950 font-mono">৳{dep.amount}</td>
                        <td className="py-3.5 px-4 font-mono text-slate-650">{dep.bKashNumber}</td>
                        <td className="py-3.5 px-4 font-mono text-slate-700 font-medium uppercase">{dep.transactionId}</td>
                        <td className="py-3.5 px-4 text-center whitespace-nowrap">
                          <span className={`inline-block px-2.5 py-0.5 rounded-full font-bold text-xxs ${dep.status === "approved" ? "bg-emerald-50 text-emerald-700 border border-emerald-100" : dep.status === "rejected" ? "bg-rose-50 text-rose-700 border border-rose-100" : "bg-amber-50 text-amber-700 border border-amber-100"}`}>
                            {dep.status === "approved" ? "অ্যাপ্রুভড" : dep.status === "rejected" ? "রিজেক্টেড" : "পেন্ডিং"}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* REFERRAL NETWORK TAB */}
        {activeSubTab === "referral" && (
          <div className="space-y-6">
            <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-xs space-y-4">
              <div className="flex items-center gap-2">
                <Share2 className="w-5 h-5 text-indigo-600" />
                <h3 className="font-bold text-slate-900 text-sm md:text-base">আপনার বন্ধুদের আমন্ত্রণ জানান</h3>
              </div>
              <p className="text-slate-500 text-xs md:text-sm leading-relaxed">
                আপনার রেফারেল লিঙ্কটি কপি করে বন্ধুদের সাথে শেয়ার করুন। তারা যখনই পেমেন্ট করে ব্যালেন্স যুক্ত করবে, আপনি সরাসরি তাদের ডিপোজিটের <span className="font-bold text-indigo-600">{config.referralBonusPercent}%</span> বোনাস পাবেন!
              </p>

              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 flex justify-between items-center gap-2">
                <span className="font-mono text-xs text-indigo-600 break-all select-all font-semibold">
                  {window.location.origin}/?ref={userId}
                </span>
                <button
                  onClick={copyReferralLink}
                  className="bg-indigo-600 text-white p-2.5 rounded-xl hover:bg-indigo-700 transition shrink-0 flex items-center gap-1 text-xs font-bold cursor-pointer"
                >
                  {refCopied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  <span>কপি</span>
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-3 border-t border-slate-50 text-center">
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <span className="text-xxs text-slate-400 font-semibold block">মোট রেফার সাইনআপ</span>
                  <span className="text-lg font-extrabold text-slate-800 font-mono flex items-center justify-center gap-1 mt-1">
                    <Users className="w-4 h-4 text-indigo-600" />
                    {referrals.length} জন
                  </span>
                </div>
                <div className="bg-emerald-50 p-3 rounded-xl border border-emerald-100">
                  <span className="text-xxs text-slate-500 font-semibold block">মোট রেফারেল ইনকাম</span>
                  <span className="text-lg font-extrabold text-emerald-700 font-mono flex items-center justify-center gap-1 mt-1">
                    ৳{totalReferralBonusEarned}
                  </span>
                </div>
              </div>
            </div>

            {/* Tree Network Visualization */}
            <div className="bg-slate-900 text-white border border-slate-800 rounded-3xl p-5 md:p-6 shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                <Users className="w-48 h-48 text-white" />
              </div>
              
              <h3 className="font-extrabold text-xs uppercase tracking-widest text-slate-400 mb-6 flex items-center gap-1.5">
                <Share2 className="w-4 h-4 text-indigo-400 animate-bounce" />
                আপনার রেফারেল নেটওয়ার্ক ট্রি (Referral Network Tree)
              </h3>
              
              <div className="flex flex-col items-center space-y-6">
                <div className="flex flex-col items-center">
                  <div className="bg-indigo-600 border border-indigo-400 px-5 py-2.5 rounded-2xl shadow-lg shadow-indigo-500/30 text-center scale-105">
                    <span className="text-[8px] font-extrabold text-indigo-200 block uppercase tracking-wider">ROOT ACCOUNT (YOU)</span>
                    <span className="font-mono font-bold text-xs">{userId}</span>
                  </div>
                  
                  {referrals.length > 0 && (
                    <div className="w-0.5 h-6 bg-slate-700 my-1"></div>
                  )}
                </div>

                {referrals.length === 0 ? (
                  <div className="text-center bg-slate-850 border border-slate-800/80 rounded-2xl p-6 text-slate-400 text-xs w-full max-w-sm">
                    <Users className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                    <span className="font-semibold block text-slate-300">রেফারেল নেটওয়ার্ক ফাঁকা রয়েছে!</span>
                    <p className="text-[10px] text-slate-500 mt-1 leading-relaxed">বন্ধুদের সাথে আপনার রেফারেল লিংক শেয়ার করে আপনার প্রথম ডাউনলাইন নেটওয়ার্ক ব্রাঞ্চ শুরু করুন!</p>
                  </div>
                ) : (
                  <div className="w-full">
                    <div className="relative flex justify-center hidden sm:flex animate-pulse">
                      <div className="absolute top-0 left-12 right-12 h-0.5 bg-slate-700"></div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 pt-4">
                      {referrals.map((ref, idx) => {
                        const comm = Number(((ref.totalDepositedByThem * config.referralBonusPercent) / 100).toFixed(2));
                        return (
                          <div key={ref.id} className="flex flex-col items-center relative">
                            <div className="w-0.5 h-4 bg-slate-700 -mt-4 mb-2 hidden sm:block"></div>
                            
                            <div className="bg-slate-850 border border-slate-800 p-4 rounded-2xl text-center w-full shadow-md hover:border-indigo-500/40 transition-all duration-200">
                              <div className="flex items-center justify-between mb-2.5 pb-2 border-b border-slate-800/80">
                                <span className="font-mono text-xs font-bold text-slate-100">
                                  {ref.id.substring(0, 5)}***{ref.id.substring(8)}
                                </span>
                                <span className="bg-emerald-500/10 text-emerald-400 text-[8px] font-bold px-2 py-0.5 rounded-sm">BRANCH {idx + 1}</span>
                              </div>
                              
                              <div className="grid grid-cols-2 gap-2 text-left text-[10px]">
                                <div className="bg-slate-900/50 p-2 rounded-xl border border-slate-800/60">
                                  <span className="text-slate-500 text-[9px] block">মোট ডিপোজিট</span>
                                  <span className="font-extrabold text-slate-200 font-mono">৳{ref.totalDepositedByThem}</span>
                                </div>
                                <div className="bg-emerald-500/5 p-2 rounded-xl border border-emerald-500/10">
                                  <span className="text-emerald-500/70 text-[9px] block">আপনার কমিশন</span>
                                  <span className="font-extrabold text-emerald-400 font-mono">৳{comm}</span>
                                </div>
                              </div>
                              
                              <div className="mt-2.5 text-[9px] text-slate-500 font-mono text-right">
                                জয়েনিং: {new Date(ref.createdAt).toLocaleDateString()}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
