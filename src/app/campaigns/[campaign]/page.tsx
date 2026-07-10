import { Metadata } from "next";
import { notFound } from "next/navigation";
import { Contact } from "@/components/sections/Contact";
import { buttonVariants } from "@/components/ui/button";
import Link from "next/link";
import { ArrowRight, CheckCircle2 } from "lucide-react";

const campaigns = {
  "lead-generation": {
    title: "Generate High-Quality Leads with Aarotech",
    description: "Stop wasting money on ineffective ads. We build high-converting campaigns that deliver real ROI.",
    heading: "Turn Clicks Into Customers",
    benefits: ["Data-driven ad strategies", "Custom landing page design", "Complete analytics tracking"]
  },
  "seo-audit": {
    title: "Get Your Free Technical SEO Audit",
    description: "Discover exactly why your competitors are outranking you and how to fix it.",
    heading: "Dominate Local Search Results",
    benefits: ["Comprehensive technical audit", "Keyword gap analysis", "Actionable growth roadmap"]
  }
};

export async function generateMetadata({ params }: { params: Promise<{ campaign: string }> }): Promise<Metadata> {
  const resolvedParams = await params;
  const campaignData = campaigns[resolvedParams.campaign as keyof typeof campaigns];
  if (!campaignData) return {};

  return {
    title: campaignData.title,
    description: campaignData.description,
  };
}

export default async function CampaignPage({ params }: { params: Promise<{ campaign: string }> }) {
  const resolvedParams = await params;
  const campaignData = campaigns[resolvedParams.campaign as keyof typeof campaigns];
  if (!campaignData) notFound();

  return (
    <main className="flex-1 overflow-x-hidden">
      <section className="py-20 bg-slate-950 text-white relative overflow-hidden">
         <div className="container mx-auto px-4 relative z-10 grid lg:grid-cols-2 gap-12 items-center">
           <div>
             <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold mb-6 leading-tight">
                {campaignData.heading}
             </h1>
             <p className="text-xl text-slate-300 mb-8 max-w-lg">
               {campaignData.description}
             </p>
             <ul className="space-y-4 mb-8">
               {campaignData.benefits.map((benefit, index) => (
                 <li key={index} className="flex items-center gap-3 text-slate-200">
                   <CheckCircle2 className="w-6 h-6 text-primary shrink-0" />
                   <span className="text-lg font-medium">{benefit}</span>
                 </li>
               ))}
             </ul>
           </div>
           <div className="bg-slate-900 border border-slate-800 p-8 rounded-2xl shadow-2xl flex flex-col justify-center items-center">
             <h3 className="text-2xl font-bold mb-6 text-center">Ready to Grow?</h3>
             <div className="text-center w-full">
                <Link href="#contact" className={buttonVariants({ size: "lg", className: "w-full bg-primary text-white hover:bg-primary/90 h-14 text-lg shadow-xl" })}>
                  Claim Your Free Plan Now
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Link>
                <p className="text-sm text-slate-500 mt-4">No commitment required. Speak directly with a founder.</p>
             </div>
           </div>
         </div>
      </section>
      
      <Contact />
    </main>
  );
}
