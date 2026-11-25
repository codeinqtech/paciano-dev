import { useState, useRef, useEffect } from "react";


const deluxeBalcony = "/images/river-side-room.png";
const deluxeDetail = "/images/river-view.png";
const deluxeBathroom = "/images/river-view.png";
const deluxeView = "/images/river-view.png";
const deluxeRoom = "/images/river-side-room.png";
const familyRoom = "/images/family-room.png";
const familyBalcony = "/images/room1.png";
const familyDetail = "/images/home-room-1.webp";
const familyBathroom = "/images/home-room-1.webp";
const familyView = "/images/stay/familyView.webp";
const pacianoLeaf = "/images/paciano-leaf-transparent.png";

interface StayRoomCollectionProps {
  onExperience: () => void;
}
const stays: Stay[] = [
  {
    id: "deluxe",
    name: "Deluxe Rooms",
    eyebrow: "Deluxe Rooms",
    title: "Wake to Tranquility",
    description:
      "Wake to the gentle rhythm of the river, framed by the magnificent mountains beyond. The Deluxe Rooms offer a peaceful retreat where the beauty of the surrounding landscape becomes part of your stay, from mist-covered mornings to golden evenings overlooking the valley.",

    details:
      "Thoughtfully designed with refined interiors, warm natural textures and a private balcony, every detail invites relaxation. From the plush bedding to the elegantly appointed bathroom, enjoy a tranquil retreat where comfort and understated luxury come naturally.",

    images: [
      deluxeRoom,
      deluxeBalcony,
      deluxeDetail,
      deluxeBathroom,
      deluxeView,
    ],

    amenities: [
      {
        label: "1 King Bed",
        icon: "bed",
      },
      {
        label: "2 + 1 Guests",
        icon: "users",
      },
      {
        label: "Private Balcony",
        icon: "balcony",
      },
      {
        label: "River & Mountain View",
        icon: "view",
      },
      {
        label: "Luxury Bathroom",
        icon: "bath",
      },
    ],
  },

  {
    id: "family",
    name: "Family Sanctuary",
    eyebrow: "FAMILY SANCTUARY",
    title: "Space to Be Together",
    description:
      "Created for families who value space, comfort and meaningful time together, the Family Sanctuary offers a welcoming escape surrounded by the beauty of the natural landscape. Wake to the peaceful sight of the river and the majestic mountains, and enjoy a setting that brings everyone closer to nature.",

    details:
      "With generous interiors, comfortable sleeping arrangements and thoughtfully considered details, this retreat gives every member of the family room to relax and reconnect. Spend slow mornings taking in the river and mountain views, share unhurried conversations, and return to the comfort of a space designed to make every moment together memorable.",
    images: [
      familyRoom,
      familyBalcony,
      familyDetail,
      familyBathroom,
      familyView,
    ],

    amenities: [
      {
        label: "1 King Bed + 1 Single Bed",
        icon: "bed",
      },
      {
        label: "3 + 1 Guests",
        icon: "users",
      },
      {
        label: "Spacious Interior",
        icon: "balcony",
      },
      {
        label: "River & Mountain View",
        icon: "view",
      },
      {
        label: "Luxury Bathroom",
        icon: "bath",
      },
    ],
  },
];

type AmenityIconType = "bed" | "balcony" | "view" | "bath" | "users";
type Stay = {
  id: string;
  name: string;
  eyebrow: string;
  title: string;
  description: string;
  details: string; // ADD THIS

  images: string[];

  amenities: {
    label: string;
    icon: AmenityIconType;
  }[];
};



