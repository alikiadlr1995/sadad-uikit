import * as React from "react";
import clsx from "clsx";
import { twMerge } from "tailwind-merge";
import { toJalaali, toGregorian, jalaaliMonthLength, isValidJalaaliDate } from "jalaali-js";

export type Mode = "single" | "range";
export type RangeValue = { start: Date | null; end: Date | null };

export type CalendarVars = {
  selectedBg?: string;
  selectedColor?: string;
  selectedRadius?: string | number;
  rangeBg?: string;
  rangeColor?: string;
  rangeRadius?: string | number;
  hoverBg?: string;
  todayRing?: string;
  focusRing?: string;
  outsideColor?: string;
  disabledColor?: string;
};

export type CalendarSlotName =
  | "root" | "header" | "nav" | "title" | "grid" | "weekday"
  | "day" | "dayOutside" | "dayToday" | "daySelected" | "dayInRange"
  | "dayDisabled" | "dayRangeStart" | "dayRangeEnd";

export type JalaliCalendarProps = {
  mode?: Mode;
  value?: Date | RangeValue | null;
  defaultValue?: Date | RangeValue | null;
  onChange?: (v: Date | RangeValue | null) => void;

  month?: { jy: number; jm: number };
  defaultMonth?: { jy: number; jm: number };
  onMonthChange?: (m: { jy: number; jm: number }) => void;

  minDate?: Date;
  maxDate?: Date;
  isDateDisabled?: (gDate: Date) => boolean;

  weekStartsOn?: 0 | 1 | 2 | 3 | 4 | 5 | 6; 
  showOutsideDays?: boolean;
  toPersianDigits?: boolean;
  dir?: "rtl" | "ltr";

  /** تم آماده */
  variant?: "primary" | "secondary" | "success" | "danger" | "warning" | "neutral";

  /** سفارشی‌سازی از بیرون */
  vars?: CalendarVars;
  classNames?: Partial<Record<CalendarSlotName, string>>;
};

const PERSIAN_MONTHS = ["فروردین","اردیبهشت","خرداد","تیر","مرداد","شهریور","مهر","آبان","آذر","دی","بهمن","اسفند"];
const WEEKDAYS = ["ش","ی","د","س","چ","پ","ج"];
const toFaDigits = (s: string) => s.replace(/\d/g, d => "۰۱۲۳۴۵۶۷۸۹"[+d]);

const clampToDay = (d: Date) => { const x = new Date(d); x.setHours(0,0,0,0); return x; };
const cmp = (a: Date, b: Date) => clampToDay(a).getTime() - clampToDay(b).getTime();
const sameDay = (a: Date, b: Date) => cmp(a,b) === 0;
const betweenOpen = (d: Date, s?: Date|null, e?: Date|null) =>
  !!(s && e) && clampToDay(s).getTime() < clampToDay(d).getTime() && clampToDay(d).getTime() < clampToDay(e).getTime();

const gFromJ = (jy: number, jm: number, jd: number) => {
  const g = toGregorian(jy, jm, jd);
  return clampToDay(new Date(g.gy, g.gm - 1, g.gd));
};
const todayJ = () => {
  const now = new Date();
  const j = toJalaali(now.getFullYear(), now.getMonth()+1, now.getDate());
  return { ...j, today: clampToDay(now) };
};

/** پالت‌های آماده برای variant ها */
const VARIANTS: Record<NonNullable<JalaliCalendarProps["variant"]>, Required<Pick<CalendarVars,
  "selectedBg" | "selectedColor" | "rangeBg" | "rangeColor" | "hoverBg" | "todayRing" | "focusRing"
