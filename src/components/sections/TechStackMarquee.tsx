import { AnimateOnScroll } from "@/components/ui/animate-on-scroll";
import { 
  SiNextdotjs, SiReact, SiTypescript, SiTailwindcss, SiVercel,
  SiGoogleads, SiMeta, SiHubspot, SiSemrush, SiFigma,
  SiGoogleanalytics, SiLooker, SiNodedotjs, 
  SiWordpress, SiShopify, SiMailchimp
} from "react-icons/si";

const technologies = [
  { name: "Next.js", icon: SiNextdotjs, color: "text-black" },
  { name: "React", icon: SiReact, color: "text-[#61DAFB]" },
  { name: "TypeScript", icon: SiTypescript, color: "text-[#3178C6]" },
  { name: "Tailwind CSS", icon: SiTailwindcss, color: "text-[#06B6D4]" },
  { name: "Vercel", icon: SiVercel, color: "text-black" },
  { name: "Google Ads", icon: SiGoogleads, color: "text-[#4285F4]" },
  { name: "Meta Ads", icon: SiMeta, color: "text-[#0668E1]" },
  { name: "HubSpot", icon: SiHubspot, color: "text-[#FF7A59]" },
  { name: "SEMrush", icon: SiSemrush, color: "text-[#F56900]" },
  { name: "Figma", icon: SiFigma, color: "text-[#F24E1E]" },
  { name: "Google Analytics", icon: SiGoogleanalytics, color: "text-[#E37400]" },
  { name: "Looker Studio", icon: SiLooker, color: "text-[#4285F4]" },
  { name: "Node.js", icon: SiNodedotjs, color: "text-[#339933]" },
  { name: "WordPress", icon: SiWordpress, color: "text-[#21759B]" },
  { name: "Shopify", icon: SiShopify, color: "text-[#95BF47]" },
  { name: "Mailchimp", icon: SiMailchimp, color: "text-[#FFE01B]" },
];

export function TechStackMarquee() {
  return (
    <section className="py-12 bg-slate-50/50 border-y border-slate-100">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 overflow-hidden relative">
        <AnimateOnScroll delay="0s">
          <p className="text-center text-xs font-bold text-slate-400 uppercase tracking-wider mb-8">
            Powered by Industry-Leading Technology
          </p>
        </AnimateOnScroll>
        
        <AnimateOnScroll delay="0.1s">
          <div className="relative flex overflow-hidden group py-2">
            {/* Left fade gradient */}
            <div className="absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-slate-50 to-transparent z-10 pointer-events-none"></div>
            
            <div className="animate-marquee gap-4 md:gap-6 opacity-70 group-hover:opacity-100 transition-opacity duration-500 pr-4 md:pr-6 flex items-center">
              {[...technologies, ...technologies].map((tech, index) => {
                const Icon = tech.icon;
                return (
                  <div 
                    key={`${tech.name}-${index}`} 
                    className="flex items-center gap-2.5 px-6 py-2.5 bg-white border border-slate-200/60 rounded-full shadow-sm text-sm font-semibold text-slate-600 whitespace-nowrap shrink-0 hover:border-slate-300 transition-all duration-300 hover:shadow-md cursor-default group/pill"
                  >
                    <Icon className={`w-5 h-5 grayscale opacity-70 group-hover/pill:grayscale-0 group-hover/pill:opacity-100 transition-all duration-300 ${tech.color}`} />
                    <span className="group-hover/pill:text-slate-900 transition-colors">{tech.name}</span>
                  </div>
                );
              })}
            </div>

            {/* Right fade gradient */}
            <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-slate-50 to-transparent z-10 pointer-events-none"></div>
          </div>
        </AnimateOnScroll>
      </div>
    </section>
  );
}
