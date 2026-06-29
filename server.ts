import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";

const app = express();
const PORT = 3000;
const DB_FILE = path.join(process.cwd(), "db.json");

app.use(express.json());

// Helpers to read/write from local DB
function readDB() {
  let db: any = {
    users: [],
    products: [],
    mails: [],
    deposits: [],
    submissions: [],
    notices: [],
    config: {
      referralBonusPercent: 5,
      bkashNumber: "01609166109",
      tokenToCodeLink: "https://code.yamin.bd/index.php/",
      twoFactorCodeLink: "https://2fa.cn/",
      whatsappGroupLink: "https://chat.whatsapp.com/HyjYM2zc6mTBSOGa0xyWJr",
      adminWhatsApp: "8801609166109",
      developerWhatsApp: "8801609166109"
    },
    chatMessages: []
  };

  try {
    if (fs.existsSync(DB_FILE)) {
      const data = fs.readFileSync(DB_FILE, "utf-8");
      db = JSON.parse(data);
    }
  } catch (error) {
    console.error("Error reading database", error);
  }

  // Ensure config structure and fields exist
  if (!db.config) {
    db.config = {};
  }
  if (db.config.referralBonusPercent === undefined) db.config.referralBonusPercent = 5;
  if (!db.config.bkashNumber || db.config.bkashNumber === "01788888888") db.config.bkashNumber = "01609166109";
  if (!db.config.tokenToCodeLink || db.config.tokenToCodeLink.includes("example.com")) db.config.tokenToCodeLink = "https://code.yamin.bd/index.php/";
  if (!db.config.twoFactorCodeLink || db.config.twoFactorCodeLink.includes("example.com")) db.config.twoFactorCodeLink = "https://2fa.cn/";
  if (!db.config.whatsappGroupLink || db.config.whatsappGroupLink.includes("GzB92f7X")) db.config.whatsappGroupLink = "https://chat.whatsapp.com/HyjYM2zc6mTBSOGa0xyWJr";
  if (!db.config.adminWhatsApp || db.config.adminWhatsApp === "8801788888888") db.config.adminWhatsApp = "8801609166109";
  if (!db.config.developerWhatsApp || db.config.developerWhatsApp === "8801700000000") db.config.developerWhatsApp = "8801609166109";

  // Clean up sourcingLink if it still exists in config
  if (db.config.sourcingLink !== undefined) {
    delete db.config.sourcingLink;
  }

  // Ensure products list is initialized
  if (!db.products) db.products = [];
  if (!db.mails) db.mails = [];
  if (!db.deposits) db.deposits = [];
  if (!db.submissions) db.submissions = [];
  if (!db.notices) db.notices = [];
  if (!db.chatMessages) db.chatMessages = [];

  // Seed required products if they don't exist
  const requiredProducts = [
    {
      id: "prod-hotmail-fresh-1tk",
      name: "hotmail fresh 1 tk",
      description: "হটমেইল ফ্রেশ অ্যাকাউন্ট ১ টাকা। মেইল ক্রয়ের পর ১ ঘণ্টা ওয়ারেন্টি পাবেন।",
      price: 1,
      stock: 0
    },
    {
      id: "prod-9proxy-1gb",
      name: "9 proxy 1gb 150 tk",
      description: "৯ প্রক্সি ১জিবি ১৫০ টাকা। ব্যবহারের পর রিভিউ দিতে ভুলবেন না।",
      price: 150,
      stock: 0
    },
    {
      id: "prod-owlproxy-200mb",
      name: "owl proxy 200 mb 20 taka",
      description: "আউল প্রক্সি ২০০এমবি ২০ টাকা। যেকোনো প্রয়োজনে হোয়াটসঅ্যাপে যোগাযোগ করুন।",
      price: 20,
      stock: 0
    },
    {
      id: "prod-chatgpt-plus-500tk",
      name: "ChatGPT Plus Personal",
      description: "চ্যাটজিপিটি প্লাস পার্সোনাল অ্যাকাউন্ট ৫০০ টাকা। ১ মাস মেয়াদি প্রিমিয়াম সাবস্ক্রিপশন।",
      price: 500,
      stock: 0
    },
    {
      id: "prod-gemini-18m-500tk",
      name: "Gemini 18 Month",
      description: "জেমিনি ১৮ মাস মেয়াদি প্রিমিয়াম অ্যাকাউন্ট ৫০০ টাকা। হাই কোয়ালিটি ফুল ওয়ারেন্টি।",
      price: 500,
      stock: 0
    }
  ];

  for (const reqP of requiredProducts) {
    if (!db.products.some((p: any) => p.name.toLowerCase() === reqP.name.toLowerCase() || p.id === reqP.id)) {
      db.products.push(reqP);
    }
  }

  // Ensure urgent notice is seeded
  if (db.notices.length === 0) {
    db.notices.push({
      id: "not-default",
      content: "আসসালামু আলাইকুম, আমাদের মেইল সেলিং ওয়েবসাইটে আপনাকে স্বাগতম। এখন থেকে আপনারা খুব সহজেই বিকাশ পেমেন্টের মাধ্যমে হটমেইল এবং আউটলুক অ্যাকাউন্ট ক্রয় করতে পারবেন। নতুন পণ্য নিয়মিত যুক্ত করা হচ্ছে। যেকোনো প্রয়োজনে লাইভ চ্যাট অথবা হোয়াটসঅ্যাপে যোগাযোগ করুন।\n\nওয়েবসাইটের নিয়মাবলী এবং তথ্যাবলী:\n১. মেইল ক্রয়ের সাথে সাথে পাসওয়ার্ড পরিবর্তন করে নিবেন। ক্রয়ের পর ১ ঘণ্টা ওয়ারেন্টি পাবেন।\n২. ব্যালেন্স এড করার সময় অবশ্যই সঠিক ট্রানজেকশন আইডি (TxID) এবং পাঠানোর বিকাশ নম্বরটি প্রদান করবেন।\n৩. কোনো মেইলে সমস্যা থাকলে তৎক্ষণাৎ এডমিন চ্যাট অথবা সরাসরি হোয়াটসঅ্যাপে যোগাযোগ করবেন।\n৪. রেফারেল লিংক শেয়ার করে বন্ধুদের ইনভাইট করুন এবং তাদের প্রতিটি ডিপোজিটে 5% বোনাস লুফে নিন।",
      createdAt: new Date().toISOString()
    });
  }

  return db;
}

