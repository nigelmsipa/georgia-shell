import React, { useState } from "react";
import { motion, PanInfo, MotionValue } from "framer-motion";

interface Props {
  onCloseApp: () => void;
  appDragY: MotionValue<number>;
  onScrubLeft: () => void;
  onScrubRight: () => void;
}

export const HevelBar: React.FC<Props> = ({ onCloseApp, appDragY, onScrubLeft, onScrubRight }) => {
  const [listening, setListening] = useState(false);

  const handleDragEnd = (e: any, info: PanInfo) => {
    // Swipe up (close)
    if (info.offset.y < -60 || info.velocity.y < -500) {
      onCloseApp();
    }
    // Scrub left/right
    else if (info.offset.x < -60 || info.velocity.x < -500) {
      onScrubLeft();
    } else if (info.offset.x > 60 || info.velocity.x > 500) {
      onScrubRight();
    }

    // Always snap back
    appDragY.set(0);
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
        className="w-32 h-[4px] rounded-full bg-[hsl(var(--muted-foreground)/0.3)] shadow-lg"
        drag
        dragConstraints={{ top: 0, bottom: 0, left: 0, right: 0 }}
        dragElastic={0.4}
        onDrag={(e, info) => {
          // Only pass negative Y (pulling up) to the app container
          if (info.offset.y < 0) {
            appDragY.set(info.offset.y);
          }
        }}
        onDragEnd={handleDragEnd}
        onClick={() => {
          if (!listening) {
            setListening(true);
            setTimeout(() => {
              setListening(false);
              // In a real app we'd trigger a toast here
            }, 2000);
          }
        }}
        style={{ y: appDragY }} // The bar itself moves up slightly with the drag
      />
    </div>
  );
};
