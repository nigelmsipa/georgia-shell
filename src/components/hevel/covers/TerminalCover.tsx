import React from "react";

export const TerminalCover: React.FC = () => (
  <div className="w-full h-full bg-[#1d2021] flex flex-col justify-center px-3 py-4 font-mono gap-0.5">
    <span className="text-[7px] text-[#7c8a6e] leading-relaxed">~/hevel $ cargo build --release</span>
    <span className="text-[7px] text-[#98971a] leading-relaxed">Compiling hevel v0.1.0</span>
    <span className="text-[7px] text-[#98971a] leading-relaxed">Compiling gtk3 v0.18.2</span>
    <span className="text-[7px] text-[#b8bb26] leading-relaxed font-bold">Finished [optimized] in 12.3s</span>
    <div className="mt-2 flex items-center gap-0.5">
      <span className="text-[7px] text-[#a89984] leading-relaxed">~/hevel $</span>
      <div className="w-1 h-2.5 bg-[#ebdbb2] animate-pulse" />
    </div>
  </div>
);
