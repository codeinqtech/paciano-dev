/** Matches paciano-loader.png viewBox (1254×1254). */
const CX = 627;
const CY = 625;
const R_INNER = 510;
const R_OUTER = 546;

export default function RingGlowSvg() {
  return (
    <svg
      className="paciano-loader__ring-glow"
      viewBox="0 0 1254 1254"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <defs>
        <filter
          id="paciano-glow-bloom"
          x="-40%"
          y="-40%"
          width="180%"
          height="180%"
        >
          <feGaussianBlur stdDeviation="14" />
        </filter>
        <filter
          id="paciano-glow-soft"
          x="-30%"
          y="-30%"
          width="160%"
          height="160%"
        >
          <feGaussianBlur stdDeviation="4" />
        </filter>
        <filter
          id="paciano-glow-outer-bloom"
          x="-40%"
          y="-40%"
          width="180%"
          height="180%"
        >
          <feGaussianBlur stdDeviation="11" />
        </filter>
      </defs>

      {/* Main artwork ring — glow travels clockwise */}
      <g className="paciano-loader__ring-track paciano-loader__ring-track--cw">
        <circle
          className="paciano-loader__ring-layer paciano-loader__ring-layer--bloom"
          cx={CX}
          cy={CY}
          r={R_INNER}
          pathLength={1000}
        />
        <circle
          className="paciano-loader__ring-layer paciano-loader__ring-layer--soft"
          cx={CX}
          cy={CY}
          r={R_INNER}
          pathLength={1000}
        />
        <circle
          className="paciano-loader__ring-layer paciano-loader__ring-layer--core"
          cx={CX}
          cy={CY}
          r={R_INNER}
          pathLength={1000}
        />
      </g>

      {/* Outer ring — glow travels counter-clockwise */}
      <g className="paciano-loader__ring-track paciano-loader__ring-track--ccw">
        <circle
          className="paciano-loader__ring-layer paciano-loader__ring-layer--outer-bloom"
          cx={CX}
          cy={CY}
          r={R_OUTER}
          pathLength={1000}
        />
        <circle
          className="paciano-loader__ring-layer paciano-loader__ring-layer--outer-soft"
          cx={CX}
          cy={CY}
          r={R_OUTER}
          pathLength={1000}
        />
        <circle
          className="paciano-loader__ring-layer paciano-loader__ring-layer--outer-core"
          cx={CX}
          cy={CY}
          r={R_OUTER}
          pathLength={1000}
        />
      </g>
    </svg>
  );
}