>> & { selectedRadius: string; rangeRadius: string }> = {
  primary:   { selectedBg:"#2563eb", selectedColor:"#fff", rangeBg:"#dbeafe", rangeColor:"#1e3a8a", hoverBg:"rgba(37,99,235,.08)", todayRing:"rgba(37,99,235,.35)", focusRing:"#2563eb", selectedRadius:"9999px", rangeRadius:"9999px" },
  secondary: { selectedBg:"#6b7280", selectedColor:"#fff", rangeBg:"#e5e7eb", rangeColor:"#111827", hoverBg:"rgba(107,114,128,.10)", todayRing:"rgba(107,114,128,.35)", focusRing:"#6b7280", selectedRadius:"9999px", rangeRadius:"9999px" },
  success:   { selectedBg:"#10b981", selectedColor:"#fff", rangeBg:"#d1fae5", rangeColor:"#065f46", hoverBg:"rgba(16,185,129,.10)", todayRing:"rgba(16,185,129,.35)", focusRing:"#10b981", selectedRadius:"9999px", rangeRadius:"9999px" },
  danger:    { selectedBg:"#ef4444", selectedColor:"#fff", rangeBg:"#fee2e2", rangeColor:"#7f1d1d", hoverBg:"rgba(239,68,68,.10)", todayRing:"rgba(239,68,68,.35)", focusRing:"#ef4444", selectedRadius:"9999px", rangeRadius:"9999px" },
  warning:   { selectedBg:"#f59e0b", selectedColor:"#111827", rangeBg:"#fef3c7", rangeColor:"#78350f", hoverBg:"rgba(245,158,11,.10)", todayRing:"rgba(245,158,11,.35)", focusRing:"#f59e0b", selectedRadius:"9999px", rangeRadius:"9999px" },
  neutral:   { selectedBg:"#475569", selectedColor:"#fff", rangeBg:"#e2e8f0", rangeColor:"#0f172a", hoverBg:"rgba(71,85,105,.10)", todayRing:"rgba(71,85,105,.35)", focusRing:"#475569", selectedRadius:"9999px", rangeRadius:"9999px" },
};

