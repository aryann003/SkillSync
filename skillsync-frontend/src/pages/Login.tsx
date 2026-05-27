import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import Button from "../components/Button";
import { toast } from "sonner";

const schema = z.object({ username: z.string().min(1), password: z.string().min(1) });

export default function LoginPage() {
  const { loginMutation } = useAuth();
  const navigate = useNavigate();
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<z.infer<typeof schema>>({ resolver: zodResolver(schema) });

  return <div className="mx-auto mt-14 max-w-md rounded-3xl border border-white/50 bg-white/85 p-6 shadow-lg backdrop-blur dark:border-slate-800 dark:bg-slate-900/90"><h1 className="mb-1 text-3xl font-bold">SkillSync</h1><p className="mb-5 text-sm text-slate-500">Sign in to continue your learning network.</p><form className="space-y-3" onSubmit={handleSubmit(async (values) => { try { await loginMutation.mutateAsync(values); toast.success("Welcome back"); navigate("/"); } catch { toast.error("Invalid credentials"); } })}><input className="w-full rounded-xl border bg-transparent p-3" placeholder="Username" {...register("username")} />{errors.username && <p className="text-xs text-red-500">Required</p>}<input type="password" className="w-full rounded-xl border bg-transparent p-3" placeholder="Password" {...register("password")} />{errors.password && <p className="text-xs text-red-500">Required</p>}<Button disabled={isSubmitting} className="w-full py-3">Login</Button></form><p className="mt-3 text-sm">No account? <Link className="text-teal-500" to="/register">Register</Link></p></div>;
}
