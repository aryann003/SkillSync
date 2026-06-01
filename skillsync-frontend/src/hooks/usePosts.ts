import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { addComment, createPost, deleteComment, deletePost, getComments, getPosts, getSavedPosts, likePost, savePost, unlikePost, unsavePost, updateComment, updatePost } from "../api/posts";
import { authStore } from "../store/authStore";

/** Manages feed posts, comments and optimistic post interactions. */
export const usePosts = () => {
  const queryClient = useQueryClient();
  const currentUserId = authStore((s) => s.user?.user ?? null);

  const postsQuery = useInfiniteQuery({
    queryKey: ["posts"],
    initialPageParam: 1,
    queryFn: async ({ pageParam }) => {
      const data = await getPosts(pageParam);
      return {
        items: data.results,
        nextPage: data.next ? pageParam + 1 : undefined
      };
    },
    getNextPageParam: (lastPage) => lastPage.nextPage,
    staleTime: 60_000
  });

  const createMutation = useMutation({ mutationFn: createPost, onSuccess: () => queryClient.invalidateQueries({ queryKey: ["posts"] }) });
  const updateMutation = useMutation({ mutationFn: ({ id, data }: { id: number; data: { title?: string; content?: string; image?: File | null } }) => updatePost(id, data), onSuccess: () => queryClient.invalidateQueries({ queryKey: ["posts"] }) });
  const deleteMutation = useMutation({ mutationFn: deletePost, onSuccess: () => queryClient.invalidateQueries({ queryKey: ["posts"] }) });
  const likeMutation = useMutation({ mutationFn: ({ id, liked }: { id: number; liked: boolean }) => (liked ? unlikePost(id) : likePost(id)) });
  const savedPostsQuery = useQuery({ queryKey: ["saved-posts", currentUserId], queryFn: getSavedPosts, staleTime: 60_000, enabled: currentUserId !== null });
  const saveMutation = useMutation({
    mutationFn: ({ id, saved }: { id: number; saved: boolean }) => (saved ? unsavePost(id) : savePost(id)),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["saved-posts", currentUserId] })
  });
  const commentsQuery = (postId: number, enabled: boolean) => useQuery({ queryKey: ["comments", postId], queryFn: () => getComments(postId), enabled });
  const commentMutation = useMutation({
    mutationFn: ({ id, content, parentId }: { id: number; content: string; parentId?: number }) => addComment(id, content, parentId),
    onSuccess: (_d, vars) => queryClient.invalidateQueries({ queryKey: ["comments", vars.id] })
  });
  const updateCommentMutation = useMutation({
    mutationFn: ({ commentId, content }: { postId: number; commentId: number; content: string }) => updateComment(commentId, content),
    onSuccess: (_d, vars) => queryClient.invalidateQueries({ queryKey: ["comments", vars.postId] }),
  });
  const deleteCommentMutation = useMutation({
    mutationFn: ({ commentId }: { postId: number; commentId: number }) => deleteComment(commentId),
    onSuccess: (_d, vars) => queryClient.invalidateQueries({ queryKey: ["comments", vars.postId] }),
  });

  return { postsQuery, createMutation, updateMutation, deleteMutation, likeMutation, savedPostsQuery, saveMutation, commentsQuery, commentMutation, updateCommentMutation, deleteCommentMutation };
};
