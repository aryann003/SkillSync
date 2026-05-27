import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createCommunity, createCommunityPost, deleteCommunityPost, getCommunities, getCommunity, getCommunityMembers, getCommunityPosts, joinCommunity, leaveCommunity, searchCommunities } from "../api/communities";

/** Handles community list, detail, membership and community searches. */
export const useCommunities = (id?: number) => {
  const queryClient = useQueryClient();
  const communitiesQuery = useQuery({ queryKey: ["communities"], queryFn: getCommunities, staleTime: 60_000 });
  const communityQuery = useQuery({ queryKey: ["community", id], queryFn: () => getCommunity(id as number), enabled: !!id });
  const membersQuery = useQuery({ queryKey: ["community-members", id], queryFn: () => getCommunityMembers(id as number), enabled: !!id });
  const postsQuery = useQuery({ queryKey: ["community-posts", id], queryFn: () => getCommunityPosts(id as number), enabled: !!id });
  const createMutation = useMutation({ mutationFn: createCommunity, onSuccess: () => queryClient.invalidateQueries({ queryKey: ["communities"] }) });
  const joinMutation = useMutation({ mutationFn: joinCommunity, onSuccess: () => queryClient.invalidateQueries({ queryKey: ["community-members", id] }) });
  const leaveMutation = useMutation({ mutationFn: leaveCommunity, onSuccess: () => queryClient.invalidateQueries({ queryKey: ["community-members", id] }) });
  const searchMutation = useMutation({ mutationFn: searchCommunities });
  const createPostMutation = useMutation({ mutationFn: ({ id: communityId, title, content }: { id: number; title: string; content: string }) => createCommunityPost(communityId, { title, content }), onSuccess: () => queryClient.invalidateQueries({ queryKey: ["community-posts", id] }) });
  const deletePostMutation = useMutation({ mutationFn: deleteCommunityPost, onSuccess: () => queryClient.invalidateQueries({ queryKey: ["community-posts", id] }) });
  return { communitiesQuery, communityQuery, membersQuery, postsQuery, createMutation, joinMutation, leaveMutation, searchMutation, createPostMutation, deletePostMutation };
};
