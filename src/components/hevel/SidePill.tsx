import React from "react";
import { motion, PanInfo } from "framer-motion";

interface Props {
  onOpenUtilityDrawer: () => void;
  onOpenAppSwitcher: () => void;
}

export const SidePill: React.FC<Props> = ({ onOpenUtilityDrawer, onOpenAppSwitcher }) => {
  const handleDragEnd = (e: any, info: PanInfo) => {
    // We only care about inward (right) swipes from the left edge
    if (info.offset.x > 30 || info.velocity.x > 300) {
      // Calculate angle
      // dx is positive, dy is positive if swiping down
      const dx = info.offset.x;
      const dy = info.offset.y;
      
      // Angle in degrees below horizontal (0 is straight right, 90 is straight down)
      const angle = Math.atan2(dy, dx) * (180 / Math.PI);
      
      if (angle > 30) {
        // Diagonal down
        onOpenAppSwitcher();
      } else {
        // Straight inward
        onOpenUtilityDrawer();
      }
    }
  };

  return (
    <div className="absolute left-0 top-[40%] bottom-[40%] w-4 flex items-center justify-start z-[90] touch-none">
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
