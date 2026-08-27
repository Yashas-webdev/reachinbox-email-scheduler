import React, { useState } from "react";
import { CheckCircle2, XCircle, RefreshCw, Mail, ExternalLink } from "lucide-react";
import type { SentEmailLog } from "../types";
import { EmailDetailModal } from "./EmailDetailModal";

interface SentEmailsTableProps {
  sentLogs: SentEmailLog[];
  loading: boolean;
  onRefresh: () => void;
}

export const SentEmailsTable: React.FC<SentEmailsTableProps> = ({
  sentLogs,
  loading,
  onRefresh,
}) => {
  const [selectedLog, setSelectedLog] = useState<SentEmailLog | null>(null);

  return (
    <div className="h-full flex flex-col min-h-0">
      {/* Sticky Section Header */}
      <div className="flex-shrink-0 bg-white border border-[#E8E4DC] rounded-xl p-4 sm:p-5 flex items-center justify-between shadow-xs mb-3">
        <div>
          <h3 className="text-sm sm:text-base font-bold text-slate-900 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            Sent & Delivery Logs ({sentLogs.length})
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">Click any row to inspect its full subject & body text</p>
        </div>

        <button
          onClick={onRefresh}
          disabled={loading}
          title="Refresh sent logs"
          className="p-2 text-slate-500 hover:text-slate-900 bg-[#F7F5F0] hover:bg-[#EBE7DF] border border-[#E8E4DC] rounded-lg transition-colors"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin text-emerald-600" : ""}`} />
        </button>
      </div>

      {/* Scrollable Table Area */}
      <div className="flex-1 min-h-0 overflow-y-auto pr-1">
        {loading ? (
          <div className="bg-white border border-[#E8E4DC] rounded-xl p-12 text-center text-slate-500 shadow-xs">
            <RefreshCw className="w-7 h-7 animate-spin mx-auto text-emerald-600 mb-3" />
            <p className="text-sm font-medium">Loading delivery logs...</p>
          </div>
        ) : sentLogs.length === 0 ? (
          <div className="bg-white border border-[#E8E4DC] rounded-xl p-12 text-center shadow-xs">
            <div className="w-12 h-12 rounded-full bg-[#F5F2EC] text-slate-400 flex items-center justify-center mx-auto mb-3">
              <Mail className="w-6 h-6" />
            </div>
            <h4 className="text-sm font-bold text-slate-900">No sent email logs found</h4>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              Emails dispatched by your BullMQ worker will appear here with delivery timestamps & status.
            </p>
          </div>
        ) : (
          <div className="bg-white border border-[#E8E4DC] rounded-xl overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#F7F5F0] text-slate-500 uppercase font-semibold border-b border-[#E8E4DC] sticky top-0 z-10">
                  <tr>
                    <th className="py-3.5 px-6">Recipient</th>
                    <th className="py-3.5 px-4">Subject</th>
                    <th className="py-3.5 px-4">Sender</th>
                    <th className="py-3.5 px-4">Processed At</th>
                    <th className="py-3.5 px-6 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E8E4DC] text-slate-700">
                  {sentLogs.map((log) => (
                    <tr
                      key={log.id}
                      onClick={() => setSelectedLog(log)}
                      className="hover:bg-[#FAF8F5] cursor-pointer transition-colors group"
                    >
                      <td className="py-3.5 px-6 font-medium text-slate-900 flex items-center gap-2">
                        <Mail className="w-4 h-4 text-slate-400 group-hover:text-blue-600 flex-shrink-0 transition-colors" />
                        <span className="group-hover:text-blue-600 font-semibold transition-colors flex items-center gap-1.5">
                          {log.recipient}
                          <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </span>
                      </td>

                      <td className="py-3.5 px-4 font-semibold text-slate-800 max-w-xs truncate">
                        {log.schedule?.subject || "Email Campaign"}
                      </td>

                      <td className="py-3.5 px-4 text-slate-500">
                        {log.schedule?.sender?.name} ({log.schedule?.sender?.email})
                      </td>

                      <td className="py-3.5 px-4 text-slate-500">
                        {log.sentAt
                          ? new Date(log.sentAt).toLocaleString()
                          : log.failedAt
                          ? new Date(log.failedAt).toLocaleString()
                          : new Date(log.scheduledAt).toLocaleString()}
                      </td>

                      <td className="py-3.5 px-6 text-right">
                        {log.status === "SENT" ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            SENT
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full font-semibold bg-rose-50 text-rose-700 border border-rose-200">
                            <XCircle className="w-3.5 h-3.5" />
                            FAILED
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Email Details Modal */}
      {selectedLog && (
        <EmailDetailModal
          isOpen={true}
          onClose={() => setSelectedLog(null)}
          recipient={selectedLog.recipient}
          subject={selectedLog.schedule?.subject || "Email Campaign"}
          body={selectedLog.schedule?.body || "No email body provided."}
          senderName={selectedLog.schedule?.sender?.name}
          senderEmail={selectedLog.schedule?.sender?.email}
          status={selectedLog.status}
          timestamp={
            selectedLog.sentAt
              ? new Date(selectedLog.sentAt).toLocaleString()
              : new Date(selectedLog.scheduledAt).toLocaleString()
          }
          errorMessage={selectedLog.errorMessage}
        />
      )}
    </div>
  );
};
