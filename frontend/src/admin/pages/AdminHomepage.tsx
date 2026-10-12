import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { Film, ImageIcon, Plus, Trash2, Pencil, Upload, X } from "lucide-react";
import { toast } from "sonner";
import { apiRequest, apiUpload } from "../../api/client";
import { resolveMediaUrl } from "../../utils/resolveMediaUrl";

const BANNER_IMAGE_MAX_BYTES = 50 * 1024 * 1024;
const BANNER_VIDEO_MAX_BYTES = 500 * 1024 * 1024;
const REVIEW_VIDEO_MAX_BYTES = 500 * 1024 * 1024;

import type { HomeFeatureLabel } from "@/hooks/useHomeContent";

type VideoCompressionInfo = {
  applied: boolean;
  original_bytes: number;
  stored_bytes: number;
  saved_percent: number;
};

type TabId = "banner" | "location" | "testimonials" | "memories";

const TABS: { id: TabId; label: string }[] = [
  { id: "banner", label: "Banner" },
  { id: "location", label: "Our location" },
  { id: "testimonials", label: "Real people. Real moments" },
  { id: "memories", label: "Memories made at Paciano" },
];

type BannerRow = {
  id: number;
  media_type: "image" | "video";
  url: string;
  sort_order: number;
  file_name?: string;
};

type LocationForm = {
  eyebrow: string;
  heading_primary: string;
  heading_accent: string;
  description: string;
  feature_labels: HomeFeatureLabel[];
  landscape_image_url: string | null;
};

type ReviewRow = {
  id: number;
  reviewer_name: string;
  location: string;
  display_title: string | null;
  thumbnail_url: string | null;
  video_url: string | null;
  sort_order: number;
};

const defaultFeatures = (): HomeFeatureLabel[] => [
  { line1: "Scenic", line2: "Surroundings" },
  { line1: "Easy", line2: "Access" },
  { line1: "By The", line2: "River" },
  { line1: "Wild", line2: "Retreat" },
];

