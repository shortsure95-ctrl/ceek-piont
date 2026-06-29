import React, { useState } from "react";
import { Product, Notice, SystemConfig } from "../types";
import { ShoppingCart, Copy, Check, Info, Bell, ExternalLink, RefreshCw, Play, Video } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface HomeSectionProps {
  products: Product[];
  notices: Notice[];
  config: SystemConfig;
  userBalance: number;
  onRefresh: () => void;
  onBuy: (productId: string, quantity: number) => Promise<{ purchasedMails: string[] }>;
}

// Helper to get custom premium layout design based on product name
const getProductBadgeAndDesign = (name: string) => {
  const lower = name.toLowerCase();
  if (lower.includes("chatgpt")) {
    return {
      gradient: "from-emerald-600 to-teal-800",
      label: "ChatGPT",
      tag: "Premium AI",
      textColor: "text-emerald-400",
      badgeBg: "bg-emerald-50 text-emerald-700 border border-emerald-100",
      iconChar: "🤖"
    };
  }
  if (lower.includes("gemini")) {
    return {
      gradient: "from-indigo-600 via-purple-600 to-pink-600",
      label: "Gemini",
      tag: "Advanced AI",
      textColor: "text-pink-400",
      badgeBg: "bg-purple-50 text-purple-700 border border-purple-100",
      iconChar: "✨"
    };
  }
  if (lower.includes("hotmail") || lower.includes("outlook")) {
    return {
      gradient: "from-sky-500 to-blue-600",
      label: "Mail",
      tag: "Fresh Mail",
      textColor: "text-sky-400",
      badgeBg: "bg-sky-50 text-sky-700 border border-sky-100",
      iconChar: "✉️"
    };
  }
  if (lower.includes("proxy")) {
    return {
      gradient: "from-slate-700 to-slate-900",
      label: "Proxy",
      tag: "Residential",
      textColor: "text-indigo-400",
      badgeBg: "bg-slate-100 text-slate-700 border border-slate-200",
      iconChar: "🌐"
    };
  }
  return {
    gradient: "from-indigo-600 to-violet-800",
    label: "VIP",
    tag: "Premium",
    textColor: "text-indigo-400",
    badgeBg: "bg-indigo-50 text-indigo-700 border border-indigo-100",
    iconChar: "⭐"
  };
};

