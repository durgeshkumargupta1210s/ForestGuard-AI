import { useState } from "react";

import api from "../../services/api";

import { Lock, Save } from "lucide-react";

function ChangePasswordCard() {
  const [form, setForm] = useState({
    currentPassword: "",

    newPassword: "",

    confirmPassword: "",
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({
      ...form,

      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async () => {
    if (form.newPassword !== form.confirmPassword) {
      alert("Passwords do not match.");

      return;
    }

    try {
      setLoading(true);

      await api.put(
        "/users/change-password",

        {
          currentPassword: form.currentPassword,

          newPassword: form.newPassword,
        },
      );

      alert("Password updated successfully.");

      setForm({
        currentPassword: "",

        newPassword: "",

        confirmPassword: "",
      });
    } catch (error) {
      console.log(error);

      alert(error.response?.data?.message || "Unable to change password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 mt-8">
      <div className="flex items-center gap-3 mb-6">
        <Lock className="text-green-500" size={24} />

        <h2 className="text-2xl font-bold">Change Password</h2>
      </div>

      <div className="space-y-5">
        <div>
          <label className="block mb-2">Current Password</label>

          <input
            type="password"
            name="currentPassword"
            value={form.currentPassword}
            onChange={handleChange}
            className="w-full bg-slate-800 rounded-xl p-3 outline-none"
          />
        </div>

        <div>
          <label className="block mb-2">New Password</label>

          <input
            type="password"
            name="newPassword"
            value={form.newPassword}
            onChange={handleChange}
            className="w-full bg-slate-800 rounded-xl p-3 outline-none"
          />
        </div>

        <div>
          <label className="block mb-2">Confirm Password</label>

          <input
            type="password"
            name="confirmPassword"
            value={form.confirmPassword}
            onChange={handleChange}
            className="w-full bg-slate-800 rounded-xl p-3 outline-none"
          />
        </div>

        <button
          onClick={handleSubmit}
          disabled={loading}
          className="bg-green-600 hover:bg-green-700 px-6 py-3 rounded-xl flex items-center gap-3"
        >
          <Save size={18} />

          {loading ? "Updating..." : "Update Password"}
        </button>
      </div>
    </div>
  );
}

export default ChangePasswordCard;
