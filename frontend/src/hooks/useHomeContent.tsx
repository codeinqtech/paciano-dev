import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

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

type HomeContentValue = {
  loading: boolean;
  ready: boolean;
  bannerSlides: HomeBannerSlide[];
  location: HomeLocationContent | null;
  reviewVideos: HomeReviewVideo[];
};

const apiBase = (
  import.meta.env.VITE_API_URL?.trim() || "http://127.0.0.1:8000/api"
).replace(/\/$/, "");

const FETCH_TIMEOUT_MS = 12_000;

const emptyLoaded: Omit<HomeContentValue, "loading"> = {
  ready: true,
  bannerSlides: [],
  location: null,
  reviewVideos: [],
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

      try {
        const [b, l, r] = await Promise.all([
          fetchJson<HomeBannerSlide[]>(
            "/home/banner-slides",
            controller.signal,
          ),
          fetchJson<HomeLocationContent>("/home/location", controller.signal),
          fetchJson<HomeReviewVideo[]>(
            "/home/review-videos",
            controller.signal,
          ),
        ]);
        bannerSlides = b ?? [];
        location = l;
        reviewVideos = r ?? [];
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
