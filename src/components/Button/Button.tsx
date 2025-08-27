import * as React from "react";
import clsx from "clsx";
import { twMerge } from "tailwind-merge";

export type ButtonVariant =
  | "primary" | "secondary" | "success" | "danger" | "warning" | "neutral"
  | "outline" | "ghost";

export type ButtonSize = "sm" | "md" | "lg";

export type ButtonVars = {
  bg?: string;            // پس‌زمینه
  color?: string;         // رنگ متن
  border?: string;        // رنگ بوردر
  hoverBg?: string;       // هاور پس‌زمینه
  hoverColor?: string;    // هاور رنگ متن
  radius?: string | number; // گردی
  px?: string | number;   // پدینگ افقی
  py?: string | number;   // پدینگ عمودی
  ring?: string;          // رنگ ring فوکوس
};

export type ButtonSlotName = "root" | "content" | "iconLeft" | "iconRight" | "spinner";

export type ButtonProps = Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "color"> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  loading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  /** توکن‌ها (قابل Override از بیرون) */
  vars?: ButtonVars;
  /** کلاس‌های اسلات‌ها برای Override ساختاری */
  classNames?: Partial<Record<ButtonSlotName, string>>;
};

/** پالت‌های پیش‌فرض برای Variantها */
const VARS_BY_VARIANT: Record<NonNullable<ButtonProps["variant"]>, Required<Pick<ButtonVars,
  "bg" | "color" | "border" | "hoverBg" | "hoverColor" | "ring" | "radius" | "px" | "py"
>>> = {
  primary:   { bg:"#2563eb", color:"#fff",    border:"transparent", hoverBg:"#1d4ed8", hoverColor:"#fff", ring:"#2563eb", radius:"10px", px:"16px", py:"10px" },
  secondary: { bg:"#6b7280", color:"#fff",    border:"transparent", hoverBg:"#4b5563", hoverColor:"#fff", ring:"#6b7280", radius:"10px", px:"16px", py:"10px" },
  success:   { bg:"#10b981", color:"#fff",    border:"transparent", hoverBg:"#059669", hoverColor:"#fff", ring:"#10b981", radius:"10px", px:"16px", py:"10px" },
  danger:    { bg:"#ef4444", color:"#fff",    border:"transparent", hoverBg:"#dc2626", hoverColor:"#fff", ring:"#ef4444", radius:"10px", px:"16px", py:"10px" },
  warning:   { bg:"#f59e0b", color:"#111827", border:"transparent", hoverBg:"#d97706", hoverColor:"#111827", ring:"#f59e0b", radius:"10px", px:"16px", py:"10px" },
  neutral:   { bg:"#475569", color:"#fff",    border:"transparent", hoverBg:"#334155", hoverColor:"#fff", ring:"#475569", radius:"10px", px:"16px", py:"10px" },
  outline:   { bg:"transparent", color:"#2563eb", border:"#2563eb", hoverBg:"rgba(37,99,235,.08)", hoverColor:"#2563eb", ring:"#2563eb", radius:"10px", px:"16px", py:"10px" },
  ghost:     { bg:"transparent", color:"#111827", border:"transparent", hoverBg:"rgba(0,0,0,.06)", hoverColor:"#111827", ring:"#2563eb", radius:"10px", px:"16px", py:"10px" },
};

const SIZE_CLASS: Record<ButtonSize, string> = {
  sm: "text-xs gap-1.5",
  md: "text-sm gap-2",
  lg: "text-base gap-2.5",
};

export const Button: React.FC<ButtonProps> = ({
  variant = "primary",
  size = "md",
  fullWidth,
  loading,
  leftIcon,
  rightIcon,
  vars,
  classNames,
  className,
  children,
  disabled,
  ...rest
}) => {
  // 1) set CSS variables (variant defaults → overrides)
  const base = VARS_BY_VARIANT[variant];
  const styleVars: React.CSSProperties = {
    ["--btn-bg" as any]: base.bg,
    ["--btn-color" as any]: base.color,
    ["--btn-border" as any]: base.border,
    ["--btn-hover-bg" as any]: base.hoverBg,
    ["--btn-hover-color" as any]: base.hoverColor,
    ["--btn-radius" as any]: base.radius,
    ["--btn-px" as any]: base.px,
    ["--btn-py" as any]: base.py,
    ["--btn-ring" as any]: base.ring,
  };
  if (vars?.bg)         (styleVars as any)["--btn-bg"] = vars.bg;
  if (vars?.color)      (styleVars as any)["--btn-color"] = vars.color;
  if (vars?.border)     (styleVars as any)["--btn-border"] = vars.border;
  if (vars?.hoverBg)    (styleVars as any)["--btn-hover-bg"] = vars.hoverBg;
  if (vars?.hoverColor) (styleVars as any)["--btn-hover-color"] = vars.hoverColor;
  if (vars?.radius)     (styleVars as any)["--btn-radius"] = typeof vars.radius === "number" ? `${vars.radius}px` : vars.radius;
  if (vars?.px)         (styleVars as any)["--btn-px"] = typeof vars.px === "number" ? `${vars.px}px` : vars.px;
  if (vars?.py)         (styleVars as any)["--btn-py"] = typeof vars.py === "number" ? `${vars.py}px` : vars.py;
  if (vars?.ring)       (styleVars as any)["--btn-ring"] = vars.ring;

  // 2) classes (Tailwind v3 + arbitrary values)
  const rootBase =
    "font-ui inline-flex items-center justify-center select-none transition " +
    "focus:outline-none focus-visible:ring-2 " +
    "focus-visible:ring-[var(--btn-ring,#2563eb)] " +
    "border disabled:opacity-50 disabled:cursor-not-allowed";

  const rootLook = clsx(
    "bg-[var(--btn-bg,#2563eb)] text-[var(--btn-color,#fff)] border-[var(--btn-border,transparent)]",
    "hover:bg-[var(--btn-hover-bg,var(--btn-bg,#2563eb))] hover:text-[var(--btn-hover-color,var(--btn-color,#fff))]",
    "rounded-[var(--btn-radius,10px)]",
    "px-[var(--btn-px,16px)] py-[var(--btn-py,10px)]"
  );

  const rootSize = SIZE_CLASS[size];
  const rootWidth = fullWidth ? "w-full" : undefined;

  const rootCn = twMerge(clsx(rootBase, rootLook, rootSize, rootWidth, classNames?.root, className));

  const contentCn = twMerge(clsx("inline-flex items-center", classNames?.content));
  const iconLeftCn = twMerge(clsx("-ms-0.5", classNames?.iconLeft));
  const iconRightCn = twMerge(clsx("-me-0.5", classNames?.iconRight));
  const spinnerCn = twMerge(clsx("ms-2 h-4 w-4 animate-spin", classNames?.spinner));

  return (
    <button
      type="button"
      className={rootCn}
      style={styleVars}
      disabled={disabled || loading}
      {...rest}
    >
      {leftIcon ? <span className={iconLeftCn}>{leftIcon}</span> : null}
      <span className={contentCn}>{children}</span>
      {loading ? (
        <svg viewBox="0 0 24 24" className={spinnerCn} aria-hidden="true">
          <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" fill="none" opacity="0.25"/>
          <path d="M22 12a10 10 0 0 1-10 10" stroke="currentColor" strokeWidth="3" fill="none"/>
        </svg>
      ) : rightIcon ? (
        <span className={iconRightCn}>{rightIcon}</span>
      ) : null}
    </button>
  );
};
