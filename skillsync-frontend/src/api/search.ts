import client from "./client";
import { Community, Profile } from "../types";
import { fetchAllPages } from "./pagination";

/** Searches users by query string. */
export const searchUsers = async (q: string): Promise<Profile[]> => fetchAllPages<Profile>(`search/users/?q=${encodeURIComponent(q)}`);
/** Gets recommended users for current user. */
export const recommendedUsers = async (): Promise<Profile[]> => fetchAllPages<Profile>("recommend/users/");
/** Searches communities by query string. */
export const searchCommunityIndex = async (q: string): Promise<Community[]> => fetchAllPages<Community>(`communities/search/?q=${encodeURIComponent(q)}`);
/** Gets recommended communities for current user. */
export const recommendedCommunityIndex = async (): Promise<Community[]> => fetchAllPages<Community>("communities/recommend/");
