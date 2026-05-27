import { ReactNode } from "react";

export default function Modal({ open, title, children, onClose, onConfirm }: { open: boolean; title: string; children: ReactNode; onClose: () => void; onConfirm: () => void }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="w-full max-w-sm rounded-2xl bg-white p-4 dark:bg-slate-900">
        <h3 className="mb-2 text-lg font-semibold">{title}</h3>
        <div className="mb-4 text-sm text-slate-600 dark:text-slate-300">{children}</div>
        <div className="flex justify-end gap-2"><button onClick={onClose}>Cancel</button><button className="rounded-lg bg-red-500 px-3 py-1 text-white" onClick={onConfirm}>Confirm</button></div>
      </div>
    </div>
  );
}
