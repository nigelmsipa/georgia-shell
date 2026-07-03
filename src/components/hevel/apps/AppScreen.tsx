import React, { useState } from "react";
import { motion, useAnimation, PanInfo } from "framer-motion";
import { AtmosphericBg } from "../AtmosphericBg";

interface Props {
  appName: string;
  onClose: () => void;
  onOpenUtilityDrawer?: () => void;
  children: React.ReactNode;
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
  children,
}) => {
  const [time, setTime] = useState(new Date());

  React.useEffect(() => {
    const id = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const hours = time.getHours().toString().padStart(2, "0");
  const minutes = time.getMinutes().toString().padStart(2, "0");

  const handleDragEnd = (event: any, info: PanInfo) => {
    if (info.offset.y > 120 || info.velocity.y > 600) {
      onClose(); // Dragged down -> close
    } else if (info.offset.y < -80 || info.velocity.y < -600) {
      if (onOpenUtilityDrawer) onOpenUtilityDrawer(); // Dragged up -> drawer
    }
  };

  return (
    <motion.div
      className="absolute inset-0 z-50 flex flex-col bg-background select-none"
      drag="y"
      dragConstraints={{ top: 0, bottom: 0 }}
      dragElastic={0.3}
      onDragEnd={handleDragEnd}
      initial={{ opacity: 0, scale: 0.96, y: 10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.96, y: 50 }}
      transition={{ type: "spring", stiffness: 450, damping: 45 }}
    >
      <AtmosphericBg />

      {/* Status bar — time on left, whisper app name centered */}
      <div className="relative z-10 flex items-center justify-between px-5 pt-12 pb-3">
        <span
          className="font-serif tracking-tight"
          style={{
            fontSize: 13,
            color: "hsl(var(--foreground) / 0.45)",
            letterSpacing: "0.02em",
          }}
        >
          {hours}:{minutes}
        </span>
        <span
          className="font-serif italic"
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

      {/* Drag hint at top */}
      <div className="relative z-10 flex justify-center" style={{ marginTop: -4, marginBottom: 4 }}>
        <div
          className="rounded-full"
          style={{
            width: 32,
            height: 3,
            background: "hsl(var(--muted-foreground) / 0.15)",
          }}
        />
      </div>

      {/* Content */}
      <div className="relative z-10 flex-1 flex flex-col overflow-hidden">
        {children}
      </div>
    </motion.div>
  );
};
