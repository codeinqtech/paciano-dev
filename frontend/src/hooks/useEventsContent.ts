import { useEffect, useState } from "react";
import { getApiBaseUrl } from "@/lib/apiBase";

export type EventsLandingCms = {
  hero_kicker: string | null;
  hero_title_main: string | null;
  hero_title_accent: string | null;
  hero_description: string | null;
  hero_banner_url: string | null;
};

export type EventsTypePreviewCms = {
  slug: string;
  eyebrow: string | null;
  title_main: string | null;
  title_accent: string | null;
  description: string | null;
};

export type EventsAdvantageSlideCms = {
  id: number;
  title: string | null;
  description: string | null;
  image_url: string | null;
  sort_order: number;
};

export type EventsExperienceItemCms = {
  id: number;
  category_slug: string;
  title: string;
  description: string | null;
  icon_key: string | null;
  image_url: string | null;
  show_on_landing: boolean;
  sort_order: number;
};

export type EventsVenueItemCms = {
  id: number;
  category_slug: string;
  title: string;
  description: string | null;
  image_url: string | null;
  capacity: string | null;
  setup: string | null;
  sort_order: number;
};

export type EventsCategoryCms = {
  page: {
    slug: string;
    hero: {
      event_type: string | null;
      title_line1: string | null;
      title_line2: string | null;
      description: string | null;
      image_url: string | null;
      cta_text: string | null;
      cta_href: string | null;
    };
    advantage: {
      eyebrow: string | null;
      title_line1: string | null;
      title_line2: string | null;
      description: string | null;
    };
    venues: {
      eyebrow: string | null;
      title1: string | null;
      title2: string | null;
      description: string | null;
    };
  };
  experience_items: EventsExperienceItemCms[];
  venue_items: EventsVenueItemCms[];
  landing_preview_image_url: string | null;
};

export type EventsContentCms = {
  landing: EventsLandingCms;
  type_previews: EventsTypePreviewCms[];
  advantage_slides: EventsAdvantageSlideCms[];
  categories: {
    corporate: EventsCategoryCms;
    wedding: EventsCategoryCms;
  };
};

export function useEventsContent() {
  const [data, setData] = useState<EventsContentCms | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const base = getApiBaseUrl();
    fetch(`${base}/events/content`, { headers: { Accept: "application/json" } })
      .then((res) => (res.ok ? res.json() : Promise.reject()))
      .then((body: { data?: EventsContentCms | null }) => {
        if (body.data) setData(body.data);
      })
      .catch(() => {})
      .finally(() => setReady(true));
  }, []);

  return { data, ready };
}