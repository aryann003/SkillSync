import client from "./client";
import { Connection } from "../types";

const normalizeList = <T>(data: unknown): T[] => {
  if (Array.isArray(data)) return data as T[];
  if (data && typeof data === "object") {
    const obj = data as { results?: unknown; data?: unknown };
    if (Array.isArray(obj.results)) return obj.results as T[];
    if (Array.isArray(obj.data)) return obj.data as T[];
  }
  return [];
};

/** Follows a user by id. */
export const followUser = async (id: number): Promise<{ message: string }> => (await client.post(`connections/follow/${id}/`)).data;
/** Unfollows a user by id. */
export const unfollowUser = async (id: number): Promise<{ message: string }> => (await client.delete(`connections/unfollow/${id}/`)).data;
/** Gets followers for a user id. */
export const getFollowers = async (id: number): Promise<Connection[]> => normalizeList<Connection>((await client.get(`connections/followers/${id}/`)).data);
/** Gets following for a user id. */
export const getFollowing = async (id: number): Promise<Connection[]> => normalizeList<Connection>((await client.get(`connections/following/${id}/`)).data);
