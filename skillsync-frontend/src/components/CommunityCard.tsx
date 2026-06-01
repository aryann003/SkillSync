import { Community } from "../types";
import Card from "./Card";
import Button from "./Button";

export default function CommunityCard({ community, joined, loading, onToggle }: { community: Community; joined: boolean; loading: boolean; onToggle: () => void }) {
  return <Card><div className="flex items-start justify-between gap-3"><div><h3 className="text-lg font-semibold">{community.name}</h3><p className="mt-1 text-sm text-slate-500">{community.description || "No description"}</p><p className="mt-2 text-xs uppercase tracking-wide text-slate-400">{community.member_count ?? 0} members</p></div><Button className={joined ? "bg-emerald-600 hover:bg-emerald-600" : ""} onClick={onToggle} disabled={!joined && loading}>{joined ? "Open" : "Join"}</Button></div></Card>;
}
