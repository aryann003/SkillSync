import { useParams } from "react-router-dom";
import { useConnections } from "../hooks/useConnections";
import Button from "../components/Button";
import { toast } from "sonner";
import { AxiosError } from "axios";

export default function UserProfilePage() {
  const { id } = useParams();
  const userId = Number(id);
  const { followersQuery, followMutation, unfollowMutation } = useConnections(userId);

  return <div className="space-y-3"><h1 className="text-2xl font-bold">User Profile</h1><p className="text-sm text-slate-500">User #{id}</p><p>Followers: {followersQuery.data?.length ?? 0}</p><div className="flex gap-2"><Button onClick={async () => {
    try {
      await followMutation.mutateAsync(userId);
      toast.success("Now following user");
    } catch (error) {
      const axiosError = error as AxiosError<{ error?: string; message?: string }>;
      toast.error(axiosError.response?.data?.error || axiosError.response?.data?.message || "Could not follow user");
    }
  }}>Follow</Button><Button onClick={async () => {
    try {
      await unfollowMutation.mutateAsync(userId);
      toast.success("Unfollowed user");
    } catch (error) {
      const axiosError = error as AxiosError<{ error?: string; message?: string }>;
      toast.error(axiosError.response?.data?.error || axiosError.response?.data?.message || "Could not unfollow user");
    }
  }} className="bg-slate-700">Unfollow</Button></div></div>;
}
