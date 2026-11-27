import {
  useEffect,
  useRef,
  useState,
  type FormEvent,
  type ReactNode,
} from "react";
import {
  ArrowLeft,
  ArrowRight,
  Bath,
  BedDouble,
  CalendarDays,
  Check,
  Coffee,
  ConciergeBell,
  Leaf,
  Mountain,
  ParkingCircle,
  Play,
  Quote,
  Sparkles,
  Star,
  Sunrise,
  Users,
  UtensilsCrossed,
  Waves,
  Wifi,
  X,
  type LucideIcon,
} from "lucide-react";
import { motion, useReducedMotion, AnimatePresence } from "framer-motion";
import heroBanner from "@/images/stay/stay-banner.png";
import leafWhisper from "@/images/button-leaf.png";
import heroBannerAlt from "@/images/stay/hero-banner-alt.jpg";

import bookingRiverSunrise from "@/images/stay/booking-river-sunrise.png";
import resortDeck from "@/images/stay/resort-deck.png";
import natureWalks from "@/images/stay/nature-walks.png";
import slowDaysMoments from "@/images/stay/slow-days-moments.png";

import bonfire from "@/images/stay/bonfire.png";
import clientRoom1 from "@/images/stay/client-room-1.jpeg";
import clientRoom2 from "@/images/stay/client-room-2.jpeg";
import clientRoom3 from "@/images/stay/client-room-3.jpeg";
import clientRoom4 from "@/images/stay/client-room-4.jpeg";
import clientRoom5 from "@/images/stay/client-room-5.jpeg";
import clientRoom6 from "@/images/stay/client-room-6.jpeg";
import MistSectionBridge from "@/components/MistSectionBridge";
import StayPhotoBridge from "@/components/stay/StayPhotoBridge";
import StayBotanicalBackdrop from "@/components/stay/StayBotanicalBackdrop";
import Footer from "@/components/Footer";
import { createPortal } from "react-dom";











// new code start 
import StayHero from "./StayHero";
import StayRoomCollection from "./StayRoomCollection";
// import StayFeatures from "./StayFeatures";
// import DayAtPaciano from "./DayAtPaciano";
import StayEscapeAwaits from "./StayEscapeAwaits";

const STAY_CREAM = "#F8F5EE";
const FOOTER_DARK = "#09160F";

type Room = {
  title: string;
  category: string;
  image: string;
  description: string;
  subtitle: string;
  details: string;
  price: string;
};

const rooms: Room[] = [
  {
    title: "Riverside Suite",
    category: "Riverside",
    image: clientRoom1,
    description:
      "Wake up to the gentle flow of the river and panoramic valley views.",
    subtitle: "Where Mornings Begin With a View.",
    details:
      "A spacious and elegant suite with a private balcony overlooking the river and mountains. Designed for those who seek tranquility with a touch of luxury.",
    price: "₹8,500",
  },
  {
    title: "Garden Residence",
    category: "Garden View",
    image: clientRoom2,
    description:
      "Surrounded by lush gardens and greenery, perfect for a peaceful retreat.",
    subtitle: "A Little Closer to the Green.",
    details:
      "An inviting residence with warm natural textures and a quiet private balcony, made for slowing down and settling in.",
    price: "₹7,200",
  },
  {
    title: "Valley Retreat",
    category: "Mountain View",
    image: clientRoom3,
    description:
      "Immerse yourself in the hills and the beauty of an endless horizon.",
    subtitle: "Room to Take It All In.",
    details:
      "Open the doors to sweeping mountain views, soft mornings, and a space thoughtfully considered for your comfort.",
    price: "₹9,200",
  },
  {
    title: "Family Sanctuary",
    category: "Family Stay",
    image: clientRoom4,
    description: "Space to gather, unwind and make memories together.",
    subtitle: "Together Is a Beautiful Place to Be.",
    details:
      "Generous spaces, comforting details, and nature just outside the door make this a wonderful home for the whole family.",
    price: "₹11,500",
  },
  // {
  //   title: "Villa Escape",
  //   category: "Villas",
  //   image: clientRoom5,
  //   description: "An intimate hideaway with a world of nature all your own.",
  //   subtitle: "Your Own Corner of Paradise.",
  //   details:
  //     "A private retreat crafted for unhurried days, intimate evenings, and the simple pleasure of having it all to yourself.",
  //   price: "₹14,500",
  // },
];

