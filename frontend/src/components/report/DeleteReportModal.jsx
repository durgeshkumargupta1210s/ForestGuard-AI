import api from "../../services/api";

function DeleteReportModal({

  open,

  onClose,

  report,

  onSuccess,

}) {

  if (!open || !report) return null;

  const handleDelete = async () => {

    try {

      await api.delete(

        `/reports/${report._id}`

      );

      onSuccess();

      onClose();

    }

    catch (error) {

      console.log(error);

      alert("Unable to delete report.");

    }

  };

  return (

    <div className="fixed inset-0 bg-black/60 flex justify-center items-center z-50">

      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-[500px] p-8">

        <h2 className="text-2xl font-bold text-red-500">

          Delete Report

        </h2>

        <p className="text-slate-300 mt-5">

          Are you sure you want to delete the report for

          <span className="font-bold text-white">

            {" "}

            {report.region?.name}

          </span>

          ?

        </p>

        <p className="text-slate-500 mt-2">

          This action cannot be undone.

        </p>

        <div className="flex justify-end gap-4 mt-8">

          <button

            onClick={onClose}

            className="px-5 py-3 rounded-xl bg-slate-700 hover:bg-slate-600"

          >

            Cancel

          </button>

          <button

            onClick={handleDelete}

            className="px-5 py-3 rounded-xl bg-red-600 hover:bg-red-700"

          >

            Delete Report

          </button>

        </div>

      </div>

    </div>

  );

}

export default DeleteReportModal;