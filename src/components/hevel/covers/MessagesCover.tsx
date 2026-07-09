import React from "react";

export const MessagesCover: React.FC = () => (
  <div className="w-full h-full flex flex-col px-3 py-3 gap-2 bg-card">
    <div className="flex items-center gap-1 pl-2 border-l-2 border-accent">
      <span className="text-[9px] font-bold text-foreground"># hevel:general</span>
    </div>
    <div className="flex-1 flex flex-col gap-1.5">
      <div>
        <span className="text-[7px] font-bold block text-accent">anjan</span>
        <span className="text-[7px] block text-muted-foreground">covers look good</span>
      </div>
      <div>
        <span className="text-[7px] font-bold block text-accent">nigel</span>
        <span className="text-[7px] block text-muted-foreground">need the launcher scrubber next</span>
      </div>
    </div>
  </div>
);
