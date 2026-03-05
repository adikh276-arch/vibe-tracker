import { neon, neonConfig } from '@neondatabase/serverless';

// Disable the browser warning as requested
neonConfig.disableWarningInBrowsers = true;

export interface VibeEntry {
  id: string;
  vibe: string;
  reflections: string[];
  timestamp: string; // ISO string
}

const DATABASE_URL = "postgresql://neondb_owner:npg_QO0gWNunLw2t@ep-lingering-breeze-a195t3dz.ap-southeast-1.aws.neon.tech/neondb?sslmode=require";

const sql = neon(DATABASE_URL);

const getUserId = () => sessionStorage.getItem("user_id");

export const saveVibeEntry = async (entry: VibeEntry) => {
  const userId = getUserId();
  if (!userId) {
    console.error("saveVibeEntry: No user_id found in session");
    return;
  }

  try {
    const reflectionsJson = JSON.stringify(entry.reflections);

    await sql`
      INSERT INTO vibe_entries (id, user_id, vibe, reflections, timestamp)
      VALUES (
        ${entry.id},
        ${parseInt(userId)},
        ${entry.vibe},
        ${reflectionsJson},
        ${entry.timestamp}
      )
    `;
    console.log("saveVibeEntry: Success in Neon");
  } catch (error) {
    console.error("saveVibeEntry: Database push failed:", error);
    // Fallback logic
    try {
      const entries = await getLocalVibeEntries();
      entries.unshift(entry);
      localStorage.setItem("vibe-entries", JSON.stringify(entries));
    } catch (e) {
      console.error("Local storage fallback failed:", e);
    }
  }
};

const getLocalVibeEntries = (): VibeEntry[] => {
  try {
    return JSON.parse(localStorage.getItem("vibe-entries") || "[]");
  } catch {
    return [];
  }
};

export const getVibeEntries = async (): Promise<VibeEntry[]> => {
  const userId = getUserId();
  if (!userId) {
    return [];
  }

  try {
    const rows = await sql`
        SELECT id, vibe, reflections, timestamp 
        FROM vibe_entries 
        WHERE user_id = ${parseInt(userId)} 
        ORDER BY timestamp DESC
    `;

    return rows.map((row: any) => ({
      ...row,
      reflections: typeof row.reflections === 'string' ? JSON.parse(row.reflections) : row.reflections
    }));
  } catch (error) {
    console.warn("getVibeEntries: Fetch error, looking in local storage:", error);
    return getLocalVibeEntries();
  }
};
