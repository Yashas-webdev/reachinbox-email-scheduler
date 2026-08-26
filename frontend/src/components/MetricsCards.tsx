import React from "react";
import { Calendar, CheckCircle2, XCircle, Clock } from "lucide-react";
import type { Schedule, SentEmailLog } from "../types";

interface MetricsCardsProps {
  schedules: Schedule[];
  sentLogs: SentEmailLog[];
}

export const MetricsCards: React.FC<MetricsCardsProps> = ({ schedules, sentLogs }) => {
  const totalSchedules = schedules.length;

  let totalScheduledPending = 0;

  schedules.forEach((s) => {
    s.emails?.forEach((e) => {
      if (e.status === "SCHEDULED" || e.status === "PROCESSING") {
        totalScheduledPending++;
      }
    });
  });

  const totalSentSuccess = sentLogs.filter((l) => l.status === "SENT").length;
  const totalFailed = sentLogs.filter((l) => l.status === "FAILED").length;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {/* Total Campaigns */}
      <div className="bg-white border border-[#E8E4DC] rounded-xl p-4 shadow-xs">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-500">Total Campaigns</span>
          <div className="p-2 bg-blue-50 text-blue-600 rounded-lg border border-blue-100">
            <Calendar className="w-4 h-4" />
          </div>
        </div>
        <p className="text-2xl font-bold text-slate-900 mt-2">{totalSchedules}</p>
        <p className="text-[11px] text-slate-500 mt-1">Created in system</p>
      </div>

      {/* Pending Execution */}
      <div className="bg-white border border-[#E8E4DC] rounded-xl p-4 shadow-xs">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-500">Pending Jobs</span>
          <div className="p-2 bg-amber-50 text-amber-600 rounded-lg border border-amber-100">
            <Clock className="w-4 h-4" />
          </div>
        </div>
        <p className="text-2xl font-bold text-amber-600 mt-2">{totalScheduledPending}</p>
        <p className="text-[11px] text-slate-500 mt-1">Queued in BullMQ</p>
      </div>

      {/* Successfully Sent */}
      <div className="bg-white border border-[#E8E4DC] rounded-xl p-4 shadow-xs">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-500">Successfully Sent</span>
          <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg border border-emerald-100">
            <CheckCircle2 className="w-4 h-4" />
          </div>
        </div>
        <p className="text-2xl font-bold text-emerald-600 mt-2">{totalSentSuccess}</p>
        <p className="text-[11px] text-slate-500 mt-1">Dispatched via SMTP</p>
      </div>

      {/* Failed / Errors */}
      <div className="bg-white border border-[#E8E4DC] rounded-xl p-4 shadow-xs">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-500">Failed / Errors</span>
          <div className="p-2 bg-rose-50 text-rose-600 rounded-lg border border-rose-100">
            <XCircle className="w-4 h-4" />
          </div>
        </div>
        <p className="text-2xl font-bold text-rose-600 mt-2">{totalFailed}</p>
        <p className="text-[11px] text-slate-500 mt-1">Delivery errors</p>
      </div>
    </div>
  );
};
