import { useState } from "react";

const vibes = [
  { emoji: "🌷", label: "Calm" },
  { emoji: "🌤", label: "Light" },
  { emoji: "🔥", label: "Driven" },
  { emoji: "🌸", label: "Content" },
  { emoji: "🌊", label: "Steady" },
  { emoji: "🤍", label: "Tender" },
  { emoji: "🌧", label: "Heavy" },
  { emoji: "🌫", label: "Thoughtful" },
  { emoji: "⚡", label: "Restless" },
  { emoji: "💔", label: "Drained" },
];

interface Props {
  onNext: (vibe: string) => void;
}

const VibeCheckIn = ({ onNext }: Props) => {
  const [selected, setSelected] = useState<string | null>(null);
  const [customVibe, setCustomVibe] = useState("");

  const currentVibe = selected || customVibe.trim();

  return (
    <div className="animate-fade-slide-in flex flex-col min-h-screen px-6 pt-12 pb-28">
      <h1 className="font-display text-3xl font-bold text-center text-foreground tracking-tight">
        Vibe Tracker
      </h1>

      <p className="font-heading text-lg text-center text-muted-foreground mt-6 mb-8">
        How are you feeling in this moment?
      </p>

      {/* Vibe Grid */}
      <div className="grid grid-cols-2 gap-5 justify-items-center max-w-xs mx-auto w-full">
        {vibes.map((vibe) => (
          <button
            key={vibe.label}
            onClick={() => {
              setSelected(vibe.label);
              setCustomVibe("");
            }}
            className={`vibe-circle ${selected === vibe.label ? "selected animate-gentle-pulse" : ""}`}
          >
            <span className="text-2xl leading-none">{vibe.emoji}</span>
            <span className="text-xs mt-1 font-medium text-foreground/80">{vibe.label}</span>
          </button>
        ))}
      </div>

      {/* Custom Vibe */}
      <div className="mt-10 max-w-sm mx-auto w-full">
        <p className="font-heading text-sm font-semibold text-muted-foreground mb-3">
          Or describe your own vibe
        </p>
        <input
          type="text"
          className="vibe-input"
          placeholder="Right now, I feel…"
          value={customVibe}
          onChange={(e) => {
            setCustomVibe(e.target.value);
            if (e.target.value.trim()) setSelected(null);
          }}
        />
      </div>

      {/* Fixed Bottom Button */}
      <div className="fixed bottom-0 left-0 right-0 p-6 bg-background/80 backdrop-blur-md">
        <button
          className="vibe-button"
          disabled={!currentVibe}
          onClick={() => onNext(currentVibe)}
        >
          Save Vibe
        </button>
      </div>
    </div>
  );
};

export default VibeCheckIn;
