import { useQuery } from "@tanstack/react-query";
import Card from "../components/Card";
import Button from "../components/Button";
import Skeleton from "../components/Skeleton";
import { getDashboardStats } from "../api/dashboard";

const statCards = [
  {
    key: "total_posts",
    label: "Posts published",
    accent: "bg-amber-100 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300",
    bar: "bg-amber-500"
  },
  {
    key: "total_followers",
    label: "Followers",
    accent: "bg-sky-100 text-sky-700 dark:bg-sky-950/50 dark:text-sky-300",
    bar: "bg-sky-500"
  },
  {
    key: "total_following",
    label: "Following",
    accent: "bg-teal-100 text-teal-700 dark:bg-teal-950/50 dark:text-teal-300",
    bar: "bg-teal-500"
  },
  {
    key: "total_saved_posts",
    label: "Saved posts",
    accent: "bg-rose-100 text-rose-700 dark:bg-rose-950/50 dark:text-rose-300",
    bar: "bg-rose-500"
  },
  {
    key: "total_communities_joined",
    label: "Communities joined",
    accent: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300",
    bar: "bg-emerald-500"
  },
  {
    key: "unread_notifications",
    label: "Unread notifications",
    accent: "bg-indigo-100 text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-300",
    bar: "bg-indigo-500"
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
        <div className="border-b border-[#e1d5c6] bg-[#fdf4e6] px-6 py-8 dark:border-[#263650] dark:bg-[#132238]">
          <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
            <div className="max-w-2xl">
              <p className="eyebrow">Dashboard</p>
              <h1 className="mt-3 text-3xl font-black tracking-tight text-slate-950 dark:text-white md:text-4xl">See how your SkillSync world is growing.</h1>
              <p className="mt-3 max-w-xl text-sm text-slate-500 dark:text-slate-400">
                Track your activity, social reach, saved ideas, and community presence from one place.
              </p>
            </div>
            <Button
              disabled={dashboardQuery.isFetching}
              onClick={() => dashboardQuery.refetch()}
            >
              {dashboardQuery.isFetching ? "Refreshing..." : "Refresh"}
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
            {statCards.map(({ key, label, accent, bar }) => (
              <Card key={key} className="relative overflow-hidden">
                <div className={`absolute inset-x-0 top-0 h-1 ${bar}`} />
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm text-slate-500 dark:text-slate-400">{label}</p>
                    <p className="mt-3 text-4xl font-black tracking-tight text-slate-900 dark:text-white">
                      {stats[key]}
                    </p>
                  </div>
                  <div className={`rounded-lg px-2.5 py-1 text-xs font-semibold ${accent}`}>
                    {label.split(" ")[0]}
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
