import { getInitials } from "../utils/formatters";

export default function Avatar({ name, src }: { name: string; src?: string | null }) {
  const resolvedSrc = (() => {
    if (!src) return null;
    if (src.startsWith("http://") || src.startsWith("https://") || src.startsWith("blob:")) return src;
    return `http://127.0.0.1:8000${src.startsWith("/") ? src : `/${src}`}`;
  })();

  if (resolvedSrc) return <img src={resolvedSrc} className="h-10 w-10 rounded-full object-cover" alt={name} />;
  return <div className="flex h-10 w-10 items-center justify-center rounded-full bg-teal-500 font-semibold text-white">{getInitials(name)}</div>;
}
