import React, { useState } from "react";
import { HomeScreen } from "./HomeScreen";
import { NotificationsPane } from "./NotificationsPane";
import { AppOverlay } from "./AppOverlay";
import { ControlCenter } from "./ControlCenter";
import { LockScreen } from "./LockScreen";
import { SettingsApp } from "./SettingsApp";
import { AtmosphericBg } from "./AtmosphericBg";

export const Shell: React.FC<{ navigateTo?: string | null }> = ({ navigateTo }) => {
  const [locked, setLocked] = useState(true);
  const [notifications, setNotifications] = useState(false);
  const [controlCenter, setControlCenter] = useState(false);
  const [runningApp, setRunningApp] = useState<string | null>(null);

  React.useEffect(() => {
    if (!navigateTo) return;
    setLocked(false);
    setNotifications(false);
    setControlCenter(false);
    setRunningApp(null);

    switch (navigateTo) {
      case "Lock": setLocked(true); break;
      case "Launcher": break;
      case "Notifications": setNotifications(true); break;
      case "Control Center": setControlCenter(true); break;
      case "Settings": setRunningApp("Settings"); break;
      case "Home": break;
    }
  }, [navigateTo]);

  const openApp = (name: string) => setRunningApp(name);
  const closeApp = () => setRunningApp(null);

  const anyOverlay = controlCenter;

  return (
    <div className="relative w-full h-full overflow-hidden">
      <AtmosphericBg />
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
          onOpenApp={openApp}
          onSwipeToNotifications={() => setNotifications(true)}
          onOpenControlCenter={() => setControlCenter(true)}
        />
      </div>

      <NotificationsPane open={notifications} onClose={() => setNotifications(false)} />
      <ControlCenter open={controlCenter} onClose={() => setControlCenter(false)} />

      {runningApp && runningApp === "Settings" && <SettingsApp onClose={closeApp} />}
      {runningApp && runningApp !== "Settings" && <AppOverlay appName={runningApp} onClose={closeApp} />}

      {locked && <LockScreen onUnlock={() => setLocked(false)} />}
    </div>
  );
};
