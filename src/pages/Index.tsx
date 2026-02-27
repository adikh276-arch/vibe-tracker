import { useState } from "react";
import VibeCheckIn from "@/components/VibeCheckIn";
import Reflection from "@/components/Reflection";
import Confirmation from "@/components/Confirmation";

type Screen = "checkin" | "reflection" | "confirmation";

const Index = () => {
  const [screen, setScreen] = useState<Screen>("checkin");
  const [selectedVibe, setSelectedVibe] = useState("");

  const handleVibeSelected = (vibe: string) => {
    setSelectedVibe(vibe);
    setScreen("reflection");
  };

  const handleReflectionComplete = (reflections: string[]) => {
    console.log("Vibe:", selectedVibe, "Reflections:", reflections);
    setScreen("confirmation");
  };

  const handleDone = () => {
    setSelectedVibe("");
    setScreen("checkin");
  };

  return (
    <div className="min-h-screen bg-background max-w-md mx-auto">
      {screen === "checkin" && <VibeCheckIn onNext={handleVibeSelected} />}
      {screen === "reflection" && <Reflection onComplete={handleReflectionComplete} />}
      {screen === "confirmation" && <Confirmation onDone={handleDone} />}
    </div>
  );
};

export default Index;
