export const timeAgo = (value: string): string => {
  const now = Date.now();
  const time = new Date(value).getTime();
  const sec = Math.floor((now - time) / 1000);
  if (sec < 60) return "just now";
  if (sec < 3600) return `${Math.floor(sec / 60)}m ago`;
  if (sec < 86400) return `${Math.floor(sec / 3600)}h ago`;
  return `${Math.floor(sec / 86400)}d ago`;
};
