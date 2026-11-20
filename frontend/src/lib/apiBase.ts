const DEV_PROXY_API = "/api";

const DEV_LARAGON_PUBLIC =
  import.meta.env.VITE_DEV_MEDIA_URL?.trim() ||
  "http://PACIANO-DEV.test:8080/backend/public";

/** Laravel on Hostinger is deployed under `public_html/paciano/backend/public`. */
const HOSTED_API_PATH = "/backend/public/api";
const HOSTED_PUBLIC_PATH = "/backend/public";

function trimTrailingSlash(value: string): string {
  return value.replace(/\/$/, "");
}

/**
 * REST API base including `/api` suffix (no trailing slash).
 * Override with `VITE_API_URL` in `.env` or CI secrets.
 */
export function getApiBaseUrl(): string {
  const fromEnv = import.meta.env.VITE_API_URL?.trim();
  if (fromEnv) {
    return trimTrailingSlash(fromEnv);
  }

  if (import.meta.env.DEV) {
    // Same-origin via Vite proxy → Laragon backend/public/api
    return DEV_PROXY_API;
  }

  if (typeof window !== "undefined" && window.location?.origin) {
    return `${window.location.origin}${HOSTED_API_PATH}`;
  }

  return HOSTED_API_PATH;
}

/** Origin for uploaded media under Laravel `public/` (no trailing slash). */
export function getBackendPublicUrl(): string {
  const fromMedia = import.meta.env.VITE_MEDIA_URL?.trim();
  if (fromMedia) {
    return trimTrailingSlash(fromMedia);
  }

  const fromBackend = import.meta.env.VITE_BACKEND_URL?.trim();
  if (fromBackend) {
    return trimTrailingSlash(fromBackend);
  }

  const fromApi = import.meta.env.VITE_API_URL?.trim();
  if (fromApi) {
    return trimTrailingSlash(fromApi.replace(/\/api\/?$/i, ""));
  }

  if (import.meta.env.DEV) {
    return DEV_LARAGON_PUBLIC;
  }

  if (typeof window !== "undefined" && window.location?.origin) {
    return `${window.location.origin}${HOSTED_PUBLIC_PATH}`;
  }

  return HOSTED_PUBLIC_PATH;
}
