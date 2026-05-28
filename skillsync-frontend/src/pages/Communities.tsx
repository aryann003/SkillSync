import { useState } from "react";
import { useCommunities } from "../hooks/useCommunities";
import CommunityCard from "../components/CommunityCard";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import Button from "../components/Button";
import { AxiosError } from "axios";

const schema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters"),
  description: z.string().min(10, "Description must be at least 10 characters")
});

export default function CommunitiesPage() {
  const { communitiesQuery, searchMutation, joinMutation, leaveMutation, createMutation } = useCommunities();
  const [q, setQ] = useState("");
  const [joined, setJoined] = useState<Record<number, boolean>>({});
  const list = searchMutation.data ?? communitiesQuery.data ?? [];
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<z.infer<typeof schema>>({ resolver: zodResolver(schema) });

  return <div className="space-y-4"><h1 className="text-2xl font-bold">Communities</h1><div className="rounded-2xl border border-white/40 bg-white/80 p-4 backdrop-blur dark:border-slate-800 dark:bg-slate-900/85"><h2 className="mb-2 text-lg font-semibold">Create community</h2><form className="space-y-2" onSubmit={handleSubmit(async (values) => {
    try {
      await createMutation.mutateAsync(values);
      toast.success("Community created");
      reset();
    } catch (error) {
      const axiosError = error as AxiosError<{ error?: string; message?: string }>;
      toast.error(axiosError.response?.data?.error || axiosError.response?.data?.message || "Could not create community");
    }
  })}><input className="w-full rounded-lg border bg-transparent p-2" placeholder="Community name" {...register("name")} />{errors.name && <p className="text-xs text-red-500">{errors.name.message}</p>}<textarea className="w-full rounded-lg border bg-transparent p-2" rows={3} placeholder="Community description" {...register("description")} />{errors.description && <p className="text-xs text-red-500">{errors.description.message}</p>}<Button disabled={isSubmitting || createMutation.isPending}>Create community</Button></form></div><div className="flex gap-2"><input value={q} onChange={(e) => setQ(e.target.value)} className="w-full rounded-lg border bg-transparent p-2" placeholder="Search communities" /><button onClick={() => searchMutation.mutate(q)} className="rounded-lg border px-3">Search</button></div><div className="space-y-3">{list.map((community) => <CommunityCard key={community.id} community={community} joined={joined[community.id] ?? Boolean(community.is_member)} loading={joinMutation.isPending || leaveMutation.isPending} onToggle={async () => {
    const isJoined = joined[community.id] ?? Boolean(community.is_member);
    try {
      if (isJoined) {
        await leaveMutation.mutateAsync(community.id);
        setJoined((prev) => ({ ...prev, [community.id]: false }));
        toast.success("Left community");
      } else {
        await joinMutation.mutateAsync(community.id);
        setJoined((prev) => ({ ...prev, [community.id]: true }));
        toast.success("Joined community");
      }
    } catch (error) {
      const axiosError = error as AxiosError<{ error?: string; message?: string }>;
      const message = axiosError.response?.data?.error || axiosError.response?.data?.message || "Action failed";

      if (!isJoined && message.toLowerCase().includes("already a member")) {
        setJoined((prev) => ({ ...prev, [community.id]: true }));
        toast.success("Already joined");
        return;
      }

      if (isJoined && message.toLowerCase().includes("not a member")) {
        setJoined((prev) => ({ ...prev, [community.id]: false }));
        toast.success("Already left");
        return;
      }

      toast.error(message);
    }
  }} />)}</div></div>;
}
