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
  image?: string | null;
  title: string;
  content: string;
  likes_count?: number;
  is_liked?: boolean;
  comments_count?: number;
  created_at: string;
  updated_at: string;
}

export interface SavedPost {
  id: number;
  user: number;
  post: Post;
  created_at: string;
}

export interface Comment {
  id: number;
  user: number;
  username?: string;
  profile_image?: string | null;
  post: number;
  parent?: number | null;
  content: string;
  created_at: string;
  updated_at?: string;
  replies?: Comment[];
}

export interface Community {
  id: number;
  name: string;
  description: string;
  created_by: number;
  created_at: string;
  member_count?: number;
  is_member?: boolean;
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
  username?: string;
  profile_image?: string | null;
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

export interface Notification {
  id: number;
  sender: number | null;
  sender_name?: string;
  notification_type: "follow" | "like" | "comment" | "community_join" | "message";
  message: string;
  is_read: boolean;
  created_at: string;
}

export interface DashboardStats {
  total_posts: number;
  total_followers: number;
  total_following: number;
  total_saved_posts: number;
  total_communities_joined: number;
  unread_notifications: number;
}
