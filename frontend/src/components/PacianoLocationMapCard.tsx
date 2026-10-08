import { forwardRef } from "react";
import type { FooterLocationInfo, FooterSettings } from "@/hooks/useSiteFooter";
import FreeLocationMap, {
  formatMapCoordinates,
  useMapCoordinates,
} from "@/components/FreeLocationMap";

function MapDistanceIcon({ iconKey }: { iconKey: string }) {
  if (iconKey === "train") {
    return (
      <svg viewBox="0 0 32 32" className="h-[30px] w-[30px] shrink-0 text-[#F4EFE4]" fill="none">
        <rect x="8" y="5" width="16" height="18" rx="4" stroke="currentColor" strokeWidth="1.4" />
        <path d="M8 16H24" stroke="currentColor" strokeWidth="1.4" />
        <circle cx="12" cy="20" r="1.5" fill="currentColor" />
        <circle cx="20" cy="20" r="1.5" fill="currentColor" />
        <path d="M12 27L15 23" stroke="currentColor" strokeWidth="1.4" />
        <path d="M20 27L17 23" stroke="currentColor" strokeWidth="1.4" />
      </svg>
    );
  }
  if (iconKey === "plane") {
    return (
      <svg
        viewBox="0 0 32 32"
        className="h-[30px] w-[30px] shrink-0 rotate-[-8deg] text-[#F4EFE4]"
        fill="none"
      >
        <path
          d="M5 17 L27 10 L28 12 L18 18 L15 25 L12 24 L14 19 L7 20 Z"
          fill="currentColor"
        />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 32 32" className="h-[30px] w-[30px] shrink-0 text-[#F4EFE4]" fill="none">
      <path d="M6 20 H26 L24 14 H9 L6 20Z" stroke="currentColor" strokeWidth="1.4" />
      <path d="M10 14 L12 9 H21 L24 14" stroke="currentColor" strokeWidth="1.4" />
      <circle cx="10" cy="22" r="2" stroke="currentColor" strokeWidth="1.3" />
      <circle cx="22" cy="22" r="2" stroke="currentColor" strokeWidth="1.3" />
    </svg>
  );
}

type Props = {
  settings: FooterSettings;
  locationInfo: FooterLocationInfo[];
  variant?: "home" | "standalone";
  isVisible?: boolean;
  className?: string;
};

const PacianoLocationMapCard = forwardRef<HTMLDivElement, Props>(
  function PacianoLocationMapCard(
    { settings, locationInfo, variant = "standalone", isVisible = true, className = "" },
    ref,
  ) {
    const { lat, lng } = useMapCoordinates(
      settings.map_latitude,
      settings.map_longitude,
      settings.map_address,
    );

    const [coordLine1, coordLine2] = formatMapCoordinates(lat, lng);

    const mapTitle = settings.map_title?.trim() || "Manabari, Oodlabari";
    const mapSubtitle =
      settings.map_subtitle?.trim() || "Jalpaiguri, West Bengal, India";
    const mapDescription =
      settings.map_description?.trim() ||
      "A serene location at the edge of the Himalayas, perfectly connected yet wonderfully secluded.";

    const mapsLink =
      settings.maps_link?.trim() ||
      `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;

    const isHome = variant === "home";

    const shellClass = isHome
      ? `
    absolute
    left-[11.1%]
    bottom-[-55px]
    z-[100]
    w-[79%]
    h-[230px]
    transform
    transition-all
    duration-[1900ms]
    ease-[cubic-bezier(0.22,1,0.36,1)]
    will-change-transform
    ${
      isVisible
        ? "translate-y-0 scale-100 opacity-100"
        : "translate-y-20 scale-[0.97] opacity-0"
    }
  `
      : `relative h-[230px] w-full ${className}`;

    return (
      <div
        ref={ref}
        className={`
          ${shellClass}
          overflow-hidden
          rounded-[24px]
          border
          border-[#C6B85F]/[0.72]
          bg-[#1B2515]
          shadow-[0_20px_50px_rgba(5,12,7,0.55),0_4px_18px_rgba(0,0,0,0.28)]
        `}
        style={isHome ? { transitionDelay: "2750ms" } : undefined}
      >
        <div className="pointer-events-none absolute left-[34%] top-[-25%] z-[1] h-[170px] w-[420px] rounded-full bg-[#C8B866]/[0.075] blur-[55px]" />
        <div className="pointer-events-none absolute inset-x-[8%] top-[1px] z-[4] h-px bg-gradient-to-r from-transparent via-[#E3D89E]/[0.42] to-transparent" />
        <div className="pointer-events-none absolute left-[10%] top-[10%] z-0 h-[90px] w-[38%] rounded-full bg-white/[0.06] blur-[45px]" />

        <div
          className="
            absolute
            left-[12px]
            top-[12px]
            bottom-[12px]
            w-[39%]
            overflow-hidden
            rounded-[15px]
            border
            border-[#E7DFC5]/[0.58]
            bg-[#DDE5D2]
            shadow-[0_8px_18px_rgba(20,28,18,0.16),inset_0_1px_0_rgba(255,255,255,0.20)]
          "
        >
          <FreeLocationMap latitude={lat} longitude={lng} className="!z-0" />

          <span
            className="
              pointer-events-none
              absolute
              left-[48%]
              top-[49%]
              z-[500]
              -translate-x-1/2
              -translate-y-1/2
              whitespace-nowrap
              font-['Cormorant_Garamond',serif]
              text-[15px]
              font-medium
              text-[#252A20]
              pl-[30px]
            "
          >
            Paciano
          </span>

          <div className="pointer-events-none absolute right-[12px] top-[12px] z-[500] flex h-[38px] w-[38px] items-center justify-center rounded-full border border-[#69735D]/50 bg-[#F4EFE4]/65 backdrop-blur-sm">
            <span className="text-[14px] font-medium text-[#252A20]">N</span>
            <span className="absolute bottom-[7px] left-1/2 h-[1px] w-[9px] -translate-x-1/2 rotate-[-45deg] bg-[#252A20]/60" />
          </div>
        </div>

        <div className="absolute right-[24px] top-[20px] bottom-[18px] left-[41%] flex flex-col">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-[13px]">
              <svg
                viewBox="0 0 24 24"
                className="mt-[1px] h-[30px] w-[30px] shrink-0 text-[#F4EFE4]"
                fill="none"
              >
                <path
                  d="M12 21 C12 21 19 14.6 19 9 C19 5.1 15.9 2 12 2 C8.1 2 5 5.1 5 9 C5 14.6 12 21 12 21Z"
                  fill="currentColor"
                />
                <circle cx="12" cy="9" r="3" fill="#4B5234" />
              </svg>
              <div>
                <div className="font-['Cormorant_Garamond',serif] text-[21px] font-medium leading-[1.05] text-[#F8F1DD] drop-shadow-[0_1px_3px_rgba(0,0,0,0.35)]">
                  {mapTitle}
                </div>
                <div className="mt-[3px] font-['Cormorant_Garamond',serif] text-[17px] italic leading-[1.05] text-[#F7F1DE] opacity-95">
                  {mapSubtitle}
                </div>
              </div>
            </div>
            <div className="pr-[8px] font-['Cormorant_Garamond',serif] text-[17px] leading-[1.25] text-[#F7F1DE] drop-shadow-[0_1px_3px_rgba(0,0,0,0.18)]">
              <div>{coordLine1}</div>
              <div>{coordLine2}</div>
            </div>
          </div>

          <p className="mt-[14px] max-w-[561px] font-manrope text-[13px] leading-[1.35] text-[#F7F1DE] opacity-95 drop-shadow-[0_1px_3px_rgba(0,0,0,0.16)]">
            {mapDescription}
          </p>

          <div className="mt-[10px] h-px w-full bg-[#E6DEC8]/30" />

          <div className="mt-[11px] flex flex-wrap items-center gap-y-3 lg:flex-nowrap">
            {locationInfo.map((item, index) => (
              <div key={item.id || item.info_label} className="flex items-center">
                {index > 0 ? (
                  <div className="mx-[18px] hidden h-[42px] w-px bg-[#D9D4C3]/25 sm:block" />
                ) : null}
                <div
                  className={`flex items-center gap-[11px] ${index === 0 ? "pr-[22px]" : "px-[12px] lg:px-[20px]"}`}
                >
                  <MapDistanceIcon iconKey={item.info_icon} />
                  <div>
                    <div className="text-[15px] font-semibold leading-none text-[#F4EFE4]">
                      {item.info_value}
                    </div>
                    <div className="mt-[2px] max-w-[120px] text-[13px] leading-[1.15] text-[#F4EFE4]/65">
                      {item.info_label}
                    </div>
                  </div>
                </div>
              </div>
            ))}

            <a
              href={mapsLink}
              target="_blank"
              rel="noopener noreferrer"
              className="
                group
                ml-auto
                mt-2
                flex
                h-[52px]
                min-w-[155px]
                items-center
                justify-between
                gap-[18px]
                rounded-full
                border
                border-[#F4EFE4]/60
                px-[18px]
                text-[#F4EFE4]
                transition-all
                duration-500
                hover:border-[#F4EFE4]
                hover:bg-[#F4EFE4]/10
                lg:mt-0
              "
            >
              <span className="text-[11px] leading-[1.15] tracking-[0.02em]">
                View on
                <br />
                Google Maps
              </span>
              <span className="flex h-[32px] w-[32px] shrink-0 items-center justify-center rounded-full border border-[#F4EFE4]/35 transition-transform duration-500 group-hover:translate-x-[3px]">
                <span className="text-[17px] leading-none">→</span>
              </span>
            </a>
          </div>
        </div>
      </div>
    );
  },
);

export default PacianoLocationMapCard;
