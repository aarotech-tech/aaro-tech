import { AnimateOnScroll } from "@/components/ui/animate-on-scroll";

const steps = [
  {
    title: "The Idea",
    description: "Aarotech began as a simple ambition: to make professional, performance-driven digital marketing accessible to businesses across Tamil Nadu."
  },
  {
    title: "The First Work",
    description: "We started by partnering with a few small businesses in Trichy who needed real growth, not just noise. We ran campaigns, created content, built websites, and learned exactly what it takes to deliver results."
  },
  {
    title: "The Learning",
    description: "Those early projects taught us something important. Real growth isn't built just through clever campaigns or websites. It's built through trust between people, transparency in communication, and a shared commitment to improving together. That realization became our foundation: Trust. Transparency. Growth."
  },
  {
    title: "The Building",
    description: "Aarotech became something we are intentionally building into a serious long-term partner for startups, local businesses, and growing brands."
  }
];

export function TheJourney() {
  return (
    <section className="py-20 md:py-32 bg-slate-950 text-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto mb-16 md:mb-24">
          <AnimateOnScroll delay="0s">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight text-white mb-6">
              From an idea to real work.
            </h2>
          </AnimateOnScroll>
        </div>

        <div className="max-w-4xl mx-auto space-y-12 md:space-y-16">
          {steps.map((step, index) => (
            <AnimateOnScroll key={index} delay={`${index * 0.1 + 0.1}s`}>
              <div className="flex flex-col md:flex-row gap-4 md:gap-12">
                <div className="md:w-1/3 flex-shrink-0">
                  <h3 className="text-2xl font-bold text-primary">{step.title}</h3>
                </div>
                <div className="md:w-2/3">
                  <p className="text-lg md:text-xl text-slate-300 leading-relaxed">
                    {step.description}
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
