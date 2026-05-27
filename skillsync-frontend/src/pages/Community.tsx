import { useParams } from "react-router-dom";
import { useMemo, useState } from "react";
import { useCommunities } from "../hooks/useCommunities";
import Modal from "../components/Modal";
import Button from "../components/Button";
import { toast } from "sonner";
import Skeleton from "../components/Skeleton";
import { authStore } from "../store/authStore";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

const schema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  content: z.string().min(10, "Content must be at least 10 characters")
});

export default function CommunityDetailPage() {
  const { id } = useParams();
  const communityId = Number(id);
  const { communityQuery, membersQuery, postsQuery, joinMutation, leaveMutation, createPostMutation, deletePostMutation } = useCommunities(communityId);
  const currentUser = authStore((s) => s.user);
  const [open, setOpen] = useState(false);
  const posts = useMemo(() => postsQuery.data ?? [], [postsQuery.data]);
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<z.infer<typeof schema>>({ resolver: zodResolver(schema) });

  if (communityQuery.isLoading) {
    return <div className="space-y-3"><Skeleton className="h-28" /><Skeleton className="h-24" /><Skeleton className="h-24" /></div>;
  }

  return <div className="space-y-5"><div className="rounded-3xl border border-white/40 bg-white/80 p-5 shadow-sm backdrop-blur dark:border-slate-800 dark:bg-slate-900/85"><h1 className="text-3xl font-bold">{communityQuery.data?.name}</h1><p className="mt-1 text-slate-600 dark:text-slate-300">{communityQuery.data?.description || "No description provided."}</p><div className="mt-3 flex items-center justify-between"><p className="text-sm text-slate-500">{membersQuery.data?.length ?? 0} members</p><div className="flex gap-2"><Button onClick={async () => { try { await joinMutation.mutateAsync(communityId); toast.success("Joined community"); } catch { toast.error("Could not join"); } }}>Join</Button><Button className="bg-slate-700" onClick={() => setOpen(true)}>Leave</Button></div></div></div><Modal open={open} title="Leave community?" onClose={() => setOpen(false)} onConfirm={async () => { try { await leaveMutation.mutateAsync(communityId); toast.success("Left community"); } catch { toast.error("Could not leave"); } setOpen(false); }}>You will stop seeing member-only posts.</Modal><div className="rounded-2xl border border-white/40 bg-white/80 p-4 dark:border-slate-800 dark:bg-slate-900/85"><h2 className="mb-2 text-lg font-semibold">Create community post</h2><form className="space-y-2" onSubmit={handleSubmit(async (values) => {
    try {
      await createPostMutation.mutateAsync({ id: communityId, title: values.title, content: values.content });
      toast.success("Community post created");
      reset();
    } catch {
      toast.error("Could not create community post");
    }
  })}><input className="w-full rounded-lg border bg-transparent p-2" placeholder="Title" {...register("title")} />{errors.title && <p className="text-xs text-red-500">{errors.title.message}</p>}<textarea className="w-full rounded-lg border bg-transparent p-2" rows={3} placeholder="Content" {...register("content")} />{errors.content && <p className="text-xs text-red-500">{errors.content.message}</p>}<Button disabled={isSubmitting || createPostMutation.isPending}>Publish</Button></form></div><section className="space-y-3"><h2 className="text-lg font-semibold">Community posts</h2>{posts.length === 0 ? <p className="rounded-xl border p-4 text-sm text-slate-500">No posts yet in this community.</p> : posts.map((post) => <div key={post.id} className="rounded-2xl border border-white/40 bg-white/85 p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900/85"><div className="mb-2 flex items-center justify-between"><h3 className="font-semibold">{post.title}</h3>{post.user === currentUser?.user && <button className="text-sm text-red-500" onClick={async () => {
          try {
            await deletePostMutation.mutateAsync(post.id);
            toast.success("Community post deleted");
          } catch {
            toast.error("Could not delete community post");
          }
        }}>Delete</button>}</div><p className="mt-1 text-sm text-slate-600 dark:text-slate-300">{post.content}</p></div>)}</section></div>;
}
