import {
  FileText,
  ShieldCheck,
  AlertTriangle,
  ShieldAlert,
} from "lucide-react";

function ReportStats({

  reports = [],

}) {

  const totalReports = reports.length;

  const safeReports = reports.filter(

    (report) => report.riskLevel === "Safe"

  ).length;

  const warningReports = reports.filter(

    (report) => report.riskLevel === "Warning"

  ).length;

  const criticalReports = reports.filter(

    (report) => report.riskLevel === "Critical"

  ).length;

  const cards = [

    {

      title: "Total Reports",

      value: totalReports,

      icon: FileText,

      color: "bg-blue-600",

    },

    {

      title: "Safe",

      value: safeReports,

      icon: ShieldCheck,

      color: "bg-green-600",

    },

    {

      title: "Warning",

      value: warningReports,

      icon: AlertTriangle,

      color: "bg-yellow-500",

    },

    {

      title: "Critical",

      value: criticalReports,

      icon: ShieldAlert,

      color: "bg-red-600",

    },

  ];

  return (

    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">

      {

        cards.map((card) => (

          <div

            key={card.title}

            className="bg-slate-900 border border-slate-800 rounded-2xl p-6"

          >

            <div className="flex justify-between items-center">

              <div>

                <p className="text-slate-400">

                  {card.title}

                </p>

                <h2 className="text-3xl font-bold mt-2">

                  {card.value}

                </h2>

              </div>

              <div

                className={`${card.color} p-4 rounded-xl`}

              >

                <card.icon

                  size={28}

                  className="text-white"

                />

              </div>

            </div>

          </div>

        ))

      }

    </div>

  );

}

export default ReportStats;