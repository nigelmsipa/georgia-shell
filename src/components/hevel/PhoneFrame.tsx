import React from "react";

export const PhoneFrame: React.FC<{
  children: React.ReactNode;
  onNavigate?: (screen: string) => void;
}> = ({ children, onNavigate }) => {
  const screens = ["Lock", "Home", "Launcher", "Notifications", "Switcher", "Control Center", "Settings"];

  return (
    <div
      className="flex items-center justify-center min-h-screen gap-6"
      style={{ background: "#1d2021" }}
    >
      <div
        className="relative overflow-hidden"
        style={{
          width: 390,
          height: 844,
          borderRadius: 40,
          border: "3px solid #32302f",
          boxShadow: "inset 0 0 0 1px rgba(235, 219, 178, 0.04), 0 0 60px rgba(0, 0, 0, 0.5)",
          background: "#282828",
        }}
      >
        {children}
      </div>

      {/* Debug toolbar */}
      {onNavigate && (
        <div className="flex flex-col gap-2 py-4">
          <span
            className="text-[10px] uppercase tracking-widest mb-1 font-mono"
            style={{ color: "#a89984" }}
          >
            screens
          </span>
          {screens.map((s) => (
            <button
              key={s}
              onClick={() => onNavigate(s)}
              className="text-left text-xs font-mono px-3 py-1.5 rounded transition-colors"
              style={{ color: "#ebdbb2" }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "#3c3836")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
            >
              {s}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
