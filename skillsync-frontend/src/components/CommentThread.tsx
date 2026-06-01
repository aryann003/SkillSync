import { useForm } from "react-hook-form";
import { useState } from "react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { usePosts } from "../hooks/usePosts";
import Avatar from "./Avatar";
import Skeleton from "./Skeleton";
import { toast } from "sonner";
import { AxiosError } from "axios";
import { authStore } from "../store/authStore";
import { Comment } from "../types";

const schema = z.object({ content: z.string().trim().min(1, "Comment is required") });

export default function CommentThread({ postId, postOwnerId }: { postId: number; postOwnerId: number }) {
  const { commentsQuery, commentMutation, updateCommentMutation, deleteCommentMutation } = usePosts();
  const currentUser = authStore((s) => s.user);
  const [editingCommentId, setEditingCommentId] = useState<number | null>(null);
  const [editingContent, setEditingContent] = useState("");
  const [replyingToId, setReplyingToId] = useState<number | null>(null);
  const [replyContent, setReplyContent] = useState("");
  const [pendingDeleteCommentId, setPendingDeleteCommentId] = useState<number | null>(null);
  const [openReplies, setOpenReplies] = useState<Record<number, boolean>>({});
  const query = commentsQuery(postId, true);
  const { register, handleSubmit, reset, formState: { errors } } = useForm<z.infer<typeof schema>>({ resolver: zodResolver(schema) });

  const renderComment = (comment: Comment, isReply = false) => (
    <div key={comment.id} className={`flex items-start gap-2 text-sm ${isReply ? "ml-10 mt-2" : ""}`}>
      <Avatar name={comment.username || `User ${comment.user}`} src={comment.profile_image} />
      <div className="min-w-0 flex-1">
        <p className="font-medium">{comment.username || `User ${comment.user}`}</p>
        {editingCommentId === comment.id ? (
          <div className="mt-1 space-y-2">
            <input
              value={editingContent}
              onChange={(e) => setEditingContent(e.target.value)}
              className="w-full rounded-lg border bg-transparent p-2 text-sm text-slate-100 placeholder:text-slate-400"
            />
            <div className="flex gap-2">
              <button
                type="button"
                className="rounded-lg border px-2 py-1 text-xs hover:bg-slate-100 dark:hover:bg-slate-800"
                onClick={async () => {
                  const content = editingContent.trim();
                  if (!content) {
                    toast.error("Comment cannot be empty");
                    return;
                  }
                  try {
                    await updateCommentMutation.mutateAsync({ postId, commentId: comment.id, content });
                    toast.success("Comment updated");
                    setEditingCommentId(null);
                    setEditingContent("");
                  } catch {
                    toast.error("Could not update comment");
                  }
                }}
              >
                Save
              </button>
              <button
                type="button"
                className="rounded-lg border px-2 py-1 text-xs hover:bg-slate-100 dark:hover:bg-slate-800"
                onClick={() => {
                  setEditingCommentId(null);
                  setEditingContent("");
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <p>{comment.content}</p>
        )}
        {editingCommentId !== comment.id && (
          <div className="mt-1 flex gap-3">
            <button
              type="button"
              className="text-xs text-slate-400 hover:underline"
              onClick={() => {
                setReplyingToId(comment.id);
                setReplyContent("");
              }}
            >
              Reply
            </button>
            {currentUser?.user === comment.user && (
              <button
                type="button"
                className="text-xs text-teal-400 hover:underline"
                onClick={() => {
                  setEditingCommentId(comment.id);
                  setEditingContent(comment.content);
                }}
              >
                Edit
              </button>
            )}
            {(currentUser?.user === comment.user || currentUser?.user === postOwnerId) && (
              pendingDeleteCommentId === comment.id ? (
                <>
                  <button
                    type="button"
                    className="text-xs text-rose-300 hover:underline"
                    onClick={async () => {
                      try {
                        await deleteCommentMutation.mutateAsync({ postId, commentId: comment.id });
                        toast.success("Comment deleted");
                        setPendingDeleteCommentId(null);
                      } catch {
                        toast.error("Could not delete comment");
                      }
                    }}
                  >
                    Confirm
                  </button>
                  <button
                    type="button"
                    className="text-xs text-slate-400 hover:underline"
                    onClick={() => setPendingDeleteCommentId(null)}
                  >
                    Cancel
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  className="text-xs text-rose-400 hover:underline"
                  onClick={() => setPendingDeleteCommentId(comment.id)}
                >
                  Delete
                </button>
              )
            )}
          </div>
        )}
        {replyingToId === comment.id && (
          <div className="mt-2 flex gap-2">
            <input
              value={replyContent}
              onChange={(e) => setReplyContent(e.target.value)}
              className="w-full rounded-lg border bg-transparent p-2 text-sm text-slate-100 placeholder:text-slate-400"
              placeholder="Write a reply"
            />
            <button
              type="button"
              className="rounded-lg border px-3 text-sm hover:bg-slate-100 dark:hover:bg-slate-800"
              onClick={async () => {
                const content = replyContent.trim();
                if (!content) {
                  toast.error("Reply cannot be empty");
                  return;
                }
                try {
                  await commentMutation.mutateAsync({ id: postId, content, parentId: comment.id });
                  toast.success("Reply added");
                  setReplyingToId(null);
                  setReplyContent("");
                } catch {
                  toast.error("Could not add reply");
                }
              }}
            >
              Send
            </button>
            <button
              type="button"
              className="rounded-lg border px-3 text-sm hover:bg-slate-100 dark:hover:bg-slate-800"
              onClick={() => {
                setReplyingToId(null);
                setReplyContent("");
              }}
            >
              Cancel
            </button>
          </div>
        )}
        {(comment.replies?.length ?? 0) > 0 && (
          <div className="mt-1">
            <button
              type="button"
              className="text-xs text-slate-400 hover:underline"
              onClick={() => setOpenReplies((prev) => ({ ...prev, [comment.id]: !prev[comment.id] }))}
            >
              {openReplies[comment.id] ? "Hide replies" : `View replies (${comment.replies?.length ?? 0})`}
            </button>
          </div>
        )}
        {openReplies[comment.id] && (comment.replies ?? []).map((reply) => renderComment(reply, true))}
      </div>
    </div>
  );

  return (
      <div className="mt-3 space-y-2 border-t pt-3">
      {query.isLoading && <Skeleton className="h-10" />}
      {query.data?.map((comment) => renderComment(comment))}
      <form onSubmit={handleSubmit(async (values) => {
        try {
          await commentMutation.mutateAsync({ id: postId, content: values.content.trim() });
          toast.success("Comment added");
          reset();
        } catch (error) {
          const axiosError = error as AxiosError<{ error?: string; content?: string[] }>;
          const apiMessage = axiosError.response?.data?.error || axiosError.response?.data?.content?.[0] || "Could not add comment";
          toast.error(apiMessage);
        }
      })}>
        <div className="flex gap-2">
          <input
            className="w-full rounded-lg border bg-transparent p-2 text-sm text-slate-100 placeholder:text-slate-400 dark:text-slate-100 dark:placeholder:text-slate-400"
            placeholder="Add comment"
            {...register("content")}
          />
          <button type="submit" className="rounded-lg border px-3 text-sm hover:bg-slate-100 dark:hover:bg-slate-800">Send</button>
        </div>
        {errors.content && <p className="text-xs text-red-500">{errors.content.message}</p>}
      </form>
    </div>
  );
}
