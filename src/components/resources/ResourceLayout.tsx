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
                 <button className={buttonVariants({ size: "lg", variant: "outline", className: "h-14 px-8 text-lg font-bold border-2" })}>
                   <Download className="w-5 h-5 mr-2" />
                   Get the PDF Version for Your Team
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
