import { Home, Search, Users, User } from "lucide-react";
import { Link, NavLink } from "react-router-dom";
import { Profile } from "../types";
import Avatar from "./Avatar";
import { useQuery } from "@tanstack/react-query";
import { recommendedUsers } from "../api/search";

export default function Sidebar({ profile }: { profile?: Profile | null }) {
  const recommended = useQuery({ queryKey: ["sidebar-recommended-users"], queryFn: recommendedUsers });
  const displayName = profile?.username || (profile?.user ? `User ${profile.user}` : "User");

  return (
    <>
      <aside className="hidden w-72 shrink-0 space-y-4 lg:block">
        <div className="rounded-2xl border border-white/40 bg-white/85 p-4 shadow-sm backdrop-blur dark:border-slate-800 dark:bg-slate-900/90"><div className="flex items-center gap-3"><Avatar name={displayName} src={profile?.profile_image} /><div><p className="font-semibold">{displayName}</p><p className="text-xs text-slate-500">Keep learning daily</p></div></div></div>
        <nav className="rounded-2xl border border-white/40 bg-white/85 p-3 shadow-sm backdrop-blur dark:border-slate-800 dark:bg-slate-900/90"><ul className="space-y-2 text-sm"><li><NavLink to="/" className={({ isActive }) => `block rounded-lg px-3 py-2 ${isActive ? "bg-teal-500 text-white" : "hover:bg-slate-100 dark:hover:bg-slate-800"}`}>Feed</NavLink></li><li><NavLink to="/communities" className={({ isActive }) => `block rounded-lg px-3 py-2 ${isActive ? "bg-teal-500 text-white" : "hover:bg-slate-100 dark:hover:bg-slate-800"}`}>Communities</NavLink></li><li><NavLink to="/explore" className={({ isActive }) => `block rounded-lg px-3 py-2 ${isActive ? "bg-teal-500 text-white" : "hover:bg-slate-100 dark:hover:bg-slate-800"}`}>Explore</NavLink></li><li><NavLink to="/profile" className={({ isActive }) => `block rounded-lg px-3 py-2 ${isActive ? "bg-teal-500 text-white" : "hover:bg-slate-100 dark:hover:bg-slate-800"}`}>Profile</NavLink></li></ul></nav>
        <div className="rounded-2xl border border-white/40 bg-white/85 p-4 shadow-sm backdrop-blur dark:border-slate-800 dark:bg-slate-900/90">
          <p className="mb-3 text-sm font-semibold">Recommended users</p>
          <div className="space-y-3">
            {(recommended.data ?? []).slice(0, 3).map((item) => (
              <div className="flex items-center gap-2" key={item.id}>
                <Avatar name={item.user.toString()} src={item.profile_image} />
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{item.user}</p>
                  <p className="truncate text-xs text-slate-500">{item.profession || "Learner"}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </aside>
      <nav className="fixed bottom-0 left-0 right-0 z-40 grid grid-cols-4 border-t bg-white p-2 dark:bg-slate-900 lg:hidden">
        <Link to="/" className="mx-auto rounded-lg p-2 hover:bg-slate-100 dark:hover:bg-slate-800"><Home size={18} /></Link><Link to="/explore" className="mx-auto rounded-lg p-2 hover:bg-slate-100 dark:hover:bg-slate-800"><Search size={18} /></Link><Link to="/communities" className="mx-auto rounded-lg p-2 hover:bg-slate-100 dark:hover:bg-slate-800"><Users size={18} /></Link><Link to="/profile" className="mx-auto rounded-lg p-2 hover:bg-slate-100 dark:hover:bg-slate-800"><User size={18} /></Link>
      </nav>
    </>
  );
}
