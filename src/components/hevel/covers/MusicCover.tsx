import React from "react";

export const MusicCover: React.FC = () => (
  <div className="w-full h-full flex flex-col items-center justify-center px-3 py-4 gap-2" style={{ background: "linear-gradient(to bottom, #3c3836, #32302f)" }}>
    {/* Album art circle */}
    <div className="w-12 h-12 rounded-full shadow-lg" style={{ background: "linear-gradient(135deg, #504945, #3c3836, #282828)" }} />
    {/* Track info */}
    <div className="text-center mt-1">
      <span className="text-[8px] font-serif block" style={{ color: "#ebdbb2" }}>Come Thou Fount</span>
      <span className="text-[7px] block mt-0.5" style={{ color: "#a89984" }}>2:14</span>
    </div>
    {/* Progress bar */}
    <div className="w-full h-0.5 rounded-full mt-1 overflow-hidden" style={{ background: "#504945" }}>
      <div className="w-[60%] h-full rounded-full" style={{ background: "#d79921" }} />
    </div>
  </div>
);
