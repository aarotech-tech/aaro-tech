import { faqs } from "@/data/content";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { AnimateOnScroll } from "@/components/ui/animate-on-scroll";

export function FAQ() {
  return (
    <section id="faq" className="py-24 bg-white border-t border-slate-100">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-3xl">
        <div className="text-center mb-16 md:mb-20">
          <AnimateOnScroll delay="0s">
            <p className="text-sm font-semibold uppercase tracking-widest text-primary mb-3">Frequently Asked Questions</p>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight mb-6">Radical Transparency: Clear Answers</h2>
          </AnimateOnScroll>
          <AnimateOnScroll delay="0.1s">
            <p className="text-lg md:text-xl text-slate-500 leading-relaxed">Everything you need to know before we partner up.</p>
          </AnimateOnScroll>
        </div>
        <AnimateOnScroll delay="0.2s">
          <Accordion className="w-full bg-slate-50 rounded-2xl shadow-sm border border-slate-200 p-4 md:p-6">
            {faqs.map((faq, index) => (
              <AccordionItem key={index} value={`item-${index}`} className="last:border-0 border-slate-200">
                <AccordionTrigger className="text-left font-bold text-base md:text-lg hover:no-underline hover:text-primary py-4 text-slate-900 transition-colors">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-slate-600 leading-relaxed text-sm md:text-base">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </AnimateOnScroll>
      </div>
    </section>
  );
}
