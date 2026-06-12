import { useQuery } from "@tanstack/react-query";
import { Activity, BellRing, Bookmark, Compass, RefreshCcw, Users } from "lucide-react";
import Card from "../components/Card";
import Button from "../components/Button";
import Skeleton from "../components/Skeleton";
import { getDashboardStats } from "../api/dashboard";

const statCards = [
  {
    key: "total_posts",
    label: "Posts published",
    accent: "from-amber-400 via-orange-400 to-rose-400",
    icon: Activity
  },
  {
    key: "total_followers",
    label: "Followers",
    accent: "from-cyan-400 via-sky-400 to-blue-500",
    icon: Users
  },
  {
    key: "total_following",
    label: "Following",
    accent: "from-emerald-400 via-teal-400 to-cyan-500",
    icon: Compass
  },
  {
    key: "total_saved_posts",
    label: "Saved posts",
    accent: "from-fuchsia-400 via-pink-400 to-rose-500",
    icon: Bookmark
  },
  {
    key: "total_communities_joined",
    label: "Communities joined",
    accent: "from-lime-400 via-green-400 to-emerald-500",
    icon: Users
  },
  {
    key: "unread_notifications",
    label: "Unread notifications",
    accent: "from-violet-400 via-indigo-400 to-blue-500",
    icon: BellRing
  }
] as const;

export default function DashboardPage() {
  const dashboardQuery = useQuery({
    queryKey: ["dashboard"],
    queryFn: getDashboardStats
  });
  const stats = dashboardQuery.data;

  return (
    <div className="space-y-6">
      <Card className="overflow-hidden p-0">
        <div className="relative bg-[radial-gradient(circle_at_top_left,_rgba(34,197,94,0.18),_transparent_32%),linear-gradient(135deg,_rgba(15,23,42,0.98),_rgba(8,47,73,0.95)_48%,_rgba(20,83,45,0.92))] px-6 py-8 text-white">
          <div className="absolute inset-0 bg-[linear-gradient(120deg,transparent_0%,rgba(255,255,255,0.08)_48%,transparent_100%)]" />
          <div className="relative flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
            <div className="max-w-2xl">
              <p className="text-xs uppercase tracking-[0.35em] text-cyan-200/80">Dashboard</p>
              <h1 className="mt-3 text-3xl font-black tracking-tight md:text-4xl">See how your SkillSync world is growing.</h1>
              <p className="mt-3 max-w-xl text-sm text-slate-200">
                Track your activity, social reach, saved ideas, and community presence from one place.
              </p>
            </div>
            <Button
              className="bg-white/15 backdrop-blur hover:bg-white/20"
              disabled={dashboardQuery.isFetching}
              onClick={() => dashboardQuery.refetch()}
            >
              <span className="inline-flex items-center gap-2">
                <RefreshCcw size={16} className={dashboardQuery.isFetching ? "animate-spin" : ""} />
                Refresh
              </span>
            </Button>
          </div>
        </div>
      </Card>

      {dashboardQuery.isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <Card key={index} className="space-y-3">
              <Skeleton className="h-12 w-12 rounded-2xl" />
              <Skeleton className="h-8 w-24" />
              <Skeleton className="h-4 w-32" />
            </Card>
          ))}
        </div>
      ) : dashboardQuery.isError || !stats ? (
        <Card className="border-rose-200 bg-rose-50/80 dark:border-rose-900 dark:bg-rose-950/30">
          <h2 className="text-lg font-semibold text-rose-700 dark:text-rose-300">Dashboard unavailable</h2>
          <p className="mt-2 text-sm text-rose-600 dark:text-rose-200">
            The dashboard API could not be loaded right now. Try refreshing once the backend is running.
          </p>
        </Card>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {statCards.map(({ key, label, accent, icon: Icon }) => (
              <Card key={key} className="relative overflow-hidden">
                <div className={`absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r ${accent}`} />
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm text-slate-500 dark:text-slate-400">{label}</p>
                    <p className="mt-3 text-4xl font-black tracking-tight text-slate-900 dark:text-white">
                      {stats[key]}
                    </p>
                  </div>
                  <div className={`rounded-2xl bg-gradient-to-br ${accent} p-3 text-white shadow-lg`}>
                    <Icon size={22} />
                  </div>
                </div>
              </Card>
            ))}
          </div>

          <div className="grid gap-4 xl:grid-cols-[1.5fr,1fr]">
            <Card>
              <h2 className="text-xl font-bold">Quick pulse</h2>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl bg-slate-100 p-4 dark:bg-slate-800/70">
                  <p className="text-sm text-slate-500">Engagement footprint</p>
                  <p className="mt-2 text-2xl font-bold">
                    {stats.total_followers + stats.total_following}
                  </p>
                  <p className="mt-1 text-xs text-slate-500">Followers plus accounts you follow.</p>
                </div>
                <div className="rounded-2xl bg-slate-100 p-4 dark:bg-slate-800/70">
                  <p className="text-sm text-slate-500">Content library</p>
                  <p className="mt-2 text-2xl font-bold">
                    {stats.total_posts + stats.total_saved_posts}
                  </p>
                  <p className="mt-1 text-xs text-slate-500">Published posts and saved references combined.</p>
                </div>
              </div>
            </Card>

            <Card>
              <h2 className="text-xl font-bold">Focus now</h2>
              <div className="mt-4 space-y-3 text-sm text-slate-600 dark:text-slate-300">
                <div className="rounded-2xl border border-dashed p-3">
                  {stats.unread_notifications > 0
                    ? `${stats.unread_notifications} unread notifications are waiting for you.`
                    : "Your notifications are fully cleared."}
                </div>
                <div className="rounded-2xl border border-dashed p-3">
                  {stats.total_communities_joined > 0
                    ? `You are active in ${stats.total_communities_joined} communities.`
                    : "Join a community to widen your learning circle."}
                </div>
                <div className="rounded-2xl border border-dashed p-3">
                  {stats.total_posts > 0
                    ? `You have published ${stats.total_posts} posts so far.`
                    : "Your first post will start your public activity trail."}
                </div>
              </div>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}
