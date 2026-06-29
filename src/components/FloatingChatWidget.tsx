import React, { useState, useEffect, useRef } from "react";
import { ChatMessage, User } from "../types";
import { MessageCircle, X, Send, User as UserIcon, PhoneCall, Users, Settings, Check, HelpCircle } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface FloatingChatWidgetProps {
  userId: string | null;
  user: User | null;
  messages: ChatMessage[];
  adminWhatsApp: string;
  whatsappGroupLink?: string;
  onSendMessage: (message: string) => Promise<void>;
  onRefresh: () => void;
}

export const FloatingChatWidget: React.FC<FloatingChatWidgetProps> = ({
  userId,
  user,
  messages,
  adminWhatsApp,
  whatsappGroupLink,
  onSendMessage,
  onRefresh
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  // Guest settings
  const [guestName, setGuestName] = useState(() => localStorage.getItem("chat_guest_name") || "");
  const [guestPhone, setGuestPhone] = useState(() => localStorage.getItem("chat_guest_phone") || "");
  const [profileSaved, setProfileSaved] = useState(false);

  const chatEndRef = useRef<HTMLDivElement | null>(null);

  // Automatically scroll to bottom
  useEffect(() => {
    if (isOpen) {
      chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isOpen]);

  // Sync profile details if logged in
  useEffect(() => {
    if (userId) {
      setGuestPhone(userId);
      if (user?.displayName) {
        setGuestName(user.displayName);
      }
    }
  }, [userId, user]);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem("chat_guest_name", guestName);
    localStorage.setItem("chat_guest_phone", guestPhone);
    setProfileSaved(true);
    setTimeout(() => {
      setProfileSaved(false);
      setShowSettings(false);
    }, 1200);
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;

    // Check if name/phone are set
    if (!guestName.trim() || !guestPhone.trim()) {
      setShowSettings(true);
      return;
    }

    setSending(true);
    try {
      // Append user credentials to message body if guest for admin visibility
      let finalMsg = text.trim();
      if (!userId) {
        finalMsg = `[Guest: ${guestName} (${guestPhone})] ${finalMsg}`;
      }
      await onSendMessage(finalMsg);
      setText("");
    } catch (err) {
      console.error("Failed to send chat message", err);
    } finally {
      setSending(false);
    }
  };

  const getWhatsAppLink = () => {
    const cleanNum = adminWhatsApp.replace(/\D/g, "");
    return `https://wa.me/${cleanNum}`;
  };

  return (
    <div className="fixed bottom-20 right-5 z-50 flex flex-col items-end pointer-events-none">
      {/* Expanded Chat Box */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 40 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 40 }}
            className="w-[330px] sm:w-[360px] h-[450px] bg-slate-900 text-white rounded-3xl shadow-2xl border border-slate-800 flex flex-col overflow-hidden mb-4 pointer-events-auto"
          >
            {/* Header */}
            <div className="bg-slate-950 px-4 py-3 flex items-center justify-between border-b border-slate-800">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                <div>
                  <h3 className="font-extrabold text-xs tracking-wide">RTN সাপোর্ট হেল্পলাইন</h3>
                  <p className="text-[9px] text-slate-400">রতন (RTN Support) সর্বদা সক্রিয়</p>
                </div>
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => setShowSettings(!showSettings)}
                  className={`p-1.5 rounded-lg hover:bg-slate-800 transition ${showSettings ? "text-indigo-400" : "text-slate-400 hover:text-white"}`}
                  title="নাম ও নাম্বার পরিবর্তন"
                >
                  <Settings className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Profile Settings Panel */}
            <AnimatePresence>
              {showSettings && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="bg-slate-850 px-4 py-3 border-b border-slate-800 overflow-hidden text-slate-300 text-xxs"
                >
                  <form onSubmit={handleSaveProfile} className="space-y-2">
                    <p className="font-bold text-indigo-300">চ্যাটের জন্য আপনার তথ্য সেট করুন:</p>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-1">
                        <label className="text-[9px] uppercase font-bold text-slate-400">আপনার নাম</label>
                        <input
                          type="text"
                          required
                          placeholder="যেমন: রানা"
                          value={guestName}
                          onChange={(e) => setGuestName(e.target.value)}
                          className="w-full bg-slate-900 border border-slate-750 rounded-lg px-2 py-1.5 text-xxs focus:border-indigo-500 outline-hidden font-bold"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[9px] uppercase font-bold text-slate-400">মোবাইল নম্বর</label>
                        <input
                          type="text"
                          required
                          placeholder="যেমন: 017XXXXXXXX"
                          value={guestPhone}
                          onChange={(e) => setGuestPhone(e.target.value)}
                          disabled={!!userId}
                          className="w-full bg-slate-900 border border-slate-750 rounded-lg px-2 py-1.5 text-xxs focus:border-indigo-500 outline-hidden font-mono font-bold disabled:opacity-50"
                        />
                      </div>
                    </div>
                    <button
                      type="submit"
                      className="w-full bg-indigo-600 hover:bg-indigo-700 text-white text-[10px] font-bold py-1.5 rounded-lg transition flex items-center justify-center gap-1"
                    >
                      {profileSaved ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                          <span>সংরক্ষিত হয়েছে!</span>
                        </>
                      ) : (
                        <span>তথ্য সংরক্ষণ করুন</span>
                      )}
                    </button>
                  </form>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Live Message Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-900/50">
              {/* Custom branding notice */}
              <div className="bg-slate-850 border border-slate-800 p-3 rounded-2xl text-[10px] leading-relaxed text-slate-300 space-y-1.5">
                <span className="font-bold text-indigo-400 flex items-center gap-1 text-[10px]">
                  <HelpCircle className="w-3.5 h-3.5 shrink-0" />
                  গ্রাহক সহায়তার জন্য নির্দেশনা:
                </span>
                <p>মেইল ক্রয়, টাকা এড হওয়া বা আইডি লক সংক্রান্ত যেকোন সমস্যায় মেসেজ দিন। আমাদের হেল্পলাইন ২৪ ঘণ্টা খোলা থাকে।</p>
                <div className="flex gap-2 pt-1 border-t border-slate-800">
                  {whatsappGroupLink && (
                    <a
                      href={whatsappGroupLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 bg-emerald-600/15 hover:bg-emerald-600/30 text-emerald-400 border border-emerald-500/25 py-1 px-1.5 rounded-lg text-center font-bold text-[9px] flex items-center justify-center gap-1 transition"
                    >
                      <Users className="w-3 h-3" />
                      গ্রুপ জয়েন
                    </a>
                  )}
                  {adminWhatsApp && (
                    <a
                      href={getWhatsAppLink()}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 bg-indigo-600/15 hover:bg-indigo-600/30 text-indigo-400 border border-indigo-500/25 py-1 px-1.5 rounded-lg text-center font-bold text-[9px] flex items-center justify-center gap-1 transition"
                    >
                      <PhoneCall className="w-3 h-3" />
                      হোয়াটসঅ্যাপ
                    </a>
                  )}
                </div>
              </div>

              {messages.length === 0 ? (
                <div className="text-center py-8 text-slate-500 space-y-1">
                  <MessageCircle className="w-8 h-8 mx-auto opacity-30 text-indigo-400" />
                  <p className="text-[10px] font-bold text-slate-400">কোনো চ্যাট হিস্ট্রি পাওয়া যায়নি।</p>
                  <p className="text-[9px] text-slate-500">নিচে বক্সে প্রথম প্রশ্নটি লিখে আমাদের পাঠান!</p>
                </div>
              ) : (
                messages.map((msg) => {
                  const isMe = msg.sender === "user";
                  return (
                    <div
                      key={msg.id}
                      className={`flex ${isMe ? "justify-end" : "justify-start"}`}
                    >
                      <div className={`max-w-[85%] rounded-2xl px-3 py-2 text-xxs shadow-md ${isMe ? "bg-indigo-600 text-white rounded-br-none" : "bg-slate-800 text-slate-200 border border-slate-700/60 rounded-bl-none"}`}>
                        <p className="leading-relaxed whitespace-pre-wrap">{msg.message}</p>
                        <span className={`text-[8px] block text-right mt-1 ${isMe ? "text-indigo-200" : "text-slate-400"}`}>
                          {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={chatEndRef} />
            </div>

            {/* Input Form */}
            <form onSubmit={handleSend} className="p-3 bg-slate-950 border-t border-slate-800 flex items-center gap-1.5">
              <input
                type="text"
                required
                placeholder={!guestName ? "প্রথমে নাম ও মোবাইল সেট করুন..." : "প্রশ্নটি এখানে লিখুন..."}
                value={text}
                onChange={(e) => setText(e.target.value)}
                className="flex-1 bg-slate-900 border border-slate-800 focus:border-indigo-500 rounded-xl px-3 py-2 text-xxs text-slate-200 outline-hidden transition"
              />
              <button
                type="submit"
                disabled={sending}
                className="bg-indigo-600 hover:bg-indigo-700 text-white p-2 rounded-xl transition shadow-lg shadow-indigo-500/20 flex items-center justify-center shrink-0 disabled:opacity-40"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="pointer-events-auto bg-indigo-600 hover:bg-indigo-700 text-white p-4 rounded-full shadow-2xl transition-all duration-300 transform hover:scale-105 active:scale-95 flex items-center justify-center relative cursor-pointer group shadow-indigo-600/30"
        style={{ width: "56px", height: "56px" }}
      >
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.div
              key="close"
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              <X className="w-6 h-6" />
            </motion.div>
          ) : (
            <motion.div
              key="chat"
              initial={{ rotate: 90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: -90, opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="relative"
            >
              <MessageCircle className="w-6 h-6 animate-pulse" />
              <span className="absolute top-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 border border-white"></span>
            </motion.div>
          )}
        </AnimatePresence>
      </button>
    </div>
  );
};
