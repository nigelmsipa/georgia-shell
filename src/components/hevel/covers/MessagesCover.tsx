import React from "react";

export const MessagesCover: React.FC = () => (
  <div className="w-full h-full bg-[#1a2233] flex flex-col px-3 py-3 gap-2">
    {/* Channel header */}
    <div className="flex items-center gap-1 border-l-2 border-[#3b82f6] pl-2">
      <span className="text-[9px] text-white font-bold font-serif"># hevel:general</span>
    </div>
    {/* Messages */}
    <div className="flex flex-col gap-1.5 mt-1">
      <div>
        <span className="text-[7px] text-[#4ade80] font-bold block">anjan</span>
        <span className="text-[7px] text-[#8b95a5] block">covers look good</span>
      </div>
      <div>
        <span className="text-[7px] text-[#4ade80] font-bold block">nigel</span>
        <span className="text-[7px] text-[#8b95a5] block">need the launcher scrubber next</span>
      </div>
    </div>
  </div>
);
