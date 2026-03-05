export interface VibeEntry {
  id: string;
  vibe: string;
  reflections: string[];
  timestamp: string; // ISO string
}

export const saveVibeEntry = (entry: VibeEntry) => {
  const entries = getVibeEntries();
  entries.unshift(entry);
  localStorage.setItem("vibe-entries", JSON.stringify(entries));
};

export const getVibeEntries = (): VibeEntry[] => {
  try {
    return JSON.parse(localStorage.getItem("vibe-entries") || "[]");
  } catch {
    return [];
  }
};
