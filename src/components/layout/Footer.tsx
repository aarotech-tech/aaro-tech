import Link from "next/link";
import { FallbackImage as Image } from "@/components/ui/fallback-image";
import { ContactPopup } from "@/components/shared/ContactPopup";

export function Footer({ hideCTA = false }: { hideCTA?: boolean } = {}) {
  return (
    <footer className="bg-slate-900 text-slate-300 py-12 md:py-16">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {!hideCTA && (
          <div className="bg-gradient-to-r from-primary/20 to-primary/5 rounded-3xl p-8 md:p-12 mb-16 border border-primary/20 text-center shadow-2xl flex flex-col items-center">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Stop scrolling. Start growing.</h2>
            <p className="text-lg text-slate-300 mb-8 max-w-2xl mx-auto">
              Ready to increase your lead volume and revenue? Let's build a custom growth plan for your business.
            </p>
            <ContactPopup>
              <button className="inline-flex h-auto py-4 w-full sm:w-auto items-center justify-center rounded-xl bg-primary px-6 md:px-8 text-base whitespace-normal font-bold text-white shadow-xl hover:-translate-y-1 hover:bg-primary/90 transition-all cursor-pointer">
                Claim Your Free Growth Plan Today
              </button>
            </ContactPopup>
          </div>
        )}
        <div className="grid grid-cols-1 md:grid-cols-6 gap-8">
          <div className="col-span-1 md:col-span-1">
            <Link href="/" className="flex items-center space-x-2 mb-4">
              <Image
                src="/images/aarotech-logos/footer-logo-primary.png"
                alt="Aarotech"
                width={240}
                height={70}
                priority
                className="h-14 md:h-20 w-auto object-contain block"
              />
            </Link>
            <p className="text-sm text-slate-400">
              A Trichy-based digital marketing and technology agency helping businesses across Tamil Nadu grow online.
            </p>
          </div>
          <div>
            <h3 className="font-semibold text-white mb-4">Company</h3>
            <ul className="space-y-2 text-sm text-slate-400">
              <li><Link href="/about" className="hover:text-primary transition-colors focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none rounded-sm">About Us</Link></li>
              <li><Link href="/work" className="hover:text-primary transition-colors focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none rounded-sm">Case Studies</Link></li>
              <li><Link href="/#contact" className="hover:text-primary transition-colors focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none rounded-sm">Contact</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold text-white mb-4">Services</h3>
            <ul className="space-y-2 text-sm text-slate-400">
              <li><Link href="/services/website-development" className="hover:text-primary transition-colors focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none rounded-sm">Website Development</Link></li>
              <li><Link href="/services/seo" className="hover:text-primary transition-colors focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none rounded-sm">SEO</Link></li>
              <li><Link href="/services/digital-advertising" className="hover:text-primary transition-colors focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none rounded-sm">Google & Meta Ads</Link></li>
              <li><Link href="/services/social-media" className="hover:text-primary transition-colors focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none rounded-sm">Social Media</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold text-white mb-4">Insights & Resources</h3>
            <ul className="space-y-2 text-sm text-slate-400">
              <li><Link href="/blog" className="hover:text-primary transition-colors focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none rounded-sm">Growth Blog</Link></li>
              <li><Link href="/resources" className="hover:text-primary transition-colors focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none rounded-sm">Free Checklists</Link></li>
              <li><Link href="/compare/seo-vs-google-ads" className="hover:text-primary transition-colors focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none rounded-sm">Compare Strategies</Link></li>
              <li><Link href="/industries/healthcare-hospitals" className="hover:text-primary transition-colors focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none rounded-sm">Healthcare Marketing</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold text-white mb-4">Locations</h3>
            <ul className="space-y-2 text-sm text-slate-400">
              <li><Link href="/locations/trichy" className="hover:text-primary transition-colors font-medium text-white focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none rounded-sm">Trichy (HQ)</Link></li>
              <li><Link href="/locations/chennai" className="hover:text-primary transition-colors focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none rounded-sm">Chennai</Link></li>
              <li><Link href="/locations/coimbatore" className="hover:text-primary transition-colors focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none rounded-sm">Coimbatore</Link></li>
              <li><Link href="/locations/madurai" className="hover:text-primary transition-colors focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none rounded-sm">Madurai</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold text-white mb-4">Aarotech Solutions</h3>
            <ul className="space-y-2 text-sm text-slate-400">
              {process.env.NEXT_PUBLIC_BUSINESS_EMAIL && (
                <li><a href={`mailto:${process.env.NEXT_PUBLIC_BUSINESS_EMAIL}`} className="hover:text-primary transition-colors">{process.env.NEXT_PUBLIC_BUSINESS_EMAIL}</a></li>
              )}
              {process.env.NEXT_PUBLIC_PHONE_NUMBER ? (
                <li><a href={`tel:${process.env.NEXT_PUBLIC_PHONE_NUMBER}`} className="hover:text-primary transition-colors">{process.env.NEXT_PUBLIC_PHONE_NUMBER}</a></li>
              ) : process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ? (
                <li><a href={`tel:+${process.env.NEXT_PUBLIC_WHATSAPP_NUMBER}`} className="hover:text-primary transition-colors">+{process.env.NEXT_PUBLIC_WHATSAPP_NUMBER}</a></li>
              ) : null}
              {process.env.NEXT_PUBLIC_LINKEDIN_URL && (
                <li><a href={process.env.NEXT_PUBLIC_LINKEDIN_URL} target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">LinkedIn</a></li>
              )}
              <li className="pt-2">
                Thillai Nagar Main Road<br />
                Trichy, Tamil Nadu, India
              </li>
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