export const JalaliCalendar: React.FC<JalaliCalendarProps> = ({
  mode = "single",
  value,
  defaultValue = mode === "single" ? null : { start: null, end: null },
  onChange,
  month,
  defaultMonth,
  onMonthChange,
  minDate,
  maxDate,
  isDateDisabled,
  weekStartsOn = 6,
  showOutsideDays = true,
  toPersianDigits = true,
  dir = "rtl",
  variant = "primary",
  vars,
  classNames
}) => {
  // ماه نمایشی
  const initialMonth = React.useMemo(() => {
    if (month) return month;
    if (defaultMonth) return defaultMonth;
    if (mode === "single" && value instanceof Date) {
      const j = toJalaali(value.getFullYear(), value.getMonth()+1, value.getDate());
      return { jy: j.jy, jm: j.jm };
    }
    const { jy, jm } = todayJ();
    return { jy, jm };
  }, []);

  const [internalMonth, setInternalMonth] = React.useState(initialMonth);
  const view = month ?? internalMonth;
  const setView = (m: {jy:number;jm:number}) => { onMonthChange?.(m); if (!month) setInternalMonth(m); };
  const nextMonth = () => { let {jy,jm}=view; jm++; if (jm>12){jm=1;jy++;} setView({jy,jm}); };
  const prevMonth = () => { let {jy,jm}=view; jm--; if (jm<1){jm=12;jy--;} setView({jy,jm}); };

  // value
  const isCtrl = value !== undefined;
  const [internalValue, setInternalValue] = React.useState<Date|RangeValue|null>(defaultValue);
  const cur = (isCtrl ? value : internalValue) ?? (mode==="single" ? null : {start:null,end:null});
  const setVal = (v: Date|RangeValue|null) => { if (!isCtrl) setInternalValue(v); onChange?.(v); };


  const minT = minDate ? clampToDay(minDate).getTime() : undefined;
  const maxT = maxDate ? clampToDay(maxDate).getTime() : undefined;
  const isDisabled = (d: Date) => {
    const t = clampToDay(d).getTime();
    if (minT !== undefined && t < minT) return true;
    if (maxT !== undefined && t > maxT) return true;
    return !!isDateDisabled?.(d);
  };

  // گرید
  const { jy, jm } = view;
  const daysInMonth = jalaaliMonthLength(jy, jm);
  const firstG = gFromJ(jy, jm, 1);
  const firstWeekday = (firstG.getDay() + 1) % 7; // شنبه=0
  const ws = weekStartsOn === 6 ? 0 : (weekStartsOn + 1) % 7;
  const shift = (firstWeekday - ws + 7) % 7;

  type Cell = { gDate: Date; jy: number; jm: number; jd: number; outside: boolean; invalid?: boolean; };
  const cells: Cell[] = [];

  if (showOutsideDays && shift > 0) {
    let pj = jm - 1, py = jy; if (pj < 1) { pj = 12; py--; }
    const prevLen = jalaaliMonthLength(py, pj);
    for (let i = prevLen - shift + 1; i <= prevLen; i++) cells.push({ gDate: gFromJ(py,pj,i), jy:py, jm:pj, jd:i, outside:true });
  } else {
    for (let i=0;i<shift;i++) cells.push({ gDate: new Date(NaN), jy, jm, jd: NaN as any, outside:true, invalid:true });
  }
  for (let d=1; d<=daysInMonth; d++) cells.push({ gDate: gFromJ(jy,jm,d), jy, jm, jd:d, outside:false });
  while (cells.length % 7 !== 0) {
    const idx = cells.length - (shift + daysInMonth);
    const d = 1 + idx; let nj = jm + 1, ny = jy; if (nj>12){nj=1;ny++;}
    cells.push({ gDate: gFromJ(ny,nj,d), jy:ny, jm:nj, jd:d, outside:true });
  }

  const sel = mode==="single" && cur instanceof Date ? cur : null;
  const range = mode==="range" && cur && !(cur instanceof Date) ? (cur as RangeValue) : {start:null,end:null};
  const { today } = todayJ();

  const onDayClick = (g: Date) => {
    if (isDisabled(g)) return;
    if (mode==="single") { setVal(g); return; }
    const {start,end}=range;
    if (!start || (start && end)) setVal({start:g,end:null});
    else if (start && !end) {
      if (cmp(g,start)<0) setVal({start,g:end??null});
      else setVal({start, end: g});
    }
  };


  const vpal = VARIANTS[variant];
  const varStyle: React.CSSProperties = {
    ["--dp-selected-bg" as any]:     vpal.selectedBg,
    ["--dp-selected-color" as any]:  vpal.selectedColor,
    ["--dp-selected-radius" as any]: vpal.selectedRadius,
    ["--dp-range-bg" as any]:        vpal.rangeBg,
    ["--dp-range-color" as any]:     vpal.rangeColor,
    ["--dp-range-radius" as any]:    vpal.rangeRadius,
    ["--dp-hover-bg" as any]:        vpal.hoverBg,
    ["--dp-today-ring" as any]:      vpal.todayRing,
    ["--dp-focus-ring" as any]:      vpal.focusRing,
    ["--dp-outside-color" as any]:   "#9ca3af",
    ["--dp-disabled-color" as any]:  "#d1d5db",
  };
  if (vars?.selectedBg)     (varStyle as any)["--dp-selected-bg"]     = vars.selectedBg;
  if (vars?.selectedColor)  (varStyle as any)["--dp-selected-color"]  = vars.selectedColor;
  if (vars?.selectedRadius) (varStyle as any)["--dp-selected-radius"] = typeof vars.selectedRadius==="number"?`${vars.selectedRadius}px`:vars.selectedRadius;
  if (vars?.rangeBg)        (varStyle as any)["--dp-range-bg"]        = vars.rangeBg;
  if (vars?.rangeColor)     (varStyle as any)["--dp-range-color"]     = vars.rangeColor;
  if (vars?.rangeRadius)    (varStyle as any)["--dp-range-radius"]    = typeof vars.rangeRadius==="number"?`${vars.rangeRadius}px`:vars.rangeRadius;
  if (vars?.hoverBg)        (varStyle as any)["--dp-hover-bg"]        = vars.hoverBg;
  if (vars?.todayRing)      (varStyle as any)["--dp-today-ring"]      = vars.todayRing;
  if (vars?.focusRing)      (varStyle as any)["--dp-focus-ring"]      = vars.focusRing;
  if (vars?.outsideColor)   (varStyle as any)["--dp-outside-color"]   = vars.outsideColor;
  if (vars?.disabledColor)  (varStyle as any)["--dp-disabled-color"]  = vars.disabledColor;

  // کلاس‌ها
  const rootCn   = twMerge(clsx("font-ui select-none", classNames?.root));
  const headerCn = twMerge(clsx("flex items-center justify-between mb-3", classNames?.header));
  const navCn    = twMerge(clsx("inline-flex items-center gap-1", classNames?.nav));
  const titleCn  = twMerge(clsx("text-sm font-medium", classNames?.title));
  const gridCn   = twMerge(clsx("grid grid-cols-7 gap-1", classNames?.grid));
  const weekdayCn= twMerge(clsx("text-xs text-gray-500 h-8 flex items-center justify-center", classNames?.weekday));

  return (
    <div dir={dir} className={rootCn} role="group" aria-label="Jalali calendar" style={varStyle}>
      {/* Header */}
      <div className={headerCn}>
        <div className={navCn}>
          <button type="button" onClick={prevMonth} className="h-8 w-8 inline-flex items-center justify-center rounded-md hover:bg-gray-100" aria-label="ماه قبل">‹</button>
        </div>
        <div className={titleCn}>
          {toPersianDigits ? toFaDigits(`${PERSIAN_MONTHS[jm-1]} ${jy}`) : `${PERSIAN_MONTHS[jm-1]} ${jy}`}
        </div>
        <div className={navCn}>
          <button type="button" onClick={nextMonth} className="h-8 w-8 inline-flex items-center justify-center rounded-md hover:bg-gray-100" aria-label="ماه بعد">›</button>
        </div>
      </div>

      {/* Weekdays */}
      <div className={gridCn} role="row">
        {Array.from({length:7}).map((_,i) => {
          const idx = (i + (weekStartsOn===6?0:weekStartsOn)) % 7;
          return <div key={i} className={weekdayCn}>{WEEKDAYS[idx]}</div>;
        })}
      </div>

      {/* Days */}
      <div className={gridCn} role="grid" aria-readonly>
        {cells.map((c,i) => {
          if (c.invalid || !isValidJalaaliDate(c.jy,c.jm,c.jd)) return <div key={i} className="h-9" />;
          const g = c.gDate;
          const disabled = isDisabled(g);
          const isToday = sameDay(g, today);
          const selected =
            (mode==="single" && sel && sameDay(g, sel)) ||
            (mode==="range" && range.start && range.end && (sameDay(g, range.start) || sameDay(g, range.end)));
          const between = mode==="range" && betweenOpen(g, range.start, range.end);
          const isRangeStart = mode==="range" && range.start && sameDay(g, range.start);
          const isRangeEnd   = mode==="range" && range.end   && sameDay(g, range.end);

          const dayBase =
            "h-9 w-9 text-sm flex items-center justify-center transition focus:outline-none " +
            "focus-visible:ring-2 focus-visible:ring-[var(--dp-focus-ring,#2563eb)]";
          const dayState = clsx(
            disabled
              ? "cursor-not-allowed text-[var(--dp-disabled-color,#d1d5db)]"
              : "hover:bg-[var(--dp-hover-bg,rgba(0,0,0,.06))]",
            isToday && "ring-1 ring-inset ring-[var(--dp-today-ring,rgba(37,99,235,.35))]",
            selected &&
              "bg-[var(--dp-selected-bg,#2563eb)] text-[var(--dp-selected-color,#fff)] " +
              "rounded-[var(--dp-selected-radius,9999px)] hover:bg-[var(--dp-selected-bg,#2563eb)]",
            between && "bg-[var(--dp-range-bg,#dbeafe)] text-[var(--dp-range-color,#1e3a8a)]",
            c.outside && showOutsideDays && "text-[var(--dp-outside-color,#9ca3af)]"
          );

          const dayCn = twMerge(
            clsx(
              dayBase,
              dayState,
              classNames?.day,
              c.outside && classNames?.dayOutside,
              isToday && classNames?.dayToday,
              selected && classNames?.daySelected,
              between && classNames?.dayInRange,
              disabled && classNames?.dayDisabled,
              isRangeStart && (classNames?.dayRangeStart ?? "rounded-l-[var(--dp-range-radius,9999px)]"),
              isRangeEnd   && (classNames?.dayRangeEnd   ?? "rounded-r-[var(--dp-range-radius,9999px)]"),
            )
          );

          const label = toPersianDigits ? toFaDigits(String(c.jd)) : String(c.jd);

          return (
            <button
              key={`${c.jy}-${c.jm}-${c.jd}-${i}`}
              type="button"
              className={dayCn}
              disabled={disabled}
              onClick={() => onDayClick(g)}
              aria-pressed={selected || between || undefined}
              aria-current={isToday ? "date" : undefined}
            >
              {label}
            </button>
          );
        })}
      </div>
    </div>
  );
};
