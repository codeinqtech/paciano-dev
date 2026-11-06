export const PACIANO_VALUE_ICON_KEYS = [
  "nature",
  "design",
  "hospitality",
  "experiences",
] as const;

export type PacianoValueIconKey = (typeof PACIANO_VALUE_ICON_KEYS)[number];

export const PACIANO_VALUE_ICON_OPTIONS: {
  value: PacianoValueIconKey;
  label: string;
}[] = [
  { value: "nature", label: "Nature" },
  { value: "design", label: "Design" },
  { value: "hospitality", label: "Hospitality" },
  { value: "experiences", label: "Experiences" },
];

export function isPacianoValueIconKey(
  value: string,
): value is PacianoValueIconKey {
  return (PACIANO_VALUE_ICON_KEYS as readonly string[]).includes(value);
}

type PacianoValueIconProps = {
  type: string;
  className?: string;
};

export function PacianoValueIcon({
  type,
  className = "paciano-emblem-drawing h-7 w-7 sm:h-8 sm:w-8",
}: PacianoValueIconProps) {
  const common = {
    fill: "none" as const,
    stroke: "currentColor",
    strokeWidth: 1.15,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    className: "paciano-emblem-drawing",
  };

  return (
    <svg {...common} viewBox="0 0 48 48" aria-hidden="true" className={className}>
      {type === "nature" && (
        <>
          <path d="M5 31 L16 15 L22 23 L29 11 L43 31" />
          <path d="M11 23 L16 15 L20 21" />
          <path d="M25 18 L29 11 L35 20" />
          <path d="M8 34 C14 30 19 38 25 34 S36 31 40 34" />
          <path d="M15 39 C20 36 26 41 33 38" />
          <path d="M34 11 L38 8" />
        </>
      )}
      {type === "design" && (
        <>
          <path d="M6 21 L25 9 L42 18" />
          <path d="M11 21 V37 H37 V19" />
          <path d="M16 37 V25 L26 19 L33 23 V37" />
          <path d="M21 37 V29 H28 V37" />
          <path d="M8 41 H40" />
          <path d="M33 13 L37 15" />
        </>
      )}
      {type === "hospitality" && (
        <>
          <path d="M5 29 L12 24 L18 27 L23 31" />
          <path d="M43 29 L36 24 L30 27 L25 31" />
          <path d="M12 24 L9 19 L5 22" />
          <path d="M36 24 L39 19 L43 22" />
          <path d="M24 27 L18 21 C15 17 20 14 24 19 C28 14 33 17 30 21 Z" />
          <path d="M12 33 L20 39 H28 L36 33" />
          <path d="M17 42 H31" />
        </>
      )}
      {type === "experiences" && (
        <>
          <path d="M13 41 C19 32 27 23 37 9" />
          <path d="M18 34 C10 34 7 28 9 23 C16 24 20 28 18 34 Z" />
          <path d="M24 27 C17 22 19 16 23 12 C29 17 29 22 24 27 Z" />
          <path d="M29 20 C29 13 35 10 41 12 C40 19 35 23 29 20 Z" />
          <path d="M14 40 H24" />
        </>
      )}
    </svg>
  );
}
