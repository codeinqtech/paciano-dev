import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import heroImage from "@/images/hero6.png";
import { useHomeContent } from "@/hooks/useHomeContent";
import { resolveMediaUrl } from "@/utils/resolveMediaUrl";
import leafImage from "@/images/hh.png";
import logoImage from "@/images/paciano-logo.png";

const HERO_VIDEO_SRC = `${
  import.meta.env.BASE_URL
}videos/contact-video.MOV`.replace(/\/{2,}/g, "/");

type HeroImageSlide = {
  id: string;
  kind: "image";
  src: string;
  alt: string;
  objectPosition?: string;
};

type HeroVideoSlide = {
  id: string;
  kind: "video";
  src: string;
  alt: string;
};

const FALLBACK_HERO_SLIDES: (HeroImageSlide | HeroVideoSlide)[] = [
  {
    id: "hero",
    kind: "image",
    src: heroImage,
    alt: "Paciano river valley at sunset",
  },
  {
    id: "story",
    kind: "video",
    src: HERO_VIDEO_SRC,
    alt: "Paciano — our story",
  },
];

const SLIDE_MS = 9000;

export default function HeroSection() {
  const { ready, bannerSlides: apiBannerSlides } = useHomeContent();
  const heroSlides = useMemo((): (HeroImageSlide | HeroVideoSlide)[] => {
    if (!ready || apiBannerSlides.length === 0) {
      return FALLBACK_HERO_SLIDES;
    }
    return apiBannerSlides.map((s) => {
      const src = resolveMediaUrl(s.url) ?? s.url;
      return s.media_type === "video"
        ? {
            id: `banner-${s.id}`,
            kind: "video" as const,
            src,
            alt: "Paciano banner video",
          }
        : {
            id: `banner-${s.id}`,
            kind: "image" as const,
            src,
            alt: "Paciano banner",
          };
    });
  }, [ready, apiBannerSlides]);

  const heroSlidesKey = heroSlides.map((s) => `${s.id}:${s.src}`).join("|");

  const [intro, setIntro] = useState(false);
  const [camera, setCamera] = useState(false);
  const [logoOpen, setLogoOpen] = useState(false);
  const [slideIndex, setSlideIndex] = useState(0);
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);

  const activeSlide = heroSlides[slideIndex];
  const showImageBannerChrome = activeSlide?.kind === "image";

  useEffect(() => {
    setSlideIndex(0);
  }, [heroSlidesKey]);

  const goToSlide = useCallback(
    (index: number) => {
      setSlideIndex(
        (index + heroSlides.length) % Math.max(heroSlides.length, 1),
      );
    },
    [heroSlides.length],
  );

  useEffect(() => {
    /*
     * ----------------------------------------------------------
     * HERO OPENING SEQUENCE
     *
     * 0ms     → dark cinematic opening
     * 300ms   → logo begins
     * 700ms   → logo mark opens
     * 1100ms  → PACIANO appears
     * 1500ms  → hero content
     * 2000ms  → cinematic camera movement
     * ----------------------------------------------------------
     */

    const introTimer = window.setTimeout(() => {
      setIntro(true);
    }, 250);

    const logoTimer = window.setTimeout(() => {
      setLogoOpen(true);
    }, 700);

    /*
     * Very slow camera movement.
     */
    const cameraTimer = window.setTimeout(() => {
      setCamera(true);
    }, 1800);

    return () => {
      window.clearTimeout(introTimer);
      window.clearTimeout(logoTimer);
      window.clearTimeout(cameraTimer);
    };
  }, []);

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) return;

    if (heroSlides.length < 2) return;

    const timer = window.setInterval(() => {
      setSlideIndex((i) => (i + 1) % heroSlides.length);
    }, SLIDE_MS);
    return () => window.clearInterval(timer);
  }, [heroSlides.length]);

  useEffect(() => {
    videoRefs.current.forEach((video, i) => {
      if (!video) return;
      if (i === slideIndex && heroSlides[i]?.kind === "video") {
        video.currentTime = 0;
        void video.play().catch(() => {});
      } else {
        video.pause();
      }
    });
  }, [slideIndex, heroSlides]);

  return (
    <section className="relative isolate h-screen min-h-[680px] w-full overflow-hidden bg-[#050a06] text-[#f5f0e7]">
      <style>{`
            @keyframes pacianoHeroDrift {
  from {
    transform: translate3d(0%, 0%, 0) scale(1.015);
  }

  to {
    transform: translate3d(2.2%, 0.8%, 0) scale(1.03);
  }
}

  @keyframes pacianoLogoReveal {
    0% {
      opacity: 0;
      transform: translateY(24px) scale(0.88);
      filter: blur(8px);
    }

    55% {
      opacity: 1;
      transform: translateY(-3px) scale(1.02);
      filter: blur(0);
    }

    100% {
      opacity: 1;
      transform: translateY(0) scale(1);
      filter: blur(0);
    }
  }

  @keyframes pacianoLogoGlow {
    0%, 100% {
      filter:
        drop-shadow(0 8px 25px rgba(0,0,0,0.22))
        brightness(0.96);
    }

    50% {
      filter:
        drop-shadow(0 10px 38px rgba(165,213,109,0.16))
        brightness(1.04);
    }
  }

  @keyframes pacianoEyebrow {
    0% {
      opacity: 0;
      transform: translateY(12px);
      letter-spacing: 0.15em;
    }

    100% {
      opacity: 1;
      transform: translateY(0);
      letter-spacing: 0.38em;
    }
  }

  @keyframes pacianoHeading {
    0% {
      opacity: 0;
      transform: translateY(35px);
      filter: blur(5px);
    }

    100% {
      opacity: 1;
      transform: translateY(0);
      filter: blur(0);
    }
  }

  @keyframes pacianoDivider {
    0% {
      opacity: 0;
      transform: scaleX(0.2);
    }

    100% {
      opacity: 1;
      transform: scaleX(1);
    }
  }

  @keyframes pacianoDiamond {
    0%, 100% {
      transform: rotate(45deg) scale(0.85);
      opacity: 0.65;
    }

    50% {
      transform: rotate(45deg) scale(1);
      opacity: 1;
    }
  }

  @keyframes pacianoCopy {
    0% {
      opacity: 0;
      transform: translateY(18px);
    }

    100% {
      opacity: 1;
      transform: translateY(0);
    }
  }

  @keyframes pacianoCTA {
    0% {
      opacity: 0;
      transform: translateY(22px) scale(0.96);
    }

    100% {
      opacity: 1;
      transform: translateY(0) scale(1);
    }
  }

  @keyframes pacianoShimmer {
    0% {
      transform: translateX(-120%);
      opacity: 0;
    }

    20% {
      opacity: 0;
    }

    45% {
      opacity: 0.35;
    }

    70% {
      opacity: 0;
    }

    100% {
      transform: translateX(120%);
      opacity: 0;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    * {
      animation-duration: 0.01ms !important;
      animation-iteration-count: 1 !important;
      transition-duration: 0.01ms !important;
    }
  }
    @keyframes pacianoSunsetVeil {
  0% {
    opacity: 0;
    background:
      radial-gradient(
        ellipse 18% 15% at 69% 43%,
        rgba(5, 9, 6, 0) 0%,
        rgba(5, 9, 6, 0) 100%
      );
  }

  65% {
    opacity: 0;
    background:
      radial-gradient(
        ellipse 18% 15% at 71% 45%,
        rgba(5, 9, 6, 0) 0%,
        rgba(5, 9, 6, 0) 100%
      );
  }

  78% {
    opacity: 0.18;
    background:
      radial-gradient(
        ellipse 20% 17% at 72% 47%,
        rgba(5, 9, 6, 0.05) 0%,
        rgba(5, 9, 6, 0.18) 48%,
        rgba(5, 9, 6, 0) 100%
      );
  }

  90% {
    opacity: 0.45;
    background:
      radial-gradient(
        ellipse 23% 19% at 73% 49%,
        rgba(5, 9, 6, 0.12) 0%,
        rgba(5, 9, 6, 0.32) 48%,
        rgba(5, 9, 6, 0) 100%
      );
  }

  100% {
    opacity: 0.62;
    background:
      radial-gradient(
        ellipse 26% 21% at 74% 51%,
        rgba(5, 9, 6, 0.20) 0%,
        rgba(5, 9, 6, 0.42) 48%,
        rgba(5, 9, 6, 0) 100%
      );
  }
}
`}</style>
      {/* =========================================================
          BACKGROUND / CINEMATIC LANDSCAPE
      ========================================================== */}

      <div className="absolute inset-0 overflow-hidden">
        {heroSlides.map((slide, i) => {
          const active = i === slideIndex;
          const mediaClass = `
            absolute inset-0 h-full w-full max-w-none object-cover object-center
            transition-opacity duration-[2200ms] ease-[cubic-bezier(0.22,1,0.36,1)]
            ${active ? "opacity-100 z-[0]" : "opacity-0 z-[-1]"}
          `;

          if (slide.kind === "video") {
            return (
              <video
                key={slide.id}
                ref={(el) => {
                  videoRefs.current[i] = el;
                }}
                src={slide.src}
                className={mediaClass}
                muted
                loop
                playsInline
                preload="metadata"
                aria-label={slide.alt}
                style={
                  active
                    ? {
                        animation: "pacianoHeroDrift 42s linear infinite",
                        transformOrigin: "center center",
                      }
                    : undefined
                }
              />
            );
          }

          const pos = slide.objectPosition ?? "center center";

          return (
            <img
              key={slide.id}
              src={slide.src}
              alt={slide.alt}
              decoding="async"
              fetchPriority={slide.id === "hero" ? "high" : "auto"}
              className={mediaClass}
              style={{
                objectPosition: pos,
                ...(active
                  ? {
                      animation: "pacianoHeroDrift 42s linear infinite",
                      transformOrigin: "center center",
                    }
                  : {}),
              }}
            />
          );
        })}

        <div className="pointer-events-none absolute inset-0 z-[1]">
          <div
            className="absolute inset-0 opacity-0"
            style={{
              animation: "pacianoSunsetVeil 42s linear infinite",
            }}
          />
        </div>

        {/* Very subtle overall cinematic tint */}
        {/* <div className="absolute inset-0 bg-[#10160d]/[0.10]" /> */}

        {/* Top darkness — only for navbar readability */}
        <div
          className="
            absolute inset-x-0 top-0
            h-[22%]
            bg-gradient-to-b
           from-[#030603]/45
via-[#050905]/12
            to-transparent
            "
        />

        {/* Bottom cinematic fade
      MUCH lighter than before */}
        <div
          className="
    absolute inset-x-0 bottom-0
    h-[18%]
    bg-gradient-to-t
   from-[#020603]/45
via-[#020603]/10
    to-transparent
  "
        />

        {/* Very subtle left vignette */}
        <div
          className="
      absolute inset-y-0 left-0
      w-[12%]
      bg-gradient-to-r
      from-[#020603]/20
      to-transparent
    "
        />

        {/* Very subtle right vignette */}
        <div
          className="
      absolute inset-y-0 right-0
      w-[15%]
      bg-gradient-to-l
      from-[#020603]/15
      to-transparent
    "
        />
      </div>

      {showImageBannerChrome && heroSlides.length > 1 ? (
        <div
          className="
          absolute
          bottom-[118px]
          left-[4.5vw]
          z-[35]
          flex
          items-center
          gap-2.5
        "
        >
          {heroSlides.map((slide, i) => (
            <button
              key={slide.id}
              type="button"
              aria-label={`Show banner ${i + 1}`}
              aria-current={i === slideIndex ? "true" : undefined}
              onClick={() => goToSlide(i)}
              className={`
              h-2 rounded-full transition-all duration-500
              ${
                i === slideIndex
                  ? "w-7 bg-[#a5d56d]/90"
                  : "w-2 bg-white/35 hover:bg-white/55"
              }
            `}
            />
          ))}
        </div>
      ) : null}

      {/* =========================================================
    SOFT CENTER ATMOSPHERE
    Keeps the hero image visible while gently separating
    the central typography from the bright landscape.
========================================================= */}
      {/* <div
        className="
    pointer-events-none
    absolute
    inset-0
    z-10

    bg-[radial-gradient(ellipse_48%_38%_at_50%_50%,rgba(5,10,7,0.34)_0%,rgba(5,10,7,0.22)_32%,rgba(5,10,7,0.09)_55%,transparent_78%)]
  "
      /> */}

      {/* =========================================================
    SOFT CENTER ATMOSPHERE
========================================================= */}
      <div
        className="
    pointer-events-none
    absolute
    inset-0
    z-10

    bg-[radial-gradient(ellipse_44%_34%_at_50%_50%,rgba(8,12,9,0.08)_0%,rgba(8,12,9,0.045)_36%,rgba(8,12,9,0.015)_58%,transparent_76%)]
  "
      />

      {showImageBannerChrome ? (
        <div
          className={`
    pointer-events-none
    absolute
    inset-y-0
    right-0
    z-20

    w-[42vw]
    min-w-[480px]
    max-w-[760px]

    overflow-visible

    transition-all
    duration-[2200ms]
    ease-[cubic-bezier(0.22,1,0.36,1)]

    ${intro ? "translate-x-0 opacity-100" : "translate-x-[8%] opacity-0"}
  `}
        >
          <img
            src={leafImage}
            alt=""
            aria-hidden="true"
            className={`
      absolute
      right-[0%]
      top-[-8%]

      h-[116%]
      w-auto
      max-w-none

      object-contain
      object-right-top

      brightness-[0.78]
      saturate-[0.95]
      contrast-[1.04]
      opacity-100

      drop-shadow-[-18px_0_45px_rgba(0,0,0,0.28)]

      transition-transform
      duration-[16000ms]
      ease-in-out

      ${
        camera
          ? "translate-x-[0.15%] translate-y-[-0.15%] scale-[1.008]"
          : "translate-x-0 translate-y-0 scale-100"
      }
    `}
          />

          <div
            className="
      pointer-events-none
      absolute
      inset-x-0
      bottom-0
      h-[18%]

      bg-gradient-to-t
      from-[#020603]/25
      via-[#020603]/8
      to-transparent
    "
          />
        </div>
      ) : null}
      {/* =========================================================
          LOGO
      ========================================================== */}

      {/* =========================================================
    PACIANO BRAND MARK
========================================================= */}

      {/* <div
        className={[
          "absolute",
          "left-1/2",
          "top-[15%]",
          "z-40",
          "-translate-x-1/2",
          "flex",
          "items-center",
          "justify-center",
          "transition-all",
          "duration-[1500ms]",
          "ease-[cubic-bezier(0.22,1,0.36,1)]",
          intro
            ? "translate-y-0 scale-100 opacity-100"
            : "translate-y-5 scale-[0.92] opacity-0",
        ].join(" ")}
      >
        <img
          src={logoImage}
          alt="Paciano"
          className="
      h-auto
      w-[190px]
      object-contain

      sm:w-[220px]
      md:w-[250px]
      lg:w-[128px]

      brightness-[0.95]
      saturate-[1.05]

      drop-shadow-[0_8px_30px_rgba(0,0,0,0.25)]
    "
        />
      </div> */}
      {/* =========================================================
    PACIANO CENTER BRAND MARK
========================================================== */}

      {showImageBannerChrome ? (
        <div
          className={[
            "absolute",
            "left-1/2",
            "top-[13.5%]",
            "z-40",
            "-translate-x-1/2",
            "flex",
            "flex-col",
            "items-center",
            "justify-center",
            "pointer-events-none",
            "transition-all",
            "duration-[1800ms]",
            "ease-[cubic-bezier(0.22,1,0.36,1)]",
            logoOpen ? "opacity-100" : "translate-y-6 opacity-0",
          ].join(" ")}
        >
          <img
            src={logoImage}
            alt="Paciano"
            className="
      h-auto
      w-[145px]
      object-contain

      sm:w-[160px]
      md:w-[175px]
      lg:w-[185px]

      brightness-[0.98]
      saturate-[1.02]
    "
            style={{
              animation: logoOpen
                ? "pacianoLogoReveal 1800ms cubic-bezier(0.22,1,0.36,1) both, pacianoLogoGlow 7s ease-in-out 2s infinite"
                : "none",
            }}
          />

          <div
            className="
      pointer-events-none
      absolute
      -inset-8
      -z-10
      rounded-full
      bg-[#a5d56d]/[0.035]
      blur-3xl
    "
          />
        </div>
      ) : null}

      {showImageBannerChrome ? (
        <div
          className={`
          relative
          z-30

          flex
          h-full
          items-center
          justify-center

          px-5
          pb-12
          pt-20

          sm:px-8
          md:px-12
          lg:px-16

          transition-all
          duration-[1800ms]
          ease-out

          ${intro ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"}
        `}
        >
        <div
          className="
            flex
            w-full
            max-w-[1100px]
            flex-col
            items-center
            text-center

            mt-[90px]
sm:mt-[85px]
md:mt-[80px]
lg:mt-[75px]
          "
        >
          {/* =====================================================
              EYEBROW
          ====================================================== */}

          <div
            className="
    mb-5
    flex
    w-full
    max-w-[470px]
    items-center
    justify-center
    gap-4
  "
            style={{
              animation: intro
                ? "pacianoEyebrow 1400ms cubic-bezier(0.22,1,0.36,1) 900ms both"
                : "none",
            }}
          >
            <span className="h-px flex-1 bg-[#a6bf82]/55" />

            <span
              className="
                whitespace-nowrap

                text-[8px]
                font-medium
                uppercase
                tracking-[0.38em]

                text-[#f1eadc]/90

                sm:text-[9px]
                md:text-[10px]
              "
            >
              A SANCTUARY IN THE HILLS
            </span>

            <span className="h-px flex-1 bg-[#a6bf82]/55" />
          </div>

          {/* =====================================================
              MAIN HEADING
          ====================================================== */}

          {/* <h1 
            className="
              font-serif
              font-normal
              leading-[0.88]

              tracking-[-0.045em]

              text-[47px]
              text-[#f6f0e5]

              sm:text-[62px]
              md:text-[78px]
              lg:text-[96px]
              xl:text-[108px]
            "
          >
            {/* First line

            <span
              className="block"
              style={{
                animation: intro
                  ? "pacianoHeading 1500ms cubic-bezier(0.22,1,0.36,1) 1200ms both"
                  : "none",
              }}
            >
              Where Nature
            </span> */}

          {/* Second line 

            <span
              className="
    mt-1
    block
    font-serif
    italic
    text-[#a5d56d]
  "
              style={{
                animation: intro
                  ? "pacianoHeading 1700ms cubic-bezier(0.22,1,0.36,1) 1450ms both"
                  : "none",
              }}
            >
              Welcomes You.
            </span>
          </h1>*/}

          <h1
            className="
                text-center
                font-['Cormorant_Garamond']
                font-medium
                leading-[0.88]
                tracking-[-0.025em]

                text-[44px]
                sm:text-[52px]
                md:text-[60px]
                lg:text-[68px]
                xl:text-[76px]

                max-w-[760px]
                mx-auto
            "
          >
            <span
              className="block text-[#f5efe5]"
              style={{
                animation: intro
                  ? "pacianoHeading 1500ms cubic-bezier(0.22,1,0.36,1) 1200ms both"
                  : "none",
              }}
            >
              Where Nature
            </span>

            <span
              className="
      block
      mt-1
      italic
      font-normal
      text-[#a5d56d]
    "
              style={{
                animation: intro
                  ? "pacianoHeading 1700ms cubic-bezier(0.22,1,0.36,1) 1450ms both"
                  : "none",
              }}
            >
              Welcomes You.
            </span>
          </h1>

          {/* =====================================================
              SMALL DIAMOND DIVIDER
          ====================================================== */}

          {/* <div
            className={`
              my-6

              flex
              w-full
              max-w-[330px]
              items-center
              gap-4

              transition-all
              delay-[700ms]
              duration-[1200ms]

              ${intro ? "scale-100 opacity-100" : "scale-[0.8] opacity-0"}
            `}
          > */}
          <div
            className="
    my-6
    flex
    w-full
    max-w-[330px]
    items-center
    gap-4
  "
            style={{
              animation: intro
                ? "pacianoDivider 1300ms cubic-bezier(0.22,1,0.36,1) 2100ms both"
                : "none",
            }}
          >
            <span className="h-px flex-1 bg-[#9ab574]/45" />

            {/* <span
              className="
                text-[11px]
                text-[#a5d56d]
              "
            >  ◆
            </span>*/}
            <span
              className="
    text-[10px]
    text-[#a5d56d]
  "
              style={{
                animation: intro
                  ? "pacianoDiamond 4s ease-in-out 3.2s infinite"
                  : "none",
              }}
            >
              ◆
            </span>

            <span className="h-px flex-1 bg-[#9ab574]/45" />
          </div>

          {/* =====================================================
              DESCRIPTION
          ====================================================== */}

          <p
            className="
    relative
    z-10

    max-w-[600px]

    text-[12px]
    leading-[1.75]
    font-light
    tracking-[0.01em]

    text-white/95

    sm:text-[13px]
    md:text-[14px]

    drop-shadow-[0_2px_10px_rgba(0,0,0,0.65)]
  "
            style={{
              animation: intro
                ? "pacianoCopy 1300ms cubic-bezier(0.22,1,0.36,1) 2400ms both"
                : "none",
            }}
          >
            Rivers, forests, slow mornings and starlit nights —
            <br className="hidden sm:block" />
            at Paciano, every moment brings you closer to what truly matters.
          </p>
          {/* =====================================================
              CTA
          ====================================================== */}

          <div
            style={{
              animation: intro
                ? "pacianoCTA 1400ms cubic-bezier(0.22,1,0.36,1) 2800ms both"
                : "none",
            }}
          >
            <button
              type="button"
              //   className="
              //     group

              //     mt-7

              //     flex
              //     h-[55px]
              //     min-w-[225px]
              //     items-center
              //     justify-between

              //     rounded-full

              //     border
              //     border-white/35

              //     bg-[#11180f]/35

              //     px-7

              //     text-[10px]
              //     font-medium
              //     uppercase
              //     tracking-[0.28em]
              //     text-white

              //     backdrop-blur-md

              //     shadow-[0_12px_45px_rgba(0,0,0,0.22)]

              //     transition-all
              //     duration-500

              //     hover:border-[#b5d582]/70
              //     hover:bg-[#1b2817]/65
              //     hover:shadow-[0_18px_60px_rgba(0,0,0,0.38)]

              //     sm:h-[58px]
              //     sm:min-w-[250px]
              //     sm:px-8
              //   "
              className="
  group
  relative
  mt-7

  flex
  h-[54px]
  min-w-[220px]
  items-center
  justify-between

  overflow-hidden
  rounded-full

  border
  border-white/55

  bg-[#182017]/60

  px-7

  text-[10px]
  font-medium
  uppercase
  tracking-[0.28em]
  text-white

  backdrop-blur-md

  shadow-[0_10px_35px_rgba(0,0,0,0.28)]

  transition-all
  duration-500

  hover:border-[#b5d582]/80
  hover:bg-[#1b2817]/75
  hover:shadow-[0_15px_45px_rgba(0,0,0,0.38)]

  sm:h-[57px]
  sm:min-w-[235px]
  sm:px-8
"
            >
              <span
                className="
    pointer-events-none
    absolute
    inset-y-0
    left-0
    w-[35%]
    -skew-x-12
       bg-white/[0.055]
  "
                style={{
                  animation: intro
                    ? "pacianoShimmer 6s ease-in-out 4s infinite"
                    : "none",
                }}
              />
              <span>DISCOVER PACIANO</span>

              <span
                className="
                  text-lg
                  font-light

                  transition-transform
                  duration-500

                  group-hover:translate-x-2
                "
              >
                →
              </span>
            </button>
          </div>
        </div>
        </div>
      ) : null}

      {showImageBannerChrome ? (
      <div
        className="
          absolute
          bottom-[105px]
          right-[4.5vw]
          z-40

          hidden
          flex-col
          items-center

          md:flex
        "
      >
        <button
          type="button"
          onClick={() => {
            const videoIdx = heroSlides.findIndex((s) => s.kind === "video");
            if (videoIdx >= 0) goToSlide(videoIdx);
          }}
          className="
            group

            flex
            h-[72px]
            w-[72px]
            items-center
            justify-center

            rounded-full

            border
            border-white/25

            bg-[#11190f]/65

            shadow-[0_15px_50px_rgba(0,0,0,0.4)]

            backdrop-blur-md

            transition-all
            duration-700

            hover:scale-110
            hover:border-[#b5d582]/60
            hover:bg-[#1b2917]/80
          "
        >
          <span
            className="
              ml-1
              text-[16px]
              text-white

              transition-transform
              duration-500

              group-hover:scale-110
            "
          >
            ▶
          </span>
        </button>

        <p
          className="
            mt-4

            text-center
            text-[8px]
            uppercase
            leading-[1.8]
            tracking-[0.30em]
            text-white/90
          "
        >
          WATCH
          <br />
          OUR STORY
        </p>
      </div>
      ) : null}

      {showImageBannerChrome ? (
      <div
        className="
          absolute
          bottom-7
          left-1/2
          z-40

          hidden
          -translate-x-1/2
          flex-col
          items-center

          md:flex
        "
      >
        <span
          className="
            mb-2
            text-xs
            text-[#a5d56d]

            animate-bounce
          "
        >
          ◆
        </span>

        <p
          className="
            text-center
            text-[8px]
            uppercase
            leading-[1.8]
            tracking-[0.30em]
            text-white/80
          "
        >
          SCROLL
          <br />
          TO EXPLORE
        </p>
      </div>
      ) : null}

      {showImageBannerChrome ? (
      <div
        className="
          absolute
          bottom-6
          left-1/2
          z-40

          flex
          -translate-x-1/2
          flex-col
          items-center

          md:hidden
        "
      >
        <span className="mb-2 text-xs text-[#a5d56d]">◆</span>

        <span
          className="
            whitespace-nowrap
            text-[8px]
            uppercase
            tracking-[0.30em]
            text-white/80
          "
        >
          Scroll to explore
        </span>
      </div>
      ) : null}
    </section>
  );
}
