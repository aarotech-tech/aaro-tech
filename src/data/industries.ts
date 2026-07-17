import { Activity, BookOpen, Store } from "lucide-react";
import { LucideIcon } from "lucide-react";

export interface Industry {
  slug: string;
  name: string;
  icon: LucideIcon;
  problem: string;
  solution: string;
  metaTitle: string;
  metaDescription: string;
  heroSubtitle: string;
  heroDescription: string;
  overview: string[];
  challenges: string[];
  howWeHelp: {
    title: string;
    description: string;
  }[];
  services: string[]; // Slugs to core services
  process: string[];
  faqs: { question: string; answer: string }[];
  relatedBlogs: string[]; // Slugs to blogs
  relatedCaseStudies: string[]; // Slugs to case studies
}

export const industries: Industry[] = [
  {
    slug: "healthcare",
    name: "Healthcare & Clinics",
    icon: Activity,
    problem: "Struggling to attract new patients consistently in a competitive local market.",
    solution: "We build trust-focused websites and run targeted local SEO and Google Ads to connect you with patients actively seeking care.",
    metaTitle: "Digital Marketing for Healthcare Clinics | Aarotech",
    metaDescription: "Aarotech specializes in HIPAA-compliant digital marketing, local SEO, and patient acquisition strategies for hospitals and clinics.",
    heroSubtitle: "Healthcare Digital Marketing Experts",
    heroDescription: "We build trust-driven, highly visible digital marketing engines that connect patients with the right medical specialists when they need it most.",
    overview: [
      "The healthcare sector is incredibly competitive. Patients are increasingly relying on search engines to research symptoms, verify doctor credentials, and read reviews before booking a consultation.",
      "For a clinic or hospital, digital marketing isn't about flashy advertisements; it is about establishing unwavering authority, building trust, and being accessible at the exact moment of patient need.",
      "Aarotech partners with leading healthcare providers to build robust digital infrastructures—from fast, accessible websites to hyper-local search dominance—ensuring that your facility is the undisputed choice for patient care."
    ],
    challenges: [
      "Fierce local competition in 'near me' medical searches.",
      "Strict compliance and advertising regulations for medical practices.",
      "Managing and scaling an impeccable online reputation (patient reviews).",
      "Communicating complex medical expertise in a patient-friendly manner."
    ],
    howWeHelp: [
      {
        title: "Dominating Local Search (Local SEO)",
        description: "We rigorously optimize your Google Business Profiles for every department and specialist, ensuring you appear in the Local Pack for high-intent searches like 'cardiologist near me'."
      },
      {
        title: "Medical E-E-A-T Content Strategy",
        description: "We help you build deep, authoritative content hubs for specific treatments, authored or medically reviewed by your doctors, to satisfy Google's strict YMYL quality algorithms."
      },
      {
        title: "Patient-Centric Web Development",
        description: "We engineer lightning-fast, highly secure, and mobile-optimized websites featuring seamless appointment booking engines and clear emergency routing."
      },
      {
        title: "Reputation Management",
        description: "We implement automated, compliant systems to encourage positive patient reviews on Google, actively monitoring and managing your hospital's digital brand."
      }
    ],
    services: ["seo", "website-development", "digital-advertising"],
    process: [
      "Comprehensive Digital Health Audit & Competitor Analysis",
      "Technical SEO & Core Web Vitals Remediation",
      "Department-level Local SEO Setup & Optimization",
      "Ongoing YMYL Content Generation & Link Building"
    ],
    faqs: [
      { question: "How is healthcare SEO different from regular SEO?", answer: "Healthcare SEO falls under Google's YMYL (Your Money or Your Life) guidelines. It requires a much higher threshold of demonstrated medical expertise, strict adherence to advertising laws, and a heavy focus on localized trust signals." },
      { question: "Can you guarantee first-page rankings?", answer: "No ethical agency can guarantee specific rankings due to algorithmic volatility. However, we guarantee the implementation of proven, compliant strategies that consistently drive long-term organic growth." },
      { question: "Do you understand medical advertising rules?", answer: "Yes, we navigate platform restrictions carefully to ensure your ads are compliant and effective." }
    ],
    relatedBlogs: [],
    relatedCaseStudies: ["cs-1", "cs-3"]
  },
  {
    slug: "education",
    name: "Education & Institutions",
    icon: BookOpen,
    problem: "Low enrollment rates and high competition from other institutions.",
    solution: "We implement lead-generation funnels and Meta Ads to reach parents and students effectively.",
    metaTitle: "Digital Marketing for Schools & Colleges | Aarotech",
    metaDescription: "Maximize your admissions season with targeted lead generation campaigns and digital marketing for educational institutions.",
    heroSubtitle: "Education Marketing Specialists",
    heroDescription: "Maximize your admissions season with targeted lead generation campaigns that reach the right parents and students.",
    overview: [
      "The education sector requires a delicate balance of brand building and direct response marketing. Parents and students take months to decide on an institution, making multiple touchpoints critical.",
      "Aarotech helps schools, colleges, and coaching centers build comprehensive digital funnels. We capture attention early with targeted ads, build trust with compelling content, and nurture leads until enrollment.",
      "We understand the seasonal nature of admissions and plan our campaigns months in advance to ensure your institution is top-of-mind during peak decision-making periods."
    ],
    challenges: [
      "Extremely seasonal enrollment periods and admissions cycles.",
      "High competition from both legacy institutions and new ed-tech startups.",
      "Long decision-making processes requiring sustained lead nurturing.",
      "Tracking the attribution of a lead from a digital ad to a physical campus visit."
    ],
    howWeHelp: [
      {
        title: "Targeted Admissions Campaigns",
        description: "We run highly specific Meta and Google Ads targeting parents by demographics, income, and interests, or students by career aspirations."
      },
      {
        title: "Lead Nurturing Automations",
        description: "We set up automated email and WhatsApp sequences to keep prospective students engaged from the moment they download a brochure to their campus tour."
      },
      {
        title: "Institutional Web Design",
        description: "We build websites that showcase your campus culture, academic excellence, and alumni success stories, optimized for fast loading and mobile accessibility."
      },
      {
        title: "Virtual Campus Tours",
        description: "We integrate interactive virtual tours and high-quality video content into your digital presence to give prospects a feel for campus life before they visit."
      }
    ],
    services: ["digital-advertising", "social-media", "website-development"],
    process: [
      "Admissions Goal Setting & Audience Profiling",
      "Lead Magnet Creation (Brochures, Webinars)",
      "Omni-channel Ad Campaign Launch",
      "Automated Nurture Sequence Implementation"
    ],
    faqs: [
      { question: "Can you handle seasonal enrollment spikes?", answer: "Yes, we plan campaigns months in advance for peak admissions, shifting budgets to capture the highest intent traffic." },
      { question: "Do you do marketing for online courses or just physical schools?", answer: "We do both. The strategies differ—online courses rely heavily on impulse and quick funnels, while physical schools require local targeting and longer nurturing." },
      { question: "How do we track if an ad led to an enrollment?", answer: "We implement robust CRM integrations and offline conversion tracking so you can trace a registered student back to the exact ad they clicked." }
    ],
    relatedBlogs: [],
    relatedCaseStudies: []
  },
  {
    slug: "local-businesses",
    name: "Local Service Businesses",
    icon: Store,
    problem: "Losing foot traffic and calls to competitors with stronger online visibility.",
    solution: "We dominate local search results (Google Business Profile) to ensure you're the top choice in your neighborhood.",
    metaTitle: "Local SEO & Ads for Retail Businesses | Aarotech",
    metaDescription: "Dominate your neighborhood and become the #1 choice when locals search for your services with our local SEO strategies.",
    heroSubtitle: "Local Search Dominance",
    heroDescription: "Dominate your neighborhood and become the #1 choice when locals search for your services.",
    overview: [
      "For local service businesses like plumbers, electricians, salons, and retail stores, visibility is everything. If you aren't in the top 3 on Google Maps, you are losing business every single day.",
      "Aarotech specializes in hyper-local marketing. We optimize your digital presence so that when someone in your city searches for your service, your business is the first one they see.",
      "We focus on driving high-intent phone calls and foot traffic, tracking every lead so you know exactly what your marketing dollars are doing."
    ],
    challenges: [
      "Fierce competition for the top 3 spots in the Google Maps Local Pack.",
      "Inconsistent flow of leads making revenue unpredictable.",
      "Negative reviews damaging reputation and deterring potential customers.",
      "Wasting money on broad advertising that reaches people outside your service area."
    ],
    howWeHelp: [
      {
        title: "Google Business Profile Optimization",
        description: "We claim, optimize, and manage your GBP, ensuring all information is accurate, adding localized keywords, and posting regular updates."
      },
      {
        title: "Local Service Ads (LSAs)",
        description: "We set up and manage Google Local Service Ads, putting you at the very top of search results and ensuring you only pay for actual leads, not just clicks."
      },
      {
        title: "Review Generation Campaigns",
        description: "We implement automated SMS and email campaigns to encourage your satisfied customers to leave 5-star reviews on Google."
      },
      {
        title: "Local SEO Landing Pages",
        description: "We build dedicated, highly optimized web pages for every specific service you offer and every specific city/neighborhood you serve."
      }
    ],
    services: ["seo", "digital-advertising"],
    process: [
      "Local Competitor Audit & Keyword Mapping",
      "Google Business Profile Overhaul",
      "Local Citations & Directory Submissions",
      "Review Management & LSA Launch"
    ],
    faqs: [
      { question: "Do I need a big budget?", answer: "No, local SEO and Local Service Ads can provide massive ROI even for single-location shops with modest budgets." },
      { question: "How long does it take to rank on Google Maps?", answer: "While some optimizations can cause a quick bump, it typically takes 3-6 months to see sustained dominance in the Local Pack for competitive terms." },
      { question: "Can you guarantee leads?", answer: "We guarantee that our strategies will significantly increase your visibility to people actively searching for your services, which naturally leads to an increase in calls and inquiries." }
    ],
    relatedBlogs: [],
    relatedCaseStudies: ["cs-2"]
  }
];
