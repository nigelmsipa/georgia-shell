import React, { useMemo, useState } from "react";
import { AppScreen } from "./AppScreen";

interface Props {
  onClose: () => void;
  onOpenUtilityDrawer?: () => void;
}

interface Event {
  id: string;
  title: string;
  /** "09:30" 24h */
  start: string;
  end: string;
  where?: string;
  with?: string;
  hue: number;
  note?: string;
}

interface Day {
  /** ISO-ish key for sorting */
  key: string;
  /** human label */
  label: string;
  /** prose subtitle, e.g. "today", "tomorrow", "in two days" */
  prose: string;
  weekday: string;
  date: number;
  month: string;
  events: Event[];
}

const DAYS: Day[] = [
  {
    key: "2026-06-09",
    label: "today",
    prose: "today is gentle.",
    weekday: "tuesday",
    date: 9,
    month: "june",
    events: [
      { id: "e1", title: "morning walk", start: "07:30", end: "08:15", where: "vasaparken", hue: 140, note: "no phone." },
      { id: "e2", title: "design review", start: "10:00", end: "11:00", where: "room B", with: "ines, anders", hue: 28 },
      { id: "e3", title: "lunch with mira", start: "12:30", end: "13:30", where: "café pascal", with: "mira", hue: 320 },
      { id: "e4", title: "deep work", start: "14:00", end: "17:00", where: "studio", hue: 220, note: "launcher polish." },
      { id: "e5", title: "call dad", start: "18:30", end: "18:50", hue: 60 },
    ],
  },
  {
    key: "2026-06-10",
    label: "tomorrow",
    prose: "two meetings, then quiet.",
    weekday: "wednesday",
    date: 10,
    month: "june",
    events: [
      { id: "e6", title: "standup", start: "09:00", end: "09:15", where: "kitchen", hue: 200 },
      { id: "e7", title: "interview — oskar", start: "11:00", end: "12:00", where: "video", with: "oskar", hue: 260 },
    ],
  },
  {
    key: "2026-06-11",
    label: "thursday",
    prose: "open. probably writing.",
    weekday: "thursday",
    date: 11,
    month: "june",
    events: [
      { id: "e8", title: "chapter two pass", start: "10:00", end: "13:00", where: "studio", hue: 28, note: "anders is waiting." },
    ],
  },
  {
    key: "2026-06-12",
    label: "friday",
    prose: "studio drinks at the end.",
    weekday: "friday",
    date: 12,
    month: "june",
    events: [
      { id: "e9", title: "havel demo", start: "15:00", end: "16:00", where: "room A", with: "studio", hue: 12 },
      { id: "e10", title: "studio drinks", start: "17:30", end: "20:00", where: "the corner bar", hue: 340 },
    ],
  },
  {
    key: "2026-06-13",
    label: "saturday",
    prose: "a walk, a lunch, nothing else.",
    weekday: "saturday",
    date: 13,
    month: "june",
    events: [
      { id: "e11", title: "lunch — mum & dad", start: "13:00", end: "15:00", where: "uppsala", with: "family", hue: 60 },
    ],
  },
  {
    key: "2026-06-14",
    label: "sunday",
    prose: "blank. keep it that way.",
    weekday: "sunday",
    date: 14,
    month: "june",
    events: [],
  },
];

const HOUR_PX = 56;
const DAY_START = 6; // 06:00
const DAY_END = 22; // 22:00

const toMinutes = (t: string) => {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
};

const fmtRange = (a: string, b: string) => `${a}–${b}`;

export const Calendar: React.FC<Props> = ({ onClose, onOpenUtilityDrawer }) => {
  const [activeKey, setActiveKey] = useState<string>(DAYS[0].key);
  const [activeEvent, setActiveEvent] = useState<Event | null>(null);
  const [view, setView] = useState<"day" | "week">("day");

  const active = useMemo(() => DAYS.find((d) => d.key === activeKey) || DAYS[0], [activeKey]);

  return (
    <AppScreen appName="calendar" onClose={onClose} onOpenUtilityDrawer={onOpenUtilityDrawer}>
      {activeEvent ? (
        <EventDetail event={activeEvent} day={active} onBack={() => setActiveEvent(null)} />
      ) : (
        <CalendarMain
          active={active}
          view={view}
          setView={setView}
          activeKey={activeKey}
          setActiveKey={setActiveKey}
          onOpenEvent={setActiveEvent}
        />
      )}
    </AppScreen>
  );
};

// ── Main ─────────────────────────────────────────────────────────────────────

