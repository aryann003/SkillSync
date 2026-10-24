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
      queryClient.invalidateQueries({ queryKey: ["followers"] });
      queryClient.invalidateQueries({ queryKey: ["following"] });
    }
  });
  const unfollowMutation = useMutation({
    mutationFn: unfollowUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["followers"] });
      queryClient.invalidateQueries({ queryKey: ["following"] });
    }
  });
  return { followersQuery, followingQuery, followMutation, unfollowMutation };
};
