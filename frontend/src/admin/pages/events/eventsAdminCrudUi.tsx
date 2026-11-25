import { useEffect, useRef, useState, type ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import {
  CalendarDays,
  ChevronDown,
  ChartNoAxesCombined,
  Flower2,
  Handshake,
  Heart,
  Landmark,
  Loader2,
  Pencil,
  Presentation,
  Sparkles,
  Trash2,
  Users,
  UsersRound,
  X,
} from "lucide-react";
import { Field, inputClass } from "../../components/AdminSectionLayout";

/** Keys supported by `iconMap` in EventTypeAdvantage.tsx */
export const EXPERIENCE_ICON_OPTIONS: { value: string; label: string }[] = [
  { value: "presentation", label: "Presentation" },
  { value: "chart", label: "Chart" },
  { value: "handshake", label: "Handshake" },
  { value: "landmark", label: "Landmark" },
  { value: "heart", label: "Heart" },
  { value: "flower", label: "Flower" },
  { value: "users-round", label: "Users (group)" },
  { value: "sparkles", label: "Sparkles" },
  { value: "users", label: "Users" },
  { value: "calendar", label: "Calendar" },
];

const experienceIconMap: Record<string, LucideIcon> = {
  users: Users,
  "users-round": UsersRound,
  presentation: Presentation,
  chart: ChartNoAxesCombined,
  calendar: CalendarDays,
  heart: Heart,
  handshake: Handshake,
  flower: Flower2,
  sparkles: Sparkles,
  landmark: Landmark,
};

export function ExperienceIconGlyph({
  iconKey,
  className = "h-5 w-5",
}: {
  iconKey: string;
  className?: string;
}) {
  const Icon = experienceIconMap[iconKey] ?? Sparkles;
  return <Icon className={className} strokeWidth={1.75} aria-hidden />;
}

export function experienceIconLabel(iconKey: string | null | undefined): string {
  return (
    EXPERIENCE_ICON_OPTIONS.find((o) => o.value === iconKey)?.label ??
    iconKey ??
    "—"
  );
}

export function ExperienceIconSelect({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const selected = EXPERIENCE_ICON_OPTIONS.find((o) => o.value === value);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [open]);

  return (
    <Field label="Icon">
      <div className="relative" ref={rootRef}>
        <button
          type="button"
          className={`${inputClass} flex w-full items-center justify-between gap-3 text-left`}
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-haspopup="listbox"
        >
          <span className="flex min-w-0 items-center gap-3">
            <span
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-[#71803F]/25 bg-[#F5EEE1]/55 text-[#5F7138]"
              aria-hidden
            >
              {value ? (
                <ExperienceIconGlyph iconKey={value} className="h-[18px] w-[18px]" />
              ) : (
                <span className="text-xs text-[#8a8278]">?</span>
              )}
            </span>
            <span className="truncate text-[#332C26]">
              {selected?.label ?? "Choose icon…"}
            </span>
          </span>
          <ChevronDown
            className={`h-4 w-4 shrink-0 text-[#8a8278] transition-transform ${
              open ? "rotate-180" : ""
            }`}
            aria-hidden
          />
        </button>

        {open ? (
          <ul
            className="absolute z-30 mt-1 max-h-64 w-full overflow-auto rounded-xl border border-[#EDE4D8] bg-white py-1 shadow-lg"
            role="listbox"
          >
            <li>
              <button
                type="button"
                role="option"
                aria-selected={value === ""}
                className="flex w-full items-center gap-3 px-3 py-2.5 text-left text-sm text-[#6E655C] hover:bg-[#FAF7F2]"
                onClick={() => {
                  onChange("");
                  setOpen(false);
                }}
              >
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-dashed border-[#cfc5b8] bg-[#FAF7F2]/80 text-xs">
                  —
                </span>
                Choose icon…
              </button>
            </li>
            {EXPERIENCE_ICON_OPTIONS.map((opt) => (
              <li key={opt.value}>
                <button
                  type="button"
                  role="option"
                  aria-selected={value === opt.value}
                  className={`flex w-full items-center gap-3 px-3 py-2.5 text-left text-sm hover:bg-[#FAF7F2] ${
                    value === opt.value
                      ? "bg-[#F5EEE1]/70 font-medium text-[#3d4a22]"
                      : "text-[#332C26]"
                  }`}
                  onClick={() => {
                    onChange(opt.value);
                    setOpen(false);
                  }}
                >
                  <span
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-[#71803F]/25 bg-[#F5EEE1]/55 text-[#5F7138]"
                    aria-hidden
                  >
                    <ExperienceIconGlyph
                      iconKey={opt.value}
                      className="h-[18px] w-[18px]"
                    />
                  </span>
                  {opt.label}
                </button>
              </li>
            ))}
          </ul>
        ) : null}
      </div>
    </Field>
  );
}

export function EventsAdminFormModal({
  title,
  children,
  onClose,
  onSave,
  saving,
  saveLabel = "Save",
}: {
  title: string;
  children: ReactNode;
  onClose: () => void;
  onSave: () => void;
  saving: boolean;
  saveLabel?: string;
}) {
  return (
    <div
      className="fixed inset-0 z-[200] flex items-end justify-center bg-black/45 p-4 sm:items-center"
      onClick={onClose}
    >
      <div
        className="admin-card max-h-[92vh] w-full max-w-lg overflow-y-auto rounded-2xl p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-6 flex items-start justify-between gap-4">
          <h2 className="text-lg font-semibold admin-page-title">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1 text-[#6E655C] hover:bg-[#EDE4D8]/60"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="space-y-5">{children}</div>
        <div className="mt-8 flex justify-end gap-3 border-t border-[#EDE4D8] pt-6">
          <button
            type="button"
            className="rounded-xl px-4 py-2.5 text-sm font-medium text-[#6E655C] hover:bg-[#FAF7F2]"
            onClick={onClose}
            disabled={saving}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onSave}
            disabled={saving}
            className="rounded-xl admin-btn-gold px-6 py-2.5 text-sm font-semibold disabled:opacity-60"
          >
            {saving ? "Saving…" : saveLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

export function AdminRowActions({
  onEdit,
  onDelete,
  deleteBusy,
}: {
  onEdit: () => void;
  onDelete: () => void;
  deleteBusy?: boolean;
}) {
  return (
  <>
    <button
      type="button"
      onClick={onEdit}
      className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-[#3d4a22] hover:bg-[#FAF7F2]"
    >
      <Pencil className="h-4 w-4" />
      Edit
    </button>
    <button
      type="button"
      disabled={deleteBusy}
      onClick={onDelete}
      className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-red-700 hover:bg-red-50 disabled:opacity-50"
    >
      {deleteBusy ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <Trash2 className="h-4 w-4" />
      )}
      Delete
    </button>
  </>
  );
}