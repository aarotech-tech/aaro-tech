import { Metadata } from "next";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Contact } from "@/components/sections/Contact";
import Link from "next/link";
import { ArrowRight, Download, FileText } from "lucide-react";
import { resources } from "@/data/resources";
import { ResourceHubList } from "@/components/resources/ResourceHubList";
import { blogPosts } from "@/data/blog";

export const metadata: Metadata = {
  title: "Insights & Resources Hub | Aarotech",
  description: "Download free digital marketing checklists, SEO guides, and read our latest growth insights crafted by Aarotech's expert strategy team.",
};

export default function ResourcesIndexPage() {
  return (
    <>
      <Header />
      <main className="flex-1 overflow-x-hidden pt-16 bg-white">
        
        {/* Hero Section */}
        <section className="bg-slate-950 text-white py-20 lg:py-32 border-b border-slate-800 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/20 via-transparent to-transparent pointer-events-none"></div>
          <div className="container mx-auto px-4 max-w-4xl relative z-10 text-center">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold mb-6 tracking-tight leading-tight">
              Aarotech <span className="text-primary">Insights &amp; Resources</span>
            </h1>
            <p className="text-xl text-slate-300 mb-10 max-w-2xl mx-auto leading-relaxed">
              Actionable checklists, comprehensive guides, and proven frameworks to accelerate your digital growth.
            </p>
          </div>
        </section>

        {/* Resources Grid */}
        <section className="py-24 bg-slate-50">
          <div className="container mx-auto px-4 max-w-6xl">
            <ResourceHubList blogPosts={blogPosts} resources={resources} />
          </div>
        </section>

        <Contact />
      </main>
      <Footer />
    </>
  );
}
