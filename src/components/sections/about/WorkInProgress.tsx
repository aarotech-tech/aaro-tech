import { AnimateOnScroll } from "@/components/ui/animate-on-scroll";
import { FallbackImage as Image } from "@/components/ui/fallback-image";

const placeholders = [
  { text: "[REAL IMAGE REQUIRED: Team working together]", span: "md:col-span-2 md:row-span-2" },
  { text: "[REAL IMAGE REQUIRED: Brainstorming or project work]", span: "md:col-span-1 md:row-span-1" },
  { text: "[REAL IMAGE REQUIRED: Aarotech workspace or behind-the-scenes moment]", span: "md:col-span-1 md:row-span-1" },
  { text: "[REAL IMAGE REQUIRED: Another authentic team moment]", span: "md:col-span-2 md:row-span-1" },
];

export function WorkInProgress() {
  return (
    <section className="py-20 md:py-32 bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto mb-16 md:mb-20">
          <AnimateOnScroll delay="0s">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight text-slate-900 mb-6">
              In the making.
            </h2>
          </AnimateOnScroll>
          <AnimateOnScroll delay="0.1s">
            <p className="text-xl md:text-2xl text-slate-500 leading-relaxed">
              A look behind the screens. This is what building looks like for us.
            </p>
          </AnimateOnScroll>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 md:grid-rows-2 gap-4 max-w-6xl mx-auto h-[600px] md:h-[800px]">
          {placeholders.map((item, index) => (
            <AnimateOnScroll 
              key={index} 
              delay={`${index * 0.1 + 0.2}s`} 
              className={`relative rounded-3xl overflow-hidden bg-slate-100 flex items-center justify-center p-8 border-2 border-dashed border-slate-300 ${item.span}`}
            >
              <p className="text-slate-500 font-bold text-center">
                {item.text}
              </p>
            </AnimateOnScroll>
          ))}
        </div>
      </div>
    </section>
  );
}
