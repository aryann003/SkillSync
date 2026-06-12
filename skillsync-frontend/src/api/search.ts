import client from "./client";
import { Community, Post, Profile } from "../types";
import { fetchAllPages } from "./pagination";

export interface GlobalSearchResult {
  query: string;
  users: Profile[];
  posts: Post[];
  communities: Community[];
}

/** Searches users by query string. */
export const searchUsers = async (q: string): Promise<Profile[]> => fetchAllPages<Profile>(`search/users/?q=${encodeURIComponent(q)}`);
/** Gets recommended users for current user. */
export const recommendedUsers = async (): Promise<Profile[]> => fetchAllPages<Profile>("recommend/users/");
/** Searches users, posts, and communities in one request. */
export const globalSearch = async (q: string): Promise<GlobalSearchResult> => (await client.get(`search/?q=${encodeURIComponent(q)}`)).data;
/** Searches communities by query string. */
export const searchCommunityIndex = async (q: string): Promise<Community[]> => fetchAllPages<Community>(`communities/search/?q=${encodeURIComponent(q)}`);
/** Gets recommended communities for current user. */
export const recommendedCommunityIndex = async (): Promise<Community[]> => fetchAllPages<Community>("communities/recommend/");