const CalendarMain: React.FC<{
  active: Day;
  view: "day" | "week";
  setView: (v: "day" | "week") => void;
  activeKey: string;
  setActiveKey: (k: string) => void;
  onOpenEvent: (e: Event) => void;
}> = ({ active, view, setView, activeKey, setActiveKey, onOpenEvent }) => {
  return (
    <div className="flex-1 flex flex-col overflow-hidden" style={{ touchAction: "auto" }}>
      {/* Prose heading */}
      <div className="px-6 pt-2 pb-3">
        <p
          className="font-serif"
          style={{ fontSize: 22, lineHeight: 1.25, color: "hsl(var(--foreground) / 0.92)" }}
        >
          {active.label},{" "}
          <span className="italic" style={{ color: "hsl(var(--muted-foreground) / 0.6)" }}>
            {active.prose}
          </span>
        </p>
        <p
          className="font-serif italic"
          style={{ fontSize: 12, color: "hsl(var(--muted-foreground) / 0.5)", marginTop: 4, letterSpacing: "0.04em" }}
        >
          {active.weekday} · {active.date} {active.month}
        </p>
      </div>

      {/* Day ribbon */}
      <div
        className="flex gap-1 px-3 pb-2 overflow-x-auto"
        style={{ scrollbarWidth: "none", touchAction: "pan-x" }}
        onPointerDown={(e) => e.stopPropagation()}
      >
        {DAYS.map((d) => {
          const isActive = d.key === activeKey;
          return (
            <button
              key={d.key}
              onClick={() => setActiveKey(d.key)}
              className="flex flex-col items-center justify-center font-serif flex-shrink-0"
              style={{
                width: 48,
                padding: "6px 0 8px",
                borderRadius: 12,
                background: isActive ? "hsl(var(--primary) / 0.15)" : "transparent",
                border: `1px solid ${isActive ? "hsl(var(--primary) / 0.35)" : "hsl(var(--border) / 0.25)"}`,
              }}
            >
              <span
                className="italic"
                style={{
                  fontSize: 10,
                  color: isActive ? "hsl(var(--primary))" : "hsl(var(--muted-foreground) / 0.55)",
                  letterSpacing: "0.05em",
                }}
              >
                {d.weekday.slice(0, 3)}
              </span>
              <span
                style={{
                  fontSize: 16,
                  marginTop: 2,
                  color: isActive ? "hsl(var(--primary))" : "hsl(var(--foreground) / 0.85)",
                  fontWeight: isActive ? 700 : 400,
                }}
              >
                {d.date}
              </span>
              {d.events.length > 0 && (
                <span
                  style={{
                    width: 4,
                    height: 4,
                    borderRadius: 999,
                    marginTop: 3,
                    background: isActive ? "hsl(var(--primary))" : "hsl(var(--muted-foreground) / 0.4)",
                  }}
                />
              )}
            </button>
          );
        })}
      </div>

      {/* View toggle — prose */}
      <div className="px-6 pb-2">
        <p className="font-serif" style={{ fontSize: 12, color: "hsl(var(--muted-foreground) / 0.55)" }}>
          show me the{" "}
          <button
            onClick={() => setView("day")}
            onPointerDown={(e) => e.stopPropagation()}
            className="font-serif italic"
            style={{
              color: view === "day" ? "hsl(var(--primary))" : "hsl(var(--muted-foreground) / 0.5)",
              textDecoration: view === "day" ? "underline" : "none",
            }}
          >
            hours
          </button>
          {" or just a "}
          <button
            onClick={() => setView("week")}
            onPointerDown={(e) => e.stopPropagation()}
            className="font-serif italic"
            style={{
              color: view === "week" ? "hsl(var(--primary))" : "hsl(var(--muted-foreground) / 0.5)",
              textDecoration: view === "week" ? "underline" : "none",
            }}
          >
            list
          </button>
          .
        </p>
      </div>

      {/* Body */}
      <div
        className="flex-1 overflow-y-auto"
        style={{ touchAction: "pan-y" }}
        onPointerDown={(e) => e.stopPropagation()}
      >
        {view === "day" ? (
          <DayTimeline day={active} onOpenEvent={onOpenEvent} />
        ) : (
          <WeekList onOpenEvent={onOpenEvent} />
        )}
      </div>
    </div>
  );
};

// ── Day timeline ─────────────────────────────────────────────────────────────

