import client from "./client";

interface PaginatedLike<T> {
  next?: string | null;
  results?: T[];
  data?: T[];
}

const extractItems = <T>(data: unknown): T[] => {
  if (Array.isArray(data)) return data as T[];
  if (data && typeof data === "object") {
    const obj = data as PaginatedLike<T>;
    if (Array.isArray(obj.results)) return obj.results;
    if (Array.isArray(obj.data)) return obj.data;
  }
  return [];
};

/** Fetches all pages for DRF paginated endpoints and returns a flat list. */
export const fetchAllPages = async <T>(path: string): Promise<T[]> => {
  const aggregated: T[] = [];
  let nextUrl: string | null = path;
  let guard = 0;

  while (nextUrl && guard < 50) {
    const response = await client.get(nextUrl);
    const data = response.data as unknown;
    const items = extractItems<T>(data);
    aggregated.push(...items);

    if (data && typeof data === "object" && "next" in (data as Record<string, unknown>)) {
      const paginated = data as PaginatedLike<T>;
      nextUrl = typeof paginated.next === "string" ? paginated.next : null;
    } else {
      nextUrl = null;
    }
    guard += 1;
  }

  return aggregated;
};
