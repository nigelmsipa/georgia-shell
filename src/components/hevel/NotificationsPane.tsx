import React, { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { AtmosphericBg } from "./AtmosphericBg";
import { SAMPLE_NOTIFICATIONS, type ProseNotification, type NoteToken } from "./types";

interface Props {
  open: boolean;
  onClose: () => void;
}

/* ── Inline token renderer ─────────────────────────────────────────────── */

const Token: React.FC<{
  token: NoteToken;
  onAction?: (action: string) => void;
}> = ({ token, onAction }) => {
  if (token.action) {
    return (
      <span
        onClick={(e) => {
          e.stopPropagation();
          onAction?.(token.action!);
        }}
        className="font-serif italic cursor-pointer select-none"
        style={{
          color: token.highlight
            ? "hsl(var(--primary))"
            : "hsl(var(--muted-foreground) / 0.5)",
          fontWeight: token.highlight ? 600 : 400,
          textDecoration: "underline",
          textDecorationStyle: token.highlight ? "solid" : "dotted",
          textUnderlineOffset: 3,
          textDecorationColor: token.highlight
            ? "hsl(var(--primary) / 0.4)"
            : "hsl(var(--muted-foreground) / 0.25)",
          transition: "opacity 0.15s",
        }}
      >
        {token.text}
      </span>
    );
  }

  return (
    <span
      className="font-serif"
      style={{
        color: token.highlight
          ? "hsl(var(--primary))"
          : "hsl(var(--foreground) / 0.75)",
        fontWeight: token.highlight ? 600 : 400,
        fontStyle: token.highlight ? "italic" : "normal",
      }}
    >
      {token.text}
    </span>
  );
};

/* ── Single notification row ───────────────────────────────────────────── */

const NotificationRow: React.FC<{
  notification: ProseNotification;
  index: number;
  onDismiss: (id: string) => void;
}> = ({ notification, index, onDismiss }) => {
  const [vis, setVis] = useState(false);
  const [fading, setFading] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setVis(true), index * 60);
    return () => clearTimeout(t);
  }, [index]);

  const handleAction = (action: string) => {
    if (action === "dismiss" || action === "open" || action === "snooze") {
      setFading(true);
      setTimeout(() => onDismiss(notification.id), 300);
    }
  };

  return (
    <div
      style={{
        opacity: fading ? 0 : vis ? 1 : 0,
        transform: fading
          ? "translateX(20px)"
          : vis
            ? "translateX(0)"
            : "translateY(6px)",
        maxHeight: fading ? 0 : 200,
        marginBottom: fading ? 0 : undefined,
        overflow: "hidden",
        transition: `opacity 0.25s ease ${index * 60}ms, transform 0.25s ease ${index * 60}ms, max-height 0.3s ease 0.1s, margin 0.3s ease 0.1s`,
      }}
    >
      {/* App label */}
      <div
        className="font-serif"
        style={{
          fontSize: 10,
          letterSpacing: "0.12em",
          textTransform: "uppercase",
          color: "hsl(var(--muted-foreground) / 0.35)",
          marginBottom: 4,
          display: "flex",
          alignItems: "center",
          gap: 6,
        }}
      >
        <span
          style={{
            width: 5,
            height: 5,
            borderRadius: "50%",
            backgroundColor: "hsl(var(--primary) / 0.6)",
            display: "inline-block",
            flexShrink: 0,
          }}
        />
        {notification.app}
      </div>

      {/* Prose body */}
      <div
        className="font-serif"
        style={{
          fontSize: 15,
          lineHeight: 1.6,
          color: "hsl(var(--foreground) / 0.75)",
        }}
      >
        {notification.tokens.map((token, i) => (
          <Token key={i} token={token} onAction={handleAction} />
        ))}
      </div>
    </div>
  );
};

/* ── Main pane ─────────────────────────────────────────────────────────── */

export const NotificationsPane: React.FC<Props> = ({ open, onClose }) => {
  const [notifications, setNotifications] = useState<ProseNotification[]>(SAMPLE_NOTIFICATIONS);
  const [closing, setClosing] = useState(false);
  const dragRef = useRef({ startX: 0 });

  const dismiss = (id: string) => {
    setNotifications((n) => n.filter((x) => x.id !== id));
  };

  const clearAll = () => {
    setClosing(true);
    setTimeout(() => {
      setNotifications([]);
      setClosing(false);
    }, 250);
  };

  const handlePaneSwipe = (e: React.PointerEvent) => {
    dragRef.current.startX = e.clientX;
  };

  const handlePaneSwipeEnd = (e: React.PointerEvent) => {
    if (e.clientX - dragRef.current.startX > 60) {
      onClose();
    }
  };

  if (!open) return null;

  return (
    <motion.div
      className="absolute inset-0 z-20 flex flex-col bg-background"
      style={{ touchAction: "none" }}
      initial={{ x: "100%", opacity: 0.5 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: "100%", opacity: 0.5 }}
      transition={{ type: "spring", stiffness: 350, damping: 30 }}
      onPointerDown={handlePaneSwipe}
      onPointerUp={handlePaneSwipeEnd}
    >
      <AtmosphericBg />
      {/* Header */}
      <div className="px-6 pt-14 pb-6">
        <span
          className="font-serif text-foreground block"
          style={{ fontSize: 38, fontWeight: 300, lineHeight: 1, letterSpacing: "-0.02em" }}
        >
          {notifications.length > 0
            ? `${notifications.length} thing${notifications.length !== 1 ? "s" : ""} came in.`
            : "nothing new."}
        </span>
      </div>

      {/* Hairline */}
      <div className="mx-6" style={{ height: 1, backgroundColor: "hsl(var(--border) / 0.15)" }} />

      {/* Notification list */}
      <div
        className="flex-1 overflow-y-auto px-6 pt-5 hide-scrollbar"
        style={{
          opacity: closing ? 0 : 1,
          transition: "opacity 0.25s ease",
        }}
      >
        <div className="flex flex-col gap-6">
          {notifications.map((n, i) => (
            <NotificationRow
              key={n.id}
              notification={n}
              index={i}
              onDismiss={dismiss}
            />
          ))}
        </div>

        {notifications.length === 0 && (
          <div className="flex items-center justify-center h-40">
            <span
              className="font-serif italic"
              style={{ fontSize: 14, color: "hsl(var(--muted-foreground) / 0.25)" }}
            >
              all clear
            </span>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="px-6 py-4 flex justify-between items-center">
        {notifications.length > 0 && (
          <button
            onClick={clearAll}
            className="font-serif italic"
            style={{
              fontSize: 13,
              color: "hsl(var(--muted-foreground) / 0.3)",
              background: "none",
              border: "none",
              cursor: "pointer",
              padding: 0,
            }}
          >
            clear all
          </button>
        )}
        <span
          className="font-serif italic ml-auto"
          style={{ fontSize: 11, color: "hsl(var(--muted-foreground) / 0.2)" }}
        >
          swipe right to go back
        </span>
      </div>
    </motion.div>
  );
};
