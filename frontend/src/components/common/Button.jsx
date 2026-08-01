import { Spinner } from "./Loader";

/**
 * Production Ready Button Component
 *
 * Props
 * -----------------------------
 * children
 * variant
 * size
 * icon
 * loading
 * disabled
 * fullWidth
 * onClick
 * type
 * className
 */

function Button({
  children,
  variant = "primary",
  size = "md",
  icon: Icon,
  loading = false,
  disabled = false,
  fullWidth = false,
  type = "button",
  onClick,
  className = "",
}) {
  const variants = {
    primary:
      "bg-green-600 hover:bg-green-700 text-white shadow-lg shadow-green-600/20",

    secondary: "bg-slate-700 hover:bg-slate-600 text-white",

    outline:
      "border border-slate-600 hover:border-green-500 bg-transparent hover:bg-green-500/10 text-slate-200",

    ghost: "bg-transparent hover:bg-slate-800 text-slate-300",

    danger:
      "bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-red-600/20",
  };

  const sizes = {
    sm: "h-9 px-3 text-sm",

    md: "h-11 px-5 text-sm",

    lg: "h-12 px-6 text-base",
  };

  return (
    <button
      type={type}
      disabled={disabled || loading}
      onClick={onClick}
      className={`
        inline-flex
        items-center
        justify-center
        gap-2
        rounded-xl
        font-semibold
        transition-all
        duration-200
        active:scale-95
        disabled:opacity-60
        disabled:cursor-not-allowed
        ${variants[variant]}
        ${sizes[size]}
        ${fullWidth ? "w-full" : ""}
        ${className}
      `}
    >
      {loading ? (
        <>
          <Spinner size={18} color="white" />
          Please wait...
        </>
      ) : (
        <>
          {Icon && <Icon size={18} />}
          {children}
        </>
      )}
    </button>
  );
}

export default Button;
