import { Metadata } from "next";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { StoryHero } from "@/components/sections/about/StoryHero";
import { TheHonestTruth } from "@/components/sections/about/TheHonestTruth";
import { TheJourney } from "@/components/sections/about/TheJourney";
import { OurPrinciples } from "@/components/sections/about/OurPrinciples";
import { TheBuilders } from "@/components/sections/about/TheBuilders";
// import { WorkInProgress } from "@/components/sections/about/WorkInProgress";
import { StoryCTA } from "@/components/sections/about/StoryCTA";

export const metadata: Metadata = {
  title: "About Us | Aarotech",
  description: "Meet the Aarotech team — a founder-led digital marketing agency based in Trichy, helping businesses across Tamil Nadu grow with SEO, web development, and performance marketing.",
};

export default function AboutPage() {
  return (
    <>
      <Header />
      <main className="flex-1 overflow-x-hidden bg-white">
        <StoryHero />
        <TheHonestTruth />
        <TheJourney />
        <OurPrinciples />
        <TheBuilders />
        {/* <WorkInProgress /> */}
        <StoryCTA />
      </main>
      <Footer />
    </>
  );
}
