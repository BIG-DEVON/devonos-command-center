export type WorkspaceCollections = {
  kpis: Record<string, unknown>[];
  social: Record<string, unknown>[];
  assets: Record<string, unknown>[];
  events: Record<string, unknown>[];
  birthdays: Record<string, unknown>[];
  ai: Record<string, unknown>[];
  projects: Record<string, unknown>[];
  news: Record<string, unknown>[];
};

async function fetchCollection(endpoint: string, key: string) {
  const response = await fetch(endpoint, {
    method: "GET",
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`Could not load ${key}.`);
  }

  const data = (await response.json()) as Record<string, unknown>;
  const collection = data[key];

  if (data.ok !== true || !Array.isArray(collection)) {
    throw new Error(`Invalid ${key} response.`);
  }

  return collection as Record<string, unknown>[];
}

export async function loadWorkspaceCollections(): Promise<WorkspaceCollections> {
  const [kpis, social, assets, events, birthdays, ai, projects, news] =
    await Promise.all([
      fetchCollection("/api/kpis", "kpis"),
      fetchCollection("/api/social", "drafts"),
      fetchCollection("/api/assets", "assets"),
      fetchCollection("/api/events", "events"),
      fetchCollection("/api/birthdays", "profiles"),
      fetchCollection("/api/ai", "drafts"),
      fetchCollection("/api/projects", "projects"),
      fetchCollection("/api/news", "newsItems"),
    ]);

  return {
    kpis,
    social,
    assets,
    events,
    birthdays,
    ai,
    projects,
    news,
  };
}
