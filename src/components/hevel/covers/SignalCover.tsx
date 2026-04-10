import React from "react";

export const SignalCover: React.FC = () => (
  <div className="w-full h-full bg-[#1a1e23] flex flex-col justify-center px-3 py-4 gap-2">
    {/* Header */}
    <div className="flex items-center gap-1.5 mb-1">
      <div className="w-2.5 h-2.5 rounded-full bg-[#6a9f4d]" />
      <span className="text-[10px] font-serif text-white font-bold">Zack</span>
      <div className="ml-auto w-3.5 h-3.5 rounded-full bg-[#d94040] flex items-center justify-center">
        <span className="text-[6px] text-white font-bold">3</span>
      </div>
    </div>
    {/* Incoming bubble */}
    <div className="self-start bg-[#2a2f36] rounded-lg rounded-bl-sm px-2.5 py-1.5 max-w-[85%]">
      <span className="text-[8px] text-[#c8cdd3] leading-tight block">did you see the Sailfish demo</span>
    </div>
    {/* Outgoing bubble */}
    <div className="self-end bg-[#6b6e2a] rounded-lg rounded-br-sm px-2.5 py-1.5 max-w-[70%]">
      <span className="text-[8px] text-white leading-tight block">yes!! so good</span>
    </div>
    {/* Typing indicator */}
    <div className="self-start mt-1">
      <span className="text-[7px] text-[#555a60] italic">typing...</span>
    </div>
  </div>
);
