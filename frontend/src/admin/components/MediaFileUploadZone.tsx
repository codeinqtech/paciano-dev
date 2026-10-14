import { Film, ImageIcon, Upload, X } from "lucide-react";
import { useEffect, useId, useMemo, useRef, useState } from "react";
import { resolveMediaUrl } from "@/utils/resolveMediaUrl";

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

export function VideoCompressionPanel({ info }: { info: VideoCompressionInfo }) {
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
  /** Saved media URL from API (relative or absolute). */
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

  const resolvedExisting = useMemo(() => {
    if (!existingPreviewUrl) return null;
    return resolveMediaUrl(existingPreviewUrl) ?? existingPreviewUrl;
  }, [existingPreviewUrl]);

  useEffect(() => {
    if (!file || variant !== "image") {
      setImagePreview(null);
      return;
    }
    const url = URL.createObjectURL(file);
    setImagePreview(url);
    return () => URL.revokeObjectURL(url);
  }, [file, variant]);

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
  const bgAccent = isImage ? "bg-[#68704D]/[0.06]" : "bg-[#4a5568]/[0.06]";
  const iconBg = isImage
    ? "bg-[#68704D]/15 text-[#3d4a22]"
    : "bg-[#4a5568]/15 text-[#2d3748]";

  const displayImagePreview =
    imagePreview ?? (resolvedExisting && !file ? resolvedExisting : null);
  const displayVideoPreview =
    videoPreview ?? (resolvedExisting && !file ? resolvedExisting : null);

  const defaultAccept = isImage ? "image/*" : "video/*";

  return (
    <div className="mb-1 flex flex-col">
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
        className={`relative flex min-h-[148px] flex-col overflow-hidden rounded-xl border-2 border-dashed transition-all focus-within:ring-2 ${borderAccent} ${bgAccent}`}
      >
        {displayImagePreview && isImage ? (
          <div className="relative h-28 w-full shrink-0 border-b border-[#EDE4D8]/80">
            <img
              src={displayImagePreview}
              alt=""
              className="h-full w-full object-cover"
            />
          </div>
        ) : null}

        {displayVideoPreview && !isImage ? (
          <div className="relative h-28 w-full shrink-0 border-b border-[#EDE4D8]/80 bg-black/80">
            <video
              src={displayVideoPreview}
              className="h-full w-full object-cover"
              muted
              playsInline
              preload="metadata"
            />
          </div>
        ) : null}

        <label
          htmlFor={inputId}
          className="flex cursor-pointer flex-col items-center justify-center gap-2 px-4 py-5 text-center"
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
          accept={accept ?? defaultAccept}
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

      {!file && variant === "video" && resolvedExisting ? (
        <p className="mt-2 text-[11px] text-[#6E655C]">
          Current video is saved on the server. Upload a new file only if you
          want to replace it.
        </p>
      ) : null}

      {!file && variant === "image" && resolvedExisting ? (
        <p className="mt-2 text-[11px] text-[#6E655C]">
          Current image is on the server. Choose a new file to replace it.
        </p>
      ) : null}
    </div>
  );
}

const DEFAULT_IMAGE_HINT = "PNG/JPG — saved as WebP on upload";

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
