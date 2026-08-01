import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

/**
 * Production Ready Input Component
 *
 * Props
 * --------------------------------
 * label
 * type
 * name
 * value
 * onChange
 * placeholder
 * required
 * error
 * helperText
 * icon
 * disabled
 * textarea
 * rows
 */

function Input({
  label,
  type = "text",
  name,
  value,
  onChange,
  placeholder = "",
  required = false,
  error = "",
  helperText = "",
  icon: Icon,
  disabled = false,
  textarea = false,
  rows = 4,
}) {
  const [showPassword, setShowPassword] = useState(false);

  const inputType =
    type === "password" ? (showPassword ? "text" : "password") : type;

  return (
    <div className="mb-5">
      {/* Label */}

      {label && (
        <label
          className="block mb-2 text-sm font-medium"
          style={{ color: "var(--text-secondary)" }}
        >
          {label}

          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      {/* Input Wrapper */}

      <div className="relative">
        {/* Left Icon */}

        {Icon && (
          <Icon
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2"
            style={{
              color: "var(--text-muted)",
            }}
          />
        )}

        {/* Textarea */}

        {textarea ? (
          <textarea
            rows={rows}
            name={name}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            disabled={disabled}
            className={`
              w-full
              rounded-xl
              border
              bg-slate-900
              text-white
              px-4
              py-3
              resize-none
              outline-none
              transition-all
              duration-200
              ${Icon ? "pl-11" : ""}
              ${
                error
                  ? "border-red-500"
                  : "border-slate-700 focus:border-green-500"
              }
              ${disabled ? "opacity-60 cursor-not-allowed" : ""}
            `}
          />
        ) : (
          <input
            type={inputType}
            name={name}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            disabled={disabled}
            className={`
              w-full
              rounded-xl
              border
              bg-slate-900
              text-white
              px-4
              py-3
              outline-none
              transition-all
              duration-200
              ${Icon ? "pl-11" : ""}
              ${type === "password" ? "pr-12" : ""}
              ${
                error
                  ? "border-red-500"
                  : "border-slate-700 focus:border-green-500"
              }
              ${disabled ? "opacity-60 cursor-not-allowed" : ""}
            `}
          />
        )}

        {/* Password Toggle */}

        {type === "password" && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2"
            style={{
              color: "var(--text-muted)",
            }}
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        )}
      </div>

      {/* Error */}

      {error ? (
        <p className="text-xs mt-2 text-red-500">{error}</p>
      ) : helperText ? (
        <p
          className="text-xs mt-2"
          style={{
            color: "var(--text-muted)",
          }}
        >
          {helperText}
        </p>
      ) : null}
    </div>
  );
}

export default Input;
