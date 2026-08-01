import {
  TriangleAlert,
  ShieldAlert,
  CheckCircle2,
} from "lucide-react";

function AlertsPanel({ stats }) {

  const critical = stats?.criticalRegions || 0;
  const warning = stats?.warningRegions || 0;

  const safe = Math.max(
    (stats?.totalRegions || 0) - critical - warning,
    0
  );

  const alertItems = [
    {
      title: "Critical Regions",
      count: critical,
      color: "text-red-400",
      bg: "bg-red-500/10",
      icon: TriangleAlert,
    },
    {
      title: "Warning Regions",
      count: warning,
      color: "text-yellow-400",
      bg: "bg-yellow-500/10",
      icon: ShieldAlert,
    },
    {
      title: "Safe Regions",
      count: safe,
      color: "text-green-400",
      bg: "bg-green-500/10",
      icon: CheckCircle2,
    },
  ];

  return (
    <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6 h-full">

      <h2 className="text-xl font-semibold mb-6">

        Active Alerts

      </h2>

      <div className="space-y-4">

        {alertItems.map((item) => (

          <div
            key={item.title}
            className={`flex justify-between items-center p-4 rounded-xl ${item.bg}`}
          >

            <div className="flex items-center gap-3">

              <item.icon
                className={item.color}
                size={22}
              />

              <div>

                <p className="font-medium">

                  {item.title}

                </p>

                <p className="text-sm text-slate-400">

                  Current Status

                </p>

              </div>

            </div>

            <span
              className={`text-2xl font-bold ${item.color}`}
            >

              {item.count}

            </span>

          </div>

        ))}

      </div>

    </div>
  );
}

export default AlertsPanel;