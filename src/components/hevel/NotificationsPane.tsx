import React, { useState, useRef } from "react";
import { SAMPLE_NOTIFICATIONS, type Notification } from "./types";

interface Props {
  open: boolean;
  onClose: () => void;
}

export const NotificationsPane: React.FC<Props> = ({ open, onClose }) => {
  const [notifications, setNotifications] = useState<Notification[]>(SAMPLE_NOTIFICATIONS);
  const swipeRef = useRef<{ startX: number; id: string } | null>(null);
  const [offsets, setOffsets] = useState<Record<string, number>>({});
  const [dismissing, setDismissing] = useState<string | null>(null);
  const dragRef = useRef({ startX: 0 });

  const handlePaneSwipe = (e: React.PointerEvent) => {
    dragRef.current.startX = e.clientX;
  };

  const handlePaneSwipeEnd = (e: React.PointerEvent) => {
    if (e.clientX - dragRef.current.startX > 60) {
      onClose();
    }
  };

  const handleItemStart = (e: React.PointerEvent, id: string) => {
    e.stopPropagation();
    swipeRef.current = { startX: e.clientX, id };
  };

  const handleItemMove = (e: React.PointerEvent) => {
    if (!swipeRef.current) return;
    const dx = e.clientX - swipeRef.current.startX;
    if (dx < 0) {
      setOffsets((o) => ({ ...o, [swipeRef.current!.id]: dx }));
    }
  };

  const handleItemEnd = () => {
    if (!swipeRef.current) return;
    const id = swipeRef.current.id;
    const offset = offsets[id] || 0;

    if (offset < -100) {
      setDismissing(id);
      setTimeout(() => {
        setNotifications((n) => n.filter((x) => x.id !== id));
        setOffsets((o) => { const c = { ...o }; delete c[id]; return c; });
        setDismissing(null);
      }, 200);
    } else {
      setOffsets((o) => ({ ...o, [id]: 0 }));
    }
    swipeRef.current = null;
  };

  const clearAll = () => setNotifications([]);

  if (!open) return null;

  return (
    <div
      className="absolute inset-0 z-20 flex flex-col bg-background"
      style={{ transition: "transform 0.35s ease-out" }}
      onPointerDown={handlePaneSwipe}
      onPointerUp={handlePaneSwipeEnd}
      onPointerMove={handleItemMove}
    >
      <div className="px-6 pt-14 pb-2 flex justify-between items-center">
        <span className="text-xl text-foreground font-serif">notifications</span>
        {notifications.length > 0 && (
          <button onClick={clearAll} className="text-xs text-muted-foreground font-serif">
            clear all
          </button>
        )}
      </div>

      <div
        className="flex-1 overflow-y-auto px-6"
        style={{ touchAction: "none" }}
      >
        {notifications.length === 0 && (
          <div className="flex items-center justify-center h-full">
            <span className="text-muted-foreground font-serif">nothing here</span>
          </div>
        )}
        {notifications.map((n) => {
          const offset = offsets[n.id] || 0;
          const isDismissing = dismissing === n.id;
          return (
            <div
              key={n.id}
              className="relative overflow-hidden mb-3"
              style={{
                transition: isDismissing ? "all 0.2s ease-in" : offset === 0 ? "transform 0.2s ease-out" : "none",
                opacity: isDismissing ? 0 : 1,
                height: isDismissing ? 0 : "auto",
              }}
            >
              <div
                className="relative bg-card rounded-sm p-4"
                style={{ transform: `translateX(${offset}px)` }}
                onPointerDown={(e) => handleItemStart(e, n.id)}
                onPointerUp={handleItemEnd}
              >
                <div className="flex justify-between items-baseline mb-1">
                  <span className="text-sm font-serif text-foreground font-semibold">{n.app}</span>
                  <span className="text-xs font-serif text-muted-foreground">{n.timeAgo}</span>
                </div>
                <p className="text-sm font-serif text-foreground/80">{n.body}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Swipe-right hint */}
      <div className="flex justify-center pb-8 pt-4">
        <span className="text-xs text-muted-foreground/50 font-serif">swipe right to go back</span>
      </div>
    </div>
  );
};
