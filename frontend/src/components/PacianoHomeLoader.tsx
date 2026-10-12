import { useEffect, useRef } from "react";
import loaderArt from "@/images/paciano-loader.png";
import RingGlowSvg from "@/components/paciano-loader/RingGlowSvg";
import "./paciano-loader/paciano-loader.css";

const EXIT_MS = 1200;

type Props = {
  exiting?: boolean;
  onExitComplete?: () => void;
};

const LOADING_LETTERS = [
  { letter: "L", className: "paciano-loader__letter--l" },
  { letter: "O", className: "paciano-loader__letter--o" },
  { letter: "A", className: "paciano-loader__letter--a" },
  { letter: "D", className: "paciano-loader__letter--d" },
  { letter: "I", className: "paciano-loader__letter--i" },
  { letter: "N", className: "paciano-loader__letter--n" },
  { letter: "G", className: "paciano-loader__letter--g" },
] as const;

const BOTANICAL_LAYERS = [
  { name: "large-left", className: "paciano-loader__botanical-leaf--large-left" },
  { name: "lower-left", className: "paciano-loader__botanical-leaf--lower-left" },
  { name: "bottom", className: "paciano-loader__botanical-leaf--bottom" },
  { name: "branch-top", className: "paciano-loader__botanical-leaf--branch-top" },
  { name: "branch-left", className: "paciano-loader__botanical-leaf--branch-left" },
  { name: "branch-right", className: "paciano-loader__botanical-leaf--branch-right" },
  { name: "sprout-left", className: "paciano-loader__botanical-leaf--sprout-left" },
  { name: "sprout-right", className: "paciano-loader__botanical-leaf--sprout-right" },
] as const;

export default function PacianoHomeLoader({
  exiting = false,
  onExitComplete,
}: Props) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const completedRef = useRef(false);

  useEffect(() => {
    if (!exiting || !onExitComplete) {
      return;
    }
    completedRef.current = false;

    const finish = () => {
      if (completedRef.current) {
        return;
      }
      completedRef.current = true;
      onExitComplete();
    };

    const node = overlayRef.current;
    const onTransitionEnd = (e: TransitionEvent) => {
      if (e.target === node && e.propertyName === "opacity") {
        finish();
      }
    };
    node?.addEventListener("transitionend", onTransitionEnd);
    const fallback = window.setTimeout(finish, EXIT_MS + 80);

    return () => {
      node?.removeEventListener("transitionend", onTransitionEnd);
      window.clearTimeout(fallback);
    };
  }, [exiting, onExitComplete]);

  return (
    <div
      ref={overlayRef}
      className={`paciano-loader-overlay fixed inset-0 z-[9999] flex items-center justify-center${
        exiting ? " paciano-loader-overlay--exit" : ""
      }`}
      role="status"
      aria-live="polite"
      aria-label={exiting ? "Loading complete" : "Loading Paciano"}
      aria-hidden={exiting}
    >
      <div
        className="paciano-loader"
        role="img"
        aria-label="Paciano loading"
      >
        <img
          className="paciano-loader__artwork"
          src={loaderArt}
          alt=""
          draggable={false}
        />

        <RingGlowSvg />

        <div className="paciano-loader__botanical" aria-hidden>
          {BOTANICAL_LAYERS.map((leaf) => (
            <img
              key={leaf.name}
              className={`paciano-loader__botanical-leaf ${leaf.className}`}
              src={loaderArt}
              alt=""
              draggable={false}
              data-leaf={leaf.name}
            />
          ))}
        </div>

        <div className="paciano-loader__letters" aria-hidden>
          {LOADING_LETTERS.map((item) => (
            <img
              key={item.letter}
              className={`paciano-loader__letter ${item.className}`}
              src={loaderArt}
              alt=""
              draggable={false}
              data-letter={item.letter}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
