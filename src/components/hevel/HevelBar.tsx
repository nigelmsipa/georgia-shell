import React, { useState } from "react";
import { motion, PanInfo, MotionValue, useMotionValue, animate } from "framer-motion";
import { Breath } from "./Breath";
import { BREATH_GATHER_SPRING } from "./breathRhythm";

interface Props {
  onCloseApp: () => void;
  appDragY: MotionValue<number>;
  onScrubLeft: () => void;
  onScrubRight: () => void;
}

export const HevelBar: React.FC<Props> = ({ onCloseApp, appDragY, onScrubLeft, onScrubRight }) => {
  const [listening, setListening] = useState(false);
  const gather = useMotionValue(0);

  const setGather = (v: number) =>
    animate(gather, v, { type: "spring", ...BREATH_GATHER_SPRING });

  const handleDragEnd = (e: any, info: PanInfo) => {
    if (info.offset.y < -60 || info.velocity.y < -500) {
      onCloseApp();
    } else if (info.offset.x < -60 || info.velocity.x < -500) {
      onScrubLeft();
    } else if (info.offset.x > 60 || info.velocity.x > 500) {
      onScrubRight();
    }
    appDragY.set(0);
    setGather(0);
  };

  return (
    <div className="absolute bottom-2 left-0 right-0 h-16 flex flex-col items-center justify-end z-[100] touch-none">
      {listening && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 10 }}
          className="mb-4 text-xs font-serif italic text-[hsl(var(--primary))]"
        >
          listening…
        </motion.div>
      )}
      <motion.div
        className="relative flex items-center justify-center"
        style={{ width: 140, height: 28 }}
        drag
        dragConstraints={{ top: 0, bottom: 0, left: 0, right: 0 }}
        dragElastic={0.4}
        onPointerEnter={() => setGather(1)}
        onPointerLeave={() => setGather(0)}
        onPointerDown={() => setGather(1)}
        onPointerUp={() => setGather(0)}
        onDragStart={() => setGather(1)}
        onDrag={(e, info) => {
          if (info.offset.y < 0) appDragY.set(info.offset.y);
        }}
        onDragEnd={handleDragEnd}
        onClick={() => {
          if (!listening) {
            setListening(true);
            setTimeout(() => setListening(false), 2000);
          }
        }}
      >
        <Breath orientation="horizontal" gather={gather} length={120} thickness={14} />
      </motion.div>
    </div>
  );
};
