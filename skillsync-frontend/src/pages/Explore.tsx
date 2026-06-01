import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { recommendedCommunityIndex, recommendedUsers, searchCommunityIndex, searchUsers } from "../api/search";
import UserCard from "../components/UserCard";
import CommunityCard from "../components/CommunityCard";
import { Community, Profile } from "../types";
import { followUser, getFollowing, unfollowUser } from "../api/connections";
import { joinCommunity } from "../api/communities";
import { toast } from "sonner";
import Skeleton from "../components/Skeleton";
import { AxiosError } from "axios";
import { authStore } from "../store/authStore";
import { useNavigate } from "react-router-dom";

export default function ExplorePage() {
  const navigate = useNavigate();
  const currentUser = authStore((s) => s.user);
  const [q, setQ] = useState("");
  const [users, setUsers] = useState<Profile[]>([]);
  const [communities, setCommunities] = useState<Community[]>([]);
  const [following, setFollowing] = useState<Record<number, boolean>>({});
  const [joined, setJoined] = useState<Record<number, boolean>>({});

  const recUsers = useQuery({ queryKey: ["recommended-users"], queryFn: recommendedUsers });
  const recCommunities = useQuery({ queryKey: ["recommended-communities"], queryFn: recommendedCommunityIndex });
  const myFollowingQuery = useQuery({
    queryKey: ["following", currentUser?.user],
    queryFn: () => getFollowing(currentUser?.user as number),
    enabled: !!currentUser?.user
  });
  const followMutation = useMutation({ mutationFn: followUser });
  const unfollowMutation = useMutation({ mutationFn: unfollowUser });
  const joinMutation = useMutation({ mutationFn: joinCommunity });

  const shownUsers = users.length ? users : recUsers.data ?? [];
  const shownCommunities = communities.length ? communities : recCommunities.data ?? [];

  return (
    <div className="space-y-5">
      <div className="rounded-3xl border border-white/40 bg-white/80 p-5 shadow-sm backdrop-blur dark:border-slate-800 dark:bg-slate-900/85">
        <h1 className="text-3xl font-bold">Explore</h1>
        <p className="mt-1 text-sm text-slate-500">Find mentors, peers, and communities that match your learning path.</p>
        <div className="mt-4 flex gap-2">
          <input value={q} onChange={(e) => setQ(e.target.value)} className="w-full rounded-xl border bg-transparent p-3" placeholder="Search users and communities" />
          <button className="rounded-xl border px-4 hover:bg-slate-100 dark:hover:bg-slate-800" onClick={async () => {
            setQ("");
            setUsers([]);
            setCommunities([]);
            await Promise.all([recUsers.refetch(), recCommunities.refetch()]);
            toast.success("Showing recommendations");
          }}>Recommendations</button>
          <button className="rounded-xl border px-4 hover:bg-slate-100 dark:hover:bg-slate-800" onClick={async () => {
            if (!q.trim()) {
              setUsers([]);
              setCommunities([]);
              await Promise.all([recUsers.refetch(), recCommunities.refetch()]);
              toast.success("Showing recommendations");
              return;
            }
            try {
              const [u, c] = await Promise.all([searchUsers(q), searchCommunityIndex(q)]);
              setUsers(u);
              setCommunities(c);
            } catch {
              toast.error("Search failed");
            }
          }}>Search</button>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <section className="space-y-2">
          <h2 className="text-lg font-semibold">People</h2>
          {recUsers.isLoading ? <Skeleton className="h-28" /> : shownUsers.length === 0 ? <p className="rounded-xl border p-4 text-sm text-slate-500">No users found.</p> : shownUsers.map((user) => <UserCard key={user.id} user={user} following={following[user.user] ?? Boolean(myFollowingQuery.data?.some((item) => item.following.id === user.user))} loading={followMutation.isPending || unfollowMutation.isPending} onToggle={async () => {
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
          {recCommunities.isLoading ? <Skeleton className="h-28" /> : shownCommunities.length === 0 ? <p className="rounded-xl border p-4 text-sm text-slate-500">No communities found.</p> : shownCommunities.map((community) => <CommunityCard key={community.id} community={community} joined={joined[community.id] ?? Boolean(community.is_member)} loading={joinMutation.isPending} onToggle={async () => {
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
