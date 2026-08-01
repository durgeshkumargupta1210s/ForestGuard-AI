import { useState } from "react";
import toast from "react-hot-toast";
import { MapPinned, Plus } from "lucide-react";
import Modal from "../common/Modal";
import { createRegion } from "../../services/region.service";

const EMPTY_FORM = {
  regionId: "",
  name: "",
  state: "",
  district: "",
  area: "",
  latitude: "",
  longitude: "",
};

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

function AddRegionModal({ open, onClose, onSuccess }) {
  const [form, setForm]     = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    // Clear field error on change
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  // Client-side validation
  const validate = () => {
    const errs = {};
    if (!form.regionId.trim())        errs.regionId  = "Region ID is required";
    else if (!/^[A-Z0-9]+$/i.test(form.regionId.trim())) errs.regionId = "Only letters and numbers allowed";
    if (!form.name.trim())            errs.name      = "Region name is required";
    else if (form.name.trim().length < 3) errs.name  = "Name must be at least 3 characters";
    if (!form.state.trim())           errs.state     = "State is required";
    if (!form.area || Number(form.area) < 0) errs.area = "Valid area is required";
    if (!form.latitude)               errs.latitude  = "Latitude is required";
    else if (Number(form.latitude) < -90 || Number(form.latitude) > 90)  errs.latitude = "Must be between -90 and 90";
    if (!form.longitude)              errs.longitude = "Longitude is required";
    else if (Number(form.longitude) < -180 || Number(form.longitude) > 180) errs.longitude = "Must be between -180 and 180";
    return errs;
  };

  const handleClose = () => {
    setForm(EMPTY_FORM);
    setErrors({});
    onClose();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }

    setLoading(true);
    try {
      await createRegion({
        regionId:    form.regionId.trim().toUpperCase(),
        name:        form.name.trim(),
        state:       form.state.trim(),
        district:    form.district.trim(),
        area:        Number(form.area),
        coordinates: [{ latitude: Number(form.latitude), longitude: Number(form.longitude) }],
      });
      toast.success(`Region "${form.name.trim()}" created successfully`);
      handleClose();
      onSuccess();
    } catch (error) {
      const msg = error.normalizedMessage || "Failed to create region";
      if (msg.toLowerCase().includes("already exists")) {
        setErrors({ regionId: "This Region ID already exists" });
      }
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title="Add New Region"
      subtitle="Register a new forest region for monitoring"
      size="lg"
    >
      <form onSubmit={handleSubmit} noValidate>
        <div className="space-y-4">

          {/* Region ID */}
          <Field label="Region ID" required error={errors.regionId}>
            <input
              type="text"
              name="regionId"
              value={form.regionId}
              onChange={handleChange}
              placeholder="e.g. MP001"
              className="fg-input text-sm"
              style={errors.regionId ? { borderColor: "#ef4444" } : {}}
            />
          </Field>

          {/* Name */}
          <Field label="Region Name" required error={errors.name}>
            <input
              type="text"
              name="name"
              value={form.name}
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
                value={form.state}
                onChange={handleChange}
                placeholder="e.g. Madhya Pradesh"
                className="fg-input text-sm"
                style={errors.state ? { borderColor: "#ef4444" } : {}}
              />
            </Field>
            <Field label="District" error={errors.district}>
              <input
                type="text"
                name="district"
                value={form.district}
                onChange={handleChange}
                placeholder="e.g. Bhopal"
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
              value={form.area}
              onChange={handleChange}
              placeholder="Enter area in km²"
              className="fg-input text-sm"
              style={errors.area ? { borderColor: "#ef4444" } : {}}
            />
          </Field>

          {/* Coordinates */}
          <div>
            <p className="text-sm font-medium mb-2" style={{ color: "var(--text-secondary)" }}>
              Coordinates <span style={{ color: "#f87171" }}>*</span>
            </p>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Latitude" error={errors.latitude}>
                <input
                  type="number"
                  step="any"
                  name="latitude"
                  value={form.latitude}
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
                  value={form.longitude}
                  onChange={handleChange}
                  placeholder="-180 to 180"
                  className="fg-input text-sm"
                  style={errors.longitude ? { borderColor: "#ef4444" } : {}}
                />
              </Field>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 mt-6 pt-5 border-t" style={{ borderColor: "var(--bg-border)" }}>
          <button type="button" onClick={handleClose} className="btn btn-secondary">
            Cancel
          </button>
          <button type="submit" disabled={loading} className="btn btn-primary">
            {loading ? (
              <>
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full inline-block"
                      style={{ animation: "spin 0.75s linear infinite" }} />
                Creating...
              </>
            ) : (
              <><Plus size={15} /> Create Region</>
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
}

export default AddRegionModal;