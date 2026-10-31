const LOCAL_API_BASE = "http://127.0.0.1:8000/api";

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
    return LOCAL_API_BASE;
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
    return "http://127.0.0.1:8000";
  }

  if (typeof window !== "undefined" && window.location?.origin) {
    return `${window.location.origin}${HOSTED_PUBLIC_PATH}`;
  }

  return HOSTED_PUBLIC_PATH;
}
