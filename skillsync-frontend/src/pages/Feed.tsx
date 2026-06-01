import { useEffect, useMemo, useRef, useState } from "react";
import { usePosts } from "../hooks/usePosts";
import PostCard from "../components/PostCard";
import Skeleton from "../components/Skeleton";
import Card from "../components/Card";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import Button from "../components/Button";
import { toast } from "sonner";
import Modal from "../components/Modal";
import { Post } from "../types";
import { authStore } from "../store/authStore";
import { useQuery } from "@tanstack/react-query";
import { getCommunities, getCommunityPosts } from "../api/communities";
import { getActivityFeed } from "../api/posts";

const schema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  content: z.string().min(10, "Content must be at least 10 characters")
});
const MAX_POST_IMAGE_SIZE_BYTES = 5 * 1024 * 1024;

export default function FeedPage() {
  const { postsQuery, createMutation, likeMutation, savedPostsQuery, saveMutation, deleteMutation, updateMutation } = usePosts();
  const currentUser = authStore((s) => s.user);
  const loaderRef = useRef<HTMLDivElement | null>(null);
  const [likedPosts, setLikedPosts] = useState<Record<number, boolean>>({});
  const [likeCounts, setLikeCounts] = useState<Record<number, number>>({});
  const [savedPosts, setSavedPosts] = useState<Record<number, boolean>>({});
  const [deleteTarget, setDeleteTarget] = useState<Post | null>(null);
  const [editTarget, setEditTarget] = useState<Post | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editContent, setEditContent] = useState("");
  const [feedMode, setFeedMode] = useState<"all" | "activity">("all");
  const [communityFilter, setCommunityFilter] = useState<number>(0);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<z.infer<typeof schema>>({ resolver: zodResolver(schema) });
  const items = useMemo(() => postsQuery.data?.pages.flatMap((p) => p.items) ?? [], [postsQuery.data]);
  const communitiesQuery = useQuery({ queryKey: ["feed-communities"], queryFn: getCommunities, staleTime: 60_000 });
  const activityFeedQuery = useQuery({
    queryKey: ["activity-feed"],
    queryFn: getActivityFeed,
    staleTime: 60_000,
    enabled: feedMode === "activity"
  });
  const communityPostsQuery = useQuery({
    queryKey: ["feed-community-posts", communityFilter],
    queryFn: () => getCommunityPosts(communityFilter),
    enabled: communityFilter > 0
  });

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      if (entries[0]?.isIntersecting && postsQuery.hasNextPage && !postsQuery.isFetchingNextPage) {
        postsQuery.fetchNextPage();
      }
    }, { threshold: 0.2 });
    if (loaderRef.current) observer.observe(loaderRef.current);
    return () => observer.disconnect();
  }, [postsQuery]);

  useEffect(() => {
    const nextSaved = Object.fromEntries((savedPostsQuery.data ?? []).map((saved) => [saved.post.id, true]));
    setSavedPosts(nextSaved);
  }, [savedPostsQuery.data]);

  useEffect(() => {
    if (items.length === 0) return;
    setLikedPosts((prev) => {
      const next = { ...prev };
      for (const post of items) {
        if (typeof next[post.id] === "undefined") {
          next[post.id] = Boolean(post.is_liked);
        }
      }
      return next;
    });
  }, [items]);
  
  useEffect(() => {
    if (!imageFile) {
      setImagePreviewUrl(null);
      return;
    }
    const objectUrl = URL.createObjectURL(imageFile);
    setImagePreviewUrl(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [imageFile]);

  if (feedMode === "all" && communityFilter === 0 && postsQuery.isLoading) return <div className="space-y-3">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-36" />)}</div>;

  return (
    <div className="space-y-4">
      <Card>
        <div className="mb-3 flex items-center gap-2">
          <button
            className={`rounded-full border px-3 py-1 text-sm ${feedMode === "all" ? "bg-teal-500 text-white" : "hover:bg-slate-100 dark:hover:bg-slate-800"}`}
            onClick={() => setFeedMode("all")}
          >
            All posts
          </button>
          <button
            className={`rounded-full border px-3 py-1 text-sm ${feedMode === "activity" ? "bg-teal-500 text-white" : "hover:bg-slate-100 dark:hover:bg-slate-800"}`}
            onClick={() => {
              setFeedMode("activity");
              setCommunityFilter(0);
            }}
          >
            Activity
          </button>
        </div>
        <h2 className="mb-3 text-lg font-semibold">Share what you are learning</h2>
        <form className="space-y-2" onSubmit={handleSubmit(async (values) => {
          try {
            await createMutation.mutateAsync({ ...values, image: imageFile });
            toast.success("Post created");
            reset();
            setImageFile(null);
            setImagePreviewUrl(null);
          } catch {
            toast.error("Could not create post");
          }
        })}>
          <input className="w-full rounded-lg border bg-transparent p-2" placeholder="Post title" {...register("title")} />
          {errors.title && <p className="text-xs text-red-500">{errors.title.message}</p>}
          <textarea className="w-full rounded-lg border bg-transparent p-2" rows={4} placeholder="What did you practice today?" {...register("content")} />
          {errors.content && <p className="text-xs text-red-500">{errors.content.message}</p>}
          <div className="rounded-lg border border-dashed border-slate-400/60 p-3">
            <label htmlFor="post-image" className="mb-2 block text-sm font-medium">
              Add image
            </label>
            <input
              id="post-image"
              type="file"
              accept="image/*"
              className="w-full text-sm file:mr-3 file:rounded-full file:border-0 file:bg-teal-500 file:px-3 file:py-1.5 file:font-medium file:text-white hover:file:bg-teal-600"
              onChange={(e) => {
                const file = e.target.files?.[0] ?? null;
                if (!file) {
                  setImageFile(null);
                  return;
                }
                if (file.size > MAX_POST_IMAGE_SIZE_BYTES) {
                  toast.error("Image must be 5 MB or less");
                  e.currentTarget.value = "";
                  setImageFile(null);
                  return;
                }
                setImageFile(file);
              }}
            />
            <p className="mt-2 text-xs text-slate-500">Maximum file size: 5 MB</p>
            {imagePreviewUrl ? (
              <img src={imagePreviewUrl} alt="Selected preview" className="mt-3 max-h-56 w-full rounded-lg border object-cover" />
            ) : (
              <div className="mt-3 rounded-lg border bg-slate-50/60 p-4 text-center text-xs text-slate-500 dark:bg-slate-900/40">
                Image preview will appear here
              </div>
            )}
          </div>
          <Button disabled={isSubmitting || createMutation.isPending}>Publish post</Button>
        </form>
      </Card>
      {feedMode === "all" && (
      <Card>
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium">Community-specific posts</label>
          <select value={communityFilter} onChange={(e) => setCommunityFilter(Number(e.target.value))} className="rounded-lg border bg-transparent px-2 py-1 text-sm">
            <option value={0}>All global posts</option>
            {(communitiesQuery.data ?? []).map((community) => <option value={community.id} key={community.id}>{community.name}</option>)}
          </select>
        </div>
      </Card>
      )}

      {feedMode === "activity" ? (
        activityFeedQuery.isLoading ? <Skeleton className="h-20" /> : activityFeedQuery.isError ? <p>Could not load activity feed.</p> : (
          <div className="space-y-4">
            <Card>
              <h3 className="mb-2 text-lg font-semibold">From followed users</h3>
              {(activityFeedQuery.data?.posts_from_followed_users?.length ?? 0) === 0 ? <p className="text-sm text-slate-500">No posts yet.</p> : activityFeedQuery.data?.posts_from_followed_users.map((post) => (
                <PostCard key={`activity-followed-${post.id}`} post={post} mine={currentUser?.user === post.user} liked={Boolean(post.is_liked)} saved={Boolean(savedPosts[post.id])} likesCount={post.likes_count ?? 0} onLike={async () => {
                  const previousSaved = Boolean(savedPosts[post.id]);
                  const previousLike = Boolean(post.is_liked);
                  try {
                    await likeMutation.mutateAsync({ id: post.id, liked: previousLike });
                  } catch {
                    toast.error("Could not update like");
                  }
                  setSavedPosts((prev) => ({ ...prev, [post.id]: previousSaved }));
                }} onSave={async () => {
                  const previousSaved = Boolean(savedPosts[post.id]);
                  setSavedPosts((prev) => ({ ...prev, [post.id]: !previousSaved }));
                  try {
                    await saveMutation.mutateAsync({ id: post.id, saved: previousSaved });
                  } catch {
                    setSavedPosts((prev) => ({ ...prev, [post.id]: previousSaved }));
                    toast.error("Could not update saved post");
                  }
                }} onDelete={() => setDeleteTarget(post)} onEdit={() => {
                  setEditTarget(post);
                  setEditTitle(post.title);
                  setEditContent(post.content);
                }} />
              ))}
            </Card>
            <Card>
              <h3 className="mb-2 text-lg font-semibold">From your communities</h3>
              {(activityFeedQuery.data?.posts_from_communities?.length ?? 0) === 0 ? <p className="text-sm text-slate-500">No posts yet.</p> : activityFeedQuery.data?.posts_from_communities.map((post) => (
                <Card key={`activity-community-${post.id}`} className="mb-2">
                  <h4 className="text-lg font-semibold">{post.title}</h4>
                  <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">{post.content}</p>
                </Card>
              ))}
            </Card>
          </div>
        )
      ) : communityFilter > 0 ? (
        communityPostsQuery.isLoading ? <Skeleton className="h-20" /> : (communityPostsQuery.data?.length ?? 0) === 0 ? <p>No posts in this community yet.</p> : communityPostsQuery.data?.map((post) => (
          <Card key={post.id}>
            <h3 className="text-lg font-semibold">{post.title}</h3>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">{post.content}</p>
          </Card>
        ))
      ) : items.length === 0 ? <p>No posts yet. Be the first to share!</p> : items.map((post) => <PostCard key={post.id} post={post} mine={currentUser?.user === post.user} liked={Boolean(likedPosts[post.id])} saved={Boolean(savedPosts[post.id])} likesCount={likeCounts[post.id] ?? post.likes_count ?? 0} onLike={async () => {
        const previousLike = Boolean(likedPosts[post.id]);
        const previousCount = likeCounts[post.id] ?? post.likes_count ?? 0;
        setLikedPosts((prev) => ({ ...prev, [post.id]: !previousLike }));
        setLikeCounts((prev) => ({ ...prev, [post.id]: Math.max(0, previousCount + (previousLike ? -1 : 1)) }));
        try {
          await likeMutation.mutateAsync({ id: post.id, liked: previousLike });
        } catch {
          setLikedPosts((prev) => ({ ...prev, [post.id]: previousLike }));
          setLikeCounts((prev) => ({ ...prev, [post.id]: previousCount }));
          toast.error("Could not update like");
        }
      }} onSave={async () => {
        const previousSaved = Boolean(savedPosts[post.id]);
        setSavedPosts((prev) => ({ ...prev, [post.id]: !previousSaved }));
        try {
          await saveMutation.mutateAsync({ id: post.id, saved: previousSaved });
          toast.success(previousSaved ? "Post unsaved" : "Post saved");
        } catch {
          setSavedPosts((prev) => ({ ...prev, [post.id]: previousSaved }));
          toast.error("Could not update saved post");
        }
      }} onDelete={() => setDeleteTarget(post)} onEdit={() => {
        setEditTarget(post);
        setEditTitle(post.title);
        setEditContent(post.content);
      }} />)}
      {feedMode === "all" && communityFilter === 0 && <div ref={loaderRef} />}
      {feedMode === "all" && communityFilter === 0 && postsQuery.isFetchingNextPage && <Skeleton className="h-16" />}
      <Modal open={Boolean(deleteTarget)} title="Delete post?" onClose={() => setDeleteTarget(null)} onConfirm={async () => {
        if (!deleteTarget) return;
        try {
          await deleteMutation.mutateAsync(deleteTarget.id);
          toast.success("Post deleted");
        } catch {
          toast.error("Could not delete post");
        } finally {
          setDeleteTarget(null);
        }
      }}>This action cannot be undone.</Modal>
      <Modal open={Boolean(editTarget)} title="Edit post" onClose={() => setEditTarget(null)} onConfirm={async () => {
        if (!editTarget) return;
        if (editTitle.trim().length < 3 || editContent.trim().length < 10) {
          toast.error("Title or content is too short");
          return;
        }
        try {
          await updateMutation.mutateAsync({ id: editTarget.id, data: { title: editTitle.trim(), content: editContent.trim() } });
          toast.success("Post updated");
          setEditTarget(null);
        } catch {
          toast.error("Could not update post");
        }
      }}>
        <div className="space-y-2">
          <input value={editTitle} onChange={(e) => setEditTitle(e.target.value)} className="w-full rounded-lg border bg-transparent p-2 text-sm" />
          <textarea value={editContent} onChange={(e) => setEditContent(e.target.value)} rows={4} className="w-full rounded-lg border bg-transparent p-2 text-sm" />
        </div>
      </Modal>
    </div>
  );
}
