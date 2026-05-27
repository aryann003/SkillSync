import { Profile } from "../types";
import Avatar from "./Avatar";
import Card from "./Card";
import Button from "./Button";
import { splitTags } from "../utils/formatters";

export default function UserCard({ user, following, loading, onToggle }: { user: Profile; following: boolean; loading: boolean; onToggle: () => void }) {
  return <Card><div className="flex items-start justify-between gap-3"><div className="flex gap-3"><Avatar name={user.user.toString()} src={user.profile_image} /><div><p className="font-semibold">{user.user}</p><p className="line-clamp-2 text-sm text-slate-500">{user.bio || "No bio yet"}</p><div className="mt-2 flex flex-wrap gap-1">{splitTags(user.skills).slice(0, 3).map((s) => <span key={s} className="rounded-full bg-teal-100 px-2 py-0.5 text-xs text-teal-700 dark:bg-teal-900 dark:text-teal-200">{s}</span>)}</div></div></div><Button className={following ? "bg-slate-700" : ""} disabled={loading} onClick={onToggle}>{following ? "Unfollow" : "Follow"}</Button></div></Card>;
}
