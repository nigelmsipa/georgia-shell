import React from "react";

export const TerminalCover: React.FC = () => (
  <div className="w-full h-full flex flex-col justify-center px-3 py-4 font-mono gap-0.5 bg-background">
    <span className="text-[7px] leading-relaxed text-muted-foreground">~/hevel $ cargo build --release</span>
    <span className="text-[7px] leading-relaxed text-accent">Compiling hevel v0.1.0</span>
    <span className="text-[7px] leading-relaxed text-accent">Compiling gtk3 v0.18.2</span>
    <span className="text-[7px] leading-relaxed font-bold text-primary">Finished [optimized] in 12.3s</span>
    <div className="flex items-center gap-1 mt-1">
      <span className="text-[7px] leading-relaxed text-muted-foreground">~/hevel $</span>
      <div className="w-1 h-2.5 animate-pulse bg-foreground" />
    </div>
  </div>
);
