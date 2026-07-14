export interface ServiceLocation {
  serviceSlug: string;
  citySlug: string;
  flatSlug: string;
  metaTitle: string;
  metaDescription: string;
  heroSubtitle: string;
  heroDescription: string;
  intro: string;
  businessLandscape: string;
  whyNeedUs: string;
  faqs: { question: string; answer: string }[];
  relatedServices: string[];
  relatedBlogs: string[];
  nearbyCities: string[];
}

export const serviceLocations: ServiceLocation[] = [
  // Trichy (Primary Market) - All Services
  {
    serviceSlug: "seo",
    citySlug: "trichy",
    flatSlug: "seo-company-in-trichy",
    metaTitle: "Best SEO Company in Trichy | Local & National SEO | Aarotech",
    metaDescription: "Aarotech is the top-rated SEO company in Trichy. We help local businesses dominate Google search, increase organic traffic, and generate high-quality leads.",
    heroSubtitle: "SEO Services in Trichy",
    heroDescription: "Dominate Google search results and capture high-intent traffic with Trichy's leading data-driven SEO agency.",
    intro: "As Trichy's economy rapidly digitizes, relying on word-of-mouth is no longer sufficient. When your potential customers need a service, they turn to Google. If your business doesn't appear on the first page, you are handing revenue to your competitors. At Aarotech, we specialize in hyper-local and national SEO strategies that put your Trichy business in front of the right audience at the right time.",
    businessLandscape: "Trichy is a dynamic blend of heavy manufacturing (like BHEL ancillaries), premier educational institutions, and a thriving local retail sector. However, the digital maturity among businesses varies wildly. Early adopters who invest in SEO now have a massive opportunity to capture significant market share before the digital landscape becomes entirely saturated.",
    whyNeedUs: "Unlike generic agencies that rely on outdated tactics, we treat SEO as a revenue-generation engine. We conduct deep keyword research specific to the Trichy market, optimize your Google Business Profile to dominate the Local Pack, and build authoritative content that converts visitors into paying customers.",
    faqs: [
      { question: "How long does it take to rank #1 in Trichy?", answer: "For local keywords with moderate competition, you can expect to see significant movement in the Local Pack within 3 to 6 months of consistent optimization." },
      { question: "Do you specialize in local or national SEO?", answer: "As a Trichy-based agency, we excel at Local SEO to dominate this specific market. However, we also run highly successful national and international SEO campaigns for B2B manufacturers and tech firms." }
    ],
    relatedServices: ["digital-advertising", "website-development"],
    relatedBlogs: ["local-seo-guide-tamil-nadu"],
    nearbyCities: ["Thanjavur", "Karur", "Pudukkottai"]
  }
];

// Scaffold remaining required service-city combinations
const requiredCombinations = [
  { service: "digital-advertising", city: "trichy", name: "Google Ads Agency" },
  { service: "website-development", city: "trichy", name: "Website Development Company" },
  { service: "social-media", city: "trichy", name: "Social Media Marketing" },
  { service: "branding", city: "trichy", name: "Branding Agency" },
  { service: "content-marketing", city: "trichy", name: "Content Marketing" }, // Assuming this exists or similar

  { service: "seo", city: "chennai", name: "SEO Company" },
  { service: "website-development", city: "chennai", name: "Website Development" },
  { service: "digital-advertising", city: "chennai", name: "Digital Marketing" },

  { service: "seo", city: "coimbatore", name: "SEO Company" },
  { service: "website-development", city: "coimbatore", name: "Website Development" },

  { service: "seo", city: "madurai", name: "SEO Company" },
  { service: "digital-advertising", city: "madurai", name: "Digital Marketing" }
];

requiredCombinations.forEach(combo => {
  // Prevent duplicate of the one we already wrote
  if (combo.service === "seo" && combo.city === "trichy") return;
  
  const cityName = combo.city.charAt(0).toUpperCase() + combo.city.slice(1);
  serviceLocations.push({
    serviceSlug: combo.service,
    citySlug: combo.city,
    flatSlug: `${combo.name.toLowerCase().replace(/\s+/g, '-')}-in-${combo.city}`,
    metaTitle: `${combo.name} in ${cityName} | Aarotech`,
    metaDescription: `Partner with the premier ${combo.name.toLowerCase()} in ${cityName}. We drive measurable growth and ROI for local businesses.`,
    heroSubtitle: `${combo.name} in ${cityName}`,
    heroDescription: `Expert ${combo.name.toLowerCase()} services engineered to dominate the ${cityName} market.`,
    intro: "Detailed content pending expansion in Phase 3.",
    businessLandscape: `The ${cityName} market requires localized expertise...`,
    whyNeedUs: "We provide tailored strategies that outmaneuver competitors...",
    faqs: [{ question: `Why choose Aarotech for ${combo.name} in ${cityName}?`, answer: "We focus exclusively on measurable ROI and deep local market understanding." }],
    relatedServices: [],
    relatedBlogs: [],
    nearbyCities: []
  });
});
