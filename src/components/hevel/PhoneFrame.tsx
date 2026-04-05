import React from "react";

export const PhoneFrame: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="flex items-center justify-center min-h-screen bg-gruvbox-bg2">
    <div
      className="relative overflow-hidden bg-background"
      style={{ width: 390, height: 844, borderRadius: 40, border: "3px solid hsl(var(--gruvbox-bg2))" }}
    >
      {children}
    </div>
  </div>
);
