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
import { Phone } from "./apps/Phone";
import { useShellMachine, type ShellState } from "./shellMachine";

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
  "Phone": Phone,
};

export const Shell: React.FC<{ navigateTo?: string | null }> = ({ navigateTo }) => {
  const { state, dispatch } = useShellMachine();

  // Orthogonal overlays — not part of the top-level state machine.
  const [utilityDrawer, setUtilityDrawer] = useState(false);
  const [appSwitcher, setAppSwitcher] = useState(false);
  const [recents, setRecents] = useState<string[]>([]);

  const appDragY = useMotionValue(0);

  // Derived render flags
  const locked = state.kind === "LOCK_CLOCK" || state.kind === "LOCK_PIN";
  const runningApp = state.kind === "APP_FOREGROUND" ? state.app : null;
  const notifications = state.kind === "NOTIFICATIONS";
  const controlCenter = state.kind === "CONTROL_CENTER";
  const anyOverlay = controlCenter || utilityDrawer || appSwitcher;

  // Debug nav (PhoneFrame sidebar) → translate labels to explicit targets.
  React.useEffect(() => {
    if (!navigateTo) return;
    setUtilityDrawer(false);
    setAppSwitcher(false);

    const targets: Record<string, ShellState> = {
      Lock: { kind: "LOCK_CLOCK" },
      Home: { kind: "HOME" },
      Launcher: { kind: "HOME" },
      Notifications: { kind: "NOTIFICATIONS" },
      "Control Center": { kind: "CONTROL_CENTER" },
      Settings: { kind: "APP_FOREGROUND", app: "Settings" },
    };
    const target = targets[navigateTo];
    if (target) dispatch({ type: "DEBUG_GOTO", target });
    if (navigateTo === "Utility") {
      dispatch({ type: "DEBUG_GOTO", target: { kind: "HOME" } });
      setUtilityDrawer(true);
    }
  }, [navigateTo, dispatch]);

  const openApp = (name: string) => {
    dispatch({ type: "LAUNCH_APP", name });
    setRecents((prev) => [name, ...prev.filter((a) => a !== name)]);
  };

  const requestHome = () => dispatch({ type: "REQUEST_HOME" });

  const handleScrubLeft = () => {
    if (!runningApp || recents.length <= 1) return;
    const idx = recents.indexOf(runningApp);
    if (idx !== -1 && idx + 1 < recents.length) {
      dispatch({ type: "LAUNCH_APP", name: recents[idx + 1] });
    }
  };

  const handleScrubRight = () => {
    if (!runningApp || recents.length <= 1) return;
    const idx = recents.indexOf(runningApp);
    if (idx > 0) {
      dispatch({ type: "LAUNCH_APP", name: recents[idx - 1] });
    }
  };

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
          onSwipeToNotifications={() => dispatch({ type: "OPEN_NOTIFICATIONS" })}
          onOpenControlCenter={() => dispatch({ type: "OPEN_CONTROL_CENTER" })}
          onOpenUtilityDrawer={() => setUtilityDrawer(true)}
        />
      </div>

      <AnimatePresence>
        {notifications && (
          <NotificationsPane key="notifications" open={true} onClose={requestHome} />
        )}
      </AnimatePresence>
      <ControlCenter open={controlCenter} onClose={requestHome} />
      <UtilityDrawer open={utilityDrawer} onClose={() => setUtilityDrawer(false)} />
      <AppSwitcher open={appSwitcher} onClose={() => setAppSwitcher(false)} onOpenApp={openApp} />

      <AnimatePresence>
        {runningApp && runningApp === "Settings" && (
          <SettingsApp key="settings" onClose={requestHome} />
        )}
        {runningApp && runningApp !== "Settings" && MOCK_APPS[runningApp] && (
          (() => {
            const App = MOCK_APPS[runningApp];
            return (
              <App
                key={runningApp}
                onClose={requestHome}
                onOpenUtilityDrawer={() => setUtilityDrawer(true)}
                appDragY={appDragY}
              />
            );
          })()
        )}
        {runningApp && runningApp !== "Settings" && !MOCK_APPS[runningApp] && (
          <AppOverlay
            key={runningApp}
            appName={runningApp}
            onClose={requestHome}
            onOpenUtilityDrawer={() => setUtilityDrawer(true)}
            appDragY={appDragY}
          />
        )}
      </AnimatePresence>

      {/* Top Edge Hitbox — HOME-only per the machine. */}
      {state.kind === "HOME" && (
        <motion.div
          className="absolute top-0 left-0 right-0 h-8 z-[100] touch-none"
          drag="y"
          dragConstraints={{ top: 0, bottom: 0, left: 0, right: 0 }}
          dragElastic={0.1}
          onDragEnd={(e, info) => {
            if (info.offset.y > 30 || info.velocity.y > 300) {
              dispatch({ type: "OPEN_CONTROL_CENTER" });
            }
          }}
        />
      )}

      {/* Hevel Bar — always mounted post-unlock. Swipe-up always requests HOME. */}
      {!locked && !anyOverlay && (
        <HevelBar
          onCloseApp={requestHome}
          appDragY={appDragY}
          onScrubLeft={handleScrubLeft}
          onScrubRight={handleScrubRight}
        />
      )}

      {/* Side Pill */}
      {!locked && !anyOverlay && (
        <SidePill
          onOpenUtilityDrawer={() => setUtilityDrawer(true)}
          onOpenAppSwitcher={() => setAppSwitcher(true)}
        />
      )}

      {locked && <LockScreen onUnlock={() => dispatch({ type: "UNLOCK" })} />}
    </div>
  );
};
