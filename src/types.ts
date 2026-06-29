export interface User {
  id: string;
  balance: number;
  isAdmin: boolean;
  referredBy: string | null;
  displayName?: string;
  avatarUrl?: string;
  bKashNumber?: string;
  whatsAppNumber?: string;
  password?: string;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
}

export interface Deposit {
  id: string;
  userId: string;
  amount: number;
  bKashNumber: string;
  transactionId: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
  approvedAt: string | null;
  screenshot?: string;
}

export interface Purchase {
  id: string;
  productName: string;
  content: string;
  price: number;
  soldAt: string;
}

export interface Referral {
  id: string;
  createdAt: string;
  totalDepositedByThem: number;
}

export interface Submission {
  id: string;
  userId: string;
  sheetLink: string;
  note: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
  taskType?: '2FA' | '3day_old';
}

export interface SystemConfig {
  referralBonusPercent: number;
  bkashNumber: string;
  tokenToCodeLink: string;
  twoFactorCodeLink: string;
  whatsappGroupLink: string;
  adminWhatsApp: string;
  developerWhatsApp: string;
}

export interface Notice {
  id: string;
  content: string;
  createdAt: string;
}

export interface ChatMessage {
  id: string;
  userId: string;
  sender: 'user' | 'admin';
  message: string;
  createdAt: string;
}

export interface UserStats {
  id: string;
  balance: number;
  referredBy: string | null;
  createdAt: string;
  isBlocked: boolean;
  isAdmin: boolean;
  purchasesCount: number;
  totalDeposited: number;
  referralsCount: number;
  displayName?: string;
  avatarUrl?: string;
}

export interface ChatUser {
  id: string;
  lastMessage: string;
  lastMessageAt: string;
}
