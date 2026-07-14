import { Metadata } from "next";
import { notFound } from "next/navigation";
import { blogPosts } from "@/data/blog";
import { serviceLocations } from "@/data/service-locations";
import { services } from "@/data/content";
import { locationData } from "@/data/locations";
import { BlogPostLayout } from "@/components/blog/BlogPostLayout";
import { ServiceCityLayout } from "@/components/services/ServiceCityLayout";
import { ResourceLayout } from "@/components/resources/ResourceLayout";
import { resources } from "@/data/resources";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const resolvedParams = await params;
  
  // 1. Check if it's a blog post
  const post = blogPosts.find(p => p.slug === resolvedParams.slug);
  if (post) {
    return {
      title: `${post.title} | Aarotech Blog`,
      description: post.excerpt,
      keywords: post.keywords,
      openGraph: {
        title: `${post.title} | Aarotech Blog`,
        description: post.excerpt,
        type: "article",
        publishedTime: post.date,
        authors: ["Aarotech Team"],
      }
    };
  }

  // 2. Check if it's a service-city page
  const serviceCityData = serviceLocations.find(s => s.flatSlug === resolvedParams.slug);
  if (serviceCityData) {
    return {
      title: serviceCityData.metaTitle,
      description: serviceCityData.metaDescription,
      openGraph: {
        title: serviceCityData.metaTitle,
        description: serviceCityData.metaDescription,
        type: "website",
      }
    };
  }

  // 3. Check if it's a resource
  const resource = resources.find(r => r.slug === resolvedParams.slug);
  if (resource) {
    return {
      title: resource.metaTitle,
      description: resource.metaDescription,
      openGraph: {
        title: resource.metaTitle,
        description: resource.metaDescription,
        type: "article",
      }
    };
  }

  return {};
}

export async function generateStaticParams() {
  const blogParams = blogPosts.map((post) => ({
    slug: post.slug,
  }));

  const serviceCityParams = serviceLocations.map((data) => ({
    slug: data.flatSlug,
  }));

  const resourceParams = resources.map((res) => ({
    slug: res.slug,
  }));

  return [...blogParams, ...serviceCityParams, ...resourceParams];
}

export default async function CatchAllSlugPage({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = await params;
  
  // 1. Render Blog Post if matched
  const post = blogPosts.find(p => p.slug === resolvedParams.slug);
  if (post) {
    return <BlogPostLayout post={post} />;
  }

  // 2. Render Service+City Page if matched
  const serviceCityData = serviceLocations.find(s => s.flatSlug === resolvedParams.slug);
  if (serviceCityData) {
    const serviceData = services.find(s => s.id === serviceCityData.serviceSlug);
    const cityData = locationData[serviceCityData.citySlug];
    const cityName = cityData ? cityData.cityName : (serviceCityData.citySlug.charAt(0).toUpperCase() + serviceCityData.citySlug.slice(1));
    const serviceName = serviceData ? serviceData.title : serviceCityData.serviceSlug;
    
    return <ServiceCityLayout data={serviceCityData} cityName={cityName} serviceName={serviceName} />;
  }

  // 3. Render Resource Page if matched
  const resource = resources.find(r => r.slug === resolvedParams.slug);
  if (resource) {
    return <ResourceLayout resource={resource} />;
  }

  // 4. None matched
  notFound();
}
