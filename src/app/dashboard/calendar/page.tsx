"use client";

import * as React from "react";
import { api } from "~/trpc/react";
import { Video, Calendar as CalendarIcon, Clock, Plus } from "lucide-react";
import { motion } from "motion/react";
import { MonthGrid } from "~/components/calendar/month-grid";

export default function CalendarPage() {
  const { data: events, isLoading } = api.calendar.getEvents.useQuery();
  const [selectedDate, setSelectedDate] = React.useState(new Date());

  // Group events by date
  const grouped = (events ?? []).reduce<Record<string, typeof events>>((acc, event) => {
    const dateKey = new Date(event.start).toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });
    if (!acc[dateKey]) acc[dateKey] = [];
    acc[dateKey]!.push(event);
    return acc;
  }, {});

  // Filter events for selected date
  const selectedDateEvents = (events ?? []).filter((e) => {
    return new Date(e.start).toDateString() === selectedDate.toDateString();
  });

  return (
    <div className="flex h-full w-full" style={{ background: "var(--bg)" }}>
      {/* Left — Mini Calendar */}
      <div className="w-64 shrink-0 p-4 overflow-y-auto" style={{ borderRight: "1px solid var(--border)" }}>
        <MonthGrid events={events ?? []} selectedDate={selectedDate} onSelectDate={setSelectedDate} />

        {/* Selected Day Events */}
        <div className="mt-6">
          <h3 className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: "var(--text-tertiary)" }}>
            {selectedDate.toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" })}
          </h3>
          {selectedDateEvents.length === 0 ? (
            <p className="text-xs" style={{ color: "var(--text-tertiary)" }}>No events</p>
          ) : (
            <div className="space-y-2">
              {selectedDateEvents.map((event) => {
                const start = new Date(event.start);
                return (
                  <div key={event.id} className="px-3 py-2 rounded-lg" style={{ background: "var(--accent-muted)" }}>
                    <div className="text-xs font-medium" style={{ color: "var(--text)" }}>{event.title}</div>
                    <div className="text-[10px] mt-0.5" style={{ color: "var(--text-tertiary)" }}>
                      {event.isAllDay ? "All Day" : start.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Center — Agenda */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="flex items-center px-6 h-14 shrink-0" style={{ borderBottom: "1px solid var(--border)" }}>
          <h1 className="text-sm font-semibold flex items-center gap-2" style={{ color: "var(--text)" }}>
            <CalendarIcon className="size-4" style={{ color: "var(--accent)" }} />
            Agenda
          </h1>
          <div className="flex-1" />
          <button
            className="flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-medium transition-colors"
            style={{ background: "var(--accent)", color: "var(--text-inverse)" }}
          >
            <Plus className="size-3" />
            Add Event
          </button>
        </header>

        <div className="flex-1 overflow-y-auto p-6">
          {isLoading ? (
            <div className="flex h-32 items-center justify-center">
              <div className="size-6 animate-spin rounded-full border-2" style={{ borderColor: "var(--border)", borderTopColor: "var(--accent)" }} />
            </div>
          ) : Object.keys(grouped).length === 0 ? (
            <div className="flex h-64 flex-col items-center justify-center gap-4">
              <div className="flex size-16 items-center justify-center rounded-2xl" style={{ background: "var(--accent-muted)" }}>
                <CalendarIcon className="size-7" style={{ color: "var(--accent)" }} />
              </div>
              <p className="text-sm" style={{ color: "var(--text-tertiary)" }}>No upcoming events</p>
            </div>
          ) : (
            <div className="space-y-8 max-w-3xl">
              {Object.entries(grouped).map(([dateKey, dayEvents], groupIdx) => (
                <div key={dateKey}>
                  <h2 className="mb-3 text-xs font-semibold tracking-wider uppercase" style={{ color: "var(--text-tertiary)" }}>{dateKey}</h2>
                  <div className="space-y-2">
                    {dayEvents!.map((event, idx) => {
                      const startDate = new Date(event.start);
                      const endDate = new Date(event.end);
                      const timeString = event.isAllDay ? "All Day" : `${startDate.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} – ${endDate.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`;

                      return (
                        <motion.div
                          key={event.id}
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: groupIdx * 0.05 + idx * 0.03 }}
                          className="group flex items-center justify-between rounded-2xl px-5 py-4 cursor-pointer transition-all duration-180"
                          style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}
                          onMouseEnter={(e) => { e.currentTarget.style.background = "var(--bg-card-hover)"; e.currentTarget.style.borderColor = "var(--border-hover)"; }}
                          onMouseLeave={(e) => { e.currentTarget.style.background = "var(--bg-card)"; e.currentTarget.style.borderColor = "var(--border)"; }}
                        >
                          <div className="flex items-center gap-4">
                            <div className="flex size-11 shrink-0 flex-col items-center justify-center rounded-xl" style={{ background: "var(--accent-muted)" }}>
                              <span className="text-[10px] font-semibold uppercase" style={{ color: "var(--accent)" }}>{startDate.toLocaleString("en-US", { month: "short" })}</span>
                              <span className="text-sm font-bold leading-none" style={{ color: "var(--accent)" }}>{startDate.getDate()}</span>
                            </div>
                            <div>
                              <h3 className="text-sm font-semibold" style={{ color: "var(--text)" }}>{event.title}</h3>
                              <div className="flex items-center gap-2 text-xs mt-0.5" style={{ color: "var(--text-tertiary)" }}>
                                <Clock className="size-3" />
                                {timeString}
                              </div>
                            </div>
                          </div>
                          {event.hangoutLink && (
                            <button
                              onClick={() => window.open(event.hangoutLink!, "_blank")}
                              className="flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold transition-all duration-200 opacity-0 group-hover:opacity-100"
                              style={{ background: "#4285F4", color: "#fff" }}
                            >
                              <Video className="size-3" />
                              Join
                            </button>
                          )}
                        </motion.div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
