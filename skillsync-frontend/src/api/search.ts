import client from "./client";
import { Community, Profile } from "../types";

const normalizeList = <T>(data: unknown): T[] => {
  if (Array.isArray(data)) return data as T[];
  if (data && typeof data === "object") {
    const obj = data as { results?: unknown; data?: unknown };
    if (Array.isArray(obj.results)) return obj.results as T[];
    if (Array.isArray(obj.data)) return obj.data as T[];
  }
  return [];
};

/** Searches users by query string. */
export const searchUsers = async (q: string): Promise<Profile[]> => normalizeList<Profile>((await client.get(`search/users/?q=${encodeURIComponent(q)}`)).data);
/** Gets recommended users for current user. */
export const recommendedUsers = async (): Promise<Profile[]> => {
  const res = await client.get("recommend/users/");
  return normalizeList<Profile>(res.data);
};
/** Searches communities by query string. */
export const searchCommunityIndex = async (q: string): Promise<Community[]> => normalizeList<Community>((await client.get(`communities/search/?q=${encodeURIComponent(q)}`)).data);
/** Gets recommended communities for current user. */
export const recommendedCommunityIndex = async (): Promise<Community[]> => {
  const res = await client.get("communities/recommend/");
  return normalizeList<Community>(res.data);
};
