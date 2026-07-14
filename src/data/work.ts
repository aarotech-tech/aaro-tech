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
  client: string; // The client name
  clientOverview: string;
  heroImage: string;
  gallery: string[];
  duration: string;
  websiteUrl?: string;
  businessChallenge: string[];
  research: string[];
  strategy: string[];
  execution: string[];
  deliverables: string[];
  outcome: {
    label?: string;
    value: string;
    isQuantitative: boolean;
  }[];
  lessonsLearned: string[];
  technologiesUsed: string[];
  relatedServices: string[]; // slugs
  testimonial?: {
    quote: string;
    author: string;
    role: string;
    avatar?: string;
  };
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
    clientOverview: "Nexus Wealth is a prominent, traditional wealth management firm that has successfully served high-net-worth individuals for over two decades. However, as wealth transfers to the next generation, they found themselves struggling to attract millennial and Gen-Z clients who prefer digital-first experiences and modern aesthetics.",
    heroImage: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80&w=1200",
    gallery: [
      "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80&w=1200",
      "https://images.unsplash.com/photo-1600880292203-757bb62b4baf?auto=format&fit=crop&q=80&w=1200",
      "https://images.unsplash.com/photo-1553413077-190dd305871c?auto=format&fit=crop&q=80&w=1200"
    ],
    duration: "2 Months",
    websiteUrl: "https://example.com",
    businessChallenge: [
      "Outdated visual identity that looked like a 1990s bank.",
      "Inconsistent branding across marketing materials.",
      "Failing to resonate with millennial and Gen-Z demographics.",
      "No clear brand voice or positioning strategy."
    ],
    research: [
      "Conducted focus groups with millennial high-net-worth individuals to understand their wealth management expectations.",
      "Analyzed top modern fintech competitors to identify design trends and communication styles.",
      "Audited Nexus Wealth's entire existing marketing collateral to identify brand inconsistencies."
    ],
    strategy: [
      "Shift the narrative from 'traditional stability' to 'modern, transparent wealth growth'.",
      "Introduce a vibrant, digital-native palette with brutalist typographic elements to signal disruption while maintaining trust.",
      "Standardize the brand voice to be educational, transparent, and approachable."
    ],
    execution: [
      "Designed a complete new logo suite and typography system.",
      "Developed a comprehensive 60-page brand guideline document.",
      "Redesigned all client-facing materials including pitch decks, business cards, and social media templates."
    ],
    deliverables: [
      "Logo Suite",
      "Brand Guidelines",
      "Color Palette & Typography",
      "Pitch Decks",
      "Social Media Templates",
      "Business Cards"
    ],
    outcome: [
      { label: "Demographic Shift", value: "+40% Millennial Clients", isQuantitative: true },
      { label: "Brand Consistency", value: "100% unified visual identity", isQuantitative: false }
    ],
    lessonsLearned: [
      "Traditional firms are often hesitant to embrace bold colors; presenting competitive analysis early helped ease this transition.",
      "A brand guidelines document is only effective if the client's internal team is trained on how to use it."
    ],
    technologiesUsed: ["Figma", "Adobe Illustrator", "Adobe InDesign"],
    relatedServices: ["branding", "digital-advertising"],
    isNDA: false
  },
  {
    id: "cs-2",
    title: "Local SEO Dominance for Retail Chain",
    slug: "urban-seo",
    industry: "Retail",
    serviceCategory: "SEO",
    client: "Urban Outfitters Regional",
    clientOverview: "A fast-growing regional retail chain with 12 physical store locations across Tamil Nadu, specializing in contemporary fashion.",
    heroImage: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&q=80&w=1200",
    gallery: [
      "https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&q=80&w=1200"
    ],
    duration: "6 Months",
    businessChallenge: [
      "Inconsistent NAP (Name, Address, Phone) data across the web.",
      "Unoptimized Google Business Profiles causing poor map pack visibility.",
      "No location-specific landing pages on their main website.",
      "Low volume of online reviews compared to local competitors."
    ],
    research: [
      "Audited all 12 locations on Google Maps and 50+ local directories.",
      "Identified top search terms for fashion retail in their specific neighborhoods.",
      "Analyzed competitor review generation strategies."
    ],
    strategy: [
      "Standardize all directory listings using a centralized data management approach.",
      "Create 12 unique, highly-optimized location landing pages with LocalBusiness Schema.",
      "Implement an automated point-of-sale review request system."
    ],
    execution: [
      "Developed individual location pages detailing store hours, specific inventory, and local team photos.",
      "Optimized Google Business Profiles with fresh content, FAQs, and weekly update posts.",
      "Rolled out an SMS-based review generation campaign post-purchase."
    ],
    deliverables: [
      "12 Location Landing Pages",
      "Optimized Google Business Profiles",
      "Automated Review System",
      "Local Citation Audit & Fix"
    ],
    outcome: [
      { label: "Visibility", value: "215% Increase in Local Search Impressions", isQuantitative: true },
      { label: "Foot Traffic", value: "+45% increase in direction requests", isQuantitative: true },
      { label: "Reviews", value: "Generated 500+ new 5-star reviews", isQuantitative: true }
    ],
    lessonsLearned: [
      "Local SEO requires physical validation. Ensuring consistency between the physical store's signage and digital footprint was crucial for Google's verification process.",
      "Customers are 3x more likely to leave a review if asked via SMS within 2 hours of leaving the store."
    ],
    technologiesUsed: ["Google Business Profile", "Ahrefs", "Schema Markup", "Twilio API (for reviews)"],
    relatedServices: ["seo"],
    isNDA: false
  },
  {
    id: "cs-3",
    title: "Headless E-Commerce Migration",
    slug: "retail-headless",
    industry: "E-Commerce",
    serviceCategory: "Website Development",
    client: "Global Threads",
    clientOverview: "Global Threads is a high-volume online fashion retailer serving a global customer base. They process thousands of transactions daily.",
    heroImage: "https://images.unsplash.com/photo-1661956602116-aa6865609028?auto=format&fit=crop&q=80&w=1200",
    gallery: [
      "https://images.unsplash.com/photo-1661956602116-aa6865609028?auto=format&fit=crop&q=80&w=1200"
    ],
    duration: "4 Months",
    businessChallenge: [
      "Poor Core Web Vitals scores negatively impacting organic search rankings.",
      "Slow time-to-interactive causing high bounce rates on mobile devices.",
      "Inability to create highly customized, interactive product experiences within standard Shopify templates.",
      "Difficulties in integrating multi-region pricing and content natively."
    ],
    research: [
      "Audited the existing Shopify monolithic architecture and identified massive javascript payloads from third-party apps.",
      "Conducted user testing which revealed checkout abandonment due to slow cart loading times."
    ],
    strategy: [
      "Decouple the frontend from the backend (Headless Architecture).",
      "Use Next.js for blazing-fast static generation and server-side rendering.",
      "Retain Shopify as the backend commerce engine via the Storefront API."
    ],
    execution: [
      "Built a custom React-based design system from scratch.",
      "Integrated Sanity CMS to give their marketing team total control over non-product pages.",
      "Implemented Algolia for instant, typo-tolerant predictive search.",
      "Redesigned the mobile checkout flow to reduce friction."
    ],
    deliverables: [
      "Custom Next.js Frontend",
      "Headless Shopify Integration",
      "Sanity CMS Implementation",
      "Algolia Search Integration"
    ],
    outcome: [
      { label: "Performance", value: "70% Faster Page Loads", isQuantitative: true },
      { label: "Revenue", value: "+2.4% Conversion Rate Increase", isQuantitative: true },
      { label: "SEO", value: "Passed all Core Web Vitals", isQuantitative: true }
    ],
    lessonsLearned: [
      "Headless migrations require rigorous QA to ensure state management (like cart syncing) remains flawless across different devices and network conditions.",
      "Training the marketing team on the new CMS (Sanity) early in the process prevented launch delays."
    ],
    technologiesUsed: ["Next.js", "React", "Shopify Storefront API", "Sanity CMS", "Algolia"],
    relatedServices: ["website-development", "seo"],
    isNDA: true
  }
];
