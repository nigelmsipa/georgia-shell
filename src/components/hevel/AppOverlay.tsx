import React from "react";
import { AtmosphericBg } from "./AtmosphericBg";

interface Props {
  appName: string;
  onClose: () => void;
}

export const AppOverlay: React.FC<Props> = ({ appName, onClose }) => (
  <div
    className="absolute inset-0 z-50 flex flex-col items-center justify-center"
    style={{ transition: "opacity 0.3s ease-out" }}
  >
    <AtmosphericBg />
    <span
      className="text-3xl font-serif mb-8"
      style={{ color: "hsl(var(--foreground) / 0.85)", textShadow: "0 0 40px rgba(215, 153, 33, 0.08)" }}
    >
      {appName}
    </span>
    <button
      onClick={onClose}
      className="font-serif text-lg transition-colors duration-200"
      style={{ color: "hsl(var(--muted-foreground) / 0.4)" }}
    >
      ← back
    </button>
  </div>
);
