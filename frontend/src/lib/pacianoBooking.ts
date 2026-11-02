const STORAGE_KEY = "paciano_booking_prefs";
const COOKIE_NAME = "paciano_booking_prefs";
const COOKIE_MAX_AGE_SEC = 365 * 24 * 60 * 60;
const LETSBOOK_WINDOW_NAME = "paciano_letsbook";

export const PACIANO_BOOKING_BASE_URL =
  "https://letsbook.me/booking/paciano";

export const PACIANO_BOOKING_PLANNER_EVENT = "paciano:open-booking-planner";

export type PacianoBookingPrefs = {
  checkin: string;
  checkout: string;
  adults: number;
  children: number;
  rooms: number;
};

/** Reused LetsBook tab — focus instead of reloading defaults while it is still open. */
let letsBookWindow: Window | null = null;

function formatLocalDate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function startOfToday(): Date {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

function defaultDateRange(): Pick<PacianoBookingPrefs, "checkin" | "checkout"> {
  const checkin = startOfToday();
  const checkout = new Date(checkin);
  checkout.setDate(checkout.getDate() + 1);
  return {
    checkin: formatLocalDate(checkin),
    checkout: formatLocalDate(checkout),
  };
}

function parseLocalDate(value: string): Date | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value.trim());
  if (!match) return null;
  const d = new Date(
    Number(match[1]),
    Number(match[2]) - 1,
    Number(match[3]),
  );
  if (Number.isNaN(d.getTime())) return null;
  d.setHours(0, 0, 0, 0);
  return d;
}

function isValidStayRange(checkin: string, checkout: string): boolean {
  const inDate = parseLocalDate(checkin);
  const outDate = parseLocalDate(checkout);
  if (!inDate || !outDate) return false;
  if (inDate < startOfToday()) return false;
  return outDate > inDate;
}

function clampInt(
  value: unknown,
  min: number,
  max: number,
  fallback: number,
): number {
  if (typeof value !== "number" || !Number.isFinite(value)) return fallback;
  return Math.min(max, Math.max(min, Math.floor(value)));
}

function defaultPrefs(): PacianoBookingPrefs {
  return { ...defaultDateRange(), adults: 2, children: 0, rooms: 1 };
}

function readCookiePrefs(): Partial<PacianoBookingPrefs> | null {
  if (typeof document === "undefined") return null;
  const escaped = COOKIE_NAME.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const match = document.cookie.match(
    new RegExp(`(?:^|; )${escaped}=([^;]*)`),
  );
  if (!match?.[1]) return null;
  try {
    return JSON.parse(decodeURIComponent(match[1])) as Partial<PacianoBookingPrefs>;
  } catch {
    return null;
  }
}

function writeCookiePrefs(prefs: PacianoBookingPrefs): void {
  if (typeof document === "undefined") return;
  const payload = encodeURIComponent(JSON.stringify(prefs));
  document.cookie = `${COOKIE_NAME}=${payload}; path=/; max-age=${COOKIE_MAX_AGE_SEC}; SameSite=Lax`;
}

function readStoredPrefs(): Partial<PacianoBookingPrefs> | null {
  const fromCookie = readCookiePrefs();
  if (fromCookie) return fromCookie;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as Partial<PacianoBookingPrefs>;
  } catch {
    return null;
  }
}

function normalizePartial(
  partial: Partial<PacianoBookingPrefs>,
  fallback: PacianoBookingPrefs,
): PacianoBookingPrefs {
  let checkin =
    typeof partial.checkin === "string"
      ? partial.checkin.trim()
      : fallback.checkin;
  let checkout =
    typeof partial.checkout === "string"
      ? partial.checkout.trim()
      : fallback.checkout;

  if (!isValidStayRange(checkin, checkout)) {
    const fresh = defaultDateRange();
    checkin = fresh.checkin;
    checkout = fresh.checkout;
  }

  return {
    checkin,
    checkout,
    adults: clampInt(partial.adults, 1, 99, fallback.adults),
    children: clampInt(partial.children, 0, 99, fallback.children),
    rooms: clampInt(partial.rooms, 1, 99, fallback.rooms),
  };
}

/** Load prefs: refresh expired dates; keep guests/rooms when saved. */
export function getPacianoBookingPrefs(): PacianoBookingPrefs {
  const fallback = defaultPrefs();
  const stored = readStoredPrefs();
  if (!stored) return fallback;
  return normalizePartial(stored, fallback);
}

