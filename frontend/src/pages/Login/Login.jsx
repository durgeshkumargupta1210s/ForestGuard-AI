import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { Trees, Mail, Lock, Eye, EyeOff, ArrowRight, ShieldCheck, Sparkles, Radar } from "lucide-react";

import { login as loginAPI } from "../../services/auth.service";
import { useAuth } from "../../context/AuthContext";

function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
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
    if (!formData.email.trim() || !formData.password) {
      toast.error("Please fill in both email and password");
      return;
    }

    try {
      setLoading(true);
      const res = await loginAPI(formData);
      // res is { success: true, message: "...", data: { user: {...}, token: "..." } }
      if (res && res.data && res.data.token) {
        login(res.data.user, res.data.token);
        toast.success(`Welcome back, ${res.data.user.name}!`);
        navigate("/");
      } else {
        toast.error("Login failed: Invalid server response");
      }
    } catch (error) {
      const msg = error.normalizedMessage || error.response?.data?.message || "Login failed. Please check your credentials.";
      toast.error(msg);
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
                Secure command center
              </div>

              <div className="mt-8 flex h-16 w-16 items-center justify-center rounded-2xl border border-emerald-400/20 bg-emerald-500/10">
                <Trees size={32} className="text-emerald-300" />
              </div>

              <h1 className="mt-6 text-4xl font-semibold tracking-tight text-white">
                ForestGuard AI
              </h1>
              <p className="mt-3 max-w-lg text-base leading-7 text-slate-300">
                Monitor forest health in real time with satellite intelligence, AI risk detection, and a streamlined response workflow.
              </p>
            </div>

            <div className="space-y-4">
              <div className="flex items-start gap-3 rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur">
                <div className="mt-0.5 rounded-xl bg-emerald-500/15 p-2 text-emerald-300">
                  <Radar size={16} />
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">Live environmental monitoring</p>
                  <p className="mt-1 text-sm text-slate-400">Track risk signals and act early with reliable visual analytics.</p>
                </div>
              </div>

              <div className="flex items-start gap-3 rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur">
                <div className="mt-0.5 rounded-xl bg-emerald-500/15 p-2 text-emerald-300">
                  <Sparkles size={16} />
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">AI-powered decision support</p>
                  <p className="mt-1 text-sm text-slate-400">Get recommendations and instant guidance for high-risk zones.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-center bg-slate-950/70 p-6 sm:p-8 lg:p-10 xl:p-12">
            <div className="w-full max-w-md rounded-[24px] border border-white/10 bg-white/5 p-7 shadow-2xl backdrop-blur-xl sm:p-8">
              <div className="mb-8">
                <p className="text-sm font-semibold uppercase tracking-[0.28em] text-emerald-400">Welcome back</p>
                <h2 className="mt-2 text-2xl font-semibold text-white">
                  Sign in to your workspace
                </h2>
                <p className="mt-2 text-sm leading-6 text-slate-400">
                  Continue monitoring forests with your secure access credentials.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5" noValidate>
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
                      placeholder="••••••••"
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
                      Signing In...
                    </>
                  ) : (
                    <>
                      Sign In
                      <ArrowRight size={16} />
                    </>
                  )}
                </button>

                {/* Quick Demo Credentials Fill Button */}
                <button
                  type="button"
                  onClick={() => {
                    setFormData({ email: "admin@forestguard.org", password: "adminpassword" });
                    toast.success("Demo credentials loaded! Click Sign In or Submit.");
                  }}
                  className="w-full py-2.5 px-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs font-bold text-emerald-400 hover:bg-emerald-500/20 transition flex items-center justify-center gap-1.5"
                >
                  <ShieldCheck size={14} />
                  Auto-Fill Demo Officer Credentials
                </button>
              </form>

              <div className="mt-8 border-t border-white/10 pt-6 text-center text-sm text-slate-400">
                <span>Don’t have an account? </span>
                <Link to="/register" className="font-semibold text-emerald-400 transition hover:text-emerald-300">
                  Create an account
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;