const amenities: { label: string; icon: LucideIcon }[] = [
  { label: "Complimentary Breakfast", icon: ConciergeBell },
  { label: "High-Speed WiFi", icon: Wifi },
  { label: "Thoughtful Hospitality", icon: Sparkles },
  { label: "Tea & Coffee Station", icon: Coffee },
  { label: "Natural Toiletries", icon: Leaf },
  { label: "In-Room Dining", icon: UtensilsCrossed },
  { label: "Free Parking", icon: ParkingCircle },
  { label: "Nature View", icon: Mountain },
];

const moments = [
  {
    time: "06:00 AM",
    title: "Sunrise over lush tea gardens",
    image: slowDaysMoments,
  },
  { time: "08:00 AM", title: "Breakfast by the river", image: resortDeck },
  {
    time: "04:00 PM",
    title: "Nature walk & local experiences",
    image: natureWalks,
  },
  {
    time: "07:00 PM",
    title: "Bonfire & dining under the stars",
    image: bonfire,
  },
];

function Eyebrow({
  children,
  light = false,
}: {
  children: ReactNode;
  light?: boolean;
}) {
  return (
    <p className={`eyebrow ${light ? "text-[#e9d7a7]" : "text-[#52694b]"}`}>
      <Sparkles
        aria-hidden="true"
        size={12}
        className="shrink-0 text-[#b89b5e]"
      />
      {children}
    </p>
  );
}

function CircleArrow({
  direction = "right",
  onClick,
  label,
  className = "",
}: {
  direction?: "left" | "right";
  onClick?: () => void;
  label: string;
  className?: string;
}) {
  const Icon = direction === "left" ? ArrowLeft : ArrowRight;
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className={`circle-arrow ${className}`}
    >
      <Icon size={18} strokeWidth={1.5} />
    </button>
  );
}








