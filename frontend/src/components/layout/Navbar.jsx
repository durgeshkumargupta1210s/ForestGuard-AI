import { useState } from "react";
import {
  Bell, Menu, ShieldAlert, CheckCircle2, FileText, Mail, ArrowRight,
  User, Settings, LogOut, LayoutDashboard, ShieldCheck, ChevronDown
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useLocation, useNavigate } from "react-router-dom";

const PAGE_TITLES = {
  "/": {
    title: "Command Center",
    sub: "Overview of live forest protection operations",
  },
  "/analysis": {
    title: "Analysis",
    sub: "Run AI-powered risk assessments on forest zones",
  },
  "/timelapse": {
    title: "Time-Lapse Command Center",
    sub: "Multi-temporal animation & orbital pass logs",
  },
  "/compare": {
    title: "Dual-Map Comparison Mode",
    sub: "Side-by-side satellite imagery comparative analysis",
  },
  "/explainability": {
    title: "AI Explainability Center",
    sub: "Spectral physics & non-technical decision trees",
  },
  "/reports": {
    title: "Reports",
    sub: "Review generated insights and response plans",
  },
  "/alerts": {
    title: "Alerts",
    sub: "Track live warnings and escalation events",
  },
  "/settings": {
    title: "Settings",
    sub: "Tune monitoring preferences and account access",
  },
};

const DUMMY_NOTIFICATIONS = [
  {
    id: 1,
    title: "High Risk Canopy Loss Alert",
    desc: "Kanha National Park breached emergency threshold (50% vegetation loss).",
    time: "5m ago",
    unread: true,
    type: "critical",
    icon: ShieldAlert,
    link: "/analysis",
  },
  {
    id: 2,
    title: "Sentinel-2 Orbit Synchronized",
    desc: "Real-time satellite bands (B04 & B08) processed for Amazon Reserve.",
    time: "18m ago",
    unread: true,
    type: "info",
    icon: CheckCircle2,
    link: "/timelapse",
  },
  {
    id: 3,
    title: "PDF Evidence Report Ready",
    desc: "Government-ready legal evidence report generated for Pench Reserve.",
    time: "42m ago",
    unread: true,
    type: "success",
    icon: FileText,
    link: "/reports",
  },
  {
    id: 4,
    title: "Emergency Email Dispatched",
    desc: "Non-technical AI alert sent to namitgmaps73@gmail.com for field rangers.",
    time: "1h ago",
    unread: false,
    type: "email",
    icon: Mail,
    link: "/alerts",
  },
];

