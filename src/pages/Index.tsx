import { useState } from "react";
import { ThemeProvider } from "@/components/hevel/ThemeProvider";
import { PhoneFrame } from "@/components/hevel/PhoneFrame";
import { Shell } from "@/components/hevel/Shell";

const Index = () => {
  const [screen, setScreen] = useState<string | null>(null);
  const [navKey, setNavKey] = useState(0);

  const handleNavigate = (s: string) => {
    setScreen(s);
    setNavKey((k) => k + 1); // force re-trigger even if same screen
  };

  return (
    <ThemeProvider>
      <PhoneFrame onNavigate={handleNavigate}>
        <Shell navigateTo={screen} key={navKey} />
      </PhoneFrame>
    </ThemeProvider>
  );
};

export default Index;
