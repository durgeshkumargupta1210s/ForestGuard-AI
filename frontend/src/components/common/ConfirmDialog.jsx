import { AlertTriangle, Trash2, Info, ShieldAlert } from "lucide-react";

import Modal from "./Modal";
import Button from "./Button";

/**
 * ForestGuard Confirm Dialog
 *
 * Useful for:
 * - Delete Region
 * - Delete Report
 * - Resolve / Delete Alert
 * - Logout confirmation
 * - Other destructive actions
 *
 * Props:
 * open
 * onClose
 * onConfirm
 * title
 * description
 * confirmText
 * cancelText
 * loading
 * variant
 * itemName
 */

function ConfirmDialog({
  open,
  onClose,
  onConfirm,

  title = "Are you sure?",

  description = "This action may not be reversible.",

  confirmText = "Confirm",
  cancelText = "Cancel",

  loading = false,

  variant = "danger",

  itemName = "",
}) {
  /* =========================================================
     Variant Configuration
  ========================================================= */

  const variants = {
    danger: {
      Icon: Trash2,

      iconColor: "#f87171",

      iconBackground: "rgba(239, 68, 68, 0.10)",

      iconBorder: "rgba(239, 68, 68, 0.20)",

      buttonVariant: "danger",
    },

    warning: {
      Icon: AlertTriangle,

      iconColor: "#fbbf24",

      iconBackground: "rgba(245, 158, 11, 0.10)",

      iconBorder: "rgba(245, 158, 11, 0.20)",

      buttonVariant: "primary",
    },

    info: {
      Icon: Info,

      iconColor: "#60a5fa",

      iconBackground: "rgba(59, 130, 246, 0.10)",

      iconBorder: "rgba(59, 130, 246, 0.20)",

      buttonVariant: "primary",
    },

    critical: {
      Icon: ShieldAlert,

      iconColor: "#fb7185",

      iconBackground: "rgba(244, 63, 94, 0.10)",

      iconBorder: "rgba(244, 63, 94, 0.20)",

      buttonVariant: "danger",
    },
  };

  const config = variants[variant] || variants.danger;

  const Icon = config.Icon;

  /* =========================================================
     Confirm Handler
  ========================================================= */

  const handleConfirm = async () => {
    if (loading) return;

    await onConfirm?.();
  };

  /* =========================================================
     Render
  ========================================================= */

  return (
    <Modal
      open={open}
      onClose={loading ? () => {} : onClose}
      size="sm"
      hideClose={loading}
      closeOnBackdrop={!loading}
      closeOnEscape={!loading}
      showDivider={false}
    >
      <div className="text-center">
        {/* ===============================================
            Icon
        =============================================== */}

        <div
          className="
            relative
            w-16
            h-16
            mx-auto
            mb-5
            rounded-2xl
            flex
            items-center
            justify-center
            border
          "
          style={{
            color: config.iconColor,

            background: config.iconBackground,

            borderColor: config.iconBorder,

            boxShadow: `
              0 10px 30px ${config.iconBackground}
            `,
          }}
        >
          <Icon size={27} strokeWidth={1.8} />

          {/* Glow */}

          <div
            className="
              absolute
              inset-0
              rounded-2xl
              pointer-events-none
            "
            style={{
              boxShadow: `
                inset 0 0 20px
                ${config.iconBackground}
              `,
            }}
          />
        </div>

        {/* ===============================================
            Title
        =============================================== */}

        <h2
          className="
            text-xl
            font-semibold
            tracking-tight
          "
          style={{
            color: "var(--text-primary, #f8fafc)",
          }}
        >
          {title}
        </h2>

        {/* ===============================================
            Description
        =============================================== */}

        <p
          className="
            mt-2
            text-sm
            leading-relaxed
          "
          style={{
            color: "var(--text-muted, #94a3b8)",
          }}
        >
          {description}
        </p>

        {/* ===============================================
            Selected Item
        =============================================== */}

        {itemName && (
          <div
            className="
              mt-5
              px-4
              py-3
              rounded-xl
              border
            "
            style={{
              background: "rgba(148, 163, 184, 0.05)",

              borderColor: "var(--bg-border, rgba(148,163,184,0.12))",
            }}
          >
            <p
              className="text-xs mb-1"
              style={{
                color: "var(--text-faint, #64748b)",
              }}
            >
              Selected item
            </p>

            <p
              className="
                text-sm
                font-semibold
                break-words
              "
              style={{
                color: "var(--text-primary, #f8fafc)",
              }}
            >
              {itemName}
            </p>
          </div>
        )}

        {/* ===============================================
            Warning
        =============================================== */}

        {variant === "danger" && (
          <div
            className="
              flex
              items-start
              gap-2.5
              text-left
              mt-5
              px-3
              py-3
              rounded-xl
              border
            "
            style={{
              background: "rgba(239,68,68,0.05)",

              borderColor: "rgba(239,68,68,0.12)",
            }}
          >
            <AlertTriangle
              size={16}
              className="mt-0.5 flex-shrink-0"
              style={{
                color: "#f87171",
              }}
            />

            <p
              className="text-xs leading-relaxed"
              style={{
                color: "var(--text-muted, #94a3b8)",
              }}
            >
              Please make sure you want to continue before confirming this
              action.
            </p>
          </div>
        )}

        {/* ===============================================
            Actions
        =============================================== */}

        <div
          className="
            grid
            grid-cols-1
            sm:grid-cols-2
            gap-3
            mt-6
          "
        >
          <Button
            variant="secondary"
            onClick={onClose}
            disabled={loading}
            fullWidth
          >
            {cancelText}
          </Button>

          <Button
            variant={config.buttonVariant}
            onClick={handleConfirm}
            loading={loading}
            disabled={loading}
            fullWidth
          >
            {confirmText}
          </Button>
        </div>
      </div>
    </Modal>
  );
}

export default ConfirmDialog;
