import { Bell, Bookmark, ChartNoAxesCombined, Flag, Flame, Home, Search, Users, User } from "lucide-react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { Profile } from "../types";
import Avatar from "./Avatar";
import { useQuery } from "@tanstack/react-query";
import { recommendedUsers } from "../api/search";
import { getNotificationCount } from "../api/notifications";
import { uiStore } from "../store/uiStore";
import { authStore } from "../store/authStore";

const navItems = [
  { to: "/dashboard", label: "Dashboard", icon: ChartNoAxesCombined, hasBadge: false },
  { to: "/", label: "Feed", icon: Home, hasBadge: false },
  { to: "/trending", label: "Trending", icon: Flame, hasBadge: false },
  { to: "/communities", label: "Communities", icon: Users, hasBadge: false },
  { to: "/explore", label: "Explore", icon: Search, hasBadge: false },
  { to: "/notifications", label: "Notifications", icon: Bell, hasBadge: true },
  { to: "/reports", label: "My reports", icon: Flag, hasBadge: false },
  { to: "/saved-posts", label: "Saved posts", icon: Bookmark, hasBadge: false },
  { to: "/profile", label: "Profile", icon: User, hasBadge: false }
] as const;

export default function Sidebar({ profile }: { profile?: Profile | null }) {
  const recommended = useQuery({ queryKey: ["sidebar-recommended-users"], queryFn: recommendedUsers });
  const notificationCountQuery = useQuery({ queryKey: ["notifications", "count"], queryFn: getNotificationCount, staleTime: 30_000 });
  const { theme, toggleTheme } = uiStore();
  const logout = authStore((state) => state.logout);
  const navigate = useNavigate();
  const unreadCount = notificationCountQuery.data?.unread_count ?? 0;
  const displayName = profile?.username || (profile?.user ? `User ${profile.user}` : "User");

  return (
    <>
      <aside className="sticky top-5 hidden h-[calc(100vh-2.5rem)] w-72 shrink-0 space-y-4 overflow-y-auto pr-1 lg:block">
        <div className="soft-panel overflow-hidden rounded-2xl">
          <div className="border-b border-teal-800 bg-teal-800 p-4 text-white dark:border-teal-300 dark:bg-teal-300 dark:text-slate-950">
            <p className="text-[11px] font-bold uppercase tracking-[0.25em] text-teal-100 dark:text-teal-900">SkillSync</p>
            <p className="mt-2 text-xl font-black tracking-tight">Skills, posts, and communities.</p>
          </div>
          <div className="p-4">
            <div className="flex items-center gap-3">
              <Avatar name={displayName} src={profile?.profile_image} />
              <div className="min-w-0">
                <p className="truncate font-bold">{displayName}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">{profile?.profession || "Member"}</p>
              </div>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-2">
              <button
                className="rounded-lg border border-[#d8c9b7] bg-[#f7ead8] px-3 py-2 text-xs font-semibold text-slate-800 transition hover:bg-[#f1ddc4] dark:border-[#30415d] dark:bg-[#17263d] dark:text-slate-100 dark:hover:bg-[#1e3150]"
                onClick={toggleTheme}
              >
                {theme === "dark" ? "Light mode" : "Dark mode"}
              </button>
              <button
                className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-semibold text-rose-700 transition hover:bg-rose-100 dark:border-rose-800/70 dark:bg-rose-950/50 dark:text-rose-200"
                onClick={() => {
                  logout();
                  navigate("/login", { replace: true });
                }}
              >
                Logout
              </button>
            </div>
          </div>
        </div>
        <nav className="soft-panel rounded-2xl p-2">
          <ul className="space-y-1 text-sm">
            {navItems.map(({ to, label, icon: Icon, hasBadge }) => (
              <li key={to}>
                <NavLink
                  to={to}
                  end={to === "/"}
                  className={({ isActive }) =>
                    `flex items-center justify-between rounded-lg px-3 py-2.5 font-semibold transition ${
                      isActive
                        ? "bg-teal-700 text-white dark:bg-teal-300 dark:text-slate-950"
                        : "text-slate-600 hover:bg-[#f7ead8] hover:text-slate-950 dark:text-slate-300 dark:hover:bg-[#17263d] dark:hover:text-white"
                    }`
                  }
                >
                  <span className="flex items-center gap-3">
                    <Icon size={18} />
                    {label}
                  </span>
                  {hasBadge && unreadCount > 0 ? (
                    <span className="inline-flex min-w-5 items-center justify-center rounded-full bg-rose-500 px-1.5 py-0.5 text-xs font-bold text-white">
                      {unreadCount > 99 ? "99+" : unreadCount}
                    </span>
                  ) : null}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>
        <div className="soft-panel rounded-2xl p-4">
          <div className="mb-3 flex items-center justify-between">
            <div>
              <p className="eyebrow">People</p>
              <p className="text-sm font-bold">Recommended users</p>
            </div>
            <button
              className="rounded-lg border bg-[#f7ead8] px-3 py-1 text-xs font-semibold transition hover:bg-[#f1ddc4] dark:bg-[#17263d] dark:hover:bg-[#1e3150]"
              onClick={() => recommended.refetch()}
              disabled={recommended.isFetching}
            >
              {recommended.isFetching ? "Refreshing..." : "Refresh"}
            </button>
          </div>
          {recommended.isLoading ? <p className="text-xs text-slate-500">Loading recommendations...</p> : recommended.isError ? <p className="text-xs text-rose-500">Could not load recommendations.</p> : (recommended.data?.length ?? 0) === 0 ? <p className="text-xs text-slate-500">No recommendations yet. Add skills/interests in profile.</p> : <div className="space-y-3">
            {(recommended.data ?? []).slice(0, 3).map((item) => (
              <div className="flex items-center gap-2" key={item.id}>
                <Avatar name={item.username || (typeof item.user === "number" ? item.user.toString() : "User")} src={item.profile_image} />
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{item.username || (typeof item.user === "number" ? `User ${item.user}` : "User")}</p>
                  <p className="truncate text-xs text-slate-500">{item.profession || "Learner"}</p>
                </div>
              </div>
            ))}
          </div>}
        </div>
      </aside>
      <nav className="fixed bottom-3 left-3 right-3 z-40 grid grid-cols-9 rounded-2xl border border-[#e1d5c6] bg-[#fffaf2] p-2 shadow-lg dark:border-[#263650] dark:bg-[#111d31] lg:hidden">
        {navItems.map(({ to, icon: Icon, hasBadge }) => (
          <Link key={to} to={to} className="relative mx-auto rounded-lg p-2 text-slate-600 transition hover:bg-[#f7ead8] hover:text-slate-950 dark:text-slate-300 dark:hover:bg-[#17263d] dark:hover:text-white">
            <Icon size={18} />
            {hasBadge && unreadCount > 0 ? <span className="absolute -right-1 -top-1 inline-flex min-w-4 items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-bold text-white">{unreadCount > 99 ? "99+" : unreadCount}</span> : null}
          </Link>
        ))}
      </nav>
    </>
  );
}
