type PacianoExperienceIconProps = {
  /** 0–4: Riverside, Tea garden, Culinary, Wellness, Sustainable stay */
  type: number;
  className?: string;
};

const defaultClass =
  "h-[38px] w-[38px] text-[#5F7138] transition-all duration-[1800ms] ease-[cubic-bezier(.22,1,.36,1)]";

export function PacianoExperienceIcon({
  type,
  className = defaultClass,
}: PacianoExperienceIconProps) {
  if (type === 0) {
    return (
      <svg viewBox="0 0 64 64" className={className} fill="none">
        <circle cx="32" cy="16" r="4" stroke="currentColor" strokeWidth="1.25" />
        <path
          d="M13 28C20 25 25 25 32 28C39 31 45 31 51 28"
          stroke="currentColor"
          strokeWidth="1.25"
          strokeLinecap="round"
        />
        <path
          d="M10 36C17 32 23 32 30 36C37 40 43 40 54 35"
          stroke="currentColor"
          strokeWidth="1.25"
          strokeLinecap="round"
        />
        <path
          d="M13 44C20 41 26 41 33 44C40 47 46 47 51 44"
          stroke="currentColor"
          strokeWidth="1"
          strokeLinecap="round"
        />
        <path
          d="M18 51C25 49 38 49 46 51"
          stroke="currentColor"
          strokeWidth="1"
          strokeLinecap="round"
        />
      </svg>
    );
  }

  if (type === 1) {
    return (
      <svg viewBox="0 0 64 64" className={className} fill="none">
        <path
          d="M32 53C31 42 32 31 38 13"
          stroke="currentColor"
          strokeWidth="1.25"
          strokeLinecap="round"
        />
        <path
          d="M32 38 C23 36 17 30 17 22 C25 23 31 29 32 37"
          stroke="currentColor"
          strokeWidth="1.25"
        />
        <path
          d="M35 29 C36 21 42 16 49 17 C47 24 42 29 35 30"
          stroke="currentColor"
          strokeWidth="1.25"
        />
        <path
          d="M31 46 C25 44 21 40 20 35 C26 36 30 40 32 45"
          stroke="currentColor"
          strokeWidth="1"
        />
        <circle cx="40" cy="12" r="1.7" fill="currentColor" />
      </svg>
    );
  }

  if (type === 2) {
    return (
      <svg viewBox="0 0 64 64" className={className} fill="none">
        <ellipse
          cx="32"
          cy="38"
          rx="20"
          ry="7"
          stroke="currentColor"
          strokeWidth="1.2"
        />
        <ellipse
          cx="32"
          cy="37"
          rx="14"
          ry="4"
          stroke="currentColor"
          strokeWidth="0.9"
        />
        <path
          d="M26 35C27 29 31 26 36 24"
          stroke="currentColor"
          strokeWidth="1.1"
          strokeLinecap="round"
        />
        <path
          d="M29 30 C25 29 23 26 24 23 C28 24 30 26 30 30"
          stroke="currentColor"
          strokeWidth="1"
        />
        <path
          d="M34 27 C36 23 40 21 43 22 C41 26 38 28 34 28"
          stroke="currentColor"
          strokeWidth="1"
        />
        <path
          d="M18 48C26 51 39 51 47 48"
          stroke="currentColor"
          strokeWidth="1"
          strokeLinecap="round"
        />
      </svg>
    );
  }

  if (type === 3) {
    return (
      <svg viewBox="0 0 64 64" className={className} fill="none">
        <path
          d="M15 25 C21 19 27 19 32 25 C37 31 43 31 49 25"
          stroke="currentColor"
          strokeWidth="1.1"
          strokeLinecap="round"
        />
        <path
          d="M15 34 C21 28 27 28 32 34 C37 40 43 40 49 34"
          stroke="currentColor"
          strokeWidth="1.1"
          strokeLinecap="round"
        />
        <path
          d="M32 48 C27 43 25 38 28 34 C31 37 32 41 32 45"
          stroke="currentColor"
          strokeWidth="1.1"
        />
        <path
          d="M32 48 C37 43 39 38 36 34 C33 37 32 41 32 45"
          stroke="currentColor"
          strokeWidth="1.1"
        />
        <path
          d="M23 48H41"
          stroke="currentColor"
          strokeWidth="1"
          strokeLinecap="round"
        />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 64 64" className={className} fill="none">
      <path
        d="M16 34 C19 24 26 18 36 17 C44 16 50 21 52 28 C46 27 41 29 37 34 C31 41 24 43 17 41"
        stroke="currentColor"
        strokeWidth="1.15"
        strokeLinecap="round"
      />
      <path
        d="M31 49C31 40 34 31 42 24"
        stroke="currentColor"
        strokeWidth="1.1"
        strokeLinecap="round"
      />
      <path
        d="M33 38 C27 36 24 32 24 27 C30 28 34 32 34 37"
        stroke="currentColor"
        strokeWidth="1"
      />
      <path
        d="M37 31 C39 26 43 23 48 24 C46 29 42 32 37 33"
        stroke="currentColor"
        strokeWidth="1"
      />
      <circle cx="22" cy="19" r="1.5" fill="currentColor" />
    </svg>
  );
}

export const PACIANO_EXPERIENCE_ICON_COUNT = 5;
