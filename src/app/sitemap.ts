import { MetadataRoute } from "next";
import { services, industries } from "@/data/content";
import { blogPosts } from "@/data/blog";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://aarotech.in";

  const staticRoutes = [
    "",
    "/privacy-policy",
    "/terms",
    "/portfolio",
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: route === "" ? 1 : 0.8,
  }));

  const serviceRoutes = services.map((service) => ({
    url: `${baseUrl}/services/${service.id}`,
    lastModified: new Date(),
    changeFrequency: "monthly" as const,
    priority: 0.9,
  }));

  const industryRoutes = industries.map((industry) => ({
    url: `${baseUrl}/industries/${industry.id}`,
    lastModified: new Date(),
    changeFrequency: "monthly" as const,
    priority: 0.9,
  }));

  const validCities = ["chennai", "coimbatore", "madurai", "trichy", "salem", "tiruppur", "erode", "tirunelveli", "nagercoil"];
  const campaigns = ["lead-generation", "seo-audit"];

  const locationRoutes = validCities.map((city) => ({
    url: `${baseUrl}/locations/${city}`,
    lastModified: new Date(),
    changeFrequency: "monthly" as const,
    priority: 0.8,
  }));

  const campaignRoutes = campaigns.map((campaign) => ({
    url: `${baseUrl}/campaigns/${campaign}`,
    lastModified: new Date(),
    changeFrequency: "monthly" as const,
    priority: 0.8,
  }));

  const blogRoutes = blogPosts.map((post) => ({
    url: `${baseUrl}/blog/${post.slug}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.7,
  }));

  return [...staticRoutes, ...serviceRoutes, ...industryRoutes, ...locationRoutes, ...campaignRoutes, ...blogRoutes];
}
