import { useEffect, useState } from "react";

export type FooterSettings = {
  id?: number;
  intro_paragraph: string | null;
  map_address: string | null;
  map_latitude: number | null;
  map_longitude: number | null;
  map_title: string | null;
  map_subtitle: string | null;
  map_description: string | null;
  location_eyebrow: string | null;
  location_heading: string | null;
  location_subtitle: string | null;
  location_description: string | null;
  maps_link: string | null;
};

export type FooterSocialLink = {
  id: number;
  platform: string;
  url: string;
  sort_order: number;
  openInNewTab?: boolean;
};

export type FooterLocationInfo = {
  id: number;
  info_label: string;
  info_value: string;
  info_icon: string;
  sort_order: number;
};

export type SiteFooterData = {
  settings: FooterSettings | null;
  social: FooterSocialLink[];
  location_info: FooterLocationInfo[];
};

const DEFAULT_INTRO =
  "A quiet retreat in the heart of Dooars, shaped by forest mornings, riverside stillness and the timeless rhythm of nature. Come away from the ordinary and return to what matters.";

const DEFAULT_SETTINGS: FooterSettings = {
  intro_paragraph: DEFAULT_INTRO,
  map_address:
    "Para: Banshbari, Vill: Manabari tea garden, Oodlabari, Ps: Malbazar, Dist: Jalpaiguri, State: West Bengal 735222",
  map_latitude: 26.869761,
  map_longitude: 88.732941,
  map_title: "Manabari, Oodlabari",
  map_subtitle: "Jalpaiguri, West Bengal, India",
  map_description:
    "A serene location at the edge of the Himalayas, perfectly connected yet wonderfully secluded.",
  location_eyebrow: "Our Location",
  location_heading: "Find Your Way Here",
  location_subtitle: "Manabari Tea Garden, Oodlabari — Jalpaiguri, West Bengal",
  location_description:
    "Tucked within the emerald foothills of the Eastern Himalayas, Paciano sits at Manabari tea garden near Oodlabari — accessible from Siliguri and Alipurduar, a journey as scenic as the destination itself.",
  maps_link:
    "https://www.google.com/maps/search/?api=1&query=Manabari+tea+garden+Oodlabari+Malbazar+735222",
};

const DEFAULT_SOCIAL: FooterSocialLink[] = [
  { id: 0, platform: "instagram", url: "https://instagram.com/", sort_order: 10 },
  { id: 0, platform: "facebook", url: "https://facebook.com/", sort_order: 20 },
  { id: 0, platform: "youtube", url: "https://youtube.com/", sort_order: 30 },
  { id: 0, platform: "linkedin", url: "https://linkedin.com/", sort_order: 40 },
];

const DEFAULT_LOCATION_INFO: FooterLocationInfo[] = [
  {
    id: 0,
    info_label: "Gorumara National Park",
    info_value: "12 km",
    info_icon: "car",
    sort_order: 10,
  },
  {
    id: 0,
    info_label: "Malbazar Railway Station",
    info_value: "18 km",
    info_icon: "train",
    sort_order: 20,
  },
  {
    id: 0,
    info_label: "Bagdogra Airport",
    info_value: "70 km",
    info_icon: "plane",
    sort_order: 30,
  },
];

type ApiPayload = {
  settings?: FooterSettings | null;
  social?: FooterSocialLink[];
  location_info?: FooterLocationInfo[];
};

export function useSiteFooter(): SiteFooterData {
  const [data, setData] = useState<SiteFooterData>({
    settings: DEFAULT_SETTINGS,
    social: DEFAULT_SOCIAL,
    location_info: DEFAULT_LOCATION_INFO,
  });

  useEffect(() => {
    const base = (
      import.meta.env.VITE_API_URL?.trim() || "http://127.0.0.1:8000/api"
    ).replace(/\/$/, "");

    fetch(`${base}/site-footer`, { headers: { Accept: "application/json" } })
      .then((res) => (res.ok ? res.json() : Promise.reject()))
      .then((body: { data?: ApiPayload }) => {
        const payload = body.data;
        if (!payload) return;

        setData({
          settings: payload.settings ?? DEFAULT_SETTINGS,
          social:
            payload.social && payload.social.length > 0
              ? payload.social
              : DEFAULT_SOCIAL,
          location_info:
            payload.location_info && payload.location_info.length > 0
              ? payload.location_info
              : DEFAULT_LOCATION_INFO,
        });
      })
      .catch(() => {
        /* keep defaults */
      });
  }, []);

  return data;
}