export default function AdminHomepage() {
  const [tab, setTab] = useState<TabId>("banner");
  const [loading, setLoading] = useState(true);

  const [banners, setBanners] = useState<BannerRow[]>([]);
  const [bannerModal, setBannerModal] = useState(false);
  const [bannerType, setBannerType] = useState<"image" | "video">("image");
  const [bannerFile, setBannerFile] = useState<File | null>(null);
  const [bannerSort, setBannerSort] = useState(0);
  const [bannerSaving, setBannerSaving] = useState(false);
  const [bannerVideoCompression, setBannerVideoCompression] =
    useState<VideoCompressionInfo | null>(null);
  const [reviewVideoCompression, setReviewVideoCompression] =
    useState<VideoCompressionInfo | null>(null);

  const [locationForm, setLocationForm] = useState<LocationForm>({
    eyebrow: "",
    heading_primary: "",
    heading_accent: "",
    description: "",
    feature_labels: defaultFeatures(),
    landscape_image_url: null,
  });
  const [landscapeFile, setLandscapeFile] = useState<File | null>(null);
  const [locationSaving, setLocationSaving] = useState(false);

  const [reviews, setReviews] = useState<ReviewRow[]>([]);
  const [reviewModal, setReviewModal] = useState(false);
  const [reviewForm, setReviewForm] = useState<{
    id?: number;
    reviewer_name: string;
    location: string;
    display_title: string;
    sort_order: number;
  }>({
    reviewer_name: "",
    location: "",
    display_title: "",
    sort_order: 0,
  });
  const [thumbFile, setThumbFile] = useState<File | null>(null);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [reviewSaving, setReviewSaving] = useState(false);

  const loadBanners = useCallback(async () => {
    const res = await apiRequest<{ data: BannerRow[] }>(
      "/admin/home/banner-slides",
    );
    setBanners(res.data ?? []);
  }, []);

  const loadLocation = useCallback(async () => {
    const res = await apiRequest<{ data: LocationForm }>("/admin/home/location");
    const d = res.data;
    if (d) {
      setLocationForm({
        eyebrow: d.eyebrow ?? "",
        heading_primary: d.heading_primary ?? "",
        heading_accent: d.heading_accent ?? "",
        description: d.description ?? "",
        feature_labels:
          d.feature_labels?.length === 4
            ? d.feature_labels
            : defaultFeatures(),
        landscape_image_url: d.landscape_image_url ?? null,
      });
    }
  }, []);

  const loadReviews = useCallback(async () => {
    const res = await apiRequest<{ data: ReviewRow[] }>(
      "/admin/home/review-videos",
    );
    setReviews(res.data ?? []);
  }, []);

  const loadAll = useCallback(async () => {
    setLoading(true);
    try {
      await Promise.all([loadBanners(), loadLocation(), loadReviews()]);
    } catch (e) {
      const err = e as { message?: string };
      toast.error(err.message || "Could not load homepage content");
    } finally {
      setLoading(false);
    }
  }, [loadBanners, loadLocation, loadReviews]);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  const saveBanner = async () => {
    if (!bannerFile) {
      toast.error("Choose an image or video file");
      return;
    }
    const maxBytes =
      bannerType === "video" ? BANNER_VIDEO_MAX_BYTES : BANNER_IMAGE_MAX_BYTES;
    if (bannerFile.size > maxBytes) {
      toast.error(
        bannerType === "video"
          ? `Video must be under ${BANNER_VIDEO_MAX_BYTES / (1024 * 1024)} MB. Compress the file and try again.`
          : `Image must be under ${BANNER_IMAGE_MAX_BYTES / (1024 * 1024)} MB.`,
      );
      return;
    }
    setBannerSaving(true);
    try {
      const fd = new FormData();
      fd.append("media_type", bannerType);
      fd.append("file", bannerFile);
      fd.append("sort_order", String(bannerSort));
      const res = await apiUpload<{
        video_compression?: VideoCompressionInfo;
      }>("/admin/home/banner-slides", fd, "POST", {
        timeoutMs: bannerType === "video" ? 600_000 : 120_000,
      });
      await loadBanners();
      if (bannerType === "video") {
        if (res.video_compression) {
          setBannerVideoCompression(res.video_compression);
        }
        toast.success("Banner video uploaded");
      } else {
        toast.success("Banner slide added");
        setBannerModal(false);
        setBannerFile(null);
        setBannerVideoCompression(null);
      }
    } catch (e) {
      const err = e as { message?: string };
      toast.error(err.message || "Upload failed");
    } finally {
      setBannerSaving(false);
    }
  };

  const removeBanner = async (row: BannerRow) => {
    if (!window.confirm("Remove this banner slide from the homepage?")) return;
    try {
      await apiRequest(`/admin/home/banner-slides/${row.id}`, {
        method: "DELETE",
      });
      toast.success("Slide removed");
      await loadBanners();
    } catch (e) {
      const err = e as { message?: string };
      toast.error(err.message || "Delete failed");
    }
  };

  const saveLocation = async () => {
    setLocationSaving(true);
    try {
      const fd = new FormData();
      fd.append("eyebrow", locationForm.eyebrow.trim());
      fd.append("heading_primary", locationForm.heading_primary.trim());
      fd.append("heading_accent", locationForm.heading_accent.trim());
      fd.append("description", locationForm.description.trim());
      fd.append("feature_labels", JSON.stringify(locationForm.feature_labels));
      if (landscapeFile) {
        fd.append("landscape_image", landscapeFile);
      }
      await apiUpload("/admin/home/location", fd);
      toast.success("Location section saved");
      setLandscapeFile(null);
      await loadLocation();
    } catch (e) {
      const err = e as { message?: string };
      toast.error(err.message || "Save failed");
    } finally {
      setLocationSaving(false);
    }
  };

  const openReviewCreate = () => {
    setReviewForm({
      reviewer_name: "",
      location: "",
      display_title: "",
      sort_order: 0,
    });
    setThumbFile(null);
    setVideoFile(null);
    setReviewVideoCompression(null);
    setReviewModal(true);
  };

  const openReviewEdit = (row: ReviewRow) => {
    setReviewForm({
      id: row.id,
      reviewer_name: row.reviewer_name,
      location: row.location,
      display_title: row.display_title ?? "",
      sort_order: row.sort_order,
    });
    setThumbFile(null);
    setVideoFile(null);
    setReviewVideoCompression(null);
    setReviewModal(true);
  };

  const saveReview = async () => {
    if (!reviewForm.reviewer_name.trim() || !reviewForm.location.trim()) {
      toast.error("Reviewer name and location are required");
      return;
    }
    if (!reviewForm.id && !videoFile) {
      toast.error("Video file is required");
      return;
    }
    if (videoFile && videoFile.size > REVIEW_VIDEO_MAX_BYTES) {
      toast.error(
        `Video must be under ${REVIEW_VIDEO_MAX_BYTES / (1024 * 1024)} MB.`,
      );
      return;
    }
    setReviewSaving(true);
    try {
      const fd = new FormData();
      fd.append("reviewer_name", reviewForm.reviewer_name.trim());
      fd.append("location", reviewForm.location.trim());
      if (reviewForm.display_title.trim()) {
        fd.append("display_title", reviewForm.display_title.trim());
      }
      fd.append("sort_order", String(reviewForm.sort_order));
      if (thumbFile) fd.append("thumbnail", thumbFile);
      if (videoFile) fd.append("video", videoFile);

      const uploadOpts = videoFile
        ? { timeoutMs: 600_000 as const }
        : undefined;

      let compression: VideoCompressionInfo | undefined;
      if (reviewForm.id) {
        const res = await apiUpload<{ video_compression?: VideoCompressionInfo }>(
          `/admin/home/review-videos/${reviewForm.id}`,
          fd,
          "POST",
          uploadOpts,
        );
        compression = res.video_compression;
        toast.success("Review video updated");
      } else {
        const res = await apiUpload<{ video_compression?: VideoCompressionInfo }>(
          "/admin/home/review-videos",
          fd,
          "POST",
          uploadOpts,
        );
        compression = res.video_compression;
        toast.success("Review video added");
      }
      await loadReviews();
      if (videoFile && compression) {
        setReviewVideoCompression(compression);
      } else {
        setReviewModal(false);
        setReviewVideoCompression(null);
      }
    } catch (e) {
      const err = e as { message?: string };
      toast.error(err.message || "Save failed");
    } finally {
      setReviewSaving(false);
    }
  };

  const removeReview = async (row: ReviewRow) => {
    if (!window.confirm(`Remove video from ${row.reviewer_name}?`)) return;
    try {
      await apiRequest(`/admin/home/review-videos/${row.id}`, {
        method: "DELETE",
      });
      toast.success("Removed");
      await loadReviews();
    } catch (e) {
      const err = e as { message?: string };
      toast.error(err.message || "Delete failed");
    }
  };

  if (loading) {
    return (
      <p className="text-sm admin-card-muted p-6">Loading homepage content…</p>
    );
  }

  return (
    <div className="max-w-5xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold admin-page-title">Homepage</h1>
        <p className="text-sm admin-card-muted mt-1">
          Manage banner slides, the location section, and guest review videos.
          Images are stored as WebP; videos are compressed when ffmpeg is
          available on the server.
        </p>
      </div>

      <div className="flex flex-wrap gap-2 border-b border-[#EDE4D8] pb-1">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={`rounded-t-lg px-4 py-2 text-sm font-medium transition-colors ${
              tab === t.id
                ? "bg-[#FAF7F2] text-[#3d4a22] border border-[#EDE4D8] border-b-[#FAF7F2] -mb-px"
                : "text-[#6E655C] hover:text-[#332C26]"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "banner" ? (
        <section className="space-y-4">
          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => {
                setBannerType("image");
                setBannerSort(banners.length * 10);
                setBannerFile(null);
                setBannerVideoCompression(null);
                setBannerModal(true);
              }}
              className="inline-flex items-center gap-2 rounded-xl admin-btn-gold px-4 py-2 text-sm font-semibold"
            >
              <Plus className="h-4 w-4" />
              Add slide
            </button>
          </div>
          <div className="admin-card overflow-hidden rounded-2xl">
            {banners.length === 0 ? (
              <p className="p-6 text-sm admin-card-muted">
                No banner slides yet. Add images or videos for the hero
                carousel.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="border-b border-[#EDE4D8] bg-[#FAF7F2]/80 text-left text-xs uppercase tracking-wide text-[#6E655C]">
                    <tr>
                      <th className="px-4 py-3">Preview</th>
                      <th className="px-4 py-3">Type</th>
                      <th className="px-4 py-3">Order</th>
                      <th className="px-4 py-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {banners.map((row) => (
                      <tr
                        key={row.id}
                        className="border-b border-[#EDE4D8]/60 last:border-0"
                      >
                        <td className="px-4 py-3">
                          {row.media_type === "image" ? (
                            <img
                              src={resolveMediaUrl(row.url) ?? row.url}
                              alt=""
                              className="h-14 w-28 rounded-lg object-cover"
                            />
                          ) : (
                            <video
                              src={resolveMediaUrl(row.url) ?? row.url}
                              className="h-14 w-28 rounded-lg object-cover"
                              muted
                              playsInline
                            />
                          )}
                        </td>
                        <td className="px-4 py-3 capitalize">{row.media_type}</td>
                        <td className="px-4 py-3">{row.sort_order}</td>
                        <td className="px-4 py-3 text-right">
                          <button
                            type="button"
                            onClick={() => removeBanner(row)}
                            className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4" />
                            Remove
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </section>
      ) : null}

      {tab === "location" ? (
        <section className="admin-card rounded-2xl rounded-tl-none p-6 space-y-4">
          <h2 className="text-lg font-semibold text-[#332C26]">
            Our location section
          </h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block sm:col-span-2">
              <span className="text-xs font-medium text-[#6E655C]">Eyebrow</span>
              <input
                className="admin-input mt-1 w-full rounded-xl px-4 py-2.5"
                value={locationForm.eyebrow}
                onChange={(e) =>
                  setLocationForm((f) => ({ ...f, eyebrow: e.target.value }))
                }
              />
            </label>
            <label className="block">
              <span className="text-xs font-medium text-[#6E655C]">
                Heading line 1
              </span>
              <input
                className="admin-input mt-1 w-full rounded-xl px-4 py-2.5"
                value={locationForm.heading_primary}
                onChange={(e) =>
                  setLocationForm((f) => ({
                    ...f,
                    heading_primary: e.target.value,
                  }))
                }
              />
            </label>
            <label className="block">
              <span className="text-xs font-medium text-[#6E655C]">
                Heading accent (italic)
              </span>
              <input
                className="admin-input mt-1 w-full rounded-xl px-4 py-2.5"
                value={locationForm.heading_accent}
                onChange={(e) =>
                  setLocationForm((f) => ({
                    ...f,
                    heading_accent: e.target.value,
                  }))
                }
              />
            </label>
            <label className="block sm:col-span-2">
              <span className="text-xs font-medium text-[#6E655C]">
                Description
              </span>
              <textarea
                className="admin-input mt-1 w-full min-h-[100px] rounded-xl px-4 py-3 text-sm"
                value={locationForm.description}
                onChange={(e) =>
                  setLocationForm((f) => ({
                    ...f,
                    description: e.target.value,
                  }))
                }
              />
            </label>
          </div>
          <div>
            <p className="text-xs font-medium text-[#6E655C] mb-2">
              Feature labels (4 icons)
            </p>
            <div className="grid gap-3 sm:grid-cols-2">
              {locationForm.feature_labels.map((feat, idx) => (
                <div
                  key={idx}
                  className="flex gap-2 rounded-xl border border-[#EDE4D8] p-3"
                >
                  <input
                    className="admin-input flex-1 rounded-lg px-3 py-2 text-sm"
                    placeholder="Line 1"
                    value={feat.line1}
                    onChange={(e) => {
                      const next = [...locationForm.feature_labels];
                      next[idx] = { ...next[idx], line1: e.target.value };
                      setLocationForm((f) => ({
                        ...f,
                        feature_labels: next,
                      }));
                    }}
                  />
                  <input
                    className="admin-input flex-1 rounded-lg px-3 py-2 text-sm"
                    placeholder="Line 2"
                    value={feat.line2}
                    onChange={(e) => {
                      const next = [...locationForm.feature_labels];
                      next[idx] = { ...next[idx], line2: e.target.value };
                      setLocationForm((f) => ({
                        ...f,
                        feature_labels: next,
                      }));
                    }}
                  />
                </div>
              ))}
            </div>
          </div>
          <div>
            <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-[#6E655C]">
              Landscape photo
            </p>
            <FileUploadZone
              variant="image"
              title="Location section image"
              hint="Wide landscape — converted to WebP on upload"
              optional
              file={landscapeFile}
              existingPreviewUrl={locationForm.landscape_image_url}
              onFileChange={setLandscapeFile}
            />
          </div>
          <button
            type="button"
            disabled={locationSaving}
            onClick={saveLocation}
            className="rounded-xl admin-btn-gold px-5 py-2.5 text-sm font-semibold disabled:opacity-60"
          >
            {locationSaving ? "Saving…" : "Save location section"}
          </button>
        </section>
      ) : null}

      {tab === "testimonials" ? (
        <section className="admin-card rounded-2xl rounded-tl-none p-6">
          <p className="text-sm text-[#332C26]">
            The <strong>Real people. Real moments</strong> carousel uses the
            built-in testimonials on the site. No admin changes are needed for
            this section right now.
          </p>
        </section>
      ) : null}

      {tab === "memories" ? (
        <section className="space-y-4">
          <div className="flex justify-end">
            <button
              type="button"
              onClick={openReviewCreate}
              className="inline-flex items-center gap-2 rounded-xl admin-btn-gold px-4 py-2 text-sm font-semibold"
            >
              <Plus className="h-4 w-4" />
              Add review video
            </button>
          </div>
          <div className="admin-card overflow-hidden rounded-2xl">
            {reviews.length === 0 ? (
              <p className="p-6 text-sm admin-card-muted">
                No review videos yet. Upload a thumbnail, video, reviewer name,
                and location.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="border-b border-[#EDE4D8] bg-[#FAF7F2]/80 text-left text-xs uppercase tracking-wide text-[#6E655C]">
                    <tr>
                      <th className="px-4 py-3">Thumb</th>
                      <th className="px-4 py-3">Reviewer</th>
                      <th className="px-4 py-3">Location</th>
                      <th className="px-4 py-3">Order</th>
                      <th className="px-4 py-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reviews.map((row) => (
                      <tr
                        key={row.id}
                        className="border-b border-[#EDE4D8]/60 last:border-0"
                      >
                        <td className="px-4 py-3">
                          {row.thumbnail_url ? (
                            <img
                              src={row.thumbnail_url}
                              alt=""
                              className="h-14 w-20 rounded-lg object-cover"
                            />
                          ) : (
                            "—"
                          )}
                        </td>
                        <td className="px-4 py-3">{row.reviewer_name}</td>
                        <td className="px-4 py-3">{row.location}</td>
                        <td className="px-4 py-3">{row.sort_order}</td>
                        <td className="px-4 py-3 text-right space-x-2">
                          <button
                            type="button"
                            onClick={() => openReviewEdit(row)}
                            className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-[#3d4a22] hover:bg-[#FAF7F2]"
                          >
                            <Pencil className="h-4 w-4" />
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => removeReview(row)}
                            className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4" />
                            Remove
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </section>
      ) : null}

      {bannerModal ? (
        <FormModal
          title="Add banner slide"
          onClose={() => {
            setBannerModal(false);
            setBannerFile(null);
            setBannerVideoCompression(null);
          }}
          onSave={
            bannerVideoCompression
              ? () => {
                  setBannerModal(false);
                  setBannerFile(null);
                  setBannerVideoCompression(null);
                }
              : saveBanner
          }
          saving={bannerSaving}
          saveLabel={bannerVideoCompression ? "Done" : "Upload slide"}
        >
          <Field label="Slide type">
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => {
                  setBannerType("image");
                  setBannerFile(null);
                  setBannerVideoCompression(null);
                }}
                className={`flex flex-1 items-center justify-center gap-2 rounded-xl border px-4 py-3 text-sm font-medium transition-colors ${
                  bannerType === "image"
                    ? "border-[#68704D] bg-[#68704D]/10 text-[#3d4a22]"
                    : "border-[#EDE4D8] bg-white text-[#6E655C] hover:border-[#cfc5b8]"
                }`}
              >
                <ImageIcon className="h-4 w-4" />
                Image
              </button>
              <button
                type="button"
                onClick={() => {
                  setBannerType("video");
                  setBannerFile(null);
                  setBannerVideoCompression(null);
                }}
                className={`flex flex-1 items-center justify-center gap-2 rounded-xl border px-4 py-3 text-sm font-medium transition-colors ${
                  bannerType === "video"
                    ? "border-[#4a5568] bg-[#4a5568]/10 text-[#2d3748]"
                    : "border-[#EDE4D8] bg-white text-[#6E655C] hover:border-[#cfc5b8]"
                }`}
              >
                <Film className="h-4 w-4" />
                Video
              </button>
            </div>
          </Field>
          <FileUploadZone
            variant={bannerType === "image" ? "image" : "video"}
            title={
              bannerType === "image" ? "Hero banner image" : "Hero banner video"
            }
            hint={
              bannerType === "image"
                ? "PNG/JPG — saved as WebP"
                : "MP4/MOV up to 500 MB. Videos 100 MB+ are compressed on the server (requires ffmpeg). Large uploads may take several minutes."
            }
            file={bannerFile}
            onFileChange={(f) => {
              setBannerFile(f);
              setBannerVideoCompression(null);
            }}
          />
          {bannerType === "video" && bannerVideoCompression ? (
            <VideoCompressionPanel info={bannerVideoCompression} />
          ) : null}
          <Field label="Sort order (lower shows first)">
            <input
              type="number"
              min={0}
              className="admin-input w-full rounded-xl px-4 py-2.5"
              value={bannerSort}
              onChange={(e) =>
                setBannerSort(parseInt(e.target.value, 10) || 0)
              }
            />
          </Field>
        </FormModal>
      ) : null}

      {reviewModal ? (
        <FormModal
          title={reviewForm.id ? "Edit review video" : "Add review video"}
          onClose={() => {
            setReviewModal(false);
            setReviewVideoCompression(null);
          }}
          onSave={
            reviewVideoCompression
              ? () => {
                  setReviewModal(false);
                  setReviewVideoCompression(null);
                }
              : saveReview
          }
          saving={reviewSaving}
          saveLabel={reviewVideoCompression ? "Done" : "Save"}
          wide
        >
          <p className="text-xs text-[#6E655C] -mt-2 mb-1">
            Shown on the homepage under{" "}
            <span className="font-medium text-[#332C26]">
              Memories made at Paciano
            </span>
            . Upload a cover image and the clip guests will play in a popup.
          </p>

          <FormSection title="Shown on the site">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Reviewer name *">
                <input
                  className="admin-input w-full rounded-xl px-4 py-2.5"
                  placeholder="e.g. Amar Banerjee"
                  value={reviewForm.reviewer_name}
                  onChange={(e) =>
                    setReviewForm((f) => ({
                      ...f,
                      reviewer_name: e.target.value,
                    }))
                  }
                />
              </Field>
              <Field label="Location *">
                <input
                  className="admin-input w-full rounded-xl px-4 py-2.5"
                  placeholder="e.g. Siliguri, India"
                  value={reviewForm.location}
                  onChange={(e) =>
                    setReviewForm((f) => ({ ...f, location: e.target.value }))
                  }
                />
              </Field>
            </div>
            <Field label="Optional card title (defaults to reviewer name)">
              <input
                className="admin-input w-full rounded-xl px-4 py-2.5"
                placeholder="Leave blank to use reviewer name"
                value={reviewForm.display_title}
                onChange={(e) =>
                  setReviewForm((f) => ({
                    ...f,
                    display_title: e.target.value,
                  }))
                }
              />
            </Field>
            <Field label="Sort order">
              <input
                type="number"
                min={0}
                className="admin-input w-full max-w-[140px] rounded-xl px-4 py-2.5"
                value={reviewForm.sort_order}
                onChange={(e) =>
                  setReviewForm((f) => ({
                    ...f,
                    sort_order: parseInt(e.target.value, 10) || 0,
                  }))
                }
              />
            </Field>
          </FormSection>

          <FormSection title="Upload files">
            <div className="grid gap-4 sm:grid-cols-2">
              <FileUploadZone
                variant="image"
                title="Thumbnail"
                hint="Optional — first video frame is used if empty"
                optional
                file={thumbFile}
                existingPreviewUrl={
                  reviewForm.id
                    ? reviews.find((r) => r.id === reviewForm.id)
                        ?.thumbnail_url ?? null
                    : null
                }
                onFileChange={setThumbFile}
              />
              <FileUploadZone
                variant="video"
                title="Video file"
                hint="Up to 500 MB. Files 100 MB+ are compressed on upload when ffmpeg is available."
                required={!reviewForm.id}
                optional={!!reviewForm.id}
                file={videoFile}
                onFileChange={(f) => {
                  setVideoFile(f);
                  setReviewVideoCompression(null);
                }}
              />
            </div>
            {reviewVideoCompression ? (
              <VideoCompressionPanel info={reviewVideoCompression} />
            ) : null}
          </FormSection>
        </FormModal>
      ) : null}
    </div>
  );
}

function Field({
  label,
  children,
  className = "",
}: {
  label: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={className}>
      <label className="mb-1.5 block text-xs font-medium text-[#6E655C]">
        {label}
      </label>
      {children}
    </div>
  );
}

function FormSection({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <div className="space-y-4 rounded-xl border border-[#EDE4D8] bg-[#FAF7F2]/50 p-4">
      <h4 className="text-xs font-semibold uppercase tracking-wide text-[#68704D]">
        {title}
      </h4>
      <div className="space-y-4">{children}</div>
    </div>
  );
}

function FormModal({
  title,
  children,
  onClose,
  onSave,
  saving,
  saveLabel = "Save",
  wide = false,
}: {
  title: string;
  children: ReactNode;
  onClose: () => void;
  onSave: () => void;
  saving: boolean;
  saveLabel?: string;
  wide?: boolean;
}) {
  return (
    <div
      className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center bg-black/45 p-4"
      onClick={onClose}
    >
      <div
        className={`admin-card max-h-[92vh] w-full overflow-y-auto rounded-2xl p-6 shadow-xl ${
          wide ? "max-w-2xl" : "max-w-lg"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-6 flex items-start justify-between gap-4">
          <h2 className="text-lg font-semibold admin-page-title">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1 text-[#6E655C] hover:bg-[#EDE4D8]/60 hover:text-[#332C26]"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="space-y-5">{children}</div>
        <div className="mt-8 flex justify-end gap-3 border-t border-[#EDE4D8] pt-6">
          <button
            type="button"
            className="rounded-xl px-4 py-2.5 text-sm font-medium text-[#6E655C] hover:bg-[#FAF7F2]"
            onClick={onClose}
            disabled={saving}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onSave}
            disabled={saving}
            className="rounded-xl admin-btn-gold px-6 py-2.5 text-sm font-semibold disabled:opacity-60"
          >
            {saving ? "Saving…" : saveLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

function VideoCompressionPanel({ info }: { info: VideoCompressionInfo }) {
  if (!info.applied) {
    return (
      <div className="rounded-xl border border-amber-200 bg-amber-50/90 px-4 py-3 text-sm text-amber-950">
        <p className="font-medium">Uploaded without server compression</p>
        <p className="mt-1 text-xs text-amber-900/90">
          Final size: {formatFileSize(info.stored_bytes)}. Install ffmpeg on
          the server to compress large videos automatically.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-[#68704D]/30 bg-[#68704D]/[0.08] px-4 py-3 text-sm text-[#2d3a1f]">
      <p className="font-semibold text-[#3d4a22]">Video compressed on upload</p>
      <ul className="mt-2 space-y-1 text-xs text-[#4a5644]">
        <li>
          Original:{" "}
          <span className="font-medium">{formatFileSize(info.original_bytes)}</span>
        </li>
        <li>
          Stored on site:{" "}
          <span className="font-medium">{formatFileSize(info.stored_bytes)}</span>
        </li>
        <li>
          Size reduced by:{" "}
          <span className="font-semibold text-[#3d4a22]">
            {info.saved_percent}%
          </span>
        </li>
      </ul>
    </div>
  );
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function FileUploadZone({
  variant,
  title,
  hint,
  file,
  onFileChange,
  required,
  optional,
  existingPreviewUrl,
}: {
  variant: "image" | "video";
  title: string;
  hint: string;
  file: File | null;
  onFileChange: (file: File | null) => void;
  required?: boolean;
  optional?: boolean;
  existingPreviewUrl?: string | null;
}) {
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);

  useEffect(() => {
    if (!file || variant !== "image") {
      setPreview(null);
      return;
    }
    const url = URL.createObjectURL(file);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [file, variant]);

  const isImage = variant === "image";
  const borderAccent = isImage
    ? "border-[#68704D]/40 hover:border-[#68704D] focus-within:border-[#68704D] focus-within:ring-[#68704D]/20"
    : "border-[#4a5568]/40 hover:border-[#4a5568] focus-within:border-[#4a5568] focus-within:ring-[#4a5568]/20";
  const bgAccent = isImage ? "bg-[#68704D]/[0.06]" : "bg-[#4a5568]/[0.06]";
  const iconBg = isImage ? "bg-[#68704D]/15 text-[#3d4a22]" : "bg-[#4a5568]/15 text-[#2d3748]";

  const displayPreview =
    preview ?? (existingPreviewUrl && !file ? existingPreviewUrl : null);

  return (
    <div className="flex h-full flex-col">
      <div className="mb-2 flex items-center gap-2">
        <span
          className={`inline-flex h-8 w-8 items-center justify-center rounded-lg ${iconBg}`}
        >
          {isImage ? (
            <ImageIcon className="h-4 w-4" aria-hidden />
          ) : (
            <Film className="h-4 w-4" aria-hidden />
          )}
        </span>
        <div>
          <p className="text-sm font-semibold text-[#332C26]">
            {title}
            {required ? (
              <span className="ml-1 text-[#68704D]">*</span>
            ) : null}
            {optional ? (
              <span className="ml-2 text-xs font-normal text-[#6E655C]">
                (optional — keep current if empty)
              </span>
            ) : null}
          </p>
          <p className="text-[11px] text-[#6E655C]">{hint}</p>
        </div>
      </div>

      <div
        className={`relative flex min-h-[148px] flex-1 flex-col overflow-hidden rounded-xl border-2 border-dashed transition-all focus-within:ring-2 ${borderAccent} ${bgAccent}`}
      >
        {displayPreview && isImage ? (
          <div className="relative h-28 w-full shrink-0 border-b border-[#EDE4D8]/80">
            <img
              src={displayPreview}
              alt=""
              className="h-full w-full object-cover"
            />
          </div>
        ) : null}

        <label
          htmlFor={inputId}
          className="flex flex-1 cursor-pointer flex-col items-center justify-center gap-2 px-4 py-5 text-center"
        >
          <Upload className="h-6 w-6 text-[#8A8177]" aria-hidden />
          <span className="text-sm font-medium text-[#332C26]">
            {file ? "Change file" : "Click to choose file"}
          </span>
          <span className="text-[11px] text-[#6E655C]">
            {isImage ? "JPEG, PNG, WebP" : "MP4, MOV, WebM"}
          </span>
        </label>

        <input
          ref={inputRef}
          id={inputId}
          type="file"
          accept={isImage ? "image/*" : "video/*"}
          className="sr-only"
          onChange={(e) => onFileChange(e.target.files?.[0] ?? null)}
        />
      </div>

      {file ? (
        <div className="mt-2 flex items-center justify-between gap-2 rounded-lg bg-white/80 px-3 py-2 text-xs ring-1 ring-[#EDE4D8]">
          <span className="truncate font-medium text-[#332C26]">
            {file.name}
          </span>
          <span className="shrink-0 text-[#6E655C]">
            {formatFileSize(file.size)}
          </span>
          <button
            type="button"
            className="shrink-0 rounded p-0.5 text-[#6E655C] hover:bg-[#EDE4D8]/60 hover:text-red-700"
            aria-label="Remove selected file"
            onClick={() => {
              onFileChange(null);
              if (inputRef.current) inputRef.current.value = "";
            }}
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      ) : null}

      {!file && variant === "video" && existingPreviewUrl ? (
        <p className="mt-2 text-[11px] text-[#6E655C]">
          Current video is saved on the server. Upload a new file only if you
          want to replace it.
        </p>
      ) : null}
    </div>
  );
}
