import React, { useState } from "react";
import type { User } from "../types";
import { LogOut, Plus, Server, Send } from "lucide-react";

interface HeaderProps {
  user: User;
  onLogout: () => void;
  onOpenCompose: () => void;
  onOpenSenders: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  user,
  onLogout,
  onOpenCompose,
  onOpenSenders,
}) => {
  const [imgError, setImgError] = useState(false);

  return (
    <header className="bg-white border-b border-[#E8E4DC] sticky top-0 z-30 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold text-base shadow-sm">
            <Send className="w-4 h-4 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-900 tracking-tight text-base">ReachInbox</span>
              <span className="text-[10px] uppercase font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                Scheduler
              </span>
            </div>
          </div>
        </div>

        {/* Action Controls & User Profile */}
        <div className="flex items-center gap-3">
          <button
            onClick={onOpenSenders}
            className="flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-[#F5F2EC] hover:bg-[#EBE7DF] border border-[#E8E4DC] rounded-lg transition-colors"
          >
            <Server className="w-3.5 h-3.5 text-slate-500" />
            <span className="hidden sm:inline">SMTP Senders</span>
          </button>

          <button
            onClick={onOpenCompose}
            className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>New Campaign</span>
          </button>

          <div className="h-5 w-px bg-[#E8E4DC] mx-1 hidden sm:block"></div>

          {/* User Profile */}
          <div className="flex items-center gap-2.5">
            {user.avatar && !imgError ? (
              <img
                src={user.avatar}
                alt={user.name}
                referrerPolicy="no-referrer"
                onError={() => setImgError(true)}
                className="w-8 h-8 rounded-full border border-[#E8E4DC] object-cover"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-blue-100 border border-blue-200 text-blue-700 flex items-center justify-center font-bold text-xs shadow-2xs">
                {user.name ? user.name.charAt(0).toUpperCase() : "U"}
              </div>
            )}

            <div className="hidden md:block text-left">
              <p className="text-xs font-semibold text-slate-900 leading-tight">{user.name}</p>
              <p className="text-[11px] text-slate-500">{user.email}</p>
            </div>

            <button
              onClick={onLogout}
              title="Logout"
              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
