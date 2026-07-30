import { testimonials } from "@/data/content";
import { FallbackImage as Image } from "@/components/ui/fallback-image";
import { TrendingUp } from "lucide-react";
import { AnimateOnScroll } from "@/components/ui/animate-on-scroll";
import { TextReveal } from "@/components/ui/text-reveal";

export function Testimonials() {
  if (testimonials.length === 0) return null;

  return (
    <section id="testimonials" className="py-24 bg-slate-950 text-white border-y border-white/10">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16 md:mb-20">
          <AnimateOnScroll delay="0s">
            <TextReveal text="What Our Partners Say" className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight mb-6 justify-center text-center" />
          </AnimateOnScroll>
          <AnimateOnScroll delay="0.1s">
            <p className="text-lg text-slate-300">Real results from real businesses we&apos;ve partnered with.</p>
          </AnimateOnScroll>
        </div>
        
        <div className="relative flex overflow-hidden group py-4 mt-4 md:mt-8">
          {/* Left gradient mask */}
          <div className="absolute left-0 top-0 bottom-0 w-12 md:w-32 bg-gradient-to-r from-slate-950 to-transparent z-10 pointer-events-none"></div>

          <div className="animate-marquee-slow gap-6 md:gap-8 flex items-stretch pr-6 md:pr-8">
            {/* Repeat the testimonials array enough times to fill ultra-wide screens seamlessly */}
            {[...testimonials, ...testimonials, ...testimonials, ...testimonials].map((testimonial, index) => (
              <div key={`${testimonial.id}-${index}`} className="w-[300px] sm:w-[350px] md:w-[420px] shrink-0 flex h-auto group/card">
                <div className="flex flex-col w-full rounded-2xl border border-white/10 overflow-hidden shadow-2xl hover:shadow-primary/5 transition-all duration-500 hover:border-primary/30 bg-gradient-to-br from-slate-900 via-slate-900 to-slate-800 group-hover/card:to-primary/10 hover:-translate-y-1 cursor-grab active:cursor-grabbing relative">
                  
                  {/* Subtle inner glow */}
                  <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent pointer-events-none"></div>
                  
                  {/* Video Section (if present) */}
                  {testimonial.videoUrl ? (
                    <div className="w-full aspect-video bg-black relative shrink-0">
                      <video 
                        src={testimonial.videoUrl} 
                        controls 
                        className="w-full h-full object-cover"
                        poster={testimonial.photo} // Use the logo/photo as a fallback poster if possible
                      />
                    </div>
                  ) : null}

                  <div className="p-6 md:p-8 flex flex-col flex-grow">
                    {/* Result Highlight */}
                    {testimonial.resultAchieved && (
                      <div className="inline-flex items-center gap-2 bg-green-500/10 text-green-400 px-3 py-1.5 rounded-full text-xs md:text-sm font-semibold w-fit mb-6 border border-green-500/20 shrink-0">
                        <TrendingUp className="w-4 h-4" />
                        {testimonial.resultAchieved}
                      </div>
                    )}

                    {/* Stars */}
                    <div className="flex text-amber-400 mb-4 shrink-0">
                      {[...Array(5)].map((_, i) => (
                        <svg key={i} className="w-4 h-4 fill-current" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      ))}
                    </div>

                    {/* Quote */}
                    <p className="text-slate-300 italic leading-relaxed mb-8 flex-grow text-sm md:text-base">
                      &quot;{testimonial.quote}&quot;
                    </p>

                    {/* Author Info */}
                    <div className="flex items-center gap-4 mt-auto pt-6 border-t border-white/10 shrink-0">
                      {/* Photo fallback if no video is used, or always show photo avatar */}
                      {testimonial.photo && !testimonial.videoUrl && (
                        <div className="relative w-10 h-10 md:w-12 md:h-12 rounded-full overflow-hidden border border-white/10 shrink-0 bg-white/10">
                          <Image 
                            src={testimonial.photo} 
                            alt={testimonial.author} 
                            fill 
                            sizes="48px"
                            className="object-cover"
                          />
                        </div>
                      )}
                      {/* Even if video exists, we can still show avatar, but let's show it anyway if photo exists */}
                      {testimonial.photo && testimonial.videoUrl && (
                        <div className="relative w-10 h-10 md:w-12 md:h-12 rounded-full overflow-hidden border border-white/10 shrink-0 bg-white/10 p-1">
                          <Image 
                            src={testimonial.photo} 
                            alt={testimonial.company || testimonial.author} 
                            fill 
                            sizes="48px"
                            className="object-contain"
                          />
                        </div>
                      )}

                      <div>
                        <p className="font-bold text-white text-xs md:text-sm">{testimonial.author}</p>
                        <p className="text-[10px] md:text-xs text-slate-400">
                          {testimonial.role}{testimonial.company ? ` at ${testimonial.company}` : ''}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Right gradient mask */}
          <div className="absolute right-0 top-0 bottom-0 w-12 md:w-32 bg-gradient-to-l from-slate-950 to-transparent z-10 pointer-events-none"></div>
        </div>
      </div>
    </section>
  );
}
