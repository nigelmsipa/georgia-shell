import React, { useState } from "react";
import { HomeScreen } from "./HomeScreen";
import { NotificationsPane } from "./NotificationsPane";
import { AppOverlay } from "./AppOverlay";
import { ControlCenter } from "./ControlCenter";
import { LockScreen } from "./LockScreen";
import { SettingsApp } from "./SettingsApp";
import { UtilityDrawer } from "./UtilityDrawer";
import { AppSwitcher } from "./AppSwitcher";
import { AtmosphericBg } from "./AtmosphericBg";
import { AnimatePresence, useMotionValue, motion } from "framer-motion";
import { HevelBar } from "./HevelBar";
import { SidePill } from "./SidePill";
import { AIChat } from "./apps/AIChat";
import { HavelTube } from "./apps/HavelTube";
import { Music } from "./apps/Music";
import { Signal } from "./apps/Signal";
import { Contacts } from "./apps/Contacts";
import { Angelfish } from "./apps/Angelfish";
import { Voice } from "./apps/Voice";

type MockAppProps = { 
  onClose: () => void; 
  onOpenUtilityDrawer?: () => void;
  appDragY?: any;
};
const MOCK_APPS: Record<string, React.FC<MockAppProps>> = {
  "AI Chat": AIChat,
  "HavelTube": HavelTube,
  "Music": Music,
  "Signal": Signal,
  "Contacts": Contacts,
  "Angelfish": Angelfish,
  "Voice": Voice,
};


export const Shell: React.FC<{ navigateTo?: string | null }> = ({ navigateTo }) => {
  const [locked, setLocked] = useState(true);
  const [notifications, setNotifications] = useState(false);
  const [controlCenter, setControlCenter] = useState(false);
  const [utilityDrawer, setUtilityDrawer] = useState(false);
  const [appSwitcher, setAppSwitcher] = useState(false);
  const [runningApp, setRunningApp] = useState<string | null>(null);
  const [recents, setRecents] = useState<string[]>([]);
  
  const appDragY = useMotionValue(0);

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

  const openApp = (name: string) => {
    setRunningApp(name);
    setRecents(prev => [name, ...prev.filter(app => app !== name)]);
  };
  const closeApp = () => setRunningApp(null);

  const handleScrubLeft = () => {
    // Next recent app
    if (recents.length > 1) {
      const idx = runningApp ? recents.indexOf(runningApp) : -1;
      if (idx !== -1 && idx + 1 < recents.length) {
        setRunningApp(recents[idx + 1]);
      }
    }
  };

  const handleScrubRight = () => {
    // Prev recent app
    if (recents.length > 1) {
      const idx = runningApp ? recents.indexOf(runningApp) : -1;
      if (idx > 0) {
        setRunningApp(recents[idx - 1]);
      }
    }
  };

  const anyOverlay = controlCenter || utilityDrawer || appSwitcher;

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

      <AnimatePresence>
        {notifications && <NotificationsPane key="notifications" open={true} onClose={() => setNotifications(false)} />}
      </AnimatePresence>
      <ControlCenter open={controlCenter} onClose={() => setControlCenter(false)} />
      <UtilityDrawer open={utilityDrawer} onClose={() => setUtilityDrawer(false)} />
      <AppSwitcher open={appSwitcher} onClose={() => setAppSwitcher(false)} onOpenApp={openApp} />

      <AnimatePresence>
        {runningApp && runningApp === "Settings" && <SettingsApp key="settings" onClose={closeApp} />}
        {runningApp && runningApp !== "Settings" && MOCK_APPS[runningApp] && (
          (() => {
            const App = MOCK_APPS[runningApp];
            return <App key={runningApp} onClose={closeApp} onOpenUtilityDrawer={() => setUtilityDrawer(true)} appDragY={appDragY} />;
          })()
        )}
        {runningApp && runningApp !== "Settings" && !MOCK_APPS[runningApp] && (
          <AppOverlay
            key={runningApp}
            appName={runningApp}
            onClose={closeApp}
            onOpenUtilityDrawer={() => setUtilityDrawer(true)}
            appDragY={appDragY}
          />
        )}
      </AnimatePresence>

      {/* Top Edge Hitbox - Global pull-down for Control Center */}
      <motion.div
        className="absolute top-0 left-0 right-0 h-8 z-[100] touch-none"
        drag="y"
        dragConstraints={{ top: 0, bottom: 0, left: 0, right: 0 }}
        dragElastic={0.1}
        onDragEnd={(e, info) => {
          if (info.offset.y > 30 || info.velocity.y > 300) {
            setControlCenter(true);
          }
        }}
      />

      {/* Hevel Bar - Global bottom hit box */}
      {runningApp && !anyOverlay && (
        <HevelBar 
          onCloseApp={closeApp} 
          appDragY={appDragY} 
          onScrubLeft={handleScrubLeft}
          onScrubRight={handleScrubRight}
        />
      )}

      {/* Side Pill - Global edge panel */}
      {!anyOverlay && (
        <SidePill 
          onOpenUtilityDrawer={() => setUtilityDrawer(true)} 
          onOpenAppSwitcher={() => setAppSwitcher(true)} 
        />
      )}

      {locked && <LockScreen onUnlock={() => setLocked(false)} />}
    </div>
  );
};

