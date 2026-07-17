import { founders } from "@/data/content";
import { Link as LinkIcon } from "lucide-react";
import { FallbackImage as Image } from "@/components/ui/fallback-image";
import { AnimateOnScroll } from "@/components/ui/animate-on-scroll";

export function TheBuilders() {
  return (
    <section className="py-20 md:py-32 bg-slate-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto mb-16 md:mb-24">
          <AnimateOnScroll delay="0s">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight text-slate-900 mb-6">
              The people building Aarotech.
            </h2>
          </AnimateOnScroll>
          <AnimateOnScroll delay="0.1s">
            <p className="text-xl md:text-2xl text-slate-500 leading-relaxed">
              We are young, curious, and ambitious. These are the people currently building Aarotech.
            </p>
          </AnimateOnScroll>
        </div>

        <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-16">
          {founders.map((founder, index) => (
            <AnimateOnScroll key={index} delay={`${index * 0.1 + 0.2}s`}>
              <div className="group">
                <div className="w-full aspect-square bg-slate-200 mb-8 overflow-hidden relative rounded-2xl">
                  {founder.photo ? (
                    <Image 
                      src={founder.photo} 
                      alt={founder.name} 
                      fill 
                      sizes="(max-width: 768px) 100vw, 50vw" 
                      className="object-cover transition-transform duration-700 group-hover:scale-105" 
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center text-4xl font-extrabold text-slate-300">
                      {founder.name.charAt(0)}
                    </div>
                  )}
                </div>
                
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-2xl font-bold text-slate-900">{founder.fullName || founder.name}</h3>
                  {founder.linkedin && (
                    <a href={founder.linkedin} target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-[#0A66C2] transition-colors">
                      <LinkIcon className="w-5 h-5" />
                      <span className="sr-only">LinkedIn Profile</span>
                    </a>
                  )}
                </div>
                
                <p className="text-primary font-bold mb-4">
                  {founder.role} <span className="text-slate-400 font-normal">[TEAM INPUT REQUIRED: Confirm exact role]</span>
                </p>
                
                <p className="text-slate-600 leading-relaxed">
                  {founder.bio}
                </p>
              </div>
            </AnimateOnScroll>
          ))}
        </div>
      </div>
    </section>
  );
}