const DayTimeline: React.FC<{ day: Day; onOpenEvent: (e: Event) => void }> = ({ day, onOpenEvent }) => {
  const hours: number[] = [];
  for (let h = DAY_START; h <= DAY_END; h++) hours.push(h);

  const now = new Date();
  const isToday = day.label === "today";
  const nowOffset = isToday
    ? ((now.getHours() * 60 + now.getMinutes()) - DAY_START * 60) * (HOUR_PX / 60)
    : -1;

  return (
    <div className="relative px-4 pb-8" style={{ minHeight: (DAY_END - DAY_START) * HOUR_PX + 40 }}>
      {/* Hour grid */}
      {hours.map((h, i) => (
        <div
          key={h}
          className="absolute left-0 right-0 flex items-start gap-3 px-4"
          style={{ top: i * HOUR_PX, height: HOUR_PX }}
        >
          <span
            className="font-serif italic"
            style={{
              fontSize: 10,
              color: "hsl(var(--muted-foreground) / 0.4)",
              width: 32,
              textAlign: "right",
              letterSpacing: "0.05em",
            }}
          >
            {h.toString().padStart(2, "0")}
          </span>
          <div
            className="flex-1"
            style={{ borderTop: "1px solid hsl(var(--border) / 0.15)", marginTop: 5 }}
          />
        </div>
      ))}

      {/* Now line */}
      {isToday && nowOffset >= 0 && nowOffset <= (DAY_END - DAY_START) * HOUR_PX && (
        <div
          className="absolute left-0 right-4 flex items-center gap-2"
          style={{ top: nowOffset, paddingLeft: 28 }}
        >
          <span
            style={{
              width: 6,
              height: 6,
              borderRadius: 999,
              background: "hsl(var(--primary))",
              boxShadow: "0 0 8px hsl(var(--primary) / 0.6)",
            }}
          />
          <div
            className="flex-1"
            style={{ height: 1, background: "hsl(var(--primary) / 0.5)" }}
          />
        </div>
      )}

      {/* Events */}
      {day.events.map((e) => {
        const startMin = toMinutes(e.start) - DAY_START * 60;
        const endMin = toMinutes(e.end) - DAY_START * 60;
        const top = (startMin * HOUR_PX) / 60;
        const height = Math.max(28, ((endMin - startMin) * HOUR_PX) / 60 - 4);
        return (
          <button
            key={e.id}
            onClick={() => onOpenEvent(e)}
            className="absolute font-serif text-left"
            style={{
              top,
              left: 52,
              right: 16,
              height,
              padding: "6px 10px",
              borderRadius: 8,
              background: `hsl(${e.hue} 35% 25% / 0.45)`,
              borderLeft: `2px solid hsl(${e.hue} 60% 55%)`,
              backdropFilter: "blur(6px)",
              overflow: "hidden",
            }}
          >
            <div
              className="font-serif truncate"
              style={{ fontSize: 13, color: "hsl(var(--foreground) / 0.95)", lineHeight: 1.2 }}
            >
              {e.title}
            </div>
            <div
              className="font-serif italic truncate"
              style={{ fontSize: 10, color: "hsl(var(--muted-foreground) / 0.7)", marginTop: 2 }}
            >
              {fmtRange(e.start, e.end)}
              {e.where && ` · ${e.where}`}
            </div>
          </button>
        );
      })}

      {day.events.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center">
          <p
            className="font-serif italic"
            style={{ fontSize: 14, color: "hsl(var(--muted-foreground) / 0.4)" }}
          >
            nothing planned. enjoy it.
          </p>
        </div>
      )}
    </div>
  );
};

// ── Week list ────────────────────────────────────────────────────────────────

const WeekList: React.FC<{ onOpenEvent: (e: Event) => void }> = ({ onOpenEvent }) => {
  return (
    <div className="px-5 pb-6">
      {DAYS.map((d) => (
        <div key={d.key} className="mb-5">
          <div className="flex items-baseline gap-3 mb-2">
            <span
              className="font-serif"
              style={{ fontSize: 16, color: "hsl(var(--foreground) / 0.9)" }}
            >
              {d.label}
            </span>
            <span
              className="font-serif italic"
              style={{ fontSize: 11, color: "hsl(var(--muted-foreground) / 0.5)" }}
            >
              {d.weekday} {d.date}
            </span>
          </div>
          {d.events.length === 0 ? (
            <p
              className="font-serif italic"
              style={{ fontSize: 13, color: "hsl(var(--muted-foreground) / 0.45)", paddingLeft: 4 }}
            >
              nothing.
            </p>
          ) : (
            d.events.map((e) => (
              <button
                key={e.id}
                onClick={() => onOpenEvent(e)}
                className="w-full flex items-baseline gap-3 py-1.5 text-left"
                style={{ borderBottom: "1px solid hsl(var(--border) / 0.15)" }}
              >
                <span
                  className="font-serif"
                  style={{
                    fontSize: 11,
                    color: "hsl(var(--muted-foreground) / 0.55)",
                    width: 56,
                    flexShrink: 0,
                  }}
                >
                  {e.start}
                </span>
                <span
                  style={{
                    width: 4,
                    height: 4,
                    borderRadius: 999,
                    background: `hsl(${e.hue} 60% 55%)`,
                    flexShrink: 0,
                  }}
                />
                <span
                  className="font-serif truncate flex-1"
                  style={{ fontSize: 14, color: "hsl(var(--foreground) / 0.9)" }}
                >
                  {e.title}
                </span>
                {e.where && (
                  <span
                    className="font-serif italic truncate"
                    style={{ fontSize: 11, color: "hsl(var(--muted-foreground) / 0.45)", maxWidth: 100 }}
                  >
                    {e.where}
                  </span>
                )}
              </button>
            ))
          )}
        </div>
      ))}
    </div>
  );
};

