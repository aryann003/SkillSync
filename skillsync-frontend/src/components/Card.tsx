import { ReactNode } from "react";
import clsx from "clsx";

export default function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={clsx("rounded-2xl border border-white/40 bg-white/85 p-4 shadow-sm backdrop-blur transition hover:shadow-md dark:border-slate-800 dark:bg-slate-900/90", className)}>{children}</div>;
}
