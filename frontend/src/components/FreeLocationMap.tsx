import { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

type Props = {
  latitude: number;
  longitude: number;
  className?: string;
  zoom?: number;
};

const DEFAULT_CENTER: [number, number] = [26.869761, 88.732941];

/** OpenStreetMap tiles (free) with vintage styling to match the Paciano map card. */
export default function FreeLocationMap({
  latitude,
  longitude,
  className = "",
  zoom = 13,
}: Props) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<L.Map | null>(null);

  const lat = Number.isFinite(latitude) ? latitude : DEFAULT_CENTER[0];
  const lng = Number.isFinite(longitude) ? longitude : DEFAULT_CENTER[1];

  useEffect(() => {
    const el = containerRef.current;
    if (!el || mapRef.current) return;

    const map = L.map(el, {
      center: [lat, lng],
      zoom,
      zoomControl: false,
      attributionControl: true,
      scrollWheelZoom: false,
      dragging: true,
    });

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>',
    }).addTo(map);

    const pinHtml = `
      <div style="position:relative;width:24px;height:32px;margin-left:-12px;margin-top:-28px;">
        <div style="width:24px;height:24px;border-radius:9999px;background:#4B5234;display:flex;align-items:center;justify-content:center;box-shadow:0 4px 12px rgba(0,0,0,0.25);">
          <span style="width:7px;height:7px;border-radius:9999px;background:#F4EFE4;display:block;"></span>
        </div>
        <span style="position:absolute;left:50%;bottom:-2px;width:9px;height:9px;background:#4B5234;transform:translateX(-50%) rotate(45deg);"></span>
      </div>`;

    const icon = L.divIcon({
      html: pinHtml,
      className: "paciano-map-pin-icon",
      iconSize: [24, 32],
      iconAnchor: [12, 30],
    });

    L.marker([lat, lng], { icon }).addTo(map);

    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, [lat, lng, zoom]);

  useEffect(() => {
    mapRef.current?.setView([lat, lng], zoom);
  }, [lat, lng, zoom]);

  return (
    <div
      ref={containerRef}
      className={`paciano-leaflet-map h-full w-full ${className}`}
    />
  );
}

/** Resolve coordinates from settings; optional Nominatim lookup when only address is set. */
export function useMapCoordinates(
  latitude: number | null | undefined,
  longitude: number | null | undefined,
  address: string | null | undefined,
): { lat: number; lng: number; resolving: boolean } {
  const [coords, setCoords] = useState<{ lat: number; lng: number }>(() => ({
    lat: latitude ?? DEFAULT_CENTER[0],
    lng: longitude ?? DEFAULT_CENTER[1],
  }));
  const [resolving, setResolving] = useState(false);

  useEffect(() => {
    if (latitude != null && longitude != null && !Number.isNaN(latitude)) {
      setCoords({ lat: latitude, lng: longitude });
      return;
    }

    const q = address?.trim();
    if (!q) {
      setCoords({ lat: DEFAULT_CENTER[0], lng: DEFAULT_CENTER[1] });
      return;
    }

    let cancelled = false;
    setResolving(true);

    fetch(
      `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(q)}`,
      { headers: { Accept: "application/json" } },
    )
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((rows: { lat: string; lon: string }[]) => {
        if (cancelled || !rows?.[0]) return;
        setCoords({
          lat: parseFloat(rows[0].lat),
          lng: parseFloat(rows[0].lon),
        });
      })
      .catch(() => {
        /* keep previous */
      })
      .finally(() => {
        if (!cancelled) setResolving(false);
      });

    return () => {
      cancelled = true;
    };
  }, [latitude, longitude, address]);

  return { ...coords, resolving };
}

export function formatMapCoordinates(lat: number, lng: number): [string, string] {
  const latStr = `${Math.abs(lat).toFixed(4)}° ${lat >= 0 ? "N" : "S"},`;
  const lngStr = `${Math.abs(lng).toFixed(4)}° ${lng >= 0 ? "E" : "W"}`;
  return [latStr, lngStr];
}
