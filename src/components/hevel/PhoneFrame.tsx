import React from "react";

export const PhoneFrame: React.FC<{
  children: React.ReactNode;
  onNavigate?: (screen: string) => void;
}> = ({ children, onNavigate }) => {
  const screens = ["Lock", "Home", "Launcher", "Notifications", "Switcher", "Control Center", "Settings"];

  return (
    <div className="flex items-center justify-center min-h-screen bg-gruvbox-bg2 gap-6">
      <div
        className="relative overflow-hidden bg-background"
        style={{ width: 390, height: 844, borderRadius: 40, border: "3px solid hsl(var(--gruvbox-bg2))" }}
      >
        {children}
      </div>

      {/* Debug toolbar */}
      {onNavigate && (
        <div className="flex flex-col gap-2 py-4">
          <span className="text-[10px] text-gruvbox-fg2 uppercase tracking-widest mb-1 font-mono">screens</span>
          {screens.map((s) => (
            <button
              key={s}
              onClick={() => onNavigate(s)}
              className="text-left text-xs font-mono text-gruvbox-fg px-3 py-1.5 rounded hover:bg-gruvbox-bg1 transition-colors"
            >
              {s}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
