import client from "./client";
import { Comment, Post } from "../types";

/** Fetches all posts. */
export const getPosts = async (): Promise<Post[]> => (await client.get("posts/")).data;
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
/** Gets comments for a post id. */
export const getComments = async (id: number): Promise<Comment[]> => (await client.get(`posts/comments/${id}/`)).data;
/** Adds comment to a post id. */
export const addComment = async (id: number, content: string): Promise<{ data: Comment }> => (await client.post(`posts/comment/${id}/`, { content })).data;
