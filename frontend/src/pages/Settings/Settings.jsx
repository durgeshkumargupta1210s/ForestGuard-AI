import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import Layout from "../../components/layout/Layout";
import api from "../../services/api";

import {
  User, Mail, Bell, Save, Lock, Eye, EyeOff, LogOut, Trash2,
  Sliders, Radio, Cpu, ShieldCheck, FileText, Database, Key, Sparkles, Server, CheckCircle2, AlertTriangle
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";

// ── Reusable Tab Button ───────────────────────────────────────
function TabBtn({ active, onClick, icon: Icon, children }) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2.5 text-xs font-semibold rounded-xl flex items-center gap-2 transition-all ${
        active
          ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 shadow-md"
          : "bg-slate-900/60 text-slate-400 border border-slate-800 hover:bg-slate-900 hover:text-slate-200"
      }`}
    >
      {Icon && <Icon size={14} className={active ? "text-emerald-400" : "text-slate-400"} />}
      {children}
    </button>
  );
}

// ── Section Card ─────────────────────────────────────────────
function SectionCard({ title, subtitle, icon: Icon, children }) {
  return (
    <div className="fg-card p-6 space-y-4">
      <div className="flex items-center gap-3 pb-3 border-b border-slate-800">
        {Icon && (
          <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <Icon size={18} />
          </div>
        )}
        <div>
          <h2 className="text-base font-bold text-white">{title}</h2>
          {subtitle && <p className="text-xs text-slate-400 mt-0.5">{subtitle}</p>}
        </div>
      </div>
      {children}
    </div>
  );
}

// ── FormField ────────────────────────────────────────────────
function FormField({ label, icon: Icon, children }) {
  return (
    <div className="mb-4">
      <label className="flex items-center gap-2 text-xs font-semibold text-slate-300 mb-1.5">
        {Icon && <Icon size={14} className="text-slate-400" />}
        {label}
      </label>
      {children}
    </div>
  );
}

function Settings() {
  const { user: authUser, logout } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState("profile");
  const [user, setUser]           = useState(null);
  const [profileLoading, setProfileLoading] = useState(false);
  const [pwLoading,      setPwLoading]      = useState(false);
  const [showOld,        setShowOld]        = useState(false);
  const [showNew,        setShowNew]        = useState(false);

  // Settings State
  const [profileForm, setProfileForm] = useState({ name: "", email: "", department: "Forest Protection Bureau", notifications: true });
  const [surveillanceForm, setSurveillanceForm] = useState({ interval: "60", riskThreshold: "30", emailAlerts: true, aiSummaries: true });
  const [pwForm, setPwForm] = useState({ oldPassword: "", newPassword: "", confirm: "" });
  const [pwErrors, setPwErrors] = useState({});

  useEffect(() => {
    api.get("/users/profile")
      .then((res) => {
        const p = res.data.data;
        setUser(p);
        setProfileForm({ name: p.name || "", email: p.email || "", department: "Forest Protection Bureau", notifications: p.notifications ?? true });
      })
      .catch(() => {});
  }, []);

  const handleProfileChange = (e) => {
    const { name, value, type, checked } = e.target;
    setProfileForm((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
  };

  const handleSaveProfile = async () => {
    if (!profileForm.name.trim()) { toast.error("Name cannot be empty"); return; }
    setProfileLoading(true);
    try {
      await api.put("/users/profile", profileForm);
      toast.success("Profile updated successfully");
    } catch (err) {
      toast.error(err.normalizedMessage || "Failed to update profile");
    } finally {
      setProfileLoading(false);
    }
  };

  const handleSaveSurveillance = () => {
    toast.success("Automated Surveillance & Email Preferences Saved!");
  };

  const handlePwChange = (e) => {
    const { name, value } = e.target;
    setPwForm((prev) => ({ ...prev, [name]: value }));
    if (pwErrors[name]) setPwErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleSavePassword = async () => {
    const errs = {};
    if (!pwForm.oldPassword) errs.oldPassword = "Current password required";
    if (!pwForm.newPassword) errs.newPassword = "New password required";
    else if (pwForm.newPassword.length < 6) errs.newPassword = "Minimum 6 characters";
    if (pwForm.newPassword !== pwForm.confirm) errs.confirm = "Passwords do not match";
    if (Object.keys(errs).length > 0) { setPwErrors(errs); return; }

    setPwLoading(true);
    try {
      await api.put("/users/change-password", {
        currentPassword: pwForm.oldPassword,
        newPassword:     pwForm.newPassword,
      });
      toast.success("Password changed successfully");
      setPwForm({ oldPassword: "", newPassword: "", confirm: "" });
    } catch (err) {
      toast.error(err.normalizedMessage || "Failed to change password");
    } finally {
      setPwLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <Layout>
      <div className="space-y-6">
        <header>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <Sliders className="text-emerald-400" size={24} />
            System Control & Platform Settings
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Manage user accounts, automated satellite surveillance schedules, AI model engines, and security protocols.
          </p>
        </header>

        {/* Navigation Tabs */}
        <div className="flex gap-2 flex-wrap pb-2 border-b border-slate-800">
          <TabBtn active={activeTab === "profile"} onClick={() => setActiveTab("profile")} icon={User}>Profile</TabBtn>
          <TabBtn active={activeTab === "surveillance"} onClick={() => setActiveTab("surveillance")} icon={Radio}>Surveillance & Alerts</TabBtn>
          <TabBtn active={activeTab === "reports"} onClick={() => setActiveTab("reports")} icon={FileText}>PDF Reports</TabBtn>
          <TabBtn active={activeTab === "password"} onClick={() => setActiveTab("password")} icon={Key}>Security</TabBtn>
          <TabBtn active={activeTab === "account"} onClick={() => setActiveTab("account")} icon={ShieldCheck}>Account</TabBtn>
        </div>

        {/* ── 1. Profile Tab ── */}
        {activeTab === "profile" && (
          <div className="space-y-4">
            <div className="fg-card p-6 flex items-center gap-5">
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-bold bg-gradient-to-br from-emerald-500 to-green-600 text-white shadow-lg">
                {(user?.name || authUser?.name || "U").charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="text-lg font-bold text-white">{user?.name || "Officer"}</p>
                <p className="text-xs text-slate-400">{user?.email || "officer@forestguard.org"}</p>
                <div className="flex items-center gap-2 mt-2">
                  <span className="badge badge-info text-[10px] font-bold uppercase">{user?.role || "Forest Administrator"}</span>
                  <span className="text-[11px] text-emerald-400 font-semibold flex items-center gap-1">
                    <CheckCircle2 size={12} /> Active Ranger Account
                  </span>
                </div>
              </div>
            </div>

            <SectionCard title="Profile & Department Information" subtitle="Update your personal officer profile details" icon={User}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField label="Full Name" icon={User}>
                  <input type="text" name="name" value={profileForm.name} onChange={handleProfileChange} className="fg-input text-xs" />
                </FormField>
                <FormField label="Official Email Address" icon={Mail}>
                  <input type="email" name="email" value={profileForm.email} onChange={handleProfileChange} className="fg-input text-xs" />
                </FormField>
              </div>
              <FormField label="Assigned Department / Bureau" icon={ShieldCheck}>
                <input type="text" name="department" value={profileForm.department} onChange={handleProfileChange} className="fg-input text-xs" />
              </FormField>
              <button onClick={handleSaveProfile} disabled={profileLoading} className="btn btn-primary text-xs py-2 px-4 flex items-center gap-2">
                {profileLoading ? "Saving..." : <><Save size={14} /> Save Profile Details</>}
              </button>
            </SectionCard>
          </div>
        )}

        {/* ── 2. Surveillance & Alerts Tab ── */}
        {activeTab === "surveillance" && (
          <SectionCard title="Automated Satellite Surveillance & Email Dispatch" subtitle="Configure periodic orbit polling & alert thresholds" icon={Radio}>
            <div className="space-y-4 text-xs">
              <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-300 font-bold mb-1.5">Automated Polling Interval</label>
                  <select
                    value={surveillanceForm.interval}
                    onChange={(e) => setSurveillanceForm({ ...surveillanceForm, interval: e.target.value })}
                    className="w-full h-10 px-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 outline-none"
                  >
                    <option value="30">Every 30 Minutes (High-Frequency)</option>
                    <option value="60">Every 1 Hour (Recommended Standard)</option>
                    <option value="180">Every 3 Hours</option>
                    <option value="360">Every 6 Hours</option>
                    <option value="1440">Every 24 Hours</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1.5">High-Risk Loss Threshold</label>
                  <select
                    value={surveillanceForm.riskThreshold}
                    onChange={(e) => setSurveillanceForm({ ...surveillanceForm, riskThreshold: e.target.value })}
                    className="w-full h-10 px-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 outline-none"
                  >
                    <option value="15">15% Biomass Loss (Sensitive Threshold)</option>
                    <option value="25">25% Biomass Loss (Warning Threshold)</option>
                    <option value="30">30% Biomass Loss (Critical Standard)</option>
                    <option value="40">40% Biomass Loss (Emergency Level Only)</option>
                  </select>
                </div>
              </div>

              {/* Toggles */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between p-4 rounded-xl bg-slate-900/80 border border-slate-800">
                  <div>
                    <p className="font-bold text-white">Emergency Email Alerts (`namitgmaps73@gmail.com`)</p>
                    <p className="text-slate-400 mt-0.5">Send non-technical email alerts directly when vegetation loss &ge; threshold</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={surveillanceForm.emailAlerts}
                    onChange={(e) => setSurveillanceForm({ ...surveillanceForm, emailAlerts: e.target.checked })}
                    className="w-4 h-4 accent-emerald-500 cursor-pointer"
                  />
                </div>

                <div className="flex items-center justify-between p-4 rounded-xl bg-slate-900/80 border border-slate-800">
                  <div>
                    <p className="font-bold text-white">Plain-Language AI Explainability Narratives</p>
                    <p className="text-slate-400 mt-0.5">Include non-technical AI explainability summaries in email alerts for park rangers</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={surveillanceForm.aiSummaries}
                    onChange={(e) => setSurveillanceForm({ ...surveillanceForm, aiSummaries: e.target.checked })}
                    className="w-4 h-4 accent-emerald-500 cursor-pointer"
                  />
                </div>
              </div>

              <button onClick={handleSaveSurveillance} className="btn btn-primary text-xs py-2 px-4 flex items-center gap-2 mt-2">
                <Save size={14} /> Save Surveillance Configuration
              </button>
            </div>
          </SectionCard>
        )}



        {/* ── 4. Reports Tab ── */}
        {activeTab === "reports" && (
          <SectionCard title="Automated Evidence PDF Report Settings" subtitle="Configure report branding, retention, and export options" icon={FileText}>
            <div className="space-y-4 text-xs">
              <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-300 font-bold mb-1.5">PDF Watermark Branding</label>
                  <input type="text" value="OFFICIAL GOVERNMENT EVIDENCE - FORESTGUARD SURVEILLANCE" readOnly className="fg-input text-xs bg-slate-950 text-slate-400" />
                </div>
                <div>
                  <label className="block text-slate-300 font-bold mb-1.5">Report Auto-Archiving Period</label>
                  <select className="w-full h-10 px-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 outline-none">
                    <option value="90">90 Days Active Storage</option>
                    <option value="180">180 Days Active Storage</option>
                    <option value="365">1 Year Retention</option>
                    <option value="forever">Permanent Storage</option>
                  </select>
                </div>
              </div>
              <button onClick={() => toast.success("PDF Report preferences updated!")} className="btn btn-primary text-xs py-2 px-4 flex items-center gap-2">
                <Save size={14} /> Save Report Settings
              </button>
            </div>
          </SectionCard>
        )}

        {/* ── 5. Security Tab ── */}
        {activeTab === "password" && (
          <SectionCard title="Change Password & Security Protocols" subtitle="Keep your administrator account secure" icon={Key}>
            <div className="max-w-md space-y-4 text-xs">
              <div className="relative">
                <label className="block font-bold text-slate-300 mb-1">Current Password</label>
                <input type={showOld ? "text" : "password"} name="oldPassword" value={pwForm.oldPassword} onChange={handlePwChange} placeholder="Enter current password" className="fg-input text-xs pr-10" />
                <button type="button" onClick={() => setShowOld(!showOld)} className="absolute right-3 top-7 text-slate-400">{showOld ? <EyeOff size={14} /> : <Eye size={14} />}</button>
                {pwErrors.oldPassword && <p className="text-red-400 text-[11px] mt-1">{pwErrors.oldPassword}</p>}
              </div>

              <div className="relative">
                <label className="block font-bold text-slate-300 mb-1">New Password</label>
                <input type={showNew ? "text" : "password"} name="newPassword" value={pwForm.newPassword} onChange={handlePwChange} placeholder="At least 6 characters" className="fg-input text-xs pr-10" />
                <button type="button" onClick={() => setShowNew(!showNew)} className="absolute right-3 top-7 text-slate-400">{showNew ? <EyeOff size={14} /> : <Eye size={14} />}</button>
                {pwErrors.newPassword && <p className="text-red-400 text-[11px] mt-1">{pwErrors.newPassword}</p>}
              </div>

              <div>
                <label className="block font-bold text-slate-300 mb-1">Confirm New Password</label>
                <input type="password" name="confirm" value={pwForm.confirm} onChange={handlePwChange} placeholder="Repeat new password" className="fg-input text-xs" />
                {pwErrors.confirm && <p className="text-red-400 text-[11px] mt-1">{pwErrors.confirm}</p>}
              </div>

              <button onClick={handleSavePassword} disabled={pwLoading} className="btn btn-primary text-xs py-2 px-4 flex items-center gap-2">
                {pwLoading ? "Changing..." : <><Lock size={14} /> Change Password</>}
              </button>
            </div>
          </SectionCard>
        )}

        {/* ── 6. Account Tab ── */}
        {activeTab === "account" && (
          <div className="space-y-4">
            <SectionCard title="Sign Out Session" subtitle="End active session" icon={LogOut}>
              <p className="text-xs text-slate-400 mb-4">You will be securely logged out and returned to the login page.</p>
              <button onClick={handleLogout} className="btn bg-red-500/10 text-red-400 border border-red-500/20 text-xs py-2 px-4 flex items-center gap-2">
                <LogOut size={14} /> Sign Out Account
              </button>
            </SectionCard>

            <div className="fg-card p-6 border border-red-500/20 space-y-3">
              <h3 className="text-base font-bold text-red-400 flex items-center gap-2"><AlertTriangle size={16} /> Danger Zone</h3>
              <p className="text-xs text-slate-400">Irreversible system actions. Proceed with caution.</p>
              <button onClick={() => toast.error("Account deletion requires system super-admin authorization.")} className="btn btn-danger text-xs py-2 px-4 flex items-center gap-2">
                <Trash2 size={14} /> Request Account Deletion
              </button>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}

export default Settings;