function writeDB(data: any) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), "utf-8");
  } catch (error) {
    console.error("Error writing to database", error);
  }
}

// Authentication Middleware
function authMiddleware(req: express.Request, res: express.Response, next: express.NextFunction) {
  const userId = req.headers["x-user-id"] as string;
  const password = req.headers["x-user-password"] as string;

  if (!userId) {
    res.status(401).json({ error: "অননুমোদিত অ্যাক্সেস! অনুগ্রহ করে লগইন করুন।" });
    return;
  }

  const db = readDB();
  const user = db.users.find((u: any) => u.id === userId);

  if (!user || user.password !== password) {
    res.status(401).json({ error: "লগইন তথ্য সঠিক নয় অথবা ব্যবহারকারী খুঁজে পাওয়া যায়নি।" });
    return;
  }

  if (user.isBlocked) {
    res.status(403).json({ error: "আপনার অ্যাকাউন্টটি ব্লক করা হয়েছে। দয়া করে এডমিনের সাথে যোগাযোগ করুন।" });
    return;
  }

  (req as any).user = user;
  next();
}

// Admin Check Middleware
function adminMiddleware(req: express.Request, res: express.Response, next: express.NextFunction) {
  const user = (req as any).user;
  if (!user || !user.isAdmin) {
    res.status(430).json({ error: "এই কাজটি করার জন্য আপনার এডমিন ক্ষমতা নেই।" });
    return;
  }
  next();
}

// API Routes

