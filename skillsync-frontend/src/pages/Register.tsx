import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import Button from "../components/Button";
import { toast } from "sonner";
import { AxiosError } from "axios";

const schema = z.object({ username: z.string().min(3), email: z.string().email(), password: z.string().min(8), confirmPassword: z.string().min(8) }).refine((d) => d.password === d.confirmPassword, { path: ["confirmPassword"], message: "Passwords must match" });

type RegisterError = {
  username?: string[];
  email?: string[];
  password?: string[];
  detail?: string;
  error?: string;
};

const getRegisterError = (error: unknown) => {
  const data = (error as AxiosError<RegisterError>).response?.data;
  return data?.username?.[0] || data?.email?.[0] || data?.password?.[0] || data?.detail || data?.error || "Could not register. Check that the backend is running.";
};

export default function RegisterPage() {
  const { registerMutation } = useAuth();
  const navigate = useNavigate();
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<z.infer<typeof schema>>({ resolver: zodResolver(schema) });

  return (
    <div className="mx-auto grid min-h-screen max-w-6xl items-center gap-8 px-5 py-10 lg:grid-cols-[0.9fr,1.1fr]">
      <div className="soft-panel rounded-[2rem] p-6 sm:p-8">
        <p className="eyebrow">Register</p>
        <h1 className="mt-3 text-3xl font-black tracking-tight">Create your account</h1>
        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Create a SkillSync account.</p>
        <form className="mt-6 space-y-4" onSubmit={handleSubmit(async (values) => { try { await registerMutation.mutateAsync({ username: values.username, email: values.email, password: values.password }); toast.success("Account created"); navigate("/login"); } catch (error) { toast.error(getRegisterError(error)); } })}>
          <div><input className="field" placeholder="Username" {...register("username")} />{errors.username && <p className="mt-1 text-xs text-rose-500">Min 3 chars</p>}</div>
          <div><input className="field" placeholder="Email" {...register("email")} />{errors.email && <p className="mt-1 text-xs text-rose-500">Valid email required</p>}</div>
          <div><input type="password" className="field" placeholder="Password" {...register("password")} />{errors.password && <p className="mt-1 text-xs text-rose-500">Min 8 chars</p>}</div>
          <div><input type="password" className="field" placeholder="Confirm password" {...register("confirmPassword")} />{errors.confirmPassword && <p className="mt-1 text-xs text-rose-500">{errors.confirmPassword.message}</p>}</div>
          <Button disabled={isSubmitting || registerMutation.isPending} className="w-full py-3">Create account</Button>
        </form>
        <p className="mt-5 text-sm text-slate-600 dark:text-slate-300">Already registered? <Link className="font-bold text-teal-700 hover:text-teal-600 dark:text-teal-300" to="/login">Login</Link></p>
      </div>
      <section className="hidden lg:block">
        <p className="eyebrow">SkillSync</p>
        <h2 className="mt-4 max-w-xl text-5xl font-black leading-tight tracking-tight text-slate-950 dark:text-white">
          Find people, communities, and posts for your skills.
        </h2>
        <div className="mt-8 space-y-3">
          {["Create posts.", "Follow users.", "Save useful posts."].map((item) => (
            <div key={item} className="soft-panel rounded-2xl p-4 text-sm font-semibold text-slate-700 dark:text-slate-200">{item}</div>
          ))}
        </div>
      </section>
    </div>
  );
}
