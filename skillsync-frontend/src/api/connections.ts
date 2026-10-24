import client from "./client";
import { Connection, User } from "../types";

export interface BlockedUser {
  id: number;
  blocker: User;
  blocked: User;
  created_at: string;
}

const normalizeList = <T>(data: unknown): T[] => {
  if (Array.isArray(data)) return data as T[];
  if (data && typeof data === "object") {
    const obj = data as { results?: unknown; data?: unknown };
    if (Array.isArray(obj.results)) return obj.results as T[];
    if (Array.isArray(obj.data)) return obj.data as T[];
  }
  return [];
};

const cacheKey = (kind: "followers" | "following", id: number) => `skillsync:${kind}:${id}`;

export const readCachedConnections = (kind: "followers" | "following", id: number): { data: Connection[]; updatedAt: number } | undefined => {
  if (typeof window === "undefined") return undefined;
  try {
    const raw = window.localStorage.getItem(cacheKey(kind, id));
    if (!raw) return undefined;
    const cached = JSON.parse(raw) as { data?: unknown; updatedAt?: unknown };
    if (!Array.isArray(cached.data) || typeof cached.updatedAt !== "number") return undefined;
    return { data: cached.data as Connection[], updatedAt: cached.updatedAt };
  } catch {
    return undefined;
  }
};

export const cacheConnections = (kind: "followers" | "following", id: number, data: Connection[]) => {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(cacheKey(kind, id), JSON.stringify({ data, updatedAt: Date.now() }));
  } catch {
    // The live query cache still works when browser storage is unavailable.
  }
};

/** Follows a user by id. */
export const followUser = async (id: number): Promise<{ message: string }> => (await client.post(`connections/follow/${id}/`)).data;
/** Unfollows a user by id. */
export const unfollowUser = async (id: number): Promise<{ message: string }> => (await client.delete(`connections/unfollow/${id}/`)).data;
/** Blocks a user and removes any follow relationships between the two accounts. */
export const blockUser = async (id: number): Promise<{ message: string; data: BlockedUser }> => (await client.post(`connections/block/${id}/`)).data;
/** Removes a block placed by the current user. */
export const unblockUser = async (id: number): Promise<{ message: string }> => (await client.delete(`connections/unblock/${id}/`)).data;
/** Lists users blocked by the current user. */
export const getBlockedUsers = async (): Promise<BlockedUser[]> => normalizeList<BlockedUser>((await client.get("connections/blocked-users/")).data);
/** Gets followers for a user id. */
export const getFollowers = async (id: number): Promise<Connection[]> => {
  const data = normalizeList<Connection>((await client.get(`connections/followers/${id}/`)).data);
  cacheConnections("followers", id, data);
  return data;
};
/** Gets following for a user id. */
export const getFollowing = async (id: number): Promise<Connection[]> => {
  const data = normalizeList<Connection>((await client.get(`connections/following/${id}/`)).data);
  cacheConnections("following", id, data);
  return data;
};
