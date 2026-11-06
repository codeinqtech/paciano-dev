import { homeHref, toAppPath } from "./appBase";

/** Turn DB `url` into a browser-ready href. */
export function resolveNavUrl(url: string): string {
  const trimmed = url.trim();
  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
    return trimmed;
  }
  if (trimmed.startsWith("#")) {
    return homeHref(trimmed);
  }
  const path = trimmed.startsWith("/") ? trimmed : `/${trimmed}`;
  return toAppPath(path);
}
