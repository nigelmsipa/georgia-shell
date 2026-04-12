import React from "react";

export const MessagesCover: React.FC = () => (
  <div className="w-full h-full flex flex-col px-3 py-3 gap-2" style={{ background: "#282828" }}>
    {/* Channel header */}
    <div className="flex items-center gap-1 pl-2" style={{ borderLeft: "2px solid #b16286" }}>
      <span className="text-[9px] font-bold font-serif" style={{ color: "#ebdbb2" }}># hevel:general</span>
    </div>
    {/* Messages */}
    <div className="flex flex-col gap-1.5 mt-1">
      <div>
        <span className="text-[7px] font-bold block" style={{ color: "#b16286" }}>anjan</span>
        <span className="text-[7px] block" style={{ color: "#a89984" }}>covers look good</span>
      </div>
      <div>
        <span className="text-[7px] font-bold block" style={{ color: "#b16286" }}>nigel</span>
        <span className="text-[7px] block" style={{ color: "#a89984" }}>need the launcher scrubber next</span>
      </div>
    </div>
  </div>
);
