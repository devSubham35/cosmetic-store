"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import {
  format,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  subWeeks,
  subMonths,
  subYears,
  startOfDay,
  endOfDay,
  addMonths,
  subDays,
  getDaysInMonth,
  getDay,
  isSameDay,
  isSameMonth,
  isAfter,
  isBefore,
  isWithinInterval,
} from "date-fns";
import { CalendarDays, ChevronLeft, ChevronRight } from "lucide-react";

// ──────────────────────────────────────────────
// Types
// ──────────────────────────────────────────────
export interface DateRange {
  from: Date;
  to: Date;
}

interface PresetOption {
  label: string;
  getRange: () => DateRange;
}

interface DateRangePickerProps {
  value?: DateRange | null;
  onChange: (range: DateRange | null) => void;
  placeholder?: string;
}

// ──────────────────────────────────────────────
// Presets
// ──────────────────────────────────────────────
const PRESETS: PresetOption[] = [
  {
    label: "Today",
    getRange: () => ({ from: startOfDay(new Date()), to: endOfDay(new Date()) }),
  },
  {
    label: "Yesterday",
    getRange: () => {
      const d = subDays(new Date(), 1);
      return { from: startOfDay(d), to: endOfDay(d) };
    },
  },
  {
    label: "Last Week",
    getRange: () => {
      const prev = subWeeks(new Date(), 1);
      return { from: startOfWeek(prev, { weekStartsOn: 1 }), to: endOfWeek(prev, { weekStartsOn: 1 }) };
    },
  },
  {
    label: "Last Month",
    getRange: () => {
      const prev = subMonths(new Date(), 1);
      return { from: startOfMonth(prev), to: endOfMonth(prev) };
    },
  },
  {
    label: "Last Year",
    getRange: () => {
      const prev = subYears(new Date(), 1);
      return { from: new Date(prev.getFullYear(), 0, 1), to: new Date(prev.getFullYear(), 11, 31, 23, 59, 59) };
    },
  },
];

const DAY_NAMES = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"];

