import { Metadata } from "next";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Contact } from "@/components/sections/Contact";
import { industries } from "@/data/industries";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle2, XCircle, ArrowRight } from "lucide-react";
import { ContactPopup } from "@/components/shared/ContactPopup";
import Link from "next/link";
import { Breadcrumbs } from "@/components/shared/Breadcrumbs";

export const metadata: Metadata = {
  title: "Industries We Serve | Aarotech Digital Marketing",
  description: "Aarotech provides specialized, high-ROI digital marketing strategies for Healthcare, Education, and Local Service Businesses.",
  openGraph: {
    title: "Industries We Serve | Aarotech Digital Marketing",
    description: "Specialized digital marketing strategies for Healthcare, Education, and Local Service Businesses.",
    type: "website",
  }
};

export default function IndustriesIndexPage() {
  return (
    <>
      <Header />
      <main className="flex-1 overflow-x-hidden pt-16 bg-white">
        
        {/* Hero Section */}
        <section className="bg-slate-50 py-20 lg:py-32 border-b border-slate-100 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/5 via-transparent to-transparent pointer-events-none"></div>
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
            <div className="mb-8 flex justify-center">
              <Breadcrumbs items={[{ name: "Industries", item: "/industries" }]} />
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-7xl font-extrabold text-slate-900 mb-6 tracking-tight leading-tight">
              Specialized Marketing for <span className="text-primary">Your Industry</span>
            </h1>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
              Generic marketing strategies produce generic results. We partner with businesses in specific sectors to deliver custom, high-ROI campaigns that solve your exact bottlenecks.
            </p>
          </div>
        </section>

        {/* Industries Grid */}
        <section className="py-24">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {industries.map((industry) => {
                const Icon = industry.icon;
                return (
                  <Link href={`/industries/${industry.slug}`} key={industry.slug} className="block group focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none rounded-3xl h-full">
                    <Card className="h-full border border-slate-200 shadow-sm group-hover:shadow-xl transition-all duration-300 group-hover:-translate-y-2 rounded-3xl bg-white overflow-hidden">
                      <div className="h-2 w-full bg-slate-100 group-hover:bg-primary transition-colors"></div>
                      <CardContent className="p-8 flex flex-col h-full">
                        <div className="w-14 h-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mb-8 group-hover:scale-110 transition-transform duration-300">
                          <Icon className="w-7 h-7" />
                        </div>
                        <h2 className="text-2xl font-bold mb-6 text-slate-900">{industry.name}</h2>
                        
                        <div className="space-y-6 flex-1">
                          <div className="flex items-start bg-slate-50 p-4 rounded-xl border border-slate-100">
                            <XCircle className="w-5 h-5 text-slate-400 shrink-0 mt-0.5 mr-3" />
                            <div>
                              <span className="block text-xs font-bold text-slate-500 mb-1 uppercase tracking-wider">The Challenge</span>
                              <p className="text-sm text-slate-700 leading-relaxed">{industry.problem}</p>
                            </div>
                          </div>
                          <div className="flex items-start bg-primary/5 p-4 rounded-xl border border-primary/10">
                            <CheckCircle2 className="w-5 h-5 text-primary shrink-0 mt-0.5 mr-3" />
                            <div>
                              <span className="block text-xs font-bold text-primary mb-1 uppercase tracking-wider">The Solution</span>
                              <p className="text-sm text-slate-700 leading-relaxed">{industry.solution}</p>
                            </div>
                          </div>
                        </div>

                        <div className="mt-8 pt-6 border-t border-slate-100 flex items-center justify-between font-bold group-hover:text-primary transition-colors">
                          <span className="text-slate-900 group-hover:text-primary transition-colors">View Industry Strategy</span>
                          <div className="w-10 h-10 rounded-full bg-slate-50 group-hover:bg-primary/10 flex items-center justify-center transition-colors">
                            <ArrowRight className="w-5 h-5" />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                );
              })}
            </div>

            <div className="mt-24 text-center max-w-2xl mx-auto bg-slate-50 p-10 rounded-3xl border border-slate-100">
              <h3 className="text-2xl font-bold text-slate-900 mb-4">Don't See Your Industry?</h3>
              <p className="text-slate-600 mb-8">
                While we specialize in the sectors above, the core principles of high-converting digital marketing apply universally. If you're a service-based business looking to scale, we can help.
              </p>
              <ContactPopup>
                <button className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground shadow hover:bg-primary/90 h-10 px-8">
                  Book a Free Strategy Call
                </button>
              </ContactPopup>
            </div>
          </div>
        </section>

        <Contact />
      </main>
      <Footer />
    </>
  );
}