function Navbar({ onMenuClick }) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [notifications, setNotifications] = useState(DUMMY_NOTIFICATIONS);

  const page = PAGE_TITLES[location.pathname] || {
    title: "ForestGuard AI",
    sub: "AI-powered forest monitoring platform",
  };

  const userInitial = user?.name?.trim()?.charAt(0)?.toUpperCase() || "U";
  const unreadCount = notifications.filter((n) => n.unread).length;

  const handleMarkAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, unread: false })));
  };

  const handleLogout = () => {
    setShowUserMenu(false);
    logout();
    navigate("/login");
  };

  return (
    <header
      className="relative z-40 flex-shrink-0 min-h-[72px] flex items-center justify-between gap-4 px-4 sm:px-5 lg:px-7 border-b"
      style={{
        background: "rgba(11, 18, 32, 0.92)",
        borderColor: "var(--bg-border, rgba(148,163,184,0.12))",
        backdropFilter: "blur(14px)",
        WebkitBackdropFilter: "blur(14px)",
      }}
    >
      {/* Left Side: Mobile Menu & Page Title */}
      <div className="flex items-center gap-3 min-w-0">
        <button
          type="button"
          onClick={onMenuClick}
          aria-label="Open navigation menu"
          className="lg:hidden w-10 h-10 flex items-center justify-center rounded-xl border flex-shrink-0 transition-all hover:bg-slate-800/70"
          style={{
            color: "var(--text-secondary, #cbd5e1)",
            background: "rgba(148,163,184,0.04)",
            borderColor: "var(--bg-border, rgba(148,163,184,0.12))",
          }}
        >
          <Menu size={19} />
        </button>

        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h2 className="text-[15px] sm:text-base font-semibold tracking-tight truncate text-white">
              {page.title}
            </h2>
            <span className="hidden sm:inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider text-emerald-400 bg-emerald-500/10 border border-emerald-500/20">
              <span className="relative flex w-1.5 h-1.5">
                <span className="absolute inline-flex w-full h-full rounded-full animate-ping opacity-50 bg-emerald-400" />
                <span className="relative inline-flex w-1.5 h-1.5 rounded-full bg-emerald-400" />
              </span>
              Live
            </span>
          </div>
          <p className="hidden sm:block text-[11px] lg:text-xs mt-0.5 truncate text-slate-400">
            {page.sub}
          </p>
        </div>
      </div>

      {/* Right Side: Notifications & User Profile */}
      <div className="flex items-center gap-3 flex-shrink-0 relative">
        {/* ── Notification Bell Icon ── */}
        <div className="relative">
          <button
            type="button"
            onClick={() => {
              setShowNotifications(!showNotifications);
              setShowUserMenu(false);
            }}
            aria-label="Notifications"
            title="View Forest Alerts"
            className="group relative w-10 h-10 flex items-center justify-center rounded-xl border transition-all duration-200 hover:bg-slate-800/80 active:scale-95"
            style={{
              color: unreadCount > 0 ? "#4ade80" : "var(--text-muted, #94a3b8)",
              background: "rgba(148,163,184,0.035)",
              borderColor: "var(--bg-border, rgba(148,163,184,0.12))",
            }}
          >
            <Bell size={18} className="transition-colors duration-200 group-hover:text-slate-200" />

            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-500 text-[10px] font-extrabold text-white flex items-center justify-center border-2 border-slate-950 shadow-md animate-pulse">
                {unreadCount}
              </span>
            )}
          </button>

          {/* Dropdown Popover */}
          {showNotifications && (
            <div className="absolute right-0 mt-3 w-80 sm:w-96 rounded-2xl bg-slate-950 border border-slate-800 shadow-2xl z-50 overflow-hidden animate-fade-in">
              <div className="p-3.5 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Bell size={15} className="text-emerald-400" />
                  <span className="text-xs font-bold text-white">Forest & Analysis Alerts</span>
                  {unreadCount > 0 && (
                    <span className="px-1.5 py-0.5 rounded-full bg-red-500/20 text-red-400 text-[10px] font-bold">
                      {unreadCount} new
                    </span>
                  )}
                </div>
                {unreadCount > 0 && (
                  <button
                    onClick={handleMarkAllRead}
                    className="text-[11px] text-slate-400 hover:text-emerald-400 transition font-semibold"
                  >
                    Mark all read
                  </button>
                )}
              </div>

              <div className="max-h-80 overflow-y-auto divide-y divide-slate-900">
                {notifications.map((item) => {
                  const Icon = item.icon;
                  return (
                    <div
                      key={item.id}
                      onClick={() => {
                        setShowNotifications(false);
                        navigate(item.link);
                      }}
                      className={`p-3.5 flex items-start gap-3 transition cursor-pointer hover:bg-slate-900/70 ${
                        item.unread ? "bg-slate-900/40" : ""
                      }`}
                    >
                      <div
                        className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5 ${
                          item.type === "critical"
                            ? "bg-red-500/10 text-red-400 border border-red-500/20"
                            : item.type === "success"
                            ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                            : "bg-blue-500/10 text-blue-400 border border-blue-500/20"
                        }`}
                      >
                        <Icon size={16} />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1">
                          <p className={`text-xs font-bold truncate ${item.unread ? "text-slate-100" : "text-slate-400"}`}>
                            {item.title}
                          </p>
                          <span className="text-[10px] text-slate-500 flex-shrink-0">{item.time}</span>
                        </div>
                        <p className="text-[11px] text-slate-400 mt-0.5 leading-snug line-clamp-2">
                          {item.desc}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="p-3 bg-slate-900/90 border-t border-slate-800 text-center">
                <button
                  onClick={() => {
                    setShowNotifications(false);
                    navigate("/alerts");
                  }}
                  className="text-xs font-bold text-emerald-400 hover:text-emerald-300 transition flex items-center justify-center gap-1 w-full"
                >
                  View Alert Command Center <ArrowRight size={13} />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* ── User Account Badge with Interactive Menu Popover ── */}
        <div className="relative">
          <button
            type="button"
            onClick={() => {
              setShowUserMenu(!showUserMenu);
              setShowNotifications(false);
            }}
            className="flex items-center gap-2.5 h-10 pl-1.5 pr-2.5 rounded-xl border transition-all duration-200 hover:bg-slate-800/80 hover:border-emerald-500/30 cursor-pointer"
            style={{
              background: "rgba(148,163,184,0.035)",
              borderColor: showUserMenu ? "rgba(34,197,94,0.4)" : "var(--bg-border, rgba(148,163,184,0.12))",
            }}
          >
            <div
              className="relative w-7 h-7 rounded-lg flex items-center justify-center text-[11px] font-bold text-white flex-shrink-0"
              style={{
                background: "linear-gradient(135deg, #22c55e, #15803d)",
                boxShadow: "0 4px 12px rgba(34,197,94,0.14)",
              }}
            >
              {userInitial}
              <span className="absolute -right-0.5 -bottom-0.5 w-2 h-2 rounded-full border bg-emerald-500 border-slate-950" />
            </div>

            <div className="hidden sm:block text-left min-w-0">
              <p className="max-w-[120px] text-[11px] font-semibold leading-none truncate text-slate-100">
                {user?.name || "Officer"}
              </p>
              <p className="text-[9px] leading-none mt-1 capitalize text-slate-400">
                {user?.role || "Ranger"}
              </p>
            </div>

            <ChevronDown size={14} className={`text-slate-400 transition-transform ${showUserMenu ? "rotate-180 text-emerald-400" : ""}`} />
          </button>

          {/* ── User Account Menu Dropdown Popover ── */}
          {showUserMenu && (
            <div className="absolute right-0 mt-3 w-72 rounded-2xl bg-slate-950 border border-slate-800 shadow-2xl z-50 overflow-hidden animate-fade-in">
              {/* Header Info */}
              <div className="p-4 bg-gradient-to-br from-emerald-950/60 via-slate-900 to-slate-950 border-b border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-green-600 text-white font-bold text-base flex items-center justify-center shadow-lg">
                    {userInitial}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold text-white truncate">{user?.name || "Officer"}</p>
                    <p className="text-[11px] text-slate-400 truncate mt-0.5">{user?.email || "officer@forestguard.org"}</p>
                    <span className="inline-block mt-1 px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20 text-[9px] font-bold text-emerald-400 uppercase">
                      {user?.role || "Forest Administrator"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Menu Links */}
              <div className="p-2 space-y-1 text-xs">
                <button
                  onClick={() => { setShowUserMenu(false); navigate("/settings"); }}
                  className="w-full px-3 py-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-900 flex items-center gap-2.5 transition font-medium"
                >
                  <Settings size={15} className="text-emerald-400" />
                  Account & System Settings
                </button>

                <button
                  onClick={() => { setShowUserMenu(false); navigate("/alerts"); }}
                  className="w-full px-3 py-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-900 flex items-center gap-2.5 transition font-medium"
                >
                  <Bell size={15} className="text-amber-400" />
                  Alert Command Center
                </button>

                <button
                  onClick={() => { setShowUserMenu(false); navigate("/reports"); }}
                  className="w-full px-3 py-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-900 flex items-center gap-2.5 transition font-medium"
                >
                  <FileText size={15} className="text-blue-400" />
                  Evidence PDF Reports
                </button>

                <button
                  onClick={() => { setShowUserMenu(false); navigate("/"); }}
                  className="w-full px-3 py-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-900 flex items-center gap-2.5 transition font-medium"
                >
                  <LayoutDashboard size={15} className="text-purple-400" />
                  Operational Dashboard
                </button>
              </div>

              {/* Footer Sign Out */}
              <div className="p-2 bg-slate-900/60 border-t border-slate-800">
                <button
                  onClick={handleLogout}
                  className="w-full px-3 py-2 rounded-xl text-red-400 hover:bg-red-500/10 flex items-center gap-2.5 transition font-bold text-xs"
                >
                  <LogOut size={15} />
                  Sign Out Account
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Bottom Glow Bar */}
      <div
        className="absolute bottom-0 left-0 right-0 h-px pointer-events-none"
        style={{
          background: "linear-gradient(90deg, transparent, rgba(34,197,94,0.10), transparent)",
        }}
      />
    </header>
  );
}

export default Navbar;