// ──────────────────────────────────────────────
// Calendar Grid
// ──────────────────────────────────────────────
function CalendarMonth({
  month,
  rangeStart,
  rangeEnd,
  hoverDate,
  onDateClick,
  onDateHover,
  onPrev,
  onNext,
}: {
  month: Date;
  rangeStart: Date | null;
  rangeEnd: Date | null;
  hoverDate: Date | null;
  onDateClick: (d: Date) => void;
  onDateHover: (d: Date | null) => void;
  onPrev: () => void;
  onNext: () => void;
}) {
  const year = month.getFullYear();
  const mo = month.getMonth();
  const daysInMonth = getDaysInMonth(month);

  // Monday = 0 ... Sunday = 6
  const firstDayOfWeek = (getDay(new Date(year, mo, 1)) + 6) % 7;

  // Build the effective highlight range (considering hover for incomplete selection)
  const effectiveEnd = rangeEnd ?? hoverDate;
  let highlightFrom = rangeStart;
  let highlightTo = effectiveEnd;
  if (highlightFrom && highlightTo && isAfter(highlightFrom, highlightTo)) {
    [highlightFrom, highlightTo] = [highlightTo, highlightFrom];
  }

  const cells: (number | null)[] = [];
  for (let i = 0; i < firstDayOfWeek; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  return (
    <div className="select-none">
      {/* Month navigation */}
      <div className="flex items-center justify-between mb-3">
        <button
          onClick={onPrev}
          className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors text-gray-500"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        <span className="text-sm font-semibold text-gray-800">
          {format(month, "MMMM yyyy")}
        </span>
        <button
          onClick={onNext}
          className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors text-gray-500"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Day names */}
      <div className="grid grid-cols-7 mb-1">
        {DAY_NAMES.map((d) => (
          <div key={d} className="text-center text-xs font-medium text-gray-400 py-1">
            {d}
          </div>
        ))}
      </div>

      {/* Day cells */}
      <div className="grid grid-cols-7">
        {cells.map((day, idx) => {
          if (day === null) {
            return <div key={`empty-${idx}`} className="h-8" />;
          }

          const date = new Date(year, mo, day);
          const isToday = isSameDay(date, new Date());
          const isStart = highlightFrom ? isSameDay(date, highlightFrom) : false;
          const isEnd = highlightTo ? isSameDay(date, highlightTo) : false;
          const inRange =
            highlightFrom && highlightTo
              ? isWithinInterval(date, {
                  start: highlightFrom,
                  end: highlightTo,
                })
              : false;
          const isEndpoint = isStart || isEnd;

          let cellClass = "h-8 w-full text-sm transition-colors cursor-pointer relative ";

          if (isEndpoint) {
            cellClass += "bg-pink-500 text-white font-semibold z-10 ";
            if (isStart && !isEnd) cellClass += "rounded-l-full ";
            else if (isEnd && !isStart) cellClass += "rounded-r-full ";
            else cellClass += "rounded-full ";
          } else if (inRange) {
            cellClass += "bg-pink-100 text-pink-700 ";
          } else if (isToday) {
            cellClass += "text-pink-500 font-semibold hover:bg-pink-50 ";
          } else {
            cellClass += "text-gray-700 hover:bg-gray-100 ";
          }

          // Row shaping: round start/end of range rows
          if (inRange && !isEndpoint) {
            const dayOfWeek = (getDay(date) + 6) % 7; // Mon=0
            if (dayOfWeek === 0) cellClass += "rounded-l-full ";
            if (dayOfWeek === 6 || day === daysInMonth) cellClass += "rounded-r-full ";
          }

          return (
            <button
              key={day}
              onClick={() => onDateClick(date)}
              onMouseEnter={() => onDateHover(date)}
              className={cellClass}
            >
              {day}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ──────────────────────────────────────────────
// Main Component
// ──────────────────────────────────────────────
export default function DateRangePicker({
  value,
  onChange,
  placeholder = "Select date range",
}: DateRangePickerProps) {
  const [open, setOpen] = useState(false);
  const [viewMonth, setViewMonth] = useState(new Date());
  const [rangeStart, setRangeStart] = useState<Date | null>(value?.from ?? null);
  const [rangeEnd, setRangeEnd] = useState<Date | null>(value?.to ?? null);
  const [hoverDate, setHoverDate] = useState<Date | null>(null);
  const [activePreset, setActivePreset] = useState<string | null>(null);
  const ref = useRef<HTMLDivElement>(null);

  // Sync external value
  useEffect(() => {
    setRangeStart(value?.from ?? null);
    setRangeEnd(value?.to ?? null);
  }, [value]);

  // Close on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  const handleDateClick = useCallback((date: Date) => {
    setActivePreset("Custom");
    if (!rangeStart || rangeEnd) {
      // Start new selection
      setRangeStart(date);
      setRangeEnd(null);
    } else {
      // Complete selection
      if (isBefore(date, rangeStart)) {
        setRangeEnd(rangeStart);
        setRangeStart(date);
      } else {
        setRangeEnd(date);
      }
    }
  }, [rangeStart, rangeEnd]);

  const handlePresetClick = useCallback((preset: PresetOption) => {
    const range = preset.getRange();
    setRangeStart(range.from);
    setRangeEnd(range.to);
    setActivePreset(preset.label);
    setViewMonth(range.from);
  }, []);

  const handleApply = useCallback(() => {
    if (rangeStart && rangeEnd) {
      const from = isBefore(rangeStart, rangeEnd) ? rangeStart : rangeEnd;
      const to = isAfter(rangeStart, rangeEnd) ? rangeStart : rangeEnd;
      onChange({ from: startOfDay(from), to: endOfDay(to) });
    }
    setOpen(false);
  }, [rangeStart, rangeEnd, onChange]);

  const handleReset = useCallback(() => {
    setRangeStart(null);
    setRangeEnd(null);
    setActivePreset(null);
    onChange(null);
    setOpen(false);
  }, [onChange]);

  // Format the trigger label
  const triggerLabel =
    value?.from && value?.to
      ? `${format(value.from, "dd MMM yy")} – ${format(value.to, "dd MMM yy")}`
      : placeholder;

  const hasSelection = !!(value?.from && value?.to);

  return (
    <div className="relative" ref={ref}>
      {/* Trigger button */}
      <button
        onClick={() => setOpen(!open)}
        className={`flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-lg transition-colors border ${
          hasSelection
            ? "bg-pink-50 text-pink-600 border-pink-200 hover:bg-pink-100"
            : "bg-gray-50 text-gray-600 border-pink-100 hover:bg-gray-100"
        }`}
      >
        <CalendarDays className="w-4 h-4" />
        {triggerLabel}
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute left-0 top-full mt-2 z-50 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden flex animate-fade-in-up"
          style={{ minWidth: 460 }}
        >
          {/* Left: Presets */}
          <div className="w-[140px] border-r border-gray-100 py-3 flex flex-col justify-between">
            <div className="space-y-0.5 px-2">
              {PRESETS.map((preset) => (
                <button
                  key={preset.label}
                  onClick={() => handlePresetClick(preset)}
                  className={`block w-full text-left px-3 py-2 text-sm rounded-lg transition-colors ${
                    activePreset === preset.label
                      ? "bg-gray-900 text-white font-medium"
                      : "text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  {preset.label}
                </button>
              ))}
              <button
                onClick={() => setActivePreset("Custom")}
                className={`block w-full text-left px-3 py-2 text-sm rounded-lg transition-colors ${
                  activePreset === "Custom"
                    ? "bg-gray-900 text-white font-medium"
                    : "text-gray-600 hover:bg-gray-50"
                }`}
              >
                Custom
              </button>
            </div>

            <div className="px-2 pt-3 space-y-2">
              <button
                onClick={handleReset}
                className="block w-full text-left px-3 py-1 text-sm text-pink-500 hover:text-pink-700 font-medium transition-colors"
              >
                Reset
              </button>
              <button
                onClick={handleApply}
                disabled={!rangeStart || !rangeEnd}
                className="w-full px-3 py-2 text-sm font-semibold rounded-lg transition-colors bg-gray-900 text-white hover:bg-gray-800 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Apply
              </button>
            </div>
          </div>

          {/* Right: Calendar */}
          <div className="p-4 flex-1">
            <CalendarMonth
              month={viewMonth}
              rangeStart={rangeStart}
              rangeEnd={rangeEnd}
              hoverDate={hoverDate}
              onDateClick={handleDateClick}
              onDateHover={setHoverDate}
              onPrev={() => setViewMonth((m) => addMonths(m, -1))}
              onNext={() => setViewMonth((m) => addMonths(m, 1))}
            />

            {/* Selection summary */}
            {rangeStart && (
              <div className="mt-3 pt-3 border-t border-gray-100 text-xs text-gray-400 text-center">
                {rangeEnd ? (
                  <>
                    <span className="font-medium text-gray-600">
                      {format(isBefore(rangeStart, rangeEnd) ? rangeStart : rangeEnd, "dd MMM yyyy")}
                    </span>
                    {" – "}
                    <span className="font-medium text-gray-600">
                      {format(isAfter(rangeStart, rangeEnd) ? rangeStart : rangeEnd, "dd MMM yyyy")}
                    </span>
                  </>
                ) : (
                  <>Select end date</>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
