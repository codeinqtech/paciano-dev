import { getApiBaseUrl } from "@/lib/apiBase";

function isGoogleHostedPhoto(url: string): boolean {
  try {
    const host = new URL(url).hostname.toLowerCase();
    return host.endsWith("googleusercontent.com") || host.endsWith("ggpht.com");
  } catch {
    return false;
  }
}

/** Load Google avatar URLs through our API (avoids hotlink / referrer blocks). */
export function proxiedGoogleProfilePhoto(
  url: string | null | undefined,
): string | null {
  const trimmed = url?.trim();
  if (!trimmed) return null;
  if (!isGoogleHostedPhoto(trimmed)) return trimmed;
  return `${getApiBaseUrl()}/google-profile-photo?u=${encodeURIComponent(trimmed)}`;
}

export function guestInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}
