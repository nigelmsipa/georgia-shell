import React from "react";

export const SignalCover: React.FC = () => (
  <div className="w-full h-full flex flex-col justify-center px-3 py-4 gap-2" style={{ background: "#32302f" }}>
    {/* Header */}
    <div className="flex items-center gap-1.5 mb-1">
      <div className="w-2.5 h-2.5 rounded-full" style={{ background: "#98971a" }} />
      <span className="text-[10px] font-serif font-bold" style={{ color: "#ebdbb2" }}>Zack</span>
      <div className="ml-auto w-3.5 h-3.5 rounded-full flex items-center justify-center" style={{ background: "#cc241d" }}>
        <span className="text-[6px] font-bold" style={{ color: "#ebdbb2" }}>3</span>
      </div>
    </div>
    {/* Incoming bubble */}
    <div className="self-start rounded-lg rounded-bl-sm px-2.5 py-1.5 max-w-[85%]" style={{ background: "#3c3836" }}>
      <span className="text-[8px] leading-tight block" style={{ color: "#a89984" }}>did you see the Sailfish demo</span>
    </div>
    {/* Outgoing bubble */}
    <div className="self-end rounded-lg rounded-br-sm px-2.5 py-1.5 max-w-[70%]" style={{ background: "#458588" }}>
      <span className="text-[8px] leading-tight block" style={{ color: "#ebdbb2" }}>yes!! so good</span>
    </div>
    {/* Typing indicator */}
    <div className="self-start mt-1">
      <span className="text-[7px] italic" style={{ color: "#665c54" }}>typing...</span>
    </div>
  </div>
);
