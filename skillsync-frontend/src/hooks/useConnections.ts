import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { followUser, getFollowers, getFollowing, unfollowUser } from "../api/connections";

/** Handles follow relationships and follow actions. */
export const useConnections = (id?: number) => {
  const queryClient = useQueryClient();
  const followersQuery = useQuery({ queryKey: ["followers", id], queryFn: () => getFollowers(id as number), enabled: !!id });
  const followingQuery = useQuery({ queryKey: ["following", id], queryFn: () => getFollowing(id as number), enabled: !!id });
  const followMutation = useMutation({
    mutationFn: followUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["followers", id] });
      queryClient.invalidateQueries({ queryKey: ["following", id] });
    }
  });
  const unfollowMutation = useMutation({
    mutationFn: unfollowUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["followers", id] });
      queryClient.invalidateQueries({ queryKey: ["following", id] });
    }
  });
  return { followersQuery, followingQuery, followMutation, unfollowMutation };
};
