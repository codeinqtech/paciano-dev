import { useEffect, useState } from "react";
import { getApiBaseUrl } from "@/lib/apiBase";

export type GalleryPageCms = {
  hero_eyebrow: string | null;
  hero_title: string | null;
  hero_subtitle: string | null;
  hero_banner_url: string | null;
  moments_eyebrow: string | null;
  all_moments_label: string | null;
  closing_image_url: string | null;
};

export type GalleryCategoryCms = {
  id: number;
  slug: string;
  label: string;
  icon_prefix: string | null;
  sort_order: number;
};

export type GalleryItemCms = {
  id: number;
  category_id: number;
  category_slug: string | null;
  category_label: string | null;
  title: string | null;
  alt_text: string | null;
  image_url: string | null;
  sort_order: number;
};

export type GalleryContentCms = {
  page: GalleryPageCms;
  categories: GalleryCategoryCms[];
  items: GalleryItemCms[];
};

export function useGalleryContent() {
  const [data, setData] = useState<GalleryContentCms | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const base = getApiBaseUrl();
    fetch(`${base}/gallery/content`, { headers: { Accept: "application/json" } })
      .then((res) => (res.ok ? res.json() : Promise.reject()))
      .then((body: { data?: GalleryContentCms | null }) => {
        if (body.data) setData(body.data);
      })
      .catch(() => {})
      .finally(() => setReady(true));
  }, []);

  return { data, ready };
}