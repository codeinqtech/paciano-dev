import { useCallback, useEffect, useState } from "react";
import { Loader2, RefreshCw, Star } from "lucide-react";
import { toast } from "sonner";
import { apiRequest } from "../../api/client";
import { GoogleGuestAvatar } from "@/components/GoogleGuestAvatar";
import { ListPagination } from "../components/ListPagination";
import { useClientPagination } from "../hooks/useClientPagination";

type PlaceSummary = {
  place_id: string;
  display_name: string | null;
  rating: number | null;
  user_rating_count: number | null;
  maps_url: string | null;
  last_synced_at: string | null;
  last_sync_error?: string | null;
};

type ReviewRow = {
  id: number;
  author_name: string;
  rating: number;
  review_text: string | null;
  published_at: string | null;
  is_approved: boolean;
  imported_from_legacy: boolean;
  profile_photo_url: string | null;
};

function formatReviewDate(iso: string | null): string {
  if (!iso) return "—";
  try {
    return new Intl.DateTimeFormat("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    }).format(new Date(iso));
  } catch {
    return "—";
  }
}

export default function AdminGoogleReviews() {
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [place, setPlace] = useState<PlaceSummary | null>(null);
  const [reviews, setReviews] = useState<ReviewRow[]>([]);
  const [apiConfigured, setApiConfigured] = useState(false);
  const [savingId, setSavingId] = useState<number | null>(null);
  const [stats, setStats] = useState<{
    stored_count: number;
    approved_count: number;
    google_rating_count: number | null;
  } | null>(null);

  const { paginatedItems: pagedReviews, paginationProps: reviewsPagination } =
    useClientPagination(reviews, { pageSize: 10 });

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await apiRequest<{
        data: {
          place: PlaceSummary | null;
          reviews: ReviewRow[];
          stats?: {
            stored_count: number;
            approved_count: number;
            google_rating_count: number | null;
          };
          api_configured: boolean;
        };
      }>("/admin/google-reviews");
      setPlace(res.data?.place ?? null);
      setReviews(res.data?.reviews ?? []);
      setStats(res.data?.stats ?? null);
      setApiConfigured(Boolean(res.data?.api_configured));
    } catch (e) {
      const err = e as { message?: string };
      toast.error(err.message || "Could not load Google reviews");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const syncFromGoogle = async () => {
    setSyncing(true);
    try {
      const res = await apiRequest<{ message?: string }>(
        "/admin/google-reviews/sync",
        { method: "POST" },
      );
      toast.success(res.message || "Sync completed");
      await load();
    } catch (e) {
      const err = e as { message?: string };
      toast.error(err.message || "Sync failed");
    } finally {
      setSyncing(false);
    }
  };

  const toggleApproved = async (row: ReviewRow) => {
    setSavingId(row.id);
    try {
      const res = await apiRequest<{ data: ReviewRow }>(
        `/admin/google-reviews/${row.id}`,
        {
          method: "PATCH",
          body: JSON.stringify({ is_approved: !row.is_approved }),
        },
      );
      if (res.data) {
        setReviews((list) =>
          list.map((r) => (r.id === row.id ? res.data! : r)),
        );
      }
      toast.success(
        !row.is_approved
          ? "Review approved for About page"
          : "Review hidden from About page",
      );
    } catch (e) {
      const err = e as { message?: string };
      toast.error(err.message || "Could not update approval");
    } finally {
      setSavingId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-sm text-[#657067]">
        <Loader2 className="h-4 w-4 animate-spin" /> Loading Google reviews…
      </div>
    );
  }

  const storedCount = stats?.stored_count ?? reviews.length;
  const approvedCount = stats?.approved_count ?? reviews.filter((r) => r.is_approved).length;
  const googleRatingCount =
    stats?.google_rating_count ?? place?.user_rating_count ?? null;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-[#332C26]">
            Google reviews
          </h1>
          <p className="mt-1 max-w-2xl text-sm text-[#6E655C]">
            This table lists{" "}
            <strong className="font-medium text-[#332C26]">
              {storedCount} review{storedCount === 1 ? "" : "s"}
            </strong>{" "}
            saved on your site ({approvedCount} approved for the About page).
            Google Maps may show hundreds of ratings overall
            {googleRatingCount != null ? ` (${googleRatingCount} today)` : ""};
            the Places API only returns a small sample on each sync, not every
            rating.
          </p>
        </div>
        <button
          type="button"
          disabled={syncing}
          onClick={syncFromGoogle}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#5F7138] px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-60"
        >
          {syncing ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <RefreshCw className="h-4 w-4" />
          )}
          Sync from Google
        </button>
      </div>

      {!apiConfigured ? (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950">
          <strong className="font-semibold">Google API key not set.</strong> Add{" "}
          <code className="rounded bg-white/80 px-1">GOOGLE_PLACES_API_KEY</code>{" "}
          to the server <code className="rounded bg-white/80 px-1">.env</code>{" "}
          when ready, then use Sync from Google. Imported legacy reviews are
          already listed below.
        </div>
      ) : null}

      {place ? (
        <div className="admin-card rounded-2xl p-5 text-sm text-[#332C26]">
          <div className="flex flex-wrap items-center gap-4">
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-[#6E655C]">
                Place
              </p>
              <p className="font-semibold">{place.display_name ?? "Paciano"}</p>
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-[#6E655C]">
                Google rating
              </p>
              <p className="flex items-center gap-1 font-semibold">
                {place.rating ?? "—"}
                <Star className="h-3.5 w-3.5 fill-[#D9A441] text-[#D9A441]" />
                <span className="font-normal text-[#6E655C]">
                  ({googleRatingCount ?? 0} ratings on Google Maps)
                </span>
              </p>
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-[#6E655C]">
                In this admin
              </p>
              <p className="font-semibold">
                {storedCount} stored · {approvedCount} approved
              </p>
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-[#6E655C]">
                Last sync
              </p>
              <p>{formatReviewDate(place.last_synced_at)}</p>
            </div>
          </div>
          {place.last_sync_error ? (
            <p className="mt-3 text-xs text-red-800">{place.last_sync_error}</p>
          ) : null}
        </div>
      ) : null}

      <div className="admin-card overflow-hidden rounded-2xl">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-sm">
            <thead className="border-b border-[#EDE4D8] bg-[#FAF7F2]/80 text-left text-xs uppercase tracking-wide text-[#6E655C]">
              <tr>
                <th className="px-4 py-3">Guest</th>
                <th className="px-4 py-3">Rating</th>
                <th className="px-4 py-3">Review</th>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">About page</th>
              </tr>
            </thead>
            <tbody>
              {reviews.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-[#6E655C]">
                    No reviews in the database yet.
                  </td>
                </tr>
              ) : (
                pagedReviews.map((row) => (
                  <tr
                    key={row.id}
                    className="border-b border-[#EDE4D8]/60 last:border-0 align-top"
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <GoogleGuestAvatar
                          name={row.author_name}
                          photoUrl={row.profile_photo_url}
                          size="sm"
                        />
                        <span className="font-medium">{row.author_name}</span>
                      </div>
                      {row.imported_from_legacy ? (
                        <span className="mt-1 block text-[10px] uppercase tracking-wide text-[#8a8278]">
                          Imported
                        </span>
                      ) : null}
                    </td>
                    <td className="px-4 py-3">{row.rating}/5</td>
                    <td className="max-w-md px-4 py-3 text-[#4a443c]">
                      {row.review_text?.trim() ? (
                        <span className="line-clamp-4">{row.review_text}</span>
                      ) : (
                        <span className="italic text-[#8a8278]">
                          No written review
                        </span>
                      )}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-[#6E655C]">
                      {formatReviewDate(row.published_at)}
                    </td>
                    <td className="px-4 py-3">
                      <label className="inline-flex cursor-pointer items-center gap-2">
                        <input
                          type="checkbox"
                          checked={row.is_approved}
                          disabled={savingId === row.id}
                          onChange={() => toggleApproved(row)}
                          className="h-4 w-4 rounded border-[#C8BC82]"
                        />
                        <span className="text-xs">
                          {row.is_approved ? "Approved" : "Hidden"}
                        </span>
                      </label>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        {reviews.length > 0 ? (
          <ListPagination {...reviewsPagination} itemLabel="reviews" />
        ) : null}
      </div>
    </div>
  );
}
