import { processSteps } from "@/data/content";
import { AnimateOnScroll } from "@/components/ui/animate-on-scroll";
import { TextReveal } from "@/components/ui/text-reveal";

export function HowWeWork() {
  return (
    <section id="process" className="py-24 bg-black text-white relative overflow-hidden">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="flex flex-col lg:grid lg:grid-cols-2 gap-16 lg:gap-8 items-center">
          
          <div className="flex flex-col space-y-12 relative z-10">
            <div>
              <AnimateOnScroll delay="0s">
                <TextReveal text="The Blueprint for Predictable Revenue" className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight mb-6" />
              </AnimateOnScroll>
              <AnimateOnScroll delay="0.1s">
                <p className="text-lg md:text-xl text-slate-300 leading-relaxed max-w-xl">
                  A transparent, proven execution plan designed to scale your business without the guesswork.
                </p>
              </AnimateOnScroll>
            </div>
            
            <div className="flex flex-col space-y-8 relative before:absolute before:inset-0 before:ml-7 before:-translate-x-px before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-white/10 before:to-transparent">
              {processSteps.map((step, index) => (
                <AnimateOnScroll key={index} delay={`${index * 0.1 + 0.2}s`}>
                  <div className="relative flex items-start gap-6 group">
                    <div className="shrink-0 w-14 h-14 bg-black border border-white/10 text-slate-300 rounded-full flex items-center justify-center font-bold text-xl group-hover:bg-primary/20 group-hover:text-primary group-hover:border-primary/50 transition-all duration-300 shadow-[0_0_15px_rgba(255,255,255,0.05)] group-hover:shadow-[0_0_20px_rgba(255,0,0,0.3)] z-10 relative">
                      {step.step}
                    </div>
                    <div className="pt-3">
                      <h3 className="text-xl font-bold mb-2 text-white group-hover:text-primary transition-colors">{step.title}</h3>
                      <p className="text-slate-400 leading-relaxed">
                        {step.description}
                      </p>
                    </div>
                  </div>
                </AnimateOnScroll>
              ))}
            </div>
          </div>

          <div className="absolute inset-0 lg:static lg:flex justify-center items-center z-0 opacity-20 lg:opacity-100 pointer-events-none overflow-hidden lg:overflow-visible">
            <video 
              src="/animations/World%20Cube.mp4" 
              autoPlay 
              loop 
              muted 
              playsInline 
              preload="none"
              className="w-full h-full lg:max-w-none lg:w-[130%] object-cover lg:object-contain pointer-events-none mix-blend-screen will-change-transform"
            />
          </div>

        </div>
      </div>
    </section>
  );
}
