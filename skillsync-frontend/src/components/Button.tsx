import { ReactNode } from "react";
import clsx from "clsx";

interface Props extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
}

export default function Button({ children, className, ...props }: Props) {
  return (
    <button
      className={clsx(
        "inline-flex items-center justify-center rounded-lg bg-teal-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-teal-800 focus:outline-none focus:ring-2 focus:ring-teal-500/30 disabled:pointer-events-none disabled:opacity-50 dark:bg-teal-400 dark:text-slate-950 dark:hover:bg-teal-300",
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}
