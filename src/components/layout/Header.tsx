"use client";

import { useState } from "react";
import Link from "next/link";
import { FallbackImage as Image } from "@/components/ui/fallback-image";
import { usePathname, useRouter } from "next/navigation";
import { buttonVariants } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
import { ContactPopup } from "@/components/shared/ContactPopup";

export function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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
        <nav className="hidden lg:flex items-center gap-6 xl:gap-8 text-base font-bold">
          <Link href="/#services" onClick={handleScroll} className="whitespace-nowrap transition-colors hover:text-primary text-slate-300 focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none rounded-sm">Services</Link>
          <Link href="/work" className="whitespace-nowrap transition-colors hover:text-primary text-slate-300 focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none rounded-sm">Case Studies</Link>
          <Link href="/about" className="whitespace-nowrap transition-colors hover:text-primary text-slate-300 focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none rounded-sm">About</Link>
          <Link href="/resources" className="whitespace-nowrap transition-colors hover:text-primary text-slate-300 focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none rounded-sm">Insights & Resources</Link>
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
        <div id="mobile-menu" className="lg:hidden border-t border-white/10 bg-slate-950/90 backdrop-blur-xl absolute w-full shadow-2xl h-[calc(100dvh-64px)] overflow-y-auto">
          <nav className="flex flex-col items-center gap-4 pt-8 pb-32 text-base font-medium">
            <Link href="/#services" onClick={handleScroll} className="transition-colors hover:text-primary text-slate-300 w-full text-center py-2 focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none">Services</Link>
            <Link href="/#industries" onClick={handleScroll} className="transition-colors hover:text-primary text-slate-300 w-full text-center py-2 focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none">Industries</Link>
            <Link href="/locations" onClick={() => setIsMobileMenuOpen(false)} className="transition-colors hover:text-primary text-slate-300 w-full text-center py-2 focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none">Locations</Link>
            <Link href="/work" onClick={() => setIsMobileMenuOpen(false)} className="transition-colors hover:text-primary text-slate-300 w-full text-center py-2 focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none">Case Studies</Link>
            <Link href="/resources" onClick={() => setIsMobileMenuOpen(false)} className="transition-colors hover:text-primary text-slate-300 w-full text-center py-2 focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none">Insights & Resources</Link>
            <Link href="/about" onClick={() => setIsMobileMenuOpen(false)} className="transition-colors hover:text-primary text-slate-300 w-full text-center py-2 focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none">About</Link>
          </nav>
        </div>
      )}
    </header>
  );
}
