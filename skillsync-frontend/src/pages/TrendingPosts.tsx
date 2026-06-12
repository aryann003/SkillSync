import { useEffect, useMemo, useRef, useState } from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import { Flame, RefreshCcw } from "lucide-react";
import { toast } from "sonner";
import Card from "../components/Card";
import Button from "../components/Button";
import Skeleton from "../components/Skeleton";
import PostCard from "../components/PostCard";
import Modal from "../components/Modal";
import { Post } from "../types";
import { getTrendingPosts } from "../api/posts";
import { usePosts } from "../hooks/usePosts";
import { authStore } from "../store/authStore";

export default function TrendingPostsPage() {
  const currentUser = authStore((s) => s.user);
  const { likeMutation, savedPostsQuery, saveMutation, deleteMutation, updateMutation } = usePosts();
  const loaderRef = useRef<HTMLDivElement | null>(null);
  const [likedPosts, setLikedPosts] = useState<Record<number, boolean>>({});
  const [likeCounts, setLikeCounts] = useState<Record<number, number>>({});
  const [savedPosts, setSavedPosts] = useState<Record<number, boolean>>({});
  const [deleteTarget, setDeleteTarget] = useState<Post | null>(null);
  const [editTarget, setEditTarget] = useState<Post | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editContent, setEditContent] = useState("");

  const trendingQuery = useInfiniteQuery({
    queryKey: ["posts", "trending"],
    initialPageParam: 1,
    queryFn: async ({ pageParam }) => {
      const data = await getTrendingPosts(pageParam);
      return {
        items: data.results,
        nextPage: data.next ? pageParam + 1 : undefined
      };
    },
    getNextPageParam: (lastPage) => lastPage.nextPage,
    staleTime: 60_000
  });

  const items = useMemo(() => trendingQuery.data?.pages.flatMap((page) => page.items) ?? [], [trendingQuery.data]);

  useEffect(() => {
    const nextSaved = Object.fromEntries((savedPostsQuery.data ?? []).map((saved) => [saved.post.id, true]));
    setSavedPosts(nextSaved);
  }, [savedPostsQuery.data]);

  useEffect(() => {
    if (items.length === 0) return;
    setLikedPosts((prev) => {
      const next = { ...prev };
      for (const post of items) {
        if (typeof next[post.id] === "undefined") next[post.id] = Boolean(post.is_liked);
      }
      return next;
    });
    setLikeCounts((prev) => {
      const next = { ...prev };
      for (const post of items) {
        if (typeof next[post.id] === "undefined") next[post.id] = post.likes_count ?? 0;
      }
      return next;
    });
  }, [items]);

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      if (entries[0]?.isIntersecting && trendingQuery.hasNextPage && !trendingQuery.isFetchingNextPage) {
        trendingQuery.fetchNextPage();
      }
    }, { threshold: 0.2 });

    if (loaderRef.current) observer.observe(loaderRef.current);
    return () => observer.disconnect();
  }, [trendingQuery]);

  if (trendingQuery.isLoading) {
    return <div className="space-y-3">{Array.from({ length: 4 }).map((_, index) => <Skeleton key={index} className="h-36" />)}</div>;
  }

  return (
    <div className="space-y-4">
      <Card className="overflow-hidden p-0">
        <div className="relative bg-[radial-gradient(circle_at_top_right,_rgba(251,191,36,0.25),_transparent_26%),radial-gradient(circle_at_bottom_left,_rgba(244,63,94,0.18),_transparent_32%),linear-gradient(140deg,_rgba(69,26,3,0.98),_rgba(127,29,29,0.94)_45%,_rgba(23,37,84,0.96))] px-6 py-7 text-white">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs uppercase tracking-[0.25em] text-amber-100">
                <Flame size={14} />
                Trending
              </div>
              <h1 className="mt-4 text-3xl font-black tracking-tight md:text-4xl">Most active posts, ranked by likes and conversation.</h1>
              <p className="mt-3 text-sm text-amber-50/90">See what the network is reacting to right now and jump into the busiest discussions.</p>
            </div>
            <Button
              className="bg-white/15 backdrop-blur hover:bg-white/20"
              disabled={trendingQuery.isFetching}
              onClick={() => trendingQuery.refetch()}
            >
              <span className="inline-flex items-center gap-2">
                <RefreshCcw size={16} className={trendingQuery.isFetching ? "animate-spin" : ""} />
                Refresh
              </span>
            </Button>
          </div>
        </div>
      </Card>

      {trendingQuery.isError ? (
        <Card className="border-rose-200 bg-rose-50/80 dark:border-rose-900 dark:bg-rose-950/30">
          <p className="text-sm text-rose-600 dark:text-rose-200">Could not load trending posts right now.</p>
        </Card>
      ) : items.length === 0 ? (
        <Card>
          <p className="text-sm text-slate-500">No trending posts yet. Activity will appear here once people start engaging.</p>
        </Card>
      ) : (
        items.map((post) => (
          <PostCard
            key={post.id}
            post={post}
            mine={currentUser?.user === post.user}
            liked={Boolean(likedPosts[post.id])}
            saved={Boolean(savedPosts[post.id])}
            likesCount={likeCounts[post.id] ?? post.likes_count ?? 0}
            onLike={async () => {
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
            }}
            onSave={async () => {
              const previousSaved = Boolean(savedPosts[post.id]);
              setSavedPosts((prev) => ({ ...prev, [post.id]: !previousSaved }));
              try {
                await saveMutation.mutateAsync({ id: post.id, saved: previousSaved });
                toast.success(previousSaved ? "Post unsaved" : "Post saved");
              } catch {
                setSavedPosts((prev) => ({ ...prev, [post.id]: previousSaved }));
                toast.error("Could not update saved post");
              }
            }}
            onDelete={() => setDeleteTarget(post)}
            onEdit={() => {
              setEditTarget(post);
              setEditTitle(post.title);
              setEditContent(post.content);
            }}
          />
        ))
      )}

      <div ref={loaderRef} />
      {trendingQuery.isFetchingNextPage && <Skeleton className="h-16" />}

      <Modal
        open={Boolean(deleteTarget)}
        title="Delete post?"
        onClose={() => setDeleteTarget(null)}
        onConfirm={async () => {
          if (!deleteTarget) return;
          try {
            await deleteMutation.mutateAsync(deleteTarget.id);
            toast.success("Post deleted");
            trendingQuery.refetch();
          } catch {
            toast.error("Could not delete post");
          } finally {
            setDeleteTarget(null);
          }
        }}
      >
        This action cannot be undone.
      </Modal>

      <Modal
        open={Boolean(editTarget)}
        title="Edit post"
        onClose={() => setEditTarget(null)}
        onConfirm={async () => {
          if (!editTarget) return;
          if (editTitle.trim().length < 3 || editContent.trim().length < 10) {
            toast.error("Title or content is too short");
            return;
          }
          try {
            await updateMutation.mutateAsync({ id: editTarget.id, data: { title: editTitle.trim(), content: editContent.trim() } });
            toast.success("Post updated");
            setEditTarget(null);
            trendingQuery.refetch();
          } catch {
            toast.error("Could not update post");
          }
        }}
      >
        <div className="space-y-2">
          <input value={editTitle} onChange={(e) => setEditTitle(e.target.value)} className="w-full rounded-lg border bg-transparent p-2 text-sm" />
          <textarea value={editContent} onChange={(e) => setEditContent(e.target.value)} rows={4} className="w-full rounded-lg border bg-transparent p-2 text-sm" />
        </div>
      </Modal>
    </div>
  );
}
