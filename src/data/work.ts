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
    title: "Getting More Local Patients for Healthcare",
    slug: "tosh-clinic-local-seo",
    industry: "Healthcare",
    serviceCategory: "SEO",
    client: "TOSH Clinic",
    clientOverview: "TOSH Clinic is a well-known orthopedic and healthcare provider in Trichy. Despite having excellent doctors and facilities, they were struggling to attract a steady stream of new patients online. Their local search presence was weak, allowing newer clinics to capture their potential patients simply by having a better optimized Google Business Profile.",
    heroImage: "https://images.unsplash.com/photo-1538108149393-fbbd81895907?auto=format&fit=crop&q=80&w=1200",
    gallery: [
      "https://images.unsplash.com/photo-1538108149393-fbbd81895907?auto=format&fit=crop&q=80&w=1200",
      "https://images.unsplash.com/photo-1551076805-e18690c5e53b?auto=format&fit=crop&q=80&w=1200"
    ],
    duration: "Ongoing",
    businessChallenge: [
      "Not showing up in local 'near me' searches for orthopedic doctors.",
      "Inconsistent contact details online confusing search engines and patients.",
      "Low patient walk-ins coming from digital marketing channels.",
      "Lack of a clear social media plan to build trust and connect with the community."
    ],
    research: [
      "Looked closely at the top 10 competing clinics in a 20km radius.",
      "Analyzed what local patients were actually searching for online.",
      "Checked their existing Google Business Profile and found missing services and unoptimized photos."
    ],
    strategy: [
      "Update and improve the Google Business Profile (GMB) to show up in local map searches.",
      "Run focused Facebook and Instagram ads designed specifically to drive foot traffic and direct phone calls.",
      "Use Google Search Ads targeting specific treatments to reach people actively looking for help."
    ],
    execution: [
      "Updated their entire GMB profile, adding regular posts, detailed service lists, and clear clinic photos.",
      "Set up proper tracking to measure exactly which campaigns were bringing in booked appointments.",
      "Created helpful, simple video content featuring their doctors explaining common procedures.",
      "Fixed over 40 local directory listings to make sure their phone number and address were correct everywhere."
    ],
    deliverables: [
      "Local SEO Audit & Setup",
      "Google Business Profile Optimization",
      "Facebook & Google Ads Management",
      "Social Media Content Plan",
      "Website Conversion Improvements"
    ],
    outcome: [
      { label: "Walk-ins", value: "200% growth in physical patient walk-ins", isQuantitative: true },
      { label: "Visibility", value: "350% increase in Google Map views", isQuantitative: true },
      { label: "Ad Spend", value: "Reduced Cost-Per-Acquisition (CPA) by 45%", isQuantitative: true }
    ],
    lessonsLearned: [
      "In healthcare marketing, trust is everything. Featuring real doctors in videos worked 4x better than generic stock photos.",
      "Patients in pain don't want to browse; they want to call. Adding direct-call buttons on mobile ads brought in great results."
    ],
    technologiesUsed: ["Meta Ads", "Google Ads", "Google Business Profile", "Ahrefs", "Google Analytics"],
    relatedServices: ["seo", "digital-advertising", "social-media-marketing"],
    isNDA: false
  },
  {
    id: "cs-2",
    title: "Increasing Student Admissions for Education",
    slug: "shine-academy-lead-gen",
    industry: "Education",
    serviceCategory: "Marketing Campaigns",
    client: "Shine Academy",
    clientOverview: "Shine Academy is a respected educational institution offering specialized courses. However, after a bad experience with a previous marketing agency, they were facing a drop in new student admissions. They needed a reliable, transparent way to get more students to enroll for their upcoming batches.",
    heroImage: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&q=80&w=1200",
    gallery: [
      "https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&q=80&w=1200",
      "https://images.unsplash.com/photo-1513258496099-48166314a708?auto=format&fit=crop&q=80&w=1200"
    ],
    duration: "Ongoing",
    businessChallenge: [
      "Burned by a previous agency, leading to skepticism and a tight budget.",
      "Cost to acquire a lead was too high, and the leads they did get were often poor quality.",
      "Website landing pages were slow and hard to use on mobile phones.",
      "No system in place to follow up with students who visited the site but didn't sign up right away."
    ],
    research: [
      "Checked the previous agency's Google and Facebook ad accounts to see where money was being wasted.",
      "Mapped out the steps a student takes from seeing an ad to finally enrolling.",
      "Looked at competitor websites to see what was missing on Shine Academy's pages."
    ],
    strategy: [
      "Stop the old, wasteful campaigns and build a clear, targeted Google Search Ads plan.",
      "Create fast, mobile-friendly landing pages for each specific course they offered.",
      "Run a 30-day Facebook remarketing campaign to gently remind undecided parents and students to enroll."
    ],
    execution: [
      "Started new Google Search campaigns focusing only on people actively searching for 'admissions'.",
      "Built 5 custom landing pages that load quickly to keep visitors from leaving.",
      "Set up proper tracking so the academy knew exactly where their best students were coming from.",
      "Created simple, clear ads highlighting batch deadlines and seat availability."
    ],
    deliverables: [
      "Google Search Ads Setup",
      "Facebook Remarketing",
      "Custom Landing Pages",
      "Proper Analytics Tracking",
      "Ad Design & Copywriting"
    ],
    outcome: [
      { label: "Admissions", value: "500–1000 completed student enrollments", isQuantitative: true },
      { label: "Lead Quality", value: "65% increase in lead-to-admission conversion rate", isQuantitative: true },
      { label: "Cost", value: "Reduced Cost-Per-Lead by 55% within the first month", isQuantitative: true }
    ],
    lessonsLearned: [
      "In education, both the student and the parent are involved in the decision. Ad text needs to speak to both of them.",
      "A fast website makes a huge difference. Making the page load just 2 seconds faster doubled the number of sign-ups."
    ],
    technologiesUsed: ["Google Ads", "Meta Ads", "Google Tag Manager", "Next.js (Landing Pages)", "Facebook CAPI"],
    relatedServices: ["marketing-campaigns", "digital-advertising", "website-development"],
    isNDA: false
  },
  {
    id: "cs-3",
    title: "Increasing Calls & Bookings with Local SEO",
    slug: "gleam-cleaning-local-seo",
    industry: "Service Industry",
    serviceCategory: "SEO",
    client: "Gleam Cleaning Service",
    clientOverview: "Gleam Cleaning Service is a trusted residential and commercial cleaning company. While they provided great service, local customers couldn't find them online. They relied heavily on word-of-mouth and needed a consistent way to increase daily phone calls, get more bookings, and find regular commercial cleaning jobs.",
    heroImage: "https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&q=80&w=1200",
    gallery: [
      "https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&q=80&w=1200",
      "https://images.unsplash.com/photo-1527515637462-cff94eecc1ac?auto=format&fit=crop&q=80&w=1200"
    ],
    duration: "Ongoing",
    businessChallenge: [
      "Not showing up on the first page of Google for basic cleaning services.",
      "Struggling to get daily bookings, averaging only about 2 per day.",
      "No easy way for happy customers to leave online reviews.",
      "The website didn't have specific pages for services like Deep Cleaning or Office Cleaning."
    ],
    research: [
      "Ran a full check of their website and local online directories.",
      "Found that competitors were ranking higher simply because they had more Google Reviews.",
      "Checked local search trends to see what specific cleaning services people in the area were looking for."
    ],
    strategy: [
      "Focus on getting their Google Business Profile to show up in the local map pack.",
      "Add new, clear pages to their website for every specific cleaning service they offered.",
      "Set up an automated system to ask customers for a review after a job was finished."
    ],
    execution: [
      "Updated their Google Business Profile and made sure their contact details matched across 50+ local websites.",
      "Wrote helpful, local-focused descriptions for their new website service pages.",
      "Connected an SMS tool that texts a review link to customers right after a cleaning job is done.",
      "Improved the website's titles and descriptions to encourage more clicks from search results."
    ],
    deliverables: [
      "Local SEO Plan",
      "New Website Service Pages",
      "Automated Review System via SMS",
      "Online Directory Cleanup",
      "Website Text Optimization"
    ],
    outcome: [
      { label: "Bookings", value: "Grew daily pre-bookings from ~2 to 20+", isQuantitative: true },
      { label: "Revenue", value: "Boosted total revenue by ~300% within 6 months", isQuantitative: true },
      { label: "Search Traffic", value: "400% increase in organic local search visits", isQuantitative: true }
    ],
    lessonsLearned: [
      "For home service businesses, getting 5-star reviews is the best way to get more calls. Automating the ask made it easy.",
      "Having a dedicated page for 'Office Cleaning' works much better than just listing it on a general 'Our Services' page."
    ],
    technologiesUsed: ["Google Business Profile", "Ahrefs", "Schema Markup", "Twilio API (for SMS)"],
    relatedServices: ["seo", "content-creation"],
    isNDA: false
  }
];
