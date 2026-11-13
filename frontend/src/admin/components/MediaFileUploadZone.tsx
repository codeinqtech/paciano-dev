import {
  Film,
  ImageIcon,
  Upload,
  X,
  Crop,
} from "lucide-react";
import {
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from "react";
import { toast } from "sonner";
import { resolveMediaUrl } from "@/utils/resolveMediaUrl";
import { rejectOversizedUpload } from "../constants/mediaUploadLimits";
import ImageCropper from "@/components/common/media/ImageCropper";

export type VideoCompressionInfo = {
  applied: boolean;
  original_bytes: number;
  stored_bytes: number;
  saved_percent: number;
};

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;

  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function VideoCompressionPanel({
  info,
}: {
  info: VideoCompressionInfo;
}) {
  if (!info.applied) {
    return (
      <div className="rounded-xl border border-amber-200 bg-amber-50/90 px-4 py-3 text-sm text-amber-950">
        <p className="font-medium">
          Uploaded without server compression
        </p>

        <p className="mt-1 text-xs text-amber-900/90">
          Final size: {formatFileSize(info.stored_bytes)}.
          Install ffmpeg on the server to compress videos automatically.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-[#68704D]/30 bg-[#68704D]/[0.08] px-4 py-3 text-sm text-[#2d3a1f]">
      <p className="font-semibold text-[#3d4a22]">
        Video compressed on upload
      </p>

      <ul className="mt-2 space-y-1 text-xs text-[#4a5644]">
        <li>
          Original:{" "}
          <span className="font-medium">
            {formatFileSize(info.original_bytes)}
          </span>
        </li>

        <li>
          Stored on site:{" "}
          <span className="font-medium">
            {formatFileSize(info.stored_bytes)}
          </span>
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

export type MediaFileUploadZoneProps = {
  variant: "image" | "video";
  title: string;
  hint: string;
  file: File | null;
  onFileChange: (file: File | null) => void;
  required?: boolean;
  optional?: boolean;
  existingPreviewUrl?: string | null;
  accept?: string;
};

export function MediaFileUploadZone({
  variant,
  title,
  hint,
  file,
  onFileChange,
  required,
  optional,
  existingPreviewUrl,
  accept,
}: MediaFileUploadZoneProps) {
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);

  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [videoPreview, setVideoPreview] = useState<string | null>(null);
  const [isCropperOpen, setIsCropperOpen] = useState(false);

  const resolvedExisting = useMemo(() => {
    if (!existingPreviewUrl) return null;

    return resolveMediaUrl(existingPreviewUrl) ?? existingPreviewUrl;
  }, [existingPreviewUrl]);

  // Generate local image preview
  useEffect(() => {
    if (!file || variant !== "image") {
      setImagePreview(null);
      return;
    }

    const url = URL.createObjectURL(file);
    setImagePreview(url);

    return () => URL.revokeObjectURL(url);
  }, [file, variant]);

  // Generate local video preview
  useEffect(() => {
    if (!file || variant !== "video") {
      setVideoPreview(null);
      return;
    }

    const url = URL.createObjectURL(file);
    setVideoPreview(url);

    return () => URL.revokeObjectURL(url);
  }, [file, variant]);

  const isImage = variant === "image";

  const borderAccent = isImage
    ? "border-[#68704D]/40 hover:border-[#68704D] focus-within:border-[#68704D] focus-within:ring-[#68704D]/20"
    : "border-[#4a5568]/40 hover:border-[#4a5568] focus-within:border-[#4a5568] focus-within:ring-[#4a5568]/20";

  const bgAccent = isImage
    ? "bg-[#68704D]/[0.06]"
    : "bg-[#4a5568]/[0.06]";

  const iconBg = isImage
    ? "bg-[#68704D]/15 text-[#3d4a22]"
    : "bg-[#4a5568]/15 text-[#2d3748]";

  const displayImagePreview =
    imagePreview ?? (resolvedExisting && !file ? resolvedExisting : null);

  const displayVideoPreview =
    videoPreview ?? (resolvedExisting && !file ? resolvedExisting : null);

  const defaultAccept = isImage ? "image/*" : "video/*";

  // Select image or video
  const handleFileSelect = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const next = event.target.files?.[0] ?? null;

    if (next) {
      const error = rejectOversizedUpload(
        next,
        isImage ? "image" : "video"
      );

      if (error) {
        toast.error(error);
        event.target.value = "";
        return;
      }

      onFileChange(next);
    }

    // Allows selecting the same file again
    event.target.value = "";
  };

  // Remove selected file
  const handleRemoveFile = () => {
    onFileChange(null);
    setIsCropperOpen(false);

    if (inputRef.current) {
      inputRef.current.value = "";
    }
  };

  // Apply cropped image
  const handleCropComplete = (croppedFile: File) => {
    const error = rejectOversizedUpload(croppedFile, "image");

    if (error) {
      toast.error(error);
      return;
    }

    onFileChange(croppedFile);
    setIsCropperOpen(false);

    if (inputRef.current) {
      inputRef.current.value = "";
    }

    toast.success("Image cropped successfully.");
  };

  return (
    <div className="mb-1 flex flex-col">
      {/* Upload title */}
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

            {required && (
              <span className="ml-1 text-[#68704D]">*</span>
            )}

            {optional && (
              <span className="ml-2 text-xs font-normal text-[#6E655C]">
                (optional — keep current if empty)
              </span>
            )}
          </p>

          <p className="text-[11px] text-[#6E655C]">
            {hint}
          </p>
        </div>
      </div>

      {/* Upload container */}
      <div
        className={`relative flex min-h-[148px] flex-col overflow-hidden rounded-xl border-2 border-dashed transition-all focus-within:ring-2 ${borderAccent} ${bgAccent}`}
      >
        {/* Image preview */}
        {displayImagePreview && isImage && (
          <div className="w-full h-[220px] overflow-hidden bg-white flex items-center justify-center">
            <img
              src={displayImagePreview}
              alt={`${title} preview`}
              className="w-full h-full object-cover"
            />

            {/* Remove selected image */}
            {file && (
              <button
                type="button"
                onClick={handleRemoveFile}
                title="Remove image"
                aria-label="Remove selected image"
                className="absolute right-3 top-3 z-10 flex h-10 w-10 items-center justify-center rounded-full border-2 border-white bg-red-600 text-white shadow-lg transition hover:scale-105 hover:bg-red-700 focus:outline-none focus:ring-4 focus:ring-red-300"
              >
                <X className="h-6 w-6 stroke-[3]" />
              </button>
            )}
          </div>
        )}

        {/* Video preview */}
        {displayVideoPreview && !isImage && (
          <div className="relative h-28 w-full shrink-0 border-b border-[#EDE4D8]/80 bg-black/80">
            <video
              src={displayVideoPreview}
              className="h-full w-full object-cover"
              muted
              playsInline
              preload="metadata"
            />
          </div>
        )}

        {/* Image upload actions */}
        {isImage ? (
          <div className="flex flex-wrap items-center gap-3 px-4 py-4">
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="inline-flex items-center gap-2 rounded-lg bg-[#68704D] px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#53603B] focus:outline-none focus:ring-2 focus:ring-[#68704D]/30 focus:ring-offset-2"
            >
              <Upload className="h-4 w-4" />

              {displayImagePreview ? "Change Image" : "Upload Image"}
            </button>

            {/* Crop button: only when a new image is selected */}
            {file && imagePreview && (
              <button
                type="button"
                onClick={() => setIsCropperOpen(true)}
                className="inline-flex items-center gap-2 rounded-lg border border-[#68704D] bg-white px-5 py-3 text-sm font-semibold text-[#68704D] transition hover:bg-[#68704D]/10 focus:outline-none focus:ring-2 focus:ring-[#68704D]/20"
              >
                <Crop className="h-4 w-4" />
                Crop Image
              </button>
            )}

            {file ? (
              <div className="min-w-0">
                <p className="max-w-[260px] truncate text-xs font-medium text-[#332C26]">
                  {file.name}
                </p>

                <p className="text-[11px] text-[#6E655C]">
                  {formatFileSize(file.size)}
                </p>
              </div>
            ) : (
              <span className="text-xs text-[#6E655C]">
                {resolvedExisting
                  ? "Current saved image"
                  : "JPEG, PNG or WebP"}
              </span>
            )}
          </div>
        ) : (
          /* Video upload action */
          <label
            htmlFor={inputId}
            className="flex cursor-pointer flex-col items-center justify-center gap-2 px-4 py-5 text-center"
          >
            <Upload className="h-6 w-6 text-[#8A8177]" aria-hidden />

            <span className="text-sm font-medium text-[#332C26]">
              {file ? "Change file" : "Click to choose file"}
            </span>

            <span className="text-[11px] text-[#6E655C]">
              MP4, MOV, WebM
            </span>
          </label>
        )}

        {/* Hidden input */}
        <input
          ref={inputRef}
          id={inputId}
          type="file"
          accept={accept ?? defaultAccept}
          className="sr-only"
          onChange={handleFileSelect}
        />
      </div>

      {/* Selected video file information */}
      {file && !isImage && (
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
            onClick={handleRemoveFile}
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      {/* Existing video information */}
      {!file && variant === "video" && resolvedExisting && (
        <p className="mt-2 text-[11px] text-[#6E655C]">
          Current video is saved on the server. Upload a new file only if you
          want to replace it.
        </p>
      )}

      {/* Existing image information */}
      {!file && variant === "image" && resolvedExisting && (
        <p className="mt-2 text-[11px] text-[#6E655C]">
          Current image is on the server. Choose a new file to replace it.
        </p>
      )}

      {/* Common image cropper modal */}
      {isCropperOpen && imagePreview && isImage && (
        <ImageCropper
          image={imagePreview}
          onCancel={() => setIsCropperOpen(false)}
          onCropComplete={handleCropComplete}
        />
      )}
    </div>
  );
}

const DEFAULT_IMAGE_HINT =
  "PNG/JPG/WebP, max 2 MB — saved as WebP on the server";

export function AdminImageUpload({
  title,
  hint = DEFAULT_IMAGE_HINT,
  file,
  onFileChange,
  existingUrl,
  optional,
  required,
}: {
  title: string;
  hint?: string;
  file: File | null;
  onFileChange: (file: File | null) => void;
  existingUrl?: string | null;
  optional?: boolean;
  required?: boolean;
}) {
  return (
    <MediaFileUploadZone
      variant="image"
      title={title}
      hint={hint}
      file={file}
      onFileChange={onFileChange}
      existingPreviewUrl={existingUrl}
      optional={optional}
      required={required}
    />
  );
}

export function AdminVideoUpload({
  title,
  hint,
  file,
  onFileChange,
  existingUrl,
  optional,
  required,
}: {
  title: string;
  hint: string;
  file: File | null;
  onFileChange: (file: File | null) => void;
  existingUrl?: string | null;
  optional?: boolean;
  required?: boolean;
}) {
  return (
    <MediaFileUploadZone
      variant="video"
      title={title}
      hint={hint}
      file={file}
      onFileChange={onFileChange}
      existingPreviewUrl={existingUrl}
      optional={optional}
      required={required}
    />
  );
}
