import emblem from "@/images/paciano-loading-emblem.png";

/** Ring radius in viewBox units (matches artwork ~84% diameter). */
const RING_CX = 50;
const RING_CY = 50;
const RING_R = 41.2;
const RING_C = 2 * Math.PI * RING_R;
/** Visible glow arc length along the stroke. */
const GLOW_ARC = RING_C * 0.09;

export default function PacianoHomeLoader() {
  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-[#030303]"
      role="status"
      aria-live="polite"
      aria-label="Loading Paciano"
    >
      <div className="relative w-[min(320px,82vw)] max-w-[320px]">
        <style>{`
          @keyframes pacianoRingTravel {
            to {
              stroke-dashoffset: ${-RING_C};
            }
          }
          @keyframes pacianoLoadingLineMove {
            0%,
            100% {
              transform: translateX(-50%) translateX(-34px);
            }
            50% {
              transform: translateX(-50%) translateX(34px);
            }
          }
        `}</style>

        <div className="relative aspect-square w-full">
          <img
            src={emblem}
            alt=""
            className="relative z-[1] h-full w-full object-contain"
            draggable={false}
          />

          {/* Glow travels along the ring stroke only (SVG path), never outside the circle */}
          <svg
            className="pointer-events-none absolute inset-0 z-[2] h-full w-full"
            viewBox="0 0 100 100"
            preserveAspectRatio="xMidYMid meet"
            aria-hidden
          >
            <defs>
              <filter id="pacianoGlow" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="0.35" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
              <linearGradient id="pacianoGlowGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="rgba(255,248,220,0)" />
                <stop offset="35%" stopColor="rgba(255,236,190,0.85)" />
                <stop offset="50%" stopColor="rgba(255,255,255,1)" />
                <stop offset="65%" stopColor="rgba(255,236,190,0.85)" />
                <stop offset="100%" stopColor="rgba(255,248,220,0)" />
              </linearGradient>
            </defs>
            <circle
              cx={RING_CX}
              cy={RING_CY}
              r={RING_R}
              fill="none"
              stroke="url(#pacianoGlowGrad)"
              strokeWidth="0.55"
              strokeLinecap="round"
              strokeDasharray={`${GLOW_ARC} ${RING_C - GLOW_ARC}`}
              strokeDashoffset="0"
              filter="url(#pacianoGlow)"
              style={{
                animation: "pacianoRingTravel 2.8s linear infinite",
              }}
            />
          </svg>

          {/* Hide baked-in underline from PNG so only the animated line is visible */}
          <div
            className="pointer-events-none absolute left-1/2 top-[57.65%] z-[2] h-[3px] w-[74px] -translate-x-1/2 rounded-sm bg-[#030303]"
            aria-hidden
          />
          <div
            className="pointer-events-none absolute left-1/2 top-[57.8%] z-[3] h-[1.5px] w-[68px] rounded-full bg-[#c4a862]"
            style={{
              boxShadow:
                "0 0 6px rgba(212,188,122,0.55), 0 0 2px rgba(255,248,220,0.4)",
              animation: "pacianoLoadingLineMove 2.2s ease-in-out infinite",
            }}
            aria-hidden
          />
        </div>
      </div>
    </div>
  );
}
