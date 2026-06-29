import { User, Product, Deposit, Purchase, Referral, Submission, SystemConfig, Notice, ChatMessage, UserStats, ChatUser } from "./types";

const getHeaders = () => {
  const userId = localStorage.getItem("userId") || "";
  const password = localStorage.getItem("userPassword") || "";
  return {
    "Content-Type": "application/json",
    "x-user-id": userId,
    "x-user-password": password
  };
};

export const api = {
  // Auth APIs
  async register(id: string, password: string, referredBy?: string) {
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, password, referredBy })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "রেজিস্ট্রেশন ব্যর্থ হয়েছে।");
    return data;
  },

  async login(id: string, password: string) {
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, password })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "লগইন ব্যর্থ হয়েছে।");
    return data;
  },

  // Public/Global Configs
  async getConfig(): Promise<SystemConfig> {
    const res = await fetch("/api/config");
    return res.json();
  },

  async getNotice(): Promise<Notice[]> {
    const res = await fetch("/api/notice");
    return res.json();
  },

  // Products
  async getProducts(): Promise<Product[]> {
    const res = await fetch("/api/products");
    return res.json();
  },

  // Purchase
  async buyProduct(productId: string, quantity: number) {
    const res = await fetch("/api/buy", {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify({ productId, quantity })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "ক্রয় করতে ব্যর্থ হয়েছে।");
    return data;
  },

  // User details & history
  async getProfile(): Promise<User> {
    const res = await fetch("/api/user/profile", { headers: getHeaders() });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "প্রোফাইল লোড করতে ব্যর্থ হয়েছে।");
    return data;
  },

  async updateProfile(
    displayName: string,
    avatarUrl: string,
    bKashNumber?: string,
    whatsAppNumber?: string,
    password?: string
  ): Promise<{ success: boolean; displayName: string; avatarUrl: string; bKashNumber?: string; whatsAppNumber?: string }> {
    const res = await fetch("/api/user/profile/update", {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify({ displayName, avatarUrl, bKashNumber, whatsAppNumber, password })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "প্রোফাইল আপডেট ব্যর্থ হয়েছে।");
    return data;
  },

  async getHistory(): Promise<{ deposits: Deposit[]; purchases: Purchase[]; referrals: Referral[] }> {
    const res = await fetch("/api/user/history", { headers: getHeaders() });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "ইতিহাস লোড করতে ব্যর্থ হয়েছে।");
    return data;
  },

  // Submit Deposit
  async submitDeposit(amount: number, bKashNumber: string, transactionId: string, screenshot?: string) {
    const res = await fetch("/api/deposit", {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify({ amount, bKashNumber, transactionId, screenshot })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "ডিপোজিট রিকোয়েস্ট ব্যর্থ হয়েছে।");
    return data;
  },

  // Submit Task Work
  async submitTask(sheetLink: string, note: string, taskType?: '2FA' | '3day_old') {
    const res = await fetch("/api/task/submit", {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify({ sheetLink, note, taskType })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "টাস্ক সাবমিশন ব্যর্থ হয়েছে।");
    return data;
  },

  // Verify Admin Entry Password (2026)
  async verifyAdminPass(password: string): Promise<{ success: boolean; attemptsRemaining?: number; error?: string }> {
    const res = await fetch("/api/auth/verify-admin-pass", {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify({ password })
    });
    const data = await res.json();
    if (!res.ok && !data.error) throw new Error("সার্ভার ত্রুটি, অনুগ্রহ করে আবার চেষ্টা করুন।");
    return data;
  },

  // Chat messages
  async getChatMessages(): Promise<ChatMessage[]> {
    const res = await fetch("/api/chat/messages", { headers: getHeaders() });
    return res.json();
  },

  async sendChatMessage(message: string): Promise<ChatMessage> {
    const res = await fetch("/api/chat/send", {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify({ message })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "মেসেজ পাঠাতে ব্যর্থ হয়েছে।");
    return data;
  },

  // ---------------------------------------------------------------------------
  // Admin Operations
  // ---------------------------------------------------------------------------
  async adminGetDeposits(): Promise<Deposit[]> {
    const res = await fetch("/api/admin/deposits", { headers: getHeaders() });
    if (!res.ok) throw new Error("ডিপোজিট তালিকা লোড করতে ব্যর্থ হয়েছে।");
    return res.json();
  },

  async adminApproveDeposit(depositId: string) {
    const res = await fetch("/api/admin/deposits/approve", {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify({ depositId })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "অ্যাপ্রুভ করতে ব্যর্থ হয়েছে।");
    return data;
  },

  async adminRejectDeposit(depositId: string) {
    const res = await fetch("/api/admin/deposits/reject", {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify({ depositId })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "রিজেক্ট করতে ব্যর্থ হয়েছে।");
    return data;
  },

  async adminGetSubmissions(): Promise<Submission[]> {
    const res = await fetch("/api/admin/submissions", { headers: getHeaders() });
    if (!res.ok) throw new Error("সাবমিশন তালিকা লোড করতে ব্যর্থ হয়েছে।");
    return res.json();
  },

  async adminActionSubmission(submissionId: string, status: "approved" | "rejected") {
    const res = await fetch("/api/admin/submissions/action", {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify({ submissionId, status })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "অ্যাকশন করতে ব্যর্থ হয়েছে।");
    return data;
  },

  async adminAddProduct(name: string, description: string, price: number) {
    const res = await fetch("/api/admin/products/add", {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify({ name, description, price })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "পণ্য যোগ করতে ব্যর্থ হয়েছে।");
    return data;
  },

  async adminDeleteProduct(productId: string) {
    const res = await fetch("/api/admin/products/delete", {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify({ productId })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "পণ্য ডিলিট করতে ব্যর্থ হয়েছে।");
    return data;
  },

  async adminUploadMails(productId: string, mailsList: string) {
    const res = await fetch("/api/admin/mails/upload", {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify({ productId, mailsList })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "মেইল আপলোড করতে ব্যর্থ হয়েছে।");
    return data;
  },

  async adminUpdateConfig(config: Partial<SystemConfig>) {
    const res = await fetch("/api/admin/config/update", {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify(config)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "কনফিগারেশন আপডেট ব্যর্থ হয়েছে।");
    return data;
  },

  async adminUpdateNotice(content: string) {
    const res = await fetch("/api/admin/notice/update", {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify({ content })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "নোটিশ আপডেট ব্যর্থ হয়েছে।");
    return data;
  },

  async adminGetUsers(): Promise<UserStats[]> {
    const res = await fetch("/api/admin/users", { headers: getHeaders() });
    if (!res.ok) throw new Error("ইউজার তালিকা লোড করতে ব্যর্থ হয়েছে।");
    return res.json();
  },

  async adminToggleBlockUser(userId: string) {
    const res = await fetch("/api/admin/users/toggle-block", {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify({ userId })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "ব্লক স্ট্যাটাস পরিবর্তন করতে ব্যর্থ হয়েছে।");
    return data;
  },

  async adminUpdateUserBalance(userId: string, amount: number) {
    const res = await fetch("/api/admin/users/update-balance", {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify({ userId, amount })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "ব্যালেন্স আপডেট করতে ব্যর্থ হয়েছে।");
    return data;
  },

  async adminGetChatUsers(): Promise<ChatUser[]> {
    const res = await fetch("/api/admin/chat/users", { headers: getHeaders() });
    if (!res.ok) throw new Error("চ্যাট গ্রাহক তালিকা লোড ব্যর্থ হয়েছে।");
    return res.json();
  },

  async adminGetChatMessages(userId: string): Promise<ChatMessage[]> {
    const res = await fetch(`/api/admin/chat/messages/${userId}`, { headers: getHeaders() });
    if (!res.ok) throw new Error("চ্যাট মেসেজ লোড ব্যর্থ হয়েছে।");
    return res.json();
  },

  async adminSendChatMessage(userId: string, message: string): Promise<ChatMessage> {
    const res = await fetch("/api/admin/chat/send", {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify({ userId, message })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "মেসেজ পাঠাতে ব্যর্থ হয়েছে।");
    return data;
  }
};
