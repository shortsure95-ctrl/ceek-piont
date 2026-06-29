import React, { useState } from "react";
import { Submission, SystemConfig } from "../types";
import { CheckCircle, AlertCircle, Clock, Link, FileText, Send, HelpCircle, ExternalLink } from "lucide-react";

interface TaskSectionProps {
  submissions: Submission[];
  config: SystemConfig;
  onSubmitTask: (sheetLink: string, note: string, taskType: '2FA' | '3day_old') => Promise<void>;
  onRefresh: () => void;
}

export const TaskSection: React.FC<TaskSectionProps> = ({
  submissions,
  config,
  onSubmitTask,
  onRefresh
}) => {
  const [sheetLink, setSheetLink] = useState<string>("");
  const [note, setNote] = useState<string>("");
  const [taskType, setTaskType] = useState<'2FA' | '3day_old'>('2FA');
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sheetLink) {
      setError("গুগল শিট লিঙ্কটি প্রদান করা আবশ্যক।");
      return;
    }
    if (!sheetLink.startsWith("http://") && !sheetLink.startsWith("https://")) {
      setError("দয়া করে একটি সঠিক ওয়েব লিঙ্ক প্রদান করুন (যেমন https://docs.google.com/...)");
      return;
    }

    setSubmitting(true);
    setError(null);
    setSuccess(null);
    try {
      await onSubmitTask(sheetLink, note, taskType);
      setSuccess("আপনার কাজ সফলভাবে সাবমিট করা হয়েছে! রতন (RTN Support) শীঘ্রই এটি পর্যালোচনা করে ভেরিফাই করবেন।");
      setSheetLink("");
      setNote("");
      onRefresh();
    } catch (err: any) {
      setError(err.message || "কাজ সাবমিট করতে কোনো সমস্যা হয়েছে।");
    } finally {
      setSubmitting(false);
    }
  };

  // Past user submissions for current user
  return (
    <div className="space-y-6">
      {/* Task Submission Banner */}
      <div className="bg-indigo-50 rounded-2xl p-5 border border-indigo-100 shadow-xxs">
        <div className="flex items-start gap-3">
          <HelpCircle className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h3 className="font-bold text-indigo-950 text-xs md:text-sm">কাজ সাবমিট করার নির্দেশনা:</h3>
            <p className="text-indigo-800 text-xxs md:text-xs leading-relaxed">
              আপনি যদি কোনো মেইল সোর্সিং বা অ্যাকাউন্ট তৈরির কাজ সম্পন্ন করে থাকেন, তবে রতন (RTN Support) এর দেওয়া গুগল স্প্রেডশিটে ডেটা ইনপুট দিয়ে সেই গুগল শিট ফাইলটির শেয়ারিং মোড <span className="font-bold">"Anyone with the link can view/edit"</span> করে এখানে লিংক সাবমিট করুন। প্রয়োজনীয় নোট বা ২-ফ্যাক্টর ব্যাকআপ কোডের বিবরণ নোট বক্সে লিখে দিন।
            </p>
          </div>
        </div>
      </div>

      {/* Task Submit Form */}
      <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-xs">
        <form onSubmit={handleSubmit} className="space-y-4">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-1.5 border-b border-slate-50 pb-2 mb-2">
            <Send className="w-4.5 h-4.5 text-indigo-600" />
            নতুন কাজের রিপোর্ট জমা দিন
          </h2>

          <div className="space-y-1.5">
            <label className="text-xxs font-bold text-slate-700 uppercase tracking-wider block">কমপ্লিটেড গুগল শিট লিঙ্ক (Google Sheet Link) *</label>
            <div className="relative">
              <Link className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
              <input
                type="text"
                required
                placeholder="যেমন: https://docs.google.com/spreadsheets/d/..."
                value={sheetLink}
                onChange={(e) => setSheetLink(e.target.value)}
                className="w-full text-xs border border-slate-200 rounded-xl pl-9 pr-3 py-3 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition outline-hidden font-mono"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xxs font-bold text-slate-700 uppercase tracking-wider block">কাজের ধরণ (Work Category) *</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setTaskType("2FA")}
                className={`py-3 px-4 rounded-xl text-xs font-bold border transition-all flex flex-col items-center justify-center gap-1 cursor-pointer ${taskType === "2FA" ? "bg-indigo-600 text-white border-indigo-600 shadow-sm" : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"}`}
              >
                <span>২-ফ্যাক্টর (2FA)</span>
                <span className={`text-[10px] font-normal ${taskType === "2FA" ? "text-indigo-100" : "text-slate-400"}`}>2FA Secured Emails</span>
              </button>
              <button
                type="button"
                onClick={() => setTaskType("3day_old")}
                className={`py-3 px-4 rounded-xl text-xs font-bold border transition-all flex flex-col items-center justify-center gap-1 cursor-pointer ${taskType === "3day_old" ? "bg-indigo-600 text-white border-indigo-600 shadow-sm" : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"}`}
              >
                <span>৩ দিনের পুরনো</span>
                <span className={`text-[10px] font-normal ${taskType === "3day_old" ? "text-indigo-100" : "text-slate-400"}`}>3 Days Aged Emails</span>
              </button>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xxs font-bold text-slate-700 uppercase tracking-wider block">মন্তব্য অথবা অতিরিক্ত তথ্য (ঐচ্ছিক)</label>
            <textarea
              placeholder="২-ফ্যাক্টর ব্যাকআপ কোড, লগইন টোকেন বা অন্য প্রয়োজনীয় তথ্য এখানে লিখুন..."
              rows={3}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full text-xs border border-slate-200 rounded-xl px-3 py-2.5 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition outline-hidden leading-relaxed"
            />
          </div>

          {error && (
            <div className="bg-rose-50 text-rose-700 p-3 rounded-xl border border-rose-100 text-xs">
              {error}
            </div>
          )}

          {success && (
            <div className="bg-emerald-50 text-emerald-700 p-3 rounded-xl border border-emerald-100 text-xs leading-relaxed">
              {success}
            </div>
          )}

          <button
            type="submit"
            disabled={submitting}
            className={`w-full py-2.5 rounded-xl text-xs font-bold text-white transition ${submitting ? "bg-indigo-400 cursor-not-allowed" : "bg-indigo-600 hover:bg-indigo-700 shadow-sm shadow-indigo-100"}`}
          >
            {submitting ? "জমা দেওয়া হচ্ছে..." : "কাজের রিপোর্ট সাবমিট করুন"}
          </button>
        </form>
      </div>

      {/* Submissions History */}
      <div className="space-y-3">
        <h3 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
          <FileText className="w-4 h-4 text-slate-500" />
          পূর্ববর্তী সাবমিশন হিস্ট্রি ({submissions.length})
        </h3>

        {submissions.length === 0 ? (
          <div className="bg-white border border-slate-100 rounded-2xl py-8 text-center text-slate-500 text-xs">
            আপনার কোনো কাজের সাবমিশন হিস্ট্রি পাওয়া যায়নি।
          </div>
        ) : (
          submissions.map((sub) => (
            <div key={sub.id} className="bg-white border border-slate-100 rounded-2xl p-4 shadow-xxs space-y-3">
              <div className="flex justify-between items-start gap-2">
                <span className="text-slate-400 text-xxs font-medium font-mono">
                  আইডি: {sub.id.substring(4, 12)}... | {new Date(sub.createdAt).toLocaleString()}
                </span>
                <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xxs font-bold ${sub.status === "approved" ? "bg-emerald-50 text-emerald-700 border border-emerald-100" : sub.status === "rejected" ? "bg-rose-50 text-rose-700 border border-rose-100" : "bg-amber-50 text-amber-700 border border-amber-100"}`}>
                  {sub.status === "approved" ? <CheckCircle className="w-3 h-3 text-emerald-600" /> : sub.status === "rejected" ? <AlertCircle className="w-3 h-3 text-rose-600" /> : <Clock className="w-3 h-3 text-amber-600" />}
                  {sub.status === "approved" ? "গৃহীত" : sub.status === "rejected" ? "বাতিলকৃত" : "পর্যবেক্ষণাধীন"}
                </span>
              </div>

              <div className="space-y-1.5">
                <div className="flex flex-wrap items-center gap-2">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-600 hover:underline break-all">
                    <Link className="w-3.5 h-3.5 shrink-0 text-slate-400" />
                    <a href={sub.sheetLink} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 font-mono">
                      গুগল শিট লিংক
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                  <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${sub.taskType === "3day_old" ? "bg-amber-50 text-amber-700 border border-amber-100" : "bg-indigo-50 text-indigo-700 border border-indigo-100"}`}>
                    {sub.taskType === "3day_old" ? "৩ দিনের পুরনো" : "২-ফ্যাক্টর (2FA)"}
                  </span>
                </div>

                {sub.note && (
                  <div className="bg-slate-50 border border-slate-100 rounded-lg p-2.5">
                    <span className="text-xxs text-slate-400 font-bold block mb-0.5">সংযুক্ত নোট:</span>
                    <p className="text-slate-700 text-xxs md:text-xs leading-relaxed font-mono whitespace-pre-wrap">{sub.note}</p>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
