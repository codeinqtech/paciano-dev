import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import EventTypeHero from "@/components/EventType/EventTypeHero";
import EventTypeAdvantage from "@/components/EventType/EventTypeAdvantage";
import EventsTypeVenues from "@/components/EventType/EventTypeVenues";

import { corporateEventConfig } from "@/config/corporateEventConfig";
import { weddingEventConfig } from "@/config/weddingEventConfig";
import { useEventsContent, type EventsContentCms } from "@/hooks/useEventsContent";
import { toAppPath } from "@/lib/appBase";

interface EventCategoryPageProps {
  path: string;
}

function buildCategoryConfig(
  isWedding: boolean,
  cms: EventsContentCms | null,
) {
  const base = isWedding ? weddingEventConfig : corporateEventConfig;
  const key = isWedding ? "wedding" : "corporate";
  const cat = cms?.categories?.[key];
  if (!cat) return base;

  const hero = cat.page.hero;
  const adv = cat.page.advantage;
  const venues = cat.page.venues;

  const experienceImages = cat.experience_items.map((item, index) => ({
    src:
      item.image_url ??
      base.advantage.images[index]?.src ??
      base.advantage.images[0]?.src,
    alt: item.title,
  }));

  return {
    hero: {
      ...base.hero,
      eventType: hero.event_type ?? base.hero.eventType,
      titleLine1: hero.title_line1 ?? base.hero.titleLine1,
      titleLine2: hero.title_line2 ?? base.hero.titleLine2,
      description: hero.description ?? base.hero.description,
      image: hero.image_url ?? base.hero.image,
      ctaText: hero.cta_text ?? base.hero.ctaText,
      ctaHref: hero.cta_href ? toAppPath(hero.cta_href) : base.hero.ctaHref,
    },
    advantage: {
      ...base.advantage,
      eyebrow: adv.eyebrow ?? base.advantage.eyebrow,
      titleLine1: adv.title_line1 ?? base.advantage.titleLine1,
      titleLine2: adv.title_line2 ?? base.advantage.titleLine2,
      description: adv.description ?? base.advantage.description,
      features: cat.experience_items.map((item) => ({
        title: item.title,
        description: item.description ?? "",
        icon: item.icon_key ?? "sparkles",
      })),
      images:
        experienceImages.length > 0 ? experienceImages : base.advantage.images,
    },
    venues: {
      ...base.venues,
      eyebrow: venues.eyebrow ?? base.venues.eyebrow,
      title1: venues.title1 ?? base.venues.title1,
      title2: venues.title2 ?? base.venues.title2,
      description: venues.description ?? base.venues.description,
      items: cat.venue_items.map((item, index) => ({
        title: item.title,
        description: item.description ?? "",
        image:
          item.image_url ??
          base.venues.items[index]?.image ??
          base.venues.items[0]?.image,
        capacity: item.capacity ?? "Up to 150 Guests",
        setup: item.setup ?? "Open-air Setting",
      })),
    },
    highlights: base.highlights,
    dining: base.dining,
  };
}

export default function EventCategoryPage({ path }: EventCategoryPageProps) {
  const [scrolled, setScrolled] = useState(false);
  const { data } = useEventsContent();

  const isWedding = path === "/events/weddings";

  const config = buildCategoryConfig(isWedding, data);

  useEffect(() => {
    window.scrollTo(0, 0);

    const onScroll = () => setScrolled(window.scrollY > 40);

    window.addEventListener("scroll", onScroll, { passive: true });

    return () => window.removeEventListener("scroll", onScroll);
  }, [path]);

  return (
    <>
      <Navbar scrolled={scrolled} activeNav="events" />

      <main className="overflow-hidden bg-[#F8F5EE]">
        <EventTypeHero {...config.hero} />
        <EventTypeAdvantage {...config.advantage} />
        <EventsTypeVenues {...config.venues} />
      </main>

      <Footer />
    </>
  );
}
