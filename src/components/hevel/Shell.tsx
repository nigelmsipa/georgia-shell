import React, { useState } from "react";
import { HomeScreen } from "./HomeScreen";
import { NotificationsPane } from "./NotificationsPane";
import { AppOverlay } from "./AppOverlay";
import { ControlCenter } from "./ControlCenter";
import { LockScreen } from "./LockScreen";
import { SettingsApp } from "./SettingsApp";
import { UtilityDrawer } from "./UtilityDrawer";
import { AtmosphericBg } from "./AtmosphericBg";
import { AIChat } from "./apps/AIChat";
import { HavelTube } from "./apps/HavelTube";
import { Music } from "./apps/Music";
import { Signal } from "./apps/Signal";
import { Contacts } from "./apps/Contacts";

type MockAppProps = { onClose: () => void; onOpenUtilityDrawer?: () => void };
const MOCK_APPS: Record<string, React.FC<MockAppProps>> = {
  "AI Chat": AIChat,
  "HavelTube": HavelTube,
  "Music": Music,
  "Signal": Signal,
  "Contacts": Contacts,
};


export const Shell: React.FC<{ navigateTo?: string | null }> = ({ navigateTo }) => {
  const [locked, setLocked] = useState(true);
  const [notifications, setNotifications] = useState(false);
  const [controlCenter, setControlCenter] = useState(false);
  const [utilityDrawer, setUtilityDrawer] = useState(false);
  const [runningApp, setRunningApp] = useState<string | null>(null);

  React.useEffect(() => {
    if (!navigateTo) return;
    setLocked(false);
    setNotifications(false);
    setControlCenter(false);
    setUtilityDrawer(false);
    setRunningApp(null);

    switch (navigateTo) {
      case "Lock": setLocked(true); break;
      case "Launcher": break;
      case "Notifications": setNotifications(true); break;
      case "Control Center": setControlCenter(true); break;
      case "Utility": setUtilityDrawer(true); break;
      case "Settings": setRunningApp("Settings"); break;
      case "Home": break;
    }
  }, [navigateTo]);

  const openApp = (name: string) => setRunningApp(name);
  const closeApp = () => setRunningApp(null);

  const anyOverlay = controlCenter || utilityDrawer;

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
          onOpenUtilityDrawer={() => setUtilityDrawer(true)}
        />
      </div>

      <NotificationsPane open={notifications} onClose={() => setNotifications(false)} />
      <ControlCenter open={controlCenter} onClose={() => setControlCenter(false)} />
      <UtilityDrawer open={utilityDrawer} onClose={() => setUtilityDrawer(false)} />

      {runningApp && runningApp === "Settings" && <SettingsApp onClose={closeApp} />}
      {runningApp && runningApp !== "Settings" && MOCK_APPS[runningApp] && (
        (() => {
          const App = MOCK_APPS[runningApp];
          return <App onClose={closeApp} onOpenUtilityDrawer={() => setUtilityDrawer(true)} />;
        })()
      )}
      {runningApp && runningApp !== "Settings" && !MOCK_APPS[runningApp] && (
        <AppOverlay
          appName={runningApp}
          onClose={closeApp}
          onOpenUtilityDrawer={() => setUtilityDrawer(true)}
        />
      )}

      {locked && <LockScreen onUnlock={() => setLocked(false)} />}
    </div>
  );
};

