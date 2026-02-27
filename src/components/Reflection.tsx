import { useState, useEffect } from "react";

const prompts = [
  "What might you be needing right now?",
  "What happened before this feeling showed up?",
  "If this emotion could speak, what would it say?",
  "Where do you notice this feeling in your body?",
  "Is this something you want to sit with or shift gently?",
  "What would bring you even 10% more ease?",
  "What small kindness could you offer yourself today?",
  "What would help you feel supported in this moment?",
];

interface Props {
  onComplete: (reflections: string[]) => void;
}

const Reflection = ({ onComplete }: Props) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answer, setAnswer] = useState("");
  const [answers, setAnswers] = useState<string[]>([]);
  const [visible, setVisible] = useState(true);
  const [shuffledPrompts] = useState(() =>
    [...prompts].sort(() => Math.random() - 0.5).slice(0, 3)
  );

  const isLast = currentIndex >= shuffledPrompts.length - 1;

  const handleNext = () => {
    const newAnswers = [...answers, answer];
    setAnswers(newAnswers);

    if (isLast) {
      onComplete(newAnswers);
      return;
    }

    setVisible(false);
    setTimeout(() => {
      setAnswer("");
      setCurrentIndex((i) => i + 1);
      setVisible(true);
    }, 300);
  };

  return (
    <div className="flex flex-col min-h-screen px-6 pt-12 pb-28">
      <h1 className="font-display text-3xl font-bold text-center text-foreground tracking-tight">
        Pause & Reflect
      </h1>

      <div
        className={`mt-10 flex-1 transition-all duration-300 ${
          visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3"
        }`}
      >
        <div className="max-w-sm mx-auto w-full">
          {/* Progress dots */}
          <div className="flex gap-2 justify-center mb-8">
            {shuffledPrompts.map((_, i) => (
              <div
                key={i}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  i === currentIndex
                    ? "bg-primary w-6"
                    : i < currentIndex
                    ? "bg-primary/50"
                    : "bg-muted"
                }`}
              />
            ))}
          </div>

          <p className="font-heading text-lg text-foreground text-center leading-relaxed mb-8">
            {shuffledPrompts[currentIndex]}
          </p>

          <textarea
            className="vibe-input min-h-[140px] resize-none"
            placeholder="Type your thoughts here…"
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            style={{ borderRadius: "1.5rem" }}
          />
        </div>
      </div>

      {/* Fixed Bottom Button */}
      <div className="fixed bottom-0 left-0 right-0 p-6 bg-background/80 backdrop-blur-md">
        <button
          className="vibe-button"
          disabled={!answer.trim()}
          onClick={handleNext}
        >
          {isLast ? "Submit Reflection" : "Next"}
        </button>
      </div>
    </div>
  );
};

export default Reflection;
