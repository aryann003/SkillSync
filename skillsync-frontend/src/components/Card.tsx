import { ReactNode } from "react";
import clsx from "clsx";

export default function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={clsx(
        "soft-panel rounded-2xl p-5 transition duration-200 hover:border-slate-300 dark:hover:border-slate-700",
        className
      )}
    >
      {children}
    </div>
  );
}
