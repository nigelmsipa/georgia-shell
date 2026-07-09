import React, { useEffect, useRef, useState } from "react";
import { motion, PanInfo, MotionValue } from "framer-motion";
import {
  NAV_ZONE_HEIGHT_DP,
  SWIPE_UP_HOME_DP,
  SWIPE_UP_PEEK_DP,
  SWIPE_SIDE_SCRUB_DP,
} from "./nav-contract";
import { registerGestureZone } from "./GestureDebugOverlay";

interface Props {
  onGoHome: () => void;
  onPeekSwitcher: () => void;
  appDragY: MotionValue<number>;
  onScrubLeft: () => void;
  onScrubRight: () => void;
}

export const HevelBar: React.FC<Props> = ({
  onGoHome,
  onPeekSwitcher,
  appDragY,
  onScrubLeft,
  onScrubRight,
}) => {
  const [listening, setListening] = useState(false);
  const zoneRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    registerGestureZone("nav-bottom", zoneRef.current);
    return () => registerGestureZone("nav-bottom", null);
  }, []);

  const handleDragEnd = (_: any, info: PanInfo) => {
    const dx = info.offset.x;
    const dy = info.offset.y;

    // Vertical priority
    if (Math.abs(dy) > Math.abs(dx)) {
      if (dy < -SWIPE_UP_HOME_DP || info.velocity.y < -800) {
        onGoHome();
      } else if (dy < -SWIPE_UP_PEEK_DP) {
        onPeekSwitcher();
      }
    } else if (dx < -SWIPE_SIDE_SCRUB_DP || info.velocity.x < -500) {
      onScrubLeft();
    } else if (dx > SWIPE_SIDE_SCRUB_DP || info.velocity.x > 500) {
      onScrubRight();
    }

    appDragY.set(0);
  };

  return (
    <div
      ref={zoneRef}
      className="absolute bottom-0 left-0 right-0 flex flex-col items-center justify-end z-[100] touch-none"
      style={{ height: NAV_ZONE_HEIGHT_DP }}
    >
      {listening && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 10 }}
          className="mb-3 text-caption italic text-[hsl(var(--primary))]"
        >
          listening…
        </motion.div>
      )}
      <motion.div
        className="w-32 h-[4px] mb-3 rounded-full bg-[hsl(var(--muted-foreground)/0.3)] shadow-lg"
        drag
        dragConstraints={{ top: 0, bottom: 0, left: 0, right: 0 }}
        dragElastic={0.4}
        onDrag={(_, info) => {
          if (info.offset.y < 0) appDragY.set(info.offset.y);
        }}
        onDragEnd={handleDragEnd}
        onClick={() => {
          if (!listening) {
            setListening(true);
            setTimeout(() => setListening(false), 2000);
          }
        }}
      />
    </div>
  );
};
