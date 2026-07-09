import React, { useState } from "react";
import { motion, MotionValue } from "framer-motion";
import { AtmosphericBg } from "../AtmosphericBg";

interface Props {
  appName: string;
  onClose: () => void;
  onOpenUtilityDrawer?: () => void;
  children: React.ReactNode;
  appDragY?: MotionValue<number>;
}

/**
 * Shared shell for mock Havel apps. Provides:
 *  - AtmosphericBg + status bar with whisper app name
 *  - Swipe-down-from-top to close
 *  - Swipe-up-from-bottom to open the utility drawer
 *  - Rubber-band drag affordance while pulling down
 */
export const AppScreen: React.FC<Props> = ({
  appName,
  onClose,
  onOpenUtilityDrawer,
  appDragY,
  children,
}) => {
  const [time, setTime] = useState(new Date());

  React.useEffect(() => {
    const id = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const hours = time.getHours().toString().padStart(2, "0");
  const minutes = time.getMinutes().toString().padStart(2, "0");

  return (
    <motion.div
      className="absolute inset-0 z-50 flex flex-col bg-background select-none"
      initial={{ opacity: 0, scale: 0.96, y: 10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.96, y: 50 }}
      transition={{ type: "spring", stiffness: 450, damping: 45 }}
      style={{ y: appDragY }}
    >
      <AtmosphericBg />

      {/* Status bar — time on left, whisper app name centered */}
      <div className="relative z-10 flex items-center justify-between px-5 pt-12 pb-3">
        <span
          className="tracking-tight"
          style={{
            fontSize: 13,
            color: "hsl(var(--foreground) / 0.45)",
            letterSpacing: "0.02em",
          }}
        >
          {hours}:{minutes}
        </span>
        <span
          className="italic"
          style={{
            fontSize: 11,
            color: "hsl(var(--muted-foreground) / 0.35)",
            letterSpacing: "0.08em",
          }}
        >
          {appName.toLowerCase()}
        </span>
        <span style={{ width: 32 }} />
      </div>



      {/* Content */}
      <div className="relative z-10 flex-1 flex flex-col overflow-hidden">
        {children}
      </div>
    </motion.div>
  );
};
