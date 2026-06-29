import React, { useState, useEffect, useRef } from "react";
import { ChatMessage, ChatUser } from "../types";
import { Send, User, ShieldAlert, Users, MessageSquare, RefreshCw, PhoneCall } from "lucide-react";

interface ChatSectionProps {
  isAdminView: boolean;
  messages: ChatMessage[];
  chatUsers?: ChatUser[]; // only for admin view
  selectedUserId?: string; // only for admin view
  adminWhatsApp: string; // configured admin whatsapp
  whatsappGroupLink?: string; // configured whatsapp group link
  onSendMessage: (message: string) => Promise<void>;
  onAdminSendMessage?: (userId: string, message: string) => Promise<void>; // only for admin view
  onSelectUser?: (userId: string) => void; // only for admin view
  onRefresh: () => void;
}

export const ChatSection: React.FC<ChatSectionProps> = ({
  isAdminView,
  messages,
  chatUsers = [],
  selectedUserId = "",
  adminWhatsApp,
  whatsappGroupLink,
  onSendMessage,
  onAdminSendMessage,
  onSelectUser,
  onRefresh
}) => {
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const chatEndRef = useRef<HTMLDivElement | null>(null);

  // Scroll to bottom on message load
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;
    setSending(true);
    try {
      if (isAdminView) {
        if (onAdminSendMessage && selectedUserId) {
          await onAdminSendMessage(selectedUserId, text.trim());
        }
      } else {
        await onSendMessage(text.trim());
      }
      setText("");
    } catch (err) {
      console.error("Failed to send message", err);
    } finally {
      setSending(false);
    }
  };

  const getWhatsAppLink = () => {
    // strip out non-digit characters from WhatsApp string
    const cleanNum = adminWhatsApp.replace(/\D/g, "");
    return `https://wa.me/${cleanNum}`;
  };

  if (!isAdminView) {
    // -------------------------------------------------------------------------
    // CLIENT SIDE CHAT INTERFACE
    // -------------------------------------------------------------------------
    return (
      <div className="flex flex-col h-[70vh] bg-white border border-slate-100 rounded-2xl overflow-hidden shadow-xs">
        {/* Header */}
        <div className="bg-slate-900 text-white px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <div>
              <h3 className="font-bold text-xs md:text-sm">লাইভ হেল্পলাইন চ্যাট</h3>
              <p className="text-xxs text-slate-300">রতন (RTN Support) দ্রুত উত্তর দেওয়ার চেষ্টা করবেন</p>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <button
              onClick={onRefresh}
              className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-300 transition shrink-0"
              title="রিফ্রেশ করুন"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
            {whatsappGroupLink && (
              <a
                id="whatsapp-group-button"
                href={whatsappGroupLink}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-indigo-600 hover:bg-indigo-700 text-white text-[10px] md:text-xxs font-bold px-2.5 py-1.5 rounded-lg flex items-center gap-1 transition shrink-0"
              >
                <Users className="w-3.5 h-3.5" />
                <span>হোয়াটসঅ্যাপ গ্রুপ</span>
              </a>
            )}
            {adminWhatsApp && (
              <a
                id="whatsapp-chat-button"
                href={getWhatsAppLink()}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] md:text-xxs font-bold px-2.5 py-1.5 rounded-lg flex items-center gap-1 transition shrink-0"
              >
                <PhoneCall className="w-3.5 h-3.5" />
                <span>হেল্পলাইন</span>
              </a>
            )}
          </div>
        </div>

        {/* Message Panel */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50/50">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-400 space-y-2">
              <MessageSquare className="w-10 h-10 text-slate-300" />
              <p className="text-xs font-semibold">আপনার কোনো জিজ্ঞাসা থাকলে মেসেজ করুন।</p>
              <p className="text-xxs text-slate-400">ডিপোজিট সমস্যা, অ্যাকাউন্টের সমস্যা ইত্যাদি সমাধানে আমরা প্রস্তুত।</p>
            </div>
          ) : (
            messages.map((msg) => {
              const isMe = msg.sender === "user";
              return (
                <div
                  key={msg.id}
                  className={`flex ${isMe ? "justify-end" : "justify-start"}`}
                >
                  <div className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-xs shadow-xxs ${isMe ? "bg-indigo-600 text-white rounded-br-none" : "bg-white text-slate-800 border border-slate-100 rounded-bl-none"}`}>
                    <p className="leading-relaxed whitespace-pre-wrap">{msg.message}</p>
                    <span className={`text-[9px] block text-right mt-1 ${isMe ? "text-indigo-200" : "text-slate-400"}`}>
                      {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
              );
            })
          )}
          <div ref={chatEndRef} />
        </div>

        {/* Input Bar */}
        <form onSubmit={handleSend} className="p-3 border-t border-slate-100 bg-white flex items-center gap-2">
          <input
            type="text"
            required
            placeholder="আপনার প্রশ্নটি এখানে লিখুন..."
            value={text}
            onChange={(e) => setText(e.target.value)}
            disabled={sending}
            className="flex-1 text-xs border border-slate-200 rounded-xl px-3 py-2.5 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-600 bg-slate-50 focus:bg-white transition"
          />
          <button
            type="submit"
            disabled={sending || !text.trim()}
            className={`p-2.5 rounded-xl text-white transition ${sending || !text.trim() ? "bg-indigo-300 cursor-not-allowed" : "bg-indigo-600 hover:bg-indigo-700 shadow-sm"}`}
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    );
  }

  // ---------------------------------------------------------------------------
  // ADMIN VIEW SIDEBAR & CHAT INTERFACE
  // ---------------------------------------------------------------------------
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 h-[75vh]">
      {/* Sidebar - active users chat list */}
      <div className="bg-white border border-slate-150 rounded-2xl overflow-hidden flex flex-col md:col-span-1 shadow-xxs">
        <div className="bg-slate-900 text-white p-3.5 flex items-center justify-between border-b border-slate-800">
          <h3 className="font-bold text-xs flex items-center gap-1.5 uppercase tracking-wider">
            <Users className="w-4 h-4 text-slate-400" />
            গ্রাহক তালিকা ({chatUsers.length})
          </h3>
          <button onClick={onRefresh} className="p-1 hover:bg-slate-800 rounded-lg transition text-slate-300" title="রিফ্রেশ করুন">
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
          {chatUsers.length === 0 ? (
            <div className="py-12 text-center text-slate-400 text-xs">
              কোনো সক্রিয় চ্যাট সেশন পাওয়া যায়নি।
            </div>
          ) : (
            chatUsers.map((cu) => {
              const isActive = cu.id === selectedUserId;
              return (
                <button
                  key={cu.id}
                  onClick={() => onSelectUser && onSelectUser(cu.id)}
                  className={`w-full text-left p-3.5 hover:bg-slate-50 transition block ${isActive ? "bg-indigo-50/70 hover:bg-indigo-50" : ""}`}
                >
                  <div className="flex justify-between items-center gap-2 mb-1">
                    <span className="font-mono font-extrabold text-xs text-slate-800">{cu.id}</span>
                    {cu.lastMessageAt && (
                      <span className="text-[9px] text-slate-400">
                        {new Date(cu.lastMessageAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    )}
                  </div>
                  <p className="text-xxs text-slate-500 truncate font-medium">
                    {cu.lastMessage}
                  </p>
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* Main chat details screen */}
      <div className="bg-white border border-slate-150 rounded-2xl overflow-hidden flex flex-col md:col-span-2 shadow-xxs">
        {selectedUserId ? (
          <>
            {/* Active chat header */}
            <div className="bg-slate-900 text-white p-3.5 flex justify-between items-center border-b border-slate-800">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-indigo-400" />
                <span className="font-mono font-extrabold text-xs">{selectedUserId} এর সাথে চ্যাট</span>
              </div>
              <button onClick={onRefresh} className="p-1 hover:bg-slate-800 rounded-lg transition text-slate-300" title="রিফ্রেশ করুন">
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Messages box */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50/50">
              {messages.map((msg) => {
                const isAdmin = msg.sender === "admin";
                return (
                  <div
                    key={msg.id}
                    className={`flex ${isAdmin ? "justify-end" : "justify-start"}`}
                  >
                    <div className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-xs shadow-xxs ${isAdmin ? "bg-indigo-600 text-white rounded-br-none" : "bg-white text-slate-800 border border-slate-100 rounded-bl-none"}`}>
                      <p className="leading-relaxed whitespace-pre-wrap">{msg.message}</p>
                      <span className={`text-[9px] block text-right mt-1 ${isAdmin ? "text-indigo-200" : "text-slate-400"}`}>
                        {new Date(msg.createdAt).toLocaleString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>
                );
              })}
              <div ref={chatEndRef} />
            </div>

            {/* Action panel */}
            <form onSubmit={handleSend} className="p-3 border-t border-slate-100 bg-white flex items-center gap-2">
              <input
                type="text"
                required
                placeholder="গ্রাহকের জন্য মেসেজ লিখুন..."
                value={text}
                onChange={(e) => setText(e.target.value)}
                disabled={sending}
                className="flex-1 text-xs border border-slate-200 rounded-xl px-3 py-2.5 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-600 bg-slate-50 focus:bg-white transition"
              />
              <button
                type="submit"
                disabled={sending || !text.trim()}
                className={`p-2.5 rounded-xl text-white transition ${sending || !text.trim() ? "bg-indigo-300 cursor-not-allowed" : "bg-indigo-600 hover:bg-indigo-700 shadow-sm"}`}
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-8 text-slate-400 space-y-2">
            <MessageSquare className="w-12 h-12 text-slate-350" />
            <h4 className="font-bold text-xs md:text-sm">চ্যাট নির্বাচন করুন</h4>
            <p className="text-xxs">বাম দিকের গ্রাহক তালিকা থেকে যেকোনো একটি নম্বর সিলেক্ট করে চ্যাটিং শুরু করুন।</p>
          </div>
        )}
      </div>
    </div>
  );
};
