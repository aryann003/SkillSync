import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import Button from "../components/Button";
import { toast } from "sonner";

const schema = z.object({ username: z.string().min(3), email: z.string().email(), password: z.string().min(8), confirmPassword: z.string().min(8) }).refine((d) => d.password === d.confirmPassword, { path: ["confirmPassword"], message: "Passwords must match" });

export default function RegisterPage() {
  const { registerMutation } = useAuth();
  const navigate = useNavigate();
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<z.infer<typeof schema>>({ resolver: zodResolver(schema) });

  return <div className="mx-auto mt-14 max-w-md rounded-3xl border border-white/50 bg-white/85 p-6 shadow-lg backdrop-blur dark:border-slate-800 dark:bg-slate-900/90"><h1 className="mb-1 text-3xl font-bold">Create account</h1><p className="mb-5 text-sm text-slate-500">Join SkillSync and meet peers with similar goals.</p><form className="space-y-3" onSubmit={handleSubmit(async (values) => { try { await registerMutation.mutateAsync({ username: values.username, email: values.email, password: values.password }); toast.success("Account created"); navigate("/login"); } catch { toast.error("Could not register"); } })}><input className="w-full rounded-xl border bg-transparent p-3" placeholder="Username" {...register("username")} />{errors.username && <p className="text-xs text-red-500">Min 3 chars</p>}<input className="w-full rounded-xl border bg-transparent p-3" placeholder="Email" {...register("email")} />{errors.email && <p className="text-xs text-red-500">Valid email required</p>}<input type="password" className="w-full rounded-xl border bg-transparent p-3" placeholder="Password" {...register("password")} />{errors.password && <p className="text-xs text-red-500">Min 8 chars</p>}<input type="password" className="w-full rounded-xl border bg-transparent p-3" placeholder="Confirm password" {...register("confirmPassword")} />{errors.confirmPassword && <p className="text-xs text-red-500">{errors.confirmPassword.message}</p>}<Button disabled={isSubmitting} className="w-full py-3">Create account</Button></form><p className="mt-3 text-sm">Already registered? <Link className="text-teal-500" to="/login">Login</Link></p></div>;
}
