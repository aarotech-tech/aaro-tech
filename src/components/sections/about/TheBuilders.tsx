import { founders } from "@/data/content";
import { Link as LinkIcon } from "lucide-react";
import { FallbackImage as Image } from "@/components/ui/fallback-image";
import { AnimateOnScroll } from "@/components/ui/animate-on-scroll";

export function TheBuilders() {
  return (
    <section className="py-24 md:py-32 bg-slate-950 text-white border-y border-white/5">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mb-16 md:mb-24">
          <AnimateOnScroll delay="0s">
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6">
              A team who is not afraid to take risks and bet on themselves.
            </h2>
          </AnimateOnScroll>
          <AnimateOnScroll delay="0.1s">
            <p className="text-lg md:text-xl text-slate-400 leading-relaxed">
              Meet the creators, strategists, and makers who move our mission forward, combining design, code, and vision to achieve remarkable results.
            </p>
          </AnimateOnScroll>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8 max-w-7xl">
          {founders.map((founder, index) => (
            <AnimateOnScroll key={index} delay={`${index * 0.1 + 0.2}s`} className="h-full">
              <div className="group bg-slate-900 rounded-[2rem] border border-white/10 overflow-hidden flex flex-col h-full hover:border-primary/50 transition-all duration-500 hover:shadow-[0_0_40px_rgba(250,2,1,0.1)] hover:-translate-y-2">
                
                {/* Image Container */}
                <div className="p-4 pb-0">
                  <div className="w-full aspect-[4/5] bg-slate-800 relative rounded-2xl overflow-hidden">
                    {founder.photo ? (
                      <Image 
                        src={founder.photo} 
                        alt={founder.name} 
                        fill 
                        sizes="(max-width: 768px) 100vw, 33vw" 
                        className="object-cover object-top transition-transform duration-700 group-hover:scale-105" 
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center text-4xl font-extrabold text-slate-700">
                        {founder.name.charAt(0)}
                      </div>
                    )}
                    
                    {/* Inner shadow overlay for image */}
                    <div className="absolute inset-0 border border-white/10 rounded-2xl pointer-events-none"></div>
                  </div>
                </div>

                <div className="p-6 md:p-8 flex flex-col flex-grow">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-2xl font-bold text-white group-hover:text-primary transition-colors">{founder.fullName || founder.name}</h3>
                      <p className="text-slate-400 font-medium mt-1">{founder.role}</p>
                    </div>
                    {founder.linkedin && (
                      <a href={founder.linkedin} target="_blank" rel="noopener noreferrer" className="bg-white/5 p-2 rounded-full text-slate-400 hover:text-white hover:bg-primary transition-colors shrink-0">
                        <LinkIcon className="w-5 h-5" />
                        <span className="sr-only">LinkedIn Profile</span>
                      </a>
                    )}
                  </div>

                  <div className="w-full h-px border-b border-dashed border-slate-700 my-4"></div>

                  <p className="text-slate-400 leading-relaxed text-sm md:text-base flex-grow">
                    {founder.bio}
                  </p>
                </div>
              </div>
            </AnimateOnScroll>
          ))}
        </div>
      </div>
    </section>
  );
}
