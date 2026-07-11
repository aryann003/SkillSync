import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuth } from "../hooks/useAuth";
import { useConnections } from "../hooks/useConnections";
import Button from "../components/Button";
import Avatar from "../components/Avatar";
import { splitTags } from "../utils/formatters";
import { toast } from "sonner";
import { AxiosError } from "axios";
import { Link } from "react-router-dom";
import { authStore } from "../store/authStore";
import { useQuery } from "@tanstack/react-query";
import { getFollowing } from "../api/connections";

const schema = z.object({ username: z.string().min(3, "Username must be at least 3 characters"), bio: z.string().max(300), skills: z.string(), interests: z.string(), profession: z.string() });

export default function ProfilePage() {
  const { profileQuery, updateProfileMutation } = useAuth();
  const profile = profileQuery.data;
  const { followersQuery, followingQuery } = useConnections(profile?.user);
  const { followMutation, unfollowMutation } = useConnections();
  const currentUser = authStore((s) => s.user);
  const currentUserId = typeof currentUser?.user === "number" ? currentUser.user : undefined;
  const myFollowingQuery = useQuery({
    queryKey: ["following", currentUserId],
    queryFn: () => getFollowing(currentUserId as number),
    enabled: typeof currentUserId === "number"
  });
  const [editing, setEditing] = useState(false);
  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [activeList, setActiveList] = useState<"followers" | "following" | null>(null);

  const previewUrl = useMemo(() => (profileImage ? URL.createObjectURL(profileImage) : null), [profileImage]);

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    values: {
      bio: profile?.bio ?? "",
      username: profile?.username ?? "",
      skills: profile?.skills ?? "",
      interests: profile?.interests ?? "",
      profession: profile?.profession ?? ""
    }
  });

  return (
    <div className="space-y-5">
      <div className="soft-panel rounded-2xl p-5">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Avatar name={profile?.username || profile?.user.toString() || "You"} src={previewUrl ?? profile?.profile_image} />
            <div>
              <h1 className="text-2xl font-bold">My Profile</h1>
              <p className="text-sm text-slate-500">@{profile?.username || "username"}</p>
            </div>
          </div>
          <Button onClick={() => setEditing((v) => !v)}>{editing ? "Cancel" : "Edit Profile"}</Button>
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          {splitTags(profile?.skills ?? "").slice(0, 5).map((skill) => <span key={skill} className="rounded-full border border-teal-200 bg-teal-50 px-2 py-0.5 text-xs font-semibold text-teal-700 dark:border-teal-800 dark:bg-teal-950/50 dark:text-teal-200">{skill}</span>)}
        </div>
        <div className="mt-4 flex gap-5 text-sm">
          <button className="hover:underline" onClick={() => setActiveList("followers")}><span className="font-semibold">{followersQuery.data?.length ?? 0}</span> followers</button>
          <button className="hover:underline" onClick={() => setActiveList("following")}><span className="font-semibold">{followingQuery.data?.length ?? 0}</span> following</button>
        </div>
      </div>

      {activeList && (
        <div className="soft-panel rounded-2xl p-5">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-lg font-semibold">{activeList === "followers" ? "Followers" : "Following"}</h2>
            <button className="text-sm text-slate-500 hover:underline" onClick={() => setActiveList(null)}>Close</button>
          </div>
          <div className="space-y-2">
            {(activeList === "followers" ? followersQuery.data : followingQuery.data)?.length ? (activeList === "followers" ? followersQuery.data : followingQuery.data)?.map((item) => {
              const person = activeList === "followers" ? item.follower : item.following;
              const isMe = person.id === currentUserId;
              const isFollowing = Boolean(myFollowingQuery.data?.some((followItem) => followItem.following.id === person.id));
              return <div key={item.id} className="flex items-center justify-between rounded-xl border p-3"><Link to={`/profile/${person.id}`} className="font-medium hover:underline">@{person.username}</Link>{isMe ? <button disabled className="rounded-lg border px-3 py-1 text-xs opacity-60">You</button> : isFollowing ? <button className="rounded-lg border bg-slate-700 px-3 py-1 text-xs text-white" onClick={async () => {
                try {
                  await unfollowMutation.mutateAsync(person.id);
                  await myFollowingQuery.refetch();
                  await followersQuery.refetch();
                  await followingQuery.refetch();
                  toast.success(`Unfollowed @${person.username}`);
                } catch (error) {
                  const axiosError = error as AxiosError<{ error?: string; message?: string }>;
                  toast.error(axiosError.response?.data?.error || axiosError.response?.data?.message || "Could not unfollow user");
                }
              }}>Following</button> : <button className="rounded-lg border border-teal-500 px-3 py-1 text-xs text-teal-600" onClick={async () => {
                try {
                  await followMutation.mutateAsync(person.id);
                  await myFollowingQuery.refetch();
                  await followersQuery.refetch();
                  await followingQuery.refetch();
                  toast.success(`Now following @${person.username}`);
                } catch (error) {
                  const axiosError = error as AxiosError<{ error?: string; message?: string }>;
                  toast.error(axiosError.response?.data?.error || axiosError.response?.data?.message || "Could not follow user");
                }
              }}>Follow</button>}</div>;
            }) : <p className="text-sm text-slate-500">No {activeList} yet.</p>}
          </div>
        </div>
      )}

      {editing && (
        <div className="soft-panel rounded-2xl p-5">
          <form className="space-y-3" onSubmit={handleSubmit(async (values) => {
            try {
              const formData = new FormData();
              formData.append("username", values.username);
              formData.append("bio", values.bio);
              formData.append("skills", values.skills);
              formData.append("interests", values.interests);
              formData.append("profession", values.profession);
              if (profileImage) formData.append("profile_image", profileImage);
              await updateProfileMutation.mutateAsync(formData);
              toast.success("Profile updated");
              setEditing(false);
            } catch (error) {
              const axiosError = error as AxiosError<{ error?: string; username?: string[] }>;
              const apiMessage =
                axiosError.response?.data?.error ||
                axiosError.response?.data?.username?.[0] ||
                "Could not update profile";
              toast.error(apiMessage);
            }
          })}>
            <div>
              <label className="mb-1 block text-sm font-medium">Username</label>
              <input className="field" placeholder="Username" {...register("username")} />
              {errors.username && <p className="text-xs text-red-500">{errors.username.message}</p>}
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Profile picture</label>
              <input type="file" accept="image/*" className="w-full rounded-xl border bg-white p-2 text-sm dark:bg-slate-950" onChange={(e) => setProfileImage(e.target.files?.[0] ?? null)} />
            </div>
            <textarea className="field" rows={4} placeholder="Bio" {...register("bio")} />
            {errors.bio && <p className="text-xs text-red-500">Max 300 chars</p>}
            <input className="field" placeholder="Skills, comma-separated" {...register("skills")} />
            <input className="field" placeholder="Interests, comma-separated" {...register("interests")} />
            <input className="field" placeholder="Profession" {...register("profession")} />
            <Button disabled={isSubmitting || updateProfileMutation.isPending} type="submit">Save changes</Button>
          </form>
        </div>
      )}
    </div>
  );
}
