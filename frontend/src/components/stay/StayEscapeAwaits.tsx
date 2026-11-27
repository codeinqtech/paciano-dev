import { useState, useRef, useEffect } from "react";
const bookingRiverSunrise = new URL("../../images/booking-river-sunrise.jpg", import.meta.url).href;
const leafWhisper = new URL("../../images/leaf-whisper.png", import.meta.url).href;
// import { FOOTER_DARK } from "@/components/stay/StayPageContent";


interface StayEscapeAwaitsProps {
  onExperience: () => void;
}

export default function EscapeAwaits({ onExperience }: StayEscapeAwaitsProps) {
  const [submitted, setSubmitted] = useState(false);
  const sectionRef = useRef<HTMLElement | null>(null);
  const [sectionVisible, setSectionVisible] = useState(false);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setSectionVisible(entry.isIntersecting);
      },
      {
        threshold: 0.15,
        rootMargin: "0px 0px -10% 0px",
      },
    );

    observer.observe(section);

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    let frame1 = 0;
    let frame2 = 0;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          observer.disconnect();

          // Allow the hidden state to render before starting animations.
          frame1 = requestAnimationFrame(() => {
            frame2 = requestAnimationFrame(() => {
              setSectionVisible(true);
            });
          });
        }
      },
      {
        threshold: 0.12,
        rootMargin: "0px 0px -8% 0px",
      },
    );

    observer.observe(section);

    return () => {
      observer.disconnect();
      cancelAnimationFrame(frame1);
      cancelAnimationFrame(frame2);
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      id="booking"
      // className="relative min-h-[clamp(560px,78vh,920px)] overflow-hidden bg-[#09160F] pb-8 pt-8 sm:pb-10 sm:pt-10 lg:pt-12"
      className="relative min-h-[clamp(560px,78vh,920px)] overflow-hidden bg-[#eeeee5] pb-8 pt-8 sm:pb-10 sm:pt-10 lg:pt-12"
      aria-labelledby="booking-title"
    >
      {/* <img
        src={bookingRiverSunrise}
        alt=""
        aria-hidden
        className="pointer-events-none absolute inset-0 h-full w-full object-cover object-center"
      /> */}
      <img
        src={bookingRiverSunrise}
        alt=""
        aria-hidden
        className={`
          pointer-events-none absolute inset-0
          h-full w-full object-cover object-center
          transition-all
          duration-[1800ms]
          ease-[cubic-bezier(0.16,1,0.3,1)]
          ${sectionVisible ? "scale-100 opacity-100" : "scale-[1.04] opacity-0"}
        `}
        style={{
          WebkitMaskImage:
            "linear-gradient(to bottom, transparent 0%, black 27%, black 100%)",
          maskImage:
            "linear-gradient(to bottom, transparent 0%, black 27%, black 100%)",
        }}
      />
      {/* <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 z-[6]"
        style={{ height: "clamp(180px, 28vw, 340px)" }}
      >
        <div
          className="absolute inset-0"
          style={{
            background: `linear-gradient(
              to bottom,
              ${STAY_CREAM} 0%,
              ${STAY_CREAM} 12%,
              rgba(248,245,238,0.92) 28%,
              rgba(248,245,238,0.65) 45%,
              rgba(248,245,238,0.28) 65%,
              rgba(248,245,238,0.08) 82%,
              transparent 100%
            )`,
          }}
        />
      </div> */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-[5]"
        style={{
          background:
            "linear-gradient(to right, rgba(9,30,21,0.76) 0%, rgba(14,45,32,0.48) 30%, rgba(14,45,32,0.20) 60%, transparent 100%)",
          WebkitMaskImage:
            "linear-gradient(to bottom, transparent 0%, black 27%, black 100%)",
          maskImage:
            "linear-gradient(to bottom, transparent 0%, black 27%, black 100%)",
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 z-[6] h-[min(62%,560px)]"
        style={{
          background: `linear-gradient(to top,
            ${FOOTER_DARK} 0%,
            rgba(9, 22, 15, 0.92) 12%,
            rgba(9, 22, 15, 0.65) 32%,
            rgba(9, 22, 15, 0.28) 58%,
            transparent 100%)`,
        }}
      />
      {/* <div className="page-container relative z-[8] grid items-center gap-10 py-16 pb-[clamp(72px,10vw,120px)] lg:grid-cols-[1fr_1.15fr] lg:gap-16 lg:py-24 lg:pb-[clamp(88px,11vw,140px)]"> */}
      <div className="page-container relative z-[8] grid w-full min-w-0 grid-cols-1 items-center gap-10 px-5 py-12 pb-[clamp(72px,10vw,120px)] sm:px-8 sm:py-16 lg:grid-cols-[1fr_1.15fr] lg:gap-16 lg:px-0 lg:py-24 lg:pb-[clamp(88px,11vw,140px)]">
        <div>
          <div
            // className="mb-6 flex items-center gap-3 sm:mb-8"
            className={`
            mb-6 flex items-center gap-3 sm:mb-8
            transition-all duration-[1000ms]
            ease-[cubic-bezier(0.16,1,0.3,1)]
            ${
              sectionVisible
                ? "translate-y-0 opacity-100"
                : "translate-y-6 opacity-0"
            }
          `}
            style={{ transitionDelay: sectionVisible ? "350ms" : "0ms" }}
          >
            {/* <span className="h-px w-8 bg-[#9A8553] sm:w-10" /> */}
            {/* Leaf SVG */}
            <svg
              viewBox="0 0 32 32"
              className="
                h-[21px]
                w-[21px]
                shrink-0               
                text-[#E5CB91]
              "
              fill="none"
            >
              <path
                d="M16 27C16 19 18 12 23 5"
                stroke="currentColor"
                strokeWidth="1"
              />

              <path
                d="
                  M17 19
                  C10 17 7 12 8 7
                  C14 8 18 13 18 18
                "
                fill="currentColor"
                opacity=".8"
              />

              <path
                d="
                  M19 14
                  C20 8 25 5 29 7
                  C27 12 24 15 19 16
                "
                fill="currentColor"
                opacity=".5"
              />
            </svg>
            <span
              className="
                whitespace-nowrap
                text-[12px]
                font-semibold
                uppercase
                tracking-[0.28em]
                text-[#F2D69B]
              "
              style={{
                textShadow: "0 1px 10px rgba(0,0,0,0.45)",
              }}
            >
              YOUR ESCAPE AWAITS
            </span>
          </div>
          {/* <Eyebrow light>YOUR ESCAPE AWAITS</Eyebrow> */}
          <h2
            id="booking-title"
            // className="font-display mt-6 max-w-[600px] text-[clamp(3.6rem,5vw,5.7rem)] leading-[0.95] tracking-[-0.04em] text-white"
            className={`
              font-display mt-4 sm:mt-6
              w-full max-w-full min-w-0
              text-[clamp(2.2rem,10vw,3.6rem)]
              sm:text-[clamp(3.6rem,5vw,5.7rem)]
              leading-[0.98] tracking-[-0.04em] text-white
              transition-all duration-[1200ms]
              ease-[cubic-bezier(0.16,1,0.3,1)]
              ${sectionVisible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"}
            `}
            style={{ transitionDelay: sectionVisible ? "650ms" : "0ms" }}
          >
            Ready to Stay
            <br />
            <span
              className="
                block
                max-w-full
                whitespace-normal
                break-words
                font-['Cormorant_Garamond',serif]
                italic
                text-[#E5CB91]
              "
            >
              Closer to Nature?
            </span>
          </h2>
          <p
            // className="mt-6 max-w-[395px] text-sm leading-[1.8] text-white/80
            className="
              mt-5 w-full min-w-0 max-w-[430px]
              font-manrope
              text-[clamp(12px,0.95vw,15px)]              
              leading-[1.9] text-[#FFF9EE]/90
              sm:mt-6 sm:text-[13px]
              md:text-sm
              transition-all
              duration-[1100ms]
              ease-[cubic-bezier(0.16,1,0.3,1)]
            "
            style={{
              textShadow: "0 2px 8px rgba(0,0,0,0.8)",
              transitionDelay: sectionVisible ? "1000ms" : "0ms",
              opacity: sectionVisible ? 1 : 0,
              transform: sectionVisible ? "translateY(0)" : "translateY(22px)",
            }}
          >
            A slower pace, a beautiful view, and moments that feel entirely your
            own. Imagine a morning with nothing on your itinerary but the
            mountains, the river, and the view.
          </p>
          <div
            className={`
            mt-[35px] will-change-transform
            transition-all duration-[1100ms]
            ease-[cubic-bezier(0.16,1,0.3,1)]
            ${
              sectionVisible
                ? "translate-y-0 opacity-100"
                : "translate-y-7 opacity-0"
            }
          `}
            style={{ transitionDelay: sectionVisible ? "1300ms" : "0ms" }}
          >
            <a
              href="#location-details"
              className="
                group
                relative

                inline-flex
                h-[52px]
                min-w-[235px]

                items-center
                justify-between

                overflow-visible
                rounded-full

                border
                border-[#B8B98B]/75

                bg-gradient-to-b
                from-[#5A6440]
                via-[#4D5736]
                to-[#414A2F]

                px-[10px]
                pl-[64px]
                pr-[9px]

                text-[#F4EFE4]

                shadow-[0_8px_24px_rgba(39,46,26,0.22),inset_0_1px_0_rgba(255,255,255,0.16)]

                transition-all
                duration-700
                ease-[cubic-bezier(.22,1,.36,1)]

                hover:-translate-y-[3px]
                hover:scale-[1.015]
                hover:border-[#D0C89B]
                hover:shadow-[0_16px_36px_rgba(39,46,26,0.30),inset_0_1px_0_rgba(255,255,255,0.20)]
              "
            >
              {/* ===================================================
                  SOFT GOLDEN INNER GLOW
              ==================================================== */}

              <span
                className="
                  pointer-events-none
                  absolute
                  inset-[1px]
                  rounded-full

                  bg-gradient-to-b
                  from-[#D8D3A8]/[0.10]
                  via-transparent
                  to-[#1F2818]/[0.16]

                  opacity-100
                "
              />

              {/* ===================================================
              LUXURY SHINE BAND
              Visible by default + stronger on hover
          ==================================================== */}

              <span
                className="
                  pointer-events-none
                  absolute
                  left-[24%]
                  top-[3px]

                  h-[46px]
                  w-[42%]

                  rotate-[7deg]

                  rounded-full

                  bg-gradient-to-r
                  from-transparent
                  via-[#F8F2DD]/[0.10]
                  to-transparent

                  blur-[5px]

                  opacity-80

                  transition-all
                  duration-[1200ms]
                  ease-[cubic-bezier(.22,1,.36,1)]

                  group-hover:left-[48%]
                  group-hover:opacity-100
                "
              />

              {/* ===================================================
                  THIN WARM LIGHT ALONG LOWER EDGE
              ==================================================== */}

              <span
                className="
                  pointer-events-none
                  absolute
                  inset-x-[18%]
                  bottom-[3px]

                  h-px

                  bg-gradient-to-r
                  from-transparent
                  via-[#D7CF9B]/70
                  to-transparent

                  opacity-70

                  transition-opacity
                  duration-700

                  group-hover:opacity-100
                "
              />

              {/* ===================================================
                  LEAF
              ==================================================== */}

              <span
                className="
                  pointer-events-none
                  absolute
                  left-[-8px]
                  bottom-[-10px]

                  z-20

                  h-[78px]
                  w-[82px]

                  origin-bottom-left

                  transition-all
                  duration-[900ms]
                  ease-[cubic-bezier(.22,1,.36,1)]

                  group-hover:translate-x-[3px]
                  group-hover:translate-y-[-2px]
                  group-hover:rotate-[-4deg]
                  group-hover:scale-[1.05]
                "
              >
                <img
                  src={leafWhisper}
                  alt=""
                  aria-hidden="true"
                  className="
                  h-full
                  w-auto
                  max-w-none

                  object-contain

                  brightness-[0.92]
                  contrast-[1.08]
                  saturate-[0.92]

                  drop-shadow-[0_5px_8px_rgba(22,28,16,0.18)]

                  transition-all
                  duration-[900ms]
                  ease-[cubic-bezier(.22,1,.36,1)]

                  group-hover:brightness-[1.03]
                  group-hover:contrast-[1.04]
                "
                />
              </span>

              {/* ===================================================
                    VERY SOFT LEAF LIGHT
                ==================================================== */}

              <span
                className="
                  pointer-events-none
                  absolute
                  left-[11px]
                  bottom-[7px]

                  z-[5]

                  h-[46px]
                  w-[46px]

                  rounded-full

                  bg-[#D8CF9C]/[0.10]

                  blur-[15px]

                  transition-all
                  duration-1000

                  group-hover:bg-[#E2D9A8]/[0.18]
                "
              />

              {/* ===================================================
              TEXT
          ==================================================== */}

              <span
                className="
              relative
              z-30

              mr-auto

              whitespace-nowrap

              text-[9px]
              font-medium
              uppercase

              tracking-[0.30em]

              text-[#F4EFE4]

              drop-shadow-[0_1px_2px_rgba(31,37,23,0.20)]

              transition-all
              duration-700
              ease-[cubic-bezier(.22,1,.36,1)]

              group-hover:translate-x-[3px]
              group-hover:tracking-[0.36em]
            "
              >
                Plan Your Stay
              </span>

              {/* ===================================================
              SEPARATOR
          ==================================================== */}

              <span
                className="
                  relative
                  z-30

                  mx-[13px]

                  h-[22px]
                  w-px

                  bg-[#F4EFE4]/35

                  transition-all
                  duration-700
                  ease-[cubic-bezier(.22,1,.36,1)]

                  group-hover:h-[27px]
                  group-hover:bg-[#E5DDBA]/65
                "
              />

              {/* ===================================================
              ARROW MEDALLION
          ==================================================== */}

              <span
                className="
              relative
              z-30

              flex
              h-[32px]
              w-[32px]
              shrink-0

              items-center
              justify-center

              rounded-full

              border
              border-[#E4DEC1]/55

              bg-gradient-to-b
              from-[#F0E9D3]/[0.12]
              to-[#B7AF88]/[0.05]

              shadow-[inset_0_1px_0_rgba(255,255,255,0.16)]

              transition-all
              duration-700
              ease-[cubic-bezier(.22,1,.36,1)]

              group-hover:translate-x-[4px]
              group-hover:scale-[1.08]
              group-hover:border-[#F0E9D3]/85
              group-hover:bg-[#F4EFE4]/[0.14]
            "
              >
                <span
                  className="
                text-[15px]
                leading-none

                text-[#F4EFE4]

                transition-all
                duration-700
                ease-[cubic-bezier(.22,1,.36,1)]

                group-hover:translate-x-[2px]
              "
                >
                  →
                </span>
              </span>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}