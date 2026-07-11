import { useState } from "react";
import { useCommunities } from "../hooks/useCommunities";
import CommunityCard from "../components/CommunityCard";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import Button from "../components/Button";
import { AxiosError } from "axios";
import { useNavigate } from "react-router-dom";

const schema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters"),
  description: z.string().min(10, "Description must be at least 10 characters")
});

export default function CommunitiesPage() {
  const navigate = useNavigate();
  const { communitiesQuery, searchMutation, joinMutation, createMutation } = useCommunities();
  const [q, setQ] = useState("");
  const [joined, setJoined] = useState<Record<number, boolean>>({});
  const list = searchMutation.data ?? communitiesQuery.data ?? [];
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<z.infer<typeof schema>>({ resolver: zodResolver(schema) });

  return <div className="space-y-5"><div><p className="eyebrow">Communities</p><h1 className="mt-2 text-3xl font-black tracking-tight">Communities</h1><p className="mt-1 text-sm text-slate-500">Create and join skill communities.</p></div><div className="soft-panel rounded-2xl p-5"><h2 className="mb-3 text-lg font-bold">Create community</h2><form className="space-y-3" onSubmit={handleSubmit(async (values) => {
    try {
      await createMutation.mutateAsync(values);
      toast.success("Community created");
      reset();
    } catch (error) {
      const axiosError = error as AxiosError<{ error?: string; message?: string }>;
      toast.error(axiosError.response?.data?.error || axiosError.response?.data?.message || "Could not create community");
    }
  })}><input className="field" placeholder="Community name" {...register("name")} />{errors.name && <p className="text-xs text-red-500">{errors.name.message}</p>}<textarea className="field" rows={3} placeholder="Community description" {...register("description")} />{errors.description && <p className="text-xs text-red-500">{errors.description.message}</p>}<Button disabled={isSubmitting || createMutation.isPending}>Create community</Button></form></div><div className="flex flex-col gap-2 sm:flex-row"><input value={q} onChange={(e) => setQ(e.target.value)} className="field" placeholder="Search communities" /><button onClick={() => searchMutation.mutate(q)} className="rounded-xl border bg-[#f7ead8] px-4 py-3 text-sm font-bold hover:bg-[#f1ddc4] dark:bg-[#17263d] dark:hover:bg-[#1e3150]">Search</button></div><div className="space-y-3">{list.map((community) => <CommunityCard key={community.id} community={community} joined={joined[community.id] ?? Boolean(community.is_member)} loading={joinMutation.isPending} onToggle={async () => {
    const isJoined = joined[community.id] ?? Boolean(community.is_member);
    if (isJoined) {
      navigate(`/communities/${community.id}`);
      return;
    }
    try {
      await joinMutation.mutateAsync(community.id);
      setJoined((prev) => ({ ...prev, [community.id]: true }));
      toast.success("Joined community");
    } catch (error) {
      const axiosError = error as AxiosError<{ error?: string; message?: string }>;
      const message = axiosError.response?.data?.error || axiosError.response?.data?.message || "Action failed";

      if (message.toLowerCase().includes("already a member")) {
        setJoined((prev) => ({ ...prev, [community.id]: true }));
        toast.success("Already joined");
        return;
      }

      toast.error(message);
    }
  }} />)}</div></div>;
}
