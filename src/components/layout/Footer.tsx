import Link from "next/link";
import { FallbackImage as Image } from "@/components/ui/fallback-image";

export function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-300 py-12 md:py-16">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-1">
            <Link href="/" className="flex items-center space-x-2 mb-4">
              <Image
                src="/images/aarotech-logos/footer-logo-primary.png"
                alt="Aarotech"
                width={240}
                height={70}
                className="h-14 md:h-20 w-auto object-contain block"
              />
            </Link>
            <p className="text-sm text-slate-400">
              Helping businesses grow through data-driven digital marketing, SEO, and targeted advertising.
            </p>
          </div>
          <div>
            <h3 className="font-semibold text-white mb-4">Services</h3>
            <ul className="space-y-2 text-sm text-slate-400">
              <li><Link href="/#services" className="hover:text-primary transition-colors focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none rounded-sm">Website Development</Link></li>
              <li><Link href="/#services" className="hover:text-primary transition-colors focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none rounded-sm">SEO</Link></li>
              <li><Link href="/#services" className="hover:text-primary transition-colors focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none rounded-sm">Google & Meta Ads</Link></li>
              <li><Link href="/#services" className="hover:text-primary transition-colors focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none rounded-sm">Branding</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold text-white mb-4">Company</h3>
            <ul className="space-y-2 text-sm text-slate-400">
              <li><Link href="/#industries" className="hover:text-primary transition-colors focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none rounded-sm">Industries</Link></li>
              <li><Link href="/#process" className="hover:text-primary transition-colors focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none rounded-sm">How We Work</Link></li>
              <li><Link href="/#work" className="hover:text-primary transition-colors focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none rounded-sm">Case Studies</Link></li>
              <li><Link href="/#testimonials" className="hover:text-primary transition-colors focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none rounded-sm">Testimonials</Link></li>
              <li><Link href="/#about" className="hover:text-primary transition-colors focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none rounded-sm">About Us</Link></li>
              <li><Link href="/#faq" className="hover:text-primary transition-colors focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none rounded-sm">FAQ</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold text-white mb-4">Contact</h3>
            <ul className="space-y-2 text-sm text-slate-400">
              {process.env.NEXT_PUBLIC_BUSINESS_EMAIL && (
                <li><a href={`mailto:${process.env.NEXT_PUBLIC_BUSINESS_EMAIL}`} className="hover:text-primary transition-colors">{process.env.NEXT_PUBLIC_BUSINESS_EMAIL}</a></li>
              )}
              {process.env.NEXT_PUBLIC_WHATSAPP_NUMBER && (
                <li><a href={`https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP_NUMBER}`} target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">WhatsApp Us</a></li>
              )}
              {process.env.NEXT_PUBLIC_LINKEDIN_URL && (
                <li><a href={process.env.NEXT_PUBLIC_LINKEDIN_URL} target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">LinkedIn</a></li>
              )}
              <li>Tamil Nadu, India</li>
            </ul>
          </div>
        </div>
        <div className="mt-12 pt-8 border-t border-slate-800 flex flex-col md:flex-row items-center justify-between text-sm text-slate-500">
          <p>© {new Date().getFullYear()} Aarotech. All rights reserved.</p>
          <div className="flex space-x-4 mt-4 md:mt-0">
            <Link href="/privacy-policy" className="hover:text-white transition-colors focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none rounded-sm">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-white transition-colors focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none rounded-sm">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
