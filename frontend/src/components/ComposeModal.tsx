import React, { useState } from "react";
import { X, Send, Upload, FileText, CheckCircle2, ShieldAlert, Loader2, Plus, Clock } from "lucide-react";
import type { Sender } from "../types";
import { createScheduleApi } from "../services/api";

interface ComposeModalProps {
  isOpen: boolean;
  onClose: () => void;
  senders: Sender[];
  onScheduleCreated: () => void;
  onOpenAddSender: () => void;
}

export const ComposeModal: React.FC<ComposeModalProps> = ({
  isOpen,
  onClose,
  senders,
  onScheduleCreated,
  onOpenAddSender,
}) => {
  const [senderId, setSenderId] = useState(senders[0]?.id || "");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");

  const [rawEmailsInput, setRawEmailsInput] = useState("");
  const [parsedRecipients, setParsedRecipients] = useState<string[]>([]);
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);

  const [startTime, setStartTime] = useState(() => {
    const now = new Date();
    now.setMinutes(now.getMinutes() + 2);
    return now.toISOString().slice(0, 16);
  });

  const [delayBetweenEmails, setDelayBetweenEmails] = useState(2);
  const [hourlyLimit, setHourlyLimit] = useState(0);

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  React.useEffect(() => {
    if (senders.length > 0 && (!senderId || !senders.some((s) => s.id === senderId))) {
      setSenderId(senders[0].id);
    }
  }, [senders, senderId]);

  if (!isOpen) return null;

  const processRawEmails = (text: string) => {
    setRawEmailsInput(text);
    const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
    const matches = text.match(emailRegex) || [];
    const uniqueEmails = Array.from(new Set(matches.map((e) => e.toLowerCase().trim())));
    setParsedRecipients(uniqueEmails);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadedFileName(file.name);
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        processRawEmails(content);
      }
    };
    reader.readAsText(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const activeSenderId = senderId || senders[0]?.id;

    if (!activeSenderId) {
      setErrorMsg("Please select or add a Sender SMTP account first.");
      return;
    }

    if (!subject.trim()) {
      setErrorMsg("Email subject is required.");
      return;
    }

    if (!body.trim()) {
      setErrorMsg("Email body content is required.");
      return;
    }

    if (parsedRecipients.length === 0) {
      setErrorMsg("Please enter or upload at least one valid recipient email address.");
      return;
    }

    try {
      setLoading(true);

      await createScheduleApi({
        senderId: activeSenderId,
        subject: subject.trim(),
        body: body.trim(),
        recipients: parsedRecipients,
        startTime: new Date(startTime).toISOString(),
        delayBetweenEmails: Number(delayBetweenEmails) || 0,
        hourlyLimit: Number(hourlyLimit) || 0,
      });

      setSubject("");
      setBody("");
      setRawEmailsInput("");
      setParsedRecipients([]);
      setUploadedFileName(null);
      onClose();
      onScheduleCreated();
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Failed to schedule email campaign");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden my-8 text-slate-900">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg border border-blue-100">
              <Send className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Compose Email Campaign</h3>
              <p className="text-xs text-slate-500">Schedule cold email sequences with BullMQ & Redis</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 p-1 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body / Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 flex-shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Sender */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-semibold text-slate-700">From (Sender Account)</label>
              <button
                type="button"
                onClick={onOpenAddSender}
                className="text-xs text-blue-600 hover:text-blue-700 flex items-center gap-1 font-medium"
              >
                <Plus className="w-3.5 h-3.5" />
                Add New Sender
              </button>
            </div>

            {senders.length === 0 ? (
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800 flex items-center justify-between">
                <span>No sender accounts configured yet.</span>
                <button
                  type="button"
                  onClick={onOpenAddSender}
                  className="px-2.5 py-1 bg-amber-600 text-white font-bold rounded-md hover:bg-amber-700"
                >
                  Configure Sender
                </button>
              </div>
            ) : (
              <select
                value={senderId || senders[0]?.id}
                onChange={(e) => setSenderId(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-slate-900 text-xs focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
              >
                {senders.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.email}) — {s.smtpHost}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Subject */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Subject Line</label>
            <input
              type="text"
              placeholder="e.g. Quick question regarding your cold outreach strategy"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2 text-slate-900 text-xs focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
            />
          </div>

          {/* Body */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Email Body</label>
            <textarea
              rows={4}
              placeholder="Write your cold email template here..."
              value={body}
              onChange={(e) => setBody(e.target.value)}
              className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2 text-slate-900 text-xs focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 resize-none font-mono"
            />
          </div>

          {/* Recipients */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-semibold text-slate-700">
                Recipients (CSV / Text Lead List)
              </label>
              <label className="cursor-pointer text-xs text-blue-600 hover:text-blue-700 flex items-center gap-1 font-medium">
                <Upload className="w-3.5 h-3.5" />
                Upload CSV / Text File
                <input
                  type="file"
                  accept=".csv,.txt"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            </div>

            <textarea
              rows={3}
              placeholder="Paste email addresses separated by commas or new lines, or upload a CSV file..."
              value={rawEmailsInput}
              onChange={(e) => processRawEmails(e.target.value)}
              className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2 text-slate-900 text-xs focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 font-mono"
            />

            {uploadedFileName && (
              <p className="text-[11px] text-slate-500 mt-1 flex items-center gap-1">
                <FileText className="w-3.5 h-3.5 text-blue-600" />
                Uploaded: <span className="text-slate-800 font-medium">{uploadedFileName}</span>
              </p>
            )}

            {parsedRecipients.length > 0 && (
              <div className="mt-2 p-2.5 bg-blue-50 border border-blue-200 rounded-xl text-blue-700 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-blue-600 flex-shrink-0" />
                <span>
                  <strong>{parsedRecipients.length}</strong> unique valid recipient email addresses detected!
                </span>
              </div>
            )}
          </div>

          {/* Controls */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-blue-600" />
                Start Time
              </label>
              <input
                type="datetime-local"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-slate-900 text-xs focus:outline-none focus:border-blue-600"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Delay Between Emails (sec)
              </label>
              <input
                type="number"
                min="0"
                value={delayBetweenEmails}
                onChange={(e) => setDelayBetweenEmails(Number(e.target.value))}
                className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-slate-900 text-xs focus:outline-none focus:border-blue-600"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Hourly Limit (0 = Unlimited)
              </label>
              <input
                type="number"
                min="0"
                value={hourlyLimit}
                onChange={(e) => setHourlyLimit(Number(e.target.value))}
                className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-slate-900 text-xs focus:outline-none focus:border-blue-600"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 border-t border-slate-200 pt-4 mt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200/80 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || senders.length === 0}
              className="flex items-center gap-2 px-5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-sm disabled:opacity-50 transition-colors"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Scheduling...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  Schedule Campaign
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
