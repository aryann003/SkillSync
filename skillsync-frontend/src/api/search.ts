import client from "./client";
import { Community, Profile } from "../types";

/** Searches users by query string. */
export const searchUsers = async (q: string): Promise<Profile[]> => (await client.get(`search/users/?q=${encodeURIComponent(q)}`)).data;
/** Gets recommended users for current user. */
export const recommendedUsers = async (): Promise<Profile[]> => {
  const res = await client.get("recommend/users/");
  return Array.isArray(res.data) ? res.data : res.data.data;
};
/** Searches communities by query string. */
export const searchCommunityIndex = async (q: string): Promise<Community[]> => (await client.get(`communities/search/?q=${encodeURIComponent(q)}`)).data;
/** Gets recommended communities for current user. */
export const recommendedCommunityIndex = async (): Promise<Community[]> => {
  const res = await client.get("communities/recommend/");
  return Array.isArray(res.data) ? res.data : res.data.data;
};
