import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Save } from "lucide-react";
import Modal from "../common/Modal";
import { updateRegion } from "../../services/region.service";

function Field({ label, error, required, children }) {
  return (
    <div>
      <label className="block text-sm font-medium mb-1.5" style={{ color: "var(--text-secondary)" }}>
        {label} {required && <span style={{ color: "#f87171" }}>*</span>}
      </label>
      {children}
      {error && <p className="text-xs mt-1" style={{ color: "#f87171" }}>{error}</p>}
    </div>
  );
}

function EditRegionModal({ open, onClose, region, onSuccess }) {
  const [form, setForm]       = useState({});
  const [errors, setErrors]   = useState({});
  const [loading, setLoading] = useState(false);

  // Pre-fill form when region changes
  useEffect(() => {
    if (region) {
      setForm({
        name:      region.name      || "",
        state:     region.state     || "",
        district:  region.district  || "",
        area:      region.area      || "",
        latitude:  region.coordinates?.[0]?.latitude  || "",
        longitude: region.coordinates?.[0]?.longitude || "",
        emailAlertEnabled: region.emailAlertEnabled ?? true,
      });
      setErrors({});
    }
  }, [region]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const validate = () => {
    const errs = {};
    if (!form.name?.trim())       errs.name      = "Region name is required";
    else if (form.name.trim().length < 3) errs.name = "Minimum 3 characters";
    if (!form.state?.trim())      errs.state     = "State is required";
    if (!form.area || Number(form.area) < 0) errs.area = "Valid area required";
    if (form.latitude !== "" && (Number(form.latitude) < -90 || Number(form.latitude) > 90))
      errs.latitude = "Between -90 and 90";
    if (form.longitude !== "" && (Number(form.longitude) < -180 || Number(form.longitude) > 180))
      errs.longitude = "Between -180 and 180";
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }

    setLoading(true);
    try {
      const payload = {
        name:     form.name.trim(),
        state:    form.state.trim(),
        district: form.district.trim(),
        area:     Number(form.area),
        emailAlertEnabled: form.emailAlertEnabled,
      };
      // Only include coordinates if provided
      if (form.latitude !== "" && form.longitude !== "") {
        payload.coordinates = [{
          latitude:  Number(form.latitude),
          longitude: Number(form.longitude),
        }];
      }

      await updateRegion(region._id, payload);
      toast.success(`Region "${form.name.trim()}" updated successfully`);
      onSuccess();
      onClose();
    } catch (error) {
      const msg = error.normalizedMessage || "Failed to update region";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  if (!open || !region) return null;

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Edit Region"
      subtitle={`Updating: ${region.regionId} — ${region.name}`}
      size="lg"
    >
      <form onSubmit={handleSubmit} noValidate>
        <div className="space-y-4">

          {/* Region ID (read-only) */}
          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: "var(--text-secondary)" }}>
              Region ID <span className="text-xs" style={{ color: "var(--text-muted)" }}>(cannot be changed)</span>
            </label>
            <input
              type="text"
              value={region.regionId}
              disabled
              className="fg-input text-sm opacity-50 cursor-not-allowed"
            />
          </div>

          {/* Name */}
          <Field label="Region Name" required error={errors.name}>
            <input
              type="text"
              name="name"
              value={form.name || ""}
              onChange={handleChange}
              placeholder="Enter region name"
              className="fg-input text-sm"
              style={errors.name ? { borderColor: "#ef4444" } : {}}
            />
          </Field>

          {/* State & District */}
          <div className="grid grid-cols-2 gap-4">
            <Field label="State" required error={errors.state}>
              <input
                type="text"
                name="state"
                value={form.state || ""}
                onChange={handleChange}
                placeholder="State"
                className="fg-input text-sm"
                style={errors.state ? { borderColor: "#ef4444" } : {}}
              />
            </Field>
            <Field label="District" error={errors.district}>
              <input
                type="text"
                name="district"
                value={form.district || ""}
                onChange={handleChange}
                placeholder="District (optional)"
                className="fg-input text-sm"
              />
            </Field>
          </div>

          {/* Area */}
          <Field label="Area (km²)" required error={errors.area}>
            <input
              type="number"
              name="area"
              min="0"
              step="0.01"
              value={form.area || ""}
              onChange={handleChange}
              placeholder="Enter area"
              className="fg-input text-sm"
              style={errors.area ? { borderColor: "#ef4444" } : {}}
            />
          </Field>

          {/* Coordinates */}
          <div className="grid grid-cols-2 gap-4">
            <Field label="Latitude" error={errors.latitude}>
              <input
                type="number"
                step="any"
                name="latitude"
                value={form.latitude || ""}
                onChange={handleChange}
                placeholder="-90 to 90"
                className="fg-input text-sm"
                style={errors.latitude ? { borderColor: "#ef4444" } : {}}
              />
            </Field>
            <Field label="Longitude" error={errors.longitude}>
              <input
                type="number"
                step="any"
                name="longitude"
                value={form.longitude || ""}
                onChange={handleChange}
                placeholder="-180 to 180"
                className="fg-input text-sm"
                style={errors.longitude ? { borderColor: "#ef4444" } : {}}
              />
            </Field>
          </div>

          {/* Email Alerts toggle */}
          <div
            className="flex items-center justify-between p-3 rounded-xl"
            style={{ background: "var(--bg-primary)", border: "1px solid var(--bg-border)" }}
          >
            <div>
              <p className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>
                Email Alerts
              </p>
              <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                Receive notifications when risk is detected
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                name="emailAlertEnabled"
                checked={!!form.emailAlertEnabled}
                onChange={handleChange}
                className="sr-only peer"
              />
              <div className="w-10 h-6 rounded-full peer transition-colors"
                   style={{ background: form.emailAlertEnabled ? "var(--green-600)" : "var(--bg-border)" }}>
                <div className="w-4 h-4 bg-white rounded-full shadow-md absolute top-1 transition-transform"
                     style={{ left: form.emailAlertEnabled ? "22px" : "4px" }} />
              </div>
            </label>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 mt-6 pt-5 border-t" style={{ borderColor: "var(--bg-border)" }}>
          <button type="button" onClick={onClose} className="btn btn-secondary">
            Cancel
          </button>
          <button type="submit" disabled={loading} className="btn btn-primary" style={{ background: "#2563eb" }}
            onMouseEnter={(e) => !loading && (e.currentTarget.style.background = "#3b82f6")}
            onMouseLeave={(e) => !loading && (e.currentTarget.style.background = "#2563eb")}
          >
            {loading ? (
              <>
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full inline-block"
                      style={{ animation: "spin 0.75s linear infinite" }} />
                Saving...
              </>
            ) : (
              <><Save size={15} /> Save Changes</>
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
}

export default EditRegionModal;