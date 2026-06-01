import client from "./client";
import { Community, CommunityMember, CommunityPost } from "../types";
import { fetchAllPages } from "./pagination";

/** Fetches all communities. */
export const getCommunities = async (): Promise<Community[]> => fetchAllPages<Community>("communities/");
/** Fetches a single community. */
export const getCommunity = async (id: number): Promise<Community> => (await client.get(`communities/${id}/`)).data;
/** Creates a community. */
export const createCommunity = async (payload: { name: string; description: string }): Promise<{ data: Community }> => (await client.post("communities/create/", payload)).data;
/** Joins community by id. */
export const joinCommunity = async (id: number): Promise<{ message: string }> => (await client.post(`communities/join/${id}/`)).data;
/** Leaves community by id. */
export const leaveCommunity = async (id: number): Promise<{ message: string }> => (await client.delete(`communities/leave/${id}/`)).data;
/** Gets community members. */
export const getCommunityMembers = async (id: number): Promise<CommunityMember[]> => fetchAllPages<CommunityMember>(`communities/members/${id}/`);
/** Gets community posts. */
export const getCommunityPosts = async (id: number): Promise<CommunityPost[]> => fetchAllPages<CommunityPost>(`communities/${id}/posts/`);
/** Creates a post in community by id. */
export const createCommunityPost = async (id: number, payload: { title: string; content: string }): Promise<{ data: CommunityPost }> => (await client.post(`communities/${id}/posts/create/`, payload)).data;
/** Deletes a community post by post id. */
export const deleteCommunityPost = async (id: number): Promise<{ message: string }> => (await client.delete(`communities/posts/delete/${id}/`)).data;
/** Searches communities. */
export const searchCommunities = async (q: string): Promise<Community[]> => fetchAllPages<Community>(`communities/search/?q=${encodeURIComponent(q)}`);
/** Gets recommended communities. */
export const recommendedCommunities = async (): Promise<Community[]> => fetchAllPages<Community>("communities/recommend/");
