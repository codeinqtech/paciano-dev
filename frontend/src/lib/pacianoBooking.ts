/** External booking engine (IPMS247) — temporary until on-site modal is restored. */
export const PACIANO_BOOKING_URL =
  "https://live.ipms247.com/booking/book-rooms-paciano";

export function openPacianoBooking(): void {
  window.location.assign(PACIANO_BOOKING_URL);
}
