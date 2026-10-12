/** Public uploads are served from Laravel `public/` (not the Vite `/api` prefix). */
export function resolveMediaUrl(
  url: string | null | undefined,
): string | undefined {
  if (!url) {
    return undefined;
  }
  if (/^https?:\/\//i.test(url)) {
    return url;
  }

  const base = (
    import.meta.env.VITE_MEDIA_URL?.trim() ||
    import.meta.env.VITE_BACKEND_URL?.trim() ||
    import.meta.env.VITE_API_URL?.trim().replace(/\/api\/?$/i, "") ||
    "http://127.0.0.1:8000"
  ).replace(/\/$/, "");

  return `${base}/${url.replace(/^\//, "")}`;
}
