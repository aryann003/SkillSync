import { useEffect, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { globalSearch, recommendedCommunityIndex, recommendedUsers, type GlobalSearchResult } from "../api/search";
import UserCard from "../components/UserCard";
import CommunityCard from "../components/CommunityCard";
import { Community, Post, Profile } from "../types";
import { followUser, getFollowing, unfollowUser } from "../api/connections";
import { joinCommunity } from "../api/communities";
import { toast } from "sonner";
import Skeleton from "../components/Skeleton";
import { AxiosError } from "axios";
import { authStore } from "../store/authStore";
import { useNavigate } from "react-router-dom";
import PostCard from "../components/PostCard";
import { usePosts } from "../hooks/usePosts";

export default function ExplorePage() {
  const navigate = useNavigate();
  const currentUser = authStore((s) => s.user);
  const [q, setQ] = useState("");
  const [searchResults, setSearchResults] = useState<GlobalSearchResult | null>(null);
  const [searching, setSearching] = useState(false);
  const [following, setFollowing] = useState<Record<number, boolean>>({});
  const [joined, setJoined] = useState<Record<number, boolean>>({});
  const [likedPosts, setLikedPosts] = useState<Record<number, boolean>>({});
  const [savedPosts, setSavedPosts] = useState<Record<number, boolean>>({});
  const [likeCounts, setLikeCounts] = useState<Record<number, number>>({});

  const recUsers = useQuery({ queryKey: ["recommended-users"], queryFn: recommendedUsers });
  const recCommunities = useQuery({ queryKey: ["recommended-communities"], queryFn: recommendedCommunityIndex });
  const { likeMutation, savedPostsQuery, saveMutation } = usePosts();
  const myFollowingQuery = useQuery({
    queryKey: ["following", currentUser?.user],
    queryFn: () => getFollowing(currentUser?.user as number),
    enabled: !!currentUser?.user
  });
  const followMutation = useMutation({ mutationFn: followUser });
  const unfollowMutation = useMutation({ mutationFn: unfollowUser });
  const joinMutation = useMutation({ mutationFn: joinCommunity });

  const shownUsers: Profile[] = searchResults ? searchResults.users : recUsers.data ?? [];
  const shownCommunities: Community[] = searchResults ? searchResults.communities : recCommunities.data ?? [];
  const shownPosts: Post[] = searchResults?.posts ?? [];
  const showRecommendations = !searchResults;

  useEffect(() => {
    const nextSaved = Object.fromEntries((savedPostsQuery.data ?? []).map((saved) => [saved.post.id, true]));
    setSavedPosts(nextSaved);
  }, [savedPostsQuery.data]);

  useEffect(() => {
    if (shownPosts.length === 0) return;
    setLikedPosts((prev) => {
      const next = { ...prev };
      for (const post of shownPosts) {
        if (typeof next[post.id] === "undefined") next[post.id] = Boolean(post.is_liked);
      }
      return next;
    });
    setLikeCounts((prev) => {
      const next = { ...prev };
      for (const post of shownPosts) {
        if (typeof next[post.id] === "undefined") next[post.id] = post.likes_count ?? 0;
      }
      return next;
    });
  }, [shownPosts]);

  return (
    <div className="space-y-5">
      <div className="rounded-3xl border border-white/40 bg-white/80 p-5 shadow-sm backdrop-blur dark:border-slate-800 dark:bg-slate-900/85">
        <h1 className="text-3xl font-bold">Explore</h1>
        <p className="mt-1 text-sm text-slate-500">Find mentors, posts, and communities that match your learning path.</p>
        <div className="mt-4 flex gap-2">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="w-full rounded-xl border bg-transparent p-3"
            placeholder="Search people, posts, and communities"
          />
          <button className="rounded-xl border px-4 hover:bg-slate-100 dark:hover:bg-slate-800" onClick={async () => {
            setQ("");
            setSearchResults(null);
            await Promise.all([recUsers.refetch(), recCommunities.refetch()]);
            toast.success("Showing recommendations");
          }}>Recommendations</button>
          <button className="rounded-xl border px-4 hover:bg-slate-100 disabled:opacity-60 dark:hover:bg-slate-800" disabled={searching} onClick={async () => {
            if (!q.trim()) {
              setSearchResults(null);
              await Promise.all([recUsers.refetch(), recCommunities.refetch()]);
              toast.success("Showing recommendations");
              return;
            }
            try {
              setSearching(true);
              const result = await globalSearch(q);
              setSearchResults(result);
            } catch {
              toast.error("Search failed");
            } finally {
              setSearching(false);
            }
          }}>{searching ? "Searching..." : "Search"}</button>
        </div>
      </div>

      {!showRecommendations && (
        <div className="rounded-2xl border border-white/40 bg-white/70 px-4 py-3 text-sm text-slate-600 backdrop-blur dark:border-slate-800 dark:bg-slate-900/70 dark:text-slate-300">
          Showing results for <span className="font-semibold">"{searchResults?.query ?? q}"</span>
        </div>
      )}

      {!showRecommendations && (
        <section className="space-y-2">
          <h2 className="text-lg font-semibold">Posts</h2>
          {shownPosts.length === 0 ? <p className="rounded-xl border p-4 text-sm text-slate-500">No posts found.</p> : shownPosts.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              mine={false}
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
              onDelete={() => undefined}
              onEdit={() => undefined}
            />
          ))}
        </section>
      )}

      <div className="grid gap-4 lg:grid-cols-2">
        <section className="space-y-2">
          <h2 className="text-lg font-semibold">People</h2>
          {showRecommendations && recUsers.isLoading ? <Skeleton className="h-28" /> : shownUsers.length === 0 ? <p className="rounded-xl border p-4 text-sm text-slate-500">No users found.</p> : shownUsers.map((user) => <UserCard key={user.id} user={user} following={following[user.user] ?? Boolean(myFollowingQuery.data?.some((item) => item.following.id === user.user))} loading={followMutation.isPending || unfollowMutation.isPending} onToggle={async () => {
            const isFollowing = following[user.user] ?? Boolean(myFollowingQuery.data?.some((item) => item.following.id === user.user));
            try {
              if (isFollowing) {
                await unfollowMutation.mutateAsync(user.user);
                setFollowing((prev) => ({ ...prev, [user.user]: false }));
                await myFollowingQuery.refetch();
                toast.success("Unfollowed user");
              } else {
                await followMutation.mutateAsync(user.user);
                setFollowing((prev) => ({ ...prev, [user.user]: true }));
                await myFollowingQuery.refetch();
                toast.success("Now following user");
              }
            } catch (error) {
              const axiosError = error as AxiosError<{ error?: string; message?: string }>;
              toast.error(axiosError.response?.data?.error || axiosError.response?.data?.message || "Action failed");
            }
          }} />)}
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold">Communities</h2>
          {showRecommendations && recCommunities.isLoading ? <Skeleton className="h-28" /> : shownCommunities.length === 0 ? <p className="rounded-xl border p-4 text-sm text-slate-500">No communities found.</p> : shownCommunities.map((community) => <CommunityCard key={community.id} community={community} joined={joined[community.id] ?? Boolean(community.is_member)} loading={joinMutation.isPending} onToggle={async () => {
            const isJoined = joined[community.id] ?? Boolean(community.is_member);
            if (isJoined) {
              navigate(`/communities/${community.id}`);
              return;
            }
            try {
              await joinMutation.mutateAsync(community.id);
              setJoined((prev) => ({ ...prev, [community.id]: true }));
              toast.success("Joined community");
            } catch (error) {
              const axiosError = error as AxiosError<{ error?: string; message?: string }>;
              const message = axiosError.response?.data?.error || axiosError.response?.data?.message || "Action failed";

              if (message.toLowerCase().includes("already a member")) {
                setJoined((prev) => ({ ...prev, [community.id]: true }));
                toast.success("Already joined");
                return;
              }

              toast.error(message);
            }
          }} />)}
        </section>
      </div>
    </div>
  );
}
