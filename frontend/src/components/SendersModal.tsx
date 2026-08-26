import React, { useState } from "react";
import { X, Server, Plus, CheckCircle, ShieldAlert, Loader2 } from "lucide-react";
import type { Sender } from "../types";
import { createSenderApi } from "../services/api";

interface SendersModalProps {
  isOpen: boolean;
  onClose: () => void;
  senders: Sender[];
  onSenderCreated: () => void;
}

export const SendersModal: React.FC<SendersModalProps> = ({
  isOpen,
  onClose,
  senders,
  onSenderCreated,
}) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [smtpHost, setSmtpHost] = useState("smtp.ethereal.email");
  const [smtpPort, setSmtpPort] = useState(587);
  const [smtpUser, setSmtpUser] = useState("");
  const [smtpPassword, setSmtpPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleAddSender = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!name.trim() || !email.trim() || !smtpHost.trim() || !smtpUser.trim() || !smtpPassword.trim()) {
      setErrorMsg("All SMTP sender fields are required.");
      return;
    }

    try {
      setLoading(true);

      await createSenderApi({
        name: name.trim(),
        email: email.trim(),
        smtpHost: smtpHost.trim(),
        smtpPort: Number(smtpPort),
        smtpUser: smtpUser.trim(),
        smtpPassword: smtpPassword.trim(),
      });

      setName("");
      setEmail("");
      setSmtpUser("");
      setSmtpPassword("");
      setShowAddForm(false);
      onSenderCreated();
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Failed to create sender");
    } finally {
      setLoading(false);
    }
  };

  const autofillEthereal = () => {
    setName("ReachInbox Ethereal Account");
    setEmail("ethereal_test@reachinbox.ai");
    setSmtpHost("smtp.ethereal.email");
    setSmtpPort(587);
    setSmtpUser("demo_ethereal_user");
    setSmtpPassword("demo_password");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden my-8 text-slate-900">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg border border-blue-100">
              <Server className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Sender SMTP Accounts</h3>
              <p className="text-xs text-slate-500">Manage dispatch credentials for email campaigns</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 p-1 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5">
          {/* Active Senders List */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Configured Senders ({senders.length})
              </h4>
              {!showAddForm && (
                <button
                  onClick={() => setShowAddForm(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Add New Sender
                </button>
              )}
            </div>

            {senders.length === 0 ? (
              <div className="p-6 text-center border border-dashed border-slate-300 rounded-xl bg-slate-50">
                <Server className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                <p className="text-sm font-medium text-slate-600">No sender accounts configured yet.</p>
                <p className="text-xs text-slate-400 mt-1">Add an Ethereal or SMTP sender to dispatch emails.</p>
              </div>
            ) : (
              <div className="space-y-2.5 max-h-48 overflow-y-auto pr-1">
                {senders.map((s) => (
                  <div
                    key={s.id}
                    className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 font-bold text-xs flex items-center justify-center border border-blue-200">
                        {s.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-slate-900">{s.name}</p>
                        <p className="text-[11px] text-slate-500">{s.email} • {s.smtpHost}:{s.smtpPort}</p>
                      </div>
                    </div>
                    <span className="flex items-center gap-1 text-xs text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200 font-semibold">
                      <CheckCircle className="w-3.5 h-3.5" />
                      Active
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Add Sender Form */}
          {showAddForm && (
            <form onSubmit={handleAddSender} className="border-t border-slate-200 pt-5 space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-semibold text-blue-600 uppercase tracking-wider">
                  New SMTP Sender Configuration
                </h4>
                <button
                  type="button"
                  onClick={autofillEthereal}
                  className="text-xs text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 px-2.5 py-1 rounded border border-slate-200 transition-colors"
                >
                  ⚡ Auto-fill Demo Ethereal
                </button>
              </div>

              {errorMsg && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 flex-shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Sender Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Sales Team"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 text-xs focus:outline-none focus:border-blue-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Sender Email</label>
                  <input
                    type="email"
                    placeholder="sales@company.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 text-xs focus:outline-none focus:border-blue-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">SMTP Host</label>
                  <input
                    type="text"
                    placeholder="smtp.ethereal.email"
                    value={smtpHost}
                    onChange={(e) => setSmtpHost(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 text-xs focus:outline-none focus:border-blue-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">SMTP Port</label>
                  <input
                    type="number"
                    value={smtpPort}
                    onChange={(e) => setSmtpPort(Number(e.target.value))}
                    className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 text-xs focus:outline-none focus:border-blue-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">SMTP Username</label>
                  <input
                    type="text"
                    placeholder="user@ethereal.email"
                    value={smtpUser}
                    onChange={(e) => setSmtpUser(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 text-xs focus:outline-none focus:border-blue-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">SMTP Password</label>
                  <input
                    type="password"
                    placeholder="••••••••"
                    value={smtpPassword}
                    onChange={(e) => setSmtpPassword(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 text-xs focus:outline-none focus:border-blue-600"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="px-3.5 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200/80 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded-lg shadow-sm"
                >
                  {loading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  Save Sender Account
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
