const API_URL = (import.meta.env.VITE_MISSION_API_URL as string | undefined)?.replace(/\/$/, "") ?? "";

export function isMissionApiConfigured(): boolean {
  return API_URL.length > 0;
}

export function getMissionApiUrl(): string {
  return API_URL;
}

export async function missionApiFetch(path: string, init?: RequestInit): Promise<Response> {
  if (!API_URL) {
    throw new Error("Mission API URL not configured");
  }
  return fetch(`${API_URL}${path}`, {
    ...init,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
  });
}
