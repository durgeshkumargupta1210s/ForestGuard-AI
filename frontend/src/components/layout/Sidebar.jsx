import {
  LayoutDashboard,
  MapPinned,
  FileSearch,
  FileText,
  Bell,
  Settings,
  LogOut,
  Trees,
  ChevronRight,
  X,
  ShieldCheck,
  Clock,
  Sliders,
  Sparkles,
} from "lucide-react";

import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

/* =========================================================
   Navigation
========================================================= */

const NAV_ITEMS = [
  {
    title: "Dashboard",
    path: "/",
    icon: LayoutDashboard,
  },
  {
    title: "Analysis",
    path: "/analysis",
    icon: FileSearch,
  },
  {
    title: "Time-Lapse",
    path: "/timelapse",
    icon: Clock,
  },
  {
    title: "Comparison Mode",
    path: "/compare",
    icon: Sliders,
  },
  {
    title: "AI Explainability",
    path: "/explainability",
    icon: Sparkles,
  },
  {
    title: "Reports",
    path: "/reports",
    icon: FileText,
  },
  {
    title: "Alerts",
    path: "/alerts",
    icon: Bell,
  },
  {
    title: "Settings",
    path: "/settings",
    icon: Settings,
  },
];

/* =========================================================
   Sidebar
========================================================= */

