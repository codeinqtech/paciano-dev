import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { apiRequest } from "../../../api/client";
import type { EventsContentCms } from "@/hooks/useEventsContent";
import { Field, formTwoColPairedRowClass, inputClass } from "../../components/AdminSectionLayout";

export type TypePreviewForm = {
  eyebrow: string;
  title_main: string;
  title_accent: string;
  description: string;
};

export type CategoryPageForm = {
  hero_event_type: string;
  hero_title_line1: string;
  hero_title_line2: string;
  hero_description: string;
  hero_cta_text: string;
  hero_cta_href: string;
  advantage_eyebrow: string;
  advantage_title_line1: string;
  advantage_title_line2: string;
  advantage_description: string;
  venues_eyebrow: string;
  venues_title1: string;
  venues_title2: string;
  venues_description: string;
};

export const emptyCategoryPage = (): CategoryPageForm => ({
  hero_event_type: "",
  hero_title_line1: "",
  hero_title_line2: "",
  hero_description: "",
  hero_cta_text: "",
  hero_cta_href: "",
  advantage_eyebrow: "",
  advantage_title_line1: "",
  advantage_title_line2: "",
  advantage_description: "",
  venues_eyebrow: "",
  venues_title1: "",
  venues_title2: "",
  venues_description: "",
});

export function pageFormFromCms(
  cat: EventsContentCms["categories"]["corporate"] | undefined,
): CategoryPageForm {
  if (!cat?.page) return emptyCategoryPage();
  const h = cat.page.hero;
  const a = cat.page.advantage;
  const v = cat.page.venues;
  return {
    hero_event_type: h.event_type ?? "",
    hero_title_line1: h.title_line1 ?? "",
    hero_title_line2: h.title_line2 ?? "",
    hero_description: h.description ?? "",
    hero_cta_text: h.cta_text ?? "",
    hero_cta_href: h.cta_href ?? "",
    advantage_eyebrow: a.eyebrow ?? "",
    advantage_title_line1: a.title_line1 ?? "",
    advantage_title_line2: a.title_line2 ?? "",
    advantage_description: a.description ?? "",
    venues_eyebrow: v.eyebrow ?? "",
    venues_title1: v.title1 ?? "",
    venues_title2: v.title2 ?? "",
    venues_description: v.description ?? "",
  };
}

export function useAdminEventsCms() {
  const [loading, setLoading] = useState(true);
  const [cms, setCms] = useState<EventsContentCms | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await apiRequest<{ data: EventsContentCms | null }>(
        "/admin/events",
      );
      if (res.data) setCms(res.data);
    } catch (e) {
      const err = e as { message?: string };
      toast.error(err.message || "Could not load events content");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return { loading, cms, load, setCms };
}

export function PreviewFields({
  form,
  onChange,
}: {
  form: TypePreviewForm;
  onChange: (f: TypePreviewForm) => void;
}) {
  return (
    <>
      <Field label="Eyebrow">
        <input
          className={inputClass}
          value={form.eyebrow}
          onChange={(e) => onChange({ ...form, eyebrow: e.target.value })}
        />
      </Field>
      <div className={formTwoColPairedRowClass}>
        <Field label="Title main line">
          <input
            className={inputClass}
            value={form.title_main}
            onChange={(e) => onChange({ ...form, title_main: e.target.value })}
          />
        </Field>
        <Field label="Title accent line">
          <input
            className={inputClass}
            value={form.title_accent}
            onChange={(e) => onChange({ ...form, title_accent: e.target.value })}
          />
        </Field>
      </div>
      <Field label="Description">
        <textarea
          className={`${inputClass} min-h-[88px]`}
          value={form.description}
          onChange={(e) => onChange({ ...form, description: e.target.value })}
        />
      </Field>
    </>
  );
}