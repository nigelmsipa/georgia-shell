import React, { useState } from "react";
import { AppScreen } from "./AppScreen";

interface Props {
  onClose: () => void;
  onOpenUtilityDrawer?: () => void;
}

const DIAL_PAD = [
  ["1", "2", "3"],
  ["4", "5", "6"],
  ["7", "8", "9"],
  ["*", "0", "#"],
];

export const Phone: React.FC<Props> = ({ onClose, onOpenUtilityDrawer }) => {
  const [number, setNumber] = useState("");
  const [calling, setCalling] = useState(false);
  const [callTime, setCallTime] = useState(0);
  const [callTimer, setCallTimer] = useState<ReturnType<typeof setInterval> | null>(null);

  const startCall = () => {
    if (!number) return;
    setCalling(true);
    setCallTime(0);
    const id = setInterval(() => setCallTime((t) => t + 1), 1000);
    setCallTimer(id);
  };

  const endCall = () => {
    setCalling(false);
    if (callTimer) {
      clearInterval(callTimer);
      setCallTimer(null);
    }
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60).toString().padStart(2, "0");
    const s = (secs % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  const handleDial = (key: string) => {
    setNumber((prev) => prev + key);
  };

  const handleDelete = () => {
    setNumber((prev) => prev.slice(0, -1));
  };

  return (
    <AppScreen appName="phone" onClose={onClose} onOpenUtilityDrawer={onOpenUtilityDrawer}>
      <div className="flex-1 flex flex-col items-center justify-end pb-12" style={{ touchAction: "auto" }}>
        
        {calling ? (
          // In-call screen
          <div className="flex-1 flex flex-col items-center justify-center w-full">
            <span className="italic" style={{ fontSize: 18, color: "hsl(var(--muted-foreground) / 0.7)" }}>
              calling
            </span>
            <span className="mt-2" style={{ fontSize: 32, color: "hsl(var(--foreground) / 0.9)" }}>
              {number}
            </span>
            <span className="italic mt-6" style={{ fontSize: 14, color: "hsl(var(--primary) / 0.8)" }}>
              {formatTime(callTime)}
            </span>
            
            <button
              onClick={endCall}
              className="mt-16 w-16 h-16 rounded-full flex items-center justify-center italic text-body"
              style={{
                background: "hsl(var(--destructive) / 0.8)",
                color: "hsl(var(--destructive-foreground))",
                border: "2px solid hsl(var(--background))",
                boxShadow: "0 4px 12px rgba(255, 0, 0, 0.2)",
              }}
            >
              end
            </button>
          </div>
        ) : (
          // Dial pad
          <div className="w-full max-w-[280px] flex flex-col items-center">
            {/* Number Display */}
            <div className="w-full flex items-center justify-between mb-8 px-4 h-12">
              <span className="" style={{ fontSize: 32, color: "hsl(var(--foreground) / 0.9)", letterSpacing: "2px" }}>
                {number}
              </span>
              {number && (
                <button
                  onClick={handleDelete}
                  className="italic text-caption"
                  style={{ color: "hsl(var(--muted-foreground) / 0.6)" }}
                >
                  del
                </button>
              )}
            </div>

            {/* Pad */}
            <div className="flex flex-col gap-6 w-full px-6">
              {DIAL_PAD.map((row, i) => (
                <div key={i} className="flex justify-between w-full">
                  {row.map((key) => (
                    <button
                      key={key}
                      onClick={() => handleDial(key)}
                      className="tap-target w-tap h-tap text-title transition-colors active:bg-secondary/50"
                      style={{ color: "hsl(var(--foreground) / 0.8)" }}
                    >
                      {key}
                    </button>
                  ))}
                </div>
              ))}
              
              <div className="flex justify-center w-full mt-4">
                <button
                  onClick={startCall}
                  disabled={!number}
                  className="tap-target w-tap h-tap italic text-body transition-transform active:scale-95"
                  style={{
                    background: "hsl(var(--primary) / 0.8)",
                    color: "hsl(var(--primary-foreground))",
                    opacity: number ? 1 : 0.5,
                  }}
                >
                  call
                </button>

              </div>
            </div>
          </div>
        )}
      </div>
    </AppScreen>
  );
};
