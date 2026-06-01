import React from "react";

export const SignalCover: React.FC = () => (
  <div className="w-full h-full flex flex-col justify-center px-3 py-4 gap-2 bg-card">
    {/* Header */}
    <div className="flex items-center gap-1.5">
      <div className="w-2.5 h-2.5 rounded-full bg-primary" />
      <span className="text-[10px] font-serif font-bold text-foreground">Zack</span>
      <div className="ml-auto w-3.5 h-3.5 rounded-full flex items-center justify-center bg-destructive">
        <span className="text-[6px] font-bold text-destructive-foreground">3</span>
      </div>
    </div>
    {/* Inbound */}
    <div className="self-start rounded-lg rounded-bl-sm px-2.5 py-1.5 max-w-[85%] bg-secondary">
      <span className="text-[8px] leading-tight block text-muted-foreground">did you see the Sailfish demo</span>
    </div>
    {/* Outbound */}
    <div className="self-end rounded-lg rounded-br-sm px-2.5 py-1.5 max-w-[70%] bg-accent">
      <span className="text-[8px] leading-tight block text-accent-foreground">yes!! so good</span>
    </div>
    <div className="flex items-center gap-1 mt-0.5">
      <span className="text-[7px] italic text-muted-foreground/60">typing...</span>
    </div>
  </div>
);
