function Select({
  label,
  value,
  onChange,
  options = [],
  placeholder = "Select an option",
  error = "",
  helperText = "",
  required = false,
  disabled = false,
  className = "",
}) {
  return (
    <div className="mb-5">
      {label && (
        <label className="block mb-2 text-sm font-medium text-slate-300">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      <select
        value={value}
        onChange={onChange}
        disabled={disabled}
        className={`
          w-full
          rounded-xl
          border
          border-slate-700
          bg-slate-900
          text-white
          px-4
          py-3
          outline-none
          transition
          duration-200
          focus:border-green-500
          disabled:opacity-60
          disabled:cursor-not-allowed
          ${error ? "border-red-500" : ""}
          ${className}
        `}
      >
        <option value="">{placeholder}</option>

        {options.map((option) => (
          <option
            key={option.value}
            value={option.value}
          >
            {option.label}
          </option>
        ))}
      </select>

      {error ? (
        <p className="mt-2 text-xs text-red-500">{error}</p>
      ) : (
        helperText && (
          <p className="mt-2 text-xs text-slate-400">
            {helperText}
          </p>
        )
      )}
    </div>
  );
}

export default Select;