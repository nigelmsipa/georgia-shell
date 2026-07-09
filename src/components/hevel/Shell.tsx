import React, { useEffect, useMemo, useReducer } from "react";
import { HomeScreen } from "./HomeScreen";
import { NotificationsPane } from "./NotificationsPane";
import { AppOverlay } from "./AppOverlay";
import { ControlCenter } from "./ControlCenter";
import { LockScreen } from "./LockScreen";
import { SettingsApp } from "./SettingsApp";
import { UtilityDrawer } from "./UtilityDrawer";
import { AppSwitcher } from "./AppSwitcher";
import { ProseLauncher } from "./ProseLauncher";
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
import { TOP_ZONE_HEIGHT_DP, isDebugGesturesEnabled } from "./nav-contract";
import { GestureDebugOverlay, registerGestureZone } from "./GestureDebugOverlay";

type MockAppProps = {
  onClose: () => void;
  onOpenUtilityDrawer?: () => void;
  appDragY?: any;
};
const MOCK_APPS: Record<string, React.FC<MockAppProps>> = {
  "AI Chat": AIChat,
  HavelTube,
  Music,
  Signal,
  Contacts,
  Angelfish,
  Voice,
  Phone,
};

/* ── Navigation state machine ────────────────────────────────────────── */

type NavState =
  | { kind: "lock" }
  | { kind: "home" }
  | { kind: "app"; name: string }
  | { kind: "switcher"; from: "home" | { app: string } };

type NavEvent =
  | { t: "unlock" }
  | { t: "lock" }
  | { t: "openApp"; name: string }
  | { t: "goHome" }
  | { t: "peekSwitcher" }
  | { t: "pickApp"; name: string }
  | { t: "back" }
  | { t: "clearAll" };

const navReducer = (state: NavState, ev: NavEvent): NavState => {
  switch (ev.t) {
    case "unlock": return state.kind === "lock" ? { kind: "home" } : state;
    case "lock": return { kind: "lock" };
    case "openApp": return { kind: "app", name: ev.name };
    case "goHome": return { kind: "home" };
    case "peekSwitcher":
      if (state.kind === "app") return { kind: "switcher", from: { app: state.name } };
      if (state.kind === "home") return { kind: "switcher", from: "home" };
      return state;
    case "pickApp": return { kind: "app", name: ev.name };
    case "back":
      if (state.kind === "switcher") {
        return state.from === "home"
          ? { kind: "home" }
          : { kind: "app", name: state.from.app };
      }
      if (state.kind === "app") return { kind: "home" };
      return state;
    case "clearAll":
      return { kind: "home" };
    default: return state;
  }
};