export const HomeSection: React.FC<HomeSectionProps> = ({
  products,
  notices,
  config,
  userBalance,
  onRefresh,
  onBuy
}) => {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [quantity, setQuantity] = useState<number>(1);
  const [buying, setBuying] = useState<boolean>(false);
  const [purchasedMails, setPurchasedMails] = useState<string[]>([]);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [allCopied, setAllCopied] = useState(false);
  const [activeVideoTab, setActiveVideoTab] = useState<"create" | "twofa">("create");

  const handleOpenBuyModal = (product: Product) => {
    setSelectedProduct(product);
    setQuantity(1);
    setPurchasedMails([]);
    setError(null);
    setAllCopied(false);
  };

  const handleBuy = async () => {
    if (!selectedProduct) return;
    setBuying(true);
    setError(null);
    try {
      const res = await onBuy(selectedProduct.id, quantity);
      setPurchasedMails(res.purchasedMails);
      onRefresh();
    } catch (err: any) {
      setError(err.message || "ক্রয় করতে ব্যর্থ হয়েছে। অনুগ্রহ করে আবার চেষ্টা করুন।");
    } finally {
      setBuying(false);
    }
  };

  const copyToClipboard = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const copyAllMails = () => {
    if (purchasedMails.length === 0) return;
    navigator.clipboard.writeText(purchasedMails.join("\n"));
    setAllCopied(true);
    setTimeout(() => setAllCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Configured Quick Utilities Bar */}
      <div className="grid grid-cols-3 gap-2">
        {config.tokenToCodeLink && (
          <a
            id="token-to-code-link"
            href={config.tokenToCodeLink}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-sky-50 text-sky-700 hover:bg-sky-100 text-xxs sm:text-xs font-semibold py-2.5 px-2 rounded-xl flex flex-col items-center justify-center gap-1.5 transition border border-sky-100 text-center"
          >
            <ExternalLink className="w-4 h-4 shrink-0" />
            <span>টোকেন টু কোড</span>
          </a>
        )}
        {config.twoFactorCodeLink && (
          <a
            id="two-factor-code-link"
            href={config.twoFactorCodeLink}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-indigo-50 text-indigo-700 hover:bg-indigo-100 text-xxs sm:text-xs font-semibold py-2.5 px-2 rounded-xl flex flex-col items-center justify-center gap-1.5 transition border border-indigo-100 text-center"
          >
            <ExternalLink className="w-4 h-4 shrink-0" />
            <span>২-ফ্যাক্টর কোড</span>
          </a>
        )}
        {config.whatsappGroupLink && (
          <a
            id="whatsapp-group-link"
            href={config.whatsappGroupLink}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-emerald-50 text-emerald-700 hover:bg-emerald-100 text-xxs sm:text-xs font-semibold py-2.5 px-2 rounded-xl flex flex-col items-center justify-center gap-1.5 transition border border-emerald-100 text-center"
          >
            <ExternalLink className="w-4 h-4 shrink-0 text-emerald-600" />
            <span>হোয়াটসঅ্যাপ গ্রুপ</span>
          </a>
        )}
      </div>

      {/* Products list heading */}
      <div className="flex items-center justify-between mt-6">
        <h2 className="text-lg font-bold text-slate-950 flex items-center gap-2">
          <ShoppingCart className="w-5 h-5 text-indigo-600" />
          উপলব্ধ মেইল অ্যাকাউন্টসমূহ
        </h2>
        <button
          id="refresh-products-btn"
          onClick={onRefresh}
          className="text-indigo-600 hover:text-indigo-700 font-semibold text-xs flex items-center gap-1 p-1 hover:bg-indigo-50 rounded-lg transition"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          রিফ্রেশ করুন
        </button>
      </div>

      {/* Product list grid/stack in a gorgeous layout */}
      <div id="product-grid" className="grid grid-cols-1 gap-5">
        {products.length === 0 ? (
          <div className="bg-white py-12 text-center rounded-2xl border border-slate-100 text-slate-500 text-sm shadow-xs">
            এই মুহূর্তে কোনো পণ্য উপলব্ধ নেই। রতন (RTN Support) শীঘ্রই নতুন স্টক লোড করবেন।
          </div>
        ) : (
          products.map((product) => {
            const design = getProductBadgeAndDesign(product.name);
            const isOutOfStock = product.stock <= 0;
            return (
              <div
                key={product.id}
                className={`bg-white border-2 rounded-3xl p-5 md:p-6 transition-all duration-300 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-5 relative overflow-hidden group 
                  ${isOutOfStock 
                    ? "border-slate-200 opacity-80" 
                    : "border-rose-100 hover:border-rose-400 bg-linear-to-b from-white via-white to-rose-50/10 hover:shadow-[0_12px_24px_rgba(244,63,94,0.12)] hover:-translate-y-1"
                  } 
                  shadow-[0_6px_0_0_#f43f5e15] hover:shadow-[0_12px_0_0_#f43f5e20]`}
              >
                {/* Decorative background glow for premium products */}
                <div className={`absolute -right-16 -top-16 w-36 h-36 bg-gradient-to-br ${design.gradient} opacity-[0.06] blur-2xl rounded-full group-hover:scale-125 transition-transform duration-700 pointer-events-none`} />

                {/* Left Side: Gradient Badge Graphic & Details */}
                <div className="flex items-center gap-4 flex-1">
                  {/* Luxury Graphic Block with a subtle 3D lift */}
                  <div className={`w-14 h-14 md:w-16 md:h-16 rounded-2xl bg-gradient-to-br ${design.gradient} flex flex-col items-center justify-center shrink-0 shadow-md text-white font-black tracking-wider relative overflow-hidden group-hover:rotate-3 transition-transform duration-300`}>
                    {/* Inner sheen effect */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                    <span className="text-2xl md:text-3xl filter drop-shadow-md mb-0.5">{design.iconChar}</span>
                    <span className="text-[8px] md:text-[9px] uppercase font-extrabold tracking-widest text-slate-100/90 leading-none">{design.label}</span>
                  </div>

                  {/* Product Title and key badges */}
                  <div className="space-y-1.5 flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <h3 className="font-extrabold text-slate-950 text-sm md:text-base leading-snug tracking-tight">
                        {product.name}
                      </h3>
                      <span className={`text-[9px] md:text-[10px] font-black px-2.5 py-0.5 rounded-lg shrink-0 ${design.badgeBg}`}>
                        {design.tag}
                      </span>
                      {product.price >= 500 && (
                        <span className="text-[9px] md:text-[10px] font-extrabold px-2 py-0.5 rounded-lg bg-rose-50 text-rose-600 border border-rose-100 uppercase tracking-wider animate-pulse">
                          HOT 🔥
                        </span>
                      )}
                    </div>
                    <p className="text-slate-500 text-xs leading-relaxed max-w-xl">
                      {product.description || "এই পণ্যটির কোনো বিবরণ দেওয়া হয়নি।"}
                    </p>
                    
                    {/* Tiny badges for clean detail presentation */}
                    <div className="flex flex-wrap items-center gap-2 pt-1">
                      <span className={`text-[10px] font-black px-2.5 py-1 rounded-md ${product.stock > 0 ? "bg-emerald-50 text-emerald-700 border border-emerald-100" : "bg-rose-50 text-rose-700 border border-rose-100"}`}>
                        {product.stock > 0 ? `মজুদ: ${product.stock} টি` : "স্টক শেষ (Out of Stock)"}
                      </span>
                      <span className="text-[10px] font-extrabold text-slate-400 bg-slate-50 border border-slate-150 px-2.5 py-1 rounded-md">
                        ১ ঘণ্টা রিপ্লেসমেন্ট ওয়ারেন্টি
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right Side: Elegant Boxed Price & Action Panel with 3D elements */}
                <div className="flex md:flex-col items-center md:items-end justify-between md:justify-center gap-3 pt-3.5 md:pt-0 border-t md:border-t-0 border-slate-100 shrink-0">
                  <div className="text-left md:text-right">
                    <span className="text-[10px] font-bold text-slate-400 block uppercase tracking-wider">প্রতি পিস মূল্য</span>
                    <div className="flex items-baseline gap-0.5">
                      <span className="text-rose-500 font-extrabold text-xs">৳</span>
                      <span className="text-2xl md:text-3xl font-black text-rose-600 font-mono tracking-tight">{product.price}</span>
                    </div>
                  </div>

                  <button
                    id={`buy-btn-${product.id}`}
                    onClick={() => handleOpenBuyModal(product)}
                    disabled={isOutOfStock}
                    className={`w-full md:w-auto px-6 py-3 rounded-2xl text-xs font-black tracking-wide transition duration-200 flex items-center justify-center gap-2 active:scale-95 ${!isOutOfStock ? `bg-linear-to-r from-rose-500 via-pink-500 to-rose-600 text-white shadow-lg hover:shadow-xl hover:shadow-rose-500/20 hover:brightness-110 cursor-pointer` : "bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed"}`}
                  >
                    <ShoppingCart className="w-4 h-4" />
                    <span>কিনুন</span>
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Tutorial Videos and Condition block */}
      <div id="tutorial-section" className="bg-white rounded-2xl p-5 border border-slate-100 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <Video className="w-5 h-5 text-indigo-600 animate-pulse" />
            <div>
              <h2 className="text-base font-bold text-slate-900">টিউটোরিয়াল ও কাজের ভিডিও গাইড</h2>
              <p className="text-slate-400 text-[10px]">কাজ শুরু করার পূর্বে ভিডিওগুলো মনোযোগ দিয়ে সম্পূর্ণ দেখুন</p>
            </div>
          </div>
          
          {/* Tab buttons */}
          <div className="flex bg-slate-100 p-1 rounded-xl w-full sm:w-auto">
            <button
              onClick={() => setActiveVideoTab("create")}
              className={`flex-1 sm:flex-none text-xxs font-bold py-1.5 px-3 rounded-lg transition-all ${activeVideoTab === "create" ? "bg-white text-indigo-700 shadow-xxs" : "text-slate-500 hover:text-slate-800"}`}
            >
              ১. অ্যাকাউন্ট তৈরি করুন
            </button>
            <button
              onClick={() => setActiveVideoTab("twofa")}
              className={`flex-1 sm:flex-none text-xxs font-bold py-1.5 px-3 rounded-lg transition-all ${activeVideoTab === "twofa" ? "bg-white text-indigo-700 shadow-xxs" : "text-slate-500 hover:text-slate-800"}`}
            >
              ২. ২-ফ্যাক্টর (2FA) অন করুন
            </button>
          </div>
        </div>

        {/* Dynamic content rendering */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
          <div className="lg:col-span-7 flex flex-col justify-between">
            <div className="space-y-2 mb-3">
              <h3 className="font-extrabold text-slate-900 text-xs flex items-center gap-1.5">
                <Play className="w-4 h-4 text-indigo-600 fill-indigo-600" />
                {activeVideoTab === "create" ? "পার্ট ১: সম্পূর্ণ নতুন অ্যাকাউন্ট তৈরির নিয়ম" : "পার্ট ২: ২-ফ্যাক্টর অথেনটিকেশন (2FA) চালু করার নিয়ম"}
              </h3>
              <p className="text-slate-500 text-xxs leading-relaxed">
                {activeVideoTab === "create" 
                  ? "কিভাবে সঠিকভাবে হটমেইল বা আউটলুক অ্যাকাউন্ট তৈরি করতে হবে এবং শর্তগুলো বজায় রাখতে হবে তা এই ভিডিওতে দেখানো হয়েছে।" 
                  : "আপনার একাউন্টে ২-ফ্যাক্টর নিরাপদ নিরাপত্তা ব্যবস্থা কোড কিভাবে লিঙ্ক করবেন এবং সঠিক পদ্ধতিতে জেনারেট করবেন তা দেখে নিন।"}
              </p>
            </div>

            {/* Google Drive Video Player Frame */}
            <div className="relative aspect-video w-full rounded-2xl overflow-hidden bg-slate-950 border border-slate-200/80 shadow-md">
              <iframe
                src={activeVideoTab === "create" 
                  ? "https://drive.google.com/file/d/184XVSmHHlBpGkYDkQigD_vzcYSN_zlgS/preview" 
                  : "https://drive.google.com/file/d/1pOHUpyuK1vC0XKd11FvyXrzJqBY5Lb9J/preview"}
                className="absolute inset-0 w-full h-full border-0"
                allow="autoplay; encrypted-media"
                referrerPolicy="no-referrer"
                title="Tutorial Video Guide"
              />
            </div>
            
            <div className="mt-3 text-center sm:text-left">
              <a
                href={activeVideoTab === "create" 
                  ? "https://drive.google.com/file/d/184XVSmHHlBpGkYDkQigD_vzcYSN_zlgS/view?usp=sharing" 
                  : "https://drive.google.com/file/d/1pOHUpyuK1vC0XKd11FvyXrzJqBY5Lb9J/view?usp=sharing"}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-[10px] font-bold text-indigo-600 hover:underline"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                গুগল ড্রাইভে ভিডিওটি সরাসরি দেখুন
              </a>
            </div>
          </div>

          <div className="lg:col-span-5 flex flex-col justify-between">
            {activeVideoTab === "create" ? (
              <div className="bg-amber-50/70 border border-amber-100 rounded-2xl p-4 flex flex-col justify-between h-full">
                <div>
                  <h4 className="font-extrabold text-amber-900 text-xs flex items-center gap-1.5 border-b border-amber-100 pb-2 mb-3">
                    📌 Account Condition (একাউন্ট কন্ডিশন)
                  </h4>
                  <ul className="space-y-3 text-slate-700 text-xxs font-medium">
                    <li className="flex items-center gap-2">
                      <span className="text-emerald-600 font-bold shrink-0 text-sm">✅</span> 
                      <span>আমাদের Mail ব্যবহার করতে হবে।</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-emerald-600 font-bold shrink-0 text-sm">✅</span> 
                      <span>USA Female Name ব্যবহার করতে হবে।</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-emerald-600 font-bold shrink-0 text-sm">✅</span> 
                      <span>প্রতিটি অ্যাকাউন্টে Profile Picture থাকতে হবে।</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-emerald-600 font-bold shrink-0 text-sm">✅</span> 
                      <span>প্রতিটি অ্যাকাউন্টের Password-এ Date থাকতে হবে।</span>
                    </li>
                  </ul>
                </div>
                
                <div className="mt-4 pt-3 border-t border-amber-100">
                  <p className="text-[10px] text-amber-800 leading-relaxed font-bold">
                    ⚠️ গুরুত্বপূর্ণ নোট: এডমিন রতন থেকে প্রাপ্ত নির্দেশনা অনুযায়ী আপনাকে অবশ্যই এই ফিমেল প্রোফাইল পিকচার এবং মার্কিন নাম ব্যবহার করতে হবে। অন্যথায় কাজ বাতিল হতে পারে।
                  </p>
                </div>
              </div>
            ) : (
              <div className="bg-indigo-50/70 border border-indigo-100 rounded-2xl p-4 flex flex-col justify-between h-full">
                <div>
                  <h4 className="font-extrabold text-indigo-900 text-xs flex items-center gap-1.5 border-b border-indigo-150 pb-2 mb-3">
                    📌 ২-ফ্যাক্টর (2FA) অন করার নির্দেশিকা
                  </h4>
                  <ul className="space-y-3 text-slate-700 text-xxs font-medium">
                    <li className="flex items-start gap-2">
                      <span className="text-indigo-600 font-bold shrink-0 text-xs mt-0.5">•</span> 
                      <span>প্রথমে সিকিউরিটি মেনু থেকে ২-ফ্যাক্টর অথেনটিকেশন অপশনে যান।</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-indigo-600 font-bold shrink-0 text-xs mt-0.5">•</span> 
                      <span>সেখান থেকে ২-ফ্যাক্টর সিক্রেট কোড বা টোকেন কপি করুন।</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-indigo-600 font-bold shrink-0 text-xs mt-0.5">•</span> 
                      <span>২-ফ্যাক্টর কোড জেনারেটর (<span className="text-indigo-600 underline">2fa.cn</span>) ব্যবহার করে কোড সচল করুন।</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-indigo-600 font-bold shrink-0 text-xs mt-0.5">•</span> 
                      <span>কোডটি সঠিকভাবে কাজ করছে কিনা তা "টোকেন টু কোড" সাইট থেকে মিলিয়ে নিন।</span>
                    </li>
                  </ul>
                </div>
                
                <div className="mt-4 pt-3 border-t border-indigo-150">
                  <p className="text-[10px] text-indigo-800 leading-relaxed font-bold">
                    💡 সহায়ক টিপস: ভিডিও টিউটোরিয়ালটি প্লে করুন এবং পাশে কোড জেনারেটর ট্যাবটি ওপেন রেখে ধাপে ধাপে সম্পন্ন করুন।
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Buy Modal Dialog */}
      <AnimatePresence>
        {selectedProduct && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Modal Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs"
              onClick={() => { if (!buying && purchasedMails.length === 0) setSelectedProduct(null); }}
            />

            {/* Modal Box */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="relative w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden z-10 border border-slate-150"
            >
              {/* Header */}
              <div className="bg-indigo-600 text-white px-5 py-4 flex justify-between items-center">
                <h3 className="font-bold text-sm md:text-base">পণ্য ক্রয় করুন</h3>
                {purchasedMails.length === 0 && !buying && (
                  <button
                    onClick={() => setSelectedProduct(null)}
                    className="text-white/80 hover:text-white font-bold text-lg"
                  >
                    ✕
                  </button>
                )}
              </div>

              {/* Content */}
              <div className="p-5 max-h-[80vh] overflow-y-auto">
                {purchasedMails.length === 0 ? (
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm md:text-base mb-1">{selectedProduct.name}</h4>
                      <p className="text-xs text-slate-500 leading-relaxed">{selectedProduct.description}</p>
                    </div>

                    <div className="bg-slate-50 p-3 rounded-xl flex justify-between text-xs font-semibold">
                      <span className="text-slate-600">ব্যালেন্স:</span>
                      <span className="text-slate-900 font-mono">৳{userBalance}</span>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700 block">পরিমাণ (পিস):</label>
                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          onClick={() => setQuantity(q => Math.max(1, q - 1))}
                          className="w-10 h-10 border border-slate-250 hover:bg-slate-50 rounded-lg flex items-center justify-center font-bold text-slate-700"
                        >
                          -
                        </button>
                        <input
                          type="number"
                          min="1"
                          max={selectedProduct.stock}
                          value={quantity}
                          onChange={(e) => setQuantity(Math.min(selectedProduct.stock, Math.max(1, Number(e.target.value))))}
                          className="w-20 text-center font-bold font-mono text-sm border border-slate-250 py-2 rounded-lg"
                        />
                        <button
                          type="button"
                          onClick={() => setQuantity(q => Math.min(selectedProduct.stock, q + 1))}
                          className="w-10 h-10 border border-slate-250 hover:bg-slate-50 rounded-lg flex items-center justify-center font-bold text-slate-700"
                        >
                          +
                        </button>
                        <span className="text-xs text-slate-400 font-semibold">স্টকে আছে: {selectedProduct.stock} টি</span>
                      </div>
                    </div>

                    {/* Cost Preview */}
                    <div className="pt-3 border-t border-slate-100 flex justify-between items-center">
                      <div>
                        <span className="text-slate-500 text-xxs block font-medium">মোট প্রদেয় টাকা</span>
                        <span className="text-lg font-extrabold text-indigo-600 font-mono">৳{selectedProduct.price * quantity}</span>
                      </div>
                    </div>

                    {error && (
                      <div className="bg-rose-50 text-rose-700 text-xs p-3 rounded-xl border border-rose-100">
                        {error}
                      </div>
                    )}

                    <div className="flex gap-2.5 pt-2">
                      <button
                        type="button"
                        onClick={() => setSelectedProduct(null)}
                        disabled={buying}
                        className="flex-1 border border-slate-250 py-2.5 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-50 transition"
                      >
                        বাতিল করুন
                      </button>
                      <button
                        type="button"
                        onClick={handleBuy}
                        disabled={buying || quantity > selectedProduct.stock || userBalance < (selectedProduct.price * quantity)}
                        className={`flex-1 py-2.5 rounded-xl text-xs font-bold text-white transition flex items-center justify-center gap-1.5 ${buying || quantity > selectedProduct.stock || userBalance < (selectedProduct.price * quantity) ? "bg-indigo-300 cursor-not-allowed" : "bg-indigo-600 hover:bg-indigo-700 shadow-sm"}`}
                      >
                        {buying ? "প্রক্রিয়াধীন..." : "কনফার্ম করুন"}
                      </button>
                    </div>
                  </div>
                ) : (
                  // Success purchased screen
                  <div className="space-y-4">
                    <div className="text-center py-2">
                      <div className="inline-flex p-3 bg-emerald-100 text-emerald-600 rounded-full mb-2">
                        <Check className="w-8 h-8" />
                      </div>
                      <h4 className="font-bold text-slate-900 text-sm md:text-base">ক্রয় সফল হয়েছে!</h4>
                      <p className="text-xxs md:text-xs text-slate-500 mt-1">মেইল ক্রেডেনশিয়াল নিচে দেওয়া হলো, কপি করে সংরক্ষণ করুন:</p>
                    </div>

                    <div className="space-y-2 max-h-[220px] overflow-y-auto">
                      {purchasedMails.map((mail, idx) => (
                        <div key={idx} className="bg-slate-50 border border-slate-200/60 rounded-xl p-3 flex justify-between items-center gap-2">
                          <p className="font-mono text-xs text-slate-800 break-all select-all font-medium leading-relaxed">{mail}</p>
                          <button
                            type="button"
                            onClick={() => copyToClipboard(mail, idx)}
                            className="bg-white p-2 rounded-lg border border-slate-200 text-indigo-600 hover:bg-indigo-50 shrink-0 transition"
                            title="কপি করুন"
                          >
                            {copiedIndex === idx ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                          </button>
                        </div>
                      ))}
                    </div>

                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={copyAllMails}
                        className="flex-1 bg-indigo-50 border border-indigo-200 hover:bg-indigo-100 text-indigo-700 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition"
                      >
                        {allCopied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                        সবগুলো কপি করুন
                      </button>
                      <button
                        type="button"
                        onClick={() => setSelectedProduct(null)}
                        className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white py-2.5 rounded-xl text-xs font-bold transition"
                      >
                        বন্ধ করুন
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
