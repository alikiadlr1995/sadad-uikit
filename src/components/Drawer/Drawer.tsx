import * as React from "react";
import { createPortal } from "react-dom";
import clsx from "clsx";
import { twMerge } from "tailwind-merge";

export type DrawerPlacement = "right" | "left" | "top" | "bottom";
export type DrawerVariant =
  | "primary" | "secondary" | "success" | "danger" | "warning" | "neutral";

export type DrawerVars = {
  overlayBg?: string;        
  panelBg?: string;        
  panelColor?: string;      
  radius?: string | number; 
  shadow?: string;           
  ring?: string;             
  borderColor?: string;      
  size?: string | number;    
  zIndex?: number;          
};

export type DrawerSlotName =
  | "root" | "overlay" | "panel"
  | "header" | "title" | "description"
  | "body" | "footer" | "close";

export type DrawerProps = {
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;

  placement?: DrawerPlacement;     
  variant?: DrawerVariant;        

  title?: React.ReactNode;
  description?: React.ReactNode;
  header?: React.ReactNode;
  footer?: React.ReactNode;
  showClose?: boolean;

  overlay?: boolean;               
  closeOnOverlayClick?: boolean;   
  escToClose?: boolean;           
  trapFocus?: boolean;             
  returnFocus?: boolean;           
  initialFocusRef?: React.RefObject<HTMLElement>;


  portal?: boolean;             
  getContainer?: () => HTMLElement | null;

  vars?: DrawerVars;                                   
  classNames?: Partial<Record<DrawerSlotName, string>>;
  panelProps?: React.HTMLAttributes<HTMLDivElement>;
  overlayProps?: React.HTMLAttributes<HTMLDivElement>;
  id?: string;                
  dir?: "rtl" | "ltr";

  children?: React.ReactNode;
};

const VARS_BY_VARIANT: Record<DrawerVariant, Required<Pick<DrawerVars,
  "ring" | "panelBg" | "panelColor" | "overlayBg" | "radius" | "shadow" | "borderColor"
>>> = {
  primary:   { ring:"#2563eb", panelBg:"#fff", panelColor:"#111827", overlayBg:"rgba(0,0,0,.5)", radius:"16px", shadow:"0 20px 60px rgba(0,0,0,.15)", borderColor:"#e5e7eb" },
  secondary: { ring:"#6b7280", panelBg:"#fff", panelColor:"#111827", overlayBg:"rgba(17,24,39,.55)", radius:"16px", shadow:"0 20px 60px rgba(0,0,0,.18)", borderColor:"#e5e7eb" },
  success:   { ring:"#10b981", panelBg:"#fff", panelColor:"#0f172a", overlayBg:"rgba(2,6,23,.55)",  radius:"16px", shadow:"0 20px 60px rgba(0,0,0,.18)", borderColor:"#e5e7eb" },
  danger:    { ring:"#ef4444", panelBg:"#fff", panelColor:"#0f172a", overlayBg:"rgba(2,6,23,.6)",   radius:"16px", shadow:"0 20px 60px rgba(0,0,0,.20)", borderColor:"#e5e7eb" },
  warning:   { ring:"#f59e0b", panelBg:"#fff", panelColor:"#111827", overlayBg:"rgba(0,0,0,.5)",    radius:"16px", shadow:"0 20px 60px rgba(0,0,0,.18)", borderColor:"#fde68a" },
  neutral:   { ring:"#475569", panelBg:"#fff", panelColor:"#111827", overlayBg:"rgba(0,0,0,.5)",    radius:"16px", shadow:"0 20px 60px rgba(0,0,0,.15)", borderColor:"#e2e8f0" },
};

const focusableSelector = [
  "a[href]", "area[href]", "input:not([disabled])", "select:not([disabled])",
  "textarea:not([disabled])", "button:not([disabled])", "iframe", "object", "embed",
  "[tabindex]:not([tabindex='-1'])", "[contenteditable]"
].join(",");

