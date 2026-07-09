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
import { HoldingStation } from "./HoldingStation";
import { AnimatePresence, useMotionValue, useSpring, useTransform, useMotionTemplate, motion, animate } from "framer-motion";
import { HevelBar } from "./HevelBar";
import { SidePill } from "./SidePill";
import { DictationOverlay } from "./DictationOverlay";
import { AIChat } from "./apps/AIChat";
import { HavelTube } from "./apps/HavelTube";
import { Music } from "./apps/Music";
import { Signal } from "./apps/Signal";
import { Contacts } from "./apps/Contacts";
import { Angelfish } from "./apps/Angelfish";
import { Voice } from "./apps/Voice";
import { Phone } from "./apps/Phone";
import { useShellMachine, type ShellState } from "./shellMachine";

/** How far the screen slides aside when the Side Pill reveal is fully open. */
const SIDE_PILL_OPEN_DISTANCE = 240;

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

  const [utilityDrawer, setUtilityDrawer] = useState(false);
  const [appSwitcher, setAppSwitcher] = useState(false);
  const [recents, setRecents] = useState<string[]>([]);
  const [dictating, setDictating] = useState(false);
  // Pill sits at vertical center of the screen; overlay blooms from there.
  const dictationAnchorY = "50%";

  const appDragY = useMotionValue(0);

  // --- Side Pill reveal ---
  // Two springs on the same drag target with different tuning create an
  // elastic edge: the screen body follows with weight, the leading edge
  // (at the pill) races ahead and wobbles on release like a stretched sheet.
  const dragTarget = useMotionValue(0);
  const screenX = useSpring(dragTarget, { stiffness: 220, damping: 30 });        // body — heavy
  const edgeLead = useSpring(dragTarget, { stiffness: 320, damping: 12 });       // edge — bouncy, leads
  const bulge = useTransform(
    [edgeLead, screenX] as any,
    ([e, s]: number[]) => Math.max(0, e - s),
  );

  // 9 sample points along the left edge, sine-weighted so the pull tapers
  // smoothly to zero at top and bottom.
  const S = [0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9].map((t) => Math.sin(Math.PI * t));
  const b1 = useTransform(bulge, (v) => v * S[0]);
  const b2 = useTransform(bulge, (v) => v * S[1]);
  const b3 = useTransform(bulge, (v) => v * S[2]);
  const b4 = useTransform(bulge, (v) => v * S[3]);
  const b5 = useTransform(bulge, (v) => v * S[4]);
  const b6 = useTransform(bulge, (v) => v * S[5]);
  const b7 = useTransform(bulge, (v) => v * S[6]);
  const b8 = useTransform(bulge, (v) => v * S[7]);
  const b9 = useTransform(bulge, (v) => v * S[8]);

  const screenClip = useMotionTemplate`polygon(0px 0%, ${b1}px 10%, ${b2}px 20%, ${b3}px 30%, ${b4}px 40%, ${b5}px 50%, ${b6}px 60%, ${b7}px 70%, ${b8}px 80%, ${b9}px 90%, 0px 100%, 100% 100%, 100% 0%)`;

  const voidOpacity = useTransform(
    dragTarget,
    [0, SIDE_PILL_OPEN_DISTANCE * 0.3, SIDE_PILL_OPEN_DISTANCE],
    [0, 0.35, 1],
  );
  const voidX = useTransform(dragTarget, [0, SIDE_PILL_OPEN_DISTANCE], [-40, 0]);
  const voidScale = useTransform(dragTarget, [0, SIDE_PILL_OPEN_DISTANCE], [1.04, 1]);
  const screenDropShadow = useTransform(
    dragTarget,
    [0, SIDE_PILL_OPEN_DISTANCE],
    ["drop-shadow(0 0 0 rgba(0,0,0,0))", "drop-shadow(-12px 0 24px rgba(0,0,0,0.55))"],
  );

  const isSidePillOpen = state.kind === "SIDE_PILL";

  const closeSidePill = () => {
    animate(dragTarget, 0, { type: "spring", stiffness: 280, damping: 26 });
    if (isSidePillOpen) dispatch({ type: "DISMISS_SIDE_PILL" });
  };

  // Derived render flags
  const locked = state.kind === "LOCK_CLOCK" || state.kind === "LOCK_PIN";
  const runningApp =
    state.kind === "APP_FOREGROUND"
      ? state.app
      : state.kind === "SIDE_PILL" && state.previous === "APP_FOREGROUND"
      ? state.app ?? null
      : null;
  const notifications = state.kind === "NOTIFICATIONS";
  const controlCenter = state.kind === "CONTROL_CENTER";
  const anyOverlay = controlCenter || utilityDrawer || appSwitcher;

  // Debug nav (PhoneFrame sidebar) → translate labels to explicit targets.
  React.useEffect(() => {
    if (!navigateTo) return;
    setUtilityDrawer(false);
    setAppSwitcher(false);
    closeSidePill();

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [navigateTo, dispatch]);

  const openApp = (name: string) => {
    dispatch({ type: "LAUNCH_APP", name });
    setRecents((prev) => [name, ...prev.filter((a) => a !== name)]);
  };

  const requestHome = () => {
    closeSidePill();
    dispatch({ type: "REQUEST_HOME" });
  };

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
    <div className="relative w-full h-full overflow-hidden bg-black" style={{ perspective: 1200 }}>
      {/* The void — sits behind the screen. Only visible when pushed aside. */}
      <motion.div
        className="absolute inset-0"
        style={{ opacity: voidOpacity, x: voidX, scale: voidScale }}
      >
        <HoldingStation />
      </motion.div>

      {/* The screen layer — everything the user normally sees. Slides as one piece. */}
      <motion.div
        className="absolute inset-0"
        style={{
          x: screenX,
          clipPath: screenClip,
          WebkitClipPath: screenClip,
          filter: screenDropShadow,
          borderRadius: "inherit",
        }}
      >
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

          {/* Hevel Bar */}
          {!locked && !anyOverlay && (
            <HevelBar
              onCloseApp={requestHome}
              appDragY={appDragY}
              onScrubLeft={handleScrubLeft}
              onScrubRight={handleScrubRight}
            />
          )}

          {/* Side Pill — grabs the edge of the screen. */}
          {!locked && !anyOverlay && (
            <SidePill
              dragTarget={dragTarget}
              openDistance={SIDE_PILL_OPEN_DISTANCE}
              isOpen={isSidePillOpen}
              onOpen={() => dispatch({ type: "OPEN_SIDE_PILL" })}
              onClose={closeSidePill}
              onTap={() => setDictating(true)}
            />
          )}

          <AnimatePresence>
            {dictating && (
              <DictationOverlay
                key="dictation"
                anchorY={dictationAnchorY}
                onDismiss={() => setDictating(false)}
              />
            )}
          </AnimatePresence>


          {locked && <LockScreen onUnlock={() => dispatch({ type: "UNLOCK" })} />}

          {/* Tap-to-close scrim: when the screen is pushed aside, tapping the
              visible screen surface snaps it back. */}
          {isSidePillOpen && (
            <div
              className="absolute inset-0 z-[120]"
              style={{ background: "transparent" }}
              onClick={closeSidePill}
            />
          )}
        </div>
      </motion.div>
    </div>
  );
};
