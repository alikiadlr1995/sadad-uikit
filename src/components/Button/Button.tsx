import * as React from "react";
import { twMerge } from "tailwind-merge";
import clsx from "clsx";

export type ButtonVariant =
  | "primary"
  | "secondary"
  | "ghost"
  | "outline"
  | "danger"
  | "link";
export type ButtonSize = "sm" | "md" | "lg" | "icon";
export type ButtonRadius = "none" | "sm" | "md" | "lg" | "xl" | "2xl" | "full";

export type ButtonProps = Omit<
  React.ButtonHTMLAttributes<HTMLButtonElement>,
  "color"
> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
  radius?: ButtonRadius;
  fullWidth?: boolean;
  isLoading?: boolean;
  loadingText?: string;
  leadingIcon?: React.ReactNode;
  trailingIcon?: React.ReactNode;
  fontFamily?: string | string[];
};

const base =
  "inline-flex items-center justify-center font-ui font-medium transition-colors " +
  "focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 " +
  "disabled:cursor-not-allowed";

const sizes: Record<ButtonSize, string> = {
  sm: "h-8 px-3 text-sm gap-1.5",
  md: "h-10 px-4 text-sm gap-2",
  lg: "h-12 px-5 text-base gap-2.5",
  icon: "h-10 w-10 p-0",
};

const radii: Record<ButtonRadius, string> = {
  none: "rounded-none",
  sm: "rounded",
  md: "rounded-md",
  lg: "rounded-lg",
  xl: "rounded-xl",
  "2xl": "rounded-2xl",
  full: "rounded-full",
};

const variants: Record<ButtonVariant, string> = {
  primary:
    "bg-blue-600 text-white hover:bg-blue-700 focus-visible:ring-blue-600 disabled:bg-blue-400",
  secondary:
    "bg-gray-100 text-gray-900 hover:bg-gray-200 focus-visible:ring-gray-400 disabled:bg-gray-100 disabled:text-gray-400",
  ghost:
    "bg-transparent text-gray-900 hover:bg-gray-100 focus-visible:ring-gray-400 disabled:text-gray-400",
  outline:
    "bg-transparent text-gray-900 border border-gray-300 hover:bg-gray-50 focus-visible:ring-gray-400 disabled:text-gray-400 disabled:border-gray-200",
  danger:
    "bg-red-600 text-white hover:bg-red-700 focus-visible:ring-red-600 disabled:bg-red-400",
  link: "bg-transparent text-blue-600 underline-offset-4 hover:underline focus-visible:ring-blue-600 px-0",
};

type CSSVarStyle = React.CSSProperties & { ["--ui-font"]?: string };

const quoteIfNeeded = (name: string) =>
  /\s/.test(name) && !/^["'].*["']$/.test(name) ? `"${name}"` : name;

const toCssFontFamily = (ff?: string | string[]) =>
  !ff
    ? undefined
    : Array.isArray(ff)
      ? ff.map(quoteIfNeeded).join(", ")
      : quoteIfNeeded(ff);

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = "primary",
      size = "md",
      radius = "lg",
      fullWidth,
      isLoading,
      loadingText,
      leadingIcon,
      trailingIcon,
      fontFamily,
      className,
      disabled,
      type, // پیش‌فرض می‌ذاریم button
      children,
      ...rest
    },
    ref
  ) => {
    const composed = twMerge(
      clsx(
        base,
        sizes[size],
        radii[radius],
        variants[variant],
        fullWidth && "w-full",
        isLoading && "pointer-events-none",
        className
      )
    );

    const varStyle: CSSVarStyle = {};
    const cssFont = toCssFontFamily(fontFamily);
    if (cssFont) varStyle["--ui-font"] = cssFont;

    return (
      <button
        ref={ref}
        type={type ?? "button"}
        className={composed}
        disabled={disabled || isLoading}
        aria-busy={isLoading || undefined}
        {...rest}
      >
        {/* Spinner هنگام لود */}
        {isLoading && (
          <svg
            className={twMerge(
              clsx(
                "animate-spin -ml-0.5",
                size === "lg" ? "h-5 w-5" : "h-4 w-4",
                variant === "link" && "mr-2"
              )
            )}
            viewBox="0 0 24 24"
            fill="none"
            aria-hidden="true"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
            />
          </svg>
        )}

        {/* آیکن ابتدای دکمه */}
        {!isLoading && leadingIcon && (
          <span
            className={clsx("inline-flex", size === "sm" ? "-ml-0.5" : "-ml-1")}
          >
            {leadingIcon}
          </span>
        )}

        {/* متن */}
        <span
          className={clsx("whitespace-nowrap", variant === "link" && "px-1")}
        >
          {isLoading ? (loadingText ?? children) : children}
        </span>

        {/* آیکن انتهای دکمه */}
        {!isLoading && trailingIcon && (
          <span
            className={clsx("inline-flex", size === "sm" ? "-mr-0.5" : "-mr-1")}
          >
            {trailingIcon}
          </span>
        )}
      </button>
    );
  }
);

Button.displayName = "Button";
