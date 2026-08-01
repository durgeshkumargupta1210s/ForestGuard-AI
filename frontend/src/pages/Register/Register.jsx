import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { Trees, User, Mail, Lock, Eye, EyeOff, ArrowRight, ShieldCheck, Sparkles, Radar } from "lucide-react";

import { register as registerAPI } from "../../services/auth.service";

function Register() {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast.error("Full name is required");
      return;
    }
    if (!formData.email.trim()) {
      toast.error("Email address is required");
      return;
    }
    if (!formData.password || formData.password.length < 6) {
      toast.error("Password must be at least 6 characters long");
      return;
    }

    try {
      setLoading(true);
      const res = await registerAPI({
        name: formData.name.trim(),
        email: formData.email.trim(),
        password: formData.password,
      });

      if (res && (res.success || res.data)) {
        toast.success("Account created successfully! Please log in.");
        navigate("/login");
      } else {
        toast.error("Registration failed");
      }
    } catch (error) {
      const status = error?.response?.status;
      const msg =
        error?.normalizedMessage ||
        error?.response?.data?.message ||
        error?.message ||
        "Registration failed";

      if (status === 409) {
        toast.error("This email is already registered. Please sign in or use another email.");
      } else {
        toast.error(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4 py-8 sm:px-6 lg:px-8"
      style={{
        background: "radial-gradient(circle at top left, rgba(34,197,94,0.16), transparent 28%), var(--bg-base)",
      }}
    >
      <div className="w-full max-w-6xl overflow-hidden rounded-[30px] border shadow-[0_30px_80px_rgba(15,23,42,0.25)]"
           style={{ background: "rgba(2, 6, 23, 0.78)", borderColor: "var(--bg-border)" }}>
        <div className="grid lg:grid-cols-[1.05fr_0.95fr]">
          <div className="hidden lg:flex flex-col justify-between bg-gradient-to-br from-emerald-950 via-slate-950 to-slate-900 p-10 xl:p-12">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.28em] text-emerald-300">
                <ShieldCheck size={14} />
                Join the mission
              </div>

              <div className="mt-8 flex h-16 w-16 items-center justify-center rounded-2xl border border-emerald-400/20 bg-emerald-500/10">
                <Trees size={32} className="text-emerald-300" />
              </div>

              <h1 className="mt-6 text-4xl font-semibold tracking-tight text-white">
                Build your ForestGuard account
              </h1>
              <p className="mt-3 max-w-lg text-base leading-7 text-slate-300">
                Create secure access to launch AI-assisted monitoring, risk reviews, and rapid intervention workflows for protected ecosystems.
              </p>
            </div>

            <div className="space-y-4">
              <div className="flex items-start gap-3 rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur">
                <div className="mt-0.5 rounded-xl bg-emerald-500/15 p-2 text-emerald-300">
                  <Radar size={16} />
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">Early-warning readiness</p>
                  <p className="mt-1 text-sm text-slate-400">Stay ahead of fire, drought, and encroachment with proactive situational insights.</p>
                </div>
              </div>

              <div className="flex items-start gap-3 rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur">
                <div className="mt-0.5 rounded-xl bg-emerald-500/15 p-2 text-emerald-300">
                  <Sparkles size={16} />
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">Collaborative operations</p>
                  <p className="mt-1 text-sm text-slate-400">Coordinate teams with consistent, intelligent reporting for every intervention.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-center bg-slate-950/70 p-6 sm:p-8 lg:p-10 xl:p-12">
            <div className="w-full max-w-md rounded-[24px] border border-white/10 bg-white/5 p-7 shadow-2xl backdrop-blur-xl sm:p-8">
              <div className="mb-8">
                <p className="text-sm font-semibold uppercase tracking-[0.28em] text-emerald-400">Create account</p>
                <h2 className="mt-2 text-2xl font-semibold text-white">
                  Start protecting forests today
                </h2>
                <p className="mt-2 text-sm leading-6 text-slate-400">
                  Set up your workspace and access AI-driven environmental intelligence.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5" noValidate>
                <div>
                  <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">
                    Full name
                  </label>
                  <div className="relative">
                    <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="John Doe"
                      className="fg-input w-full pl-10 text-sm"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">
                    Email address
                  </label>
                  <div className="relative">
                    <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="name@organization.org"
                      className="fg-input w-full pl-10 text-sm"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">
                    Password
                  </label>
                  <div className="relative">
                    <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="At least 6 characters"
                      className="fg-input w-full pl-10 pr-10 text-sm"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-white"
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="btn btn-primary flex w-full items-center justify-center gap-2 py-3 text-sm font-semibold shadow-lg"
                >
                  {loading ? (
                    <>
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                      Creating Account...
                    </>
                  ) : (
                    <>
                      Create Account
                      <ArrowRight size={16} />
                    </>
                  )}
                </button>
              </form>

              <div className="mt-8 border-t border-white/10 pt-6 text-center text-sm text-slate-400">
                <span>Already have an account? </span>
                <Link to="/login" className="font-semibold text-emerald-400 transition hover:text-emerald-300">
                  Sign in
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Register;