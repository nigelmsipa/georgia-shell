import React, { useEffect, useState } from "react";
import { motion, AnimatePresence, useMotionValue, animate, PanInfo } from "framer-motion";

/**
 * Tap-to-dictate mini overlay. Blooms out of the SidePill, streams a mocked
 * transcription in its own center. Accept commits (to the Holding Station),
 * Delete vaporizes.
 */

const SCRIPT =
  "remind me to water the fig tree before sunset and call mom afterwards";

interface Props {
  onDismiss: (mode: "accept" | "delete") => void;
  /** Vertical anchor (any CSS value) — usually the pill's Y center. */
  anchorY: number | string;
}

export const DictationOverlay: React.FC<Props> = ({ onDismiss, anchorY }) => {
  const [pending, setPending] = useState("");
  const dragY = useMotionValue(0);

  useEffect(() => {
    const tokens = SCRIPT.split(" ");
    let i = 0;
    const id = window.setInterval(() => {
      i += 1;
      setPending(tokens.slice(0, i).join(" "));
      if (i >= tokens.length) window.clearInterval(id);
    }, 220);
    return () => window.clearInterval(id);
  }, []);

  const commit = () => onDismiss("accept");
  const discard = () => onDismiss("delete");

  const handlePanEnd = (_: unknown, info: PanInfo) => {
    if (info.offset.y > 40 || info.velocity.y > 500) commit();
    else if (info.offset.y < -40 || info.velocity.y < -500) discard();
    else animate(dragY, 0, { type: "spring", stiffness: 280, damping: 26 });
  };

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

        {/* LISTENING core with transcript */}
        <div
          className="relative flex items-center gap-3"
          style={{
            padding: "10px 14px",
            minHeight: 44,
            maxWidth: 240,
            borderRadius: 22,
            background: "hsl(var(--foreground) / 0.045)",
            border: "1px solid hsl(var(--foreground) / 0.09)",
            backdropFilter: "blur(10px)",
            boxShadow: "0 0 24px hsl(var(--foreground) / 0.06)",
          }}
        >
          <motion.div
            className="rounded-full shrink-0"
            style={{
              width: 12,
              height: 12,
              background:
                "radial-gradient(circle at 35% 30%, hsl(var(--foreground) / 0.7), hsl(var(--foreground) / 0.2))",
              boxShadow: "0 0 14px hsl(var(--foreground) / 0.35)",
            }}
            animate={{ scale: [1, 1.25, 1], opacity: [0.75, 1, 0.75] }}
            transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
          />
          <div
            className="italic text-[12px] leading-snug"
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
