const API_BASE = (
  import.meta.env.VITE_API_URL?.trim() || "http://127.0.0.1:8000/api"
).replace(/\/$/, "");

const TOKEN_KEY = "paciano_admin_token";

export function getAuthToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setAuthToken(token: string | null): void {
  if (token) {
    localStorage.setItem(TOKEN_KEY, token);
  } else {
    localStorage.removeItem(TOKEN_KEY);
  }
}

export type ApiError = { message: string; status?: number };

export async function apiRequest<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const headers = new Headers(options.headers);
  if (!headers.has("Content-Type") && options.body) {
    headers.set("Content-Type", "application/json");
  }
  headers.set("Accept", "application/json");

  const token = getAuthToken();
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const res = await fetch(`${API_BASE}${path.startsWith("/") ? path : `/${path}`}`, {
    ...options,
    headers,
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    const message =
      (data as { message?: string }).message ||
      (data as { errors?: Record<string, string[]> }).errors?.login?.[0] ||
      (data as { errors?: Record<string, string[]> }).errors?.email?.[0] ||
      "Request failed";
    throw { message, status: res.status } satisfies ApiError;
  }

  return data as T;
}

/** Multipart upload (do not set Content-Type — browser sets boundary). */
export async function apiUpload<T>(
  path: string,
  formData: FormData,
  method: "POST" | "PUT" = "POST",
  options?: { timeoutMs?: number },
): Promise<T> {
  const headers = new Headers();
  headers.set("Accept", "application/json");

  const token = getAuthToken();
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const timeoutMs = options?.timeoutMs ?? 120_000;
  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), timeoutMs);

  let res: Response;
  try {
    res = await fetch(`${API_BASE}${path.startsWith("/") ? path : `/${path}`}`, {
      method,
      headers,
      body: formData,
      signal: controller.signal,
    });
  } catch (e) {
    window.clearTimeout(timeout);
    if (e instanceof DOMException && e.name === "AbortError") {
      throw {
        message: "Upload timed out. Try a smaller file or check your connection.",
        status: 408,
      } satisfies ApiError;
    }
    throw e;
  } finally {
    window.clearTimeout(timeout);
  }

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    const message =
      (data as { message?: string }).message ||
      Object.values(
        (data as { errors?: Record<string, string[]> }).errors ?? {},
      )
        .flat()
        .find(Boolean) ||
      "Upload failed";
    throw { message, status: res.status } satisfies ApiError;
  }

  return data as T;
}
