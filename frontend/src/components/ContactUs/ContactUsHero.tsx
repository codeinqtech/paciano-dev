
import { useEffect, useRef, useState } from "react";
import {
  animate,
  motion,
  useMotionValue,
} from "framer-motion";

import bannerImg from "@/images/contact/contact-banner.png";
import contactLeafIcon from "@/images/contact/paciano-leaf-gold-transparent.png";
import { getApiBaseUrl } from "@/lib/apiBase";

interface ContactHeroContent {
  banner_image: string | null;
  heading_one: string | null;
  heading_two: string | null;
  heading_highlight: string | null;
  subtitle_one: string | null;
  subtitle_two: string | null;
}

const PARCHMENT = "#eee9dc";

function CreamJoinFromAbove() {
  return (
    <div
      className="pointer-events-none absolute bottom-0 left-0 z-20 h-[58px] w-full sm:h-[68px] lg:h-[76px]"
      aria-hidden="true"
    >
      <svg
        viewBox="0 0 1440 76"
        preserveAspectRatio="none"
        className="h-full w-full"
      >
        <path
          d="
            M0,76
            L0,44
            C120,62 210,18 360,28
            C510,38 620,68 780,52
            C940,36 1080,14 1260,32
            C1380,44 1440,38 1440,48
            L1440,76
            Z
          "
          fill={PARCHMENT}
        />
      </svg>
    </div>
  );
}

