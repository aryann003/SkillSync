import { useState } from "react";
import { Post, Profile } from "../types";
import Avatar from "./Avatar";
import Card from "./Card";
import { timeAgo } from "../utils/date";
import CommentThread from "./CommentThread";
import { Link } from "react-router-dom";
import ReportModal from "./ReportModal";
import { reportPost } from "../api/reports";
import { toast } from "sonner";
import { AxiosError } from "axios";

export default function PostCard({ post, profile, mine, liked, saved, likesCount, onLike, onSave, onDelete, onEdit }: { post: Post; profile?: Profile | null; mine: boolean; liked: boolean; saved: boolean; likesCount: number; onLike: () => void; onSave: () => void; onDelete: () => void; onEdit: () => void }) {
  const [expanded, setExpanded] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);
  const [submittingReport, setSubmittingReport] = useState(false);
  const shortContent = post.content.length > 160 && !expanded ? `${post.content.slice(0, 160)}...` : post.content;
  const displayName = post.username || profile?.username || `User ${post.user}`;
  const commentsCount = post.comments_count ?? 0;

  return (
    <Card className="animate-in fade-in overflow-hidden duration-300">
      <div className="mb-4 flex items-start justify-between gap-3">
        <Link to={`/profile/${post.user}`} className="flex items-center gap-2 rounded-lg p-1 transition hover:bg-slate-100 dark:hover:bg-slate-800">
          <Avatar name={displayName} src={post.profile_image || profile?.profile_image} />
          <div><p className="font-bold">{displayName}</p><p className="text-xs font-medium text-slate-500">{timeAgo(post.created_at)}</p></div>
        </Link>
        {mine && (
          <div className="flex flex-wrap justify-end gap-2 text-sm">
            <button onClick={onEdit} className="rounded-lg border border-teal-200 bg-teal-50 px-3 py-1.5 font-semibold text-teal-700 transition hover:bg-teal-100 focus:outline-none focus:ring-2 focus:ring-teal-400 dark:border-teal-900 dark:bg-teal-950/40 dark:text-teal-300">
              Edit
            </button>
            <button onClick={onDelete} className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-1.5 font-semibold text-rose-700 transition hover:bg-rose-100 focus:outline-none focus:ring-2 focus:ring-rose-400 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-300">
              Delete
            </button>
          </div>
        )}
        {!mine && (
          <button
            type="button"
            onClick={() => setReportOpen(true)}
            className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-1.5 text-xs font-semibold text-amber-700 transition hover:bg-amber-100 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-300"
          >
            Report
          </button>
        )}
      </div>
      <h3 className="text-xl font-black tracking-tight text-slate-950 dark:text-white">{post.title}</h3>
      <p className="mt-2 whitespace-pre-line text-[15px] leading-7 text-slate-600 dark:text-slate-300">{shortContent}</p>
      {post.content.length > 160 && <button className="mt-2 text-xs font-bold text-teal-700 hover:text-teal-600 dark:text-teal-300" onClick={() => setExpanded((v) => !v)}>{expanded ? "Show less" : "Read more"}</button>}
      {post.image && <img src={post.image} alt={post.title} className="mt-4 max-h-96 w-full rounded-[1.25rem] border object-cover shadow-sm" />}
      <div className="mt-4 flex flex-wrap gap-2 border-t border-slate-200/70 pt-4 text-sm dark:border-slate-800/70">
        <button className={`rounded-lg border px-3 py-1.5 font-semibold transition hover:bg-[#f1ddc4] focus:outline-none focus:ring-2 focus:ring-teal-500/20 dark:hover:bg-[#1e3150] ${liked ? "bg-teal-50 text-teal-700 dark:bg-teal-950/50 dark:text-teal-200" : "bg-[#f7ead8] text-slate-700 dark:bg-[#17263d] dark:text-slate-200"}`} onClick={onLike}>Like {likesCount}</button>
        <button className={`rounded-lg border px-3 py-1.5 font-semibold transition hover:bg-[#f1ddc4] focus:outline-none focus:ring-2 focus:ring-teal-500/20 dark:hover:bg-[#1e3150] ${saved ? "bg-teal-50 text-teal-700 dark:bg-teal-950/50 dark:text-teal-200" : "bg-[#f7ead8] text-slate-700 dark:bg-[#17263d] dark:text-slate-200"}`} onClick={onSave}>{saved ? "Saved" : "Save"}</button>
        <button className="rounded-lg border bg-[#f7ead8] px-3 py-1.5 font-semibold text-slate-700 transition hover:bg-[#f1ddc4] focus:outline-none focus:ring-2 focus:ring-teal-500/20 dark:bg-[#17263d] dark:text-slate-200 dark:hover:bg-[#1e3150]" onClick={() => setShowComments((v) => !v)}>Comments {commentsCount}</button>
      </div>
      {showComments && <CommentThread postId={post.id} postOwnerId={post.user} />}
      <ReportModal
        open={reportOpen}
        title="Report post"
        busy={submittingReport}
        onClose={() => setReportOpen(false)}
        onSubmit={async (draft) => {
          if (!draft.reason) {
            toast.error("Reason is required");
            return;
          }
          try {
            setSubmittingReport(true);
            await reportPost(post.id, draft);
            toast.success("Post reported");
            setReportOpen(false);
          } catch (error) {
            const axiosError = error as AxiosError<{ error?: string; message?: string }>;
            toast.error(axiosError.response?.data?.error || axiosError.response?.data?.message || "Could not report post");
          } finally {
            setSubmittingReport(false);
          }
        }}
      />
    </Card>
  );
}
