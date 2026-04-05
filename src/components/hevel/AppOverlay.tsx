import React from "react";

interface Props {
  appName: string;
  onClose: () => void;
}

export const AppOverlay: React.FC<Props> = ({ appName, onClose }) => (
  <div
    className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-background"
    style={{ transition: "opacity 0.3s ease-out" }}
  >
    <span className="text-3xl text-foreground font-serif mb-8">{appName}</span>
    <button
      onClick={onClose}
      className="text-muted-foreground font-serif text-lg hover:text-foreground transition-colors duration-200"
    >
      ← back
    </button>
  </div>
);
