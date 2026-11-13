import { useEffect, useState } from "react";
import { getApiBaseUrl } from "@/lib/apiBase";

export type AboutGoogleReview = {
  id: number;
  author_name: string;
  author_url: string | null;
  profile_photo_url: string | null;
  rating: number;
  review_text: string | null;
  published_at: string | null;
};

export type AboutGooglePlaceSummary = {
  place_id: string;
  display_name: string | null;
  rating: number | null;
  user_rating_count: number | null;
  maps_url: string | null;
};

type AboutGoogleReviewsPayload = {
  place: AboutGooglePlaceSummary | null;
  reviews: AboutGoogleReview[];
};

export function useAboutGoogleReviews() {
  const [loading, setLoading] = useState(true);
  const [place, setPlace] = useState<AboutGooglePlaceSummary | null>(null);
  const [reviews, setReviews] = useState<AboutGoogleReview[]>([]);

  useEffect(() => {
    let ignore = false;
    const controller = new AbortController();

    (async () => {
      try {
        const res = await fetch(`${getApiBaseUrl()}/about/google-reviews`, {
          headers: { Accept: "application/json" },
          signal: controller.signal,
        });
        if (!res.ok) return;
        const body = (await res.json()) as {
          data?: AboutGoogleReviewsPayload;
        };
        if (ignore) return;
        setPlace(body.data?.place ?? null);
        setReviews(body.data?.reviews ?? []);
      } catch {
        /* keep empty */
      } finally {
        if (!ignore) setLoading(false);
      }
    })();

    return () => {
      ignore = true;
      controller.abort();
    };
  }, []);

  return { loading, place, reviews };
}