export function savePacianoBookingPrefs(prefs: PacianoBookingPrefs): void {
  const normalized = normalizePartial(prefs, defaultPrefs());
  writeCookiePrefs(normalized);
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(normalized));
  } catch {
    /* storage blocked */
  }
}

export function buildPacianoBookingUrl(
  prefs: PacianoBookingPrefs = getPacianoBookingPrefs(),
): string {
  const p = normalizePartial(prefs, defaultPrefs());
  const params = new URLSearchParams({
    checkin: p.checkin,
    checkout: p.checkout,
    adults: String(p.adults),
    children: String(p.children),
    rooms: String(p.rooms),
  });
  return `${PACIANO_BOOKING_BASE_URL}?${params.toString()}`;
}

function isLetsBookPacianoUrl(url: URL): boolean {
  const host = url.hostname.toLowerCase();
  if (host !== "letsbook.me" && !host.endsWith(".letsbook.me")) {
    return false;
  }
  return url.pathname.toLowerCase().includes("paciano");
}

function prefsFromSearchParams(
  params: URLSearchParams,
  base: PacianoBookingPrefs = getPacianoBookingPrefs(),
): PacianoBookingPrefs | null {
  const hasAny =
    params.has("checkin") ||
    params.has("checkout") ||
    params.has("adults") ||
    params.has("children") ||
    params.has("rooms");
  if (!hasAny) return null;

  const partial: Partial<PacianoBookingPrefs> = { ...base };

  if (params.has("checkin")) {
    partial.checkin = params.get("checkin") ?? partial.checkin;
  }
  if (params.has("checkout")) {
    partial.checkout = params.get("checkout") ?? partial.checkout;
  }
  if (params.has("adults")) {
    partial.adults = clampInt(
      Number(params.get("adults")),
      1,
      99,
      base.adults,
    );
  }
  if (params.has("children")) {
    partial.children = clampInt(
      Number(params.get("children")),
      0,
      99,
      base.children,
    );
  }
  if (params.has("rooms")) {
    partial.rooms = clampInt(
      Number(params.get("rooms")),
      1,
      99,
      base.rooms,
    );
  }

  return normalizePartial(partial, defaultPrefs());
}

/** When the user returns to Paciano from LetsBook, save the search from the referrer URL. */
export function syncPacianoBookingPrefsFromReferrer(
  referrer: string = typeof document !== "undefined" ? document.referrer : "",
): boolean {
  if (!referrer.trim()) return false;
  try {
    const url = new URL(referrer);
    if (!isLetsBookPacianoUrl(url)) return false;
    const prefs = prefsFromSearchParams(url.searchParams);
    if (!prefs) return false;
    savePacianoBookingPrefs(prefs);
    return true;
  } catch {
    return false;
  }
}

/** If the Paciano URL includes booking query params, persist them for next time. */
export function syncPacianoBookingPrefsFromLocation(
  search: string = typeof window !== "undefined" ? window.location.search : "",
): boolean {
  const params = new URLSearchParams(search);
  const prefs = prefsFromSearchParams(params);
  if (!prefs) return false;
  savePacianoBookingPrefs(prefs);
  return true;
}

export function initPacianoBookingPrefsSync(): void {
  const run = () => {
    syncPacianoBookingPrefsFromReferrer();
    syncPacianoBookingPrefsFromLocation();
  };
  run();
  if (typeof window !== "undefined") {
    window.addEventListener("pageshow", run);
  }
}

/** Open the on-site booking planner modal (Navbar listens for this). */
export function requestPacianoBookingPlanner(): void {
  window.dispatchEvent(new CustomEvent(PACIANO_BOOKING_PLANNER_EVENT));
}

/** Save prefs and open LetsBook in a new tab with the given search. */
export function openPacianoBooking(
  prefs: PacianoBookingPrefs = getPacianoBookingPrefs(),
): void {
  const normalized = normalizePartial(prefs, defaultPrefs());
  savePacianoBookingPrefs(normalized);
  const url = buildPacianoBookingUrl(normalized);

  if (letsBookWindow && !letsBookWindow.closed) {
    try {
      letsBookWindow.location.href = url;
      letsBookWindow.focus();
      return;
    } catch {
      letsBookWindow = null;
    }
  }

  letsBookWindow = window.open(url, LETSBOOK_WINDOW_NAME);
  if (letsBookWindow) {
    try {
      letsBookWindow.opener = null;
    } catch {
      /* ignore */
    }
  }
}

/** @deprecated Use buildPacianoBookingUrl() */
export const PACIANO_BOOKING_URL = PACIANO_BOOKING_BASE_URL;
