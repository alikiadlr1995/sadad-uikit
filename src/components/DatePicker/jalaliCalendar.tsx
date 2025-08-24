import * as React from "react";
import { twMerge } from "tailwind-merge";
import clsx from "clsx";
import { toJalaali, toGregorian, jalaaliMonthLength, isValidJalaaliDate } from "jalaali-js";

type Mode = "single" | "range";
export type RangeValue = { start: Date | null; end: Date | null };

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

  weekStartsOn?: 0 | 1 | 2 | 3 | 4 | 5 | 6; // 6 = شنبه
  showOutsideDays?: boolean;
  toPersianDigits?: boolean;
  dir?: "rtl" | "ltr";

  classNames?: Partial<Record<
    | "root" | "header" | "nav" | "title" | "grid" | "weekday"
    | "day" | "dayOutside" | "dayToday" | "daySelected" | "dayInRange" | "dayDisabled",
    string
  >>;

  renderDay?: (info: {
    gDate: Date; jy: number; jm: number; jd: number;
    selected: boolean; inRange: boolean; isToday: boolean; disabled: boolean; outside: boolean;
  }) => React.ReactNode;
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
  classNames,
  renderDay
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

  // محدودیت‌ها
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
      if (cmp(g,start)<0) setVal({start:g,end:null});
      else setVal({start, end: g});
    }
  };

  const rootCn   = twMerge(clsx("font-ui select-none", classNames?.root));
  const headerCn = twMerge(clsx("flex items-center justify-between mb-3", classNames?.header));
  const navCn    = twMerge(clsx("inline-flex items-center gap-1", classNames?.nav));
  const titleCn  = twMerge(clsx("text-sm font-medium", classNames?.title));
  const gridCn   = twMerge(clsx("grid grid-cols-7 gap-1", classNames?.grid));
  const weekdayCn= twMerge(clsx("text-xs text-gray-500 h-8 flex items-center justify-center", classNames?.weekday));

  return (
    <div dir={dir} className={rootCn} role="group" aria-label="Jalali calendar">
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

      <div className={gridCn} role="row">
        {Array.from({length:7}).map((_,i) => {
          const idx = (i + (weekStartsOn===6?0:weekStartsOn)) % 7;
          return <div key={i} className={weekdayCn}>{WEEKDAYS[idx]}</div>;
        })}
      </div>

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

          const dayBase = "h-9 rounded-md text-sm flex items-center justify-center transition focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600";
          const dayState = clsx(
            disabled && "text-gray-300 cursor-not-allowed",
            !disabled && "hover:bg-gray-100",
            isToday && "ring-1 ring-inset ring-blue-300",
            selected && "bg-blue-600 text-white hover:bg-blue-600",
            between && "bg-blue-50"
          );
          const outsideCn = clsx(
            c.outside && !showOutsideDays && "invisible",
            c.outside && showOutsideDays && "text-gray-400"
          );

          const dayCn = twMerge(clsx(dayBase, dayState, outsideCn, classNames?.day, {
            [classNames?.dayOutside ?? ""]: c.outside,
            [classNames?.dayToday ?? ""]: isToday,
            [classNames?.daySelected ?? ""]: selected,
            [classNames?.dayInRange ?? ""]: between,
            [classNames?.dayDisabled ?? ""]: disabled,
          }));

          const label = toPersianDigits ? toFaDigits(String(c.jd)) : String(c.jd);
          const content = renderDay
            ? renderDay({ gDate: g, jy: c.jy, jm: c.jm, jd: c.jd, selected: !!selected, inRange: !!between, isToday, disabled, outside: c.outside })
            : label;

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
              {content}
            </button>
          );
        })}
      </div>
    </div>
  );
};