function AmenityIcon({ type }: { type: AmenityIconType }) {
  const className = "w-[18px] h-[18px] stroke-[1.2]";

  if (type === "bed") {
    return (
      <svg viewBox="0 0 24 24" fill="none" className={className}>
        <path
          d="M3 18v-7.5c0-.83.67-1.5 1.5-1.5h15c.83 0 1.5.67 1.5 1.5V18"
          stroke="currentColor"
        />
        <path d="M3 14h18" stroke="currentColor" />
        <path
          d="M5 9V6.5A1.5 1.5 0 0 1 6.5 5h4A1.5 1.5 0 0 1 12 6.5V9"
          stroke="currentColor"
        />
        <path d="M3 18v2M21 18v2" stroke="currentColor" />
      </svg>
    );
  }

  if (type === "balcony") {
    return (
      <svg viewBox="0 0 24 24" fill="none" className={className}>
        <path d="M4 5h16M5 5v5h14V5M3 10h18" stroke="currentColor" />
        <path d="M6 10v8M10 10v8M14 10v8M18 10v8" stroke="currentColor" />
        <path d="M3 18h18" stroke="currentColor" />
      </svg>
    );
  }

  if (type === "view") {
    return (
      <svg viewBox="0 0 24 24" fill="none" className={className}>
        <path d="M3 19h18" stroke="currentColor" />
        <path d="M4 18l6-7 3 3 4-6 3 10" stroke="currentColor" />
      </svg>
    );
  }

  if (type === "bath") {
    return (
      <svg viewBox="0 0 24 24" fill="none" className={className}>
        <path
          d="M4 12h16v3.5A3.5 3.5 0 0 1 16.5 19h-9A3.5 3.5 0 0 1 4 15.5V12Z"
          stroke="currentColor"
        />
        <path d="M6 12V7a2 2 0 0 1 4 0v1" stroke="currentColor" />
        <path d="M10 8h5" stroke="currentColor" />
      </svg>
    );
  }

  if (type === "users") {
    return (
      <svg viewBox="0 0 24 24" fill="none" className={className}>
        <circle cx="9" cy="8" r="3" stroke="currentColor" strokeWidth="1.4" />
        <path
          d="M3.5 19v-1.5A5.5 5.5 0 0 1 9 12a5.5 5.5 0 0 1 5.5 5.5V19H3.5Z"
          stroke="currentColor"
          strokeWidth="1.4"
          strokeLinejoin="round"
        />
        <path
          d="M16 5.5a3 3 0 0 1 0 5.8M17 13a5.5 5.5 0 0 1 3.5 5.2V19h-3"
          stroke="currentColor"
          strokeWidth="1.4"
          strokeLinecap="round"
        />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 24 24" fill="none" className={className}>
      <path d="M4 10.5a10 10 0 0 1 16 0" stroke="currentColor" />
      <path d="M7 13.5a6.5 6.5 0 0 1 10 0" stroke="currentColor" />
      <path d="M10 16.5a3 3 0 0 1 4 0" stroke="currentColor" />
      <circle cx="12" cy="20" r="1" fill="currentColor" />
    </svg>
  );
}

function RoomDescriptions() {
  const roomSectionRef = useRef<HTMLElement | null>(null);
  const [revealedRooms, setRevealedRooms] = useState<Record<string, boolean>>(
    {},
  );
  useEffect(() => {
    const section = roomSectionRef.current;
    if (!section) return;

    const roomElements =
      section.querySelectorAll<HTMLElement>("[data-room-reveal]");

    if (!("IntersectionObserver" in window)) {
      setRevealedRooms(
        Object.fromEntries(
          Array.from(roomElements).map((room) => [
            room.dataset.roomReveal!,
            true,
          ]),
        ),
      );
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const roomId = (entry.target as HTMLElement).dataset.roomReveal;

            if (roomId) {
              setRevealedRooms((previous) => ({
                ...previous,
                [roomId]: true,
              }));
            }

            observer.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.08,
        rootMargin: "0px 0px -5% 0px",
      },
    );

    roomElements.forEach((room) => observer.observe(room));

    return () => observer.disconnect();
  }, []);

  const [galleryIndexes, setGalleryIndexes] = useState<Record<string, number>>(
    {},
  );
  const [lightbox, setLightbox] = useState<{
    stayIndex: number;
    imageIndex: number;
  } | null>(null);

  const [isZoomed, setIsZoomed] = useState(false);

  const getImageIndex = (room: Stay) => galleryIndexes[room.id] ?? 0;

  const changeGalleryImage = (room: Stay, nextIndex: number) => {
    const total = room.images.length;
    if (!total) return;

    setGalleryIndexes((prev) => ({
      ...prev,
      [room.id]: (nextIndex + total) % total,
    }));
  };

  const openLightbox = (stayIndex: number, imageIndex: number) => {
    setIsZoomed(false);
    setLightbox({ stayIndex, imageIndex });
  };

  const closeLightbox = () => {
    setLightbox(null);
    setIsZoomed(false);
  };

  const changeLightboxImage = (direction: number) => {
    setIsZoomed(false);

    setLightbox((prev) => {
      if (!prev) return null;

      const room = stays[prev.stayIndex];

      return {
        ...prev,
        imageIndex:
          (prev.imageIndex + direction + room.images.length) %
          room.images.length,
      };
    });
  };

  const lightboxRoom = lightbox !== null ? stays[lightbox.stayIndex] : null;

  useEffect(() => {
    if (!lightbox) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        closeLightbox();
      }

      if (event.key === "ArrowRight") {
        setIsZoomed(false);
        setLightbox((prev) => {
          if (!prev) return null;
          const room = stays[prev.stayIndex];

          return {
            ...prev,
            imageIndex: (prev.imageIndex + 1) % room.images.length,
          };
        });
      }

      if (event.key === "ArrowLeft") {
        setIsZoomed(false);
        setLightbox((prev) => {
          if (!prev) return null;
          const room = stays[prev.stayIndex];

          return {
            ...prev,
            imageIndex:
              (prev.imageIndex - 1 + room.images.length) % room.images.length,
          };
        });
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    document.body.style.overflow = "hidden";

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [lightbox]);

  const thumbnailTrackRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const scrollThumbnails = (roomId: string, direction: number) => {
    const track = thumbnailTrackRefs.current[roomId];

    track?.scrollBy({
      left: direction * track.clientWidth * 0.75,
      behavior: "smooth",
    });
  };

  return (
    <>
      <section
        ref={roomSectionRef}
        className="
          relative
          mx-auto
          mt-8
          w-full
          max-w-[1500px]
          sm:mt-10
          lg:mt-12
        "
      >
        <div className="flex flex-col gap-10 sm:gap-14 lg:gap-[76px]">
          {stays.map((room, roomIndex) => {
            const imageIndex = getImageIndex(room);
            const currentImage = room.images[imageIndex];
            const isFirst = roomIndex === 0;

            return (
              <article
                key={room.id}
                id={`room-section-${room.id}`}
                data-room-reveal={room.id}
                // className="
                //   grid
                //   grid-cols-1
                //   items-center
                //   gap-7
                //   sm:gap-9
                //   lg:grid-cols-2
                //   lg:gap-8
                //   xl:gap-12
                //   [@media(orientation:landscape)_and_(max-height:500px)]:grid-cols-[1.05fr_0.95fr]
                //   [@media(orientation:landscape)_and_(max-height:500px)]:gap-5
                // "
                className={`
                  ${revealedRooms[room.id] ? "paciano-room-visible" : ""}
                  scroll-mt-24
                  sm:scroll-mt-28
                  lg:scroll-mt-32
                  grid
                  grid-cols-1
                  items-stretch
                  gap-7
                  sm:gap-9
                  lg:gap-9
                  xl:gap-12

                  ${
                    isFirst
                      ? "lg:grid-cols-[1.12fr_0.88fr]"
                      : "lg:grid-cols-[0.88fr_1.12fr]"
                  }

                  [@media(orientation:landscape)_and_(max-height:500px)]:gap-5
                `}
              >
                {/* =========================================
                    ROOM PHOTO GALLERY
                ========================================= */}

                <div
                  className={`
                    relative
                    min-w-0
                    w-full
                    lg:flex
                    lg:h-full
                    lg:flex-col

                    ${
                      isFirst
                        ? `
                          lg:-ml-8
                          xl:-ml-12
                          2xl:-ml-16

                          lg:w-[calc(100%+2rem)]
                          xl:w-[calc(100%+3rem)]
                          2xl:w-[calc(100%+4rem)]

                          [@media(min-width:1024px)_and_(max-width:1599px)]:!ml-0
                          [@media(min-width:1024px)_and_(max-width:1599px)]:!w-full
                        `
                        : "lg:ml-0"
                    }

                    ${isFirst ? "order-1" : "order-1 lg:order-2"}
                  `}
                >
                  {/* Main photograph */}

                  <div
                    className="                     
                      group
                      relative
                      aspect-[1.48/1]
                      w-full
                      min-h-0
                      overflow-hidden
                      rounded-[15px]
                      sm:rounded-[19px]
                      lg:aspect-auto
                      lg:min-h-[260px]
                      lg:flex-1
                      lg:rounded-[16px]
                      xl:rounded-[19px]
                      bg-[#DED8C9]
                      shadow-[0_14px_40px_rgba(54,57,44,0.10)]
                    "
                  >
                    <button
                      type="button"
                      onClick={() => openLightbox(roomIndex, imageIndex)}
                      aria-label={`Enlarge ${room.name} photograph`}
                      className="
                        absolute
                        inset-0
                        h-full
                        w-full
                        cursor-zoom-in
                        overflow-hidden
                        outline-none
                      "
                    >
                      <img
                        key={currentImage}
                        src={currentImage}
                        alt={`${room.name} - photograph ${imageIndex + 1}`}
                        className="
                          h-full
                          w-full
                          object-cover
                          object-center
                          transition-transform
                          duration-[1100ms]
                          ease-[cubic-bezier(0.16,1,0.3,1)]
                          group-hover:scale-[1.045]
                          animate-[roomGalleryEnter_800ms_ease-out]
                        "
                      />

                      {/* Subtle image overlay */}

                      <span
                        className="
                          pointer-events-none
                          absolute
                          inset-0
                          bg-gradient-to-t
                          from-black/20
                          via-transparent
                          to-black/5
                          opacity-70
                          transition-opacity
                          duration-700
                          group-hover:opacity-100
                        "
                      />

                      {/* Zoom hint */}

                      <span
                        className="
                          absolute
                          right-4
                          top-4
                          flex
                          h-9
                          w-9
                          items-center
                          justify-center
                          rounded-full
                          border
                          border-white/50
                          bg-black/20
                          text-white
                          opacity-0
                          backdrop-blur-sm
                          transition-all
                          duration-500
                          group-hover:opacity-100
                        "
                      >
                        <svg
                          viewBox="0 0 24 24"
                          className="h-4 w-4"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.4"
                        >
                          <circle cx="10.5" cy="10.5" r="6.5" />
                          <path d="M16 16l5 5M10.5 7v7M7 10.5h7" />
                        </svg>
                      </span>
                    </button>

                    {/* Previous photo */}

                    <button
                      type="button"
                      onClick={() => changeGalleryImage(room, imageIndex - 1)}
                      aria-label="Previous photograph"
                      className="
                        absolute
                        left-3
                        top-1/2
                        z-10
                        flex
                        h-9
                        w-9
                        -translate-y-1/2
                        items-center
                        justify-center
                        rounded-full
                        border
                        border-[#F5F1E8]/70
                        bg-[#F8F5ED]/90
                        text-[#344238]
                        shadow-md
                        backdrop-blur-sm
                        transition-all
                        duration-500
                        hover:scale-110
                        hover:bg-white
                      "
                    >
                      <svg
                        viewBox="0 0 24 24"
                        className="h-4 w-4"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.5"
                      >
                        <path d="M15 18l-6-6 6-6" />
                      </svg>
                    </button>

                    {/* Next photo */}

                    <button
                      type="button"
                      onClick={() => changeGalleryImage(room, imageIndex + 1)}
                      aria-label="Next photograph"
                      className="
                        absolute
                        right-3
                        top-1/2
                        z-10
                        flex
                        h-9
                        w-9
                        -translate-y-1/2
                        items-center
                        justify-center
                        rounded-full
                        border
                        border-[#F5F1E8]/70
                        bg-[#F8F5ED]/90
                        text-[#344238]
                        shadow-md
                        backdrop-blur-sm
                        transition-all
                        duration-500
                        hover:scale-110
                        hover:bg-white
                      "
                    >
                      <svg
                        viewBox="0 0 24 24"
                        className="h-4 w-4"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.5"
                      >
                        <path d="M9 18l6-6-6-6" />
                      </svg>
                    </button>
                  </div>

                  <div
                    className="
                      relative z-10 -mt-4
                      flex min-w-0 shrink-0 items-center gap-2
                      px-1 sm:gap-3 sm:pl-3
                      animate-in fade-in slide-in-from-bottom-6
                      duration-1000 delay-200
                    "
                  >
                    {/* Previous thumbnails */}
                    <button
                      type="button"
                      onClick={() => scrollThumbnails(room.id, -1)}
                      aria-label="Previous thumbnails"
                      className="
                        flex h-8 w-8 shrink-0 items-center justify-center
                        rounded-full border border-[#D9D5C8]
                        bg-[#F8F5ED] text-[#53604F]
                        transition-all duration-500
                        hover:bg-[#71864F] hover:text-white
                        sm:h-9 sm:w-9
                      "
                    >
                      <svg
                        viewBox="0 0 24 24"
                        className="h-4 w-4"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.5"
                      >
                        <path d="M15 18l-6-6 6-6" />
                      </svg>
                    </button>

                    {/* Scrollable thumbnail track */}
                    <div
                      ref={(element) => {
                        thumbnailTrackRefs.current[room.id] = element;
                      }}
                      className="
                        flex min-w-0 flex-1 items-center
                        gap-2
                        overflow-x-auto
                        scroll-smooth
                        snap-x snap-mandatory
                        py-2
                        [scrollbar-width:none]
                        [&::-webkit-scrollbar]:hidden
                      "
                    >
                      {room.images.map((image, photoIndex) => {
                        const selected = photoIndex === imageIndex;

                        return (
                          <button
                            key={`${room.id}-${photoIndex}`}
                            type="button"
                            onClick={() => changeGalleryImage(room, photoIndex)}
                            aria-label={`View photograph ${photoIndex + 1}`}
                            aria-pressed={selected}
                            style={{
                              flex: "0 0 calc((100% - 32px) / 5)",
                            }}
                            className={`
                              relative
                              min-w-0
                              h-[62px]
                              shrink-0
                              snap-start
                              overflow-hidden
                              rounded-[9px]
                              border-2
                              bg-[#F5F0E5]
                              shadow-[0_4px_12px_rgba(35,40,30,0.15)]
                              transition-all
                              duration-500

                              sm:h-[68px]
                              md:h-[72px]
                              lg:h-[76px]
                              xl:h-[80px]

                              ${
                                selected
                                  ? "border-[#879368] -translate-y-1 opacity-100"
                                  : "border-[#F7F3E9] opacity-90 hover:opacity-100 hover:-translate-y-1"
                              }
                            `}
                          >
                            <img
                              src={image}
                              alt={`${room.name} thumbnail ${photoIndex + 1}`}
                              className="
                                h-full w-full object-cover
                                transition-transform duration-700
                                hover:scale-110
                              "
                            />
                          </button>
                        );
                      })}
                    </div>

                    {/* Next thumbnails */}
                    <button
                      type="button"
                      onClick={() => scrollThumbnails(room.id, 1)}
                      aria-label="Next thumbnails"
                      className="
                        flex h-8 w-8 shrink-0 items-center justify-center
                        rounded-full border border-[#D9D5C8]
                        bg-[#F8F5ED] text-[#53604F]
                        transition-all duration-500
                        hover:bg-[#71864F] hover:text-white
                        sm:h-9 sm:w-9
                      "
                    >
                      <svg
                        viewBox="0 0 24 24"
                        className="h-4 w-4"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.5"
                      >
                        <path d="M9 18l6-6-6-6" />
                      </svg>
                    </button>
                  </div>
                </div>

                {/* =========================================
                    ROOM DESCRIPTION
                ========================================= */}

                {/* =========================================
                    ROOM DESCRIPTION — LUXURY EDITORIAL PANEL
                ========================================= */}

                <div
                  key={room.id}
                  className={`
                    flex
                    min-w-0
                    flex-col
                    justify-center
                    lg:h-full
                    ${
                      isFirst
                        ? "order-2 lg:order-2 lg:pl-2 xl:pl-5"
                        : "order-2 lg:order-1 lg:pr-2 xl:pr-5"
                    }
                  `}
                >
                  {/* ROOM NAME */}
                  <h3
                    className="
                      paciano-stay-step
                      paciano-stay-step-2
                      font-cormorant
                      text-[38px]
                      leading-[1]
                      tracking-[-0.025em]
                      text-[#1D2B22]
                      sm:text-[45px]
                      lg:text-[clamp(36px,3vw,44px)]
                      xl:text-[46px]
                      2xl:text-[50px]
                    "
                  >
                    {room.name}
                  </h3>

                  {/* ROOM TAGLINE */}
                  <p
                    className="
                      paciano-stay-step
                      paciano-stay-step-3
                      mt-2
                      font-cormorant
                      text-[21px]
                      italic
                      leading-snug
                      text-[#789541]
                      sm:text-[24px]
                      lg:text-[21px]
                      xl:text-[25px]

                      
                    "
                  >
                    {room.title}
                  </p>

                  {/* DESCRIPTION */}
                  <div
                    className="
                    paciano-stay-step
                    paciano-stay-step-4
                    mt-5
                    space-y-3
                    font-manrope
                    text-[12px]
                    leading-[1.85]
                    text-[#626B61]
                    sm:mt-6
                    sm:text-[13px]
                    lg:mt-5
                    lg:text-[11px]
                    xl:text-[14px]
                    2xl:text-[15px]
                    [@media(orientation:landscape)_and_(max-height:500px)]:mt-3
                    [@media(orientation:landscape)_and_(max-height:500px)]:space-y-2
                  "
                  >
                    <p>{room.description}</p>

                    <p>{room.details}</p>
                  </div>

                  {/* AMENITIES */}
                  <div
                    className="
                      paciano-stay-step
                      paciano-stay-step-5
                      mt-6
                      border-y
                      border-[#D9D5C8]
                      py-3
                      sm:mt-7
                      lg:mt-5
                      xl:mt-6
                      [@media(orientation:landscape)_and_(max-height:500px)]:mt-3
                      [@media(orientation:landscape)_and_(max-height:500px)]:py-2
                    "
                  >
                    <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-5">
                      {room.amenities.map((amenity, index) => (
                        <div
                          key={amenity.label}
                          className={`
                          flex
                          min-w-0
                          flex-col
                          items-center
                          justify-center
                          gap-2
                          px-2
                          py-3
                          text-center
                          transition-colors
                          duration-500
                          hover:text-[#71864F]

                          ${index % 2 === 0 ? "border-r border-[#D9D5C8]" : ""}

                          ${index < 4 ? "border-b border-[#D9D5C8] sm:border-b-0" : ""}

                          sm:border-r
                          sm:last:border-r-0
                          xl:border-b-0
                          xl:border-r
                          xl:last:border-r-0
                        `}
                        >
                          <span className="flex h-5 items-center justify-center text-[#71864F]">
                            <AmenityIcon type={amenity.icon} />
                          </span>

                          <span
                            className="
                              max-w-[105px]
                              font-manrope
                              text-[9px]
                              leading-[1.5]
                              text-[#596456]
                              sm:text-[10px]
                              lg:text-[9px]
                              xl:text-[9px]
                              2xl:text-[10px]
                            "
                          >
                            {amenity.label}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* =========================================
                      CLOSING EDITORIAL STATEMENT
                  ========================================= */}

                  <div
                    className="
                      paciano-stay-step
                      paciano-stay-step-6
                      mt-5
                      w-full
                      sm:mt-6
                      lg:mt-5
                      xl:mt-6
                      [@media(orientation:landscape)_and_(max-height:500px)]:mt-0
                    "
                  >
                    <div
                      className="
                        relative
                        flex
                        w-full
                        min-w-0
                        items-center
                        gap-3
                        overflow-hidden
                        rounded-[12px]
                        border
                        border-[#DDD9C9]
                        bg-[#F5F1E7]/80
                        px-3
                        py-3
                        sm:gap-4
                        sm:px-5
                        sm:py-4
                        lg:gap-3
                        lg:px-3
                        lg:py-3
                        xl:gap-4
                        xl:px-5
                        xl:py-4
                        2xl:px-6
                      "
                    >
                      {/* Soft decorative background */}
                      <div
                        className="
                          pointer-events-none
                          absolute
                          -right-8
                          -top-12
                          h-28
                          w-28
                          rounded-full
                          bg-[#879368]/[0.06]
                          blur-2xl
                          sm:h-36
                          sm:w-36
                        "
                      />

                      {/* Animated botanical leaf */}
                      <div
                        className="
                          relative
                          flex
                          h-[52px]
                          w-[52px]
                          shrink-0
                          items-center
                          justify-center
                          sm:h-[66px]
                          sm:w-[66px]
                          lg:h-[56px]
                          lg:w-[56px]
                          xl:h-[68px]
                          xl:w-[68px]
                        "
                      >
                        <img
                          src={pacianoLeaf}
                          alt=""
                          aria-hidden="true"
                          // className="
                          //   paciano-leaf-float
                          //   h-full
                          //   w-full
                          //   object-contain
                          //   opacity-90
                          // "
                          className="
                            h-full w-full object-contain opacity-90
                            origin-center
                            transition-transform duration-700 ease-in-out
                            hover:-translate-y-2
                            hover:rotate-6
                            hover:scale-105
                          "
                        />
                      </div>

                      {/* Fine vertical divider */}
                      <div
                        className="
                          h-10
                          w-px
                          shrink-0
                          bg-[#D2CEBC]
                          sm:h-12
                          lg:h-10
                          xl:h-12
                        "
                      />

                      {/* Editorial text */}
                      <div className="relative z-10 min-w-0 flex-1 text-left">
                        <p
                          className="
                            font-manrope
                            text-[8px]
                            font-semibold
                            uppercase
                            leading-relaxed
                            tracking-[0.18em]
                            text-[#7D895D]
                            sm:text-[9px]
                            sm:tracking-[0.23em]
                            lg:text-[8px]
                            xl:text-[9px]
                          "
                        >
                          {isFirst
                            ? "A QUIETER WAY TO EXPERIENCE NATURE"
                            : "TOGETHER, IN THE HEART OF NATURE"}
                        </p>

                        <p
                          className="
                            mt-1
                            font-cormorant
                            text-[17px]
                            italic
                            leading-[1.2]
                            tracking-[0.005em]
                            text-[#425344]
                            sm:text-[21px]
                            lg:text-[17px]
                            xl:text-[21px]
                            2xl:text-[23px]
                          "
                        >
                          {isFirst
                            ? "Where river views meets mountain serenity."
                            : "Where family moments bloom in Nature’s Embrace."}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      {/* =====================================================
          FULL-SCREEN IMAGE VIEWER
      ===================================================== */}

      {lightbox &&
        lightboxRoom &&
        createPortal(
          <div
            className="
              fixed
              inset-0
              z-[9999]
              flex
              h-[100dvh]
              w-screen
              items-center
              justify-center
              overflow-hidden
              bg-[#111710]/95
              p-3
              backdrop-blur-md
              animate-[lightboxFade_350ms_ease-out]
              sm:p-6
            "
            onClick={closeLightbox}
            role="dialog"
            aria-modal="true"
            aria-label={`${lightboxRoom.name} photo gallery`}
          >
            {/* Close button */}

            <button
              type="button"
              onClick={closeLightbox}
              aria-label="Close image viewer"
              className="
              absolute
              right-4
              top-4
              z-30
              flex
              h-10
              w-10
              items-center
              justify-center
              rounded-full
              border
              border-white/30
              text-white
              transition-all
              duration-500
              hover:rotate-90
              hover:bg-white/15
              sm:right-7
              sm:top-7
            "
            >
              <svg
                viewBox="0 0 24 24"
                className="h-5 w-5"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.3"
              >
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>

            {/* Room name */}

            <div
              className="
              absolute
              left-5
              top-5
              text-white
              sm:left-8
              sm:top-8
            "
            >
              <p className="font-manrope text-[9px] uppercase tracking-[0.3em] text-white/55">
                PACIANO STAYS
              </p>

              <p className="mt-1 font-cormorant text-xl sm:text-2xl">
                {lightboxRoom.name}
              </p>
            </div>

            {/* Main enlarged photograph */}

            <div
              className="
                relative
                flex
                h-full
                min-h-0
                w-full
                max-w-[1500px]
                items-center
                justify-center
                overflow-hidden
                px-1
                pt-16
                pb-20
                sm:px-10
                sm:pt-20
                sm:pb-24
                [@media(orientation:landscape)_and_(max-height:500px)]:pt-10
                [@media(orientation:landscape)_and_(max-height:500px)]:pb-14
              "
              onClick={(event) => event.stopPropagation()}
            >
              <img
                key={`${lightbox.stayIndex}-${lightbox.imageIndex}`}
                src={lightboxRoom.images[lightbox.imageIndex]}
                alt={`${lightboxRoom.name} enlarged view`}
                onClick={() => setIsZoomed((prev) => !prev)}
                className={`
                  h-auto
                  w-auto
                  max-h-full
                  max-w-full
                  object-contain
                  cursor-zoom-in
                  transition-transform
                  duration-700
                  ease-[cubic-bezier(0.16,1,0.3,1)]
                  rounded-[22px]
                  ${isZoomed ? "scale-[1.7] cursor-zoom-out" : "scale-100"}
                `}
              />

              {/* Previous */}

              <button
                type="button"
                aria-label="Previous enlarged photograph"
                onClick={() => {
                  setIsZoomed(false);
                  changeLightboxImage(-1);
                }}
                className="
                absolute
                left-0
                top-1/2
                flex
                h-10
                w-10
                -translate-y-1/2
                items-center
                justify-center
                rounded-full
                border
                border-white/35
                bg-black/20
                text-white
                backdrop-blur-sm
                transition-all
                hover:bg-white/20
                sm:left-3
                sm:h-12
                sm:w-12
              "
              >
                <svg
                  viewBox="0 0 24 24"
                  className="h-5 w-5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.3"
                >
                  <path d="M15 18l-6-6 6-6" />
                </svg>
              </button>

              {/* Next */}

              <button
                type="button"
                aria-label="Next enlarged photograph"
                onClick={() => {
                  setIsZoomed(false);
                  changeLightboxImage(1);
                }}
                className="
                absolute
                right-0
                top-1/2
                flex
                h-10
                w-10
                -translate-y-1/2
                items-center
                justify-center
                rounded-full
                border
                border-white/35
                bg-black/20
                text-white
                backdrop-blur-sm
                transition-all
                hover:bg-white/20
                sm:right-3
                sm:h-12
                sm:w-12
              "
              >
                <svg
                  viewBox="0 0 24 24"
                  className="h-5 w-5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.3"
                >
                  <path d="M9 18l6-6-6-6" />
                </svg>
              </button>
            </div>

            {/* Image thumbnails + count */}

            <div
              className="
              absolute
              bottom-4
              left-1/2
              flex
              -translate-x-1/2
              items-center
              gap-2
              sm:bottom-6
            "
              onClick={(event) => event.stopPropagation()}
            >
              {lightboxRoom.images.map((image, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => {
                    setIsZoomed(false);
                    setLightbox((prev) =>
                      prev ? { ...prev, imageIndex: index } : null,
                    );
                  }}
                  className={`
                  h-9
                  w-12
                  overflow-hidden
                  rounded
                  border-2
                  transition-all
                  duration-500
                  sm:h-12
                  sm:w-16
                  ${
                    index === lightbox.imageIndex
                      ? "border-[#C1D09A] opacity-100"
                      : "border-white/20 opacity-50 hover:opacity-100"
                  }
                `}
                >
                  <img
                    src={image}
                    alt=""
                    className="h-full w-full object-cover"
                  />
                </button>
              ))}
            </div>
          </div>,
          document.body,
        )}
    </>
  );
}

export default function StayRoomCollection({ onExperience }: StayRoomCollectionProps) {
  const sectionRef = useRef<HTMLElement | null>(null);
  // Section reveal
  const [visible, setVisible] = useState(false);
  // Current room
  const [activeStay, setActiveStay] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  // Incoming room during cinematic transition
  const [incomingStay, setIncomingStay] = useState<number | null>(null);
  // Current image inside room
  const [activeImage, setActiveImage] = useState(0);

  // Incoming image during image transition
  const [incomingImage, setIncomingImage] = useState<number | null>(null);
  // ============================================================
  // CHANGE ROOM — CINEMATIC TRANSITION
  // ============================================================

  const changeStay = (nextIndex: number) => {
    if (nextIndex === activeStay || isTransitioning) {
      return;
    }

    setIsTransitioning(true);

    // Put new scene behind the current scene
    setIncomingStay(nextIndex);

    window.setTimeout(() => {
      setActiveStay(nextIndex);

      setActiveImage(0);

      setIncomingStay(null);

      setIsTransitioning(false);
    }, 900);
  };

  // ============================================================
  // CHANGE IMAGE INSIDE SAME ROOM
  // ============================================================

  const changeImage = (nextIndex: number) => {
    if (nextIndex === activeImage || isTransitioning) {
      return;
    }

    setIsTransitioning(true);

    setIncomingImage(nextIndex);

    window.setTimeout(() => {
      setActiveImage(nextIndex);

      setIncomingImage(null);

      setIsTransitioning(false);
    }, 750);
  };

  // ============================================================
  // NEXT / PREVIOUS
  // ============================================================

  const nextStay = () => {
    const next = (activeStay + 1) % stays.length;

    changeStay(next);
  };

  const previousStay = () => {
    const previous = (activeStay - 1 + stays.length) % stays.length;

    changeStay(previous);
  };

  const stay = stays[activeStay];

  const incoming = incomingStay !== null ? stays[incomingStay] : null;

  // ============================================================
  // SECTION INTERSECTION OBSERVER
  // ============================================================

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setVisible(entry.isIntersecting);
      },
      {
        threshold: 0.01,
        rootMargin: "0px",
      },
    );

    observer.observe(section);

    return () => observer.disconnect();
  }, []);

  return (
    <section
      ref={sectionRef}
      id="stay"
      className={`
        relative
        z-10
        isolate
        overflow-hidden
        bg-[#f2eee3]
        px-5
        pt-5
        pb-12
        sm:px-8
        sm:pt-7
        sm:pb-14
        lg:px-8
        lg:pt-8
        lg:pb-16
        xl:px-12        
        2xl:px-16
        ${visible ? "paciano-about-visible" : ""}
      `}
    >
      {/* Intro */}
      <div className="relative z-10 mx-auto max-w-[1180px] text-center">
        <div>
          {/* Small botanical sprout above OUR STAYS */}
          <div className="paciano-stay-step paciano-stay-step-1 mb-3 flex justify-center">
            <svg
              viewBox="0 0 40 40"
              className="
              mx-auto
              mb-[9px]

              h-[25px]
              w-[25px]

              text-[#71883F]
            "
              fill="none"
            >
              <path
                d="M20 34C20 25 21 17 27 8"
                stroke="currentColor"
                strokeWidth="1"
              />

              <path
                d="
                M21 22
                C15 20 12 16 13 11
                C18 12 22 16 22 21
              "
                fill="currentColor"
              />

              <path
                d="
                M24 17
                C25 12 29 9 34 10
                C32 15 29 18 24 18
              "
                fill="currentColor"
                opacity=".5"
              />
            </svg>
          </div>

          {/* OUR STAYS */}

          <div
            className="
              paciano-stay-step
              paciano-stay-step-3
              flex
              items-center
              justify-center
              gap-4
            "
          >
            <span
              className="
              w-10
              h-px
              bg-[#899475]/45
            "
            />

            <span
              className="
                font-manrope
                text-[10px]
                font-semibold
                uppercase
                tracking-[0.38em]
                text-[#71803F]
              "
            >
              Our Stays
            </span>

            <span
              className="
                w-10
                h-px
                bg-[#899475]/45
              "
            />
          </div>

          {/* MAIN HEADING */}

          <h2
            className="
            paciano-stay-step
            paciano-stay-step-2
            mx-auto
            mt-[16px]
            max-w-[950px]
            text-center
            font-cormorant
            text-[43px]
            leading-[.95]
            tracking-[-.025em]
            text-[#17251B]
            sm:text-[52px]
            lg:text-[60px]
            [@media(orientation:landscape)_and_(max-height:500px)]:mt-2
            [@media(orientation:landscape)_and_(max-height:500px)]:text-[36px]
          "
          >
            Where Every Stay,
            <br />
            <span className="italic text-[#789541]">
              Feels Like Home in Nature.
            </span>
          </h2>

          {/* DESCRIPTION */}

          <p
            className="
              paciano-stay-step
              paciano-stay-step-4
              mx-auto
              mt-5
              max-w-[700px]
              px-4
              text-center
              font-manrope
              text-[13px]
              leading-[1.8]
              text-[#657067]
              sm:text-[13px]
              lg:text-[14px]
              [@media(orientation:landscape)_and_(max-height:500px)]:mt-3
              [@media(orientation:landscape)_and_(max-height:500px)]:max-w-[620px]
              [@media(orientation:landscape)_and_(max-height:500px)]:text-[11px]
              [@media(orientation:landscape)_and_(max-height:500px)]:leading-[1.6]
            "
          >
            Wake to misty mountains, unwind beside the river, and let nature set
            the pace. Our stays are crafted for quiet comfort, generous space
            and a deeper sense of belonging.
          </p>
        </div>
        {/* ======================================================
                PACIANO STAY NAVIGATION
                REFERENCE-MATCHED HORIZONTAL CAPSULE
            ====================================================== */}

        <div
          className={`
              paciano-stay-step
              paciano-stay-step-5
              relative
              mt-10
              sm:mt-11
              lg:mt-12
              w-full
              transition-all
              duration-[1400ms]
              ease-[cubic-bezier(0.16,1,0.3,1)]
              [@media(orientation:landscape)_and_(max-height:500px)]:mt-5
              ${
                visible
                  ? "opacity-100 translate-y-0 blur-0"
                  : "opacity-0 translate-y-8"
              }
            `}
        >
          {/* ======================================================
                PACIANO STAYS — TWO SEPARATE EDITORIAL CAPSULES
            ====================================================== */}

          <div
            className="
              relative
              w-full
            "
          >
            <div
              className="
                relative z-20 mx-auto
                flex w-full
                flex-wrap
                items-center
                justify-center
                gap-3
                sm:gap-4
                lg:gap-5
                transition-all

              "
            >
              {[
                {
                  id: "deluxe",
                  name: "Deluxe Rooms",
                  descriptor: "RIVER & MOUNTAINS",
                  icon: "water",
                },
                {
                  id: "family",
                  name: "Family Sanctuary",
                  descriptor: "TOGETHER IN NATURE",
                  icon: "leaf",
                },
              ].map((item, index) => {
                const active = index === activeStay;

                return (
                  <button
                    key={item.name}
                    type="button"
                    onClick={() => {
                      changeStay(index);

                      const target = document.getElementById(
                        `room-section-${item.id}`,
                      );

                      if (target) {
                        const top =
                          target.getBoundingClientRect().top +
                          window.scrollY -
                          110;

                        window.scrollTo({
                          top,
                          behavior: "smooth",
                        });
                      }
                    }}
                    disabled={isTransitioning}
                    aria-pressed={active}
                    style={{
                      transitionDelay: visible
                        ? `${180 + index * 450}ms`
                        : "0ms",
                    }}
                    className={`
                      group
                      relative
                      flex
                      h-[76px]
                      w-full
                      max-w-[310px]
                      sm:w-[275px]
                      sm:max-w-none
                      lg:w-[300px]
                      xl:w-[315px]
                      shrink-0
                      items-center
                      gap-3
                      sm:gap-3.5
                      rounded-full
                      border
                      px-3
                      sm:px-4
                      text-left
                      outline-none
                      transition-all
                      duration-[800ms]
                      ease-[cubic-bezier(0.16,1,0.3,1)]
                      focus-visible:ring-2
                      focus-visible:ring-[#879368]/50
                      disabled:pointer-events-none
                      disabled:opacity-60
                      ${
                        visible
                          ? "translate-y-0 opacity-100"
                          : "translate-y-5 opacity-0"
                      }
                      ${
                        active
                          ? "border-[#586B3B] bg-[#586B3B] text-[#FFFDF4] shadow-[0_8px_24px_rgba(65,83,43,0.22)]"
                          : "border-[#D8D5C9]/80 bg-[#F7F4EB] text-[#344238] hover:border-[#9DA77F] hover:bg-[#EEEFE4] hover:shadow-[0_8px_24px_rgba(65,73,55,0.08)]"
                      }
                    `}
                  >
                    <span
                      className={`
                        relative
                        flex
                        h-[54px]
                        w-[54px]
                        shrink-0
                        items-center
                        justify-center
                        rounded-full
                        border
                        transition-all
                        duration-[800ms]
                        ease-[cubic-bezier(0.16,1,0.3,1)]

                        ${
                          active
                            ? "border-white/35 bg-[#71864F] text-[#FFFDF4] shadow-[0_0_0_3px_rgba(255,255,255,0.10),0_5px_18px_rgba(0,0,0,0.12)]"
                            : "border-[#C6C7BC]/80 bg-[#F8F5ED]/70 text-[#7E867A] group-hover:border-[#9DA77F] group-hover:bg-[#E9EAD9] group-hover:text-[#657547]"
                        }
                      `}
                    >
                      {/* Double border */}

                      <span
                        className={`
                          pointer-events-none
                          absolute
                          inset-[5px]
                          rounded-full
                          border
                          transition-all
                          duration-700
                          ${
                            active
                              ? "scale-100 border-white/25"
                              : "scale-100 border-[#B8BCAD]/35 group-hover:scale-[0.90] group-hover:border-[#9BA77A]/55"
                          }
                        `}
                      />

                      {/* Water / Nature icon */}

                      <span
                        className={`
                          relative
                          z-10
                          flex
                          items-center
                          justify-center
                          transition-transform
                          duration-700
                          ease-[cubic-bezier(0.16,1,0.3,1)]
                          ${
                            active
                              ? "scale-100"
                              : "scale-95 group-hover:scale-110 group-hover:-translate-y-0.5"
                          }
                        `}
                      >
                        {item.icon === "water" ? (
                          <svg
                            viewBox="0 0 32 32"
                            fill="none"
                            className="h-[25px] w-[25px]"
                            aria-hidden="true"
                          >
                            <path
                              d="M3 11.5C7 7.5 11 7.5 16 11.5C21 15.5 25 15.5 29 11.5"
                              stroke="currentColor"
                              strokeWidth="1.1"
                              strokeLinecap="round"
                            />
                            <path
                              d="M3 17C7 13 11 13 16 17C21 21 25 21 29 17"
                              stroke="currentColor"
                              strokeWidth="1.1"
                              strokeLinecap="round"
                            />
                            <path
                              d="M3 22.5C7 18.5 11 18.5 16 22.5C21 26.5 25 26.5 29 22.5"
                              stroke="currentColor"
                              strokeWidth="1.1"
                              strokeLinecap="round"
                            />
                          </svg>
                        ) : (
                          <svg
                            viewBox="0 0 32 32"
                            fill="none"
                            className="h-[25px] w-[25px]"
                            aria-hidden="true"
                          >
                            <path
                              d="M16 27V12"
                              stroke="currentColor"
                              strokeWidth="1.1"
                              strokeLinecap="round"
                            />
                            <path
                              d="M16 19C10 19 7 15 8 9C13 10 17 13 16 19Z"
                              stroke="currentColor"
                              strokeWidth="1.1"
                              strokeLinejoin="round"
                            />
                            <path
                              d="M16 15C16 9 20 5 26 6C25 12 22 16 16 15Z"
                              stroke="currentColor"
                              strokeWidth="1.1"
                              strokeLinejoin="round"
                            />
                            <path
                              d="M12 27H20"
                              stroke="currentColor"
                              strokeWidth="1"
                              strokeLinecap="round"
                              opacity=".6"
                            />
                          </svg>
                        )}
                      </span>

                      {/* Soft inner glow */}

                      <span
                        className={`
                          pointer-events-none
                          absolute
                          inset-0
                          rounded-full
                          transition-opacity
                          duration-700
                          ${
                            active
                              ? "opacity-100 shadow-[inset_0_0_12px_rgba(255,255,255,0.12)]"
                              : "opacity-0"
                          }
                        `}
                      />
                    </span>

                    {/* ==========================================
                          ROOM NAME + DESCRIPTOR
                      ========================================== */}

                    <span className="relative flex min-w-0 flex-1 flex-col justify-center gap-[5px]">
                      <span
                        className={`
                          whitespace-nowrap
                          font-cormorant
                          text-[19px]
                          sm:text-[19px]
                          lg:text-[20px]
                          leading-none
                          tracking-[-0.015em]
                          transition-colors
                          duration-700
                          ${
                            active
                              ? // ? "text-[#344238]"
                                // : "text-[#536054] group-hover:text-[#344238]"

                                "text-[#FFFDF4]"
                              : "text-[#536054] group-hover:text-[#344238]"
                          }
                        `}
                      >
                        {item.name}
                      </span>

                      <span
                        className={`
                          whitespace-nowrap
                          font-cormorant
                          text-[8px]
                          sm:text-[8px]
                          lg:text-[8.5px]
                          leading-[.95]
                          font-semibold
                          uppercase
                          tracking-[0.24em]
                          transition-colors
                          duration-700
                          ${
                            active
                              ? // ? "text-[#84915C]"
                                // : "text-[#81877B] group-hover:text-[#84915C]"
                                "text-[#E0E8CF]"
                              : "text-[#81877B] group-hover:text-[#84915C]"
                          }
                        `}
                      >
                        {item.descriptor}
                      </span>

                      {/* Animated underline */}

                      <span
                        className={`
                          absolute
                          -bottom-[11px]
                          left-0
                          h-[1px]
                          rounded-full
                          bg-[#879368]
                          transition-all
                          duration-[800ms]
                          ease-[cubic-bezier(0.16,1,0.3,1)]
                          ${active ? "w-[38px] opacity-100" : "w-0 opacity-0"}
                        `}
                      />
                    </span>

                    {/* Hover highlight */}

                    <span
                      aria-hidden="true"
                      className="
                        pointer-events-none
                        absolute
                        inset-0
                        rounded-full
                        opacity-0
                        transition-opacity
                        duration-700
                        group-hover:opacity-100
                        bg-[linear-gradient(110deg,transparent_20%,rgba(255,255,255,0.35)_50%,transparent_80%)]
                      "
                    />
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
      <RoomDescriptions />
      {/* ========================================================
          ANIMATIONS
          Kept INSIDE component — no separate CSS file.
      ======================================================== */}
      <style>
        {`

                @keyframes roomEnter {

                0% {
                  opacity: 0;
                  transform: scale(1.075);
                  filter: brightness(0.72) saturate(0.88);
                }

                18% {
                  opacity: 0.35;
                }

                55% {
                  opacity: 0.82;
                }

                100% {
                  opacity: 1;
                  transform: scale(1);
                  filter: brightness(1) saturate(1);
                }

              }

                    @keyframes imageEnter {

                0% {
                  opacity: 0;
                  transform: scale(1.065);
                  filter: brightness(0.82);
                }

                35% {
                  opacity: 0.7;
                }

                100% {
                  opacity: 1;
                  transform: scale(1);
                  filter: brightness(1);
                }

              }

                  @keyframes contentEnter {

                0% {
                  opacity: 0;
                  transform: translateY(25px);
                  filter: blur(4px);
                }

                45% {
                  opacity: 0.5;
                  filter: blur(1px);
                }

                100% {
                  opacity: 1;
                  transform: translateY(0);
                  filter: blur(0);
                }

              }
                @keyframes mistReveal {

                0% {
                  opacity: 0;
                  transform: translateY(25px) scale(1.04);
                }

                100% {
                  opacity: 1;
                  transform: translateY(0) scale(1);
                }

              }
                /* Mobile portrait only — smooth, fixed-position active card */
              @media screen and (max-width: 767px) and (orientation: portrait) {
                .day-moments-timeline {
                  display: grid !important;
                  grid-template-columns: minmax(0, 1fr);
                  align-items: center;
                  justify-items: center;
                  overflow: hidden;
                  gap: 0;
                }

                .day-moments-timeline > .day-moment-card {
                  grid-area: 1 / 1;
                  width: 100%;
                  max-width: 320px;
                  margin-inline: auto;

                  opacity: 0 !important;
                  visibility: hidden;
                  pointer-events: none;

                  transform: translate3d(12px, 0, 0) scale(0.985);

                  transition:
                    opacity 650ms cubic-bezier(0.22, 1, 0.36, 1),
                    transform 650ms cubic-bezier(0.22, 1, 0.36, 1),
                    visibility 0s linear 650ms !important;

                  transition-delay: 0ms !important;
                }

                .day-moments-timeline > .day-moment-card.is-active {
                  opacity: 1 !important;
                  visibility: visible;
                  pointer-events: auto;

                  transform: translate3d(0, 0, 0) scale(1);

                  transition:
                    opacity 650ms cubic-bezier(0.22, 1, 0.36, 1),
                    transform 650ms cubic-bezier(0.22, 1, 0.36, 1),
                    visibility 0s !important;

                  transition-delay: 0ms !important;
                }
              }

                @media (prefers-reduced-motion: reduce) {

                *,
                *::before,
                *::after {
                  animation-duration: 0.01ms !important;
                  animation-iteration-count: 1 !important;
                  transition-duration: 0.01ms !important;
                }

              }

              @keyframes mistDrift {
                0% {
                  transform: scale(1.04) translate3d(-12px, 0, 0);
                }

                50% {
                  transform: scale(1.06) translate3d(0, -3px, 0);
                }

                100% {
                  transform: scale(1.04) translate3d(12px, 0, 0);
                }
              }

              @keyframes signatureFloat {

              0%,
              100% {
                  transform: translateY(0);
              }

              50% {
                  transform: translateY(-5px);
              }

              }

              @keyframes luxuryRoomDrift {

              0% {
                  transform: scale(1);
              }

              100% {
                  transform: scale(1.035);
              }

              }

              @keyframes stayIconFloat {
              0%,
              100% {
                  transform: translateY(0) rotate(0deg);
              }

              50% {
                  transform: translateY(-3px) rotate(1deg);
              }
              }

              @keyframes exploreBreath {
              0%,
              100% {
                  transform: translateY(0);
              }

              50% {
                  transform: translateY(-3px);
              }
              }

              @keyframes collectionFrame {

              0%,
              100% {
                transform: translateY(0);
              }

              50% {
                transform: translateY(-2px);
              }

            }

          /* =====================================================
            UNDERLINE — SLOW BREATHING
          ===================================================== */

          @keyframes collectionLine {

            0%,
            100% {
              width: 52px;
              opacity: 0.55;
            }

            50% {
              width: 72px;
              opacity: 0.9;
            }

          }

          /* =====================================================
            CTA GLINT — VERY SUBTLE
          ===================================================== */

          @keyframes ctaGlint {

            0% {
              transform: translateX(0);
              opacity: 0;
            }

            35% {
              opacity: 0.8;
            }

            100% {
              transform: translateX(26px);
              opacity: 0;
            }

          }

          .paciano-stay-step {
            opacity: 0;
            transform: translateY(42px);
            filter: blur(2px);

            transition:
              opacity 1.35s cubic-bezier(0.16, 1, 0.3, 1),
              transform 1.35s cubic-bezier(0.16, 1, 0.3, 1),
              filter 1.35s cubic-bezier(0.16, 1, 0.3, 1);
          }

          .paciano-about-visible .paciano-stay-step {
            opacity: 1;
            transform: translateY(0);
            filter: blur(0);
          }

          /* ------------------------------------------------------------
            STEP TIMING
            ------------------------------------------------------------ */

          .paciano-stay-step-1 {
            transition-delay: 0ms;
          }

          .paciano-stay-step-2 {
            transition-delay: 220ms;
          }

          .paciano-stay-step-3 {
            transition-delay: 460ms;
          }

          .paciano-stay-step-4 {
            transition-delay: 760ms;
          }

          .paciano-stay-step-5 {
            transition-delay: 1250ms;
          }

          .paciano-stay-step-6 {
            transition-delay: 2050ms;
          }

          /* ------------------------------------------------------------
            REDUCED MOTION
            ------------------------------------------------------------ */

          @media (prefers-reduced-motion: reduce) {
            .paciano-stay-step {
              opacity: 1;
              transform: none;
              filter: none;
              transition: none;
            }
          }

          @keyframes roomGalleryEnter {
            from {
              opacity: 0.65;
              transform: scale(1.045);
            }
            to {
              opacity: 1;
              transform: scale(1);
            }
          }

          @keyframes lightboxFade {
            from {
              opacity: 0;
              backdrop-filter: blur(0);
            }
            to {
              opacity: 1;
              backdrop-filter: blur(12px);
            }
          }

        `}
      </style>
    </section>
  );
}