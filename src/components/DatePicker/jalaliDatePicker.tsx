import * as React from "react";
import clsx from "clsx";
import { twMerge } from "tailwind-merge";
import { toJalaali } from "jalaali-js";
import { JalaliCalendar, RangeValue, JalaliCalendarProps, CalendarVars } from "./JalaliCalendar";

export type JalaliDatePickerProps = {
  mode?: "single" | "range";
  value?: Date | RangeValue | null;
  defaultValue?: Date | RangeValue | null;
  onChange?: (v: Date | RangeValue | null) => void;

  minDate?: Date;
  maxDate?: Date;
  isDateDisabled?: (gDate: Date) => boolean;

  placeholder?: string;
  disabled?: boolean;
  readOnly?: boolean;
  clearable?: boolean;

  format?: (v: Date | RangeValue | null) => string;
  toPersianDigits?: boolean;

  open?: boolean;
  onOpenChange?: (open: boolean) => void;

  inputClassName?: string;
  popoverClassName?: string;
  dir?: "rtl" | "ltr";


  variant?: JalaliCalendarProps["variant"];


  calendarVars?: CalendarVars;
  calendarClassNames?: JalaliCalendarProps["classNames"];
};

const toFaDigits = (s: string) => s.replace(/\d/g, d => "۰۱۲۳۴۵۶۷۸۹"[+d]);
const pad2 = (n: number) => (n < 10 ? `0${n}` : `${n}`);

function defaultFormat(v: Date | RangeValue | null, toFa: boolean = true): string {
  if (!v) return "";

  if (v instanceof Date) {
    const j = toJalaali(v.getFullYear(), v.getMonth() + 1, v.getDate());
    const one: string = `${j.jy}/${pad2(j.jm)}/${pad2(j.jd)}`;
    return toFa ? toFaDigits(one) : one;
  }

  const { start, end } = v as RangeValue;
  const s: string = start ? defaultFormat(start, false) : "";
  const e: string = end ? defaultFormat(end, false) : "";
  const out: string = end ? `${s} – ${e}` : s;

  return toFa ? toFaDigits(out) : out;
}

export const JalaliDatePicker: React.FC<JalaliDatePickerProps> = ({
  mode = "single",
  value,
  defaultValue = mode === "single" ? null : { start: null, end: null },
  onChange,
  minDate,
  maxDate,
  isDateDisabled,
  placeholder = "انتخاب تاریخ",
  disabled,
  readOnly,
  clearable = true,
  format,
  toPersianDigits = true,
  open,
  onOpenChange,
  inputClassName,
  popoverClassName,
  dir = "rtl",
  variant = "primary",
  calendarVars,
  calendarClassNames,
}) => {
  const isCtrl = value !== undefined;
  const [internalValue, setInternalValue] = React.useState<Date|RangeValue|null>(defaultValue);
  const cur = (isCtrl ? value : internalValue) ?? (mode==="single" ? null : {start:null,end:null});
  const setVal = (v: Date|RangeValue|null) => { if (!isCtrl) setInternalValue(v); onChange?.(v); };

  const [internalOpen, setInternalOpen] = React.useState(false);
  const isOpen = open !== undefined ? open : internalOpen;
  const setOpen = (o: boolean) => { onOpenChange?.(o); if (open === undefined) setInternalOpen(o); };

  const display = (format ?? ((v) => defaultFormat(v, toPersianDigits)))(cur);

  const onDayChange = (v: Date | RangeValue | null) => {
    setVal(v);
    if (mode === "single") setOpen(false);
  };

  const containerRef = React.useRef<HTMLDivElement>(null);
  React.useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (!containerRef.current) return;
      if (!containerRef.current.contains(e.target as Node)) setOpen(false);
    }
    if (isOpen) document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [isOpen]);

  return (
    <div ref={containerRef} dir={dir} className="relative inline-block text-left font-ui">
      <div className="flex items-center gap-2">
        <input
          className={twMerge(clsx(
            "h-10 px-3 rounded-md border border-gray-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--dp-focus-ring,#2563eb)]",
            "text-sm w-[19.5rem]",
            disabled && "bg-gray-50 text-gray-400 cursor-not-allowed",
            inputClassName
          ))}
          readOnly={readOnly ?? true}
          disabled={disabled}
          placeholder={placeholder}
          value={display}
          onFocus={() => !disabled && setOpen(true)}
          onClick={() => !disabled && setOpen(true)}
        />
        {clearable && !!display && !disabled && (
          <button
            type="button"
            onClick={() => setVal(mode === "single" ? null : { start: null, end: null })}
            className="h-8 w-8 rounded-md hover:bg-gray-100"
            aria-label="پاک کردن"
          >
            ×
          </button>
        )}
      </div>

      {isOpen && !disabled && (
        <div
          className={twMerge(clsx(
            "absolute z-50 mt-2 p-3 bg-white rounded-xl shadow-lg border border-gray-200",
            "w-[19.5rem]",
            popoverClassName
          ))}
        >
          <JalaliCalendar
            mode={mode}
            value={cur}
            onChange={onDayChange}
            minDate={minDate}
            maxDate={maxDate}
            isDateDisabled={isDateDisabled}
            toPersianDigits={toPersianDigits}
            dir={dir}
            variant={variant}
            vars={calendarVars}
            classNames={calendarClassNames}
          />
          <div className="mt-3 flex justify-end">
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="px-3 py-1.5 text-sm rounded-md hover:bg-gray-100"
            >
              بستن
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
