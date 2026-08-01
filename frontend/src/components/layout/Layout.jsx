import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { Toaster } from "react-hot-toast";

import Sidebar from "./Sidebar";
import Navbar from "./Navbar";

/**
 * ForestGuard Main Application Layout
 *
 * Responsibilities:
 * - Desktop sidebar
 * - Mobile sidebar drawer
 * - Top navigation
 * - Scrollable page content
 * - Global toast notifications
 * - Responsive page spacing
 *
 * Business logic is intentionally kept outside this component.
 */

function Layout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const location = useLocation();

  /* =========================================================
     Close Mobile Sidebar When Route Changes
  ========================================================= */

  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  /* =========================================================
     Prevent Background Scroll While Mobile Sidebar Is Open
  ========================================================= */

  useEffect(() => {
    if (!sidebarOpen) return;

    const previousOverflow = document.body.style.overflow;

    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [sidebarOpen]);

  return (
    <div
      className="
        relative
        flex
        h-screen
        min-h-screen
        w-full
        overflow-hidden
      "
      style={{
        background: "var(--bg-base, #070d18)",
      }}
    >
      {/* =====================================================
          Background Decoration
      ===================================================== */}

      <div
        className="
          fixed
          inset-0
          pointer-events-none
          overflow-hidden
        "
        aria-hidden="true"
      >
        {/* Top Right Glow */}

        <div
          className="
            absolute
            -top-40
            -right-40

            w-[500px]
            h-[500px]

            rounded-full
          "
          style={{
            background:
              "radial-gradient(circle, rgba(34,197,94,0.035), transparent 68%)",

            filter: "blur(10px)",
          }}
        />

        {/* Bottom Left Glow */}

        <div
          className="
            absolute
            -bottom-56
            left-[20%]

            w-[520px]
            h-[520px]

            rounded-full
          "
          style={{
            background:
              "radial-gradient(circle, rgba(59,130,246,0.025), transparent 70%)",

            filter: "blur(20px)",
          }}
        />
      </div>

      {/* =====================================================
          Sidebar
      ===================================================== */}

      <Sidebar
        mobileOpen={sidebarOpen}
        onMobileClose={() => setSidebarOpen(false)}
      />

      {/* =====================================================
          Main Application Area
      ===================================================== */}

      <div
        className="
          relative
          z-10

          flex
          flex-col
          flex-1

          min-w-0
          h-screen

          overflow-hidden
        "
      >
        {/* ===================================================
            Navbar
        =================================================== */}

        <Navbar onMenuClick={() => setSidebarOpen(true)} />

        {/* ===================================================
            Scrollable Page Content
        =================================================== */}

        <main
          id="main-content"
          className="
            relative
            flex-1
            min-h-0

            overflow-y-auto
            overflow-x-hidden

            scroll-smooth
          "
        >
          {/* Page Container */}

          <div
            className="
              relative

              w-full

              px-4
              py-5

              sm:px-5
              sm:py-6

              lg:px-7
              lg:py-7

              xl:px-8
              xl:py-8

              animate-fade-in
            "
          >
            {children}
          </div>

          {/* Bottom Space */}

          <div className="h-4" />
        </main>
      </div>

      {/* =====================================================
          Global Toast Notifications
      ===================================================== */}

      <Toaster
        position="top-right"
        gutter={10}
        containerStyle={{
          top: 88,
          right: 20,
        }}
        toastOptions={{
          duration: 3500,

          style: {
            background: "rgba(15, 23, 42, 0.97)",

            color: "#f1f5f9",

            border: "1px solid rgba(148, 163, 184, 0.16)",

            borderRadius: "14px",

            fontSize: "13px",

            fontFamily: "Inter, system-ui, sans-serif",

            boxShadow: "0 16px 45px rgba(0,0,0,0.45)",

            padding: "12px 15px",

            backdropFilter: "blur(12px)",

            WebkitBackdropFilter: "blur(12px)",
          },

          success: {
            iconTheme: {
              primary: "#22c55e",
              secondary: "#0f172a",
            },
          },

          error: {
            iconTheme: {
              primary: "#ef4444",
              secondary: "#0f172a",
            },
          },

          loading: {
            iconTheme: {
              primary: "#60a5fa",
              secondary: "#0f172a",
            },
          },
        }}
      />
    </div>
  );
}

export default Layout;
