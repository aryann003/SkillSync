import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { cacheConnections, followUser, getFollowers, getFollowing, readCachedConnections, unfollowUser } from "../api/connections";
import { Connection } from "../types";
import { authStore } from "../store/authStore";

type FollowCacheSnapshot = {
  targetId: number;
  currentUserId?: number;
  followers?: Connection[];
  following?: Connection[];
};

/** Handles cached follower lists and immediate follow state updates. */
export const useConnections = (id?: number) => {
  const queryClient = useQueryClient();
  const currentUserId = authStore((state) => state.user?.user);
  const queryUserId = id ?? currentUserId;
  const followersQuery = useQuery({
    queryKey: ["followers", queryUserId],
    queryFn: () => getFollowers(queryUserId as number),
    enabled: typeof queryUserId === "number",
    staleTime: 60_000,
    initialData: typeof queryUserId === "number" ? readCachedConnections("followers", queryUserId)?.data : undefined,
    initialDataUpdatedAt: typeof queryUserId === "number" ? readCachedConnections("followers", queryUserId)?.updatedAt : undefined
  });
  const followingQuery = useQuery({
    queryKey: ["following", queryUserId],
    queryFn: () => getFollowing(queryUserId as number),
    enabled: typeof queryUserId === "number",
    staleTime: 60_000,
    initialData: typeof queryUserId === "number" ? readCachedConnections("following", queryUserId)?.data : undefined,
    initialDataUpdatedAt: typeof queryUserId === "number" ? readCachedConnections("following", queryUserId)?.updatedAt : undefined
  });

  const onMutate = async (targetId: number): Promise<FollowCacheSnapshot> => {
    const snapshot: FollowCacheSnapshot = { targetId, currentUserId: typeof currentUserId === "number" ? currentUserId : undefined };
    if (typeof currentUserId !== "number") return snapshot;

    const followerKey = ["followers", targetId] as const;
    const followingKey = ["following", currentUserId] as const;
    await Promise.all([queryClient.cancelQueries({ queryKey: followerKey }), queryClient.cancelQueries({ queryKey: followingKey })]);
    snapshot.followers = queryClient.getQueryData<Connection[]>(followerKey);
    snapshot.following = queryClient.getQueryData<Connection[]>(followingKey);
    return snapshot;
  };

  const setRelationship = (targetId: number, shouldFollow: boolean) => {
    if (typeof currentUserId !== "number") return;
    const update = (list: Connection[] | undefined) => {
      if (!list) return list;
      const exists = list.some((item) => item.follower.id === currentUserId && item.following.id === targetId);
      if (!shouldFollow) return list.filter((item) => !(item.follower.id === currentUserId && item.following.id === targetId));
      if (exists) return list;
      return [...list, {
        id: -Date.now(),
        follower: { id: currentUserId, username: authStore.getState().user?.username ?? "" },
        following: { id: targetId, username: "" },
        created_at: new Date().toISOString()
      }];
    };

    const followers = queryClient.setQueryData<Connection[]>(["followers", targetId], update);
    const following = queryClient.setQueryData<Connection[]>(["following", currentUserId], update);
    if (followers) cacheConnections("followers", targetId, followers);
    if (following) cacheConnections("following", currentUserId, following);
  };

  const onError = (_error: unknown, _targetId: number, snapshot?: FollowCacheSnapshot) => {
    if (!snapshot || typeof snapshot.currentUserId !== "number") return;
    const { targetId, currentUserId: ownerId } = snapshot;
    if (snapshot.followers) {
      queryClient.setQueryData(["followers", targetId], snapshot.followers);
      cacheConnections("followers", targetId, snapshot.followers);
    }
    if (snapshot.following) {
      queryClient.setQueryData(["following", ownerId], snapshot.following);
      cacheConnections("following", ownerId, snapshot.following);
    }
  };

  const followMutation = useMutation({
    mutationFn: followUser,
    onMutate: async (targetId) => {
      const snapshot = await onMutate(targetId);
      setRelationship(targetId, true);
      return snapshot;
    },
    onError
  });
  const unfollowMutation = useMutation({
    mutationFn: unfollowUser,
    onMutate: async (targetId) => {
      const snapshot = await onMutate(targetId);
      setRelationship(targetId, false);
      return snapshot;
    },
    onError
  });

  return { followersQuery, followingQuery, followMutation, unfollowMutation };
};
