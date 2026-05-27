import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuth } from "../hooks/useAuth";
import Button from "../components/Button";
import Avatar from "../components/Avatar";
import { splitTags } from "../utils/formatters";
import { toast } from "sonner";
import { AxiosError } from "axios";

const schema = z.object({ username: z.string().min(3, "Username must be at least 3 characters"), bio: z.string().max(300), skills: z.string(), interests: z.string(), profession: z.string() });

export default function ProfilePage() {
  const { profileQuery, updateProfileMutation } = useAuth();
  const profile = profileQuery.data;
  const [editing, setEditing] = useState(false);
  const [profileImage, setProfileImage] = useState<File | null>(null);

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
      <div className="rounded-3xl border border-white/40 bg-white/80 p-5 shadow-sm backdrop-blur dark:border-slate-800 dark:bg-slate-900/85">
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
          {splitTags(profile?.skills ?? "").slice(0, 5).map((skill) => <span key={skill} className="rounded-full bg-teal-100 px-2 py-0.5 text-xs text-teal-700 dark:bg-teal-900 dark:text-teal-200">{skill}</span>)}
        </div>
      </div>

      {editing && (
        <div className="rounded-3xl border border-white/40 bg-white/80 p-5 shadow-sm backdrop-blur dark:border-slate-800 dark:bg-slate-900/85">
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
              <input className="w-full rounded-xl border bg-transparent p-3" placeholder="Username" {...register("username")} />
              {errors.username && <p className="text-xs text-red-500">{errors.username.message}</p>}
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Profile picture</label>
              <input type="file" accept="image/*" className="w-full rounded-xl border bg-transparent p-2" onChange={(e) => setProfileImage(e.target.files?.[0] ?? null)} />
            </div>
            <textarea className="w-full rounded-xl border bg-transparent p-3" rows={4} placeholder="Bio" {...register("bio")} />
            {errors.bio && <p className="text-xs text-red-500">Max 300 chars</p>}
            <input className="w-full rounded-xl border bg-transparent p-3" placeholder="Skills, comma-separated" {...register("skills")} />
            <input className="w-full rounded-xl border bg-transparent p-3" placeholder="Interests, comma-separated" {...register("interests")} />
            <input className="w-full rounded-xl border bg-transparent p-3" placeholder="Profession" {...register("profession")} />
            <Button disabled={isSubmitting || updateProfileMutation.isPending} type="submit">Save changes</Button>
          </form>
        </div>
      )}
    </div>
  );
}
