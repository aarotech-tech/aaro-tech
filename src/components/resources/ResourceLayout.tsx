"use client";

import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Contact } from "@/components/sections/Contact";
import { buttonVariants } from "@/components/ui/button";
import { ArrowRight, CheckSquare, Download, FileText } from "lucide-react";
import { Breadcrumbs } from "@/components/shared/Breadcrumbs";
import { RelatedLinks } from "@/components/shared/RelatedLinks";
import { AuthorBio } from "@/components/shared/AuthorBio";
import { Resource } from "@/data/resources";
import { ContactPopup } from "@/components/shared/ContactPopup";

export function ResourceLayout({ resource }: { resource: Resource }) {
  return (
    <>
      <Header />
      <main className="flex-1 overflow-x-hidden pt-16 bg-white">
        
        {/* Hero Section */}
        <section className="bg-slate-50 py-20 lg:py-32 border-b border-slate-100 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/5 via-transparent to-transparent pointer-events-none"></div>
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
            <div className="mb-8 flex justify-center">
              <Breadcrumbs items={[{ name: "Insights & Resources", item: "/resources" }, { name: resource.title, item: `/${resource.slug}` }]} />
            </div>
            <div className="inline-flex items-center rounded-full border border-primary/20 px-4 py-1.5 text-sm font-semibold text-primary mb-6 bg-primary/5">
              <FileText className="w-4 h-4 mr-2" />
              {resource.category}
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-slate-900 mb-6 tracking-tight leading-tight">
              {resource.title}
            </h1>
            <p className="text-xl text-slate-600 mb-10 max-w-3xl mx-auto leading-relaxed">
              {resource.heroDescription}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <ContactPopup>
                 <button className={buttonVariants({ size: "lg", className: "h-14 px-8 text-lg font-bold shadow-lg" })}>
                   <Download className="w-5 h-5 mr-2" />
                   Download Full PDF Checklist
                 </button>
              </ContactPopup>
            </div>
          </div>
        </section>

        {/* Content & Checklist */}
        <section className="py-24 bg-white">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
             <div className="prose prose-lg max-w-none text-slate-600 mb-16">
               <p className="text-xl leading-relaxed text-slate-700">{resource.intro}</p>
             </div>
             
             <div className="space-y-12">
               {resource.checklist.map((section, idx) => (
                 <div key={idx} className="bg-slate-50 border border-slate-200 rounded-3xl p-8 md:p-10 shadow-sm">
                   <h2 className="text-2xl font-bold text-slate-900 mb-8 border-b border-slate-200 pb-4">{section.section}</h2>
                   <ul className="space-y-4">
                     {section.items.map((item, itemIdx) => (
                       <li key={itemIdx} className="flex items-start">
                         <div className="flex-shrink-0 mt-1">
                           <CheckSquare className="w-6 h-6 text-primary" />
                         </div>
                         <p className="ml-4 text-slate-700 text-lg">{item}</p>
                       </li>
                     ))}
                   </ul>
                 </div>
               ))}
             </div>
             
             <div className="mt-16 text-center">
               <ContactPopup>
                  <button className="group relative inline-flex w-full sm:w-auto h-auto min-h-[56px] items-center justify-center rounded-full p-[2px] shadow-sm hover:-translate-y-1 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary text-left sm:text-center overflow-hidden">
                    {/* Default static border */}
                    <div className="absolute inset-0 bg-slate-200 rounded-full transition-opacity duration-300 group-hover:opacity-0"></div>
                    
                    {/* Rotating gradient border */}
                    <div className="absolute left-1/2 top-1/2 aspect-square w-[300%] -translate-x-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                      <div className="h-full w-full animate-[spin_3s_linear_infinite] bg-[conic-gradient(from_0deg_at_50%_50%,#FA0201_0%,#0f172a_50%,#FA0201_100%)]"></div>
                    </div>

                    <div className="relative flex h-full w-full items-center justify-center rounded-full bg-white py-4 px-6 md:px-8 text-base md:text-lg whitespace-normal font-bold text-slate-700 group-hover:text-slate-900 transition-all">
                      <Download className="w-5 h-5 mr-2 shrink-0 inline-block text-primary transition-transform group-hover:-translate-y-1" />
                      <span>Get the PDF Version for Your Team</span>
                    </div>
                  </button>
               </ContactPopup>
             </div>
          </div>
        </section>

        {/* E-E-A-T Author & Related */}
        <section className="py-24 bg-slate-50 border-t border-slate-100">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <AuthorBio authorName="Aarotech Strategy Team" role={`Expert ${resource.category} Consultants`} />
            
            <RelatedLinks 
              relatedBlogSlugs={resource.relatedBlogs}
              relatedServiceSlugs={resource.relatedServices}
              title="More Resources to Accelerate Your Growth"
            />
          </div>
        </section>

        <Contact />
      </main>
      <Footer />
    </>
  );
}
