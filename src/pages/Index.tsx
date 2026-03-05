import { useState, useRef } from "react";
import VibeCheckIn from "@/components/VibeCheckIn";
import Reflection from "@/components/Reflection";
import Confirmation from "@/components/Confirmation";
import LanguageSelector from "@/components/LanguageSelector";

type Screen = "checkin" | "reflection" | "confirmation";

const Index = () => {
  const [screen, setScreen] = useState<Screen>("checkin");
  const [selectedVibe, setSelectedVibe] = useState("");
  const [transitioning, setTransitioning] = useState(false);

  const transition = (next: Screen) => {
    setTransitioning(true);
    setTimeout(() => {
      setScreen(next);
      setTransitioning(false);
    }, 500);
  };

  const handleVibeSelected = (vibe: string) => {
    setSelectedVibe(vibe);
    transition("reflection");
  };

  const handleReflectionComplete = (reflections: string[]) => {
    console.log("Vibe:", selectedVibe, "Reflections:", reflections);
    transition("confirmation");
  };

  const handleDone = () => {
    setSelectedVibe("");
    transition("checkin");
  };

  return (
    <div className="min-h-screen bg-background max-w-md mx-auto relative pt-16">
      <LanguageSelector />
      <div
        className={`transition-all duration-500 ease-in-out ${transitioning ? "opacity-0 translate-y-4" : "opacity-100 translate-y-0"
          }`}
      >
        {screen === "checkin" && <VibeCheckIn onNext={handleVibeSelected} />}
        {screen === "reflection" && <Reflection onComplete={handleReflectionComplete} />}
        {screen === "confirmation" && <Confirmation onDone={handleDone} />}
      </div>
    </div>
  );
};

export default Index;

