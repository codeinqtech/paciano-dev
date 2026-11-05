export const IMAGE_UPLOAD_MAX_BYTES = 5 * 1024 * 1024;
export const VIDEO_UPLOAD_MAX_BYTES = 50 * 1024 * 1024;

export const IMAGE_UPLOAD_MAX_MB = 5;
export const VIDEO_UPLOAD_MAX_MB = 50;

export function rejectOversizedUpload(
  file: File,
  kind: "image" | "video",
): string | null {
  const max =
    kind === "video" ? VIDEO_UPLOAD_MAX_BYTES : IMAGE_UPLOAD_MAX_BYTES;
  const label = kind === "video" ? VIDEO_UPLOAD_MAX_MB : IMAGE_UPLOAD_MAX_MB;
  if (file.size > max) {
    return `${kind === "video" ? "Video" : "Image"} must be ${label} MB or less before upload.`;
  }
  return null;
}
