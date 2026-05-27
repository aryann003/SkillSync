import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { addComment, createPost, deletePost, getComments, getPosts, likePost, unlikePost, updatePost } from "../api/posts";

const PAGE_SIZE = 8;

/** Manages feed posts, comments and optimistic post interactions. */
export const usePosts = () => {
  const queryClient = useQueryClient();

  const postsQuery = useInfiniteQuery({
    queryKey: ["posts"],
    initialPageParam: 0,
    queryFn: async ({ pageParam }) => {
      const all = await getPosts();
      const start = pageParam * PAGE_SIZE;
      return { items: all.slice(start, start + PAGE_SIZE), hasMore: start + PAGE_SIZE < all.length, page: pageParam };
    },
    getNextPageParam: (lastPage) => (lastPage.hasMore ? lastPage.page + 1 : undefined),
    staleTime: 60_000
  });

  const createMutation = useMutation({ mutationFn: createPost, onSuccess: () => queryClient.invalidateQueries({ queryKey: ["posts"] }) });
  const updateMutation = useMutation({ mutationFn: ({ id, data }: { id: number; data: { title?: string; content?: string } }) => updatePost(id, data), onSuccess: () => queryClient.invalidateQueries({ queryKey: ["posts"] }) });
  const deleteMutation = useMutation({ mutationFn: deletePost, onSuccess: () => queryClient.invalidateQueries({ queryKey: ["posts"] }) });
  const likeMutation = useMutation({ mutationFn: ({ id, liked }: { id: number; liked: boolean }) => (liked ? unlikePost(id) : likePost(id)) });
  const commentsQuery = (postId: number, enabled: boolean) => useQuery({ queryKey: ["comments", postId], queryFn: () => getComments(postId), enabled });
  const commentMutation = useMutation({ mutationFn: ({ id, content }: { id: number; content: string }) => addComment(id, content), onSuccess: (_d, vars) => queryClient.invalidateQueries({ queryKey: ["comments", vars.id] }) });

  return { postsQuery, createMutation, updateMutation, deleteMutation, likeMutation, commentsQuery, commentMutation };
};
