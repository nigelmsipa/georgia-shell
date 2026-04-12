import React from "react";

export const NotesCover: React.FC = () => (
  <div className="w-full h-full flex flex-col justify-center px-3 py-4" style={{ background: "#3c3836" }}>
    <span className="text-[7px] tracking-[0.15em] font-bold uppercase mb-1.5" style={{ color: "#98971a" }}>
      Ecclesiastes 9
    </span>
    <p className="text-[8px] leading-[1.5] font-serif" style={{ color: "#ebdbb2" }}>
      Whatever your hand finds to do, do it with your might, for there is no work or thought or knowledge or wisdom in Sheol.
    </p>
  </div>
);
