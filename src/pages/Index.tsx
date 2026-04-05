import { ThemeProvider } from "@/components/hevel/ThemeProvider";
import { PhoneFrame } from "@/components/hevel/PhoneFrame";
import { Shell } from "@/components/hevel/Shell";

const Index = () => (
  <ThemeProvider>
    <PhoneFrame>
      <Shell />
    </PhoneFrame>
  </ThemeProvider>
);

export default Index;
