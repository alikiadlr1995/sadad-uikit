import React from "react";

export type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "ghost";
  rounded?: number;
};

export const Button: React.FC<ButtonProps> = ({
  variant = "primary",
  rounded,
  style,
  children,
  ...rest
}) => {
  const base: React.CSSProperties = {
    fontFamily: "var(--ui-font)",
    padding: "10px 16px",
    borderRadius: rounded ?? 12,
    border: "1px solid transparent",
    cursor: "pointer",
    fontSize: 14,
    lineHeight: 1.2
  };

  const variants: Record<NonNullable<ButtonProps["variant"]>, React.CSSProperties> = {
    primary: { background: "var(--ui-primary)", color: "#fff" },
    ghost: { background: "transparent", color: "var(--ui-text)", borderColor: "rgba(0,0,0,.12)" }
  };

  return (
    <button style={{ ...base, ...variants[variant], ...style }} {...rest}>
      {children}
    </button>
  );
};
