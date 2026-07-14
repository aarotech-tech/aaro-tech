import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { blogPosts } from "@/data/blog";
import { projects } from "@/data/work";
import { services } from "@/data/content";

interface RelatedLinksProps {
  relatedBlogSlugs?: string[];
  relatedCaseStudySlugs?: string[];
  relatedServiceSlugs?: string[];
  title?: string;
}

export function RelatedLinks({
  relatedBlogSlugs = [],
  relatedCaseStudySlugs = [],
  relatedServiceSlugs = [],
  title = "Explore Related Resources"
}: RelatedLinksProps) {
  const blogs = blogPosts.filter(p => relatedBlogSlugs.includes(p.slug)).slice(0, 3);
  const caseStudies = projects.filter(p => relatedCaseStudySlugs.includes(p.slug)).slice(0, 3);
  const matchedServices = services.filter(s => relatedServiceSlugs.includes(s.id)).slice(0, 3);

  if (blogs.length === 0 && caseStudies.length === 0 && matchedServices.length === 0) {
    return null;
  }

  return (
    <div className="mt-16 pt-16 border-t border-slate-200">
      <h3 className="text-2xl font-bold text-slate-900 mb-8">{title}</h3>
      <div className="grid md:grid-cols-3 gap-8">
        {/* Services */}
        {matchedServices.length > 0 && (
          <div>
            <h4 className="text-sm font-bold uppercase tracking-wider text-slate-500 mb-4">Core Services</h4>
            <ul className="space-y-3">
              {matchedServices.map((service, idx) => (
                <li key={idx}>
                  <Link href={`/services/${service.id}`} className="group flex items-center text-primary font-medium hover:underline">
                    {service.title}
                    <ArrowRight className="w-4 h-4 ml-2 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Case Studies */}
        {caseStudies.length > 0 && (
          <div>
            <h4 className="text-sm font-bold uppercase tracking-wider text-slate-500 mb-4">Case Studies</h4>
            <ul className="space-y-3">
              {caseStudies.map((study, idx) => (
                <li key={idx}>
                  <Link href={`/work/${study.slug}`} className="group flex items-center text-primary font-medium hover:underline">
                    {study.client} - {study.serviceCategory}
                    <ArrowRight className="w-4 h-4 ml-2 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Blogs */}
        {blogs.length > 0 && (
          <div>
            <h4 className="text-sm font-bold uppercase tracking-wider text-slate-500 mb-4">Expert Insights</h4>
            <ul className="space-y-3">
              {blogs.map((blog, idx) => (
                <li key={idx}>
                  <Link href={`/${blog.slug}`} className="group flex items-center text-primary font-medium hover:underline">
                    {blog.title}
                    <ArrowRight className="w-4 h-4 ml-2 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
