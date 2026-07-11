import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import Button from "../components/Button";
import { toast } from "sonner";
import { AxiosError } from "axios";

const schema = z.object({ username: z.string().min(1), password: z.string().min(1) });

const getLoginError = (error: unknown) => {
  const axiosError = error as AxiosError<{ detail?: string }>;
  return axiosError.response?.data?.detail || "Could not login. Check that the backend is running.";
};

export default function LoginPage() {
  const { loginMutation } = useAuth();
  const navigate = useNavigate();
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<z.infer<typeof schema>>({ resolver: zodResolver(schema) });

  return (
    <div className="mx-auto grid min-h-screen max-w-6xl items-center gap-8 px-5 py-10 lg:grid-cols-[1.1fr,0.9fr]">
      <section className="hidden lg:block">
        <p className="eyebrow">SkillSync</p>
        <h1 className="mt-4 max-w-xl text-5xl font-black leading-tight tracking-tight text-slate-950 dark:text-white">
          Share progress and find people learning similar skills.
        </h1>
        <p className="mt-5 max-w-lg text-lg text-slate-600 dark:text-slate-300">
          Post updates, follow peers, save useful posts, and join communities.
        </p>
        <div className="mt-8 grid max-w-lg grid-cols-3 gap-3 text-sm">
          {["Post updates", "Join groups", "Save posts"].map((item) => (
            <div key={item} className="soft-panel rounded-2xl p-4 font-bold">{item}</div>
          ))}
        </div>
      </section>
      <div className="soft-panel rounded-[2rem] p-6 sm:p-8">
        <p className="eyebrow">Welcome back</p>
        <h2 className="mt-3 text-3xl font-black tracking-tight">Sign in to SkillSync</h2>
        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Login to continue.</p>
        <form className="mt-6 space-y-4" onSubmit={handleSubmit(async (values) => { try { await loginMutation.mutateAsync(values); toast.success("Logged in"); navigate("/"); } catch (error) { toast.error(getLoginError(error)); } })}>
          <div>
            <input className="field" placeholder="Username" {...register("username")} />
            {errors.username && <p className="mt-1 text-xs text-rose-500">Required</p>}
          </div>
          <div>
            <input type="password" className="field" placeholder="Password" {...register("password")} />
            {errors.password && <p className="mt-1 text-xs text-rose-500">Required</p>}
          </div>
          <Button disabled={isSubmitting || loginMutation.isPending} className="w-full py-3">Login</Button>
        </form>
        <p className="mt-5 text-sm text-slate-600 dark:text-slate-300">No account? <Link className="font-bold text-teal-700 hover:text-teal-600 dark:text-teal-300" to="/register">Create one</Link></p>
      </div>
    </div>
  );
}
