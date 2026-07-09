import React, { useEffect, useRef } from "react";
import { motion, PanInfo } from "framer-motion";
import { SIDE_ZONE_WIDTH_DP } from "./nav-contract";
import { registerGestureZone } from "./GestureDebugOverlay";

interface Props {
  onOpenUtilityDrawer: () => void;
  onOpenAppSwitcher: () => void;
}

export const SidePill: React.FC<Props> = ({ onOpenUtilityDrawer, onOpenAppSwitcher }) => {
  const zoneRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    registerGestureZone("side-left", zoneRef.current);
    return () => registerGestureZone("side-left", null);
  }, []);

  const handleDragEnd = (_: any, info: PanInfo) => {
    if (info.offset.x > 30 || info.velocity.x > 300) {
      const angle = Math.atan2(info.offset.y, info.offset.x) * (180 / Math.PI);
      if (angle > 30) onOpenAppSwitcher();
      else onOpenUtilityDrawer();
    }
  };

  return (
    <div
      ref={zoneRef}
      className="absolute left-0 top-[40%] bottom-[40%] flex items-center justify-start z-[90] touch-none"
      style={{ width: SIDE_ZONE_WIDTH_DP }}
    >
      <motion.div
        className="w-1 h-16 rounded-r-md bg-[hsl(var(--muted-foreground)/0.3)] shadow-lg"
        drag
        dragConstraints={{ top: 0, bottom: 0, left: 0, right: 0 }}
        dragElastic={0.2}
        onDragEnd={handleDragEnd}
      />
    </div>
  );
};
