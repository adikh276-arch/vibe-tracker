export interface VibeEntry {
  id: string;
  vibe: string;
  reflections: string[];
  timestamp: string; // ISO string
}

const getUserId = () => sessionStorage.getItem("user_id");

export const saveVibeEntry = async (entry: VibeEntry) => {
  const userId = getUserId();
  if (!userId) {
    console.error("No user_id found in session, cannot save to DB");
    return;
  }

  try {
    const sql = `
      INSERT INTO vibe_entries (id, user_id, vibe, reflections, timestamp)
      VALUES (
        '${entry.id}',
        ${userId},
        '${entry.vibe.replace(/'/g, "''")}',
        '${JSON.stringify(entry.reflections).replace(/'/g, "''")}'::jsonb,
        '${entry.timestamp}'
      )
    `;

    const response = await fetch("https://console.neon.tech/api/v1/projects/flat-sun-26865495/sql", {
      method: "POST",
      headers: {
        "Authorization": "Bearer napi_ewlzpqv336e41usn232duvfax8vu1g5g37ozlz8x53eic18pjsyg30vqqorexfav",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        sql: sql,
        branch_id: "production"
      }),
    });

    if (!response.ok) {
      throw new Error(await response.text());
    }
  } catch (error) {
    console.error("Database save failed, falling back to local storage:", error);
    // Fallback logic
    const entries = await getVibeEntries();
    entries.unshift(entry);
    localStorage.setItem("vibe-entries", JSON.stringify(entries));
  }
};

export const getVibeEntries = async (): Promise<VibeEntry[]> => {
  const userId = getUserId();
  if (!userId) return [];

  try {
    const sql = `SELECT id, vibe, reflections, timestamp FROM vibe_entries WHERE user_id = ${userId} ORDER BY timestamp DESC`;

    const response = await fetch("https://console.neon.tech/api/v1/projects/flat-sun-26865495/sql", {
      method: "POST",
      headers: {
        "Authorization": "Bearer napi_ewlzpqv336e41usn232duvfax8vu1g5g37ozlz8x53eic18pjsyg30vqqorexfav",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        sql: sql,
        branch_id: "production"
      }),
    });

    if (response.ok) {
      const data = await response.json();
      // Handle the Neon SQL API response structure which is usually { rows: [...] }
      const rows = data.rows || [];
      return rows.map((row: any) => ({
        ...row,
        reflections: typeof row.reflections === 'string' ? JSON.parse(row.reflections) : row.reflections
      }));
    }

    throw new Error("Neon fetch error");
  } catch (error) {
    console.warn("Falling back to local storage for history:", error);
    try {
      return JSON.parse(localStorage.getItem("vibe-entries") || "[]");
    } catch {
      return [];
    }
  }
};