// 1. Auth routes
app.post("/api/auth/register", (req, res) => {
  const { id, password, referredBy } = req.body;

  if (!id || !password) {
    res.status(400).json({ error: "বিকাশ নম্বর এবং পাসওয়ার্ড আবশ্যিক।" });
    return;
  }

  // Verify Bangladeshi phone format
  const phoneRegex = /^01[3-9]\d{8}$/;
  if (!phoneRegex.test(id)) {
    res.status(400).json({ error: "অনুগ্রহ করে একটি সঠিক বাংলাদেশী ১১-ডিজিটের সচল বিকাশ নম্বর দিন (যেমন: 01712345678)" });
    return;
  }

  const db = readDB();
  const existingUser = db.users.find((u: any) => u.id === id);
  if (existingUser) {
    res.status(400).json({ error: "এই বিকাশ নম্বরটি দিয়ে ইতিমধ্যে রেজিস্ট্রেশন করা হয়েছে।" });
    return;
  }

  // Validate referredBy if provided
  let referrerId = null;
  if (referredBy && referredBy.trim() !== "") {
    const cleanReferrer = referredBy.trim();
    const referrer = db.users.find((u: any) => u.id === cleanReferrer);
    if (referrer) {
      referrerId = cleanReferrer;
    } else {
      res.status(400).json({ error: "প্রদত্ত রেফারেল বিকাশ নম্বরটি সিস্টেমে খুঁজে পাওয়া যায়নি।" });
      return;
    }
  }

  const newUser = {
    id,
    password,
    balance: 0,
    referredBy: referrerId,
    createdAt: new Date().toISOString(),
    isBlocked: false,
    isAdmin: false
  };

  db.users.push(newUser);
  writeDB(db);

  res.json({ message: "রেজিস্ট্রেশন সফল হয়েছে!", user: { id: newUser.id, balance: newUser.balance, isAdmin: newUser.isAdmin } });
});

app.post("/api/auth/login", (req, res) => {
  const { id, password } = req.body;

  if (!id || !password) {
    res.status(400).json({ error: "বিকাশ নম্বর এবং পাসওয়ার্ড আবশ্যিক।" });
    return;
  }

  const db = readDB();
  const user = db.users.find((u: any) => u.id === id);

  if (!user || user.password !== password) {
    res.status(401).json({ error: "বিকাশ নম্বর অথবা পাসওয়ার্ডটি সঠিক নয়।" });
    return;
  }

  if (user.isBlocked) {
    res.status(403).json({ error: "আপনার অ্যাকাউন্টটি ব্লক করা হয়েছে।" });
    return;
  }

  res.json({
    message: "লগইন সফল হয়েছে!",
    user: {
      id: user.id,
      balance: user.balance,
      isAdmin: user.isAdmin,
      referredBy: user.referredBy
    }
  });
});

app.post("/api/auth/verify-admin-pass", authMiddleware, (req, res) => {
  const user = (req as any).user;
  const { password } = req.body;

  if (!password) {
    res.status(400).json({ error: "পাসওয়ার্ড প্রদান করা আবশ্যক।" });
    return;
  }

  const db = readDB();
  const dbUser = db.users.find((u: any) => u.id === user.id);

  if (!dbUser) {
    res.status(404).json({ error: "ইউজার পাওয়া যায়নি।" });
    return;
  }

  if (dbUser.adminPasswordAttempts === undefined) {
    dbUser.adminPasswordAttempts = 0;
  }

  if (password === "2026") {
    dbUser.adminPasswordAttempts = 0;
    writeDB(db);
    res.json({ success: true });
  } else {
    dbUser.adminPasswordAttempts += 1;
    if (dbUser.adminPasswordAttempts >= 2) {
      dbUser.isBlocked = true;
      writeDB(db);
      res.status(403).json({
        success: false,
        blocked: true,
        error: "ভুল পাসওয়ার্ড ২ বার দেওয়ায় আপনার অ্যাকাউন্টটি ব্লক করা হয়েছে।"
      });
    } else {
      writeDB(db);
      res.status(400).json({
        success: false,
        blocked: false,
        attemptsRemaining: 2 - dbUser.adminPasswordAttempts,
        error: `ভুল পাসওয়ার্ড! আর ${2 - dbUser.adminPasswordAttempts} বার ভুল দিলে অ্যাকাউন্ট ব্লক হবে।`
      });
    }
  }
});

// 2. Public configs & notices
app.get("/api/config", (req, res) => {
  const db = readDB();
  res.json(db.config);
});

app.get("/api/notice", (req, res) => {
  const db = readDB();
  res.json(db.notices);
});

// 3. User features (Requires auth)
app.get("/api/user/profile", authMiddleware, (req, res) => {
  const user = (req as any).user;
  res.json({
    id: user.id,
    balance: user.balance,
    isAdmin: user.isAdmin,
    referredBy: user.referredBy,
    displayName: user.displayName || "",
    avatarUrl: user.avatarUrl || "",
    bKashNumber: user.bKashNumber || user.id, // default to register phone
    whatsAppNumber: user.whatsAppNumber || "",
    password: user.password || ""
  });
});

