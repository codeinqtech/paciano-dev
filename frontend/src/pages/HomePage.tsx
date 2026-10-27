import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import AboutUs from "@/components/AboutUs";
import Accommodation from "@/components/Accommodation";
import DiningSection from "@/components/DiningSection";
import GuestStories from "@/components/GuestStories";
import Location from "@/components/Location";
import Footer from "@/components/Footer";
import PacianoHomeLoader from "@/components/PacianoHomeLoader";
import {
  HomeContentProvider,
  useHomeContent,
} from "@/hooks/useHomeContent";

export default function HomePage() {
  return (
    <HomeContentProvider>
      <HomePageInner />
    </HomeContentProvider>
  );
}

function HomePageInner() {
  const [scrolled, setScrolled] = useState(false);
  const { loading } = useHomeContent();
  const [loaderVisible, setLoaderVisible] = useState(true);
  const [loaderExiting, setLoaderExiting] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 60);
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (loading) {
      setLoaderVisible(true);
      setLoaderExiting(false);
      return;
    }
    if (loaderVisible && !loaderExiting) {
      setLoaderExiting(true);
    }
  }, [loading, loaderVisible, loaderExiting]);

  useEffect(() => {
    if (!loaderVisible) {
      return;
    }
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [loaderVisible]);

  return (
    <>
      {loaderVisible ? (
        <PacianoHomeLoader
          exiting={loaderExiting}
          onExitComplete={() => {
            setLoaderVisible(false);
            setLoaderExiting(false);
          }}
        />
      ) : null}
      <Navbar scrolled={scrolled} activeNav="home" />
      <main className="overflow-hidden bg-[#ece6d8]">
        <HeroSection />
        <AboutUs />
        <Accommodation />
        {/* <DiningSection /> */}
        <GuestStories />
        <Location />
        <Footer />
      </main>
    </>
  );
}
