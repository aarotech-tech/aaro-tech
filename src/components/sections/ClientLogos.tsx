import { FallbackImage as Image } from "@/components/ui/fallback-image";

const clients = [
  { id: "c1", name: "Gleam", logo: "/images/client-logos/gleam.jpeg" },
  { id: "c2", name: "Rose", logo: "/images/client-logos/rose.jpeg" },
  { id: "c3", name: "Shine Academy", logo: "/images/client-logos/shine-academy.jpeg" },
  { id: "c4", name: "Stepzy", logo: "/images/client-logos/stepzy.jpeg" },
  { id: "c5", name: "Tosh", logo: "/images/client-logos/tosh.jpeg" },
  { id: "c6", name: "Interfreight", logo: "/images/client-logos/interfreight.jpeg" },
];
import { AnimateOnScroll } from "@/components/ui/animate-on-scroll";

export function ClientLogos() {
  return (
    <section className="py-12 border-b bg-white border-slate-100">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 overflow-hidden">
        <AnimateOnScroll delay="0s">
          <p className="text-center text-sm font-bold text-slate-500 uppercase tracking-wider mb-8">
            Trusted by ambitious brands
          </p>
        </AnimateOnScroll>
        <AnimateOnScroll delay="0.1s">
          <div className="relative flex overflow-hidden group">
            <div className="animate-marquee gap-8 md:gap-16 lg:gap-24 opacity-70 group-hover:opacity-100 transition-opacity duration-500 pr-8 md:pr-16 lg:pr-24">
              {[...clients, ...clients].map((client, index) => (
                <div key={`${client.id}-${index}`} className="relative w-28 h-16 sm:w-32 sm:h-20 grayscale hover:grayscale-0 transition-all duration-300 transform hover:scale-105 shrink-0">
                  <Image
                    src={client.logo}
                    alt={`${client.name} logo`}
                    fill
                    sizes="(max-width: 640px) 112px, 128px"
                    className="object-contain mix-blend-multiply"
                    unoptimized={true}
                  />
                </div>
              ))}
            </div>
          </div>
        </AnimateOnScroll>
      </div>
    </section>
  );
}
