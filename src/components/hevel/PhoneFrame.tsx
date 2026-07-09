import React from "react";
import { useIsMobile } from "@/hooks/use-mobile";

export const PhoneFrame: React.FC<{
  children: React.ReactNode;
  onNavigate?: (screen: string) => void;
}> = ({ children, onNavigate }) => {
  const isMobile = useIsMobile();
  const screens = ["Lock", "Home", "Launcher", "Recents", "Notifications", "Control Center", "Utility", "Settings"];

  // On mobile: fullscreen, no frame chrome
  if (isMobile) {
    return (
      <div className="relative w-screen h-screen overflow-hidden bg-background">
        {children}
      </div>
    );
  }

  // On desktop: phone frame + debug toolbar
  return (
    <div
      className="flex items-center justify-center min-h-screen gap-6 bg-background"
    >
      <div
        className="relative overflow-hidden bg-background"
        style={{
          width: 390,
          height: 844,
          borderRadius: 40,
          border: "3px solid hsl(var(--border))",
          boxShadow: "inset 0 0 0 1px hsl(var(--glass-highlight, var(--border))), 0 0 60px rgba(0, 0, 0, 0.5)",
        }}
      >
        {children}
      </div>


      {onNavigate && (
        <div className="flex flex-col gap-2 py-4">
          <span
            className="text-[10px] uppercase tracking-widest mb-1 font-mono text-muted-foreground"
          >
            screens
          </span>
          {screens.map((s) => (
            <button
              key={s}
              onClick={() => onNavigate(s)}
              className="text-left text-caption font-mono px-3 py-1.5 rounded transition-colors text-foreground hover:bg-secondary"
            >
              {s}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
