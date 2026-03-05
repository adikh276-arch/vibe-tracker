import { useMemo } from "react";
import { getVibeEntries, VibeEntry } from "@/types/vibe";
import { ChevronLeft } from "lucide-react";

interface Props {
  onBack: () => void;
}

const vibeEmojiMap: Record<string, string> = {
  Calm: "🌷",
  Light: "🌤",
  Driven: "🔥",
  Content: "🌸",
  Steady: "🌊",
  Tender: "🤍",
  Heavy: "🌧",
  Thoughtful: "🌫",
  Restless: "⚡",
  Drained: "💔",
};

const formatDate = (dateStr: string) => {
  const date = new Date(dateStr);
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);

  if (date.toDateString() === today.toDateString()) return "Today";
  if (date.toDateString() === yesterday.toDateString()) return "Yesterday";

  return date.toLocaleDateString("en-US", {
    weekday: "long",
    month: "short",
    day: "numeric",
  });
};

const formatTime = (dateStr: string) => {
  return new Date(dateStr).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
};

const VibeHistory = ({ onBack }: Props) => {
  const entries = useMemo(() => getVibeEntries(), []);

  // Group entries by date
  const grouped = useMemo(() => {
    const groups: Record<string, VibeEntry[]> = {};
    entries.forEach((entry) => {
      const key = new Date(entry.timestamp).toDateString();
      if (!groups[key]) groups[key] = [];
      groups[key].push(entry);
    });
    return Object.entries(groups);
  }, [entries]);

  return (
    <div className="animate-fade-slide-in flex flex-col min-h-screen px-6 pt-8 pb-12">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <button
          onClick={onBack}
          className="w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-105"
          style={{
            background: "hsl(var(--muted))",
            border: "1.5px solid hsl(var(--primary) / 0.3)",
          }}
        >
          <ChevronLeft className="w-5 h-5 text-foreground" />
        </button>
        <h1 className="font-display text-2xl font-bold text-foreground tracking-tight">
          Your Journey
        </h1>
      </div>

      {entries.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center text-center">
          <div className="text-5xl mb-4">🌿</div>
          <p className="font-heading text-lg text-foreground mb-2">No vibes logged yet</p>
          <p className="text-muted-foreground text-sm max-w-xs">
            Start your first check-in to see your journey unfold here.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {grouped.map(([dateKey, dayEntries]) => (
            <div key={dateKey}>
              {/* Date Header */}
              <p className="font-heading text-sm font-semibold text-muted-foreground mb-3 uppercase tracking-wider">
                {formatDate(dayEntries[0].timestamp)}
              </p>

              <div className="space-y-3">
                {dayEntries.map((entry) => (
                  <div
                    key={entry.id}
                    className="rounded-3xl p-5 transition-all duration-200"
                    style={{
                      background: "hsl(var(--muted))",
                      border: "1.5px solid hsl(var(--primary) / 0.15)",
                      boxShadow: "0 2px 8px hsl(var(--primary) / 0.06)",
                    }}
                  >
                    {/* Vibe + Time */}
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">
                          {vibeEmojiMap[entry.vibe] || "✨"}
                        </span>
                        <span className="font-heading text-base font-semibold text-foreground">
                          {entry.vibe}
                        </span>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {formatTime(entry.timestamp)}
                      </span>
                    </div>

                    {/* Reflections */}
                    {entry.reflections.length > 0 && entry.reflections.some(r => r.trim()) && (
                      <div className="space-y-2 mt-2">
                        {entry.reflections
                          .filter((r) => r.trim())
                          .map((reflection, i) => (
                            <p
                              key={i}
                              className="text-sm text-muted-foreground leading-relaxed pl-3"
                              style={{
                                borderLeft: "2px solid hsl(var(--primary) / 0.3)",
                              }}
                            >
                              {reflection}
                            </p>
                          ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default VibeHistory;
