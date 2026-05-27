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

const schema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  content: z.string().min(10, "Content must be at least 10 characters")
});

export default function FeedPage() {
  const { postsQuery, createMutation, likeMutation, deleteMutation, updateMutation } = usePosts();
  const currentUser = authStore((s) => s.user);
  const loaderRef = useRef<HTMLDivElement | null>(null);
  const [likedPosts, setLikedPosts] = useState<Record<number, boolean>>({});
  const [likeCounts, setLikeCounts] = useState<Record<number, number>>({});
  const [deleteTarget, setDeleteTarget] = useState<Post | null>(null);
  const [editTarget, setEditTarget] = useState<Post | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editContent, setEditContent] = useState("");
  const [communityFilter, setCommunityFilter] = useState<number>(0);
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<z.infer<typeof schema>>({ resolver: zodResolver(schema) });
  const items = useMemo(() => postsQuery.data?.pages.flatMap((p) => p.items) ?? [], [postsQuery.data]);
  const communitiesQuery = useQuery({ queryKey: ["feed-communities"], queryFn: getCommunities, staleTime: 60_000 });
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

  if (postsQuery.isLoading) return <div className="space-y-3">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-36" />)}</div>;

  return (
    <div className="space-y-4">
      <Card>
        <h2 className="mb-3 text-lg font-semibold">Share what you are learning</h2>
        <form className="space-y-2" onSubmit={handleSubmit(async (values) => {
          try {
            await createMutation.mutateAsync(values);
            toast.success("Post created");
            reset();
          } catch {
            toast.error("Could not create post");
          }
        })}>
          <input className="w-full rounded-lg border bg-transparent p-2" placeholder="Post title" {...register("title")} />
          {errors.title && <p className="text-xs text-red-500">{errors.title.message}</p>}
          <textarea className="w-full rounded-lg border bg-transparent p-2" rows={4} placeholder="What did you practice today?" {...register("content")} />
          {errors.content && <p className="text-xs text-red-500">{errors.content.message}</p>}
          <Button disabled={isSubmitting || createMutation.isPending}>Publish post</Button>
        </form>
      </Card>
      <Card>
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium">Community-specific posts</label>
          <select value={communityFilter} onChange={(e) => setCommunityFilter(Number(e.target.value))} className="rounded-lg border bg-transparent px-2 py-1 text-sm">
            <option value={0}>All global posts</option>
            {(communitiesQuery.data ?? []).map((community) => <option value={community.id} key={community.id}>{community.name}</option>)}
          </select>
        </div>
      </Card>

      {communityFilter > 0 ? (
        communityPostsQuery.isLoading ? <Skeleton className="h-20" /> : (communityPostsQuery.data?.length ?? 0) === 0 ? <p>No posts in this community yet.</p> : communityPostsQuery.data?.map((post) => (
          <Card key={post.id}>
            <h3 className="text-lg font-semibold">{post.title}</h3>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">{post.content}</p>
          </Card>
        ))
      ) : items.length === 0 ? <p>No posts yet. Be the first to share!</p> : items.map((post) => <PostCard key={post.id} post={post} mine={currentUser?.user === post.user} liked={Boolean(likedPosts[post.id])} likesCount={likeCounts[post.id] ?? post.likes_count ?? 0} onLike={async () => {
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
      }} onDelete={() => setDeleteTarget(post)} onEdit={() => {
        setEditTarget(post);
        setEditTitle(post.title);
        setEditContent(post.content);
      }} />)}
      <div ref={loaderRef} />
      {postsQuery.isFetchingNextPage && <Skeleton className="h-16" />}
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