app.post("/api/user/profile/update", authMiddleware, (req, res) => {
  const user = (req as any).user;
  const { displayName, avatarUrl, bKashNumber, whatsAppNumber, password } = req.body;
  
  const db = readDB();
  const dbUser = db.users.find((u: any) => u.id === user.id);
  if (dbUser) {
    dbUser.displayName = displayName || "";
    dbUser.avatarUrl = avatarUrl || "";
    dbUser.bKashNumber = bKashNumber || user.id;
    dbUser.whatsAppNumber = whatsAppNumber || "";
    if (password && password.trim() !== "") {
      dbUser.password = password;
    }
    writeDB(db);
    res.json({
      success: true,
      displayName: dbUser.displayName,
      avatarUrl: dbUser.avatarUrl,
      bKashNumber: dbUser.bKashNumber,
      whatsAppNumber: dbUser.whatsAppNumber
    });
  } else {
    res.status(404).json({ error: "ইউজার পাওয়া যায়নি।" });
  }
});

// Get products with computed stock
app.get("/api/products", (req, res) => {
  const db = readDB();
  const productsWithStock = db.products.map((prod: any) => {
    const unsoldMailsCount = db.mails.filter((m: any) => m.productId === prod.id && !m.isSold).length;
    return {
      ...prod,
      stock: unsoldMailsCount
    };
  });
  res.json(productsWithStock);
});

// Purchase route
app.post("/api/buy", authMiddleware, (req, res) => {
  const user = (req as any).user;
  const { productId, quantity } = req.body;

  if (!productId || !quantity || quantity <= 0) {
    res.status(400).json({ error: "সঠিক পণ্য আইডি এবং পরিমাণ প্রদান করুন।" });
    return;
  }

  const db = readDB();
  const product = db.products.find((p: any) => p.id === productId);
  if (!product) {
    res.status(404).json({ error: "পণ্যটি খুঁজে পাওয়া যায়নি।" });
    return;
  }

  // Find unsold mails
  const availableMails = db.mails.filter((m: any) => m.productId === productId && !m.isSold);
  if (availableMails.length < quantity) {
    res.status(400).json({ error: `পর্যাপ্ত স্টক নেই! উপলব্ধ স্টক: ${availableMails.length} টি।` });
    return;
  }

  const totalPrice = product.price * quantity;
  if (user.balance < totalPrice) {
    res.status(400).json({ error: `আপনার ব্যালেন্স পর্যাপ্ত নয়! প্রদেয়: ৳${totalPrice}, বর্তমান ব্যালেন্স: ৳${user.balance}` });
    return;
  }

  // Process purchase
  const boughtMails: any[] = [];
  let allocated = 0;

  for (const mail of db.mails) {
    if (mail.productId === productId && !mail.isSold && allocated < quantity) {
      mail.isSold = true;
      mail.soldTo = user.id;
      mail.soldAt = new Date().toISOString();
      boughtMails.push(mail);
      allocated++;
    }
  }

  // Deduct balance from user in database
  const userIndex = db.users.findIndex((u: any) => u.id === user.id);
  db.users[userIndex].balance -= totalPrice;

  writeDB(db);

  res.json({
    message: "ক্রয় সফল হয়েছে!",
    purchasedMails: boughtMails.map((m: any) => m.content),
    totalDeducted: totalPrice,
    newBalance: db.users[userIndex].balance
  });
});

// Get user deposit & purchase history
app.get("/api/user/history", authMiddleware, (req, res) => {
  const user = (req as any).user;
  const db = readDB();

  const userDeposits = db.deposits.filter((d: any) => d.userId === user.id);
  
  // Find all purchased mails
  const userPurchases = db.mails
    .filter((m: any) => m.soldTo === user.id)
    .map((m: any) => {
      const prod = db.products.find((p: any) => p.id === m.productId);
      return {
        id: m.id,
        productName: prod ? prod.name : "Unknown Mail Product",
        content: m.content,
        price: prod ? prod.price : 0,
        soldAt: m.soldAt
      };
    });

  // Find users who have registered using this user's ID as referral
  const referrals = db.users
    .filter((u: any) => u.referredBy === user.id)
    .map((u: any) => ({
      id: u.id,
      createdAt: u.createdAt,
      totalDepositedByThem: db.deposits
        .filter((d: any) => d.userId === u.id && d.status === "approved")
        .reduce((sum: number, d: any) => sum + d.amount, 0)
    }));

  res.json({
    deposits: userDeposits,
    purchases: userPurchases,
    referrals: referrals
  });
});

