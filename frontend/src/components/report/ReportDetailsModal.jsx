import {
  X,
  FileText,
  MapPinned,
  ShieldAlert,
  Trees,
  Target,
  CalendarDays,
  Bot,
} from "lucide-react";

function ReportDetailsModal({

  open,

  onClose,

  report,

}) {

  if (!open || !report) return null;

  return (

    <div className="fixed inset-0 bg-black/70 flex justify-center items-center z-50">

      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-[900px] max-h-[90vh] overflow-y-auto p-8">

        {/* Header */}

        <div className="flex justify-between items-center mb-8">

          <div>

            <h2 className="text-3xl font-bold">

              Report Details

            </h2>

            <p className="text-slate-400">

              ForestGuard AI Report

            </p>

          </div>

          <button

            onClick={onClose}

          >

            <X size={28} />

          </button>

        </div>

        {/* Information */}

        <div className="grid grid-cols-2 gap-6">

          <div className="bg-slate-800 rounded-xl p-5">

            <div className="flex items-center gap-3 mb-2">

              <MapPinned className="text-green-500" />

              <span className="font-semibold">

                Region

              </span>

            </div>

            <p>

              {report.region?.name}

            </p>

          </div>

          <div className="bg-slate-800 rounded-xl p-5">

            <div className="flex items-center gap-3 mb-2">

              <ShieldAlert className="text-red-500" />

              <span className="font-semibold">

                Risk Level

              </span>

            </div>

            <p>

              {report.riskLevel}

            </p>

          </div>

          <div className="bg-slate-800 rounded-xl p-5">

            <div className="flex items-center gap-3 mb-2">

              <Trees className="text-green-500" />

              <span className="font-semibold">

                NDVI

              </span>

            </div>

            <p>

              {report.ndvi}

            </p>

          </div>

          <div className="bg-slate-800 rounded-xl p-5">

            <div className="flex items-center gap-3 mb-2">

              <Target className="text-blue-400" />

              <span className="font-semibold">

                Confidence

              </span>

            </div>

            <p>

              {report.confidenceScore}%

            </p>

          </div>

        </div>

        {/* AI Summary */}

        <div className="mt-8 bg-slate-800 rounded-xl p-6">

          <div className="flex items-center gap-3 mb-4">

            <Bot className="text-yellow-400" />

            <h3 className="text-xl font-semibold">

              Gemini AI Summary

            </h3>

          </div>

          <p className="leading-8 text-slate-300">

            {

              report.explainability?.summary ||

              "No AI explanation available."

            }

          </p>

        </div>

        {/* Date */}

        <div className="mt-8 bg-slate-800 rounded-xl p-5">

          <div className="flex items-center gap-3">

            <CalendarDays className="text-cyan-400" />

            <span className="font-semibold">

              Generated On

            </span>

          </div>

          <p className="mt-3">

            {

              new Date(

                report.createdAt

              ).toLocaleString()

            }

          </p>

        </div>

        {/* Footer */}

        <div className="flex justify-end mt-8">

          <button

            onClick={onClose}

            className="bg-green-600 hover:bg-green-700 px-6 py-3 rounded-xl"

          >

            Close

          </button>

        </div>

      </div>

    </div>

  );

}

export default ReportDetailsModal;