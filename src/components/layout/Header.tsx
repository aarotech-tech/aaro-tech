"use client";

import { useState } from "react";
import Link from "next/link";
import { FallbackImage as Image } from "@/components/ui/fallback-image";
import { usePathname } from "next/navigation";
import { buttonVariants } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
import { ContactPopup } from "@/components/shared/ContactPopup";

export function Header() {
  const pathname = usePathname();
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
      }
    }
  };

  return (
    <header className="fixed top-0 w-full z-50 border-b bg-white/90 backdrop-blur-md shadow-sm">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 flex h-16 items-center justify-between">
        <div className="flex gap-2 items-center">
          <Link href="/" onClick={handleLogoClick} className="flex items-center space-x-2">
            <Image
              src="/images/aarotech-logos/header-logo-primary.png"
              alt="Aarotech"
              width={200}
              height={60}
              className="h-10 md:h-12 w-auto object-contain block dark:hidden"
              priority
              loading="eager"
            />
            <Image
              src="/images/aarotech-logos/header-logo-primary.png"
              alt="Aarotech"
              width={200}
              height={60}
              className="h-10 md:h-12 w-auto object-contain hidden dark:block"
              priority
              loading="eager"
            />
          </Link>
        </div>
        <nav className="hidden lg:flex items-center gap-6 xl:gap-8 text-base font-bold">
          <Link href="/#services" onClick={handleScroll} className="transition-colors hover:text-primary text-slate-700 focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none rounded-sm">Services</Link>
          <Link href="/#industries" onClick={handleScroll} className="transition-colors hover:text-primary text-slate-700 focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none rounded-sm">Industries</Link>
          <Link href="/#process" onClick={handleScroll} className="transition-colors hover:text-primary text-slate-700 focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none rounded-sm">Process</Link>
          <Link href="/#work" onClick={handleScroll} className="transition-colors hover:text-primary text-slate-700 focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none rounded-sm">Case Studies</Link>
          <Link href="/#testimonials" onClick={handleScroll} className="transition-colors hover:text-primary text-slate-700 focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none rounded-sm">Testimonials</Link>
          <Link href="/#about" onClick={handleScroll} className="transition-colors hover:text-primary text-slate-700 focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none rounded-sm">About</Link>
          <Link href="/#faq" onClick={handleScroll} className="transition-colors hover:text-primary text-slate-700 focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none rounded-sm">FAQ</Link>
        </nav>
        <div className="hidden sm:flex items-center gap-4">
          <ContactPopup>
            <button className={buttonVariants({ size: "lg", className: "text-base font-semibold px-6 xl:px-8" })}>Get My Free Growth Plan</button>
          </ContactPopup>
        </div>
        <button
          className="lg:hidden p-2 text-foreground"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          aria-label="Toggle menu"
        >
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="lg:hidden border-t bg-white/95 backdrop-blur-xl absolute w-full shadow-xl h-[calc(100dvh-64px)] overflow-y-auto">
          <nav className="flex flex-col items-center gap-4 pt-8 pb-32 text-base font-medium">
            <Link href="/#services" onClick={handleScroll} className="transition-colors hover:text-primary text-foreground w-full text-center py-2 focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none">Services</Link>
            <Link href="/#industries" onClick={handleScroll} className="transition-colors hover:text-primary text-foreground w-full text-center py-2 focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none">Industries</Link>
            <Link href="/#process" onClick={handleScroll} className="transition-colors hover:text-primary text-foreground w-full text-center py-2 focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none">Process</Link>
            <Link href="/#work" onClick={handleScroll} className="transition-colors hover:text-primary text-foreground w-full text-center py-2 focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none">Case Studies</Link>
            <Link href="/#testimonials" onClick={handleScroll} className="transition-colors hover:text-primary text-foreground w-full text-center py-2 focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none">Testimonials</Link>
            <Link href="/#about" onClick={handleScroll} className="transition-colors hover:text-primary text-foreground w-full text-center py-2 focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none">About</Link>
            <Link href="/#faq" onClick={handleScroll} className="transition-colors hover:text-primary text-foreground w-full text-center py-2 focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none">FAQ</Link>
          </nav>
        </div>
      )}
    </header>
  );
}
