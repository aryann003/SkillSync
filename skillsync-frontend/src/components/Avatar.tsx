import { getInitials } from "../utils/formatters";
import { API_BASE_URL } from "../api/client";

export default function Avatar({ name, src }: { name: string; src?: string | null }) {
  const resolvedSrc = (() => {
    if (!src) return null;
    if (src.startsWith("http://") || src.startsWith("https://") || src.startsWith("blob:")) return src;
    const apiRoot = API_BASE_URL.replace(/\/api\/?$/, "");
    return `${apiRoot}${src.startsWith("/") ? src : `/${src}`}`;
  })();

  if (resolvedSrc) return <img src={resolvedSrc} className="h-10 w-10 rounded-full object-cover" alt={name} />;
  return <div className="flex h-10 w-10 items-center justify-center rounded-full bg-teal-500 font-semibold text-white">{getInitials(name)}</div>;
}
