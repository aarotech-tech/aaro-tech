import { AnimateOnScroll } from "@/components/ui/animate-on-scroll";

const principles = [
  {
    title: "Understand Before We Create",
    description: "We don't pretend to know your business better than you do. We listen, research, and ask questions before we design or write a single line."
  },
  {
    title: "Make It Useful",
    description: "The work must serve a real purpose. Whether through branding that builds trust, SEO and digital strategy that improve visibility, or web development that drives action, everything we build is designed to support your long-term growth."
  },
  {
    title: "Sweat the Details",
    description: "Good work is found in the margins. We care about the small things because they add up to the big things."
  },
  {
    title: "Build, Learn, Improve",
    description: "In digital, nothing is ever truly finished. We combine creative execution with technology and real-world data to constantly refine and improve what we build."
  },
  {
    title: "Grow Together",
    description: "We view our clients as partners in our own growth story. We are committed to growing alongside the businesses that trust us."
  }
];

export function OurPrinciples() {
  return (
    <section className="py-20 md:py-32 bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto mb-16 md:mb-20">
          <AnimateOnScroll delay="0s">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight text-slate-900 mb-6">
              How we think.
            </h2>
          </AnimateOnScroll>
          <AnimateOnScroll delay="0.1s">
            <p className="text-xl md:text-2xl text-slate-500 leading-relaxed">
              The principles that guide our work every day.
            </p>
          </AnimateOnScroll>
        </div>
        
        <div className="max-w-4xl mx-auto">
          {principles.map((principle, index) => (
            <AnimateOnScroll key={index} delay={`${index * 0.1 + 0.2}s`}>
              <div className="border-t border-slate-200 py-8 md:py-12 group">
                <div className="flex flex-col md:flex-row gap-4 md:gap-12">
                  <div className="md:w-1/3">
                    <h3 className="text-xl md:text-2xl font-bold text-slate-900 group-hover:text-primary transition-colors duration-300">{principle.title}</h3>
                  </div>
                  <div className="md:w-2/3">
                    <p className="text-lg text-slate-600 leading-relaxed">
                      {principle.description}
                    </p>
                  </div>
                </div>
              </div>
            </AnimateOnScroll>
          ))}
          <div className="border-t border-slate-200" />
        </div>
      </div>
    </section>
  );
}
