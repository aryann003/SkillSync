export interface Tokens {
  access: string;
  refresh: string;
}

export interface ApiMessage<T> {
  message: string;
  data: T;
}

export interface User {
  id: number;
  username: string;
  email?: string;
}

export interface Profile {
  id: number;
  user: number;
  username?: string;
  bio: string;
  skills: string;
  interests: string;
  profession: string;
  profile_image: string | null;
  created_at: string;
}

export interface Post {
  id: number;
  user: number;
  username?: string;
  profile_image?: string | null;
  title: string;
  content: string;
  likes_count?: number;
  comments_count?: number;
  created_at: string;
  updated_at: string;
}

export interface Comment {
  id: number;
  user: number;
  username?: string;
  profile_image?: string | null;
  post: number;
  content: string;
  created_at: string;
}

export interface Community {
  id: number;
  name: string;
  description: string;
  created_by: number;
  created_at: string;
  member_count?: number;
}

export interface CommunityMember {
  id: number;
  user: User;
  community: number;
  joined_at: string;
}

export interface CommunityPost {
  id: number;
  user: number;
  community: number;
  title: string;
  content: string;
  created_at: string;
  updated_at: string;
}

export interface Connection {
  id: number;
  follower: User;
  following: User;
  created_at: string;
}
