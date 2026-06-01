import React from "react";

export const MusicCover: React.FC = () => (
  <div className="w-full h-full flex flex-col items-center justify-center px-3 py-4 gap-2 bg-gradient-to-b from-secondary to-card">
    <div className="w-12 h-12 rounded-full shadow-lg bg-gradient-to-br from-muted via-secondary to-card" />
    <div className="text-center">
      <span className="text-[8px] font-serif block text-foreground">Come Thou Fount</span>
      <span className="text-[7px] block mt-0.5 text-muted-foreground">2:14</span>
    </div>
    <div className="w-full h-0.5 rounded-full mt-1 overflow-hidden bg-muted">
      <div className="w-[60%] h-full rounded-full bg-primary" />
    </div>
  </div>
);
