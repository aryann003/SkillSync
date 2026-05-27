import { Outlet } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import { useAuth } from "../hooks/useAuth";
import { uiStore } from "../store/uiStore";
import { authStore } from "../store/authStore";
import { useNavigate } from "react-router-dom";

export default function AppLayout() {
  const { profileQuery } = useAuth();
  const { theme, toggleTheme } = uiStore();
  const logout = authStore((s) => s.logout);
  const navigate = useNavigate();

  return <div className="mx-auto flex min-h-screen max-w-7xl gap-6 p-4 pb-20 lg:pb-4"><Sidebar profile={profileQuery.data} /><main className="w-full"><div className="mb-4 flex items-center justify-between rounded-2xl border border-white/50 bg-white/80 px-4 py-3 backdrop-blur dark:border-slate-800 dark:bg-slate-900/80"><p className="text-sm text-slate-500">Welcome back, keep your streak alive.</p><div className="flex items-center gap-2"><button className="rounded-lg border px-3 py-1 text-sm hover:bg-slate-100 dark:hover:bg-slate-800" onClick={toggleTheme}>{theme === "dark" ? "Light" : "Dark"} mode</button><button className="rounded-lg border border-rose-300 px-3 py-1 text-sm text-rose-600 hover:bg-rose-50 dark:border-rose-900 dark:text-rose-300 dark:hover:bg-rose-950/40" onClick={() => { logout(); navigate("/login", { replace: true }); }}>Logout</button></div></div><Outlet /></main></div>;
}
