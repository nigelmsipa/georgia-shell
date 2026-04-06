import React, { useState } from "react";
import { HomeScreen } from "./HomeScreen";
import { Launcher } from "./Launcher";
import { AppSwitcher } from "./AppSwitcher";
import { NotificationsPane } from "./NotificationsPane";
import { AppOverlay } from "./AppOverlay";
import { ControlCenter } from "./ControlCenter";
import { ProseLauncher } from "./ProseLauncher";
import { LockScreen } from "./LockScreen";
import { SettingsApp } from "./SettingsApp";

export const Shell: React.FC = () => {
  const [locked, setLocked] = useState(true);
  const [launcher, setLauncher] = useState(false);
  const [switcher, setSwitcher] = useState(false);
  const [notifications, setNotifications] = useState(false);
  const [controlCenter, setControlCenter] = useState(false);
  const [proseLauncher, setProseLauncher] = useState(false);
  const [runningApp, setRunningApp] = useState<string | null>(null);

  const openApp = (name: string) => {
    setRunningApp(name);
  };
  const closeApp = () => setRunningApp(null);

  const anyOverlay = controlCenter || launcher || proseLauncher;

  return (
    <div className="relative w-full h-full overflow-hidden">
      {/* Base layer: Home */}
      <div
        className="absolute inset-0 transition-all duration-350"
        style={{
          filter: anyOverlay ? "blur(12px) brightness(0.7)" : "none",
          transform: anyOverlay ? "scale(1.02)" : "scale(1)",
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

      {/* Prose launcher trigger — left edge */}
      {!launcher && !switcher && !runningApp && !proseLauncher && !locked && (
        <button
          onClick={() => setProseLauncher(true)}
          className="absolute z-10 left-0 bg-card/80 rounded-r-sm px-1 py-6"
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

      <ControlCenter
        open={controlCenter}
        onClose={() => setControlCenter(false)}
      />

      <ProseLauncher
        open={proseLauncher}
        onClose={() => setProseLauncher(false)}
        onOpenApp={openApp}
      />

      {/* App running overlay — Settings gets its own component */}
      {runningApp && runningApp === "Settings" && (
        <SettingsApp onClose={closeApp} />
      )}
      {runningApp && runningApp !== "Settings" && (
        <AppOverlay appName={runningApp} onClose={closeApp} />
      )}

      {/* Lock screen — topmost layer */}
      {locked && <LockScreen onUnlock={() => setLocked(false)} />}
    </div>
  );
};