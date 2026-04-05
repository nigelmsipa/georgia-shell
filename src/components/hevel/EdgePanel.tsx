import React, { useState } from "react";
import { RECENT_APPS, ALL_APPS } from "./types";

interface Props {
  open: boolean;
  onClose: () => void;
  onOpenApp: (name: string) => void;
}

export const EdgePanel: React.FC<Props> = ({ open, onClose, onOpenApp }) => {
  const [search, setSearch] = useState("");

  const pinnedApps = RECENT_APPS.slice(0, 4);
  const filteredSearch = search
    ? ALL_APPS.filter((a) => a.toLowerCase().includes(search.toLowerCase()))
    : [];

  if (!open) return null;

  return (
    <>
      {/* Scrim */}
      <div
        className="absolute inset-0 z-45"
        style={{ backgroundColor: "hsl(var(--background) / 0.5)", zIndex: 45 }}
        onClick={onClose}
      />
      {/* Panel */}
      <div
        className="absolute z-50 bg-card rounded-sm overflow-hidden"
        style={{
          top: 80,
          right: 12,
          width: 210,
          maxHeight: 500,
          boxShadow: "0 8px 32px hsl(var(--background) / 0.6)",
          transition: "opacity 0.25s ease-out, transform 0.25s ease-out",
        }}
      >
        <div className="p-4">
          <span className="text-xs text-muted-foreground/60 font-serif">switch to</span>
          <div className="mt-3 space-y-1">
            {pinnedApps.map((app) => (
              <button
                key={app.name}
                onClick={() => { onOpenApp(app.name); onClose(); }}
                className="block w-full text-left text-base text-foreground font-serif py-1.5 hover:text-primary transition-colors duration-150"
              >
                {app.name}
              </button>
            ))}
          </div>
          <div className="mt-4">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="search apps"
              className="w-full bg-secondary/50 text-foreground font-serif text-sm px-3 py-2 rounded-sm border-none outline-none placeholder:text-muted-foreground"
            />
          </div>
          {filteredSearch.length > 0 && (
            <div className="mt-2 max-h-40 overflow-y-auto space-y-1">
              {filteredSearch.map((app) => (
                <button
                  key={app}
                  onClick={() => { onOpenApp(app); onClose(); setSearch(""); }}
                  className="block w-full text-left text-sm text-foreground font-serif py-1 hover:text-primary transition-colors duration-150"
                >
                  {app}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
};
