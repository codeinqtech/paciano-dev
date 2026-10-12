import { getBackendPublicUrl } from "@/lib/apiBase";

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

  const base = getBackendPublicUrl();

  return `${base}/${url.replace(/^\//, "")}`;
}
