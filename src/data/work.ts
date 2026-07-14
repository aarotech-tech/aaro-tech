export type ServiceCategory = 
  | "Website Development" 
  | "SEO" 
  | "Social Media Marketing" 
  | "Branding" 
  | "Content Creation" 
  | "Graphic Design"
  | "Marketing Campaigns";

export interface Project {
  id: string;
  title: string;
  slug: string;
  industry: string;
  serviceCategory: ServiceCategory;
  client: string;
  heroImage: string;
  gallery: string[];
  duration: string;
  websiteUrl?: string;
  summary: {
    client: string;
    challenge: string;
    delivery: string;
    impact: string;
  };
  challenge: string[];
  approach: {
    category: string;
    description: string;
  }[];
  timeline: string[];
  deliverables: string[];
  impact: {
    label?: string;
    value: string;
    isQuantitative: boolean;
  }[];
  testimonial?: {
    quote: string;
    author: string;
    role: string;
    avatar?: string;
  };
  lessonsLearned: string;
  relatedSlugs: string[];
  highlights: string[];
  isNDA?: boolean;
}

export const projects: Project[] = [
  {
    id: "cs-1",
    title: "Complete Rebrand & Digital Positioning",
    slug: "nexus-branding",
    industry: "Financial Services",
    serviceCategory: "Branding",
    client: "Nexus Wealth",
    heroImage: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80&w=1200",
    gallery: [
      "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80&w=1200",
      "https://images.unsplash.com/photo-1600880292203-757bb62b4baf?auto=format&fit=crop&q=80&w=1200",
      "https://images.unsplash.com/photo-1553413077-190dd305871c?auto=format&fit=crop&q=80&w=1200"
    ],
    duration: "2 Months",
    websiteUrl: "https://example.com",
    summary: {
      client: "A traditional wealth management firm.",
      challenge: "Their outdated brand identity was failing to attract the next generation of millennial wealth.",
      delivery: "We crafted a modern, trustworthy brand identity and a comprehensive set of marketing materials.",
      impact: "Positioned Nexus as a forward-thinking firm, leading to a surge in younger client acquisitions."
    },
    challenge: [
      "Outdated visual identity that looked like a 1990s bank",
      "Inconsistent branding across marketing materials",
      "Failing to resonate with millennial and Gen-Z demographics",
      "No clear brand voice or positioning strategy"
    ],
    approach: [
      {
        category: "Research & Positioning",
        description: "We started by analyzing the wealth transfer happening between generations, identifying that younger clients want transparency, digital-first experiences, and sleek aesthetics."
      },
      {
        category: "Creative Direction",
        description: "We moved away from traditional navy blues and golds, introducing a vibrant, digital-native palette with brutalist typographic elements to signal disruption."
      }
    ],
    timeline: ["Discovery", "Brand Strategy", "Visual Identity", "Guidelines", "Asset Creation", "Launch"],
    deliverables: [
      "Logo Suite",
      "Brand Guidelines",
      "Color Palette & Typography",
      "Pitch Decks",
      "Social Media Templates",
      "Business Cards"
    ],
    impact: [
      { label: "Demographic Shift", value: "+40% Millennial Clients", isQuantitative: true },
      { label: "", value: "Modern, cohesive visual identity", isQuantitative: false },
      { label: "", value: "Improved client trust and perception", isQuantitative: false }
    ],
    testimonial: {
      quote: "Aarotech completely transformed how we are perceived in the market. The new brand gave our advisors the confidence to pitch to younger, high-net-worth individuals.",
      author: "David Chen",
      role: "Managing Partner"
    },
    lessonsLearned: "Rebranding a traditional financial institution requires balancing modern aesthetics with the core tenets of trust and security. You can push boundaries, but you must ground the design in professionalism.",
    relatedSlugs: ["urban-seo"],
    highlights: ["✓ Brand Strategy", "✓ Logo Evolution", "✓ Marketing Assets"]
  },
  {
    id: "cs-2",
    title: "Local SEO Dominance for Healthcare",
    slug: "urban-seo",
    industry: "Healthcare",
    serviceCategory: "SEO",
    client: "Urban Dental Group",
    heroImage: "https://images.unsplash.com/photo-1606811841689-23dfddce3e95?auto=format&fit=crop&q=80&w=1200",
    gallery: [
      "https://images.unsplash.com/photo-1606811841689-23dfddce3e95?auto=format&fit=crop&q=80&w=1200",
      "https://images.unsplash.com/photo-1432821596592-e2c18b78144f?auto=format&fit=crop&q=80&w=1200"
    ],
    duration: "6 Months ONGOING",
    summary: {
      client: "A multi-location dental practice.",
      challenge: "They were invisible on Google Maps and search results, losing local patients to competitors.",
      delivery: "A hyper-local SEO strategy, aggressive Google Business Profile optimization, and targeted content creation.",
      impact: "Ranked #1 for 15+ high-intent keywords, driving a 300% increase in organic bookings."
    },
    challenge: [
      "Zero visibility on Google Maps",
      "No local keyword optimization",
      "Inconsistent NAP (Name, Address, Phone) data across directories",
      "Lack of authoritative localized content"
    ],
    approach: [
      {
        category: "Technical Audit",
        description: "We resolved over 400 technical crawl errors on their website that were preventing Google from indexing their location pages properly."
      },
      {
        category: "Content Strategy",
        description: "Created dedicated, highly-optimized pages for every service in every location, targeting high-intent phrases like 'Emergency Dentist [City]'."
      }
    ],
    timeline: ["Technical Audit", "Keyword Research", "On-Page SEO", "GBP Optimization", "Link Building", "Ongoing Content"],
    deliverables: [
      "SEO Audit Report",
      "Google Business Profile Optimization",
      "Keyword Strategy",
      "Localized Landing Pages",
      "Monthly Content Writing"
    ],
    impact: [
      { label: "Organic Traffic", value: "+300%", isQuantitative: true },
      { label: "Map Pack Rankings", value: "#1 in 3 Cities", isQuantitative: true },
      { label: "Patient Leads", value: "85/month", isQuantitative: true }
    ],
    lessonsLearned: "For multi-location businesses, Google Business Profile optimization is just as critical as on-page SEO. Unifying their NAP data resulted in a massive ranking boost within weeks.",
    relatedSlugs: ["nexus-branding", "retail-headless"],
    highlights: ["✓ #1 Map Rankings", "✓ Local SEO Strategy", "✓ +300% Traffic"]
  },
  {
    id: "cs-3",
    title: "E-Commerce Headless Migration",
    slug: "retail-headless",
    industry: "Retail",
    serviceCategory: "Website Development",
    client: "National E-Commerce Retailer",
    isNDA: true,
    heroImage: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&q=80&w=1200",
    gallery: [
      "https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&q=80&w=1200",
      "https://images.unsplash.com/photo-1558769132-cb1fac0840f2?auto=format&fit=crop&q=80&w=1200"
    ],
    duration: "3 Months",
    summary: {
      client: "A fast-growing apparel brand.",
      challenge: "Their standard Shopify theme was slow, hurting conversion rates and mobile experience.",
      delivery: "A blazing fast, custom headless storefront designed for performance and conversion.",
      impact: "Increased conversion rate by 22% and achieved perfect Core Web Vitals."
    },
    challenge: [
      "Slow page load times on mobile",
      "Poor mobile conversion rates",
      "Inflexible design constraints",
      "Dropping organic traffic due to Core Web Vitals"
    ],
    approach: [
      {
        category: "Performance Architecture",
        description: "Decoupled the frontend from the backend to deliver instant page loads via edge caching and static generation."
      },
      {
        category: "UX/UI Design",
        description: "Mapped out a frictionless mobile checkout flow and introduced tactile micro-interactions to make shopping feel premium."
      }
    ],
    timeline: ["UX Research", "Prototyping", "Development", "QA", "Launch"],
    deliverables: [
      "Headless Storefront",
      "Custom Checkout Flow",
      "Performance Optimization",
      "Technical SEO"
    ],
    impact: [
      { label: "Conversion Rate", value: "+22%", isQuantitative: true },
      { label: "Load Time", value: "<1.2s", isQuantitative: true },
      { label: "", value: "Flawless mobile shopping experience", isQuantitative: false }
    ],
    testimonial: {
      quote: "The speed of our new site is unbelievable. We saw an immediate uptick in sales the weekend after launch. Aarotech delivered exactly what they promised.",
      author: "E-commerce Director",
      role: "National Retail Brand"
    },
    lessonsLearned: "Speed is a feature, not a metric. By treating performance as a core design principle, we unlocked revenue that was previously being lost to bounce rates.",
    relatedSlugs: ["nexus-branding"],
    highlights: ["✓ Faster Load Times", "✓ Higher Conversions", "✓ Premium UX"]
  }
];