// Submit deposit request
app.post("/api/deposit", authMiddleware, (req, res) => {
  const user = (req as any).user;
  const { amount, bKashNumber, transactionId, screenshot } = req.body;

  if (!amount || amount <= 0 || !bKashNumber || !transactionId) {
    res.status(400).json({ error: "সবগুলো ফিল্ড সঠিকভাবে পূরণ করুন।" });
    return;
  }

  const db = readDB();

  // Prevent duplicate transactionId
  const dup = db.deposits.find((d: any) => d.transactionId.trim().toUpperCase() === transactionId.trim().toUpperCase());
  if (dup) {
    res.status(400).json({ error: "এই ট্রানজেকশন আইডিটি ইতিমধ্যে সাবমিট করা হয়েছে।" });
    return;
  }

  const newDeposit = {
    id: "dep-" + Date.now(),
    userId: user.id,
    amount: Number(amount),
    bKashNumber,
    transactionId: transactionId.trim().toUpperCase(),
    status: "pending",
    createdAt: new Date().toISOString(),
    approvedAt: null,
    screenshot: screenshot || null
  };

  db.deposits.push(newDeposit);
  writeDB(db);

  res.json({ message: "ডিপোজিট রিকোয়েস্ট জমা দেওয়া হয়েছে! এডমিন শীঘ্রই ভেরিফাই করবেন।" });
});

// Submit task
app.post("/api/task/submit", authMiddleware, (req, res) => {
  const user = (req as any).user;
  const { sheetLink, note, taskType } = req.body;

  if (!sheetLink) {
    res.status(400).json({ error: "গুগল শিট লিঙ্কটি আবশ্যিক।" });
    return;
  }

  const db = readDB();
  const newSubmission = {
    id: "sub-" + Date.now(),
    userId: user.id,
    sheetLink,
    note: note || "",
    status: "pending",
    createdAt: new Date().toISOString(),
    taskType: taskType || "2FA"
  };

  db.submissions.push(newSubmission);
  writeDB(db);

  res.json({ message: "কাজ সম্পন্ন হওয়ার গুগল শিট সফলভাবে জমা দেওয়া হয়েছে!" });
});

// Chat get & send
app.get("/api/chat/messages", authMiddleware, (req, res) => {
  const user = (req as any).user;
  const db = readDB();
  const messages = db.chatMessages.filter((m: any) => m.userId === user.id);
  res.json(messages);
});

app.post("/api/chat/send", authMiddleware, (req, res) => {
  const user = (req as any).user;
  const { message } = req.body;

  if (!message || message.trim() === "") {
    res.status(400).json({ error: "খালি মেসেজ পাঠানো সম্ভব নয়।" });
    return;
  }

  const db = readDB();
  const newMessage = {
    id: "chat-" + Date.now(),
    userId: user.id,
    sender: "user",
    message: message.trim(),
    createdAt: new Date().toISOString()
  };

  db.chatMessages.push(newMessage);
  writeDB(db);

  res.json(newMessage);
});


// -----------------------------------------------------------------------------
// Admin APIs (All routes below require Admin authorization)
// -----------------------------------------------------------------------------

// Get all deposits for Admin
app.get("/api/admin/deposits", authMiddleware, adminMiddleware, (req, res) => {
  const db = readDB();
  res.json(db.deposits);
});