function ContactHero() {
  const [content, setContent] = useState<ContactHeroContent | null>(null);

  const ref = useRef<HTMLElement | null>(null);

  // ==========================================
  // FETCH CONTACT PAGE CONTENT
  // ==========================================

  useEffect(() => {
    let cancelled = false;

    const fetchContactPage = async () => {
      try {
        const response = await fetch(
          `${getApiBaseUrl()}/contact-page`
        );

        if (!response.ok) {
          throw new Error("Failed to fetch contact page content.");
        }

        const result = await response.json();

        // Laravel Resource response: { data: {...} }
        const data = result.data ?? result;

        if (!cancelled) {
          setContent(data);
        }
      } catch (error) {
        console.error("Contact Hero API Error:", error);
      }
    };

    fetchContactPage();

    return () => {
      cancelled = true;
    };
  }, []);

  // ==========================================
  // CINEMATIC BACKGROUND ANIMATION
  // ==========================================

  const cinematicX = useMotionValue(0);
  const cinematicY = useMotionValue(0);
  const cinematicScale = useMotionValue(1.03);

  useEffect(() => {
    const controls = animate(
      cinematicX,
      [0, -18, -8, 0],
      {
        duration: 40,
        ease: "easeInOut",
        repeat: Infinity,
        repeatType: "loop",
      }
    );

    const yControls = animate(
      cinematicY,
      [0, -6, -3, 0],
      {
        duration: 40,
        ease: "easeInOut",
        repeat: Infinity,
        repeatType: "loop",
      }
    );

    const scaleControls = animate(
      cinematicScale,
      [1.03, 1.055, 1.045, 1.03],
      {
        duration: 40,
        ease: "easeInOut",
        repeat: Infinity,
        repeatType: "loop",
      }
    );

    return () => {
      controls.stop();
      yControls.stop();
      scaleControls.stop();
    };
  }, [cinematicX, cinematicY, cinematicScale]);

  // ==========================================
  // HERO SECTION
  // ==========================================

  return (
    <section
      ref={ref}
      className="
        relative
        flex
        min-h-[100svh]
        w-full
        items-center
        justify-center
        overflow-hidden
      "
    >
      {/* ==========================================
          HERO IMAGE
      ========================================== */}

      <motion.div
        className="absolute inset-0 h-full w-full"
        style={{
          x: cinematicX,
          y: cinematicY,
          scale: cinematicScale,
        }}
      >
        <img
          src={content?.banner_image || bannerImg}
          alt="Paciano Dooars"
          className="
            h-full
            w-full
            object-cover
            object-[50%_50%]
            sm:object-[50%_50%]
            lg:object-center
          "
          style={{
            filter:
              "brightness(1.05) saturate(1.08) contrast(1.04)",
          }}
        />
      </motion.div>

      {/* ==========================================
          TOP CINEMATIC GRADE
      ========================================== */}

      <div
        className="pointer-events-none absolute inset-0 z-[2]"
        style={{
          background:
            "linear-gradient(180deg, rgba(8,24,19,0.40) 0%, rgba(8,24,19,0.04) 24%, rgba(8,24,19,0.02) 55%, rgba(5,20,15,0.48) 100%)",
        }}
      />

      {/* ==========================================
          WARM GOLDEN ATMOSPHERE
      ========================================== */}

      <div
        className="pointer-events-none absolute inset-0 z-[3]"
        style={{
          background:
            "radial-gradient(circle at 17% 30%, rgba(255,196,86,0.18) 0%, rgba(255,178,72,0.08) 18%, transparent 42%)",
        }}
      />

      {/* ==========================================
          CENTER CINEMATIC COPY SHADOW
      ========================================== */}

      <div
        className="pointer-events-none absolute inset-0 z-[4]"
        style={{
          background:
            "radial-gradient(ellipse 43% 32% at 50% 51%, rgba(4,17,13,0.58) 0%, rgba(4,17,13,0.42) 30%, rgba(4,17,13,0.20) 55%, transparent 78%)",
        }}
      />

      {/* ==========================================
          SUBTLE CENTER LOWER SHADOW
      ========================================== */}

      <div
        className="
          pointer-events-none
          absolute
          left-1/2
          top-[42%]
          z-[4]
          h-[360px]
          w-[700px]
          -translate-x-1/2
          rounded-full
          blur-[80px]
        "
        style={{
          background: "rgba(3,17,12,0.18)",
        }}
      />

      {/* ==========================================
          RIGHT EDGE VIGNETTE
      ========================================== */}

      <div
        className="pointer-events-none absolute inset-0 z-[4]"
        style={{
          background:
            "linear-gradient(90deg, rgba(5,20,15,0.08) 0%, transparent 25%, transparent 72%, rgba(5,20,15,0.28) 100%)",
        }}
      />

      {/* ==========================================
          HERO CONTENT
      ========================================== */}

      <div
        className="
          relative
          z-[10]
          flex
          w-full
          max-w-[1400px]
          flex-col
          items-center
          px-6
          pb-16
          pt-28
          text-center
          sm:px-10
          sm:pb-20
          sm:pt-32
          lg:pb-24
        "
      >
        {/* SOFT CINEMATIC SHADOW BEHIND COPY */}

        <div
          className="
            pointer-events-none
            absolute
            left-1/2
            top-1/2
            -z-10
            h-[420px]
            w-[820px]
            -translate-x-1/2
            -translate-y-1/2
            rounded-full
          "
          style={{
            background:
              "radial-gradient(ellipse at center, rgba(0,0,0,0.58) 0%, rgba(0,0,0,0.40) 32%, rgba(0,0,0,0.20) 58%, transparent 82%)",
            filter: "blur(32px)",
          }}
        />

        {/* ==========================================
            EYEBROW
        ========================================== */}

        <motion.div
          initial={{
            opacity: 0,
            y: 22,
            filter: "blur(5px)",
          }}
          animate={{
            opacity: 1,
            y: 0,
            filter: "blur(0px)",
          }}
          transition={{
            duration: 1.8,
            delay: 0.5,
            ease: [0.16, 1, 0.3, 1],
          }}
          className="
            mb-6
            flex
            items-center
            justify-center
            gap-5
            font-jost
            text-[0.58rem]
            font-medium
            uppercase
            sm:mb-7
            sm:gap-7
            sm:text-[0.65rem]
          "
          style={{
            color: "rgba(245,226,181,0.96)",
          }}
        >
          {/* LEFT LINE */}

          <span
            className="h-px w-12 sm:w-16"
            style={{
              background:
                "linear-gradient(90deg, transparent, rgba(218,190,132,0.9))",
            }}
          />

          {/* EYEBROW TEXT */}

          <span
            className="
              font-jost
              font-medium
              uppercase
              tracking-[0.34em]
            "
            style={{
              fontSize: "0.70rem",
            }}
          >
            Get In Touch
          </span>

          {/* RIGHT LINE */}

          <span
            className="h-px w-12 sm:w-16"
            style={{
              background:
                "linear-gradient(90deg, rgba(218,190,132,0.9), transparent)",
            }}
          />
        </motion.div>

        {/* ==========================================
            MAIN HEADING
        ========================================== */}

        <motion.h1
          initial={{
            opacity: 0,
            y: 42,
            filter: "blur(8px)",
          }}
          animate={{
            opacity: 1,
            y: 0,
            filter: "blur(0px)",
          }}
          transition={{
            duration: 2.4,
            delay: 1.25,
            ease: [0.16, 1, 0.3, 1],
          }}
          className="
            relative
            leading-[0.88]
            tracking-[-0.025em]
            text-white
            text-center
            font-['Cormorant_Garamond']
            font-medium
            text-[44px]
            sm:text-[52px]
            md:text-[60px]
            lg:text-[68px]
            xl:text-[76px]
            max-w-[760px]
            mx-auto
          "
          style={{
            textShadow:
              "0 4px 30px rgba(0,0,0,0.30), 0 1px 8px rgba(0,0,0,0.18)",
          }}
        >
          {content?.heading_one || "Let’s Begin"}
          <br />

          <motion.span
            initial={{
              opacity: 0,
              y: 28,
              filter: "blur(6px)",
            }}
            animate={{
              opacity: 1,
              y: 0,
              filter: "blur(0px)",
            }}
            transition={{
              duration: 3.2,
              delay: 2.25,
              ease: [0.16, 1, 0.3, 1],
            }}
            className="
              inline-block
              italic
              text-[44px]
              sm:text-[52px]
              md:text-[60px]
              lg:text-[68px]
              xl:text-[76px]
              max-w-[760px]
            "
            style={{
              color: "#8faa42",
              textShadow: "0 4px 30px rgba(0,0,0,0.35)",
            }}
          >
            {content?.heading_two || "Your Paciano Story."}
          </motion.span>
        </motion.h1>

        {/* ==========================================
            LOWER DIVIDER + GOLD LEAF
        ========================================== */}

        <div className="my-7 flex items-center justify-center gap-7 sm:my-8 sm:gap-8">
          {/* LEFT LINE */}

          <motion.div
            initial={{
              opacity: 0,
              scaleX: 0,
            }}
            animate={{
              opacity: 1,
              scaleX: 1,
            }}
            transition={{
              duration: 2.8,
              delay: 4.15,
              ease: [0.16, 1, 0.3, 1],
            }}
            className="h-px w-16 origin-right sm:w-28 lg:w-36"
            style={{
              background:
                "linear-gradient(90deg, transparent, rgba(211,177,108,0.9))",
            }}
          />

          {/* GOLD LEAF */}

          <motion.img
            src={contactLeafIcon}
            alt=""
            aria-hidden="true"
            initial={{
              opacity: 0,
              scale: 0.7,
              rotate: -8,
              y: 5,
            }}
            animate={{
              opacity: 1,
              scale: 1,
              rotate: 0,
              y: 0,
            }}
            transition={{
              duration: 2.9,
              delay: 4.25,
              ease: [0.16, 1, 0.3, 1],
            }}
            className="
              h-[30px]
              w-[30px]
              shrink-0
              object-contain
              sm:h-[48px]
              sm:w-[48px]
            "
            style={{
              filter:
                "drop-shadow(0 2px 5px rgba(0,0,0,0.25))",
            }}
          />

          {/* RIGHT LINE */}

          <motion.div
            initial={{
              opacity: 0,
              scaleX: 0,
            }}
            animate={{
              opacity: 1,
              scaleX: 1,
            }}
            transition={{
              duration: 2.8,
              delay: 4.15,
              ease: [0.16, 1, 0.3, 1],
            }}
            className="h-px w-16 origin-left sm:w-28 lg:w-36"
            style={{
              background:
                "linear-gradient(90deg, rgba(211,177,108,0.9), transparent)",
            }}
          />
        </div>

        
        {/* ==========================================
            SUPPORTING COPY
        ========================================== */}

        <motion.div
          initial={{
            opacity: 0,
            y: 20,
            filter: "blur(5px)",
          }}
          animate={{
            opacity: 1,
            y: 0,
            filter: "blur(0px)",
          }}
          transition={{
            duration: 2.2,
            delay: 5.4,
            ease: [0.16, 1, 0.3, 1],
          }}
          className="
            mt-3
            flex
            w-full
            max-w-[570px]
            flex-col
            items-center
            gap-2
            px-2
            text-center
            sm:mt-4
            sm:gap-3
          "
        >
          {content?.heading_highlight && (
            <p className="
              font-cormorant
              text-[1.1rem]
              font-light
              italic
              leading-relaxed
              text-white/90
              sm:text-[19px]
            ">
              {content.heading_highlight}
            </p>
          )}

          
        </motion.div>

      </div>

      {/* ==========================================
          SCROLL INDICATOR
      ========================================== */}

      <motion.div
        initial={{
          opacity: 0,
        }}
        animate={{
          opacity: 1,
        }}
        transition={{
          delay: 1.4,
          duration: 1,
        }}
        className="
          absolute
          bottom-7
          left-1/2
          z-[10]
          flex
          -translate-x-1/2
          flex-col
          items-center
          sm:bottom-9
        "
      >
        <span
          className="
            mb-3
            font-jost
            text-[0.55rem]
            font-light
            uppercase
            tracking-[0.3em]
          "
          style={{
            color: "rgba(248,240,228,0.65)",
          }}
        >
          Scroll
        </span>

        <motion.div
          animate={{
            height: ["0px", "42px", "0px"],
            opacity: [0.35, 1, 0.35],
          }}
          transition={{
            repeat: Infinity,
            duration: 2.2,
            ease: "easeInOut",
          }}
          className="w-px"
          style={{
            background:
              "linear-gradient(to bottom, rgba(214,183,117,0.95), transparent)",
          }}
        />
      </motion.div>

      {/* ==========================================
          BOTTOM CREAM SHAPE
      ========================================== */}

      <CreamJoinFromAbove />
    </section>
  );
}

export default ContactHero;