export const Shell: React.FC<{ navigateTo?: string | null }> = ({ navigateTo }) => {
  const [nav, dispatch] = useReducer(navReducer, { kind: "lock" } as NavState);
  const [notifications, setNotifications] = React.useState(false);
  const [controlCenter, setControlCenter] = React.useState(false);
  const [utilityDrawer, setUtilityDrawer] = React.useState(false);
  const [recents, setRecents] = React.useState<string[]>([]);
  const [launcher, setLauncher] = React.useState(false);
  const [debug, setDebug] = React.useState<boolean>(() => isDebugGesturesEnabled());

  const appDragY = useMotionValue(0);

  // Poll debug flag when tab regains focus (toggling from /spec updates it)
  useEffect(() => {
    const onFocus = () => setDebug(isDebugGesturesEnabled());
    window.addEventListener("focus", onFocus);
    window.addEventListener("storage", onFocus);
    return () => {
      window.removeEventListener("focus", onFocus);
      window.removeEventListener("storage", onFocus);
    };
  }, []);

  // Debug-toolbar navigation from PhoneFrame
  useEffect(() => {
    if (!navigateTo) return;
    setNotifications(false);
    setControlCenter(false);
    setUtilityDrawer(false);
    setLauncher(false);

    switch (navigateTo) {
      case "Lock": dispatch({ t: "lock" }); break;
      case "Home": dispatch({ t: "unlock" }); dispatch({ t: "goHome" }); break;
      case "Launcher": dispatch({ t: "unlock" }); dispatch({ t: "goHome" }); setLauncher(true); break;
      case "Recents": dispatch({ t: "unlock" }); dispatch({ t: "goHome" }); dispatch({ t: "peekSwitcher" }); break;
      case "Notifications": dispatch({ t: "unlock" }); setNotifications(true); break;
      case "Control Center": dispatch({ t: "unlock" }); setControlCenter(true); break;
      case "Utility": dispatch({ t: "unlock" }); setUtilityDrawer(true); break;
      case "Settings": dispatch({ t: "openApp", name: "Settings" }); break;
    }
  }, [navigateTo]);

  const openApp = (name: string) => {
    setRecents((prev) => [name, ...prev.filter((a) => a !== name)]);
    dispatch({ t: "openApp", name });
  };

  const pickFromSwitcher = (name: string) => {
    setRecents((prev) => [name, ...prev.filter((a) => a !== name)]);
    dispatch({ t: "pickApp", name });
  };

  const currentApp = nav.kind === "app" ? nav.name : nav.kind === "switcher" && nav.from !== "home" ? nav.from.app : null;

  const handleScrubLeft = () => {
    if (nav.kind !== "app" || recents.length < 2) return;
    const idx = recents.indexOf(nav.name);
    if (idx !== -1 && idx + 1 < recents.length) dispatch({ t: "pickApp", name: recents[idx + 1] });
  };
  const handleScrubRight = () => {
    if (nav.kind !== "app" || recents.length < 2) return;
    const idx = recents.indexOf(nav.name);
    if (idx > 0) dispatch({ t: "pickApp", name: recents[idx - 1] });
  };

  const anyOverlay = controlCenter || utilityDrawer || nav.kind === "switcher" || launcher;
  const locked = nav.kind === "lock";

  // Top-edge gesture zone ref registration
  const topEdgeRef = React.useRef<HTMLDivElement>(null);
  useEffect(() => {
    registerGestureZone("top-edge", topEdgeRef.current);
    return () => registerGestureZone("top-edge", null);
  }, [locked]);

  const focusAppForSwitcher = useMemo(
    () => (nav.kind === "switcher" && nav.from !== "home" ? nav.from.app : null),
    [nav]
  );

  return (
    <div className="relative w-full h-full overflow-hidden">
      <AtmosphericBg />

      {/* Base: Home */}
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
          onOpenLauncher={() => setLauncher(true)}
        />
      </div>

      <ProseLauncher
        open={launcher}
        onClose={() => setLauncher(false)}
        onOpenApp={(name) => {
          setLauncher(false);
          openApp(name);
        }}
      />

      <AnimatePresence>
        {notifications && <NotificationsPane key="notifications" open onClose={() => setNotifications(false)} />}
      </AnimatePresence>
      <ControlCenter open={controlCenter} onClose={() => setControlCenter(false)} />
      <UtilityDrawer open={utilityDrawer} onClose={() => setUtilityDrawer(false)} />

      {/* Running app — stays mounted under the switcher when peeked from-app */}
      <AnimatePresence>
        {currentApp && currentApp === "Settings" && (
          <SettingsApp key="settings" onClose={() => dispatch({ t: "back" })} />
        )}
        {currentApp && currentApp !== "Settings" && MOCK_APPS[currentApp] && (
          (() => {
            const App = MOCK_APPS[currentApp];
            return (
              <App
                key={currentApp}
                onClose={() => dispatch({ t: "back" })}
                onOpenUtilityDrawer={() => setUtilityDrawer(true)}
                appDragY={appDragY}
              />
            );
          })()
        )}
        {currentApp && currentApp !== "Settings" && !MOCK_APPS[currentApp] && (
          <AppOverlay
            key={currentApp}
            appName={currentApp}
            onClose={() => dispatch({ t: "back" })}
            onOpenUtilityDrawer={() => setUtilityDrawer(true)}
            appDragY={appDragY}
          />
        )}
      </AnimatePresence>

      {/* Switcher — overlays whatever is behind (home or the from-app) */}
      <AppSwitcher
        open={nav.kind === "switcher"}
        focusApp={focusAppForSwitcher}
        onPickApp={pickFromSwitcher}
        onBack={() => dispatch({ t: "back" })}
        onClearAll={() => dispatch({ t: "clearAll" })}
      />

      {/* Top-edge hitbox for Control Center */}
      {!locked && (
        <motion.div
          ref={topEdgeRef}
          className="absolute top-0 left-0 right-0 z-[100] touch-none"
          style={{ height: TOP_ZONE_HEIGHT_DP }}
          drag="y"
          dragConstraints={{ top: 0, bottom: 0, left: 0, right: 0 }}
          dragElastic={0.1}
          onDragEnd={(_, info) => {
            if (info.offset.y > 30 || info.velocity.y > 300) setControlCenter(true);
          }}
        />
      )}

      {/* Nav bar — always reserved while unlocked */}
      {!locked && !controlCenter && !utilityDrawer && (
        <HevelBar
          onGoHome={() => { setLauncher(false); dispatch({ t: "goHome" }); }}
          onPeekSwitcher={() => { setLauncher(false); dispatch({ t: "peekSwitcher" }); }}
          appDragY={appDragY}
          onScrubLeft={handleScrubLeft}
          onScrubRight={handleScrubRight}
        />
      )}

      {!locked && !anyOverlay && (
        <SidePill
          onOpenUtilityDrawer={() => setUtilityDrawer(true)}
          onOpenAppSwitcher={() => dispatch({ t: "peekSwitcher" })}
        />
      )}

      {locked && <LockScreen onUnlock={() => dispatch({ t: "unlock" })} />}

      {debug && <GestureDebugOverlay />}
    </div>
  );
};
