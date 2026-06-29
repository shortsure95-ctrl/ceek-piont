import React, { useState, useEffect } from "react";
import { api } from "./api";
import { User, Product, Deposit, Purchase, Referral, Submission, SystemConfig, Notice, ChatMessage, UserStats, ChatUser } from "./types";
import { HomeSection } from "./components/HomeSection";
import { MeSection } from "./components/MeSection";
import { TaskSection } from "./components/TaskSection";
import { ChatSection } from "./components/ChatSection";
import { AdminPanel } from "./components/AdminPanel";
import { AddMoneyModal } from "./components/AddMoneyModal";
import { FloatingChatWidget } from "./components/FloatingChatWidget";
import { Home, Bell, Send, MessageSquare, User as UserIcon, ShieldAlert, LogOut, Loader2, PhoneCall, Gift, PlusCircle } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

export default function App() {
  // Authentication states
  const [userId, setUserId] = useState<string | null>(localStorage.getItem("userId"));
  const [user, setUser] = useState<User | null>(null);
  const [isRegistering, setIsRegistering] = useState<boolean>(false);

  // Login/Registration Form states
  const [formId, setFormId] = useState("");
  const [formPassword, setFormPassword] = useState("");
  const [regReferral, setRegReferral] = useState("");

  // System states
  const [products, setProducts] = useState<Product[]>([]);
  const [notices, setNotices] = useState<Notice[]>([]);
  const [config, setConfig] = useState<SystemConfig>({
    referralBonusPercent: 5,
    bkashNumber: "01788888888",
    tokenToCodeLink: "",
    twoFactorCodeLink: "",
    sourcingLink: "",
    adminWhatsApp: "8801788888888",
    developerWhatsApp: "8801700000000"
  });

  // User History states
  const [deposits, setDeposits] = useState<Deposit[]>([]);
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);

  // Chat states
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  // Admin Chat list states
  const [adminChatUsers, setAdminChatUsers] = useState<ChatUser[]>([]);
  const [adminSelectedChatUserId, setAdminSelectedChatUserId] = useState<string>("");
  const [adminChatMessages, setAdminChatMessages] = useState<ChatMessage[]>([]);

  // Admin lists
  const [adminDeposits, setAdminDeposits] = useState<Deposit[]>([]);
  const [adminSubmissions, setAdminSubmissions] = useState<Submission[]>([]);
  const [adminUsers, setAdminUsers] = useState<UserStats[]>([]);

  // Page layout states
  const [activeTab, setActiveTab] = useState<"home" | "notice" | "submit_task" | "chat" | "profile" | "admin">("home");
  const [isAddMoneyOpen, setIsAddMoneyOpen] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [authError, setAuthError] = useState<string | null>(null);
  const [authSuccess, setAuthSuccess] = useState<string | null>(null);

  // 1. Check URL parameters for Referral on boot
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const ref = params.get("ref");
    if (ref) {
      setRegReferral(ref);
      setIsRegistering(true);
      setAuthSuccess(`রেফারেল কোড (${ref}) সনাক্ত করা হয়েছে! অনুগ্রহ করে রেজিস্টার করুন।`);
    }
  }, []);

  // 2. Fetch global configs on boot
  useEffect(() => {
    const fetchGlobals = async () => {
      try {
        const [sysConfig, sysNotices] = await Promise.all([
          api.getConfig(),
          api.getNotice()
        ]);
        setConfig(sysConfig);
        setNotices(sysNotices);
      } catch (err) {
        console.error("Error loading system config", err);
      } finally {
        setLoading(false);
      }
    };
    fetchGlobals();
  }, []);

  // 3. User session loading and polling
  useEffect(() => {
    if (!userId) {
      setUser(null);
      return;
    }

    const loadUserData = async () => {
      try {
        const profile = await api.getProfile();
        setUser(profile);

        // Fetch products, user history, submissions and chat messages
        const [prodList, hist, subList, chatList] = await Promise.all([
          api.getProducts(),
          api.getHistory(),
          api.submitTask("", "").catch(() => null), // Hack or proper call. We'll use a custom fetch pattern for list
          api.getChatMessages()
        ]);

        setProducts(prodList);
        setDeposits(hist.deposits);
        setPurchases(hist.purchases);
        setReferrals(hist.referrals);
        setChatMessages(chatList);

        // Fetch user submissions separately
        const allSubs = await fetch("/api/admin/submissions", {
          headers: {
            "x-user-id": localStorage.getItem("userId") || "",
            "x-user-password": localStorage.getItem("userPassword") || ""
          }
        }).then(r => r.ok ? r.json() : []);
        // filter submissions belonging to current user
        if (Array.isArray(allSubs)) {
          setSubmissions(allSubs.filter((s: any) => s.userId === profile.id));
        }

        // If Admin, fetch all administration datasets
        if (profile.isAdmin) {
          const [allDeps, allWorkersSubs, allSystUsers, activeChatClients] = await Promise.all([
            api.adminGetDeposits(),
            api.adminGetSubmissions(),
            api.adminGetUsers(),
            api.adminGetChatUsers()
          ]);
          setAdminDeposits(allDeps);
          setAdminSubmissions(allWorkersSubs);
          setAdminUsers(allSystUsers);
          setAdminChatUsers(activeChatClients);

          if (adminSelectedChatUserId) {
            const adminMsgs = await api.adminGetChatMessages(adminSelectedChatUserId);
            setAdminChatMessages(adminMsgs);
          }
        }
      } catch (err: any) {
        console.error("Failed to load user session, auto logout", err);
        if (err.message?.includes("অননুমোদিত") || err.message?.includes("লগইন তথ্য সঠিক নয়")) {
          handleLogout();
        }
      }
    };

    loadUserData();

    // Setup active polling every 5 seconds for live sync (chat, deposits, stock, balance)
    const interval = setInterval(loadUserData, 5000);
    return () => clearInterval(interval);
  }, [userId, adminSelectedChatUserId]);

  const handleRefreshData = async () => {
    if (!userId) return;
    try {
      const prodList = await api.getProducts();
      setProducts(prodList);
      const sysNotices = await api.getNotice();
      setNotices(sysNotices);
      const sysConfig = await api.getConfig();
      setConfig(sysConfig);

      if (user) {
        const profile = await api.getProfile();
        setUser(profile);
        const hist = await api.getHistory();
        setDeposits(hist.deposits);
        setPurchases(hist.purchases);
        setReferrals(hist.referrals);
        
        const chatList = await api.getChatMessages();
        setChatMessages(chatList);

        if (profile.isAdmin) {
          const [allDeps, allWorkersSubs, allSystUsers, activeChatClients] = await Promise.all([
            api.adminGetDeposits(),
            api.adminGetSubmissions(),
            api.adminGetUsers(),
            api.adminGetChatUsers()
          ]);
          setAdminDeposits(allDeps);
          setAdminSubmissions(allWorkersSubs);
          setAdminUsers(allSystUsers);
          setAdminChatUsers(activeChatClients);

          if (adminSelectedChatUserId) {
            const adminMsgs = await api.adminGetChatMessages(adminSelectedChatUserId);
            setAdminChatMessages(adminMsgs);
          }
        }
      }
    } catch (err) {
      console.error("Failed to refresh data", err);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setAuthSuccess(null);
    try {
      const res = await api.login(formId, formPassword);
      localStorage.setItem("userId", res.user.id);
      localStorage.setItem("userPassword", formPassword);
      setUserId(res.user.id);
      setUser(res.user);
      setFormId("");
      setFormPassword("");
      setActiveTab("home");
    } catch (err: any) {
      setAuthError(err.message || "লগইন ব্যর্থ হয়েছে। মোবাইল নম্বর এবং পাসওয়ার্ড চেক করুন।");
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setAuthSuccess(null);
    try {
      await api.register(formId, formPassword, regReferral);
      setAuthSuccess("রেজিস্ট্রেশন সফল হয়েছে! এখন আপনি আপনার অ্যাকাউন্ট দিয়ে লগইন করতে পারেন।");
      setIsRegistering(false);
      setFormPassword("");
      setRegReferral("");
    } catch (err: any) {
      setAuthError(err.message || "রেজিস্ট্রেশন করতে সমস্যা হয়েছে।");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("userId");
    localStorage.removeItem("userPassword");
    setUserId(null);
    setUser(null);
    setActiveTab("home");
  };

  // Submission operations proxy
  const handleBuyProductProxy = async (productId: string, quantity: number) => {
    return await api.buyProduct(productId, quantity);
  };

  const handleDepositSubmitProxy = async (amount: number, bKashNum: string, trxId: string, screenshot?: string) => {
    await api.submitDeposit(amount, bKashNum, trxId, screenshot);
  };

  const handleUpdateProfileProxy = async (
    displayName: string,
    avatarUrl: string,
    bKashNumber?: string,
    whatsAppNumber?: string,
    password?: string
  ) => {
    await api.updateProfile(displayName, avatarUrl, bKashNumber, whatsAppNumber, password);
    await handleRefreshData();
  };

  const handleTaskSubmitProxy = async (sheetLink: string, note: string) => {
    await api.submitTask(sheetLink, note);
  };

  const handleSendMessageProxy = async (message: string) => {
    const newMsg = await api.sendChatMessage(message);
    setChatMessages(prev => [...prev, newMsg]);
  };

  // Admin operations proxy
  const handleApproveDepositProxy = async (depositId: string) => {
    await api.adminApproveDeposit(depositId);
    handleRefreshData();
  };

  const handleRejectDepositProxy = async (depositId: string) => {
    await api.adminRejectDeposit(depositId);
    handleRefreshData();
  };

  const handleAddProductProxy = async (name: string, description: string, price: number) => {
    await api.adminAddProduct(name, description, price);
    handleRefreshData();
  };

  const handleDeleteProductProxy = async (productId: string) => {
    await api.adminDeleteProduct(productId);
    handleRefreshData();
  };

  const handleUploadMailsProxy = async (productId: string, mailsList: string) => {
    await api.adminUploadMails(productId, mailsList);
    handleRefreshData();
  };

  const handleActionSubmissionProxy = async (subId: string, status: "approved" | "rejected") => {
    await api.adminActionSubmission(subId, status);
    handleRefreshData();
  };

  const handleToggleBlockUserProxy = async (uid: string) => {
    await api.adminToggleBlockUser(uid);
    handleRefreshData();
  };

  const handleUpdateUserBalanceProxy = async (uid: string, amount: number) => {
    await api.adminUpdateUserBalance(uid, amount);
    handleRefreshData();
  };

  const handleUpdateConfigProxy = async (newConfig: Partial<SystemConfig>) => {
    await api.adminUpdateConfig(newConfig);
    const updated = await api.getConfig();
    setConfig(updated);
  };

  const handleUpdateNoticeProxy = async (content: string) => {
    await api.adminUpdateNotice(content);
    const updated = await api.getNotice();
    setNotices(updated);
  };

  const handleAdminSelectChatUser = async (uid: string) => {
    setAdminSelectedChatUserId(uid);
    try {
      const adminMsgs = await api.adminGetChatMessages(uid);
      setAdminChatMessages(adminMsgs);
    } catch (err) {
      console.error("Error loading client messages", err);
    }
  };

  const handleAdminSendMessageProxy = async (uid: string, message: string) => {
    const newMsg = await api.adminSendChatMessage(uid, message);
    setAdminChatMessages(prev => [...prev, newMsg]);
    handleRefreshData();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
        <Loader2 className="w-10 h-10 text-indigo-600 animate-spin mb-3" />
        <p className="text-slate-500 font-semibold text-xs md:text-sm">মেইল সেলিং ওয়েবসাইট লোড হচ্ছে...</p>
      </div>
    );
  }

  // ---------------------------------------------------------------------------
  // AUTH LOGIN & REGISTRATION LAYOUT
  // ---------------------------------------------------------------------------
  if (!userId) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-white rounded-3xl border border-slate-150 shadow-lg overflow-hidden">
          {/* Header Accent */}
          <div className="bg-linear-to-r from-indigo-600 to-violet-600 p-6 text-center text-white">
            <h1 className="text-lg md:text-xl font-black tracking-tight leading-normal">
              মেইল সেলিং ও সোর্সিং ওয়েবসাইট
            </h1>
            <p className="text-xxs opacity-90 mt-1">পেমেন্ট এবং রেফারেল সিস্টেম সহ সম্পূর্ণ সুরক্ষায় কেনাবেচা করুন</p>
          </div>

          <div className="p-6 space-y-5">
            {/* Form selectors */}
            <div className="grid grid-cols-2 gap-2 bg-slate-50 p-1.5 rounded-2xl border border-slate-100">
              <button
                type="button"
                onClick={() => { setIsRegistering(false); setAuthError(null); setAuthSuccess(null); }}
                className={`py-2 text-xs font-extrabold rounded-xl transition ${!isRegistering ? "bg-white text-indigo-600 shadow-xs" : "text-slate-500 hover:text-slate-800"}`}
              >
                লগইন করুন
              </button>
              <button
                type="button"
                onClick={() => { setIsRegistering(true); setAuthError(null); setAuthSuccess(null); }}
                className={`py-2 text-xs font-extrabold rounded-xl transition ${isRegistering ? "bg-white text-indigo-600 shadow-xs" : "text-slate-500 hover:text-slate-800"}`}
              >
                রেজিস্ট্রেশন করুন
              </button>
            </div>

            {authError && (
              <div className="bg-rose-50 text-rose-700 text-xs p-3.5 rounded-xl border border-rose-100 leading-relaxed font-semibold">
                {authError}
              </div>
            )}

            {authSuccess && (
              <div className="bg-emerald-50 text-emerald-700 text-xs p-3.5 rounded-xl border border-emerald-100 leading-relaxed font-semibold">
                {authSuccess}
              </div>
            )}

            {/* Forms */}
            <form onSubmit={isRegistering ? handleRegister : handleLogin} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xxs font-bold text-slate-700 block uppercase tracking-wider">বিকাশ মোবাইল নম্বর *</label>
                <input
                  type="text"
                  required
                  placeholder="যেমন: 017XXXXXXXX"
                  value={formId}
                  onChange={(e) => setFormId(e.target.value)}
                  className="w-full text-xs font-bold border border-slate-250 rounded-xl px-3.5 py-3 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition outline-hidden font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xxs font-bold text-slate-700 block uppercase tracking-wider">পাসওয়ার্ড *</label>
                <input
                  type="password"
                  required
                  placeholder="আপনার পাসওয়ার্ড লিখুন"
                  value={formPassword}
                  onChange={(e) => setFormPassword(e.target.value)}
                  className="w-full text-xs font-bold border border-slate-250 rounded-xl px-3.5 py-3 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition outline-hidden"
                />
              </div>

              {isRegistering && (
                <div className="space-y-1">
                  <label className="text-xxs font-bold text-slate-700 block uppercase tracking-wider">রেফারেল বিকাশ নম্বর (ঐচ্ছিক)</label>
                  <input
                    type="text"
                    placeholder="বন্ধুর রেফারেল বিকাশ নম্বর দিন"
                    value={regReferral}
                    onChange={(e) => setRegReferral(e.target.value)}
                    className="w-full text-xs border border-slate-250 rounded-xl px-3.5 py-3 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition outline-hidden font-mono"
                  />
                </div>
              )}

              <button
                type="submit"
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold py-3.5 rounded-xl transition shadow-sm cursor-pointer shadow-indigo-100 flex items-center justify-center gap-1.5"
              >
                <span>{isRegistering ? "রেজিস্ট্রেশন সম্পূর্ণ করুন" : "অ্যাকাউন্টে প্রবেশ করুন"}</span>
              </button>
            </form>

            <div className="pt-2 border-t border-slate-100 text-center text-[10px] text-slate-400">
              {isRegistering ? (
                <span>রেজিস্ট্রেশন করতে অবশ্যই একটি সচল বিকাশ নম্বর ব্যবহার করতে হবে।</span>
              ) : (
                <div className="space-y-1">
                  <span>পরীক্ষার জন্য ব্যবহার করুন:</span>
                  <div className="font-mono text-slate-500 flex justify-center gap-4 text-[9px] font-bold">
                    <span>এডমিন: 01700000000 (pass: admin)</span>
                    <span>ইউজার: 01800000000 (pass: user123)</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ---------------------------------------------------------------------------
  // MAIN DASHBOARD LAYOUT
  // ---------------------------------------------------------------------------
  return (
    <div className="min-h-screen bg-slate-100 flex flex-col justify-between">
      {/* Centered Main Application Shell for Mobile App Preview Feeling */}
      <div className="w-full max-w-4xl mx-auto flex-1 bg-white md:shadow-lg md:border-x md:border-slate-150 flex flex-col justify-between">
        {/* Navigation Header */}
        <header className="sticky top-0 bg-slate-900 border-b border-slate-800 text-white z-40 px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-red-600 text-white p-1.5 rounded-xl animate-bounce">
              <Gift className="w-4.5 h-4.5 text-white" />
            </div>
            <div>
              <h1 className="font-black text-sm tracking-wider text-slate-100 uppercase leading-none">RTN Support</h1>
              <span className="text-[9px] font-bold text-red-500 font-mono tracking-widest block mt-1 uppercase">BALANCE: ৳{user?.balance || 0}</span>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {/* WhatsApp Group Button */}
            {config.whatsappGroupLink && (
              <a
                href={config.whatsappGroupLink}
                target="_blank"
                rel="noopener noreferrer"
                title="হোয়াটসঅ্যাপ গ্রুপ"
                className="bg-emerald-600 hover:bg-emerald-700 text-white p-2 rounded-xl transition flex items-center gap-1 text-[10px] font-bold shadow-xs"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span className="hidden md:inline">গ্রুপ</span>
              </a>
            )}

            {/* Add Money Trigger */}
            {user && (
              <button
                onClick={() => setIsAddMoneyOpen(true)}
                className="bg-red-600 hover:bg-red-700 text-white text-[10px] font-extrabold px-3 py-2 rounded-xl transition flex items-center gap-1 cursor-pointer shadow-md shadow-red-650/20 active:scale-95 animate-pulse"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                <span>টাকা এড</span>
              </button>
            )}

            {user?.isAdmin && (
              <button
                id="admin-tab-btn"
                onClick={() => setActiveTab("admin")}
                className={`text-[10px] font-extrabold px-3 py-2 rounded-xl transition cursor-pointer ${activeTab === "admin" ? "bg-rose-500 text-white" : "bg-slate-800 text-rose-400 hover:bg-slate-750 border border-slate-700"}`}
              >
                এডমিন
              </button>
            )}

            <button
              id="logout-btn"
              onClick={handleLogout}
              className="p-2 hover:bg-slate-800 text-slate-400 rounded-xl transition"
              title="লগআউট"
            >
              <LogOut className="w-4.5 h-4.5" />
            </button>
          </div>
        </header>

        {/* Dynamic Pages Area with Stagger Transition */}
        <main className="p-4 md:p-6 flex-1 min-h-[75vh]">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.15 }}
            >
              {activeTab === "home" && (
                <HomeSection
                  products={products}
                  notices={notices}
                  config={config}
                  userBalance={user?.balance || 0}
                  onRefresh={handleRefreshData}
                  onBuy={handleBuyProductProxy}
                />
              )}

              {activeTab === "notice" && (
                <div className="space-y-4">
                  <h2 className="text-base md:text-lg font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-2.5">
                    <Bell className="w-5 h-5 text-indigo-600" />
                    এডমিন থেকে সিস্টেম আপডেট ও নোটিশ
                  </h2>
                  {notices.length === 0 ? (
                    <div className="bg-white border border-slate-100 rounded-2xl p-8 text-center text-slate-400 text-sm">
                      বর্তমানে কোনো নোটিশ নেই।
                    </div>
                  ) : (
                    notices.map((not) => (
                      <div key={not.id} className="bg-white border border-slate-100 rounded-2xl p-5 shadow-xxs">
                        <span className="text-[10px] font-bold text-slate-400 block mb-2 font-mono">
                          প্রকাশিত: {new Date(not.createdAt).toLocaleString()}
                        </span>
                        <p className="text-slate-700 text-xs md:text-sm leading-relaxed whitespace-pre-wrap">
                          {not.content}
                        </p>
                      </div>
                    ))
                  )}
                </div>
              )}

              {activeTab === "submit_task" && (
                <TaskSection
                  submissions={submissions}
                  config={config}
                  onSubmitTask={handleTaskSubmitProxy}
                  onRefresh={handleRefreshData}
                />
              )}

              {activeTab === "chat" && (
                <ChatSection
                  isAdminView={false}
                  messages={chatMessages}
                  adminWhatsApp={config.adminWhatsApp}
                  whatsappGroupLink={config.whatsappGroupLink}
                  onSendMessage={handleSendMessageProxy}
                  onRefresh={handleRefreshData}
                />
              )}

              {activeTab === "profile" && (
                <MeSection
                  userId={user?.id || ""}
                  userBalance={user?.balance || 0}
                  deposits={deposits}
                  purchases={purchases}
                  referrals={referrals}
                  config={config}
                  onSubmitDeposit={handleDepositSubmitProxy}
                  onRefresh={handleRefreshData}
                  userDisplayName={user?.displayName || ""}
                  userAvatarUrl={user?.avatarUrl || ""}
                  bKashNumber={user?.bKashNumber || ""}
                  whatsAppNumber={user?.whatsAppNumber || ""}
                  userPassword={user?.password || ""}
                  onUpdateProfile={handleUpdateProfileProxy}
                  onOpenAddMoney={() => setIsAddMoneyOpen(true)}
                />
              )}

              {activeTab === "admin" && user?.isAdmin && (
                <AdminPanel
                  deposits={adminDeposits}
                  products={products}
                  submissions={adminSubmissions}
                  users={adminUsers}
                  config={config}
                  notices={notices}
                  onApproveDeposit={handleApproveDepositProxy}
                  onRejectDeposit={handleRejectDepositProxy}
                  onAddProduct={handleAddProductProxy}
                  onDeleteProduct={handleDeleteProductProxy}
                  onUploadMails={handleUploadMailsProxy}
                  onActionSubmission={handleActionSubmissionProxy}
                  onToggleBlockUser={handleToggleBlockUserProxy}
                  onUpdateUserBalance={handleUpdateUserBalanceProxy}
                  onUpdateConfig={handleUpdateConfigProxy}
                  onUpdateNotice={handleUpdateNoticeProxy}
                  onRefresh={handleRefreshData}
                />
              )}
            </motion.div>
          </AnimatePresence>
        </main>

        {/* Footer Support Information */}
        <footer className="bg-slate-50 border-t border-slate-100 py-5 px-4 text-center space-y-3 shrink-0">
          <p className="text-slate-400 text-[10px] font-semibold uppercase tracking-wider">মেইল সেলিং পোর্টাল © ২০২৬ | সর্বস্বত্ব সংরক্ষিত</p>
          <div className="flex flex-col sm:flex-row justify-center items-center gap-2.5 text-xxs font-bold text-slate-600 font-mono">
            {config.adminWhatsApp && (
              <a
                href={`https://wa.me/${config.adminWhatsApp.replace(/\D/g, "")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-emerald-50 text-emerald-700 hover:bg-emerald-100 px-3 py-2 rounded-xl border border-emerald-200 flex items-center gap-1.5 transition"
              >
                <PhoneCall className="w-3.5 h-3.5 text-emerald-600" />
                এডমিন হোয়াটসঅ্যাপ চ্যাট
              </a>
            )}
          </div>
        </footer>

        {/* Bottom Mobile Tab Navigation Bar */}
        <nav className="sticky bottom-0 bg-white border-t border-slate-100 z-40 px-3 py-2 flex items-center justify-around shrink-0 md:rounded-b-3xl">
          <button
            onClick={() => setActiveTab("home")}
            className={`flex flex-col items-center justify-center gap-1 p-1 transition cursor-pointer ${activeTab === "home" ? "text-indigo-600" : "text-slate-400 hover:text-slate-600"}`}
          >
            <Home className="w-5 h-5" />
            <span className="text-[10px] font-bold">হোম</span>
          </button>

          <button
            onClick={() => setActiveTab("notice")}
            className={`flex flex-col items-center justify-center gap-1 p-1 transition cursor-pointer ${activeTab === "notice" ? "text-indigo-600" : "text-slate-400 hover:text-slate-600"}`}
          >
            <Bell className="w-5 h-5" />
            <span className="text-[10px] font-bold">নোটিশ</span>
          </button>

          <button
            onClick={() => setActiveTab("submit_task")}
            className={`flex flex-col items-center justify-center gap-1 p-1 transition cursor-pointer ${activeTab === "submit_task" ? "text-indigo-600" : "text-slate-400 hover:text-slate-600"}`}
          >
            <Send className="w-5 h-5" />
            <span className="text-[10px] font-bold">টাস্ক সাবমিট</span>
          </button>

          <button
            onClick={() => setActiveTab("chat")}
            className={`flex flex-col items-center justify-center gap-1 p-1 transition cursor-pointer ${activeTab === "chat" ? "text-indigo-600" : "text-slate-400 hover:text-slate-600"}`}
          >
            <MessageSquare className="w-5 h-5" />
            <span className="text-[10px] font-bold">লাইভ চ্যাট</span>
          </button>

          <button
            onClick={() => setActiveTab("profile")}
            className={`flex flex-col items-center justify-center gap-1 p-1 transition cursor-pointer ${activeTab === "profile" ? "text-indigo-600" : "text-slate-400 hover:text-slate-600"}`}
          >
            {user?.avatarUrl ? (
              <img
                src={user.avatarUrl}
                alt="Profile"
                className={`w-5 h-5 rounded-full object-cover border ${activeTab === "profile" ? "border-indigo-600" : "border-slate-300"}`}
              />
            ) : (
              <UserIcon className="w-5 h-5" />
            )}
            <span className="text-[10px] font-bold">মি (প্রোফাইল)</span>
          </button>
        </nav>
      </div>

      {/* Red Add Money Modal Overlay */}
      {isAddMoneyOpen && user && (
        <AddMoneyModal
          userId={user.id}
          userBalance={user.balance || 0}
          deposits={deposits}
          purchases={purchases}
          config={config}
          onClose={() => setIsAddMoneyOpen(false)}
          onSubmitDeposit={async (amount, bKashNum, trxId, screenshot) => {
            await handleDepositSubmitProxy(amount, bKashNum, trxId, screenshot);
            setIsAddMoneyOpen(false);
            handleRefreshData();
          }}
          onRefresh={handleRefreshData}
        />
      )}

      {/* Floating Collapsible Live Chat Widget */}
      {user && (
        <FloatingChatWidget
          userId={user.id}
          user={user}
          messages={chatMessages}
          adminWhatsApp={config.adminWhatsApp}
          whatsappGroupLink={config.whatsappGroupLink}
          onSendMessage={async (msg) => {
            await handleSendMessageProxy(msg);
            handleRefreshData();
          }}
          onRefresh={handleRefreshData}
        />
      )}
    </div>
  );
}