function StayFeatures() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting);
      },
      {
        threshold: 0.15,
        rootMargin: "0px 0px -5% 0px",
      },
    );

    observer.observe(section);

    return () => observer.disconnect();
  }, []);

  return (
    <section
      ref={sectionRef}
      aria-label="Included stay amenities"
      className="bg-[#F8F5EE] py-14 lg:py-18"
    >
      <div className="page-container grid grid-cols-2 gap-y-9 sm:grid-cols-4 lg:grid-cols-8">
        {amenities.map(({ label, icon: Icon }, index) => (
          <div
            key={label}
            style={{
              transitionDelay: isVisible ? `${index * 120}ms` : "0ms",
            }}
            className={`
              group
              flex min-h-[100px]
              flex-col items-center justify-center
              gap-4 border-r border-[#e5e1d6]
              px-3 text-center last:border-0
              [&:nth-child(2n)]:max-sm:border-0
              [&:nth-child(4n)]:max-lg:border-0
              transition-all
              duration-[900ms]
              ease-[cubic-bezier(0.16,1,0.3,1)]
              ${
                isVisible
                  ? "translate-y-0 opacity-100"
                  : "translate-y-7 opacity-0"
              }
            `}
          >
            <span
              className="
                flex items-center justify-center
                text-[#3f5b3f]
                animate-[stayIconFloat_3.5s_ease-in-out_infinite]
                transition-transform duration-700
                group-hover:-translate-y-2
                group-hover:scale-110
              "
              style={{
                animationDelay: `${index * 180}ms`,
              }}
            >
              <Icon
                size={27}
                strokeWidth={1.25}
                className="transition-all duration-700 group-hover:drop-shadow-[0_4px_5px_rgba(63,91,63,0.20)]"
              />
            </span>

            <span
              className="
                max-w-[105px]
                text-[11px]
                leading-[1.45]
                text-[#334136]
                transition-colors duration-500
                group-hover:text-[#71864F]
              "
            >
              {label}
            </span>
          </div>
        ))}
      </div>

      <style>
        {`
          @keyframes stayIconFloat {
            0%, 100% {
              transform: translateY(0);
            }
            50% {
              transform: translateY(-5px);
            }
          }

          @media (prefers-reduced-motion: reduce) {
            .group,
            .group * {
              animation: none !important;
              transition-duration: 0.01ms !important;
            }
          }
        `}
      </style>
    </section>
  );
}

function DayAtPaciano() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const timelineRef = useRef<HTMLOListElement | null>(null);

  const [visible, setVisible] = useState(false);
  const [active, setActive] = useState(0);

  const move = (step: number) =>
    setActive((current) => (current + step + moments.length) % moments.length);

  const activeImage = active === 0 ? slowDaysMoments : moments[active].image;

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setVisible(entry.isIntersecting);
      },
      {
        threshold: 0.12,
        rootMargin: "0px 0px -8% 0px",
      },
    );

    observer.observe(section);

    return () => observer.disconnect();
  }, []);

  // Automatic carousel movement
  useEffect(() => {
    const interval = window.setInterval(() => {
      setActive((current) => (current + 1) % moments.length);
    }, 4500); // Change image every 4.5 seconds

    return () => window.clearInterval(interval);
  }, []);

  // Automatically slide to the active card on compact landscape screens
  // Slide to active card on mobile portrait and landscape
  useEffect(() => {
    const isMobile = window.matchMedia(
      "(orientation: portrait) and (max-width: 767px)",
    ).matches;

    if (!isMobile) return;

    const container = timelineRef.current;
    if (!container) return;

    const activeItem = container.querySelector<HTMLElement>(
      `[data-moment-index="${active}"]`,
    );

    if (!activeItem) return;

    const containerRect = container.getBoundingClientRect();
    const itemRect = activeItem.getBoundingClientRect();

    const left =
      container.scrollLeft +
      itemRect.left -
      containerRect.left -
      (container.clientWidth - itemRect.width) / 2;

    container.scrollTo({
      left: Math.max(0, left),
      behavior: "smooth",
    });
  }, [active]);

  return (
    <section
      ref={sectionRef}
      className="relative isolate overflow-hidden bg-[#eeeee5]"
      aria-labelledby="day-title"
    >
      <div
        className="
          grid
          grid-cols-1
          md:grid-cols-1
          lg:grid-cols-2
          [@media(orientation:landscape)_and_(max-height:500px)_and_(max-width:950px)]:!grid-cols-[minmax(0,1.2fr)_minmax(220px,0.8fr)]
          md:grid-cols-2
          lg:grid-cols-[36%_34%_30%]
          xl:grid-cols-[40%_32%_28%]
          min-h-0
          lg:min-h-[580px]
          xl:min-h-[620px]
        "
      >
        {/* =========================================
            SCENIC IMAGE
        ========================================= */}

        <div
          className={`
          relative
          isolate
          col-span-1
          mx-3
          h-[280px]
          min-h-0
          overflow-hidden
          rounded-[15px]
          sm:mx-5
          sm:h-[360px]
          sm:rounded-[19px] 
          md:mx-6
          md:h-[420px]
          md:rounded-[19px]
          lg:col-span-1
          lg:mx-0
          lg:h-full
          lg:min-h-full
          lg:rounded-none

          transition-all
          duration-[1400ms]
          ease-[cubic-bezier(0.16,1,0.3,1)]
          ${visible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"}

          md:col-span-2

          [@media(orientation:portrait)_and_(min-width:768px)_and_(max-width:950px)]:!col-span-2
          [@media(orientation:portrait)_and_(min-width:768px)_and_(max-width:950px)]:!row-start-1
          [@media(orientation:landscape)_and_(max-height:500px)_and_(max-width:950px)]:!col-span-2
          [@media(orientation:landscape)_and_(max-height:500px)_and_(max-width:950px)]:!row-start-1
          [@media(orientation:landscape)_and_(max-height:500px)_and_(max-width:950px)]:!block
          [@media(orientation:landscape)_and_(max-height:500px)_and_(max-width:950px)]:!h-[180px]
          [@media(orientation:landscape)_and_(max-height:500px)_and_(max-width:950px)]:!mx-3

        `}
        >
          <AnimatePresence initial={false}>
            <motion.img
              key={active}
              src={activeImage}
              alt="Guest enjoying a quiet moment at Paciano"
              loading="lazy"
              initial={{ opacity: 0, scale: 1.025 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{
                opacity: {
                  duration: 1.4,
                  ease: [0.22, 1, 0.36, 1],
                },
                scale: {
                  duration: 2.2,
                  ease: [0.22, 1, 0.36, 1],
                },
              }}
              className="
                absolute inset-0
                h-full w-full
                object-cover
                object-center
              "
              style={{
                WebkitMaskImage:
                  "linear-gradient(to bottom, transparent 0%, black 18%, black 78%, transparent 100%)",
                maskImage:
                  "linear-gradient(to bottom, transparent 0%, black 18%, black 78%, transparent 100%)",
              }}
            />
          </AnimatePresence>
          {/* <img
            key={active}
            src={activeImage}
            alt="Guest enjoying a quiet morning overlooking the mountains"
            loading="lazy"
            className="
          absolute inset-0
          h-full w-full
          object-cover
          object-center
          transition-opacity duration-500
        "
            style={{
              WebkitMaskImage:
                "linear-gradient(to bottom, transparent 0%, black 18%, black 78%, transparent 100%)",
              maskImage:
                "linear-gradient(to bottom, transparent 0%, black 18%, black 78%, transparent 100%)",
            }}
          /> */}

          {/* Image atmosphere */}
          <div
            className="
              absolute inset-0
              bg-gradient-to-t
              from-black/20
              via-transparent
              to-black/5
              lg:bg-gradient-to-r
              lg:from-transparent
              lg:to-[#eeeee5]/10
            "
          />

          {/* Organic curve - desktop only */}
          <svg
            className="
              pointer-events-none
              absolute
              right-[-1px]
              top-0
              z-10
              hidden
              h-full
              w-[75px]
              lg:block
              xl:w-[105px]
              2xl:w-[130px]
            "
            viewBox="0 0 130 600"
            preserveAspectRatio="none"
            fill="none"
            aria-hidden="true"
          >
            <path
              d="
                M130 0
                C20 90 20 180 75 270
                C130 360 130 450 0 600
                L130 600
                Z
              "
              fill="#eeeee5"
            />
          </svg>
          {/* Top and bottom edge blending */}
          <div
            className="
              pointer-events-none
              absolute
              inset-0
              z-[5]
              bg-[linear-gradient(to_bottom,#eeeee5_0%,rgba(238,238,229,0.85)_8%,rgba(238,238,229,0.45)_17%,transparent_28%,transparent_68%,rgba(238,238,229,0.45)_82%,rgba(238,238,229,0.85)_92%,#eeeee5_100%)]
            "
          />
        </div>

        {/* =========================================
            EDITORIAL CONTENT
        ========================================= */}

        <div
          className="
            flex min-w-0
            flex-col
            justify-center
            px-6
            py-12
            sm:px-10
            sm:py-14
            md:px-8
            md:py-14
            lg:px-7
            lg:py-12
            xl:px-12
            2xl:px-16
            [@media(orientation:landscape)_and_(max-height:500px)_and_(max-width:950px)]:!col-start-1
            [@media(orientation:landscape)_and_(max-height:500px)_and_(max-width:950px)]:!row-start-2
            [@media(orientation:landscape)_and_(max-height:500px)_and_(max-width:950px)]:!py-4
          "
        >
          <div
            style={{ transitionDelay: visible ? "250ms" : "0ms" }}
            className={`
              transition-all duration-[1000ms]
              ease-[cubic-bezier(0.16,1,0.3,1)]
              ${visible ? "translate-y-0 opacity-100" : "translate-y-5 opacity-0"}
            `}
          >
            <div
              className="
              mb-0
              flex
              items-center
              gap-2.5"
            >
              <svg
                viewBox="0 0 32 32"
                className="h-[20px] w-[20px] text-[#71863D]"
                fill="none"
                aria-hidden="true"
              >
                <path
                  d="M16 27C16 19 18 12 23 5"
                  stroke="currentColor"
                  strokeWidth="1"
                />
                <path
                  d="M17 19C10 17 7 12 8 7C14 8 18 13 18 18"
                  fill="currentColor"
                  opacity=".8"
                />
                <path
                  d="M19 14C20 8 25 5 29 7C27 12 24 15 19 16"
                  fill="currentColor"
                  opacity=".5"
                />
              </svg>
              <span
                className="
                font-manrope
                text-[10px]
                font-semibold
                uppercase
                tracking-[0.31em]
                text-[#68753F]
                sm:text-[11px]
              "
              >
                A DAY AT PACIANO
              </span>
            </div>
          </div>

          <h2
            id="day-title"
            className={`
              font-display
              section-title
              mt-2
              font-cormorant
              text-[45px]
              leading-[0.91]
              tracking-[-0.035em]
              text-[#17251B]
              sm:text-[65px]
              lg:text-[72px]
              xl:text-[67px]
              sm:mt-3
              2xl:text-[68px]
              transition-all
              duration-[1200ms]
              ease-[cubic-bezier(0.16,1,0.3,1)]
              ${
                visible
                  ? "translate-y-0 opacity-100"
                  : "translate-y-7 opacity-0"
              }
            `}
            style={{
              transitionDelay: visible ? "450ms" : "0ms",
            }}
          >
            Slow Days
            <br />
            <em className="text-[#607a58] font-medium italic leading-[0.98]">
              Meaningful Moments.
            </em>
          </h2>

          <p
            className={`
              mt-5
              max-w-[390px]
              text-[13px]
              leading-[1.85]
              text-[#62685e]
              sm:mt-6
              sm:text-sm
              lg:mt-5
              lg:text-[12px]
              xl:text-sm
              font-manrope
              transition-all
              duration-[1100ms]
              ease-[cubic-bezier(0.16,1,0.3,1)]

              ${visible ? "translate-y-0 opacity-100" : "translate-y-5 opacity-0"}
            `}
            style={{
              transitionDelay: visible ? "750ms" : "0ms",
            }}
          >
            From peaceful mornings by the river to warm nights under the stars —
            every moment at Paciano is designed to help you slow down and feel
            more.
          </p>

          {/* Carousel controls */}
          <div
            style={{ transitionDelay: visible ? "950ms" : "0ms" }}
            className={`
              mt-7 flex items-center gap-3 sm:mt-8
              transition-all duration-1000
              ease-[cubic-bezier(0.16,1,0.3,1)]
              ${visible ? "translate-y-0 opacity-100" : "translate-y-5 opacity-0"}
            `}
          >
            <CircleArrow
              direction="left"
              onClick={() => move(-1)}
              label="Previous moment"
              className="bg-[#f8f5ee]"
            />

            <CircleArrow
              onClick={() => move(1)}
              label="Next moment"
              className="bg-[#f8f5ee]"
            />
          </div>
          <div
            className={`mt-[35px] will-change-transform [@media(min-width:1200px)_and_(max-width:1599px)]:mt-[24px] ${visible ? "translate-y-0 opacity-100" : "translate-y-5 opacity-0"}
            `}
            style={{ transitionDelay: visible ? "1150ms" : "0ms" }}
          >
            <a
              href="#stay"
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
                Explore Our Stays
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

        {/* =========================================
            EXPERIENCE TIMELINE
        ========================================= */}

        <div
          className="
            flex
            min-w-0
            flex-col
            justify-center
            px-5
            pb-12
            md:px-7
            md:pb-14
            lg:px-5
            lg:py-12
            xl:pl-9
            xl:pr-6
            2xl:pl-10[@media(orientation:landscape)_and_(max-height:500px)_and_(max-width:950px)]:!col-start-2
            [@media(orientation:landscape)_and_(max-height:500px)_and_(max-width:950px)]:!row-start-2
            [@media(orientation:landscape)_and_(max-height:500px)_and_(max-width:950px)]:!self-center
            [@media(orientation:landscape)_and_(max-height:500px)_and_(max-width:950px)]:!px-2
            [@media(orientation:landscape)_and_(max-height:500px)_and_(max-width:950px)]:!py-4

          "
        >
          <ol
            // className="
            //   day-moments-timeline
            //   relative
            //   flex
            //   w-full
            //   justify-center
            //   gap-3
            //   overflow-hidden
            //   pb-3
            //   [scrollbar-width:none]
            //   [&::-webkit-scrollbar]:hidden

            //   md:flex-col
            //   md:justify-start
            //   md:gap-3
            //   md:overflow-visible
            //   md:border-l
            //   md:border-[#b5bba7]
            //   md:pl-5

            //   lg:pl-4
            //   xl:pl-7
            // "
            ref={timelineRef}
            className="
              relative
              flex
              gap-3
              overflow-x-auto
              pb-3
              [scrollbar-width:none]
              [&::-webkit-scrollbar]:hidden

              md:flex-col
              md:gap-3
              md:overflow-visible
              md:border-l
              md:border-[#b5bba7]
              md:pl-5

              lg:pl-4
              xl:pl-7 
              [@media(orientation:landscape)_and_(max-height:500px)_and_(max-width:950px)]:!flex-col
              [@media(orientation:landscape)_and_(max-height:500px)_and_(max-width:950px)]:!overflow-visible
              [@media(orientation:landscape)_and_(max-height:500px)_and_(max-width:950px)]:!gap-2            
            "
          >
            {moments.map((moment, index) => (
              <li
                key={moment.time}
                data-moment-index={index}
                className={`
                day-moment-card
                relative              
                w-full
                max-w-[320px]
                flex-none
                md:w-auto
                md:max-w-none
                md:flex-1
                md:min-w-0
                md:mx-0
                md:py-1
                lg:py-1.5
                xl:py-2

                transition-all
                duration-[1000ms]
                ease-[cubic-bezier(0.16,1,0.3,1)]

                ${active === index ? "is-active" : ""}

                ${visible ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0"}
                [@media(orientation:portrait)_and_(max-width:767px)]:!w-[min(360px,calc(100vw-40px))]
                [@media(orientation:portrait)_and_(max-width:767px)]:!max-w-[360px]
                
              `}
                style={{
                  transitionDelay: visible ? `${1250 + index * 180}ms` : "0ms",
                }}
              >
                {/* Timeline dot */}
                <span
                  className={`
                    absolute
                    left-7
                    top-1/2
                    z-10
                    hidden
                    h-[11px]
                    w-[11px]
                    -translate-y-1/2
                    rounded-full
                    border-2
                    border-[#eeeee5]
                    transition-colors
                    duration-500
                    md:block
                    md:-left-[26px]
                    lg:-left-[25px]
                    xl:-left-[34px]
                    ${
                      active === index
                        ? "bg-[#b89b5e] scale-110"
                        : "bg-[#60775a]"
                    }
                  `}
                />

                <button
                  type="button"
                  onClick={() => setActive(index)}
                  aria-current={active === index ? "step" : undefined}
                  className={`
                    group
                    flex
                    h-full
                    w-full
                    items-center
                    gap-3
                    rounded-2xl
                    p-3
                    text-left
                    transition-all
                    duration-500
                    md:gap-3
                    md:p-2
                    lg:gap-2
                    xl:gap-4
                    [@media(orientation:landscape)_and_(max-height:500px)_and_(max-width:950px)]:!mx-auto
                    [@media(orientation:landscape)_and_(max-height:500px)_and_(max-width:950px)]:!max-w-[320px]
                    ${
                      active === index
                        ? "bg-white/65 shadow-[0_5px_20px_rgba(50,60,40,0.04)]"
                        : "bg-white/25 hover:bg-white/55"
                    }
                  `}
                >
                  <img
                    src={moment.image}
                    alt=""
                    loading="lazy"
                    className="
                      h-14
                      w-14
                      shrink-0
                      rounded-full
                      object-cover
                      transition-transform
                      duration-700
                      group-hover:scale-105
                      sm:h-16
                      sm:w-16
                      lg:h-12
                      lg:w-12
                      xl:h-14
                      xl:w-14
                      2xl:h-16
                      2xl:w-16
                    "
                  />

                  <span className="min-w-0">
                    <span
                      className="
                        block
                        font-manrope
                        text-[10px]
                        font-bold
                        tracking-[0.14em]
                        text-[#3c4f3c]
                        sm:text-[11px]
                      "
                    >
                      {moment.time}
                    </span>

                    <span
                      className="
                        mt-1
                        block
                        max-w-[175px]
                        font-manrope
                        text-[11px]
                        leading-[1.5]
                        text-[#596055]
                        sm:text-[12px]
                        lg:text-[10px]
                        xl:text-[12px]
                      "
                    >
                      {moment.title}
                    </span>
                  </span>
                </button>
              </li>
            ))}
          </ol>
        </div>
      </div>
      <style>
        {`
          @media (prefers-reduced-motion: reduce) {
            .day-at-paciano-reveal,
            .day-at-paciano-reveal * {
              transition-duration: 0.01ms !important;
              animation-duration: 0.01ms !important;
            }
          }
        `}
      </style>
    </section>
  );
}



export default function StayPageContent() {
  const [featuredRoom, setFeaturedRoom] = useState(rooms[0]);
  const [experienceOpen, setExperienceOpen] = useState(false);
  useEffect(() => {
    if (!experienceOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setExperienceOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [experienceOpen]);
  const selectRoom = (room: Room) => {
    setFeaturedRoom(room);
    document
      .getElementById("room-showcase")
      ?.scrollIntoView({ behavior: "smooth" });
  };
  return (
    <div className="stay-page relative overflow-hidden bg-[#F8F5EE] text-[#203025]">
      <StayBotanicalBackdrop />
      <div className="relative z-[1]">
        <StayHero onExperience={() => setExperienceOpen(true)} />
        <StayRoomCollection onExperience={() => setExperienceOpen(true)} />
        <StayFeatures />
        <DayAtPaciano />
      </div>
      <div className="relative isolate">
        <StayEscapeAwaits onExperience={() => setExperienceOpen(true)} />
        <Footer contactOverlap />
      </div>
    </div>
  );
}
