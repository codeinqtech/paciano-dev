import { useEffect, useRef, useState, type ReactNode } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import AboutUsHero from "@/components/AboutUs/AboutUsHero";
import AboutUsInfo from "@/components/AboutUs/AboutUsInfo";
import PacianoStory from "@/components/AboutUs/PacianoStorySection";
import GuestReviews from "../components/AboutUs/GuestReviews";
import { useAboutPageContent } from "@/hooks/useAboutPageContent";

const PARCHMENT = "#eee9dc";

export default function AboutUsPage() {
  const { blocks } = useAboutPageContent();
  const hero = blocks.hero ?? null;
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      <Navbar scrolled={scrolled} activeNav="about" />
      <main style={{ background: PARCHMENT }}>
        <AboutUsHero content={hero} />
        <AboutUsInfo />
        <PacianoStory content={blocks.story} />
        <GuestReviews />
        <div className="relative isolate">
          {/* <ContactLocationSection /> */}
          <Footer contactOverlap />
        </div>
      </main>
    </>
  );
}
