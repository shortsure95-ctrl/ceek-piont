import React, { useState } from "react";
import { Deposit, Purchase } from "../types";
import { X, Wallet, Copy, Check, ArrowDownLeft, ArrowUpRight, History, RefreshCw, UploadCloud, CheckCircle2, AlertCircle } from "lucide-react";
import { motion } from "motion/react";

interface AddMoneyModalProps {
  userId: string;
  userBalance: number;
  deposits: Deposit[];
  purchases: Purchase[];
  config?: any;
  onClose: () => void;
  onSubmitDeposit: (amount: number, bKashNumber: string, transactionId: string, screenshot?: string) => Promise<void>;
  onRefresh: () => void;
}

export const AddMoneyModal: React.FC<AddMoneyModalProps> = ({
  userId,
  userBalance,
  deposits,
  purchases,
  config,
  onClose,
  onSubmitDeposit,
  onRefresh
}) => {
  const [amount, setAmount] = useState<string>("");
  const [bKashNumber, setBKashNumber] = useState<string>("");
  const [transactionId, setTransactionId] = useState<string>("");
  const [screenshot, setScreenshot] = useState<string>("");
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [numCopied, setNumCopied] = useState<boolean>(false);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  // Active modal tab: "add" or "history"
  const [modalTab, setModalTab] = useState<"add" | "history">("add");

  const bkashNumberToDisplay = config?.bkashNumber || "01609166109";

  const handleDepositSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || !bKashNumber || !transactionId) {
      setErrorMsg("দয়া করে সবগুলো তথ্য সঠিকভাবে পূরণ করুন।");
      return;
    }

    const numAmount = Number(amount);
    if (isNaN(numAmount) || numAmount < 20) {
      setErrorMsg("সর্বনিম্ন ২০ টাকা ডিপোজিট করতে হবে।");
      return;
    }

    setSubmitting(true);
    setErrorMsg(null);
    setSuccessMsg(null);
    try {
      await onSubmitDeposit(numAmount, bKashNumber, transactionId, screenshot);
      setSuccessMsg("আপনার ডিপোজিট রিকোয়েস্ট সফলভাবে সাবমিট হয়েছে! দ্রুত এটি যাচাই করে ব্যালেন্স যুক্ত করা হবে।");
      setAmount("");
      setBKashNumber("");
      setTransactionId("");
      setScreenshot("");
      onRefresh();
    } catch (err: any) {
      setErrorMsg(err.message || "সাবমিট করতে ব্যর্থ হয়েছে। অনুগ্রহ করে আবার চেষ্টা করুন।");
    } finally {
      setSubmitting(false);
    }
  };

  const selectPresetAmount = (value: number) => {
    setAmount(value.toString());
  };

  const handleRefreshClick = async () => {
    setIsRefreshing(true);
    onRefresh();
    setTimeout(() => {
      setIsRefreshing(false);
    }, 1000);
  };

  // Compile unified transaction ledger (deposits and purchases)
  const getTransactionLedger = () => {
    const ledgerItems: Array<{
      id: string;
      type: "deposit" | "purchase";
      amount: number;
      label: string;
      subLabel: string;
      status?: "pending" | "approved" | "rejected";
      date: string;
    }> = [];

    deposits.forEach((dep) => {
      ledgerItems.push({
        id: dep.id,
        type: "deposit",
        amount: dep.amount,
        label: "বিকাশ ডিপোজিট",
        subLabel: `TxID: ${dep.transactionId}`,
        status: dep.status,
        date: dep.createdAt
      });
    });

    purchases.forEach((pur) => {
      ledgerItems.push({
        id: pur.id,
        type: "purchase",
        amount: pur.price,
        label: pur.productName,
        subLabel: "মেইল ক্রয়",
        date: pur.soldAt
      });
    });

    return ledgerItems.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  };

  const ledger = getTransactionLedger();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4">
      {/* Red backdrop overlay with nice blur */}
      <div 
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
        onClick={onClose}
      />

      {/* Red/White premium UI styled modal card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        className="bg-[#F8FAFC] border border-slate-200 rounded-[32px] w-full max-w-2xl h-[92vh] sm:h-[820px] flex flex-col overflow-hidden shadow-2xl relative z-10"
      >
        {/* Header - Minimal Modern with Dark Slate background to make pinks/reds pop */}
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="bg-rose-500/10 p-2 rounded-2xl border border-rose-500/20">
              <Wallet className="w-5 h-5 text-rose-500 animate-pulse" />
            </div>
            <div>
              <h3 className="font-black text-sm md:text-base tracking-tight text-white uppercase">RTN Support Add Balance</h3>
              <p className="text-[10px] text-slate-400 font-bold">Fast. Secure. Reliable.</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Selection */}
        <div className="flex bg-white border-b border-slate-150 shrink-0">
          <button
            onClick={() => setModalTab("add")}
            className={`flex-1 py-3 text-xs font-black text-center border-b-2 transition-all ${modalTab === "add" ? "border-rose-500 text-rose-600 bg-rose-50/10" : "border-transparent text-slate-500 hover:text-slate-800"}`}
          >
            টাকা যোগ করুন (Add Balance)
          </button>
          <button
            onClick={() => setModalTab("history")}
            className={`flex-1 py-3 text-xs font-black text-center border-b-2 transition-all ${modalTab === "history" ? "border-rose-500 text-rose-600 bg-rose-50/10" : "border-transparent text-slate-500 hover:text-slate-800"}`}
          >
            লেনদেন বিবরণী (Ledger History)
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
          {modalTab === "add" ? (
            <div className="space-y-5">
              
              {/* TOP GRID: "My Balance" and "Add Balance via bKash" cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* 1. "My Balance" Card */}
                <div className="bg-gradient-to-br from-[#FF4365] to-[#FF6B6B] text-white rounded-3xl p-5 shadow-lg relative overflow-hidden flex flex-col justify-between h-[150px]">
                  {/* Background overlay graphic */}
                  <div className="absolute -right-6 -bottom-6 opacity-10 text-white">
                    <Wallet className="w-32 h-32" />
                  </div>
                  
                  <div>
                    <span className="text-[11px] font-extrabold uppercase tracking-widest text-rose-100 block">My Balance</span>
                    <span className="text-3xl font-black font-mono tracking-tight block mt-1.5">৳ {userBalance.toFixed(2)}</span>
                  </div>

                  <div className="flex items-center justify-between z-10">
                    <button
                      type="button"
                      onClick={handleRefreshClick}
                      className="flex items-center gap-1.5 text-[10px] font-extrabold bg-white/15 hover:bg-white/25 px-3 py-1.5 rounded-xl transition active:scale-95 border border-white/10"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 text-white ${isRefreshing ? "animate-spin" : ""}`} />
                      <span>{isRefreshing ? "Updating..." : "Last updated: Just now"}</span>
                    </button>
                    <Wallet className="w-6 h-6 text-white/40" />
                  </div>
                </div>

                {/* 2. "Add Balance via bKash" Card */}
                <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm flex flex-col justify-between h-[150px]">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-extrabold text-slate-500 uppercase tracking-wider block">Add Balance via bKash</span>
                    {/* Beautiful pinkish bKash badge */}
                    <div className="flex items-center gap-1 bg-[#D12053] text-white text-[9px] font-black px-2.5 py-1 rounded-xl tracking-wider">
                      <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
                      <span>bKash</span>
                    </div>
                  </div>

                  {/* Number Field showing Admin bKash number with copy icon */}
                  <div className="bg-slate-50 border border-slate-150 rounded-2xl p-3 flex items-center justify-between gap-2 mt-2">
                    <span className="text-sm font-black text-slate-800 font-mono tracking-wider">{bkashNumberToDisplay}</span>
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard.writeText(bkashNumberToDisplay);
                        setNumCopied(true);
                        setTimeout(() => setNumCopied(false), 2000);
                      }}
                      className={`p-2 rounded-xl transition duration-200 cursor-pointer ${numCopied ? "bg-emerald-50 text-emerald-600 border border-emerald-100" : "bg-slate-100 hover:bg-slate-200 text-slate-600"}`}
                      title="নম্বর কপি করুন"
                    >
                      {numCopied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>

                  {/* Dashed Border "Min deposit 20 tk" Badge */}
                  <div className="border border-dashed border-rose-300 bg-rose-50/30 rounded-xl py-1 px-3 text-center text-[10px] font-extrabold text-rose-600 mt-2">
                    Min deposit 20 tk
                  </div>
                </div>

              </div>

              {/* MIDDLE SECTION: Quick Amount Selection */}
              <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm space-y-3">
                <span className="text-[11px] font-extrabold text-slate-500 uppercase tracking-wider block">Quick Amount</span>
                
                <div className="grid grid-cols-4 gap-2">
                  {[20, 50, 100].map((amt) => {
                    const isSelected = amount === amt.toString();
                    return (
                      <button
                        key={amt}
                        type="button"
                        onClick={() => selectPresetAmount(amt)}
                        className={`py-2.5 rounded-xl text-xs font-black transition-all cursor-pointer ${isSelected ? "bg-rose-500 text-white border-rose-500 shadow-md shadow-rose-500/20" : "bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200"}`}
                      >
                        ৳{amt}
                      </button>
                    );
                  })}
                  <button
                    type="button"
                    onClick={() => {
                      setAmount("");
                      const inp = document.getElementById("enter-amount-input");
                      if (inp) inp.focus();
                    }}
                    className={`py-2.5 rounded-xl text-xs font-black transition-all cursor-pointer border ${amount !== "20" && amount !== "50" && amount !== "100" && amount !== "" ? "bg-rose-500 text-white border-rose-500 shadow-md shadow-rose-500/20" : "bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200"}`}
                  >
                    Custom ✎
                  </button>
                </div>
              </div>

              {/* INPUT FIELDS CARD: Enter Amount, bKash TxID & Upload Screenshot */}
              <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm space-y-4">
                
                <form onSubmit={handleDepositSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    
                    {/* 1. Enter Amount */}
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-slate-600 uppercase tracking-wider block">Enter Amount</label>
                      <div className="relative">
                        <input
                          id="enter-amount-input"
                          type="number"
                          required
                          placeholder="e.g. 120"
                          value={amount}
                          onChange={(e) => setAmount(e.target.value)}
                          className="w-full text-xs font-black border border-slate-200 rounded-2xl pl-4 pr-10 py-3 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition outline-hidden font-mono"
                        />
                        <div className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-extrabold text-sm">৳</div>
                      </div>
                    </div>

                    {/* 2. bKash TxID */}
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-slate-600 uppercase tracking-wider block">bKash TxID</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. A1B2C3D4E5"
                        value={transactionId}
                        onChange={(e) => setTransactionId(e.target.value)}
                        className="w-full text-xs font-black border border-slate-200 rounded-2xl px-4 py-3 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition outline-hidden font-mono uppercase"
                      />
                    </div>

                  </div>

                  {/* 3. Sender's bKash Number */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-600 uppercase tracking-wider block">আপনার বিকাশ নম্বর (Sender's bKash Number) *</label>
                    <input
                      type="text"
                      required
                      placeholder="যেমন: 018XXXXXXXX"
                      value={bKashNumber}
                      onChange={(e) => setBKashNumber(e.target.value)}
                      className="w-full text-xs font-black border border-slate-200 rounded-2xl px-4 py-3 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition outline-hidden font-mono"
                    />
                  </div>

                  {/* 4. Upload Screenshot with Tap to upload container */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-600 uppercase tracking-wider block">Upload Screenshot (ঐচ্ছিক)</label>
                    
                    <div className="relative border-2 border-dashed border-slate-200 rounded-2xl p-4 bg-slate-50 hover:bg-slate-100/50 transition flex flex-col items-center justify-center min-h-[110px] text-center cursor-pointer">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.onloadend = () => {
                              setScreenshot(reader.result as string);
                            };
                            reader.readAsDataURL(file);
                          }
                        }}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                      />
                      {screenshot ? (
                        <div className="space-y-2 z-20">
                          <img src={screenshot} alt="Payment Receipt" className="max-h-20 mx-auto rounded-lg shadow-xxs border border-slate-200" />
                          <button
                            type="button"
                            onClick={() => setScreenshot("")}
                            className="text-[10px] text-red-500 font-extrabold hover:underline"
                          >
                            ছবি মুছুন (Delete)
                          </button>
                        </div>
                      ) : (
                        <div className="space-y-2 text-slate-400 flex flex-col items-center justify-center">
                          <UploadCloud className="w-8 h-8 text-slate-300" />
                          <span className="text-xs font-black text-slate-500">Tap to upload</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Warning/Guideline bottom sentence */}
                  <div className="flex items-start gap-2 text-[10px] font-bold text-slate-500 bg-slate-50 rounded-xl p-3 border border-slate-150 leading-relaxed">
                    <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                    <span>Please send money to the number above. Incorrect payment will not be added.</span>
                  </div>

                  {errorMsg && (
                    <div className="bg-rose-50 text-rose-700 p-3.5 rounded-2xl border border-rose-100 text-xxs font-black leading-relaxed">
                      {errorMsg}
                    </div>
                  )}

                  {successMsg && (
                    <div className="bg-emerald-50 text-emerald-700 p-3.5 rounded-2xl border border-emerald-100 text-xxs font-black leading-relaxed flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>{successMsg}</span>
                    </div>
                  )}

                  {/* Submit button */}
                  <button
                    type="submit"
                    disabled={submitting}
                    className={`w-full py-3.5 rounded-2xl text-xs font-black text-white transition-all cursor-pointer ${submitting ? "bg-slate-400 cursor-not-allowed" : "bg-rose-500 hover:bg-rose-600 shadow-md shadow-rose-500/25 active:scale-95"}`}
                  >
                    {submitting ? "সাবমিট করা হচ্ছে..." : "ডিপোজিট রিকোয়েস্ট সাবমিট করুন (Submit Deposit)"}
                  </button>
                </form>

              </div>

            </div>
          ) : (
            <div className="space-y-3">
              {/* Ledger list */}
              <div className="flex items-center justify-between bg-white p-4 rounded-2xl border border-slate-200 shadow-xxs">
                <span className="text-xxs font-black text-slate-500 uppercase tracking-widest">আপনার বর্তমান ব্যালেন্স (Current Balance)</span>
                <span className="text-base font-black text-slate-800 font-mono">৳{userBalance.toFixed(2)}</span>
              </div>

              {ledger.length === 0 ? (
                <div className="py-16 text-center text-slate-400 space-y-2">
                  <History className="w-10 h-10 mx-auto opacity-20 text-rose-500" />
                  <p className="font-extrabold text-slate-600 text-xs">কোনো লেনদেন রেকর্ড পাওয়া যায়নি।</p>
                  <p className="text-[10px] text-slate-400">ব্যালেন্স এড অথবা মেইল ক্রয়ের পর সমস্ত ইতিহাস এখানে যুক্ত হবে।</p>
                </div>
              ) : (
                <div className="space-y-2.5 max-h-[450px] overflow-y-auto pr-1">
                  {ledger.map((item, idx) => {
                    const isAddition = item.type === "deposit";
                    return (
                      <div key={item.id || idx} className="bg-white border border-slate-150 rounded-2xl p-3.5 shadow-xxs flex justify-between items-center gap-3">
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-xl border ${isAddition ? "bg-emerald-50 text-emerald-600 border-emerald-100" : "bg-rose-50 text-rose-600 border-rose-100"}`}>
                            {isAddition ? <ArrowDownLeft className="w-4 h-4" /> : <ArrowUpRight className="w-4 h-4" />}
                          </div>
                          <div>
                            <span className="font-black text-slate-800 text-xs block leading-tight">{item.label}</span>
                            <span className="text-[9px] text-slate-400 block mt-1 font-mono font-bold">{item.subLabel}</span>
                          </div>
                        </div>

                        <div className="text-right">
                          <span className={`font-mono text-xs font-black block ${isAddition ? "text-emerald-600" : "text-rose-600"}`}>
                            {isAddition ? "+" : "-"}৳{item.amount}
                          </span>
                          {isAddition && (
                            <span className={`inline-block text-[8px] font-black px-2 py-0.5 rounded-md mt-1 ${item.status === "approved" ? "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20" : item.status === "rejected" ? "bg-rose-500/10 text-rose-600 border border-rose-500/20" : "bg-amber-500/10 text-amber-600 border border-amber-500/20"}`}>
                              {item.status === "approved" ? "গৃহীত" : item.status === "rejected" ? "বাতিল" : "পেন্ডিং"}
                            </span>
                          )}
                          <span className="text-[8px] text-slate-400 block mt-1 font-mono font-bold">
                            {new Date(item.date).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};
