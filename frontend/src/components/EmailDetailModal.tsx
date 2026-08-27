import React from "react";
import { X, Mail, Clock, FileText, CheckCircle2, XCircle, RefreshCw } from "lucide-react";

interface EmailDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  recipient: string;
  subject: string;
  body: string;
  senderName?: string;
  senderEmail?: string;
  status: string;
  timestamp: string;
  errorMessage?: string | null;
}

export const EmailDetailModal: React.FC<EmailDetailModalProps> = ({
  isOpen,
  onClose,
  recipient,
  subject,
  body,
  senderName,
  senderEmail,
  status,
  timestamp,
  errorMessage,
}) => {
  if (!isOpen) return null;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "SENT":
      case "COMPLETED":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5" />
            SENT
          </span>
        );
      case "PROCESSING":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
            PROCESSING
          </span>
        );
      case "FAILED":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
            <XCircle className="w-3.5 h-3.5" />
            FAILED
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
            <Clock className="w-3.5 h-3.5" />
            SCHEDULED
          </span>
        );
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white border border-[#E8E4DC] rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden my-8 text-slate-900">
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#E8E4DC] flex items-center justify-between bg-[#F7F5F0]">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg border border-blue-100">
              <Mail className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-bold text-slate-900">Recipient Email Details</h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 p-1 rounded-lg hover:bg-slate-200/60 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4 text-xs">
          <div className="flex items-center justify-between pb-3 border-b border-[#E8E4DC]">
            <div>
              <span className="text-slate-500 block text-[11px] font-medium">Delivery Status</span>
              <div className="mt-1">{getStatusBadge(status)}</div>
            </div>
            <div className="text-right">
              <span className="text-slate-500 block text-[11px] font-medium">Scheduled / Processed Time</span>
              <span className="font-mono text-slate-800 font-semibold mt-1 block">{timestamp}</span>
            </div>
          </div>

          <div className="space-y-2 bg-[#F5F2EC] p-4 rounded-xl border border-[#E8E4DC] text-xs">
            <div>
              <span className="text-slate-500 font-medium">To: </span>
              <span className="text-blue-700 font-mono font-bold bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                {recipient}
              </span>
            </div>
            {senderEmail && (
              <div>
                <span className="text-slate-500 font-medium">From: </span>
                <span className="text-slate-800 font-semibold">{senderName} ({senderEmail})</span>
              </div>
            )}
            <div className="pt-2 border-t border-[#E8E4DC]">
              <span className="text-slate-500 font-medium">Subject: </span>
              <span className="text-slate-900 font-bold text-sm">{subject}</span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center gap-1.5">
              <FileText className="w-4 h-4 text-blue-600" />
              Full Email Body Content:
            </label>
            <div className="p-4 bg-[#FAF8F5] border border-[#E8E4DC] rounded-xl text-slate-800 font-mono text-xs leading-relaxed whitespace-pre-wrap max-h-48 overflow-y-auto">
              {body || "No body content provided."}
            </div>
          </div>

          {errorMessage && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs">
              <strong>Failure Diagnostics:</strong> {errorMessage}
            </div>
          )}

          <div className="flex justify-end pt-3 border-t border-[#E8E4DC]">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-[#F5F2EC] hover:bg-[#EBE7DF] border border-[#E8E4DC] rounded-xl transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
