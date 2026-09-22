export type SearchKind =
  | "People"
  | "Workspace"
  | "Projects"
  | "KPI"
  | "Social"
  | "Assets"
  | "Events"
  | "Birthdays"
  | "News"
  | "Approvals"
  | "Reports"
  | "AI"
  | "Autopilot"
  | "Automations"
  | "Notifications";

export type UniversalSearchResult = {
  id: string;
  kind: SearchKind;
  title: string;
  subtitle: string;
  body: string;
  status: string;
  href: string;
  imageUrl: string;
  date: string;
  keywords: string;
  actionLabel: string;
  score?: number;
};

export type UniversalSearchResponse = {
  ok: boolean;
  query: string;
  total: number;
  indexed: number;
  results: UniversalSearchResult[];
  counts: Partial<Record<SearchKind, number>>;
  message?: string;
};

export function normalizeSearchText(value: string) {
  return value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

export function scoreSearchResult(
  result: UniversalSearchResult,
  rawQuery: string
) {
  const query = normalizeSearchText(rawQuery);
  if (!query) {
    if (result.kind === "Workspace") return 120;
    if (result.kind === "People") return 90;
    return 50;
  }

  const terms = query.split(" ").filter(Boolean);
  const title = normalizeSearchText(result.title);
  const subtitle = normalizeSearchText(result.subtitle);
  const body = normalizeSearchText(result.body);
  const keywords = normalizeSearchText(
    `${result.keywords} ${result.status} ${result.kind}`
  );
  const haystack = `${title} ${subtitle} ${body} ${keywords}`;

  if (!terms.every((term) => haystack.includes(term))) return 0;

  let score = 20;
  if (title === query) score += 800;
  if (title.startsWith(query)) score += 430;
  if (title.includes(query)) score += 280;
  if (subtitle.includes(query)) score += 150;
  if (keywords.includes(query)) score += 110;
  if (body.includes(query)) score += 55;

  for (const term of terms) {
    if (title.split(" ").includes(term)) score += 90;
    else if (title.includes(term)) score += 55;
    if (subtitle.includes(term)) score += 30;
    if (keywords.includes(term)) score += 22;
  }

  if (result.kind === "People") score += 18;
  if (result.kind === "Workspace") score += 12;

  return score;
}
