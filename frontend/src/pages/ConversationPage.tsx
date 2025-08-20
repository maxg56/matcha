// ConversationPage.tsx
import { useState, useEffect } from "react";
import DesktopLayout from "../components/pages/DesktopLayout";
import MobileLayout from "./../components/pages/MobileLayout";

const ConversationPage: React.FC = () => {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 925);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 925);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return isMobile ? <MobileLayout /> : <DesktopLayout />;
};

export default ConversationPage;
