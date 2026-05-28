import client from "./client";
import { Comment, Post, SavedPost } from "../types";

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
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
export const createPost = async (payload: { title: string; content: string }): Promise<{ data: Post }> => (await client.post("posts/create/", payload)).data;
/** Updates a post by id. */
export const updatePost = async (id: number, payload: Partial<Post>): Promise<{ data: Post }> => (await client.patch(`posts/update/${id}/`, payload)).data;
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
/** Adds comment to a post id. */
export const addComment = async (id: number, content: string): Promise<{ data: Comment }> => (await client.post(`posts/comment/${id}/`, { content })).data;
