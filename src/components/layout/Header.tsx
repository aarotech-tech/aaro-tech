"use client";

import { useState } from "react";
import Link from "next/link";
import { FallbackImage as Image } from "@/components/ui/fallback-image";
import { usePathname, useRouter } from "next/navigation";
import { buttonVariants } from "@/components/ui/button";
import { Menu, X, ChevronDown, ArrowRight } from "lucide-react";
import { ContactPopup } from "@/components/shared/ContactPopup";

export function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [mobileServicesOpen, setMobileServicesOpen] = useState(false);
  const [mobileResourcesOpen, setMobileResourcesOpen] = useState(false);

  const handleLogoClick = (e: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => {
    setIsMobileMenuOpen(false);
    if (pathname === "/") {
      e.preventDefault();
      window.scrollTo({
        top: 0,
        behavior: "smooth"
      });
    }
  };

  const handleScroll = (e: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => {
    setIsMobileMenuOpen(false);
    const href = e.currentTarget.getAttribute("href");
    if (!href?.startsWith("/#")) return;

    const targetId = href.replace("/#", "");

    if (pathname === "/") {
      e.preventDefault();
      const elem = document.getElementById(targetId);
      if (elem) {
        const targetPosition = elem.getBoundingClientRect().top + window.scrollY - 64; // Offset for sticky header

        // Use native hardware-accelerated smooth scrolling instead of custom JS loops
        window.scrollTo({
          top: targetPosition,
          behavior: "smooth"
        });
        
        // Update URL to reflect the new hash without triggering Next.js router jumps
        router.push(href, { scroll: false });
      }
    }
  };

  return (
    <header className="fixed top-0 w-full z-50 border-b border-white/10 bg-slate-950/85 backdrop-blur-xl shadow-md transition-all duration-300">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 flex h-16 items-center justify-between">
        <div className="flex gap-2 items-center">
          <Link href="/" onClick={handleLogoClick} className="flex items-center space-x-2">
            <Image
              src="/images/aarotech-logos/footer-logo-primary.png"
              alt="Aarotech"
              width={200}
              height={60}
              className="h-10 md:h-12 w-auto object-contain"
              priority
              loading="eager"
            />
          </Link>
        </div>
        <nav className="hidden lg:flex items-center gap-6 xl:gap-8 text-base font-bold h-full">
          <div className="relative group h-full flex items-center">
            <Link href="/#services" onClick={handleScroll} className="whitespace-nowrap transition-colors hover:text-primary text-slate-300 focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none rounded-sm py-4">Services</Link>
            <div className="absolute top-full left-1/2 -translate-x-1/2 w-64 pt-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 translate-y-2 group-hover:translate-y-0 z-50">
              <div className="bg-slate-900 border border-slate-800 rounded-xl shadow-[0_20px_50px_-12px_rgba(0,0,0,0.5)] p-2 flex flex-col relative before:absolute before:-top-2 before:left-1/2 before:-translate-x-1/2 before:w-4 before:h-4 before:bg-slate-900 before:border-l before:border-t before:border-slate-800 before:rotate-45 before:rounded-tl-sm">
                <Link href="/services/website-development" className="px-4 py-3 text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors relative z-10">Website Development</Link>
                <Link href="/services/seo" className="px-4 py-3 text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors relative z-10">SEO</Link>
                <Link href="/services/digital-advertising" className="px-4 py-3 text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors relative z-10">Google & Meta Ads</Link>
                <Link href="/services/social-media" className="px-4 py-3 text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors relative z-10">Social Media</Link>
                <div className="h-px bg-slate-800 my-1"></div>
                <Link href="/services" className="px-4 py-3 text-sm font-bold text-primary hover:text-primary/80 hover:bg-slate-800 rounded-lg transition-colors relative z-10 flex items-center justify-between group/link">
                  View All Services
                  <ArrowRight className="w-4 h-4 transition-transform group-hover/link:translate-x-1" />
                </Link>
              </div>
            </div>
          </div>
          
          <Link href="/work" className="whitespace-nowrap transition-colors hover:text-primary text-slate-300 focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none rounded-sm py-4">Case Studies</Link>
          <Link href="/about" className="whitespace-nowrap transition-colors hover:text-primary text-slate-300 focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none rounded-sm py-4">About</Link>
          
          <div className="relative group h-full flex items-center">
            <Link href="/resources" className="whitespace-nowrap transition-colors hover:text-primary text-slate-300 focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none rounded-sm py-4">Insights & Resources</Link>
            <div className="absolute top-full left-1/2 -translate-x-1/2 w-64 pt-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 translate-y-2 group-hover:translate-y-0 z-50">
              <div className="bg-slate-900 border border-slate-800 rounded-xl shadow-[0_20px_50px_-12px_rgba(0,0,0,0.5)] p-2 flex flex-col relative before:absolute before:-top-2 before:left-1/2 before:-translate-x-1/2 before:w-4 before:h-4 before:bg-slate-900 before:border-l before:border-t before:border-slate-800 before:rotate-45 before:rounded-tl-sm">
                <Link href="/blog" className="px-4 py-3 text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors relative z-10">Growth Blog</Link>
                <Link href="/resources" className="px-4 py-3 text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors relative z-10">Free Checklists</Link>
                <Link href="/compare/seo-vs-google-ads" className="px-4 py-3 text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors relative z-10">Compare Strategies</Link>
                <Link href="/industries/healthcare-hospitals" className="px-4 py-3 text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors relative z-10">Healthcare Marketing</Link>
              </div>
            </div>
          </div>
        </nav>
        <div className="hidden sm:flex items-center gap-4">
          <ContactPopup>
            <button className={buttonVariants({ size: "lg", className: "text-base font-semibold px-6 xl:px-8" })}>Get My Free Growth Plan</button>
          </ContactPopup>
        </div>
        <button
          className="lg:hidden p-2 text-slate-200 hover:text-white focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none rounded-md cursor-pointer"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
          aria-expanded={isMobileMenuOpen}
          aria-controls="mobile-menu"
        >
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div id="mobile-menu" className="lg:hidden border-t border-white/10 bg-slate-950 absolute w-full shadow-2xl h-[calc(100dvh-64px)] overflow-y-auto">
          <nav className="flex flex-col items-stretch gap-2 pt-8 pb-32 text-base font-medium px-6">
            <div className="flex flex-col border-b border-white/5 pb-2">
              <button 
                onClick={() => setMobileServicesOpen(!mobileServicesOpen)}
                className="flex items-center justify-between w-full py-3 text-slate-300 hover:text-primary transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-md"
              >
                <span>Services</span>
                <ChevronDown className={`w-5 h-5 transition-transform duration-300 ${mobileServicesOpen ? 'rotate-180 text-primary' : ''}`} />
              </button>
              
              <div className={`overflow-hidden transition-all duration-300 ${mobileServicesOpen ? 'max-h-64 opacity-100 mt-2' : 'max-h-0 opacity-0'}`}>
                <div className="flex flex-col gap-2 pl-4 border-l border-white/10 ml-2">
                  <Link href="/services/website-development" onClick={() => setIsMobileMenuOpen(false)} className="py-2 text-sm text-slate-400 hover:text-white transition-colors">Website Development</Link>
                  <Link href="/services/seo" onClick={() => setIsMobileMenuOpen(false)} className="py-2 text-sm text-slate-400 hover:text-white transition-colors">SEO</Link>
                  <Link href="/services/digital-advertising" onClick={() => setIsMobileMenuOpen(false)} className="py-2 text-sm text-slate-400 hover:text-white transition-colors">Google & Meta Ads</Link>
                  <Link href="/services/social-media" onClick={() => setIsMobileMenuOpen(false)} className="py-2 text-sm text-slate-400 hover:text-white transition-colors">Social Media</Link>
                  <Link href="/services" onClick={() => setIsMobileMenuOpen(false)} className="py-2 text-sm font-bold text-primary hover:text-primary/80 transition-colors mt-1">View All Services →</Link>
                </div>
              </div>
            </div>

            <Link href="/#industries" onClick={handleScroll} className="transition-colors hover:text-primary text-slate-300 w-full py-3 border-b border-white/5 focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none">Industries</Link>
            <Link href="/locations" onClick={() => setIsMobileMenuOpen(false)} className="transition-colors hover:text-primary text-slate-300 w-full py-3 border-b border-white/5 focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none">Locations</Link>
            <Link href="/work" onClick={() => setIsMobileMenuOpen(false)} className="transition-colors hover:text-primary text-slate-300 w-full py-3 border-b border-white/5 focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none">Case Studies</Link>

            <div className="flex flex-col border-b border-white/5 pb-2">
              <button 
                onClick={() => setMobileResourcesOpen(!mobileResourcesOpen)}
                className="flex items-center justify-between w-full py-3 text-slate-300 hover:text-primary transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-md"
              >
                <span>Insights & Resources</span>
                <ChevronDown className={`w-5 h-5 transition-transform duration-300 ${mobileResourcesOpen ? 'rotate-180 text-primary' : ''}`} />
              </button>
              
              <div className={`overflow-hidden transition-all duration-300 ${mobileResourcesOpen ? 'max-h-64 opacity-100 mt-2' : 'max-h-0 opacity-0'}`}>
                <div className="flex flex-col gap-2 pl-4 border-l border-white/10 ml-2">
                  <Link href="/blog" onClick={() => setIsMobileMenuOpen(false)} className="py-2 text-sm text-slate-400 hover:text-white transition-colors">Growth Blog</Link>
                  <Link href="/resources" onClick={() => setIsMobileMenuOpen(false)} className="py-2 text-sm text-slate-400 hover:text-white transition-colors">Free Checklists</Link>
                  <Link href="/compare/seo-vs-google-ads" onClick={() => setIsMobileMenuOpen(false)} className="py-2 text-sm text-slate-400 hover:text-white transition-colors">Compare Strategies</Link>
                  <Link href="/industries/healthcare-hospitals" onClick={() => setIsMobileMenuOpen(false)} className="py-2 text-sm text-slate-400 hover:text-white transition-colors">Healthcare Marketing</Link>
                </div>
              </div>
            </div>

            <Link href="/about" onClick={() => setIsMobileMenuOpen(false)} className="transition-colors hover:text-primary text-slate-300 w-full py-3 focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none">About</Link>
          </nav>
        </div>
      )}
    </header>
  );
}
