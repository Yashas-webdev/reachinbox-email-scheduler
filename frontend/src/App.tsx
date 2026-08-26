import { useEffect, useState } from "react";
import { Mail, Calendar, CheckCircle2, Plus, RefreshCw } from "lucide-react";
import type { User, Sender, Schedule, SentEmailLog } from "./types";
import {
  fetchMe,
  logoutApi,
  fetchSenders,
  fetchSchedules,
  fetchSentEmails,
} from "./services/api";

import { Header } from "./components/Header";
import { MetricsCards } from "./components/MetricsCards";
import { ScheduledEmailsTable } from "./components/ScheduledEmailsTable";
import { SentEmailsTable } from "./components/SentEmailsTable";
import { ComposeModal } from "./components/ComposeModal";
import { SendersModal } from "./components/SendersModal";
import { GoogleButton } from "./components/GoogleButton";

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loadingUser, setLoadingUser] = useState(true);

  const [senders, setSenders] = useState<Sender[]>([]);
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [sentLogs, setSentLogs] = useState<SentEmailLog[]>([]);

  const [loadingData, setLoadingData] = useState(false);
  const [activeTab, setActiveTab] = useState<"schedules" | "sent">("schedules");

  const [isComposeOpen, setIsComposeOpen] = useState(false);
  const [isSendersOpen, setIsSendersOpen] = useState(false);

  // 1. Initial Authentication Check
  useEffect(() => {
    fetchMe()
      .then(setUser)
      .catch(() => setUser(null))
      .finally(() => setLoadingUser(false));
  }, []);

  // 2. Fetch Dashboard Data
  const loadDashboardData = async (showSpinner = false) => {
    if (!user) return;
    try {
      if (showSpinner) setLoadingData(true);
      const [sendersData, schedulesData, sentData] = await Promise.all([
        fetchSenders(),
        fetchSchedules(),
        fetchSentEmails(),
      ]);

      setSenders(sendersData);
      setSchedules(schedulesData);
      setSentLogs(sentData);
    } catch (err) {
      console.error("Dashboard fetch error:", err);
    } finally {
      if (showSpinner) setLoadingData(false);
    }
  };

  // 3. Silent Auto-Polling Every 10 Seconds
  useEffect(() => {
    if (user) {
      loadDashboardData(true);
      const interval = setInterval(() => loadDashboardData(false), 10000);
      return () => clearInterval(interval);
    }
  }, [user]);

  const handleLogout = async () => {
    await logoutApi();
    setUser(null);
  };

  if (loadingUser) {
    return (
      <div className="min-h-screen bg-[#FAF8F5] flex flex-col items-center justify-center text-slate-500">
        <RefreshCw className="w-8 h-8 animate-spin text-blue-600 mb-3" />
        <p className="text-sm font-medium">Initializing ReachInbox Email Scheduler...</p>
      </div>
    );
  }

  // 4. Login Screen
  if (!user) {
    return (
      <div className="min-h-screen bg-[#F5F2EC] flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-white border border-[#E8E4DC] rounded-2xl p-8 sm:p-10 shadow-xl text-center">
          <div className="w-14 h-14 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-sm">
            <Mail className="w-7 h-7 text-white" />
          </div>

          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">ReachInbox</h1>
          <p className="text-xs font-semibold uppercase tracking-wider text-blue-600 mt-1 mb-6">
            Email Scheduler Platform
          </p>

          <GoogleButton
            onSuccess={(user) => setUser(user)}
            onError={(msg) => alert(msg)}
          />
        </div>
      </div>
    );
  }

  // 5. Main Dashboard Layout
  return (
    <div className="min-h-screen bg-[#FAF8F5] text-slate-900 font-sans pb-16">
      <Header
        user={user}
        onLogout={handleLogout}
        onOpenCompose={() => setIsComposeOpen(true)}
        onOpenSenders={() => setIsSendersOpen(true)}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <MetricsCards schedules={schedules} sentLogs={sentLogs} />

        {/* Tab Navigation */}
        <div className="flex items-center justify-between border-b border-slate-200 mb-6 pb-2">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab("schedules")}
              className={`flex items-center gap-2 px-3.5 py-1.5 text-xs sm:text-sm font-semibold rounded-lg transition-colors ${
                activeTab === "schedules"
                  ? "bg-blue-600 text-white shadow-xs"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/60"
              }`}
            >
              <Calendar className="w-4 h-4" />
              <span>Scheduled Campaigns ({schedules.length})</span>
            </button>

            <button
              onClick={() => setActiveTab("sent")}
              className={`flex items-center gap-2 px-3.5 py-1.5 text-xs sm:text-sm font-semibold rounded-lg transition-colors ${
                activeTab === "sent"
                  ? "bg-blue-600 text-white shadow-xs"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/60"
              }`}
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Sent & Failed Logs ({sentLogs.length})</span>
            </button>
          </div>

          <button
            onClick={() => setIsComposeOpen(true)}
            className="hidden sm:flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg shadow-xs transition-colors"
          >
            <Plus className="w-4 h-4 text-blue-600" />
            <span>New Campaign</span>
          </button>
        </div>

        {/* Tab Views */}
        {activeTab === "schedules" ? (
          <ScheduledEmailsTable
            schedules={schedules}
            loading={loadingData}
            onRefresh={() => loadDashboardData(true)}
            onOpenCompose={() => setIsComposeOpen(true)}
          />
        ) : (
          <SentEmailsTable
            sentLogs={sentLogs}
            loading={loadingData}
            onRefresh={() => loadDashboardData(true)}
          />
        )}
      </main>

      {/* Modals */}
      <ComposeModal
        isOpen={isComposeOpen}
        onClose={() => setIsComposeOpen(false)}
        senders={senders}
        onScheduleCreated={loadDashboardData}
        onOpenAddSender={() => {
          setIsComposeOpen(false);
          setIsSendersOpen(true);
        }}
      />

      <SendersModal
        isOpen={isSendersOpen}
        onClose={() => setIsSendersOpen(false)}
        senders={senders}
        onSenderCreated={loadDashboardData}
      />
    </div>
  );
}

export default App;