// ── Event detail ─────────────────────────────────────────────────────────────

const EventDetail: React.FC<{ event: Event; day: Day; onBack: () => void }> = ({
  event,
  day,
  onBack,
}) => {
  return (
    <div className="flex-1 flex flex-col overflow-hidden" style={{ touchAction: "auto" }}>
      <div
        className="px-5 pb-3 flex items-center gap-3"
        style={{ borderBottom: "1px solid hsl(var(--border) / 0.3)" }}
      >
        <button
          onClick={onBack}
          onPointerDown={(e) => e.stopPropagation()}
          className="font-serif italic"
          style={{ fontSize: 13, color: "hsl(var(--muted-foreground) / 0.7)" }}
        >
          ‹ back
        </button>
      </div>

      <div
        className="flex-1 overflow-y-auto"
        style={{ touchAction: "pan-y" }}
        onPointerDown={(e) => e.stopPropagation()}
      >
        <div className="px-6 pt-6 pb-4">
          <div
            style={{
              width: 36,
              height: 3,
              borderRadius: 999,
              background: `hsl(${event.hue} 60% 55%)`,
              marginBottom: 14,
            }}
          />
          <p
            className="font-serif"
            style={{ fontSize: 26, lineHeight: 1.2, color: "hsl(var(--foreground) / 0.95)" }}
          >
            {event.title}
          </p>
          <p
            className="font-serif italic"
            style={{ fontSize: 14, color: "hsl(var(--muted-foreground) / 0.6)", marginTop: 8, lineHeight: 1.5 }}
          >
            {day.weekday}, {day.date} {day.month} · {fmtRange(event.start, event.end)}
          </p>
        </div>

        <div className="px-6 py-4" style={{ borderTop: "1px solid hsl(var(--border) / 0.25)" }}>
          <p className="font-serif" style={{ fontSize: 15, lineHeight: 1.7, color: "hsl(var(--foreground) / 0.85)" }}>
            you'll be{" "}
            {event.where ? (
              <>
                at <span className="italic" style={{ color: "hsl(var(--primary))" }}>{event.where}</span>
                {event.with ? " " : ""}
              </>
            ) : (
              <>somewhere{event.with ? " " : ""}</>
            )}
            {event.with && (
              <>
                with <span className="italic" style={{ color: "hsl(var(--primary))" }}>{event.with}</span>
              </>
            )}
            {", from "}
            <span className="italic" style={{ color: "hsl(var(--primary))" }}>{event.start}</span>
            {" until "}
            <span className="italic" style={{ color: "hsl(var(--primary))" }}>{event.end}</span>
            .
          </p>
          {event.note && (
            <p
              className="font-serif italic"
              style={{
                fontSize: 14,
                lineHeight: 1.6,
                color: "hsl(var(--muted-foreground) / 0.7)",
                marginTop: 12,
                paddingLeft: 12,
                borderLeft: "1px solid hsl(var(--border) / 0.4)",
              }}
            >
              {event.note}
            </p>
          )}
        </div>

        <div
          className="px-6 py-4"
          style={{ borderTop: "1px solid hsl(var(--border) / 0.25)" }}
        >
          <p className="font-serif" style={{ fontSize: 14, lineHeight: 1.6, color: "hsl(var(--foreground) / 0.75)" }}>
            you could{" "}
            <span className="italic" style={{ color: "hsl(var(--primary))" }}>nudge it earlier</span>
            ,{" "}
            <span className="italic" style={{ color: "hsl(var(--primary))" }}>push it later</span>
            , or{" "}
            <span className="italic" style={{ color: "hsl(var(--destructive) / 0.85)" }}>let it go</span>
            .
          </p>
        </div>
      </div>
    </div>
  );
};
