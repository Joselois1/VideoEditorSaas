import { ButtonHTMLAttributes } from "react";

type Variant = "primary" | "gradient" | "secondary" | "ghost" | "danger";
type Size = "sm" | "md" | "lg";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
}

const variantClasses: Record<Variant, string> = {
  primary:
    "bg-violet-600 hover:bg-violet-500 text-white disabled:bg-violet-900 disabled:text-violet-500 transition-colors",
  gradient:
    "text-white bg-gradient-to-r from-violet-600 via-fuchsia-600 to-orange-500 " +
    "bg-[length:200%_100%] bg-left hover:bg-right shadow-lg shadow-fuchsia-900/40 " +
    "hover:shadow-xl hover:shadow-fuchsia-700/40 disabled:opacity-50 disabled:shadow-none " +
    "transition-all duration-500",
  secondary:
    "bg-zinc-700 hover:bg-zinc-600 text-white disabled:bg-zinc-800 disabled:text-zinc-600 transition-colors",
  ghost:
    "bg-transparent hover:bg-white/10 text-zinc-300 hover:text-white transition-colors",
  danger:
    "bg-red-700 hover:bg-red-600 text-white transition-colors",
};

const sizeClasses: Record<Size, string> = {
  sm: "px-3 py-1.5 text-xs rounded-md",
  md: "px-4 py-2 text-sm rounded-lg",
  lg: "px-6 py-3 text-base rounded-xl",
};

export default function Button({
  variant = "primary",
  size = "md",
  loading = false,
  disabled,
  className = "",
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      disabled={disabled || loading}
      className={`
        inline-flex items-center justify-center gap-2 font-medium
        cursor-pointer disabled:cursor-not-allowed
        ${variantClasses[variant]} ${sizeClasses[size]} ${className}
      `}
      {...props}
    >
      {loading && (
        <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
      )}
      {children}
    </button>
  );
}
