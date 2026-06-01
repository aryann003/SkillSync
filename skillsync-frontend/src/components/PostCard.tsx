import { useState } from "react";
import { Bookmark, MessageSquare, Pencil, ThumbsUp, Trash2 } from "lucide-react";
import { Post, Profile } from "../types";
import Avatar from "./Avatar";
import Card from "./Card";
import { timeAgo } from "../utils/date";
import CommentThread from "./CommentThread";
import { Link } from "react-router-dom";

export default function PostCard({ post, profile, mine, liked, saved, likesCount, onLike, onSave, onDelete, onEdit }: { post: Post; profile?: Profile | null; mine: boolean; liked: boolean; saved: boolean; likesCount: number; onLike: () => void; onSave: () => void; onDelete: () => void; onEdit: () => void }) {
  const [expanded, setExpanded] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const shortContent = post.content.length > 160 && !expanded ? `${post.content.slice(0, 160)}...` : post.content;
  const displayName = post.username || profile?.username || `User ${post.user}`;
  const commentsCount = post.comments_count ?? 0;

  return (
    <Card className="animate-in fade-in duration-300">
      <div className="mb-3 flex items-center justify-between">
        <Link to={`/profile/${post.user}`} className="flex items-center gap-2 rounded-lg p-1 transition hover:bg-slate-100 dark:hover:bg-slate-800">
          <Avatar name={displayName} src={post.profile_image || profile?.profile_image} />
          <div><p className="font-semibold">{displayName}</p><p className="text-xs text-slate-500">{timeAgo(post.created_at)}</p></div>
        </Link>
        {mine && (
          <div className="flex gap-2 text-sm">
            <button
              onClick={onEdit}
              className="group inline-flex items-center gap-1 rounded-full border border-teal-200 bg-teal-50 px-3 py-1.5 font-medium text-teal-700 transition hover:-translate-y-0.5 hover:bg-teal-100 active:translate-y-0 focus:outline-none focus:ring-2 focus:ring-teal-400 dark:border-teal-900 dark:bg-teal-950/40 dark:text-teal-300 dark:hover:bg-teal-900/40"
            >
              <Pencil size={14} className="transition group-hover:rotate-6" />
              Edit
            </button>
            <button
              onClick={onDelete}
              className="group inline-flex items-center gap-1 rounded-full border border-rose-200 bg-rose-50 px-3 py-1.5 font-medium text-rose-700 transition hover:-translate-y-0.5 hover:bg-rose-100 active:translate-y-0 focus:outline-none focus:ring-2 focus:ring-rose-400 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-300 dark:hover:bg-rose-900/40"
            >
              <Trash2 size={14} className="transition group-hover:scale-110" />
              Delete
            </button>
          </div>
        )}
      </div>
      <h3 className="text-lg font-semibold">{post.title}</h3>
      <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{shortContent}</p>
      {post.content.length > 160 && <button className="mt-1 text-xs text-teal-500" onClick={() => setExpanded((v) => !v)}>{expanded ? "Show less" : "Read more"}</button>}
      {post.image && <img src={post.image} alt={post.title} className="mt-3 max-h-96 w-full rounded-lg border object-cover" />}
      <div className="mt-3 flex gap-4 text-sm">
        <button className="inline-flex items-center gap-1 rounded-full px-3 py-1.5 transition hover:-translate-y-0.5 hover:bg-slate-100 active:translate-y-0 focus:outline-none focus:ring-2 focus:ring-slate-300 dark:hover:bg-slate-800 dark:focus:ring-slate-700" onClick={onLike}><ThumbsUp size={16} className={liked ? "fill-teal-500 text-teal-500" : ""} /> {likesCount}</button>
        <button className="inline-flex items-center gap-1 rounded-full px-3 py-1.5 transition hover:-translate-y-0.5 hover:bg-slate-100 active:translate-y-0 focus:outline-none focus:ring-2 focus:ring-slate-300 dark:hover:bg-slate-800 dark:focus:ring-slate-700" onClick={onSave}><Bookmark size={16} className={saved ? "fill-teal-500 text-teal-500" : ""} /> {saved ? "Saved" : "Save"}</button>
        <button className="inline-flex items-center gap-1 rounded-full px-3 py-1.5 transition hover:-translate-y-0.5 hover:bg-slate-100 active:translate-y-0 focus:outline-none focus:ring-2 focus:ring-slate-300 dark:hover:bg-slate-800 dark:focus:ring-slate-700" onClick={() => setShowComments((v) => !v)}><MessageSquare size={16} /> {commentsCount}</button>
      </div>
      {showComments && <CommentThread postId={post.id} postOwnerId={post.user} />}
    </Card>
  );
}
