import client from "./client";
import { Profile, Tokens } from "../types";

export interface RegisterInput {
  username: string;
  email: string;
  password: string;
}

/** Registers a new user account. */
export const registerUser = async (payload: RegisterInput): Promise<{ message: string }> => {
  const { data } = await client.post("register/", payload);
  return data;
};

/** Logs in and returns access + refresh tokens. */
export const loginUser = async (payload: { username: string; password: string }): Promise<Tokens> => {
  const { data } = await client.post("token/", payload);
  return data;
};

/** Fetches the authenticated user's profile. */
export const getMyProfile = async (): Promise<Profile> => {
  const { data } = await client.get("profile/");
  return data;
};

/** Updates the authenticated user's profile fields. */
export const updateMyProfile = async (payload: Partial<Profile> | FormData): Promise<Profile> => {
  const isFormData = payload instanceof FormData;
  const { data } = await client.patch("profile/update/", payload, isFormData ? { headers: { "Content-Type": "multipart/form-data" } } : undefined);
  return data;
};
