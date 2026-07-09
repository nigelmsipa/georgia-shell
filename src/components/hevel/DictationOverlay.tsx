import React, { useState } from "react";
import { motion, useMotionValue, animate, PanInfo } from "framer-motion";

/**
 * Tap-to-dictate mini overlay. Blooms out of the SidePill.
 * Phases: recording (pulsing orb) → processing (on accept) → dismiss.
 * Delete cancels immediately.
 */

interface Props {
  onDismiss: (mode: "accept" | "delete") => void;
  anchorY: number | string;
}

type Phase = "recording" | "processing";

export const DictationOverlay: React.FC<Props> = ({ onDismiss, anchorY }) => {
  const [phase, setPhase] = useState<Phase>("recording");
  const dragY = useMotionValue(0);

  const commit = () => {
    if (phase !== "recording") return;
    setPhase("processing");
    // brief processing beat, then hand off to Holding Station
    window.setTimeout(() => onDismiss("accept"), 900);
  };

  const discard = () => {
    if (phase !== "recording") return;
    onDismiss("delete");
  };

  const handlePanEnd = (_: unknown, info: PanInfo) => {
    if (info.offset.y > 40 || info.velocity.y > 500) commit();
    else if (info.offset.y < -40 || info.velocity.y < -500) discard();
    else animate(dragY, 0, { type: "spring", stiffness: 280, damping: 26 });
  };

  const isProcessing = phase === "processing";

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
        drag={isProcessing ? false : "y"}
        dragConstraints={{ top: 0, bottom: 0 }}
        dragElastic={0.25}
        style={{ y: dragY }}
        onDragEnd={handlePanEnd}
        className="flex flex-col items-center gap-2 touch-none select-none"
      >
        {/* DELETE — top */}
        <button
          onClick={discard}
          disabled={isProcessing}
          aria-label="delete dictation"
          className="w-10 h-10 rounded-full flex items-center justify-center italic text-[11px] transition-opacity"
          style={{
            color: "hsl(var(--foreground) / 0.5)",
            background: "hsl(var(--foreground) / 0.04)",
            border: "1px solid hsl(var(--foreground) / 0.08)",
            backdropFilter: "blur(8px)",
            opacity: isProcessing ? 0.25 : 1,
          }}
        >
          erase
        </button>

        {/* Core — pulsing orb (recording) or slow breath (processing) */}
        <div
          className="relative flex items-center justify-center"
          style={{
            width: 64,
            height: 64,
            borderRadius: 32,
            background: "hsl(var(--foreground) / 0.045)",
            border: "1px solid hsl(var(--foreground) / 0.09)",
            backdropFilter: "blur(10px)",
            boxShadow: "0 0 24px hsl(var(--foreground) / 0.06)",
          }}
        >
          <motion.div
            className="rounded-full"
            style={{
              width: 16,
              height: 16,
              background: isProcessing
                ? "radial-gradient(circle at 35% 30%, hsl(var(--foreground) / 0.45), hsl(var(--foreground) / 0.1))"
                : "radial-gradient(circle at 35% 30%, hsl(var(--foreground) / 0.75), hsl(var(--foreground) / 0.2))",
              boxShadow: "0 0 18px hsl(var(--foreground) / 0.35)",
            }}
            animate={
              isProcessing
                ? { scale: [1, 1.08, 1], opacity: [0.5, 0.8, 0.5] }
                : { scale: [1, 1.35, 1], opacity: [0.7, 1, 0.7] }
            }
            transition={{
              duration: isProcessing ? 2.2 : 1.4,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
          {isProcessing && (
            <motion.div
              className="absolute rounded-full"
              style={{
                inset: 8,
                border: "1px solid hsl(var(--foreground) / 0.15)",
              }}
              animate={{ rotate: 360 }}
              transition={{ duration: 3.4, repeat: Infinity, ease: "linear" }}
            />
          )}
        </div>

        {/* ACCEPT — bottom */}
        <button
          onClick={commit}
          disabled={isProcessing}
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
          {isProcessing ? "…" : "keep"}
        </button>
      </motion.div>
    </motion.div>
  );
};
