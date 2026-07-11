import { ReactNode } from "react";

export default function Modal({
  open,
  title,
  children,
  onClose,
  onConfirm,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  confirmDisabled = false
}: {
  open: boolean;
  title: string;
  children: ReactNode;
  onClose: () => void;
  onConfirm: () => void;
  confirmLabel?: string;
  cancelLabel?: string;
  confirmDisabled?: boolean;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 p-4">
      <div className="flex min-h-full items-start justify-center py-4">
        <div className="my-auto flex max-h-[calc(100vh-4rem)] w-full max-w-sm flex-col overflow-hidden rounded-2xl bg-white shadow-2xl dark:bg-slate-900">
          <div className="overflow-y-auto p-4">
            <h3 className="mb-2 text-lg font-semibold">{title}</h3>
            <div className="text-sm text-slate-600 dark:text-slate-300">{children}</div>
          </div>
          <div className="flex justify-end gap-2 border-t border-slate-200 bg-white px-4 py-3 dark:border-slate-800 dark:bg-slate-900">
            <button onClick={onClose}>{cancelLabel}</button>
            <button className="rounded-lg bg-red-500 px-3 py-1 text-white disabled:opacity-60" onClick={onConfirm} disabled={confirmDisabled}>{confirmLabel}</button>
          </div>
        </div>
      </div>
    </div>
  );
}
