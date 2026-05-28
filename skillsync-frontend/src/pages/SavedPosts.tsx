import { useMemo, useState } from "react";
import { toast } from "sonner";
import PostCard from "../components/PostCard";
import Skeleton from "../components/Skeleton";
import { usePosts } from "../hooks/usePosts";

export default function SavedPostsPage() {
  const { likeMutation, saveMutation, savedPostsQuery } = usePosts();
  const [likedPosts, setLikedPosts] = useState<Record<number, boolean>>({});
  const [likeCounts, setLikeCounts] = useState<Record<number, number>>({});
  const [savedState, setSavedState] = useState<Record<number, boolean>>({});

  const savedItems = useMemo(() => savedPostsQuery.data ?? [], [savedPostsQuery.data]);

  if (savedPostsQuery.isLoading) {
    return <div className="space-y-3">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-36" />)}</div>;
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Saved Posts</h1>
      {savedItems.length === 0 ? <p className="rounded-xl border p-4 text-sm text-slate-500">You have no saved posts yet.</p> : savedItems.map((saved) => {
        const post = saved.post;
        const isSaved = savedState[post.id] ?? true;
        return (
          <PostCard
            key={saved.id}
            post={post}
            mine={false}
            liked={Boolean(likedPosts[post.id])}
            saved={Boolean(isSaved)}
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
              const previousSaved = Boolean(isSaved);
              setSavedState((prev) => ({ ...prev, [post.id]: !previousSaved }));
              try {
                await saveMutation.mutateAsync({ id: post.id, saved: previousSaved });
                toast.success(previousSaved ? "Post unsaved" : "Post saved");
              } catch {
                setSavedState((prev) => ({ ...prev, [post.id]: previousSaved }));
                toast.error("Could not update saved post");
              }
            }}
            onDelete={() => {}}
            onEdit={() => {}}
          />
        );
      })}
    </div>
  );
}