// Approve Deposit and award Referral Bonus
app.post("/api/admin/deposits/approve", authMiddleware, adminMiddleware, (req, res) => {
  const { depositId } = req.body;
  if (!depositId) {
    res.status(400).json({ error: "ডিপোজিট আইডি প্রয়োজন।" });
    return;
  }

  const db = readDB();
  const depositIndex = db.deposits.findIndex((d: any) => d.id === depositId);
  if (depositIndex === -1) {
    res.status(404).json({ error: "ডিপোজিট রিকোয়েস্টটি খুঁজে পাওয়া যায়নি।" });
    return;
  }

  const deposit = db.deposits[depositIndex];
  if (deposit.status !== "pending") {
    res.status(400).json({ error: "এই ডিপোজিট রিকোয়েস্টটি ইতিমধ্যে প্রক্রিয়াজাত করা হয়েছে।" });
    return;
  }

  // Find the depositing user
  const userIndex = db.users.findIndex((u: any) => u.id === deposit.userId);
  if (userIndex === -1) {
    res.status(404).json({ error: "ডিপোজিটকারী ব্যবহারকারী খুঁজে পাওয়া যায়নি।" });
    return;
  }

  // Approve the deposit
  db.deposits[depositIndex].status = "approved";
  db.deposits[depositIndex].approvedAt = new Date().toISOString();

  // Add the balance to user
  db.users[userIndex].balance += deposit.amount;

  // Process Referral Bonus if this user was referred by another active user
  const depositor = db.users[userIndex];
  if (depositor.referredBy) {
    const referrerIndex = db.users.findIndex((u: any) => u.id === depositor.referredBy);
    if (referrerIndex !== -1) {
      const bonusRate = db.config.referralBonusPercent || 5; // e.g. 5%
      const bonusAmount = Number(((deposit.amount * bonusRate) / 100).toFixed(2));
      
      db.users[referrerIndex].balance += bonusAmount;
      
      // Log chat notice or internal activity
      db.chatMessages.push({
        id: "chat-system-" + Date.now(),
        userId: depositor.referredBy,
        sender: "admin",
        message: `অভিনন্দন! আপনার রেফারেল ব্যবহারকারী (${depositor.id}) ৳${deposit.amount} ব্যালেন্স যুক্ত করেছেন। আপনি ${bonusRate}% হারে ৳${bonusAmount} রেফারেল বোনাস পেয়েছেন!`,
        createdAt: new Date().toISOString()
      });
    }
  }

  writeDB(db);
  res.json({ message: "ডিপোজিট সফলভাবে অ্যাপ্রুভ করা হয়েছে এবং রেফারেল বোনাস (প্রযোজ্য ক্ষেত্রে) বিতরণ করা হয়েছে।" });
});

// Reject Deposit
app.post("/api/admin/deposits/reject", authMiddleware, adminMiddleware, (req, res) => {
  const { depositId } = req.body;
  if (!depositId) {
    res.status(400).json({ error: "ডিপোজিট আইডি প্রয়োজন।" });
    return;
  }

  const db = readDB();
  const depositIndex = db.deposits.findIndex((d: any) => d.id === depositId);
  if (depositIndex === -1) {
    res.status(404).json({ error: "ডিপোজিট রিকোয়েস্টটি খুঁজে পাওয়া যায়নি।" });
    return;
  }

  if (db.deposits[depositIndex].status !== "pending") {
    res.status(400).json({ error: "এই ডিপোজিট রিকোয়েস্টটি ইতিমধ্যে প্রক্রিয়াজাত করা হয়েছে।" });
    return;
  }

  db.deposits[depositIndex].status = "rejected";
  db.deposits[depositIndex].approvedAt = new Date().toISOString();

  writeDB(db);
  res.json({ message: "ডিপোজিট রিকোয়েস্ট রিজেক্ট করা হয়েছে।" });
});

// Get all submissions for Admin
app.get("/api/admin/submissions", authMiddleware, adminMiddleware, (req, res) => {
  const db = readDB();
  res.json(db.submissions);
});

// Approve/Reject Task Submission
app.post("/api/admin/submissions/action", authMiddleware, adminMiddleware, (req, res) => {
  const { submissionId, status } = req.body; // status: 'approved' | 'rejected'
  if (!submissionId || !status) {
    res.status(400).json({ error: "সাবমিশন আইডি এবং স্ট্যাটাস প্রয়োজন।" });
    return;
  }

  const db = readDB();
  const subIndex = db.submissions.findIndex((s: any) => s.id === submissionId);
  if (subIndex === -1) {
    res.status(404).json({ error: "কাজটির সাবমিশন রেকর্ড পাওয়া যায়নি।" });
    return;
  }

  db.submissions[subIndex].status = status;
  writeDB(db);

  res.json({ message: `কাজটির সাবমিশন সফলভাবে ${status === "approved" ? "অ্যাপ্রুভ" : "রিজেক্ট"} করা হয়েছে।` });
});

// Add new Product
app.post("/api/admin/products/add", authMiddleware, adminMiddleware, (req, res) => {
  const { name, description, price } = req.body;
  if (!name || !price || price < 0) {
    res.status(400).json({ error: "পণ্যটির নাম এবং সঠিক মূল্য প্রদান করুন।" });
    return;
  }

  const db = readDB();
  const newProduct = {
    id: "prod-" + Date.now(),
    name,
    description: description || "",
    price: Number(price),
    stock: 0
  };

  db.products.push(newProduct);
  writeDB(db);

  res.json({ message: "নতুন পণ্য সফলভাবে যুক্ত করা হয়েছে!", product: newProduct });
});

