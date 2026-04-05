import React, { useState } from "react";
import { HomeScreen } from "./HomeScreen";
import { Launcher } from "./Launcher";
import { AppSwitcher } from "./AppSwitcher";
import { NotificationsPane } from "./NotificationsPane";
import { EdgePanel } from "./EdgePanel";
import { AppOverlay } from "./AppOverlay";
import { ControlCenter } from "./ControlCenter";

export const Shell: React.FC = () => {
  const [launcher, setLauncher] = useState(false);
  const [switcher, setSwitcher] = useState(false);
  const [notifications, setNotifications] = useState(false);
  const [edgePanel, setEdgePanel] = useState(false);
  const [controlCenter, setControlCenter] = useState(false);
  const [runningApp, setRunningApp] = useState<string | null>(null);

  const openApp = (name: string) => setRunningApp(name);
  const closeApp = () => setRunningApp(null);

  return (
    <div className="relative w-full h-full overflow-hidden">
      {/* Base layer: Home — blurs when control center is open */}
      <div
        className="absolute inset-0 transition-all duration-350"
        style={{
          filter: controlCenter ? "blur(12px) brightness(0.7)" : "none",
          transform: controlCenter ? "scale(1.02)" : "scale(1)",
          transitionTimingFunction: "cubic-bezier(0.16, 1, 0.3, 1)",
        }}
      >
        <HomeScreen
          onOpenLauncher={() => setLauncher(true)}
          onOpenApp={openApp}
          onSwipeToNotifications={() => setNotifications(true)}
          onOpenSwitcher={() => setSwitcher(true)}
          onOpenControlCenter={() => setControlCenter(true)}
        />
      </div>

      {/* Edge panel tab */}
      {!edgePanel && !launcher && !switcher && !runningApp && (
        <button
          onClick={() => setEdgePanel(true)}
          className="absolute z-10 right-0 bg-card/80 rounded-l-sm px-1 py-6"
          style={{ top: "50%", transform: "translateY(-50%)" }}
        >
          <span
            className="text-muted-foreground font-serif"
            style={{ fontSize: 9, writingMode: "vertical-rl" }}
          >
            apps
          </span>
        </button>
      )}

      {/* Layers */}
      <NotificationsPane
        open={notifications}
        onClose={() => setNotifications(false)}
      />

      <Launcher
        open={launcher}
        onClose={() => setLauncher(false)}
        onOpenApp={openApp}
      />

      <AppSwitcher
        open={switcher}
        onClose={() => setSwitcher(false)}
        onOpenApp={openApp}
      />

      <EdgePanel
        open={edgePanel}
        onClose={() => setEdgePanel(false)}
        onOpenApp={openApp}
      />

      <ControlCenter
        open={controlCenter}
        onClose={() => setControlCenter(false)}
      />

      {/* App running overlay */}
      {runningApp && (
        <AppOverlay appName={runningApp} onClose={closeApp} />
      )}
    </div>
  );
};
