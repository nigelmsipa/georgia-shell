import React, { useRef, useState, useCallback } from "react";

const UtilityToken: React.FC<{
  label: string;
  onTap: () => void;
}> = ({ label, onTap }) => {
  const [flash, setFlash] = useState(false);

  const fire = (e: React.SyntheticEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setFlash(true);
    setTimeout(() => setFlash(false), 220);
    onTap();
  };

  return (
    <span
      role="button"
      tabIndex={0}
      onPointerDown={(e) => e.stopPropagation()}
      onClick={fire}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") fire(e);
      }}
      className="cursor-pointer font-serif italic select-none transition-all duration-200"
      style={{
        fontWeight: 600,
        color: flash
          ? "hsl(var(--primary))"
          : "hsl(var(--foreground) / 0.8)",
        background: flash
          ? "hsl(var(--primary) / 0.15)"
          : "transparent",
        borderRadius: 4,
        padding: "1px 4px",
        textDecoration: "underline",
        textDecorationColor: "hsl(var(--primary) / 0.3)",
        textUnderlineOffset: "3px",
        touchAction: "manipulation",
      }}
    >
      {label}
    </span>
  );
};

interface Props {
  open: boolean;
  onClose: () => void;
}

export const UtilityDrawer: React.FC<Props> = ({ open, onClose }) => {
  const dragRef = useRef({ startY: 0, dragging: false });
  const [dragOffset, setDragOffset] = useState(0);
  const closingRef = useRef(false);

  const dismiss = useCallback(() => {
    if (closingRef.current) return;
    closingRef.current = true;
    onClose();
    // allow re-open after animation settles
    setTimeout(() => { closingRef.current = false; }, 350);
  }, [onClose]);

  // Escape key closes
  React.useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") dismiss(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, dismiss]);

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    dragRef.current = { startY: e.clientY, dragging: true };
    setDragOffset(0);
    (e.currentTarget as HTMLElement).setPointerCapture?.(e.pointerId);
  }, []);

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!dragRef.current.dragging) return;
    const dy = e.clientY - dragRef.current.startY;
    if (dy > 0) setDragOffset(dy);
  }, []);

  const handlePointerUp = useCallback(() => {
    if (!dragRef.current.dragging) return;
    dragRef.current.dragging = false;
    if (dragOffset > 60) {
      dismiss();
    }
    setDragOffset(0);
  }, [dragOffset, dismiss]);

  // Clipboard actions (prototype stubs)
  const handleCopy = () => {
    try { document.execCommand("copy"); } catch {}
  };
  const handlePaste = () => {
    try { navigator.clipboard.readText().then(t => console.log("Paste:", t)); } catch {}
  };
  const handleCut = () => {
    try { document.execCommand("cut"); } catch {}
  };
  const handleSelectAll = () => {
    try { document.execCommand("selectAll"); } catch {}
  };
  const handleScreenshot = () => console.log("[Utility] Screenshot captured");
  const handleShare = () => console.log("[Utility] Share triggered");
  const handleKill = () => console.log("[Utility] Kill foreground app");

  if (!open) return null;

  const translateY = open ? dragOffset : 0;

  return (
    <>
      {/* Backdrop */}
      <div
        className="absolute inset-0 z-[60] transition-opacity duration-300"
        style={{
          opacity: 1,
          pointerEvents: "auto",
          background: "rgba(0, 0, 0, 0.25)",
        }}
        onPointerDown={(e) => { e.stopPropagation(); dismiss(); }}
      />

      {/* Drawer */}
      <div
        className="absolute left-0 right-0 bottom-0 z-[61] glass-surface"
        style={{
          height: "52%",
          borderTopLeftRadius: 24,
          borderTopRightRadius: 24,
          transform: open
            ? `translateY(${translateY}px)`
            : "translateY(105%)",
          transition: dragRef.current.dragging
            ? "none"
            : "transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)",
          pointerEvents: "auto",
          borderBottom: "none",
        }}
      >
        {/* Drag handle (tap or swipe down to close) */}
        <div
          className="flex justify-center pt-3 pb-4 cursor-pointer"
          style={{ touchAction: "none" }}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
        >
          <div
            style={{
              width: 36,
              height: 4,
              borderRadius: 2,
              background: "hsl(var(--foreground) / 0.2)",
            }}
          />
        </div>

        {/* Content */}
        <div className="px-6 overflow-y-auto" style={{ maxHeight: "calc(100% - 48px)" }}>
          {/* Title row with close */}
          <div className="flex items-baseline justify-between mb-5">
            <p
              className="font-serif text-lg"
              style={{ color: "hsl(var(--foreground) / 0.5)", fontStyle: "italic" }}
            >
              utilities
            </p>
            <UtilityToken label="close" onTap={dismiss} />
          </div>


          {/* Clipboard section */}
          <p
            className="font-serif text-base leading-relaxed mb-4"
            style={{ color: "hsl(var(--foreground) / 0.85)" }}
          >
            You can{" "}
            <UtilityToken label="copy" onTap={handleCopy} />,{" "}
            <UtilityToken label="cut" onTap={handleCut} />,{" "}
            or{" "}
            <UtilityToken label="paste" onTap={handlePaste} />{" "}
            from the clipboard. To grab everything,{" "}
            <UtilityToken label="select all" onTap={handleSelectAll} />.
          </p>

          {/* Screen tools */}
          <p
            className="font-serif text-base leading-relaxed mb-4"
            style={{ color: "hsl(var(--foreground) / 0.85)" }}
          >
            Take a{" "}
            <UtilityToken label="screenshot" onTap={handleScreenshot} />{" "}
            of what's on screen, or{" "}
            <UtilityToken label="share" onTap={handleShare} />{" "}
            it somewhere else.
          </p>

          {/* System */}
          <p
            className="font-serif text-base leading-relaxed mb-4"
            style={{ color: "hsl(var(--foreground) / 0.85)" }}
          >
            If something's stuck, you can{" "}
            <UtilityToken label="kill the foreground app" onTap={handleKill} />.
          </p>

          {/* Brightness slider */}
          <div className="mt-6 mb-3">
            <p
              className="font-serif text-sm italic mb-2"
              style={{ color: "hsl(var(--foreground) / 0.4)" }}
            >
              brightness
            </p>
            <input
              type="range"
              min={0}
              max={100}
              defaultValue={70}
              className="w-full accent-[hsl(var(--primary))]"
              style={{
                height: 4,
                opacity: 0.7,
              }}
            />
          </div>

          {/* Volume slider */}
          <div className="mb-6">
            <p
              className="font-serif text-sm italic mb-2"
              style={{ color: "hsl(var(--foreground) / 0.4)" }}
            >
              volume
            </p>
            <input
              type="range"
              min={0}
              max={100}
              defaultValue={50}
              className="w-full accent-[hsl(var(--primary))]"
              style={{
                height: 4,
                opacity: 0.7,
              }}
            />
          </div>
        </div>
      </div>
    </>
  );
};
