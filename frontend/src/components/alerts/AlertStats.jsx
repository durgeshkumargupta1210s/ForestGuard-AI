import {
  Bell,
  ShieldAlert,
  AlertTriangle,
  CheckCircle2,
} from "lucide-react";

function AlertStats({ alerts = [] }) {

  /* =========================================================
     NORMALIZE ALERT DATA
  ========================================================= */

  const getRiskLevel = (alert) => {
    const risk =
      alert?.riskLevel ||
      alert?.riskClassification?.riskLevel ||
      alert?.riskClassification?.level ||
      "";

    return String(risk).toLowerCase();
  };

  const isResolved = (alert) => {
    return (
      alert?.resolved === true ||
      String(alert?.status || "").toLowerCase() === "resolved"
    );
  };

  /* =========================================================
     CALCULATE STATISTICS
  ========================================================= */

  const totalAlerts = alerts.length;

  const criticalAlerts = alerts.filter((alert) => {
    const risk = getRiskLevel(alert);

    return risk === "critical" || risk === "high";
  }).length;

  const warningAlerts = alerts.filter((alert) => {
    const risk = getRiskLevel(alert);

    return risk === "warning" || risk === "medium";
  }).length;

  const resolvedAlerts = alerts.filter((alert) =>
    isResolved(alert)
  ).length;

  /* =========================================================
     STAT CARDS
  ========================================================= */

  const cards = [
    {
      title: "Total Alerts",
      value: totalAlerts,
      icon: Bell,
      iconColor: "#60a5fa",
      background: "rgba(59,130,246,0.10)",
      border: "rgba(59,130,246,0.20)",
    },

    {
      title: "Critical",
      value: criticalAlerts,
      icon: ShieldAlert,
      iconColor: "#f87171",
      background: "rgba(239,68,68,0.10)",
      border: "rgba(239,68,68,0.20)",
    },

    {
      title: "Warning",
      value: warningAlerts,
      icon: AlertTriangle,
      iconColor: "#fbbf24",
      background: "rgba(245,158,11,0.10)",
      border: "rgba(245,158,11,0.20)",
    },

    {
      title: "Resolved",
      value: resolvedAlerts,
      icon: CheckCircle2,
      iconColor: "#4ade80",
      background: "rgba(34,197,94,0.10)",
      border: "rgba(34,197,94,0.20)",
    },
  ];

  /* =========================================================
     UI
  ========================================================= */

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">

      {cards.map((card) => {
        const Icon = card.icon;

        return (
          <div
            key={card.title}
            className="fg-card p-5 transition-all duration-200"
          >
            <div className="flex justify-between items-center">

              {/* Statistics */}

              <div>
                <p
                  className="text-xs font-medium"
                  style={{
                    color: "var(--text-muted)",
                  }}
                >
                  {card.title}
                </p>

                <h2
                  className="text-3xl font-bold mt-2"
                  style={{
                    color: "var(--text-primary)",
                  }}
                >
                  {card.value}
                </h2>
              </div>

              {/* Icon */}

              <div
                className="
                  w-12
                  h-12
                  flex
                  items-center
                  justify-center
                  rounded-xl
                "
                style={{
                  background: card.background,
                  border: `1px solid ${card.border}`,
                }}
              >
                <Icon
                  size={22}
                  style={{
                    color: card.iconColor,
                  }}
                />
              </div>

            </div>

            {/* Small status indicator */}

            <div className="mt-4 flex items-center gap-2">

              <span
                className="w-1.5 h-1.5 rounded-full"
                style={{
                  background: card.iconColor,
                }}
              />

              <span
                className="text-[11px]"
                style={{
                  color: "var(--text-muted)",
                }}
              >
                {card.title === "Total Alerts"
                  ? "All detected alerts"
                  : card.title === "Critical"
                    ? "High priority alerts"
                    : card.title === "Warning"
                      ? "Require monitoring"
                      : "Completed alerts"}
              </span>

            </div>

          </div>
        );
      })}

    </div>
  );
}

export default AlertStats;