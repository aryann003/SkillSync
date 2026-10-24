import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { toast } from "sonner";
import { useConnections } from "../hooks/useConnections";
import Button from "../components/Button";
import Modal from "../components/Modal";
import { authStore } from "../store/authStore";
import {
  blockUser,
  BlockedUser,
  cacheConnections,
  getBlockedUsers,
  getFollowing,
  readCachedConnections,
  unblockUser
} from "../api/connections";
import { Connection } from "../types";

type ApiError = { error?: string; message?: string };

export default function UserProfilePage() {
  const { id } = useParams();
  const userId = Number(id);
  const queryClient = useQueryClient();
  const { followersQuery, followingQuery, followMutation, unfollowMutation } = useConnections(userId);
  const [activeList, setActiveList] = useState<"followers" | "following" | null>(null);
  const [confirmBlock, setConfirmBlock] = useState(false);
  const currentUser = authStore((state) => state.user);
  const currentUserId = typeof currentUser?.user === "number" ? currentUser.user : undefined;
  const isFollowing = Boolean(followersQuery.data?.some((follow) => follow.follower.id === currentUserId));

  const myFollowingQuery = useQuery({
    queryKey: ["following", currentUserId],
    queryFn: () => getFollowing(currentUserId as number),
    enabled: typeof currentUserId === "number",
    staleTime: 60_000,
    initialData: typeof currentUserId === "number" ? readCachedConnections("following", currentUserId)?.data : undefined,
    initialDataUpdatedAt: typeof currentUserId === "number" ? readCachedConnections("following", currentUserId)?.updatedAt : undefined
  });
  const blockedQuery = useQuery({
    queryKey: ["blocked-users", currentUserId],
    queryFn: getBlockedUsers,
    enabled: typeof currentUserId === "number",
    staleTime: 60_000
  });
  const isBlocked = Boolean(blockedQuery.data?.some((block) => block.blocked.id === userId));

  const removeCachedRelationship = (kind: "followers" | "following", ownerId: number, otherId: number) => {
    const key = [kind, ownerId] as const;
    const cached = queryClient.getQueryData<Connection[]>(key) ?? readCachedConnections(kind, ownerId)?.data;
    if (!cached) return;
    const next = kind === "followers"
      ? cached.filter((item) => item.follower.id !== otherId)
      : cached.filter((item) => item.following.id !== otherId);
    queryClient.setQueryData(key, next);
    cacheConnections(kind, ownerId, next);
  };

  const blockMutation = useMutation({
    mutationFn: blockUser,
    onSuccess: ({ data: block }) => {
      queryClient.setQueryData<BlockedUser[]>(["blocked-users", currentUserId], (previous = []) => [...previous.filter((item) => item.blocked.id !== userId), block]);
      if (typeof currentUserId === "number") {
        removeCachedRelationship("followers", userId, currentUserId);
        removeCachedRelationship("following", currentUserId, userId);
        removeCachedRelationship("followers", currentUserId, userId);
        removeCachedRelationship("following", userId, currentUserId);
      }
      setConfirmBlock(false);
      toast.success("User blocked");
    }
  });
  const unblockMutation = useMutation({
    mutationFn: unblockUser,
    onSuccess: () => {
      queryClient.setQueryData<BlockedUser[]>(["blocked-users", currentUserId], (previous = []) => previous.filter((item) => item.blocked.id !== userId));
      toast.success("User unblocked");
    }
  });

  const reportActionError = (error: unknown, fallback: string) => {
    const apiError = error as AxiosError<ApiError>;
    toast.error(apiError.response?.data?.error || apiError.response?.data?.message || fallback);
  };

  const people = activeList === "followers" ? followersQuery.data : followingQuery.data;

  return (
    <div className="space-y-3">
      <h1 className="text-2xl font-bold">User Profile</h1>
      <p className="text-sm text-slate-500">User #{id}</p>
      <div className="flex gap-5 text-sm">
        <button className="hover:underline" onClick={() => setActiveList("followers")}>
          <span className="font-semibold">{followersQuery.data?.length ?? 0}</span> followers
        </button>
        <button className="hover:underline" onClick={() => setActiveList("following")}>
          <span className="font-semibold">{followingQuery.data?.length ?? 0}</span> following
        </button>
      </div>

      {currentUserId !== userId && <div className="flex gap-2">
        {!isBlocked && (isFollowing ? (
          <Button disabled={unfollowMutation.isPending} onClick={async () => {
            try {
              await unfollowMutation.mutateAsync(userId);
              toast.success("Unfollowed user");
            } catch (error) {
              reportActionError(error, "Could not unfollow user");
            }
          }} className="bg-slate-700">Unfollow</Button>
        ) : (
          <Button disabled={followMutation.isPending} onClick={async () => {
            try {
              await followMutation.mutateAsync(userId);
              toast.success("Now following user");
            } catch (error) {
              reportActionError(error, "Could not follow user");
            }
          }}>Follow</Button>
        ))}
        {isBlocked ? (
          <Button disabled={unblockMutation.isPending} className="bg-slate-700" onClick={async () => {
            try {
              await unblockMutation.mutateAsync(userId);
            } catch (error) {
              reportActionError(error, "Could not unblock user");
            }
          }}>Unblock</Button>
        ) : (
          <Button className="bg-rose-600 hover:bg-rose-700 dark:bg-rose-500 dark:hover:bg-rose-600" onClick={() => setConfirmBlock(true)}>Block</Button>
        )}
      </div>}

      {activeList && <div className="rounded-2xl border p-4">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-semibold">{activeList === "followers" ? "Followers" : "Following"}</h2>
          <button className="text-sm text-slate-500 hover:underline" onClick={() => setActiveList(null)}>Close</button>
        </div>
        <div className="space-y-2">
          {people?.length ? people.map((item) => {
            const person = activeList === "followers" ? item.follower : item.following;
            const isMe = person.id === currentUserId;
            const iFollowPerson = Boolean(myFollowingQuery.data?.some((follow) => follow.following.id === person.id));
            return <div key={item.id} className="flex items-center justify-between rounded-xl border p-3">
              <Link to={`/profile/${person.id}`} className="font-medium hover:underline">@{person.username}</Link>
              {isMe ? <button disabled className="rounded-lg border px-3 py-1 text-xs opacity-60">You</button> : iFollowPerson ? (
                <button className="rounded-lg border bg-slate-700 px-3 py-1 text-xs text-white" onClick={async () => {
                  try {
                    await unfollowMutation.mutateAsync(person.id);
                    toast.success(`Unfollowed @${person.username}`);
                  } catch (error) {
                    reportActionError(error, "Could not unfollow user");
                  }
                }}>Following</button>
              ) : (
                <button className="rounded-lg border border-teal-500 px-3 py-1 text-xs text-teal-600" onClick={async () => {
                  try {
                    await followMutation.mutateAsync(person.id);
                    toast.success(`Now following @${person.username}`);
                  } catch (error) {
                    reportActionError(error, "Could not follow user");
                  }
                }}>Follow</button>
              )}
            </div>;
          }) : <p className="text-sm text-slate-500">No {activeList} yet.</p>}
        </div>
      </div>}

      <Modal
        open={confirmBlock}
        title="Block this user?"
        confirmLabel={blockMutation.isPending ? "Blocking..." : "Block user"}
        confirmDisabled={blockMutation.isPending}
        onClose={() => setConfirmBlock(false)}
        onConfirm={async () => {
          try {
            await blockMutation.mutateAsync(userId);
          } catch (error) {
            reportActionError(error, "Could not block user");
          }
        }}
      >Blocking this user also removes any follow relationship between you.
      </Modal>
    </div>
  );
}
