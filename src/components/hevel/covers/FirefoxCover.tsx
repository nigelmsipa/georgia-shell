import React from "react";

export const FirefoxCover: React.FC = () => (
  <div className="w-full h-full flex flex-col px-3 py-3 gap-2" style={{ background: "#282828" }}>
    {/* URL bar */}
    <div className="flex items-center gap-1.5 rounded px-2 py-1" style={{ background: "#3c3836" }}>
      <div className="w-1.5 h-1.5 rounded-full" style={{ background: "#d65d0e" }} />
      <span className="text-[6px] truncate" style={{ color: "#a89984" }}>github.com/nigel/hev…</span>
    </div>
    {/* Repo header */}
    <div className="flex items-center gap-1.5 mt-1">
      <div className="w-3.5 h-3.5 rounded-full" style={{ background: "#504945" }} />
      <span className="text-[9px] font-bold font-serif" style={{ color: "#ebdbb2" }}>nigel / hevel</span>
    </div>
    {/* Tabs */}
    <div className="flex gap-3 mt-1">
      <span className="text-[7px]" style={{ color: "#458588" }}>Code</span>
      <span className="text-[7px]" style={{ color: "#a89984" }}>Issues</span>
      <span className="text-[7px]" style={{ color: "#a89984" }}>PRs</span>
    </div>
    <div className="h-px" style={{ background: "#3c3836" }} />
    {/* README */}
    <span className="text-[7px] mt-0.5" style={{ color: "#a89984" }}>README.md — A minimal shell</span>
  </div>
);
