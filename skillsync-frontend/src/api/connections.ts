import client from "./client";
import { Connection } from "../types";

/** Follows a user by id. */
export const followUser = async (id: number): Promise<{ message: string }> => (await client.post(`connections/follow/${id}/`)).data;
/** Unfollows a user by id. */
export const unfollowUser = async (id: number): Promise<{ message: string }> => (await client.delete(`connections/unfollow/${id}/`)).data;
/** Gets followers for a user id. */
export const getFollowers = async (id: number): Promise<Connection[]> => (await client.get(`connections/followers/${id}/`)).data;
/** Gets following for a user id. */
export const getFollowing = async (id: number): Promise<Connection[]> => (await client.get(`connections/following/${id}/`)).data;
