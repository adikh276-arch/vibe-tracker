export interface VibeEntry {
  id: string;
  vibe: string;
  reflections: string[];
  timestamp: string; // ISO string
}

const NEON_API_KEY = import.meta.env.VITE_NEON_API_KEY;
const NEON_PROJECT_ID = import.meta.env.VITE_NEON_PROJECT_ID;
const NEON_BRANCH_ID = import.meta.env.VITE_NEON_BRANCH_ID;

const getUserId = () => sessionStorage.getItem("user_id");

export const saveVibeEntry = async (entry: VibeEntry) => {
  const userId = getUserId();
  if (!userId) {
    console.error("saveVibeEntry: No user_id found in session");
    return;
  }

  try {
    const reflectionsJson = JSON.stringify(entry.reflections).replace(/'/g, "''");
    const sql = `
      INSERT INTO vibe_entries (id, user_id, vibe, reflections, timestamp)
      VALUES (
        '${entry.id}',
        ${userId},
        '${entry.vibe.replace(/'/g, "''")}',
        '${reflectionsJson}'::jsonb,
        '${entry.timestamp}'
      )
    `;

    console.log("saveVibeEntry: Pushing to Neon...");
    const response = await fetch(`https://console.neon.tech/api/v1/projects/${NEON_PROJECT_ID}/branches/${NEON_BRANCH_ID}/sql`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${NEON_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        sql: sql
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText);
    }
    console.log("saveVibeEntry: Success");
  } catch (error) {
    console.error("saveVibeEntry: Database push failed:", error);
    // Fallback logic
    console.log("saveVibeEntry: Falling back to local storage");
    try {
      const entries = await getVibeEntries();
      entries.unshift(entry);
      localStorage.setItem("vibe-entries", JSON.stringify(entries));
    } catch (e) {
      console.error("Local storage fallback also failed:", e);
    }
  }
};

export const getVibeEntries = async (): Promise<VibeEntry[]> => {
  const userId = getUserId();
  if (!userId) {
    console.warn("getVibeEntries: No user_id, returning empty");
    return [];
  }

  try {
    const sql = `SELECT id, vibe, reflections, timestamp FROM vibe_entries WHERE user_id = ${userId} ORDER BY timestamp DESC`;

    console.log("getVibeEntries: Fetching from Neon...");
    const response = await fetch(`https://console.neon.tech/api/v1/projects/${NEON_PROJECT_ID}/branches/${NEON_BRANCH_ID}/sql`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${NEON_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        sql: sql
      }),
    });

    if (response.ok) {
      const data = await response.json();
      console.log("getVibeEntries: Data received from Neon", data);

      // Neon Console SQL API returns { results: [ { rows: [...], ... } ] }
      let rows = [];
      if (data.results && data.results[0] && data.results[0].rows) {
        rows = data.results[0].rows;
      } else if (data.rows) {
        rows = data.rows;
      }

      return rows.map((row: any) => ({
        ...row,
        reflections: typeof row.reflections === 'string' ? JSON.parse(row.reflections) : row.reflections
      }));
    }

    const errorText = await response.text();
    throw new Error(`Neon fetch failed: ${errorText}`);
  } catch (error) {
    console.warn("getVibeEntries: Fetch error, looking in local storage:", error);
    try {
      return JSON.parse(localStorage.getItem("vibe-entries") || "[]");
    } catch {
      return [];
    }
  }
};