// Delete Product
app.post("/api/admin/products/delete", authMiddleware, adminMiddleware, (req, res) => {
  const { productId } = req.body;
  if (!productId) {
    res.status(400).json({ error: "পণ্য আইডি প্রয়োজন।" });
    return;
  }

  const db = readDB();
  db.products = db.products.filter((p: any) => p.id !== productId);
  // Also remove unsold mails of this product
  db.mails = db.mails.filter((m: any) => !(m.productId === productId && !m.isSold));

  writeDB(db);
  res.json({ message: "পণ্যটি সফলভাবে মুছে ফেলা হয়েছে।" });
});

// Upload Mails (Direct mail list upload)
app.post("/api/admin/mails/upload", authMiddleware, adminMiddleware, (req, res) => {
  const { productId, mailsList } = req.body; // mailsList is a string with newline separated emails
  if (!productId || !mailsList || mailsList.trim() === "") {
    res.status(400).json({ error: "পণ্য আইডি এবং মেইলের তালিকা প্রদান করুন।" });
    return;
  }

  const db = readDB();
  const productExists = db.products.some((p: any) => p.id === productId);
  if (!productExists) {
    res.status(404).json({ error: "পণ্যটি খুঁজে পাওয়া যায়নি।" });
    return;
  }

  const lines = mailsList.split("\n").map((line: string) => line.trim()).filter((line: string) => line !== "");
  const addedMails: any[] = [];

  for (const content of lines) {
    addedMails.push({
      id: "mail-" + Date.now() + "-" + Math.floor(Math.random() * 1000000),
      productId,
      content,
      isSold: false,
      soldTo: null,
      soldAt: null,
      createdAt: new Date().toISOString()
    });
  }

  db.mails.push(...addedMails);
  writeDB(db);

  res.json({ message: `${addedMails.length}টি মেইল সফলভাবে আপলোড করা হয়েছে!` });
});

// Update System Configuration
app.post("/api/admin/config/update", authMiddleware, adminMiddleware, (req, res) => {
  const { referralBonusPercent, bkashNumber, tokenToCodeLink, twoFactorCodeLink, whatsappGroupLink, adminWhatsApp, developerWhatsApp } = req.body;

  const db = readDB();
  db.config = {
    referralBonusPercent: referralBonusPercent !== undefined ? Number(referralBonusPercent) : db.config.referralBonusPercent,
    bkashNumber: bkashNumber || db.config.bkashNumber,
    tokenToCodeLink: tokenToCodeLink !== undefined ? tokenToCodeLink : db.config.tokenToCodeLink,
    twoFactorCodeLink: twoFactorCodeLink !== undefined ? twoFactorCodeLink : db.config.twoFactorCodeLink,
    whatsappGroupLink: whatsappGroupLink !== undefined ? whatsappGroupLink : db.config.whatsappGroupLink,
    adminWhatsApp: adminWhatsApp || db.config.adminWhatsApp,
    developerWhatsApp: developerWhatsApp || db.config.developerWhatsApp
  };

  writeDB(db);
  res.json({ message: "কনফিগারেশন সফলভাবে আপডেট করা হয়েছে!", config: db.config });
});

// Update Notices
app.post("/api/admin/notice/update", authMiddleware, adminMiddleware, (req, res) => {
  const { content } = req.body;
  if (content === undefined) {
    res.status(400).json({ error: "নোটিশের কনটেন্ট প্রয়োজন।" });
    return;
  }

  const db = readDB();
  db.notices = [
    {
      id: "not-" + Date.now(),
      content: content,
      createdAt: new Date().toISOString()
    }
  ];

  writeDB(db);
  res.json({ message: "নোটিশ সফলভাবে আপডেট করা হয়েছে!" });
});

