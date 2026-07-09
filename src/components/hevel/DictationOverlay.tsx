import React, { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence, useMotionValue, animate, PanInfo } from "framer-motion";

/**
 * Tap-to-dictate mini overlay. Blooms out of the SidePill, streams a mocked
 * transcription either into the currently-focused text field (as pending
 * text) or into its own center. Accept commits, Delete vaporizes.
 */

type FieldTarget = {
  el: HTMLInputElement | HTMLTextAreaElement;
  start: number; // where the pending text was inserted
};

const SCRIPT =
  "remind me to water the fig tree before sunset and call mom afterwards";

interface Props {
  onDismiss: (mode: "accept" | "delete") => void;
  /** Vertical anchor (any CSS value) — usually the pill's Y center. */
  anchorY: number | string;
}

export const DictationOverlay: React.FC<Props> = ({ onDismiss, anchorY }) => {
  const [pending, setPending] = useState("");
  const [status, setStatus] = useState<"listening" | "closing">("listening");
  const targetRef = useRef<FieldTarget | null>(null);
  const pendingRef = useRef("");
  const dragY = useMotionValue(0);

  // Snapshot the focused text field (if any) before we bloom.
  useEffect(() => {
    const el = document.activeElement as HTMLElement | null;
    if (
      el &&
      (el.tagName === "INPUT" || el.tagName === "TEXTAREA") &&
      !(el as HTMLInputElement).readOnly &&
      !(el as HTMLInputElement).disabled
    ) {
      const field = el as HTMLInputElement | HTMLTextAreaElement;
      targetRef.current = {
        el: field,
        start: field.selectionStart ?? field.value.length,
      };
    }

    // Stream tokens word-by-word.
    const tokens = SCRIPT.split(" ");
    let i = 0;
    const id = window.setInterval(() => {
      i += 1;
      const next = tokens.slice(0, i).join(" ");
      pendingRef.current = next;
      setPending(next);
      writeIntoField(next);
      if (i >= tokens.length) window.clearInterval(id);
    }, 220);
    return () => window.clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const writeIntoField = (text: string) => {
    const t = targetRef.current;
    if (!t) return;
    const cur = t.el.value;
    const before = cur.slice(0, t.start);
    // strip any previous pending we injected
    const afterOldPending = cur.slice(t.start + (t.el.dataset._penlen ? Number(t.el.dataset._penlen) : 0));
    const nextVal = before + text + afterOldPending;
    t.el.dataset._penlen = String(text.length);
    // Set value via native setter so React inputs update
    const proto = t.el instanceof HTMLTextAreaElement
      ? window.HTMLTextAreaElement.prototype
      : window.HTMLInputElement.prototype;
    const setter = Object.getOwnPropertyDescriptor(proto, "value")?.set;
    setter?.call(t.el, nextVal);
    t.el.dispatchEvent(new Event("input", { bubbles: true }));
  };

  const removePendingFromField = () => {
    const t = targetRef.current;
    if (!t) return;
    const len = Number(t.el.dataset._penlen || 0);
    const cur = t.el.value;
    const nextVal = cur.slice(0, t.start) + cur.slice(t.start + len);
    delete t.el.dataset._penlen;
    const proto = t.el instanceof HTMLTextAreaElement
      ? window.HTMLTextAreaElement.prototype
      : window.HTMLInputElement.prototype;
    const setter = Object.getOwnPropertyDescriptor(proto, "value")?.set;
    setter?.call(t.el, nextVal);
    t.el.dispatchEvent(new Event("input", { bubbles: true }));
  };

  const commit = () => {
    if (status === "closing") return;
    const t = targetRef.current;
    if (t) delete t.el.dataset._penlen; // freezes pending text as normal content
    setStatus("closing");
    onDismiss("accept");
  };

  const discard = () => {
    if (status === "closing") return;
    removePendingFromField();
    setStatus("closing");
    onDismiss("delete");
  };

  const handlePanEnd = (_: unknown, info: PanInfo) => {
    if (info.offset.y > 40 || info.velocity.y > 500) commit();
    else if (info.offset.y < -40 || info.velocity.y < -500) discard();
    else animate(dragY, 0, { type: "spring", stiffness: 280, damping: 26 });
  };

  const hasField = !!targetRef.current;

  return (
    <motion.div
      className="absolute z-[130]"
      style={{
        left: 18,
        top: anchorY,
        y: "-50%",
        fontFamily: "Georgia, serif",
      }}
      initial={{ opacity: 0, scale: 0.4, x: -8 }}
      animate={{ opacity: 1, scale: 1, x: 0 }}
      exit={{ opacity: 0, scale: 0.5, x: -8 }}
      transition={{ type: "spring", stiffness: 280, damping: 26 }}
    >
      <motion.div
        drag="y"
        dragConstraints={{ top: 0, bottom: 0 }}
        dragElastic={0.25}
        style={{ y: dragY }}
        onDragEnd={handlePanEnd}
        className="flex flex-col items-center gap-2 touch-none select-none"
      >
        {/* DELETE — top */}
        <button
          onClick={discard}
          aria-label="delete dictation"
          className="w-10 h-10 rounded-full flex items-center justify-center italic text-[11px]"
          style={{
            color: "hsl(var(--foreground) / 0.5)",
            background: "hsl(var(--foreground) / 0.04)",
            border: "1px solid hsl(var(--foreground) / 0.08)",
            backdropFilter: "blur(8px)",
          }}
        >
          erase
        </button>

        {/* LISTENING core */}
        <div
          className="relative flex items-center justify-center"
          style={{
            width: 64,
            minHeight: 64,
            padding: hasField ? 0 : "10px 12px",
            maxWidth: hasField ? 64 : 220,
            borderRadius: 32,
            background: "hsl(var(--foreground) / 0.045)",
            border: "1px solid hsl(var(--foreground) / 0.09)",
            backdropFilter: "blur(10px)",
            boxShadow: "0 0 24px hsl(var(--foreground) / 0.06)",
          }}
        >
          {/* pulsing orb */}
          <motion.div
            className="rounded-full"
            style={{
              width: 14,
              height: 14,
              background:
                "radial-gradient(circle at 35% 30%, hsl(var(--foreground) / 0.7), hsl(var(--foreground) / 0.2))",
              boxShadow: "0 0 16px hsl(var(--foreground) / 0.35)",
              position: hasField ? "static" : "absolute",
              top: 8,
              left: 12,
            }}
            animate={{ scale: [1, 1.25, 1], opacity: [0.75, 1, 0.75] }}
            transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
          />

          {/* Transcript preview if no field is focused */}
          {!hasField && (
            <div
              className="italic text-[12px] leading-snug pl-6"
              style={{ color: "hsl(var(--foreground) / 0.78)" }}
            >
              <AnimatePresence mode="wait">
                <motion.span
                  key={pending}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  {pending || "listening…"}
                </motion.span>
              </AnimatePresence>
            </div>
          )}
        </div>

        {/* ACCEPT — bottom */}
        <button
          onClick={commit}
          aria-label="accept dictation"
          className="w-12 h-12 rounded-full flex items-center justify-center italic text-[12px]"
          style={{
            color: "hsl(var(--foreground) / 0.85)",
            background: "hsl(var(--foreground) / 0.07)",
            border: "1px solid hsl(var(--foreground) / 0.14)",
            backdropFilter: "blur(8px)",
            boxShadow: "0 0 20px hsl(var(--foreground) / 0.1)",
          }}
        >
          keep
        </button>
      </motion.div>
    </motion.div>
  );
};