export const Drawer: React.FC<DrawerProps> = ({
  open,
  defaultOpen = false,
  onOpenChange,
  placement = "right",
  variant = "neutral",

  title,
  description,
  header,
  footer,
  showClose = true,

  overlay = true,
  closeOnOverlayClick = true,
  escToClose = true,
  trapFocus = true,
  returnFocus = true,
  initialFocusRef,

  portal = true,
  getContainer,

  vars,
  classNames,
  panelProps,
  overlayProps,
  id,
  dir = "rtl",
  children,
}) => {
  const controlled = open !== undefined;
  const [internalOpen, setInternalOpen] = React.useState(defaultOpen);
  const isOpen = controlled ? !!open : internalOpen;

  const setOpen = (v: boolean) => {
    if (!controlled) setInternalOpen(v);
    onOpenChange?.(v);
  };

  // keep/restore focus
  const lastActiveRef = React.useRef<HTMLElement | null>(null);
  const panelRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (isOpen) {
      lastActiveRef.current = document.activeElement as HTMLElement | null;
      const toFocus = initialFocusRef?.current ?? panelRef.current;
      toFocus?.focus();
    } else if (returnFocus && lastActiveRef.current) {
      lastActiveRef.current.focus?.();
    }
  }, [isOpen]);

  // ESC close + focus trap
  React.useEffect(() => {
    if (!isOpen) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape" && escToClose) {
        e.stopPropagation();
        setOpen(false);
      }
      if (trapFocus && e.key === "Tab") {
        const root = panelRef.current;
        if (!root) return;
        const nodes = Array.from(root.querySelectorAll<HTMLElement>(focusableSelector))
          .filter(el => el.offsetParent !== null || el === document.activeElement);
        if (nodes.length === 0) { e.preventDefault(); return; }
        const first = nodes[0], last = nodes[nodes.length - 1];
        if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
        else if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      }
    }
    document.addEventListener("keydown", onKey, true);
    return () => document.removeEventListener("keydown", onKey, true);
  }, [isOpen, escToClose, trapFocus]);

  // vars: variant → overrides
  const v = VARS_BY_VARIANT[variant];
  const styleVars: React.CSSProperties = {
    ["--dr-overlay-bg" as any]: v.overlayBg,
    ["--dr-panel-bg" as any]:   v.panelBg,
    ["--dr-panel-color" as any]:v.panelColor,
    ["--dr-radius" as any]:     v.radius,
    ["--dr-shadow" as any]:     v.shadow,
    ["--dr-ring" as any]:       v.ring,
    ["--dr-border" as any]:     v.borderColor,
    ["--dr-size" as any]:       "28rem", 
    ["--dr-z" as any]:          50
  };
  if (vars?.overlayBg)  (styleVars as any)["--dr-overlay-bg"] = vars.overlayBg;
  if (vars?.panelBg)    (styleVars as any)["--dr-panel-bg"] = vars.panelBg;
  if (vars?.panelColor) (styleVars as any)["--dr-panel-color"] = vars.panelColor;
  if (vars?.radius)     (styleVars as any)["--dr-radius"] = typeof vars.radius === "number" ? `${vars.radius}px` : vars.radius;
  if (vars?.shadow)     (styleVars as any)["--dr-shadow"] = vars.shadow;
  if (vars?.ring)       (styleVars as any)["--dr-ring"] = vars.ring;
  if (vars?.borderColor)(styleVars as any)["--dr-border"] = vars.borderColor;
  if (vars?.size)       (styleVars as any)["--dr-size"] = typeof vars.size === "number" ? `${vars.size}px` : vars.size;
  if (vars?.zIndex !== undefined) (styleVars as any)["--dr-z"] = vars.zIndex;

  // placement classes
  const isH = placement === "right" || placement === "left";
  const translateClosed =
    placement === "right" ? "translate-x-full"
    : placement === "left" ? "-translate-x-full"
    : placement === "top" ? "-translate-y-full"
    : "translate-y-full";

  const sizeStyle =
    isH ? "w-[var(--dr-size,28rem)] h-full"
        : "h-[var(--dr-size,28rem)] w-full";

  const cornerRadius =
    placement === "right" ? "rounded-l-[var(--dr-radius,16px)]"
    : placement === "left" ? "rounded-r-[var(--dr-radius,16px)]"
    : placement === "top" ? "rounded-b-[var(--dr-radius,16px)]"
    : "rounded-t-[var(--dr-radius,16px)]";

  const rootCn = twMerge(clsx(
    "font-ui fixed inset-0",
    isOpen ? "pointer-events-auto" : "pointer-events-none",
    classNames?.root
  ));

  const overlayCn = twMerge(clsx(
    "absolute inset-0 transition-opacity",
    isOpen ? "opacity-100" : "opacity-0",
    "bg-[var(--dr-overlay-bg,rgba(0,0,0,.5))]",
    classNames?.overlay
  ));

  const basePanel =
    "absolute bg-[var(--dr-panel-bg,#fff)] text-[var(--dr-panel-color,#111827)] " +
    "shadow-[var(--dr-shadow,0_20px_60px_rgba(0,0,0,.15))] " +
    "border border-[var(--dr-border,#e5e7eb)] " +
    "focus:outline-none focus-visible:ring-2 " +
    "focus-visible:ring-[var(--dr-ring,#2563eb)] " +
    "transition-transform will-change-transform";

  const sidePosition =
    placement === "right" ? "right-0 top-0"
    : placement === "left" ? "left-0 top-0"
    : placement === "top" ? "left-0 top-0"
    : "left-0 bottom-0";

  const openTransform = "translate-x-0 translate-y-0";
  const panelCn = twMerge(clsx(
    basePanel, sizeStyle, sidePosition, cornerRadius,
    isOpen ? openTransform : translateClosed,
    classNames?.panel
  ));

  const headerCn = twMerge(clsx(
    "flex items-start justify-between gap-3 p-4 border-b border-[var(--dr-border,#e5e7eb)]",
    classNames?.header
  ));
  const titleCn = twMerge(clsx("text-base font-semibold", classNames?.title));
  const descCn = twMerge(clsx("mt-0.5 text-sm text-gray-500", classNames?.description));
  const bodyCn = twMerge(clsx("p-4 overflow-auto", classNames?.body));
  const footerCn = twMerge(clsx("p-4 border-t border-[var(--dr-border,#e5e7eb)]", classNames?.footer));
  const closeBtnCn = twMerge(clsx(
    "ms-auto inline-flex h-8 w-8 items-center justify-center rounded-md hover:bg-gray-100",
    "focus-visible:ring-2 focus-visible:ring-[var(--dr-ring,#2563eb)]",
    classNames?.close
  ));

  const content = (
    <div
      dir={dir}
      className={rootCn}
      style={{ zIndex: `var(--dr-z,50)`, ...styleVars }}
      aria-hidden={!isOpen}
    >
      {overlay && (
        <div
          {...overlayProps}
          className={overlayCn}
          onClick={(e) => {
            overlayProps?.onClick?.(e);
            if (!isOpen) return;
            if (!closeOnOverlayClick) return;
            setOpen(false);
          }}
        />
      )}

      <div
        {...panelProps}
        role="dialog"
        aria-modal="true"
        aria-labelledby={id ? `${id}-title` : undefined}
        tabIndex={-1}
        ref={panelRef}
        className={panelCn}
        onClick={(e) => e.stopPropagation()}
      >
        {(header || title || description || showClose) && (
          <div className={headerCn}>
            <div>
              {title && <h2 id={id ? `${id}-title` : undefined} className={titleCn}>{title}</h2>}
              {description && <p className={descCn}>{description}</p>}
              {header}
            </div>
            {showClose && (
              <button
                type="button"
                aria-label="Close drawer"
                className={closeBtnCn}
                onClick={() => setOpen(false)}
              >
                ×
              </button>
            )}
          </div>
        )}

        <div className={bodyCn}>{children}</div>

        {footer && <div className={footerCn}>{footer}</div>}
      </div>
    </div>
  );

  if (!portal) return content;

  const container = getContainer?.() ?? (typeof document !== "undefined" ? document.body : null);
  if (!container) return null;

  return createPortal(content, container);
};
