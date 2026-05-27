import { ReactNode } from "react";
import clsx from "clsx";

interface Props extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
}

export default function Button({ children, className, ...props }: Props) {
  return <button className={clsx("rounded-xl bg-teal-500 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50", className)} {...props}>{children}</button>;
}
