import { useEffect, useState } from "react";
import Modal from "./Modal";

export interface ReportDraft {
  reason: string;
  description: string;
}

const reasonOptions = [
  { value: "spam", label: "Spam" },
  { value: "abuse", label: "Abuse" },
  { value: "fake", label: "Fake content" },
  { value: "irrelevant", label: "Irrelevant" },
  { value: "harassment", label: "Harassment" },
  { value: "other", label: "Other" }
] as const;

const initialDraft: ReportDraft = {
  reason: "spam",
  description: ""
};

export default function ReportModal({
  open,
  title,
  busy,
  onClose,
  onSubmit
}: {
  open: boolean;
  title: string;
  busy?: boolean;
  onClose: () => void;
  onSubmit: (draft: ReportDraft) => Promise<void> | void;
}) {
  const [draft, setDraft] = useState<ReportDraft>(initialDraft);

  useEffect(() => {
    if (!open) setDraft(initialDraft);
  }, [open]);

  return (
    <Modal
      open={open}
      title={title}
      onClose={onClose}
      onConfirm={() => onSubmit({ reason: draft.reason.trim(), description: draft.description.trim() })}
      confirmLabel={busy ? "Submitting..." : "Submit report"}
      confirmDisabled={busy}
    >
      <div className="space-y-3">
        <div>
          <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-slate-500">Reason</label>
          <select
            value={draft.reason}
            onChange={(e) => setDraft((prev) => ({ ...prev, reason: e.target.value }))}
            className="w-full rounded-lg border bg-transparent p-2 text-sm"
          >
            {reasonOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-slate-500">Description</label>
          <textarea
            value={draft.description}
            onChange={(e) => setDraft((prev) => ({ ...prev, description: e.target.value }))}
            rows={4}
            className="w-full rounded-lg border bg-transparent p-2 text-sm"
            placeholder="Share a short explanation"
          />
        </div>
      </div>
    </Modal>
  );
}
