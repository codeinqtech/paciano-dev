import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { getApiBaseUrl } from "@/lib/apiBase";

export type HomeBannerSlide = {
  id: number;
  media_type: "image" | "video";
  url: string;
  sort_order: number;
};

export type HomeFeatureLabel = { line1: string; line2: string };

export type HomeLocationContent = {
  eyebrow: string | null;
  heading_primary: string | null;
  heading_accent: string | null;
  description: string | null;
  landscape_image_url: string | null;
  feature_labels: HomeFeatureLabel[];
};

export type HomeReviewVideo = {
  id: number;
  reviewer_name: string;
  location: string;
  display_title: string | null;
  thumbnail_url: string | null;
  video_url: string | null;
  sort_order: number;
};

export type HomeAboutContent = {
  heading_line_1: string | null;
  heading_line_2: string | null;
  heading_accent: string | null;
  paragraph_1: string | null;
  paragraph_2: string | null;
  photo_left_url: string | null;
  photo_center_url: string | null;
  photo_right_url: string | null;
};

export type HomeExperienceItemContent = {
  id: number;
  title: string;
  description: string | null;
  image_url: string | null;
  sort_order: number;
};

export type HomeExperiencesContent = {
  section: {
    heading_main: string | null;
    heading_accent: string | null;
  } | null;
  items: HomeExperienceItemContent[];
};

export type HomeStayItemContent = {
  id: number;
  slug: string;
  title: string;
  description: string | null;
  photo_1_url: string | null;
  photo_2_url: string | null;
  photo_3_url: string | null;
  sort_order: number;
};

export type HomeStaysContent = {
  section: {
    heading_main: string | null;
    heading_accent: string | null;
    intro_text: string | null;
  } | null;
  items: HomeStayItemContent[];
};

export type HomeDiningSlideContent = {
  id: number;
  quote: string | null;
  image_url: string | null;
  sort_order: number;
};

export type HomeDiningContent = {
  section: {
    heading_line_1: string | null;
    heading_line_2: string | null;
    heading_accent: string | null;
    description: string | null;
  } | null;
  slides: HomeDiningSlideContent[];
};

type HomeContentValue = {
  loading: boolean;
  ready: boolean;
  bannerSlides: HomeBannerSlide[];
  location: HomeLocationContent | null;
  reviewVideos: HomeReviewVideo[];
  about: HomeAboutContent | null;
  experiences: HomeExperiencesContent | null;
  stays: HomeStaysContent | null;
  dining: HomeDiningContent | null;
};

const apiBase = getApiBaseUrl();

const FETCH_TIMEOUT_MS = 12_000;

const emptyLoaded: Omit<HomeContentValue, "loading"> = {
  ready: true,
  bannerSlides: [],
  location: null,
  reviewVideos: [],
  about: null,
  experiences: null,
  stays: null,
  dining: null,
};

const defaultValue: HomeContentValue = {
  loading: true,
  ...emptyLoaded,
  ready: false,
};

const HomeContentContext = createContext<HomeContentValue>(defaultValue);

async function fetchJson<T>(
  path: string,
  signal: AbortSignal,
): Promise<T | null> {
  try {
    const res = await fetch(`${apiBase}${path}`, {
      headers: { Accept: "application/json" },
      signal,
    });
    if (!res.ok) {
      return null;
    }
    const body = (await res.json()) as { data?: T };
    return body.data ?? null;
  } catch {
    return null;
  }
}

export function HomeContentProvider({ children }: { children: ReactNode }) {
  const [value, setValue] = useState<HomeContentValue>(defaultValue);

  useEffect(() => {
    let ignore = false;
    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

    (async () => {
      let bannerSlides: HomeBannerSlide[] = [];
      let location: HomeLocationContent | null = null;
      let reviewVideos: HomeReviewVideo[] = [];
      let about: HomeAboutContent | null = null;
      let experiences: HomeExperiencesContent | null = null;
      let stays: HomeStaysContent | null = null;
      let dining: HomeDiningContent | null = null;

      try {
        const [b, l, r, a, e, s, d] = await Promise.all([
          fetchJson<HomeBannerSlide[]>(
            "/home/banner-slides",
            controller.signal,
          ),
          fetchJson<HomeLocationContent>("/home/location", controller.signal),
          fetchJson<HomeReviewVideo[]>(
            "/home/review-videos",
            controller.signal,
          ),
          fetchJson<HomeAboutContent>(
            "/home/sections/about",
            controller.signal,
          ),
          fetchJson<HomeExperiencesContent>(
            "/home/sections/experiences",
            controller.signal,
          ),
          fetchJson<HomeStaysContent>(
            "/home/sections/stays",
            controller.signal,
          ),
          fetchJson<HomeDiningContent>(
            "/home/sections/dining",
            controller.signal,
          ),
        ]);
        bannerSlides = b ?? [];
        location = l;
        reviewVideos = r ?? [];
        about = a;
        experiences = e;
        stays = s;
        dining = d;
      } finally {
        window.clearTimeout(timeout);
        if (ignore) {
          return;
        }
        setValue({
          loading: false,
          ready: true,
          bannerSlides,
          location,
          reviewVideos,
          about,
          experiences,
          stays,
          dining,
        });
      }
    })();

    return () => {
      ignore = true;
      window.clearTimeout(timeout);
      controller.abort();
    };
  }, []);

  const memo = useMemo(() => value, [value]);

  return (
    <HomeContentContext.Provider value={memo}>
      {children}
    </HomeContentContext.Provider>
  );
}

export function useHomeContent(): HomeContentValue {
  return useContext(HomeContentContext);
}

export function useHomeBannerSlides(): HomeBannerSlide[] {
  return useHomeContent().bannerSlides;
}

export function useHomeLocation(): HomeLocationContent | null {
  return useHomeContent().location;
}

export function useHomeReviewVideos(): HomeReviewVideo[] {
  return useHomeContent().reviewVideos;
}
