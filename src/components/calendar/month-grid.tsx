"use client";

import * as React from "react";
import { motion } from "motion/react";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface CalendarEvent {
  id: string;
  title: string;
  start: string;
  end: string;
  hangoutLink?: string | null;
  isAllDay: boolean;
}

interface MonthGridProps {
  events: CalendarEvent[];
  selectedDate: Date;
  onSelectDate: (date: Date) => void;
}

export function MonthGrid({
  events,
  selectedDate,
  onSelectDate,
}: MonthGridProps) {
  const [currentMonth, setCurrentMonth] = React.useState(new Date());

  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();

  // Get first day of month and how many days
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const startDayOfWeek = firstDay.getDay(); // 0=Sun
  const daysInMonth = lastDay.getDate();

  // Previous month days to fill the grid
  const prevMonthLastDay = new Date(year, month, 0).getDate();

  // Build grid
  const days: { date: Date; isCurrentMonth: boolean }[] = [];

  // Previous month padding
  for (let i = startDayOfWeek - 1; i >= 0; i--) {
    days.push({
      date: new Date(year, month - 1, prevMonthLastDay - i),
      isCurrentMonth: false,
    });
  }

  // Current month
  for (let d = 1; d <= daysInMonth; d++) {
    days.push({ date: new Date(year, month, d), isCurrentMonth: true });
  }

  // Next month padding
  const remaining = 42 - days.length; // 6 rows
  for (let d = 1; d <= remaining; d++) {
    days.push({ date: new Date(year, month + 1, d), isCurrentMonth: false });
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const selectedDateStr = selectedDate.toDateString();

  // Get events for a specific day
  const getEventsForDay = (date: Date) => {
    return events.filter((e) => {
      const eventDate = new Date(e.start);
      return eventDate.toDateString() === date.toDateString();
    });
  };

  return (
    <div>
      {/* Month Navigation */}
      <div className="mb-4 flex items-center justify-between px-1">
        <button
          onClick={() => setCurrentMonth(new Date(year, month - 1, 1))}
          className="flex size-7 items-center justify-center rounded-lg transition-colors"
          style={{ color: "var(--text-secondary)" }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "var(--bg-card-hover)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "transparent";
          }}
        >
          <ChevronLeft className="size-4" />
        </button>
        <span
          className="text-sm font-semibold"
          style={{ color: "var(--text)" }}
        >
          {currentMonth.toLocaleString("en-US", {
            month: "long",
            year: "numeric",
          })}
        </span>
        <button
          onClick={() => setCurrentMonth(new Date(year, month + 1, 1))}
          className="flex size-7 items-center justify-center rounded-lg transition-colors"
          style={{ color: "var(--text-secondary)" }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "var(--bg-card-hover)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "transparent";
          }}
        >
          <ChevronRight className="size-4" />
        </button>
      </div>

      {/* Day Headers */}
      <div className="mb-1 grid grid-cols-7">
        {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((day) => (
          <div
            key={day}
            className="py-1.5 text-center text-[10px] font-semibold tracking-wider uppercase"
            style={{ color: "var(--text-tertiary)" }}
          >
            {day}
          </div>
        ))}
      </div>

      {/* Day Grid */}
      <div className="grid grid-cols-7">
        {days.map((day, idx) => {
          const isToday = day.date.toDateString() === today.toDateString();
          const isSelected = day.date.toDateString() === selectedDateStr;
          const dayEvents = getEventsForDay(day.date);

          return (
            <motion.button
              key={idx}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onSelectDate(day.date)}
              className="relative flex flex-col items-center rounded-lg py-1.5 transition-colors"
              style={{
                opacity: day.isCurrentMonth ? 1 : 0.3,
                background: isSelected ? "var(--accent-muted)" : "transparent",
              }}
              onMouseEnter={(e) => {
                if (!isSelected)
                  e.currentTarget.style.background = "var(--bg-card-hover)";
              }}
              onMouseLeave={(e) => {
                if (!isSelected)
                  e.currentTarget.style.background = "transparent";
              }}
            >
              <span
                className="flex size-6 items-center justify-center rounded-full text-xs font-medium"
                style={{
                  color: isToday
                    ? "var(--text-inverse)"
                    : isSelected
                      ? "var(--accent)"
                      : "var(--text-secondary)",
                  background: isToday ? "var(--accent)" : "transparent",
                }}
              >
                {day.date.getDate()}
              </span>
              {/* Event dots */}
              {dayEvents.length > 0 && (
                <div className="mt-0.5 flex gap-0.5">
                  {dayEvents.slice(0, 3).map((_, i) => (
                    <div
                      key={i}
                      className="size-1 rounded-full"
                      style={{ background: "var(--accent)" }}
                    />
                  ))}
                </div>
              )}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
