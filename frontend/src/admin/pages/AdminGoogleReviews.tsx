import { useCallback, useEffect, useMemo, useState } from "react";
import { ExternalLink, Loader2, RefreshCw, Star } from "lucide-react";
import { useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import { apiRequest } from "../../api/client";
import { GoogleGuestAvatar } from "@/components/GoogleGuestAvatar";
import {
  AdminListSearchBar,
  ListPagination,
} from "../components/ListPagination";
import { useClientPagination } from "../hooks/useClientPagination";
import {
  AdminCmsCardBody,
  AdminCmsPageCard,
  AdminCmsPageHeader,
  AdminCmsPageRoot,
} from "../components/AdminCmsPageLayout";

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
  owner_reply: string | null;
  owner_reply_at: string | null;
  review_reply_url: string | null;
  google_review_id: string | null;
};

type OauthState = {
  client_configured: boolean;
  connected: boolean;
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
  const [searchParams, setSearchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [place, setPlace] = useState<PlaceSummary | null>(null);
  const [reviews, setReviews] = useState<ReviewRow[]>([]);
  const [apiConfigured, setApiConfigured] = useState(false);
  const [syncMode, setSyncMode] = useState<string>("none");
  const [oauth, setOauth] = useState<OauthState>({
    client_configured: false,
    connected: false,
  });
  const [savingId, setSavingId] = useState<number | null>(null);
  const [draftReplies, setDraftReplies] = useState<Record<number, string>>({});
  const [stats, setStats] = useState<{
    stored_count: number;
    approved_count: number;
    google_rating_count: number | null;
  } | null>(null);

  const {
    paginatedItems: pagedReviews,
    paginationProps: reviewsPagination,
    listSearch: reviewsListSearch,
  } = useClientPagination(reviews, { pageSize: 10 });

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
          sync_mode?: string;
          google_business_oauth?: OauthState;
        };
      }>("/admin/google-reviews");
      setPlace(res.data?.place ?? null);
      setReviews(res.data?.reviews ?? []);
      setStats(res.data?.stats ?? null);
      setApiConfigured(Boolean(res.data?.api_configured));
      setSyncMode(res.data?.sync_mode ?? "none");
      setOauth(
        res.data?.google_business_oauth ?? {
          client_configured: false,
          connected: false,
        },
      );
      setDraftReplies((prev) => {
        const next = { ...prev };
        for (const row of res.data?.reviews ?? []) {
          if (next[row.id] === undefined) {
            next[row.id] = row.owner_reply ?? "";
          }
        }
        return next;
      });
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

  useEffect(() => {
    const status = searchParams.get("google_oauth");
    const message = searchParams.get("google_oauth_message");
    if (!status) return;
    if (status === "success") {
      toast.success(message || "Google Business Profile connected");
    } else {
      toast.error(message || "Google authorization failed");
    }
    searchParams.delete("google_oauth");
    searchParams.delete("google_oauth_message");
    setSearchParams(searchParams, { replace: true });
    void load();
  }, [load, searchParams, setSearchParams]);

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

  const connectGoogle = async () => {
    setConnecting(true);
    try {
      const res = await apiRequest<{
        data: { authorize_url: string };
      }>("/admin/google-reviews/oauth/start", { method: "POST" });
      const url = res.data?.authorize_url;
      if (!url) {
        throw new Error("No authorize URL returned");
      }
      window.location.href = url;
    } catch (e) {
      const err = e as { message?: string };
      toast.error(err.message || "Could not start Google sign-in");
      setConnecting(false);
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

  const saveReply = async (row: ReviewRow, publishToGoogle: boolean) => {
    const text = (draftReplies[row.id] ?? "").trim();
    if (!text) {
      toast.error("Write a reply first");
      return;
    }
    setSavingId(row.id);
    try {
      const res = await apiRequest<{ data: ReviewRow }>(
        `/admin/google-reviews/${row.id}`,
        {
          method: "PATCH",
          body: JSON.stringify({
            owner_reply: text,
            publish_reply_to_google: publishToGoogle,
          }),
        },
      );
      if (res.data) {
        setReviews((list) =>
          list.map((r) => (r.id === row.id ? res.data! : r)),
        );
        setDraftReplies((d) => ({ ...d, [row.id]: res.data!.owner_reply ?? "" }));
      }
      toast.success(
        publishToGoogle
          ? "Reply sent to Google Business"
          : "Reply saved locally",
      );
    } catch (e) {
      const err = e as { message?: string };
      toast.error(err.message || "Could not save reply");
    } finally {
      setSavingId(null);
    }
  };

  const setupHint = useMemo(() => {
    if (oauth.connected && syncMode === "business_profile") {
      return "Google Business Profile — sync fetches all review pages (~350+), with photos and reply URLs.";
    }
    // if (oauth.client_configured && !oauth.connected) {
    //   return "Set staging.json OAuth env on the server, click Connect Google Business (or set GOOGLE_REFRESH_TOKEN), then Sync.";
    // }
    // if (syncMode === "places_api") {
    //   return "Places API only stores a few reviews — connect Business Profile to load all reviews like staging.json.";
    // }
  return "";
  }, [apiConfigured, oauth.client_configured, oauth.connected, syncMode]);

  if (loading) {
    return (
      <AdminCmsPageRoot>
        <div className="flex items-center gap-2 py-6 text-sm text-[#657067]">
          <Loader2 className="h-4 w-4 animate-spin" /> Loading Google reviews…
        </div>
      </AdminCmsPageRoot>
    );
  }

  const storedCount = stats?.stored_count ?? reviews.length;
  const approvedCount =
    stats?.approved_count ?? reviews.filter((r) => r.is_approved).length;
  const googleRatingCount =
    stats?.google_rating_count ?? place?.user_rating_count ?? null;

  return (
    <AdminCmsPageRoot>
      <AdminCmsPageHeader
        title="Google reviews"
        subtitle={
          <>
            {/* {setupHint} <span className="text-[#8a8278]">Mode: {syncMode}</span>
            {" · "} */}
            <strong className="font-medium text-[#332C26]">
              {storedCount} stored
            </strong>{" "}
            ({approvedCount} approved for About)
            {googleRatingCount != null
              ? ` · Google Maps: ${googleRatingCount} ratings`
              : null}
          </>
        }
        // badge="Integrations"
        actions={
          <div className="flex flex-wrap items-center gap-2">
            {oauth.client_configured && !oauth.connected ? (
              <button
                type="button"
                disabled={connecting}
                onClick={connectGoogle}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#5F7138] bg-white px-4 py-2.5 text-sm font-semibold text-[#5F7138] disabled:opacity-60"
              >
                {connecting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : null}
                Connect Google Business
              </button>
            ) : null}
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
        }
      />

      <AdminCmsPageCard>
        <AdminCmsCardBody className="space-y-6">
          {/* {syncMode === "places_api" ? (
            <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950">
              <strong className="font-semibold">Full sync needs Business Profile.</strong>{" "}
              Copy <code className="rounded bg-white/80 px-1">GOOGLE_CLIENT_ID</code>,{" "}
              <code className="rounded bg-white/80 px-1">GOOGLE_CLIENT_SECRET</code>,{" "}
              <code className="rounded bg-white/80 px-1">GOOGLE_REDIRECT_URI</code>, account
              and location IDs from <code className="rounded bg-white/80 px-1">staging.json</code>
              , then <strong>Connect Google Business</strong> and run Sync again.
            </div>
          ) : null} */}

          {!apiConfigured && !oauth.client_configured ? (
            <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950">
              <strong className="font-semibold">Google not configured.</strong>{" "}
              Set Business Profile OAuth (
              <code className="rounded bg-white/80 px-1">GOOGLE_CLIENT_*</code>,
              account/location IDs) or{" "}
              <code className="rounded bg-white/80 px-1">
                GOOGLE_PLACES_API_KEY
              </code>{" "}
              in server <code className="rounded bg-white/80 px-1">.env</code>.
            </div>
          ) : null}

          {oauth.connected ? (
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-950">
              Google Business Profile is connected. Sync imports profile photos,
              review text, owner replies, and reply links.
            </div>
          ) : null}

          {place ? (
            <div className="admin-card rounded-2xl p-5 text-sm text-[#332C26]">
              <div className="flex flex-wrap items-center gap-4">
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-[#6E655C]">
                    Place
                  </p>
                  <p className="font-semibold">
                    {place.display_name ?? "Paciano"}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-[#6E655C]">
                    Google rating
                  </p>
                  <p className="flex items-center gap-1 font-semibold">
                    {place.rating ?? "—"}
                    <Star className="h-3.5 w-3.5 fill-[#D9A441] text-[#D9A441]" />
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
                <p className="mt-3 text-xs text-red-800">
                  {place.last_sync_error}
                </p>
              ) : null}
            </div>
          ) : null}

          <div className="admin-card overflow-hidden rounded-2xl">
            {reviews.length > 0 ? (
              <AdminListSearchBar
                {...reviewsListSearch}
                placeholder="Search reviews (guest, text, reply…)"
              />
            ) : null}
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1100px] text-sm">
                <thead className="border-b border-[#EDE4D8] bg-[#FAF7F2]/80 text-left text-xs uppercase tracking-wide text-[#6E655C]">
                  <tr>
                    <th className="px-4 py-3">Guest</th>
                    <th className="px-4 py-3">Rating</th>
                    <th className="min-w-[320px] max-w-xl px-4 py-3">Review</th>
                    <th className="px-4 py-3">Owner reply</th>
                    <th className="px-4 py-3">Date</th>
                    <th className="px-4 py-3">Display on the About Page</th>
                  </tr>
                </thead>
                <tbody>
                  {reviews.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-4 py-8 text-[#6E655C]">
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
                        </td>
                        <td className="px-4 py-3">{row.rating}/5</td>
                        <td className="min-w-[320px] max-w-xl px-4 py-3 text-[#4a443c]">
                          {row.review_text?.trim() ? (
                            <p className="whitespace-pre-wrap break-words text-sm leading-relaxed">
                              {row.review_text}
                            </p>
                          ) : (
                            <span className="italic text-[#8a8278]">
                              No written review
                            </span>
                          )}
                        </td>
                        <td className="max-w-sm px-4 py-3">
                          {row.owner_reply?.trim() ? (
                            <p className="mb-2 whitespace-pre-wrap break-words text-xs leading-relaxed text-[#5a554c]">
                              <span className="font-medium text-[#332C26]">
                                Published:{" "}
                              </span>
                              {row.owner_reply}
                            </p>
                          ) : null}
                          <textarea
                            className="min-h-[72px] w-full rounded-lg border border-[#E5DCCD] bg-white px-2 py-1.5 text-xs"
                            value={draftReplies[row.id] ?? ""}
                            disabled={savingId === row.id}
                            placeholder="Write owner reply…"
                            onChange={(e) =>
                              setDraftReplies((d) => ({
                                ...d,
                                [row.id]: e.target.value,
                              }))
                            }
                          />
                          <div className="mt-2 flex flex-wrap items-center gap-2">
                            <button
                              type="button"
                              disabled={savingId === row.id}
                              onClick={() => saveReply(row, oauth.connected)}
                              className="rounded-lg bg-[#5F7138] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-white disabled:opacity-60"
                            >
                              {oauth.connected
                                ? "Post to Google"
                                : "Save draft"}
                            </button>
                            {row.review_reply_url ? (
                              <a
                                href={row.review_reply_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 text-[10px] font-medium text-[#5F7138] underline"
                              >
                                Open in Google
                                <ExternalLink className="h-3 w-3" />
                              </a>
                            ) : null}
                          </div>
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
        </AdminCmsCardBody>
      </AdminCmsPageCard>
    </AdminCmsPageRoot>
  );
}