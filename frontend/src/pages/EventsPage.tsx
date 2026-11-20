import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import EventsHero from "@/components/Events/EventsHero";
import EventsType from "@/components/Events/EventsType";
import EventsCarousel from "@/components/Events/EventsCarousel";
import { useEventsContent } from "@/hooks/useEventsContent";

export default function EventsPage() {
  const [scrolled, setScrolled] = useState(false);
  const { data } = useEventsContent();

  useEffect(() => {
    window.scrollTo(0, 0);
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  return (
    <>
      <Navbar scrolled={scrolled} activeNav="events" />
      <main className="overflow-hidden bg-[#F8F5EE]">
        <EventsHero landing={data?.landing ?? null} />
        <EventsType
          previews={data?.type_previews}
          corporateImageUrl={data?.categories?.corporate?.landing_preview_image_url}
          weddingImageUrl={data?.categories?.wedding?.landing_preview_image_url}
        />
        <EventsCarousel slides={data?.advantage_slides} />
        <Footer />
      </main>
    </>
  );
}
