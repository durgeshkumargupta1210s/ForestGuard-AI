import { useState } from "react";
import { useNavigate } from "react-router-dom";

import api from "../../services/api";

import {
  Trash2,
  AlertTriangle,
} from "lucide-react";

function DeleteAccountCard() {

  const navigate = useNavigate();

  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {

    if (!password) {

      alert("Please enter your password.");

      return;

    }

    const confirmed = window.confirm(

      "This action is permanent. Do you want to continue?"

    );

    if (!confirmed) return;

    try {

      setLoading(true);

      await api.delete(

        "/users/account",

        {

          data: {

            password,

          },

        }

      );

      localStorage.removeItem("token");

      localStorage.removeItem("user");

      sessionStorage.clear();

      alert("Account deleted successfully.");

      navigate("/login");

    }

    catch (error) {

      console.log(error);

      alert(

        error.response?.data?.message ||

        "Unable to delete account."

      );

    }

    finally {

      setLoading(false);

    }

  };

  return (

    <div className="bg-slate-900 border border-red-700 rounded-2xl p-8 mt-8">

      <div className="flex items-center gap-3 mb-6">

        <AlertTriangle

          className="text-red-500"

          size={30}

        />

        <h2 className="text-2xl font-bold text-red-500">

          Delete Account

        </h2>

      </div>

      <p className="text-slate-400 mb-6">

        Deleting your account is permanent. All your
        analyses, reports, alerts, and profile data
        will be removed permanently.

      </p>

      <div className="mb-6">

        <label className="block mb-2">

          Confirm Password

        </label>

        <input

          type="password"

          value={password}

          onChange={(e)=>setPassword(e.target.value)}

          className="w-full bg-slate-800 rounded-xl p-3 outline-none"

          placeholder="Enter your password"

        />

      </div>

      <button

        onClick={handleDelete}

        disabled={loading}

        className="bg-red-600 hover:bg-red-700 px-6 py-3 rounded-xl flex items-center gap-3"

      >

        <Trash2 size={18} />

        {

          loading

          ?

          "Deleting..."

          :

          "Delete Account"

        }

      </button>

    </div>

  );

}

export default DeleteAccountCard;