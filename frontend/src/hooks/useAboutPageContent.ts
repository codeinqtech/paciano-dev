import { useEffect, useState } from "react";
import { apiRequest } from "@/api/client";
import type { HomeAboutContent, HomeExperiencesContent } from "./useHomeContent";

export type AboutContentBlock = {
  section_key: string;
  eyebrow: string | null;
  heading_line_1: string | null;
  heading_line_2: string | null;
  heading_accent: string | null;
  body_text: string | null;
  image_url: string | null;
};

export type AboutValueItem = {
  id: number;
  title: string;
  description: string | null;
  icon_key: string;
  sort_order: number;
};

export type AboutPageContent = {
  intro: HomeAboutContent | null;
  experiences: HomeExperiencesContent | null;
  blocks: Record<string, AboutContentBlock>;
  values: AboutValueItem[];
};

const empty: AboutPageContent = {
  intro: null,
  experiences: null,
  blocks: {},
  values: [],
};

export function normalizeAboutIntro(
  raw: Record<string, unknown> | null,
): HomeAboutContent | null {
  if (!raw) return null;
  return {
    heading_line_1: (raw.heading_line_1 as string) ?? null,
    heading_line_2: (raw.heading_line_2 as string) ?? null,
    heading_accent: (raw.heading_accent as string) ?? null,
    paragraph_1: (raw.paragraph_1 as string) ?? null,
    paragraph_2: (raw.paragraph_2 as string) ?? null,
    home_tagline: (raw.home_tagline as string) ?? null,
    home_teaser_words: (raw.home_teaser_words as number) ?? 42,
    word_limits: raw.word_limits as HomeAboutContent["word_limits"],
    photo_left_url: (raw.photo_left_url as string) ?? null,
    photo_center_url: (raw.photo_center_url as string) ?? null,
    photo_right_url: (raw.photo_right_url as string) ?? null,
  };
}

export function useAboutPageContent() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<AboutPageContent>(empty);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await apiRequest<{
          data: {
            intro: Record<string, unknown> | null;
            experiences: HomeExperiencesContent | null;
            blocks: Record<string, AboutContentBlock>;
            values: AboutValueItem[];
          } | null;
        }>("/about/page");
        if (cancelled) return;
        const payload = res.data;
        if (!payload) {
          setData(empty);
          return;
        }
        setData({
          intro: normalizeAboutIntro(payload.intro),
          experiences: payload.experiences ?? null,
          blocks: payload.blocks ?? {},
          values: payload.values ?? [],
        });
      } catch {
        if (!cancelled) setData(empty);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return { loading, ...data };
}
