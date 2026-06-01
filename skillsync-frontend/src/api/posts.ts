import client from "./client";
import { Comment, CommunityPost, Post, SavedPost } from "../types";

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export interface ActivityFeedResponse {
  message: string;
  posts_from_followed_users: Post[];
  posts_from_communities: CommunityPost[];
}

const normalizePaginated = <T>(data: unknown): PaginatedResponse<T> => {
  if (Array.isArray(data)) {
    return {
      count: data.length,
      next: null,
      previous: null,
      results: data as T[]
    };
  }

  const obj = data as Partial<PaginatedResponse<T>> | null;
  return {
    count: typeof obj?.count === "number" ? obj.count : Array.isArray(obj?.results) ? obj.results.length : 0,
    next: typeof obj?.next === "string" ? obj.next : null,
    previous: typeof obj?.previous === "string" ? obj.previous : null,
    results: Array.isArray(obj?.results) ? obj.results : []
  };
};

/** Fetches all posts. */
export const getPosts = async (page = 1): Promise<PaginatedResponse<Post>> => normalizePaginated<Post>((await client.get(`posts/?page=${page}`)).data);
/** Creates a post. */
export const createPost = async (payload: { title: string; content: string; image?: File | null }): Promise<{ data: Post }> => {
  const formData = new FormData();
  formData.append("title", payload.title);
  formData.append("content", payload.content);
  if (payload.image) formData.append("image", payload.image);
  return (await client.post("posts/create/", formData)).data;
};
/** Updates a post by id. */
export const updatePost = async (id: number, payload: { title?: string; content?: string; image?: File | null }): Promise<{ data: Post }> => {
  const formData = new FormData();
  if (typeof payload.title === "string") formData.append("title", payload.title);
  if (typeof payload.content === "string") formData.append("content", payload.content);
  if (payload.image) formData.append("image", payload.image);
  return (await client.patch(`posts/update/${id}/`, formData)).data;
};
/** Deletes a post by id. */
export const deletePost = async (id: number): Promise<{ message: string }> => (await client.delete(`posts/delete/${id}/`)).data;
/** Likes a post by id. */
export const likePost = async (id: number): Promise<{ message: string }> => (await client.post(`posts/like/${id}/`)).data;
/** Unlikes a post by id. */
export const unlikePost = async (id: number): Promise<{ message: string }> => (await client.delete(`posts/unlike/${id}/`)).data;
/** Saves a post by id. */
export const savePost = async (id: number): Promise<{ message: string }> => (await client.post(`posts/save/${id}/`)).data;
/** Unsaves a post by id. */
export const unsavePost = async (id: number): Promise<{ message: string }> => (await client.delete(`posts/unsave/${id}/`)).data;
/** Gets saved posts of logged-in user. */
export const getSavedPosts = async (): Promise<SavedPost[]> => {
  const data = (await client.get("posts/saved/")).data;
  if (Array.isArray(data)) return data;
  if (data && Array.isArray(data.results)) return data.results as SavedPost[];
  return [];
};
/** Gets comments for a post id. */
export const getComments = async (id: number): Promise<Comment[]> => (await client.get(`posts/comments/${id}/`)).data;
/** Adds comment/reply to a post id. */
export const addComment = async (id: number, content: string, parent?: number): Promise<{ data: Comment }> => {
  const payload: { content: string; parent?: number } = { content };
  if (typeof parent === "number") payload.parent = parent;
  return (await client.post(`posts/comment/${id}/`, payload)).data;
};
/** Updates a comment by comment id. */
export const updateComment = async (id: number, content: string): Promise<{ data: Comment }> => (await client.patch(`posts/comment/update/${id}/`, { content })).data;
/** Deletes a comment by comment id. */
export const deleteComment = async (id: number): Promise<{ message: string }> => (await client.delete(`posts/comment/delete/${id}/`)).data;
/** Gets activity feed with followed users and joined communities posts. */
export const getActivityFeed = async (): Promise<ActivityFeedResponse> => (await client.get("posts/feed/")).data;
