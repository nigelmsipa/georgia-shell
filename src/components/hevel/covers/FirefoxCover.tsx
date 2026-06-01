import React from "react";

export const FirefoxCover: React.FC = () => (
  <div className="w-full h-full flex flex-col px-3 py-3 gap-2 bg-card">
    {/* URL bar */}
    <div className="flex items-center gap-1.5 rounded px-2 py-1 bg-secondary">
      <div className="w-1.5 h-1.5 rounded-full bg-primary" />
      <span className="text-[6px] truncate text-muted-foreground">github.com/nigel/hev…</span>
    </div>
    {/* Page content */}
    <div className="flex items-center gap-1.5">
      <div className="w-3.5 h-3.5 rounded-full bg-muted" />
      <span className="text-[9px] font-bold font-serif text-foreground">nigel / hevel</span>
    </div>
    <div className="flex gap-2 mt-0.5">
      <span className="text-[7px] text-accent">Code</span>
      <span className="text-[7px] text-muted-foreground">Issues</span>
      <span className="text-[7px] text-muted-foreground">PRs</span>
    </div>
    <div className="h-px bg-secondary" />
    <span className="text-[7px] mt-0.5 text-muted-foreground">README.md — A minimal shell</span>
  </div>
);
