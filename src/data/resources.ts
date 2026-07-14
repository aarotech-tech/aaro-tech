export interface Resource {
  slug: string;
  title: string;
  metaTitle: string;
  metaDescription: string;
  category: string;
  heroSubtitle: string;
  heroDescription: string;
  intro: string;
  checklist: { section: string; items: string[] }[];
  downloadLink?: string; // Future PDF link
  relatedServices: string[];
  relatedBlogs: string[];
}

export const resources: Resource[] = [
  {
    slug: "seo-checklist",
    title: "The Ultimate 2026 Local SEO Checklist",
    metaTitle: "Free Local SEO Checklist Download | Aarotech",
    metaDescription: "Download Aarotech's comprehensive Local SEO checklist. Learn the exact steps to optimize your website and Google Business Profile for local dominance.",
    category: "SEO",
    heroSubtitle: "Free Digital Marketing Resource",
    heroDescription: "A step-by-step, actionable checklist used by our own agency experts to rank local businesses on page one of Google.",
    intro: "Ranking on local search doesn't happen by accident. It requires a systematic approach to technical health, content relevance, and local authority. We've compiled the exact checklist our SEO engineers use when auditing and onboarding new clients. Follow these steps to significantly improve your local search visibility.",
    checklist: [
      {
        section: "1. Google Business Profile Optimization",
        items: [
          "Claim and verify your Google Business Profile (GBP).",
          "Ensure NAP (Name, Address, Phone) is 100% accurate and matches your website.",
          "Select the most accurate Primary Category and add all relevant Secondary Categories.",
          "Write a 750-character, keyword-rich business description.",
          "Upload high-resolution photos of the exterior, interior, and team.",
          "Set up a direct review generation link to share with customers."
        ]
      },
      {
        section: "2. On-Page SEO Essentials",
        items: [
          "Ensure every page has a unique Title Tag under 60 characters containing target keywords.",
          "Write compelling Meta Descriptions under 155 characters that encourage clicks.",
          "Use a single, descriptive H1 tag per page.",
          "Use H2 and H3 tags to logically structure content.",
          "Ensure all images have descriptive Alt Text.",
          "Include internal links to relevant service or location pages."
        ]
      },
      {
        section: "3. Technical SEO & Performance",
        items: [
          "Ensure the website has an active SSL certificate (HTTPS).",
          "Test mobile responsiveness on Google's Mobile-Friendly Test.",
          "Compress all images and use modern formats (WebP).",
          "Ensure the site loads in under 2.5 seconds (Core Web Vitals).",
          "Submit an XML Sitemap to Google Search Console.",
          "Implement LocalBusiness Schema Markup."
        ]
      },
      {
        section: "4. Local Authority & Citations",
        items: [
          "Audit existing local citations for NAP consistency (Yelp, JustDial, Sulekha, etc.).",
          "Build 10-15 new hyper-local or industry-specific citations.",
          "Join local chambers of commerce or business networking groups for local backlinks.",
          "Publish a localized blog post or case study."
        ]
      }
    ],
    relatedServices: ["seo"],
    relatedBlogs: ["local-seo-guide-tamil-nadu", "technical-seo-checklist"]
  },
  {
    slug: "website-launch-checklist",
    title: "Business Website Launch Checklist",
    metaTitle: "Free Website Launch Checklist | Aarotech",
    metaDescription: "Don't launch your new business website without this checklist. Ensure technical SEO, performance, and lead tracking are set up correctly.",
    category: "Web Development",
    heroSubtitle: "Free Web Development Guide",
    heroDescription: "A comprehensive pre-launch checklist to ensure your new website is fast, secure, and ready to generate leads from day one.",
    intro: "Launching a new website is an exciting milestone, but small technical errors can destroy your SEO rankings and user experience. We use this exact checklist before pushing any client website live to guarantee maximum performance and immediate indexing by Google.",
    checklist: [
      {
        section: "Technical & Performance",
        items: [
          "Verify SSL Certificate is active and forcing HTTPS.",
          "Check for broken links (404 errors) across all pages.",
          "Test page load speed on both Mobile and Desktop (aim for < 2.5s).",
          "Ensure all images are compressed and using WebP format."
        ]
      },
      {
        section: "SEO Essentials",
        items: [
          "Unique, keyword-optimized Title Tags and Meta Descriptions on every page.",
          "Proper heading hierarchy (H1, H2, H3) with no missing or duplicate H1s.",
          "Alt text applied to all descriptive images.",
          "XML Sitemap generated and submitted to Google Search Console."
        ]
      },
      {
        section: "Tracking & Lead Gen",
        items: [
          "Google Analytics 4 (GA4) tag installed and verified.",
          "Contact forms tested with successful email delivery.",
          "Conversion tracking set up for form submissions or calls.",
          "Thank You pages properly redirecting after form fills."
        ]
      }
    ],
    relatedServices: ["website-development"],
    relatedBlogs: ["website-cost-tamil-nadu"]
  },
  {
    slug: "google-business-profile-checklist",
    title: "Google Business Profile Optimization Guide",
    metaTitle: "Google Business Profile Optimization Guide | Aarotech",
    metaDescription: "Master local search with our complete Google Business Profile optimization checklist for local businesses.",
    category: "SEO",
    heroSubtitle: "Free Local SEO Resource",
    heroDescription: "The ultimate guide to claiming, verifying, and optimizing your Google Business Profile to dominate the Local Pack.",
    intro: "For local businesses, your Google Business Profile (GBP) is arguably more important than your website. It's the first thing customers see when they search for services near them. This checklist will help you maximize your GBP visibility.",
    checklist: [
      {
        section: "Profile Setup & Basics",
        items: [
          "Claim or create your GBP listing.",
          "Verify your business via postcard, phone, or video.",
          "Ensure your Business Name exactly matches your real-world signage.",
          "Set your Primary Category accurately (this is the #1 ranking factor)."
        ]
      },
      {
        section: "Information Optimization",
        items: [
          "Add all relevant Secondary Categories.",
          "Write a 750-character business description naturally including target keywords.",
          "List all individual Services with descriptions and pricing (if applicable).",
          "Ensure operating hours are accurate, including holiday hours."
        ]
      },
      {
        section: "Visuals & Engagement",
        items: [
          "Upload a high-quality logo and cover photo.",
          "Upload at least 10 photos of the exterior, interior, and team at work.",
          "Create a system to ask every satisfied customer for a review.",
          "Respond to all reviews (both positive and negative) within 24 hours.",
          "Publish a 'Google Post' at least once a week."
        ]
      }
    ],
    relatedServices: ["seo"],
    relatedBlogs: ["local-seo-guide-tamil-nadu"]
  },
  {
    slug: "social-media-content-guide",
    title: "Social Media Content Planning Guide",
    metaTitle: "Social Media Content Planning Guide | Aarotech",
    metaDescription: "Stop guessing what to post. Download our Social Media Content Planning Guide to build an engaged audience.",
    category: "Social Media",
    heroSubtitle: "Free Social Media Resource",
    heroDescription: "A framework for businesses to plan, create, and schedule 30 days of engaging social media content in a single afternoon.",
    intro: "Consistency is the hardest part of social media marketing. Without a plan, businesses resort to sporadic, low-quality posts that don't generate engagement. This guide helps you establish 'Content Pillars' so you always know exactly what to post.",
    checklist: [
      {
        section: "Define Your Strategy",
        items: [
          "Identify your target audience demographics and pain points.",
          "Select the 1-2 primary platforms where your audience is most active.",
          "Define your brand voice (Professional, Playful, Educational, etc.)."
        ]
      },
      {
        section: "Establish Content Pillars",
        items: [
          "Pillar 1: Educational/Value (How-tos, tips, industry news).",
          "Pillar 2: Social Proof (Testimonials, case studies, user-generated content).",
          "Pillar 3: Behind the Scenes (Team culture, production process).",
          "Pillar 4: Promotional (Product features, sales, offers - limit to 20%)."
        ]
      },
      {
        section: "Batch Creation & Scheduling",
        items: [
          "Block out 3 hours per month for 'Batch Content Creation'.",
          "Use a scheduling tool (Buffer, Hootsuite, Meta Business Suite) to schedule posts in advance.",
          "Engage with comments and relevant accounts for 15 minutes daily."
        ]
      }
    ],
    relatedServices: ["social-media"],
    relatedBlogs: []
  },
  {
    slug: "small-business-marketing-checklist",
    title: "Small Business Digital Marketing Checklist",
    metaTitle: "Small Business Digital Marketing Checklist | Aarotech",
    metaDescription: "The essential digital marketing checklist for small businesses looking to establish a strong online presence.",
    category: "Digital Marketing",
    heroSubtitle: "Free Marketing Framework",
    heroDescription: "A foundational checklist for small businesses to establish a strong, lead-generating digital presence from scratch.",
    intro: "Digital marketing can be overwhelming for small business owners. Should you run ads? Post on TikTok? Send emails? This checklist cuts through the noise and provides the foundational steps every small business must take before spending money on advanced tactics.",
    checklist: [
      {
        section: "Phase 1: The Foundation",
        items: [
          "Build a fast, mobile-friendly website with a clear Call to Action (CTA).",
          "Claim and optimize your Google Business Profile.",
          "Set up Google Analytics to track website visitors.",
          "Create branded social media profiles (Facebook, Instagram, LinkedIn)."
        ]
      },
      {
        section: "Phase 2: Lead Generation",
        items: [
          "Create a 'Lead Magnet' (like this checklist) to capture email addresses.",
          "Set up an automated welcome email sequence for new subscribers.",
          "Ensure your phone number is clickable and prominent on your website."
        ]
      },
      {
        section: "Phase 3: Traffic & Growth",
        items: [
          "Launch a small Google Search Ads campaign targeting high-intent keywords.",
          "Start a blog targeting local search queries.",
          "Ask every past client for a Google review to build social proof."
        ]
      }
    ],
    relatedServices: ["digital-advertising", "seo", "website-development"],
    relatedBlogs: []
  }
];
