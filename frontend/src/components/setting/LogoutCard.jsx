import { useNavigate } from "react-router-dom";

import {
  LogOut,
} from "lucide-react";

function LogoutCard() {

  const navigate = useNavigate();

  const handleLogout = () => {

    const confirmLogout = window.confirm(

      "Are you sure you want to logout?"

    );

    if (!confirmLogout) return;

    // Remove authentication data

    localStorage.removeItem("token");

    localStorage.removeItem("user");

    sessionStorage.clear();

    // Redirect to login page

    navigate("/login");

  };

  return (

    <div className="bg-slate-900 border border-red-800 rounded-2xl p-8 mt-8">

      <div className="flex items-center justify-between">

        <div>

          <h2 className="text-2xl font-bold text-red-500">

            Logout

          </h2>

          <p className="text-slate-400 mt-2">

            Sign out from your ForestGuard account.

          </p>

        </div>

        <button

          onClick={handleLogout}

          className="bg-red-600 hover:bg-red-700 px-6 py-3 rounded-xl flex items-center gap-3"

        >

          <LogOut size={18} />

          Logout

        </button>

      </div>

    </div>

  );

}

export default LogoutCard;