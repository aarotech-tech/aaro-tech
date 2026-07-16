export const DOMAIN = "https://aarotech.in";
export const COMPANY_NAME = "Aarotech";
export const PRIMARY_CITY = "Tiruchirappalli";
export const PRIMARY_CITY_SHORT = "Trichy";
export const PRIMARY_STATE = "Tamil Nadu";

// Schema for the Organization
export function generateOrganizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": COMPANY_NAME,
    "url": DOMAIN,
    "logo": `${DOMAIN}/icon.png`,
    "address": {
      "@type": "PostalAddress",
      "addressLocality": PRIMARY_CITY,
      "addressRegion": PRIMARY_STATE,
      "addressCountry": "IN"
    },
    "sameAs": [
      // Add social links here if available
    ]
  };
}

// Schema for the WebSite
export function generateWebSiteSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": COMPANY_NAME,
    "url": DOMAIN,
    "potentialAction": {
      "@type": "SearchAction",
      "target": `${DOMAIN}/search?q={search_term_string}`,
      "query-input": "required name=search_term_string"
    }
  };
}

// Schema for Local Business (Homepage or City pages)
export function generateLocalBusinessSchema(city = PRIMARY_CITY, description = "Digital Marketing Agency in Trichy") {
  return {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "name": `${COMPANY_NAME} ${city}`,
    "image": `${DOMAIN}/icon.png`,
    "url": `${DOMAIN}/locations/${city.toLowerCase()}`,
    "telephone": "+91 98765 43210", // Placeholder if real one isn't in env
    "address": {
      "@type": "PostalAddress",
      "addressLocality": city,
      "addressRegion": "Tamil Nadu",
      "addressCountry": "IN"
    },
    "description": description,
    "priceRange": "$$"
  };
}

// Schema for Services
export function generateServiceSchema(serviceName: string, description: string, urlPath: string) {
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    "name": serviceName,
    "provider": {
      "@type": "Organization",
      "name": COMPANY_NAME
    },
    "description": description,
    "url": `${DOMAIN}${urlPath}`
  };
}

// Schema for Blog Articles
export function generateArticleSchema({
  title,
  headline,
  image,
  datePublished,
  dateModified,
  authorName,
  urlPath
}: {
  title: string;
  headline: string;
  image: string;
  datePublished: string;
  dateModified: string;
  authorName: string;
  urlPath: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": `${DOMAIN}${urlPath}`
    },
    "headline": headline || title,
    "image": image.startsWith('http') ? image : `${DOMAIN}${image}`,
    "datePublished": datePublished,
    "dateModified": dateModified || datePublished,
    "author": {
      "@type": "Person",
      "name": authorName
    },
    "publisher": {
      "@type": "Organization",
      "name": COMPANY_NAME,
      "logo": {
        "@type": "ImageObject",
        "url": `${DOMAIN}/icon.png`
      }
    }
  };
}

// Schema for Breadcrumbs
export function generateBreadcrumbSchema(items: { name: string; item: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": items.map((breadcrumb, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "name": breadcrumb.name,
      "item": `${DOMAIN}${breadcrumb.item}`
    }))
  };
}

// Schema for FAQ
export function generateFAQSchema(faqs: { question: string; answer: string }[]) {
  if (!faqs || faqs.length === 0) return null;
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqs.map(faq => ({
      "@type": "Question",
      "name": faq.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": faq.answer
      }
    }))
  };
}
