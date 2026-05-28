import client from "./client";
import { Community, CommunityMember, CommunityPost } from "../types";

const normalizeList = <T>(data: unknown): T[] => {
  if (Array.isArray(data)) return data as T[];
  if (data && typeof data === "object") {
    const obj = data as { results?: unknown; data?: unknown };
    if (Array.isArray(obj.results)) return obj.results as T[];
    if (Array.isArray(obj.data)) return obj.data as T[];
  }
  return [];
};

/** Fetches all communities. */
export const getCommunities = async (): Promise<Community[]> => normalizeList<Community>((await client.get("communities/")).data);
/** Fetches a single community. */
export const getCommunity = async (id: number): Promise<Community> => (await client.get(`communities/${id}/`)).data;
/** Creates a community. */
export const createCommunity = async (payload: { name: string; description: string }): Promise<{ data: Community }> => (await client.post("communities/create/", payload)).data;
/** Joins community by id. */
export const joinCommunity = async (id: number): Promise<{ message: string }> => (await client.post(`communities/join/${id}/`)).data;
/** Leaves community by id. */
export const leaveCommunity = async (id: number): Promise<{ message: string }> => (await client.delete(`communities/leave/${id}/`)).data;
/** Gets community members. */
export const getCommunityMembers = async (id: number): Promise<CommunityMember[]> => normalizeList<CommunityMember>((await client.get(`communities/members/${id}/`)).data);
/** Gets community posts. */
export const getCommunityPosts = async (id: number): Promise<CommunityPost[]> => normalizeList<CommunityPost>((await client.get(`communities/${id}/posts/`)).data);
/** Creates a post in community by id. */
export const createCommunityPost = async (id: number, payload: { title: string; content: string }): Promise<{ data: CommunityPost }> => (await client.post(`communities/${id}/posts/create/`, payload)).data;
/** Deletes a community post by post id. */
export const deleteCommunityPost = async (id: number): Promise<{ message: string }> => (await client.delete(`communities/posts/delete/${id}/`)).data;
/** Searches communities. */
export const searchCommunities = async (q: string): Promise<Community[]> => normalizeList<Community>((await client.get(`communities/search/?q=${encodeURIComponent(q)}`)).data);
/** Gets recommended communities. */
export const recommendedCommunities = async (): Promise<Community[]> => normalizeList<Community>((await client.get("communities/recommend/")).data);
