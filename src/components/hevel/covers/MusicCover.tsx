import React from "react";

export const MusicCover: React.FC = () => (
  <div className="w-full h-full bg-gradient-to-b from-[#c8889a] to-[#a06878] flex flex-col items-center justify-center px-3 py-4 gap-2">
    {/* Album art circle */}
    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#d4a0b0] via-[#c890a8] to-[#907080] shadow-lg" />
    {/* Track info */}
    <div className="text-center mt-1">
      <span className="text-[8px] text-[#2a1520] font-serif block">Come Thou Fount</span>
      <span className="text-[7px] text-[#4a2a38] block mt-0.5">2:14</span>
    </div>
    {/* Progress bar */}
    <div className="w-full h-0.5 bg-[#8a5a6a] rounded-full mt-1 overflow-hidden">
      <div className="w-[60%] h-full bg-[#4488cc] rounded-full" />
    </div>
  </div>
);
