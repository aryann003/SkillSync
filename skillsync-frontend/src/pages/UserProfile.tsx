import { useParams } from "react-router-dom";
import { useConnections } from "../hooks/useConnections";
import Button from "../components/Button";
import { toast } from "sonner";
import { AxiosError } from "axios";
import { useState } from "react";
import { Link } from "react-router-dom";
import { authStore } from "../store/authStore";
import { useQuery } from "@tanstack/react-query";
import { getFollowing } from "../api/connections";

export default function UserProfilePage() {
  const { id } = useParams();
  const userId = Number(id);
  const { followersQuery, followingQuery, followMutation, unfollowMutation } = useConnections(userId);
  const [activeList, setActiveList] = useState<"followers" | "following" | null>(null);
  const currentUser = authStore((s) => s.user);
  const isFollowing = Boolean(followersQuery.data?.some((f) => f.follower.id === currentUser?.user));
  const myFollowingQuery = useQuery({
    queryKey: ["following", currentUser?.user],
    queryFn: () => getFollowing(currentUser?.user as number),
    enabled: !!currentUser?.user
  });

  return <div className="space-y-3"><h1 className="text-2xl font-bold">User Profile</h1><p className="text-sm text-slate-500">User #{id}</p><div className="flex gap-5 text-sm"><button className="hover:underline" onClick={() => setActiveList("followers")}><span className="font-semibold">{followersQuery.data?.length ?? 0}</span> followers</button><button className="hover:underline" onClick={() => setActiveList("following")}><span className="font-semibold">{followingQuery.data?.length ?? 0}</span> following</button></div><div className="flex gap-2">{isFollowing ? <Button onClick={async () => {
    try {
      await unfollowMutation.mutateAsync(userId);
      await myFollowingQuery.refetch();
      toast.success("Unfollowed user");
    } catch (error) {
      const axiosError = error as AxiosError<{ error?: string; message?: string }>;
      toast.error(axiosError.response?.data?.error || axiosError.response?.data?.message || "Could not unfollow user");
    }
  }} className="bg-slate-700">Unfollow</Button> : <Button onClick={async () => {
    try {
      await followMutation.mutateAsync(userId);
      await myFollowingQuery.refetch();
      toast.success("Now following user");
    } catch (error) {
      const axiosError = error as AxiosError<{ error?: string; message?: string }>;
      toast.error(axiosError.response?.data?.error || axiosError.response?.data?.message || "Could not follow user");
    }
  }}>Follow</Button>}</div>{activeList && <div className="rounded-2xl border p-4"><div className="mb-3 flex items-center justify-between"><h2 className="text-lg font-semibold">{activeList === "followers" ? "Followers" : "Following"}</h2><button className="text-sm text-slate-500 hover:underline" onClick={() => setActiveList(null)}>Close</button></div><div className="space-y-2">{(activeList === "followers" ? followersQuery.data : followingQuery.data)?.length ? (activeList === "followers" ? followersQuery.data : followingQuery.data)?.map((item) => { const person = activeList === "followers" ? item.follower : item.following; const isMe = person.id === currentUser?.user; const iFollowPerson = Boolean(myFollowingQuery.data?.some((followItem) => followItem.following.id === person.id)); return <div key={item.id} className="flex items-center justify-between rounded-xl border p-3"><Link to={`/profile/${person.id}`} className="font-medium hover:underline">@{person.username}</Link>{isMe ? <button disabled className="rounded-lg border px-3 py-1 text-xs opacity-60">You</button> : iFollowPerson ? <button className="rounded-lg border bg-slate-700 px-3 py-1 text-xs text-white" onClick={async () => {
    try {
      await unfollowMutation.mutateAsync(person.id);
      await myFollowingQuery.refetch();
      await followersQuery.refetch();
      await followingQuery.refetch();
      toast.success(`Unfollowed @${person.username}`);
    } catch (error) {
      const axiosError = error as AxiosError<{ error?: string; message?: string }>;
      toast.error(axiosError.response?.data?.error || axiosError.response?.data?.message || "Could not unfollow user");
    }
  }}>Following</button> : <button className="rounded-lg border border-teal-500 px-3 py-1 text-xs text-teal-600" onClick={async () => {
    try {
      await followMutation.mutateAsync(person.id);
      await myFollowingQuery.refetch();
      await followersQuery.refetch();
      await followingQuery.refetch();
      toast.success(`Now following @${person.username}`);
    } catch (error) {
      const axiosError = error as AxiosError<{ error?: string; message?: string }>;
      toast.error(axiosError.response?.data?.error || axiosError.response?.data?.message || "Could not follow user");
    }
  }}>Follow</button>}</div>; }) : <p className="text-sm text-slate-500">No {activeList} yet.</p>}</div></div>}</div>;
}