function Sidebar({ mobileOpen = false, onMobileClose }) {
  const navigate = useNavigate();

  const { user, logout } = useAuth();

  /* =========================================================
     Logout
  ========================================================= */

  const handleLogout = () => {
    logout();

    navigate("/login");

    onMobileClose?.();
  };

  /* =========================================================
     Close Sidebar After Mobile Navigation
  ========================================================= */

  const handleNavigation = () => {
    onMobileClose?.();
  };

  /* =========================================================
     User Initial
  ========================================================= */

  const userInitial = user?.name?.trim()?.charAt(0)?.toUpperCase() || "U";

  return (
    <>
      {/* =====================================================
          Mobile Backdrop
      ===================================================== */}

      {mobileOpen && (
        <div
          className="
            fixed
            inset-0
            z-40
            bg-slate-950/75
            backdrop-blur-sm
            lg:hidden
          "
          onClick={onMobileClose}
          aria-hidden="true"
        />
      )}

      {/* =====================================================
          Sidebar
      ===================================================== */}

      <aside
        className={`
          fixed
          lg:static
          inset-y-0
          left-0
          z-50

          w-[270px]
          flex-shrink-0

          flex
          flex-col

          border-r

          transition-transform
          duration-300
          ease-out

          lg:translate-x-0

          ${mobileOpen ? "translate-x-0" : "-translate-x-full"}
        `}
        style={{
          background:
            "linear-gradient(180deg, var(--bg-primary, #0b1220) 0%, #0a101c 100%)",

          borderColor: "var(--bg-border, rgba(148,163,184,0.12))",

          boxShadow: "8px 0 30px rgba(0,0,0,0.08)",
        }}
      >
        {/* ===================================================
            Decorative Background
        =================================================== */}

        <div
          className="
            absolute
            top-0
            left-0
            right-0
            h-52
            pointer-events-none
            overflow-hidden
          "
        >
          <div
            className="
              absolute
              -top-20
              -left-16
              w-56
              h-56
              rounded-full
            "
            style={{
              background:
                "radial-gradient(circle, rgba(34,197,94,0.08), transparent 70%)",

              filter: "blur(10px)",
            }}
          />
        </div>

        {/* ===================================================
            Logo
        =================================================== */}

        <div
          className="
            relative
            flex
            items-center
            gap-3
            px-5
            h-[76px]
            border-b
          "
          style={{
            borderColor: "var(--bg-border, rgba(148,163,184,0.12))",
          }}
        >
          {/* Logo Icon */}

          <div
            className="
              relative
              w-10
              h-10
              flex
              items-center
              justify-center
              rounded-xl
              flex-shrink-0
            "
            style={{
              background:
                "linear-gradient(145deg, rgba(34,197,94,0.18), rgba(34,197,94,0.06))",

              border: "1px solid rgba(74,222,128,0.20)",

              boxShadow: "0 6px 24px rgba(34,197,94,0.10)",
            }}
          >
            <Trees
              size={21}
              strokeWidth={1.9}
              style={{
                color: "#4ade80",
              }}
            />

            <span
              className="
                absolute
                -right-0.5
                -bottom-0.5
                w-2.5
                h-2.5
                rounded-full
                border-2
              "
              style={{
                background: "#22c55e",
                borderColor: "#0b1220",
              }}
            />
          </div>

          {/* Brand */}

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <h1
                className="
                  text-[17px]
                  font-bold
                  tracking-tight
                "
                style={{
                  color: "var(--text-primary, #f8fafc)",
                }}
              >
                ForestGuard AI
              </h1>

              <span
                className="
                  hidden
                  xl:inline-flex
                  px-1.5
                  py-0.5
                  rounded-md
                  text-[9px]
                  font-bold
                  uppercase
                  tracking-wider
                "
                style={{
                  color: "#4ade80",
                  background: "rgba(34,197,94,0.08)",
                  border: "1px solid rgba(34,197,94,0.14)",
                }}
              >
                AI
              </span>
            </div>

            <p
              className="
                text-[11px]
                mt-0.5
                truncate
              "
              style={{
                color: "var(--text-muted, #64748b)",
              }}
            >
              Real-Time Forest Monitoring
            </p>
          </div>

          {/* Mobile Close */}

          <button
            type="button"
            onClick={onMobileClose}
            aria-label="Close navigation"
            className="
              lg:hidden

              w-9
              h-9

              flex
              items-center
              justify-center

              rounded-xl

              transition-all
              duration-200

              hover:bg-slate-800
            "
            style={{
              color: "var(--text-muted, #94a3b8)",
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* ===================================================
            Platform Status
        =================================================== */}

        <div className="relative px-4 pt-5 pb-2">
          <div
            className="
              flex
              items-center
              gap-3
              px-3
              py-2.5
              rounded-xl
              border
            "
            style={{
              background: "rgba(34,197,94,0.045)",

              borderColor: "rgba(34,197,94,0.10)",
            }}
          >
            <div
              className="
                w-8
                h-8
                rounded-lg
                flex
                items-center
                justify-center
              "
              style={{
                background: "rgba(34,197,94,0.09)",
              }}
            >
              <ShieldCheck
                size={16}
                style={{
                  color: "#4ade80",
                }}
              />
            </div>

            <div className="flex-1 min-w-0">
              <p
                className="
                  text-[11px]
                  font-semibold
                "
                style={{
                  color: "var(--text-secondary, #cbd5e1)",
                }}
              >
                Mission Control
              </p>

              <div className="flex items-center gap-1.5 mt-0.5">
                <span
                  className="
                    relative
                    flex
                    w-1.5
                    h-1.5
                  "
                >
                  <span
                    className="
                      absolute
                      inline-flex
                      w-full
                      h-full
                      rounded-full
                      animate-ping
                      opacity-50
                    "
                    style={{
                      background: "#22c55e",
                    }}
                  />

                  <span
                    className="
                      relative
                      inline-flex
                      w-1.5
                      h-1.5
                      rounded-full
                    "
                    style={{
                      background: "#22c55e",
                    }}
                  />
                </span>

                <span
                  className="text-[10px]"
                  style={{
                    color: "#4ade80",
                  }}
                >
                  Operational
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* ===================================================
            Navigation
        =================================================== */}

        <nav
          className="
            relative
            flex-1
            px-3
            pt-4
            pb-4
            overflow-y-auto
          "
        >
          <p
            className="
              px-3
              mb-2.5

              text-[10px]
              font-bold

              uppercase
              tracking-[0.16em]
            "
            style={{
              color: "var(--text-faint, #475569)",
            }}
          >
            Workspace
          </p>

          <div className="space-y-1">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;

              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  end={item.path === "/"}
                  onClick={handleNavigation}
                  className={({ isActive }) =>
                    `
                      relative

                      group

                      flex
                      items-center
                      gap-3

                      min-h-[44px]

                      px-3
                      py-2.5

                      rounded-xl

                      text-sm
                      font-medium

                      transition-all
                      duration-200

                      ${isActive ? "" : "hover:bg-slate-800/55"}
                    `
                  }
                  style={({ isActive }) => ({
                    color: isActive ? "#f8fafc" : "var(--text-muted, #94a3b8)",

                    background: isActive
                      ? "linear-gradient(90deg, rgba(34,197,94,0.13), rgba(34,197,94,0.045))"
                      : "transparent",

                    border: isActive
                      ? "1px solid rgba(74,222,128,0.10)"
                      : "1px solid transparent",

                    boxShadow: isActive ? "inset 3px 0 0 #22c55e" : "none",
                  })}
                >
                  {({ isActive }) => (
                    <>
                      {/* Icon Container */}

                      <div
                        className="
                          w-8
                          h-8

                          flex
                          items-center
                          justify-center

                          rounded-lg

                          transition-all
                          duration-200

                          group-hover:scale-105
                        "
                        style={{
                          background: isActive
                            ? "rgba(34,197,94,0.10)"
                            : "rgba(148,163,184,0.035)",
                        }}
                      >
                        <Icon
                          size={17}
                          strokeWidth={1.9}
                          style={{
                            color: isActive ? "#4ade80" : "currentColor",
                          }}
                        />
                      </div>

                      {/* Name */}

                      <span className="flex-1">{item.title}</span>

                      {/* Active Indicator */}

                      {isActive && (
                        <ChevronRight
                          size={14}
                          style={{
                            color: "#4ade80",
                            opacity: 0.7,
                          }}
                        />
                      )}
                    </>
                  )}
                </NavLink>
              );
            })}
          </div>
        </nav>

        {/* ===================================================
            User Section
        =================================================== */}

        <div
          className="
            relative
            p-3
            border-t
          "
          style={{
            borderColor: "var(--bg-border, rgba(148,163,184,0.12))",
          }}
        >


          {/* Logout */}

          <button
            type="button"
            onClick={handleLogout}
            className="
              group

              w-full

              flex
              items-center
              gap-3

              px-3
              py-2.5

              rounded-xl

              text-sm
              font-medium

              transition-all
              duration-200

              hover:bg-red-500/[0.07]

              active:scale-[0.98]
            "
            style={{
              color: "#f87171",
            }}
          >
            <div
              className="
                w-8
                h-8

                flex
                items-center
                justify-center

                rounded-lg

                transition-colors
                duration-200

                group-hover:bg-red-500/[0.08]
              "
            >
              <LogOut size={16} />
            </div>

            <span>Sign Out</span>
          </button>
        </div>
      </aside>
    </>
  );
}

export default Sidebar;
