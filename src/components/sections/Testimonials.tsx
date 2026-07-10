import { testimonials } from "@/data/content";
import { FallbackImage as Image } from "@/components/ui/fallback-image";
import { TrendingUp } from "lucide-react";
import { AnimateOnScroll } from "@/components/ui/animate-on-scroll";

export function Testimonials() {
  if (testimonials.length === 0) return null;

  return (
    <section id="testimonials" className="py-24 bg-slate-950 text-white border-y border-white/10">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16 md:mb-20">
          <AnimateOnScroll delay="0s">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight mb-6">What Our Partners Say</h2>
          </AnimateOnScroll>
          <AnimateOnScroll delay="0.1s">
            <p className="text-lg text-slate-300">Real results from real businesses we&apos;ve partnered with.</p>
          </AnimateOnScroll>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {testimonials.map((testimonial, index) => (
            <AnimateOnScroll key={testimonial.id} delay={`${index * 0.1 + 0.2}s`} className="h-full">
              <div className="bg-white/5 flex flex-col rounded-2xl border border-white/10 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 backdrop-blur-md hover:bg-white/10 hover:-translate-y-1 h-full">
                
                {/* Video Section (if present) */}
                {testimonial.videoUrl ? (
                  <div className="w-full aspect-video bg-black relative">
                    <video 
                      src={testimonial.videoUrl} 
                      controls 
                      className="w-full h-full object-cover"
                      poster={testimonial.photo} // Use the logo/photo as a fallback poster if possible
                    />
                  </div>
                ) : null}

                <div className="p-8 flex flex-col flex-grow">
                  {/* Result Highlight */}
                  {testimonial.resultAchieved && (
                    <div className="inline-flex items-center gap-2 bg-green-500/10 text-green-400 px-3 py-1.5 rounded-full text-sm font-semibold w-fit mb-6 border border-green-500/20">
                      <TrendingUp className="w-4 h-4" />
                      {testimonial.resultAchieved}
                    </div>
                  )}

                  {/* Stars */}
                  <div className="flex text-amber-400 mb-4">
                    {[...Array(5)].map((_, i) => (
                      <svg key={i} className="w-4 h-4 fill-current" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>

                  {/* Quote */}
                  <p className="text-slate-300 italic leading-relaxed mb-8 flex-grow">
                    &quot;{testimonial.quote}&quot;
                  </p>

                  {/* Author Info */}
                  <div className="flex items-center gap-4 mt-auto pt-6 border-t border-white/10">
                    {/* Photo fallback if no video is used, or always show photo avatar */}
                    {testimonial.photo && !testimonial.videoUrl && (
                      <div className="relative w-12 h-12 rounded-full overflow-hidden border border-white/10 shrink-0 bg-white/10">
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
                      <div className="relative w-12 h-12 rounded-full overflow-hidden border border-white/10 shrink-0 bg-white/10 p-1">
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
                      <p className="font-bold text-white text-sm">{testimonial.author}</p>
                      <p className="text-xs text-slate-400">
                        {testimonial.role}{testimonial.company ? ` at ${testimonial.company}` : ''}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </AnimateOnScroll>
          ))}
        </div>
      </div>
    </section>
  );
}
