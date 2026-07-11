import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import Card from "../components/Card";
import Skeleton from "../components/Skeleton";
import Button from "../components/Button";
import { getAllReports, getMyReports, getPendingReports, updateReportStatus } from "../api/reports";
import { Report } from "../types";
import { timeAgo } from "../utils/date";

export default function ReportsPage() {
  const queryClient = useQueryClient();
  const [mode, setMode] = useState<"mine" | "pending" | "all">("mine");
  const reportsQuery = useQuery({
    queryKey: ["reports", mode],
    queryFn: mode === "mine" ? getMyReports : mode === "pending" ? getPendingReports : getAllReports,
    retry: false,
    staleTime: 60_000
  });
  const myReportsQuery = useQuery({
    queryKey: ["reports", "mine"],
    queryFn: getMyReports,
    staleTime: 60_000
  });
  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: number; status: Report["status"] }) => updateReportStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reports"] });
    }
  });

  const reports = reportsQuery.data ?? [];
  const isModeratorView = mode !== "mine";

  const renderStatusActions = (report: Report) => {
    const statuses: Report["status"][] = ["reviewed", "resolved", "rejected", "pending"];
    return (
      <div className="mt-3 flex flex-wrap gap-2">
        {statuses.filter((status) => status !== report.status).map((status) => (
          <button
            key={status}
            className="rounded-lg border px-2 py-1 text-xs hover:bg-slate-100 dark:hover:bg-slate-800"
            disabled={updateStatusMutation.isPending}
            onClick={async () => {
              try {
                await updateStatusMutation.mutateAsync({ id: report.id, status });
                toast.success(`Marked as ${status}`);
              } catch {
                toast.error("Could not update report status");
              }
            }}
          >
            Mark {status}
          </button>
        ))}
      </div>
    );
  };

  return (
    <Card>
      <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-2xl font-bold">{mode === "mine" ? "My reports" : mode === "pending" ? "Pending reports" : "All reports"}</h1>
          <p className="mt-1 text-sm text-slate-500">
            {mode === "mine"
              ? "Track the content you have flagged and its current review status."
              : "Review user-submitted reports and update their moderation status."}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button className={mode === "mine" ? "" : "bg-slate-700"} onClick={() => setMode("mine")}>My reports</Button>
          <Button className={mode === "pending" ? "" : "bg-slate-700"} onClick={() => setMode("pending")}>Pending</Button>
          <Button className={mode === "all" ? "" : "bg-slate-700"} onClick={() => setMode("all")}>All reports</Button>
        </div>
      </div>

      {reportsQuery.isLoading ? (
        <div className="space-y-3">{Array.from({ length: 4 }).map((_, index) => <Skeleton key={index} className="h-24" />)}</div>
      ) : reportsQuery.isError ? (
        <p className="text-sm text-rose-500">
          {isModeratorView ? "Could not load moderator reports right now. You may not have staff access." : "Could not load your reports right now."}
        </p>
      ) : reports.length === 0 ? (
        <p className="text-sm text-slate-500">
          {mode === "mine" ? "You have not submitted any reports yet." : "No reports found for this view."}
        </p>
      ) : (
        <div className="space-y-3">
          {reports.map((report) => (
            <div key={report.id} className="rounded-2xl border p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-semibold">{report.post ? `Post report #${report.post}` : `Comment report #${report.comment}`}</p>
                  <p className="mt-1 text-sm text-slate-500">{report.reason || "No reason provided"}</p>
                </div>
                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                  {report.status}
                </span>
              </div>
              {report.description ? <p className="mt-3 text-sm text-slate-600 dark:text-slate-300">{report.description}</p> : null}
              {mode !== "mine" ? <p className="mt-2 text-xs text-slate-500">Reported by @{report.reported_by_username || report.reported_by}</p> : null}
              {mode !== "mine" ? renderStatusActions(report) : null}
              <p className="mt-3 text-xs text-slate-500">{timeAgo(report.created_at)}</p>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}
