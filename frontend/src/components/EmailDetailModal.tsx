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
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <CheckCircle2 className="w-3.5 h-3.5" />
            SENT
          </span>
        );
      case "PROCESSING":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-xs font-medium bg-blue-500/10 text-blue-400 border border-blue-500/20">
            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
            PROCESSING
          </span>
        );
      case "FAILED":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-xs font-medium bg-rose-500/10 text-rose-400 border border-rose-500/20">
            <XCircle className="w-3.5 h-3.5" />
            FAILED
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-xs font-medium bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <Clock className="w-3.5 h-3.5" />
            SCHEDULED
          </span>
        );
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-xl w-full max-w-lg shadow-xl overflow-hidden my-8">
        {/* Header */}
        <div className="px-5 py-3.5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Mail className="w-4 h-4 text-slate-400" />
            <h3 className="text-sm font-bold text-white">Email Details</h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4 text-xs">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div>
              <span className="text-slate-500 block text-[11px]">Status</span>
              <div className="mt-1">{getStatusBadge(status)}</div>
            </div>
            <div className="text-right">
              <span className="text-slate-500 block text-[11px]">Scheduled / Sent Time</span>
              <span className="font-mono text-slate-300 mt-1 block">{timestamp}</span>
            </div>
          </div>

          <div className="space-y-2 bg-slate-950/50 p-3.5 rounded-lg border border-slate-800 font-mono text-[11px]">
            <div>
              <span className="text-slate-500">To: </span>
              <span className="text-blue-400 font-semibold">{recipient}</span>
            </div>
            {senderEmail && (
              <div>
                <span className="text-slate-500">From: </span>
                <span className="text-slate-300">{senderName} ({senderEmail})</span>
              </div>
            )}
            <div className="pt-2 border-t border-slate-800">
              <span className="text-slate-500">Subject: </span>
              <span className="text-white font-sans font-bold">{subject}</span>
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-medium text-slate-400 mb-1.5 flex items-center gap-1">
              <FileText className="w-3.5 h-3.5 text-slate-400" />
              Email Body Content:
            </label>
            <div className="p-3.5 bg-slate-950/80 border border-slate-800 rounded-lg text-slate-300 font-mono text-[11px] leading-relaxed whitespace-pre-wrap max-h-48 overflow-y-auto">
              {body || "No body content provided."}
            </div>
          </div>

          {errorMessage && (
            <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-lg text-rose-400 text-[11px]">
              <strong>Failure Error:</strong> {errorMessage}
            </div>
          )}

          <div className="flex justify-end pt-2 border-t border-slate-800">
            <button
              onClick={onClose}
              className="px-3.5 py-1.5 text-xs font-semibold text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
