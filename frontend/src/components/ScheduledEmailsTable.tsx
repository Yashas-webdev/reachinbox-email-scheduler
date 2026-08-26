import React, { useState } from "react";
import { Calendar, ChevronDown, ChevronRight, Clock, Mail, RefreshCw, Send, CheckCircle2, XCircle, ExternalLink } from "lucide-react";
import type { Schedule, ScheduledEmailItem } from "../types";
import { EmailDetailModal } from "./EmailDetailModal";

interface ScheduledEmailsTableProps {
  schedules: Schedule[];
  loading: boolean;
  onRefresh: () => void;
  onOpenCompose: () => void;
}

export const ScheduledEmailsTable: React.FC<ScheduledEmailsTableProps> = ({
  schedules,
  loading,
  onRefresh,
  onOpenCompose,
}) => {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [selectedRecipient, setSelectedRecipient] = useState<{
    email: ScheduledEmailItem;
    schedule: Schedule;
  } | null>(null);

  const toggleExpand = (id: string) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "COMPLETED":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Completed
          </span>
        );
      case "SENT":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Sent
          </span>
        );
      case "PROCESSING":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
            Processing
          </span>
        );
      case "FAILED":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
            <XCircle className="w-3.5 h-3.5" />
            Failed
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
            <Clock className="w-3.5 h-3.5" />
            Scheduled
          </span>
        );
    }
  };

  return (
    <>
      <div className="bg-white border border-[#E8E4DC] rounded-xl overflow-hidden shadow-xs">
        {/* Table Header */}
        <div className="p-4 sm:p-5 border-b border-[#E8E4DC] flex items-center justify-between bg-[#F7F5F0]">
          <div>
            <h3 className="text-sm sm:text-base font-bold text-slate-900 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-blue-600" />
              Scheduled Campaigns
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">Click any recipient email to view full subject & body text</p>
          </div>

          <button
            onClick={onRefresh}
            disabled={loading}
            className="p-2 text-slate-500 hover:text-slate-900 bg-white hover:bg-slate-100 border border-[#E8E4DC] rounded-lg transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin text-blue-600" : ""}`} />
          </button>
        </div>

        {/* Content */}
        {loading ? (
          <div className="p-12 text-center text-slate-500">
            <RefreshCw className="w-7 h-7 animate-spin mx-auto text-blue-600 mb-3" />
            <p className="text-sm font-medium">Loading scheduled campaigns...</p>
          </div>
        ) : schedules.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-12 h-12 rounded-full bg-[#F5F2EC] text-slate-400 flex items-center justify-center mx-auto mb-3">
              <Mail className="w-6 h-6" />
            </div>
            <h4 className="text-sm font-bold text-slate-900">No scheduled emails found</h4>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto mb-5">
              You don't have any scheduled campaigns yet. Click below to compose your first campaign.
            </p>
            <button
              onClick={onOpenCompose}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition-colors"
            >
              <Send className="w-3.5 h-3.5" />
              Compose New Email
            </button>
          </div>
        ) : (
          <div className="divide-y divide-[#E8E4DC]">
            {schedules.map((schedule) => {
              const isExpanded = expandedId === schedule.id;
              const recipientCount = schedule.emails?.length || 0;

              return (
                <div key={schedule.id} className="transition-colors hover:bg-[#FAF8F5]">
                  <div
                    onClick={() => toggleExpand(schedule.id)}
                    className="p-4 sm:px-6 flex items-center justify-between cursor-pointer"
                  >
                    <div className="flex items-center gap-4 min-w-0">
                      <button className="text-slate-400 hover:text-slate-600 p-0.5">
                        {isExpanded ? <ChevronDown className="w-4 h-4 text-blue-600" /> : <ChevronRight className="w-4 h-4" />}
                      </button>

                      <div className="min-w-0">
                        <h4 className="text-sm font-bold text-slate-900 truncate">{schedule.subject}</h4>
                        <p className="text-xs text-slate-500 mt-0.5">
                          From: <span className="text-slate-700 font-medium">{schedule.sender?.name || "Sender"}</span> ({schedule.sender?.email})
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 sm:gap-8 flex-shrink-0">
                      <div className="hidden sm:block text-right">
                        <p className="text-xs font-medium text-slate-700">
                          {new Date(schedule.startTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </p>
                        <p className="text-[11px] text-slate-400">
                          {new Date(schedule.startTime).toLocaleDateString()}
                        </p>
                      </div>

                      <div className="text-right">
                        <p className="text-xs font-bold text-blue-600">
                          {recipientCount} <span className="text-slate-500 font-normal">recipients</span>
                        </p>
                      </div>

                      <div>{getStatusBadge(schedule.status)}</div>
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="bg-[#FAF8F5] border-t border-b border-[#E8E4DC] p-4 sm:px-8 space-y-3">
                      {/* Campaign Settings Header */}
                      <div className="flex items-center justify-between text-xs text-slate-500 pb-2 border-b border-[#E8E4DC]">
                        <span className="font-semibold text-slate-700 uppercase tracking-wider">
                          Click recipient email to view details
                        </span>
                        <div className="flex items-center gap-4">
                          <span>Delay: <strong className="text-slate-800">{schedule.delayBetweenEmails}s</strong></span>
                          <span>Hourly Limit: <strong className="text-slate-800">{schedule.hourlyLimit > 0 ? schedule.hourlyLimit : "Unlimited"}</strong></span>
                        </div>
                      </div>

                      {/* Recipient List Breakdown */}
                      <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                        {schedule.emails?.map((email) => (
                          <div
                            key={email.id}
                            onClick={() => setSelectedRecipient({ email, schedule })}
                            className="flex items-center justify-between p-2.5 bg-white hover:bg-[#F5F2EC] border border-[#E8E4DC] rounded-lg text-xs cursor-pointer transition-colors group"
                          >
                            <div className="flex items-center gap-3">
                              <div className="p-1.5 bg-[#F5F2EC] text-slate-500 group-hover:text-blue-600 rounded">
                                <Mail className="w-3.5 h-3.5" />
                              </div>
                              <div>
                                <p className="font-semibold text-slate-800 group-hover:text-blue-600 transition-colors flex items-center gap-1.5">
                                  <span>{email.recipient}</span>
                                  <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                                </p>
                                <p className="text-[11px] text-slate-400 truncate max-w-sm">
                                  Subject: {schedule.subject}
                                </p>
                              </div>
                            </div>

                            <div className="flex items-center gap-4">
                              <span className="text-slate-400 hidden sm:inline">
                                Scheduled: {new Date(email.scheduledAt).toLocaleTimeString()}
                              </span>
                              {getStatusBadge(email.status)}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Recipient Details Modal */}
      {selectedRecipient && (
        <EmailDetailModal
          isOpen={true}
          onClose={() => setSelectedRecipient(null)}
          recipient={selectedRecipient.email.recipient}
          subject={selectedRecipient.schedule.subject}
          body={selectedRecipient.schedule.body}
          senderName={selectedRecipient.schedule.sender?.name}
          senderEmail={selectedRecipient.schedule.sender?.email}
          status={selectedRecipient.email.status}
          timestamp={new Date(selectedRecipient.email.scheduledAt).toLocaleString()}
        />
      )}
    </>
  );
};
