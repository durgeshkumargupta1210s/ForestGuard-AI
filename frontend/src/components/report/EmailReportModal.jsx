import { useState } from "react";

import api from "../../services/api";

import {
  Mail,
  X,
} from "lucide-react";

function EmailReportModal({

  open,

  onClose,

  report,

}) {

  const [loading, setLoading] = useState(false);

  if (!open || !report) return null;

  const handleSend = async () => {

    try {

      setLoading(true);

      await api.post(

        `/reports/${report._id}/email`

      );

      alert("Report sent successfully.");

      onClose();

    }

    catch (error) {

      console.log(error);

      alert("Unable to send email.");

    }

    finally {

      setLoading(false);

    }

  };

  return (

    <div className="fixed inset-0 bg-black/60 flex justify-center items-center z-50">

      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-[500px] p-8">

        <div className="flex justify-between items-center mb-6">

          <h2 className="text-2xl font-bold flex items-center gap-3">

            <Mail className="text-green-500"/>

            Email Report

          </h2>

          <button onClick={onClose}>

            <X/>

          </button>

        </div>

        <p className="text-slate-300">

          Send the report for

          <span className="font-bold text-white">

            {" "}

            {report.region?.name}

          </span>

          to the registered email address?

        </p>

        <div className="flex justify-end gap-4 mt-8">

          <button

            onClick={onClose}

            className="px-5 py-3 rounded-xl bg-slate-700"

          >

            Cancel

          </button>

          <button

            onClick={handleSend}

            disabled={loading}

            className="px-5 py-3 rounded-xl bg-green-600 hover:bg-green-700"

          >

            {

              loading

              ?

              "Sending..."

              :

              "Send Email"

            }

          </button>

        </div>

      </div>

    </div>

  );

}

export default EmailReportModal;