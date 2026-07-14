export interface Industry {
  slug: string;
  name: string;
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
    slug: "healthcare-hospitals",
    name: "Hospitals & Healthcare Networks",
    metaTitle: "Digital Marketing for Hospitals in Tamil Nadu | Aarotech",
    metaDescription: "Aarotech specializes in HIPAA-compliant digital marketing, local SEO, and patient acquisition strategies for hospitals and multi-specialty clinics in Tamil Nadu.",
    heroSubtitle: "Healthcare Digital Marketing Experts",
    heroDescription: "We build trust-driven, highly visible digital marketing engines that connect patients with the right medical specialists when they need it most.",
    overview: [
      "The healthcare sector in Tamil Nadu, particularly in medical hubs like Chennai, Coimbatore, and Trichy, is incredibly competitive. Patients are increasingly relying on search engines to research symptoms, verify doctor credentials, and read reviews before booking a consultation.",
      "For a hospital, digital marketing isn't about flashy advertisements; it is about establishing unwavering authority, building trust, and being accessible at the exact moment of patient need.",
      "Aarotech partners with leading hospitals to build robust digital infrastructures—from fast, accessible websites to hyper-local search dominance—ensuring that your facility is the undisputed choice for patient care."
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
        description: "We implement automated, compliant systems to encourage positive patient reviews on Google and Practo, actively monitoring and managing your hospital's digital brand."
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
      { question: "Do you build patient portals?", answer: "Yes, our web development team builds highly secure, scalable patient portals and integrates them with your existing Hospital Management Systems (HMS)." }
    ],
    relatedBlogs: ["seo-for-hospitals-chennai"],
    relatedCaseStudies: ["medicare-growth"]
  }
];

// Scaffold remaining industries as outlined in Phase 2 Plan
const scaffoldedIndustries = [
  { slug: "healthcare-clinics", name: "Specialized Medical Clinics" },
  { slug: "healthcare-dental", name: "Dental Clinics" },
  { slug: "healthcare-diagnostic", name: "Diagnostic Centres & Labs" },
  { slug: "education-schools", name: "K-12 Schools" },
  { slug: "education-colleges", name: "Colleges & Universities" },
  { slug: "education-coaching", name: "Coaching & Training Centres" },
  { slug: "local-restaurants", name: "Restaurants & Cafes" },
  { slug: "local-salons", name: "Salons & Spas" },
  { slug: "local-gyms", name: "Gyms & Fitness Centres" },
  { slug: "local-retail", name: "Retail Stores & Showrooms" },
  { slug: "professional-ca", name: "Chartered Accountants" },
  { slug: "professional-lawyers", name: "Law Firms & Attorneys" },
  { slug: "professional-architects", name: "Architects & Interior Designers" },
  { slug: "real-estate", name: "Real Estate Builders & Promoters" },
  { slug: "manufacturing", name: "Manufacturing & Industrial" }
];

scaffoldedIndustries.forEach(ind => {
  industries.push({
    slug: ind.slug,
    name: ind.name,
    metaTitle: `Digital Marketing for ${ind.name} | Aarotech`,
    metaDescription: `Discover how Aarotech helps ${ind.name} increase visibility, generate leads, and dominate local search in Tamil Nadu.`,
    heroSubtitle: "Industry Specific Marketing",
    heroDescription: `Customized digital growth strategies tailored for the unique challenges and opportunities in the ${ind.name} sector.`,
    overview: [
      `Our deep expertise in marketing for ${ind.name} allows us to bypass generic strategies and implement tactics that drive real revenue.`,
      "Content structure pending full expansion in Phase 3."
    ],
    challenges: [
      "High competition and saturated digital markets.",
      "Difficulty in tracking exact return on ad spend (ROAS).",
      "Building trust and authority with modern consumers."
    ],
    howWeHelp: [
      { title: "Targeted SEO Strategy", description: `We identify the exact keywords your ideal customers use to find ${ind.name}.` },
      { title: "Conversion-Optimized Web Design", description: "Websites engineered to turn browsers into booked appointments or leads." }
    ],
    services: ["seo", "digital-advertising"],
    process: ["Audit", "Strategy", "Execution", "Optimization"],
    faqs: [
      { question: `Do you have experience working with ${ind.name}?`, answer: "Yes, we deploy proven strategies specifically designed for your industry's unique buying cycle." }
    ],
    relatedBlogs: [],
    relatedCaseStudies: []
  });
});
