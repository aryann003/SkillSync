import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { usePosts } from "../hooks/usePosts";
import Avatar from "./Avatar";
import Skeleton from "./Skeleton";
import { toast } from "sonner";
import { AxiosError } from "axios";

const schema = z.object({ content: z.string().trim().min(1, "Comment is required") });

export default function CommentThread({ postId }: { postId: number }) {
  const { commentsQuery, commentMutation } = usePosts();
  const query = commentsQuery(postId, true);
  const { register, handleSubmit, reset, formState: { errors } } = useForm<z.infer<typeof schema>>({ resolver: zodResolver(schema) });

  return (
    <div className="mt-3 space-y-2 border-t pt-3">
      {query.isLoading && <Skeleton className="h-10" />}
      {query.data?.map((comment) => (
        <div key={comment.id} className="flex items-center gap-2 text-sm"><Avatar name={comment.username || `User ${comment.user}`} src={comment.profile_image} /><div><p className="font-medium">{comment.username || `User ${comment.user}`}</p><p>{comment.content}</p></div></div>
      ))}
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
          <input className="w-full rounded-lg border bg-transparent p-2 text-sm" placeholder="Add comment" {...register("content")} />
          <button type="submit" className="rounded-lg border px-3 text-sm hover:bg-slate-100 dark:hover:bg-slate-800">Send</button>
        </div>
        {errors.content && <p className="text-xs text-red-500">{errors.content.message}</p>}
      </form>
    </div>
  );
}
