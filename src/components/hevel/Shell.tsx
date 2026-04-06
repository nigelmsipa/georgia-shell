import React, { useState } from "react";
import { HomeScreen } from "./HomeScreen";
import { Launcher } from "./Launcher";
import { AppSwitcher } from "./AppSwitcher";
import { NotificationsPane } from "./NotificationsPane";
import { EdgePanel } from "./EdgePanel";
import { AppOverlay } from "./AppOverlay";
import { ControlCenter } from "./ControlCenter";
import { TypographicLauncher } from "./TypographicLauncher";
import { ProseLauncher } from "./ProseLauncher";
import { MonogramLauncher } from "./MonogramLauncher";
import { DotsLauncher } from "./DotsLauncher";
import { LockScreen } from "./LockScreen";
import { SettingsApp } from "./SettingsApp";

export const Shell: React.FC = () => {
  const [locked, setLocked] = useState(true);
  const [launcher, setLauncher] = useState(false);
  const [switcher, setSwitcher] = useState(false);
  const [notifications, setNotifications] = useState(false);
  const [edgePanel, setEdgePanel] = useState(false);
  const [controlCenter, setControlCenter] = useState(false);
  const [runningApp, setRunningApp] = useState<string | null>(null);

  // New launchers
  const [typoLauncher, setTypoLauncher] = useState(false);
  const [monoLauncher, setMonoLauncher] = useState(false);
  const [dotsLauncher, setDotsLauncher] = useState(false);
  const [proseLauncher, setProseLauncher] = useState(false);

  const openApp = (name: string) => {
    if (name === "Settings") {
      setRunningApp("Settings");
    } else {
      setRunningApp(name);
    }
  };
  const closeApp = () => setRunningApp(null);

  const anyOverlay = controlCenter || launcher || typoLauncher || monoLauncher || dotsLauncher || proseLauncher;

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

      {/* Edge panel tab */}
      {!edgePanel && !launcher && !switcher && !runningApp && !typoLauncher && !monoLauncher && !dotsLauncher && !proseLauncher && !locked && (
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

      {/* Three launcher triggers — left edge, stacked vertically */}
      {!edgePanel && !launcher && !switcher && !runningApp && !typoLauncher && !monoLauncher && !dotsLauncher && !proseLauncher && !locked && (
        <div
          className="absolute z-10 left-0 flex flex-col gap-3"
          style={{ top: "42%", transform: "translateY(-50%)" }}
        >
          <button
            onClick={() => setTypoLauncher(true)}
            className="bg-card/80 rounded-r-sm px-1 py-3"
          >
            <span
              className="text-muted-foreground font-serif"
              style={{ fontSize: 8, writingMode: "vertical-rl" }}
            >
              typo
            </span>
          </button>
          <button
            onClick={() => setMonoLauncher(true)}
            className="bg-card/80 rounded-r-sm px-1 py-3"
          >
            <span
              className="text-muted-foreground font-serif"
              style={{ fontSize: 8, writingMode: "vertical-rl" }}
            >
              mono
            </span>
          </button>
          <button
            onClick={() => setDotsLauncher(true)}
            className="bg-card/80 rounded-r-sm px-1 py-3"
          >
            <span
              className="text-muted-foreground font-serif"
              style={{ fontSize: 8, writingMode: "vertical-rl" }}
            >
              dots
            </span>
          </button>
          <button
            onClick={() => setProseLauncher(true)}
            className="bg-card/80 rounded-r-sm px-1 py-3"
          >
            <span
              className="text-muted-foreground font-serif"
              style={{ fontSize: 8, writingMode: "vertical-rl" }}
            >
              prose
            </span>
          </button>
        </div>
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

      {/* New launchers */}
      <TypographicLauncher
        open={typoLauncher}
        onClose={() => setTypoLauncher(false)}
        onOpenApp={openApp}
      />

      <MonogramLauncher
        open={monoLauncher}
        onClose={() => setMonoLauncher(false)}
        onOpenApp={openApp}
      />

      <DotsLauncher
        open={dotsLauncher}
        onClose={() => setDotsLauncher(false)}
        onOpenApp={openApp}
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