// Get all users for admin
app.get("/api/admin/users", authMiddleware, adminMiddleware, (req, res) => {
  const db = readDB();
  const usersWithStats = db.users.map((u: any) => {
    const userPurchases = db.mails.filter((m: any) => m.soldTo === u.id);
    const userDeposits = db.deposits.filter((d: any) => d.userId === u.id && d.status === "approved");
    const referralsCount = db.users.filter((ref: any) => ref.referredBy === u.id).length;
    return {
      id: u.id,
      balance: u.balance,
      referredBy: u.referredBy,
      createdAt: u.createdAt,
      isBlocked: u.isBlocked,
      isAdmin: u.isAdmin,
      purchasesCount: userPurchases.length,
      totalDeposited: userDeposits.reduce((sum: number, d: any) => sum + d.amount, 0),
      referralsCount,
      displayName: u.displayName || "",
      avatarUrl: u.avatarUrl || ""
    };
  });
  res.json(usersWithStats);
});

// Block/Unblock user
app.post("/api/admin/users/toggle-block", authMiddleware, adminMiddleware, (req, res) => {
  const { userId } = req.body;
  if (!userId) {
    res.status(400).json({ error: "ব্যবহারকারী আইডি প্রয়োজন।" });
    return;
  }

  const db = readDB();
  const userIndex = db.users.findIndex((u: any) => u.id === userId);
  if (userIndex === -1) {
    res.status(404).json({ error: "ব্যবহারকারী খুঁজে পাওয়া যায়নি।" });
    return;
  }

  if (db.users[userIndex].isAdmin) {
    res.status(400).json({ error: "এডমিন ব্যবহারকারীকে ব্লক করা সম্ভব নয়।" });
    return;
  }

  db.users[userIndex].isBlocked = !db.users[userIndex].isBlocked;
  writeDB(db);

  res.json({ message: `ব্যবহারকারীকে সফলভাবে ${db.users[userIndex].isBlocked ? "ব্লক" : "আনব্লক"} করা হয়েছে।` });
});

// Update specific user balance
app.post("/api/admin/users/update-balance", authMiddleware, adminMiddleware, (req, res) => {
  const { userId, amount } = req.body;
  if (!userId || amount === undefined) {
    res.status(400).json({ error: "ব্যবহারকারী আইডি এবং ব্যালেন্সের পরিমাণ আবশ্যিক।" });
    return;
  }

  const db = readDB();
  const userIndex = db.users.findIndex((u: any) => u.id === userId);
  if (userIndex === -1) {
    res.status(404).json({ error: "ব্যবহারকারী খুঁজে পাওয়া যায়নি।" });
    return;
  }

  db.users[userIndex].balance = Number(amount);
  writeDB(db);

  res.json({ message: "ব্যবহারকারীর ব্যালেন্স সফলভাবে আপডেট করা হয়েছে!" });
});

// Get users who have active chats
app.get("/api/admin/chat/users", authMiddleware, adminMiddleware, (req, res) => {
  const db = readDB();
  // Get unique userIds from chatMessages who are not admins
  const userIds = Array.from(new Set(db.chatMessages.map((m: any) => m.userId)));
  const usersWithChats = userIds.map((uid: string) => {
    const user = db.users.find((u: any) => u.id === uid);
    const lastMsg = db.chatMessages
      .filter((m: any) => m.userId === uid)
      .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0];
    return {
      id: uid,
      isAdmin: user ? user.isAdmin : false,
      lastMessage: lastMsg ? lastMsg.message : "",
      lastMessageAt: lastMsg ? lastMsg.createdAt : ""
    };
  }).filter(u => !u.isAdmin);

  res.json(usersWithChats);
});

// Get messages for a specific user chat
app.get("/api/admin/chat/messages/:userId", authMiddleware, adminMiddleware, (req, res) => {
  const { userId } = req.params;
  const db = readDB();
  const messages = db.chatMessages.filter((m: any) => m.userId === userId);
  res.json(messages);
});

// Admin sends message to user
app.post("/api/admin/chat/send", authMiddleware, adminMiddleware, (req, res) => {
  const { userId, message } = req.body;
  if (!userId || !message || message.trim() === "") {
    res.status(400).json({ error: "ব্যবহারকারী আইডি এবং মেসেজ আবশ্যিক।" });
    return;
  }

  const db = readDB();
  const newMessage = {
    id: "chat-" + Date.now(),
    userId: userId,
    sender: "admin",
    message: message.trim(),
    createdAt: new Date().toISOString()
  };

  db.chatMessages.push(newMessage);
  writeDB(db);

  res.json(newMessage);
});


// -----------------------------------------------------------------------------
// Vite and Static assets server
// -----------------------------------------------------------------------------
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
