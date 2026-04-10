import React, { useState } from "react";
import { HomeScreen } from "./HomeScreen";
import { AppSwitcher } from "./AppSwitcher";
import { NotificationsPane } from "./NotificationsPane";
import { AppOverlay } from "./AppOverlay";
import { ControlCenter } from "./ControlCenter";
import { ProseLauncher } from "./ProseLauncher";
import { LockScreen } from "./LockScreen";
import { SettingsApp } from "./SettingsApp";

export const Shell: React.FC<{ navigateTo?: string | null }> = ({ navigateTo }) => {
  const [locked, setLocked] = useState(true);
  const [switcher, setSwitcher] = useState(false);
  const [notifications, setNotifications] = useState(false);
  const [controlCenter, setControlCenter] = useState(false);
  const [proseLauncher, setProseLauncher] = useState(false);
  const [runningApp, setRunningApp] = useState<string | null>(null);

  // React to external navigation
  React.useEffect(() => {
    if (!navigateTo) return;
    // Reset everything first
    setLocked(false);
    setSwitcher(false);
    setNotifications(false);
    setControlCenter(false);
    setProseLauncher(false);
    setRunningApp(null);

    switch (navigateTo) {
      case "Lock": setLocked(true); break;
      case "Launcher": setProseLauncher(true); break;
      case "Notifications": setNotifications(true); break;
      case "Switcher": setSwitcher(true); break;
      case "Control Center": setControlCenter(true); break;
      case "Settings": setRunningApp("Settings"); break;
      case "Home": break; // already reset to home
    }
  }, [navigateTo]);

  const openApp = (name: string) => {
    setRunningApp(name);
  };
  const closeApp = () => setRunningApp(null);

  const anyOverlay = controlCenter || proseLauncher;

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
          onOpenLauncher={() => setProseLauncher(true)}
          onOpenApp={openApp}
          onSwipeToNotifications={() => setNotifications(true)}
          onOpenSwitcher={() => setSwitcher(true)}
          onOpenControlCenter={() => setControlCenter(true)}
        />
      </div>

      {/* Layers */}
      <NotificationsPane
        open={notifications}
        onClose={() => setNotifications(false)}
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
