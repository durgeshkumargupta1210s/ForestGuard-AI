import { useEffect, useRef } from "react";
import { X } from "lucide-react";

/**
 * ForestGuard Reusable Modal
 *
 * Existing props remain supported:
 * - open
 * - onClose
 * - title
 * - subtitle
 * - children
 * - size
 * - hideClose
 *
 * Additional optional props:
 * - footer
 * - closeOnBackdrop
 * - closeOnEscape
 * - showDivider
 * - className
 */

function Modal({
  open,
  onClose,
  title,
  subtitle,
  children,
  size = "md",
  hideClose = false,

  footer = null,

  closeOnBackdrop = true,
  closeOnEscape = true,

  showDivider = true,

  className = "",
}) {
  const modalRef = useRef(null);
  const closeButtonRef = useRef(null);

  /* =========================================================
     Close Modal With Escape
  ========================================================= */

  useEffect(() => {
    if (!open || !closeOnEscape) return;

    const handleEscape = (event) => {
      if (event.key === "Escape") {
        onClose?.();
      }
    };

    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("keydown", handleEscape);
    };
  }, [open, onClose, closeOnEscape]);

  /* =========================================================
     Disable Body Scroll
  ========================================================= */

  useEffect(() => {
    if (!open) return;

    const previousOverflow = document.body.style.overflow;

    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  /* =========================================================
     Focus Close Button
  ========================================================= */

  useEffect(() => {
    if (!open) return;

    const timeout = setTimeout(() => {
      closeButtonRef.current?.focus();
    }, 100);

    return () => clearTimeout(timeout);
  }, [open]);

  /* =========================================================
     Don't Render Closed Modal
  ========================================================= */

  if (!open) return null;

  /* =========================================================
     Sizes
  ========================================================= */

  const sizeMap = {
    sm: "max-w-sm",
    md: "max-w-lg",
    lg: "max-w-2xl",
    xl: "max-w-4xl",
    "2xl": "max-w-6xl",
    full: "max-w-[96vw]",
  };

  /* =========================================================
     Backdrop Click
  ========================================================= */

  const handleBackdropClick = (event) => {
    if (!closeOnBackdrop) return;

    if (event.target === event.currentTarget) {
      onClose?.();
    }
  };

  return (
    <div
      className="
        fixed
        inset-0
        z-[100]
        flex
        items-center
        justify-center
        px-4
        py-6
        overflow-y-auto
      "
      onMouseDown={handleBackdropClick}
      role="presentation"
      style={{
        background: "rgba(2, 6, 23, 0.78)",
        backdropFilter: "blur(8px)",
        WebkitBackdropFilter: "blur(8px)",
        animation: "fg-modal-backdrop-in 180ms ease-out",
      }}
    >
      {/* =====================================================
          Modal
      ===================================================== */}

      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? "fg-modal-title" : undefined}
        aria-describedby={subtitle ? "fg-modal-subtitle" : undefined}
        onMouseDown={(event) => event.stopPropagation()}
        className={`
          relative
          w-full
          ${sizeMap[size] || sizeMap.md}
          ${className}
        `}
        style={{
          maxHeight: "calc(100vh - 48px)",

          background: "var(--bg-card, rgba(15, 23, 42, 0.98))",

          border: "1px solid var(--bg-border, rgba(148, 163, 184, 0.14))",

          borderRadius: "20px",

          boxShadow:
            "0 30px 80px rgba(0, 0, 0, 0.55), 0 0 0 1px rgba(255,255,255,0.02)",

          overflow: "hidden",

          animation: "fg-modal-content-in 220ms cubic-bezier(0.16, 1, 0.3, 1)",
        }}
      >
        {/* Decorative Top Glow */}

        <div
          className="
            absolute
            top-0
            left-1/2
            -translate-x-1/2
            pointer-events-none
          "
          style={{
            width: "70%",
            height: "1px",

            background:
              "linear-gradient(90deg, transparent, rgba(74, 222, 128, 0.75), transparent)",

            boxShadow: "0 0 24px rgba(34, 197, 94, 0.35)",
          }}
        />

        {/* ===================================================
            Header
        =================================================== */}

        {(title || subtitle || !hideClose) && (
          <div
            className="
              relative
              flex
              items-start
              justify-between
              gap-5
              px-6
              py-5
            "
            style={{
              borderBottom: showDivider
                ? "1px solid var(--bg-border, rgba(148,163,184,0.12))"
                : "none",
            }}
          >
            <div className="min-w-0 flex-1">
              {title && (
                <h2
                  id="fg-modal-title"
                  className="
                    text-lg
                    md:text-xl
                    font-semibold
                    tracking-tight
                  "
                  style={{
                    color: "var(--text-primary, #f8fafc)",
                  }}
                >
                  {title}
                </h2>
              )}

              {subtitle && (
                <p
                  id="fg-modal-subtitle"
                  className="
                    text-sm
                    mt-1
                    leading-relaxed
                  "
                  style={{
                    color: "var(--text-muted, #94a3b8)",
                  }}
                >
                  {subtitle}
                </p>
              )}
            </div>

            {!hideClose && (
              <button
                ref={closeButtonRef}
                type="button"
                onClick={onClose}
                aria-label="Close modal"
                className="
                  flex
                  items-center
                  justify-center
                  w-9
                  h-9
                  rounded-xl
                  flex-shrink-0
                  outline-none
                  transition-all
                  duration-200
                  hover:scale-105
                  active:scale-95
                "
                style={{
                  color: "var(--text-muted, #94a3b8)",

                  background: "rgba(148, 163, 184, 0.06)",

                  border: "1px solid rgba(148, 163, 184, 0.08)",
                }}
                onMouseEnter={(event) => {
                  event.currentTarget.style.color = "#f8fafc";

                  event.currentTarget.style.background =
                    "rgba(239, 68, 68, 0.12)";

                  event.currentTarget.style.borderColor =
                    "rgba(239, 68, 68, 0.20)";
                }}
                onMouseLeave={(event) => {
                  event.currentTarget.style.color =
                    "var(--text-muted, #94a3b8)";

                  event.currentTarget.style.background =
                    "rgba(148, 163, 184, 0.06)";

                  event.currentTarget.style.borderColor =
                    "rgba(148, 163, 184, 0.08)";
                }}
              >
                <X size={17} />
              </button>
            )}
          </div>
        )}

        {/* ===================================================
            Body
        =================================================== */}

        <div
          className="
            px-6
            py-5
            overflow-y-auto
          "
          style={{
            maxHeight: footer ? "calc(100vh - 220px)" : "calc(100vh - 150px)",
          }}
        >
          {children}
        </div>

        {/* ===================================================
            Optional Footer
        =================================================== */}

        {footer && (
          <div
            className="
              flex
              flex-col-reverse
              sm:flex-row
              sm:items-center
              sm:justify-end
              gap-3
              px-6
              py-4
            "
            style={{
              borderTop: "1px solid var(--bg-border, rgba(148,163,184,0.12))",

              background: "rgba(15, 23, 42, 0.45)",
            }}
          >
            {footer}
          </div>
        )}
      </div>

      {/* =====================================================
          Animations
      ===================================================== */}

      <style>
        {`
          @keyframes fg-modal-backdrop-in {
            from {
              opacity: 0;
            }

            to {
              opacity: 1;
            }
          }

          @keyframes fg-modal-content-in {
            from {
              opacity: 0;
              transform: translateY(14px) scale(0.97);
            }

            to {
              opacity: 1;
              transform: translateY(0) scale(1);
            }
          }

          @media (prefers-reduced-motion: reduce) {
            [role="dialog"] {
              animation: none !important;
            }
          }
        `}
      </style>
    </div>
  );
}

export default Modal;
