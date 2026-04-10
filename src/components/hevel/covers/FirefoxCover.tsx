import React from "react";

export const FirefoxCover: React.FC = () => (
  <div className="w-full h-full bg-[#0d1117] flex flex-col px-3 py-3 gap-2">
    {/* URL bar */}
    <div className="flex items-center gap-1.5 bg-[#161b22] rounded px-2 py-1">
      <div className="w-1.5 h-1.5 rounded-full bg-[#e8863a]" />
      <span className="text-[6px] text-[#7d8590] truncate">github.com/nigel/hev…</span>
    </div>
    {/* Repo header */}
    <div className="flex items-center gap-1.5 mt-1">
      <div className="w-3.5 h-3.5 rounded-full bg-[#3a3f47]" />
      <span className="text-[9px] text-white font-bold font-serif">nigel / hevel</span>
    </div>
    {/* Tabs */}
    <div className="flex gap-3 mt-1">
      <span className="text-[7px] text-[#7d8590]">Code</span>
      <span className="text-[7px] text-[#7d8590]">Issues</span>
      <span className="text-[7px] text-[#7d8590]">PRs</span>
    </div>
    <div className="h-px bg-[#21262d]" />
    {/* README */}
    <span className="text-[7px] text-[#7d8590] mt-0.5">README.md — A minimal shell</span>
  </div>
);
