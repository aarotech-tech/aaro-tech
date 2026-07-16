import { Code, Search, Megaphone, PenTool, LayoutTemplate, Video } from "lucide-react";

export const services = [
  {
    id: "content-creation",
    title: "Content Creation",
    description: "Video and visual content that stops the scroll and drives measurable action.",
    icon: Video,
    h1: "High-Quality Content Creation Services",
    intro: "In today’s fast-paced digital landscape, generic content simply doesn't cut it. We specialize in producing high-quality, conversion-focused video and visual content that commands attention and drives measurable action. From compelling short-form video reels that leverage platform algorithms to professionally crafted graphics and persuasive copywriting, our content strategy is designed to position your brand as an industry authority. We don't just create content for the sake of posting; every asset is meticulously planned to guide your audience through the customer journey, turning passive scrollers into engaged prospects and loyal customers. Whether you need educational product demos, emotional brand storytelling, or punchy social media ad creatives, our team delivers assets that resonate deeply with your target demographic and elevate your digital footprint.",
    benefits: [
      "High-retention video editing optimized for TikTok, Reels, and Shorts",
      "Persuasive, conversion-driven copywriting that speaks directly to your audience's pain points",
      "Professional visual design and graphics that elevate your brand's perceived value",
      "Strategic content calendars aligned with your overarching revenue goals",
      "A/B tested creative assets designed specifically for performance marketing"
    ],
    deliveryProcess: [
      { step: "01", title: "Discovery & Strategy", description: "We analyze your brand voice, target audience, and current content gaps to build a customized creative brief." },
      { step: "02", title: "Asset Collection & Scripting", description: "We collaborate to gather raw footage, imagery, and finalize high-converting scripts." },
      { step: "03", title: "Production & Editing", description: "Our team edits and polishes the raw assets, adding professional transitions, grading, and sound design." },
      { step: "04", title: "Review & Refinement", description: "You review the drafts, and we apply any necessary revisions to ensure perfect brand alignment." },
      { step: "05", title: "Final Delivery", description: "Optimized files are delivered in multiple formats, ready for immediate deployment across your chosen platforms." }
    ],
    faqs: [
      { question: "Do you shoot videos?", answer: "We primarily focus on high-end post-production, scriptwriting, and editing. We can work with raw footage you supply or utilize premium stock assets combined with motion graphics." },
      { question: "What platforms do you optimize content for?", answer: "We format and optimize content natively for Instagram Reels, TikTok, YouTube Shorts, LinkedIn, and Facebook, ensuring correct aspect ratios and pacing for each." },
      { question: "How long does a standard content batch take?", answer: "Depending on the complexity, a standard monthly batch of short-form content usually takes 7 to 14 days from script approval to final delivery." },
      { question: "Do you handle copywriting as well?", answer: "Yes, our team includes professional copywriters who craft engaging captions, video scripts, and ad copy to accompany the visual assets." },
      { question: "Can I request revisions on the content?", answer: "Absolutely. We include standard revision rounds in our workflow to ensure the final product perfectly aligns with your brand vision." }
    ],
    cta: "Start Creating High-Converting Content"
  },
  {
    id: "social-media",
    title: "Social Media Marketing",
    description: "Organic social strategies that turn casual followers into paying customers.",
    icon: Code,
    h1: "Organic Social Media Management",
    intro: "Building a loyal community requires more than just scheduling random posts. Our organic social media management service focuses on developing a consistent, authoritative, and engaging brand presence across the platforms where your audience actually spends their time. We go beyond vanity metrics to implement strategies that foster genuine community loyalty and drive organic lead generation. By blending educational industry insights, behind-the-scenes authenticity, and strategic community management, we transform your social profiles into highly effective customer acquisition channels. We handle everything from content calendar creation and daily posting to proactive engagement and performance tracking, allowing you to focus on running your business while we build your digital community.",
    benefits: [
      "Consistent, high-quality posting schedules tailored to optimal engagement times",
      "Proactive community engagement to build brand loyalty and trust",
      "Authentic brand voice development that differentiates you from competitors",
      "Data-driven content pillars that address your audience's exact needs",
      "Comprehensive monthly reporting on follower growth, reach, and organic leads"
    ],
    deliveryProcess: [
      { step: "01", title: "Platform & Audience Audit", description: "We analyze your current social presence and identify where your most valuable customers are active." },
      { step: "02", title: "Strategy & Voice Development", description: "We define your brand's unique tone of voice and establish core content pillars." },
      { step: "03", title: "Content Calendar Creation", description: "A structured monthly calendar is designed, detailing exact posts, captions, and publishing times." },
      { step: "04", title: "Daily Execution & Engagement", description: "We handle the seamless publishing of content and actively engage with comments and direct messages." },
      { step: "05", title: "Analytics & Optimization", description: "We review monthly performance data to refine our strategy and double down on what works." }
    ],
    faqs: [
      { question: "Which social media platforms do you manage?", answer: "We specialize in managing Instagram, LinkedIn, Facebook, and Twitter (X), selecting the platforms that best align with your target demographic." },
      { question: "Will you respond to comments and messages?", answer: "Yes, active community management is a core part of our service. We respond to standard inquiries and route complex questions to your team." },
      { question: "Do I have to provide all the content?", answer: "Not at all. We can work with assets you provide, or our content creation team can generate high-quality graphics and copy from scratch." },
      { question: "How do you measure social media success?", answer: "We look beyond likes and followers, tracking meaningful metrics such as profile clicks, website traffic, engagement rates, and organic lead generation." },
      { question: "Can I review the posts before they go live?", answer: "Yes, you will have full access to our content calendar for approval before anything is published." }
    ],
    cta: "Elevate Your Social Presence Today"
  },
  {
    id: "digital-advertising",
    title: "Meta & Google Ads",
    description: "High-ROI campaigns on Google and Meta that put your business in front of buyers, not browsers.",
    icon: Megaphone,
    h1: "High-ROI Digital Advertising Campaigns",
    intro: "Stop wasting budget on campaigns that generate clicks but no revenue. Our performance marketing services focus exclusively on high-ROI strategies across Google Ads and Meta (Facebook/Instagram). We capture high-intent searchers at the exact moment they are looking for your services on Google, and we build massive, targeted brand awareness on Meta to generate qualified leads. Our approach combines rigorous audience segmentation, relentless A/B testing of ad creatives, and advanced conversion tracking to ensure every rupee spent contributes directly to your bottom line. We don't just launch campaigns and hope for the best; we actively manage, optimize, and scale your digital advertising to lower your cost-per-acquisition and maximize your return on ad spend.",
    benefits: [
      "Advanced keyword targeting to capture users with high purchasing intent",
      "Precise demographic and behavioral audience targeting on Meta platforms",
      "Continuous A/B testing of ad copy, creatives, and landing pages",
      "Strict budget management and relentless conversion rate optimization",
      "Fully transparent, real-time reporting on your Cost-Per-Lead and ROI"
    ],
    deliveryProcess: [
      { step: "01", title: "Campaign Strategy & Forecasting", description: "We analyze historical data, competitor strategies, and search volume to project potential ROI." },
      { step: "02", title: "Tracking & Infrastructure Setup", description: "We implement robust pixel tracking, server-side APIs, and conversion goals to ensure perfect attribution." },
      { step: "03", title: "Creative & Copy Development", description: "Our team crafts highly persuasive ad copy and designs visually striking creatives tailored to each platform." },
      { step: "04", title: "Launch & Aggressive Testing", description: "Campaigns go live with multiple variations to quickly identify the best performing audiences and creatives." },
      { step: "05", title: "Scaling & CPA Reduction", description: "We continuously shift budget to winning campaigns, aggressively lowering your cost per acquisition." }
    ],
    faqs: [
      { question: "Do you handle both Meta (Facebook/Instagram) and Google Ads?", answer: "Yes, we build integrated, omni-channel strategies. Google captures existing demand, while Meta builds awareness and retargets interested prospects." },
      { question: "What is the minimum ad budget required?", answer: "While it varies by industry, we typically recommend a minimum monthly ad spend of ₹30,000 to ensure we have enough data to optimize campaigns effectively." },
      { question: "How do you track whether the ads are actually working?", answer: "We set up advanced conversion tracking using Google Tag Manager and Meta Pixel, tracing every lead and sale back to the specific ad that generated it." },
      { question: "Do you create the ad images and videos?", answer: "Yes, our in-house creative team designs all the necessary graphic and video assets required for high-performing campaigns." },
      { question: "How often will we receive performance updates?", answer: "You will have access to a live dashboard 24/7, and we provide detailed strategic reviews on a monthly basis." }
    ],
    cta: "Request Your Free Ad Account Audit"
  },
  {
    id: "branding",
    title: "Branding & Creative Design",
    description: "Premium visual identities that command authority and trust from the very first impression.",
    icon: PenTool,
    h1: "Premium Brand Identity Design",
    intro: "First impressions are made in milliseconds, and poor design costs you credibility. Our Branding and Creative Design services are dedicated to crafting premium, cohesive visual identities that command authority and immediately establish trust with your target market. Whether you are launching a new enterprise or rebranding an established business for the modern digital era, we build comprehensive brand systems—from memorable logo design and distinct color palettes to typography rules and extensive brand guidelines. We ensure that every touchpoint, from your website to your social media graphics, communicates a unified, professional message that differentiates you from competitors and resonates deeply with your ideal customers.",
    benefits: [
      "Bespoke, memorable logo design that captures your company's core essence",
      "Comprehensive brand guidelines ensuring consistency across all marketing channels",
      "Stunning, conversion-optimized marketing collateral and digital assets",
      "Professional typography and color psychology application",
      "Strategic brand positioning that elevates your perceived market value"
    ],
    deliveryProcess: [
      { step: "01", title: "Brand Discovery Session", description: "We dive deep into your company's vision, target demographic, and competitive landscape." },
      { step: "02", title: "Moodboarding & Concepting", description: "We develop visual directions and moodboards to align on the stylistic approach before designing." },
      { step: "03", title: "Identity Design", description: "Our designers craft the primary logo, secondary marks, and establish the color and typography systems." },
      { step: "04", title: "Collateral Development", description: "We design necessary marketing materials, such as business cards, social media templates, and presentation decks." },
      { step: "05", title: "Brand Guideline Handoff", description: "You receive a comprehensive brand book and all master files, empowering your team to maintain consistency." }
    ],
    faqs: [
      { question: "Do you offer full rebranding services for existing businesses?", answer: "Yes. We frequently help established businesses modernize their visual identity without losing the brand equity they've built over the years." },
      { question: "What deliverables are included in a branding package?", answer: "Standard deliverables include the primary/secondary logos, color palettes, typography guidelines, a comprehensive brand book, and basic social media templates." },
      { question: "How long does a branding project take?", answer: "A comprehensive brand identity project typically takes 3 to 6 weeks, depending on the number of collateral items required and the speed of feedback." },
      { question: "Do I own the rights to the final designs?", answer: "Absolutely. Upon final payment, full ownership and all master vector files are transferred directly to you." },
      { question: "Can you help with naming my company?", answer: "Yes, we offer strategic brand naming services and tagline development as part of our extended branding engagements." }
    ],
    cta: "Transform Your Brand Identity"
  },
  {
    id: "website-development",
    title: "Web Development",
    description: "Fast, conversion-optimized websites built to turn your visitors into paying customers.",
    icon: LayoutTemplate,
    h1: "High-Converting Website Development",
    intro: "Your website is your most important digital asset, functioning as your best salesperson working 24/7. We do not just build digital brochures; we engineer fast, scalable, and beautifully designed web applications focused entirely on lead generation and user experience. Utilizing modern frameworks like Next.js and React, we ensure lightning-fast load times, flawless mobile responsiveness, and enterprise-grade security. Every site we develop is built with technical SEO architecture from day one, ensuring search engines can crawl and index your pages effortlessly. From complex custom integrations to sleek, conversion-optimized landing pages, we build digital experiences that impress visitors and compel them to take action.",
    benefits: [
      "Lightning-fast load speeds utilizing modern edge-rendering technologies",
      "Flawless, mobile-first responsive design tailored for all devices",
      "Deeply integrated technical SEO architecture for superior search engine crawling",
      "Custom enterprise API integrations and secure backend database development",
      "Conversion Rate Optimization (CRO) principles applied to every layout and user flow"
    ],
    deliveryProcess: [
      { step: "01", title: "Requirements & UX Planning", description: "We map out the site architecture, user journeys, and technical requirements based on your business goals." },
      { step: "02", title: "UI Design & Prototyping", description: "We create high-fidelity designs and interactive prototypes, giving you a clear view of the final product." },
      { step: "03", title: "Full-Stack Development", description: "Our engineers build the site using modern frameworks, ensuring clean, scalable, and secure code." },
      { step: "04", title: "QA Testing & SEO Setup", description: "Rigorous cross-browser testing, mobile optimization, and technical SEO configurations are finalized." },
      { step: "05", title: "Launch & Training", description: "We seamlessly migrate the site to live servers and provide training on how to manage your new digital asset." }
    ],
    faqs: [
      { question: "What technologies do you use for web development?", answer: "We specialize in modern JavaScript frameworks, primarily Next.js, React, and Node.js, ensuring superior performance and scalability." },
      { question: "Will my website be mobile-friendly?", answer: "Yes. Every website we build is designed with a 'mobile-first' approach, ensuring flawless performance across all smartphones and tablets." },
      { question: "How long does it take to build a custom website?", answer: "A standard corporate website usually takes 4-6 weeks. Complex web applications with custom database integrations can take 8-12 weeks." },
      { question: "Do you provide hosting and maintenance after launch?", answer: "Yes, we offer premium cloud hosting setups and ongoing maintenance contracts to keep your site secure, fast, and up-to-date." },
      { question: "Is SEO included in the web development process?", answer: "We build the structural foundation for SEO (fast speeds, proper schema, clean tags). Ongoing content SEO is offered as a separate marketing service." }
    ],
    cta: "Request a Custom Web Development Quote"
  },
  {
    id: "seo",
    title: "Search Engine Optimization",
    description: "Dominate search results and capture high-intent customers actively looking for your services.",
    icon: Search,
    h1: "SEO Services to Dominate Search Rankings",
    intro: "Stop paying for every single click and start building sustainable, long-term organic traffic. Our comprehensive Search Engine Optimization (SEO) methodologies are designed to dominate search results and capture high-intent customers exactly when they are actively looking for your products or services. We employ a rigorous, data-driven approach that covers all three pillars of SEO: deep technical site optimization, authoritative off-page link building, and highly relevant, E-E-A-T compliant content creation. Whether you are a local business needing Google Business Profile dominance or a nationwide enterprise aiming for highly competitive industry keywords, our transparent strategies systematically improve your rankings, drive qualified traffic, and establish your brand as the undisputed authority in your niche.",
    benefits: [
      "In-depth technical SEO audits to resolve crawlability and indexing issues",
      "High-quality, white-hat backlink acquisition to build domain authority",
      "Comprehensive Google Business Profile (GBP) optimization for local search dominance",
      "Strategic content creation that aligns with search intent and E-E-A-T guidelines",
      "Transparent monthly reporting on keyword rankings, traffic growth, and generated leads"
    ],
    deliveryProcess: [
      { step: "01", title: "Technical & Competitor Audit", description: "We identify site errors, analyze competitor strategies, and establish a baseline for your current rankings." },
      { step: "02", title: "Keyword & Intent Research", description: "We map out high-value, high-conversion keywords that your ideal customers are actually searching for." },
      { step: "03", title: "On-Page & Technical Fixes", description: "We optimize meta tags, site speed, internal linking, and ensure search engines can effortlessly crawl your site." },
      { step: "04", title: "Content Creation & Optimization", description: "We deploy highly relevant, authoritative content designed to rank and engage your target audience." },
      { step: "05", title: "Authority Building & Link Outreach", description: "We execute ongoing outreach campaigns to secure high-quality backlinks from reputable industry websites." }
    ],
    faqs: [
      { question: "How long does it take to see results from SEO?", answer: "SEO is a long-term investment. While some technical fixes yield quick wins, you should expect to see significant ranking improvements and traffic growth between months 3 and 6." },
      { question: "What is the difference between Local SEO and National SEO?", answer: "Local SEO focuses on ranking in specific geographic areas (e.g., 'Best Dentist in Trichy') heavily utilizing Google Maps. National SEO targets broader keywords without location modifiers." },
      { question: "Are you using 'White Hat' SEO techniques?", answer: "Absolutely. We strictly adhere to Google's Webmaster Guidelines, ensuring sustainable growth without risking algorithmic penalties or manual actions." },
      { question: "Do you write the SEO content, or do I have to?", answer: "Our dedicated content team handles the research, writing, and optimization. We only require your review to ensure technical accuracy regarding your specific business operations." },
      { question: "How do we track the success of the SEO campaign?", answer: "We provide detailed monthly reports tracking organic traffic growth, specific keyword ranking improvements, and the volume of leads generated from organic search." }
    ],
    cta: "Launch Your Organic SEO Strategy"
  }
];

export const industries = [
  {
    id: "healthcare",
    title: "Healthcare",
    problem: "Struggling to attract new patients consistently in a competitive market.",
    solution: "We build trust-focused websites and run targeted local SEO and Google Ads to connect you with patients seeking care.",
    h1: "Digital Marketing for Healthcare Clinics",
    intro: "Attract more patients and build trust before they even step into your waiting room.",
    benefits: ["Strict HIPAA compliant marketing practices", "Local SEO dominance for 'near me' patient searches", "Strategies built around establishing patient trust"],
    faqs: [{ question: "Do you understand medical advertising rules?", answer: "Yes, we navigate platform restrictions carefully." }],
    cta: "Get a Healthcare Growth Plan"
  },
  {
    id: "education",
    title: "Education",
    problem: "Low enrollment rates and high competition from other institutions.",
    solution: "We implement lead-generation funnels and Meta Ads to reach parents and students effectively.",
    h1: "Digital Marketing for Schools & Colleges",
    intro: "Maximize your admissions season with targeted lead generation campaigns.",
    benefits: ["Funnels specifically designed to increase enrollments", "Precise parent and student demographic targeting", "Proactive brand reputation management"],
    faqs: [{ question: "Can you handle seasonal enrollment spikes?", answer: "Yes, we plan campaigns months in advance for peak admissions." }],
    cta: "Increase Enrollments"
  },
  {
    id: "local-businesses",
    title: "Local Businesses",
    problem: "Losing foot traffic to competitors with stronger online visibility.",
    solution: "We dominate local search results (Google Business Profile) to ensure you're the top choice in your area.",
    h1: "Local SEO & Ads for Retail Businesses",
    intro: "Dominate your neighborhood and become the #1 choice when locals search for your services.",
    benefits: ["Complete Google Business Profile optimization", "Dominating local keywords in your neighborhood", "Accurate foot traffic and lead tracking"],
    faqs: [{ question: "Do I need a big budget?", answer: "No, local SEO provides massive ROI even for single-location shops." }],
    cta: "Dominate Local Search"
  },
];

export const processSteps = [
  {
    step: "01",
    title: "Business & Marketing Audit",
    description: "We analyze your current digital footprint, competitors, and revenue goals to identify exact growth opportunities.",
  },
  {
    step: "02",
    title: "Custom Growth Plan",
    description: "You receive a tailored, step-by-step digital strategy designed specifically to acquire more customers in your industry.",
  },
  {
    step: "03",
    title: "Campaign Launch",
    description: "We build and execute your campaigns from high-converting landing pages to targeted ads and local SEO.",
  },
  {
    step: "04",
    title: "Optimization & Scaling",
    description: "We continuously monitor data, reduce cost-per-acquisition, and scale the campaigns that drive the most revenue.",
  },
];

export const caseStudies = [
  {
    id: "cs-1",
    clientIndustry: "Healthcare Client (Orthopedic)",
    challenge: "The Clinic faced very low physical walk-ins and was losing patients to heavy local competition.",
    solution: "We deployed a comprehensive trust-building content strategy to establish medical authority, paired with an aggressive local visibility campaign to drive high footfalls.",
    outcome: "Increased physical walk-ins by 210% and established a dominant local search presence, drastically reducing reliance on traditional marketing.",
    image: "/images/showcase/orthopedic.jpeg",
  },
  {
    id: "cs-2",
    clientIndustry: "Local Service Client",
    challenge: "Started with extremely low initial footfalls and had weak local visibility for their primary services.",
    solution: "Launched hyper-targeted Meta Ads, fully optimized their Google My Business (GMB) profile, and set up direct lead generation campaigns.",
    outcome: "Achieved a 300% increase in local foot traffic and generated 200+ highly qualified service leads within the first 60 days.",
    image: "/images/showcase/services.jpeg",
  },
  {
    id: "cs-3",
    clientIndustry: "Healthcare Client (Skin & Haircare)",
    challenge: "Struggling to attract new daily patients and competing against long-established clinics in their immediate vicinity.",
    solution: "Executed highly targeted performance marketing campaigns and optimized their local search presence to immediately gain patient trust.",
    outcome: "Generated a consistent flow of 70+ new patient consultations per week, effectively doubling their monthly revenue.",
    image: "/images/showcase/skincare.jpeg",
  },
];

export const founders = [
  {
    name: "Suriyanarayanan",
    fullName: "Suriyanarayanan",
    role: "Full Stack Developer & Data Analyst",
    bio: "Architecting high-performance websites and turning raw data into actionable insights. From clean code to conversion-optimised dashboards, I ensure every digital asset we build is fast, measurable, and built to grow.",
    quote: "Data tells you what's happening. Good engineering makes sure it never stops happening.",
    linkedin: "https://www.linkedin.com/in/suriyanarayanan-g/",
    photo: "/images/crew/suriyanarayanan.jpeg",
  },
  {
    name: "Aaron",
    fullName: "Aaron John",
    role: "Founder & Lead Strategist",
    bio: "As an elite boutique agency, I personally oversee the high-level strategy for our enterprise and growth-stage clients, ensuring we drive measurable pipeline and revenue.",
    quote: "Helping businesses generate measurable growth through data-driven digital marketing.",
    linkedin: "",
    photo: "/images/crew/aaron.jpeg",
  },
  {
    name: "Susinthiran",
    fullName: "Susinthiran",
    role: "Video Editor & Creative",
    bio: "Crafting engaging, high-retention video content that captures attention, stops the scroll, and builds brand awareness.",
    quote: "A good video doesn't just look pretty. It communicates your core value in the first three seconds.",
    linkedin: "",
    photo: "/images/crew/susinthiran.jpeg",
  },
];

export const testimonials: Array<{ id: string, quote: string, author: string, role: string, company?: string, resultAchieved?: string, photo?: string, videoUrl?: string }> = [
  {
    id: "t1",
    quote: "Best agency we've worked with. Period. The ROI speaks for itself.",
    author: "Dr. Sundar Prakash",
    role: "Managing Director",
    company: "TOSH",
    resultAchieved: "Lowered CPA by 40%",
    photo: "/images/client-logos/tosh.jpeg",
  },
  {
    id: "t2",
    quote: "They understand our brand perfectly and execute flawlessly on every campaign.",
    author: "Mr. John",
    role: "South Zone Distributor",
    company: "Stepzy",
    resultAchieved: "150k+ New Followers",
    photo: "/images/client-logos/stepzy.jpeg",
  },
  {
    id: "t3",
    quote: "Highly recommend them for anyone looking to scale their educational institution.",
    author: "Mr. Mathew",
    role: "Managing Director",
    company: "Shine Academy",
    resultAchieved: "50% Higher Enrollment",
    photo: "/images/client-logos/shine-academy.jpeg",
  },
  {
    id: "t4",
    quote: "Aarotech completely transformed our digital presence. We saw incredible results within the first quarter.",
    author: "Mr. Joshua",
    role: "Managing Director",
    company: "Gleam",
    resultAchieved: "200% Increase in Leads",
    photo: "/images/client-logos/gleam.jpeg",
  },
  {
    id: "t5",
    quote: "The level of communication and the quality of leads we've been getting is unmatched.",
    author: "Mrs. Princy",
    role: "Founder",
    company: "Rose",
    resultAchieved: "Tripled Revenue in 6 Months",
    photo: "/images/client-logos/rose.jpeg",
  }
];

export const faqs = [
  {
    question: "We've been burned by agencies before. How are you different?",
    answer: "We get it. Vague reports, zero accountability, and cookie-cutter strategies are frustratingly common. At Aarotech, you work directly with the founders, not a junior account manager. Every campaign is custom-built around your revenue goals, and we share real-time dashboards so you always know exactly where your money is going.",
  },
  {
    question: "How quickly will I start seeing leads or customers?",
    answer: "It depends on the channel. Paid ads (Google & Meta) can start driving qualified leads within the first 1-2 weeks of launch. SEO is a longer play, so expect meaningful organic traffic growth within 3-6 months. We always set clear, realistic timelines upfront so there are no surprises.",
  },
  {
    question: "I don't have a huge budget. Can you still help?",
    answer: "Absolutely. We work with businesses of all sizes and love helping growing brands scale smartly. We'll recommend a strategy that fits your budget, whether that's starting with local SEO or running lean, high-converting ad campaigns, and scale up as your revenue grows.",
  },
  {
    question: "Do I need to sign a long-term contract?",
    answer: "No lock-in contracts. We offer flexible month-to-month engagements because we believe our results should earn your business, not a contract. That said, strategies like SEO work best with a 3-6 month commitment for compounding results.",
  },
  {
    question: "Will you manage everything, or do I need to be involved?",
    answer: "We handle the heavy lifting: strategy, execution, optimization, and reporting. All we need from you is an initial onboarding session to understand your business deeply, and a quick check-in every week or two. You stay in the loop without the workload.",
  },
  {
    question: "How do I know my ad budget isn't being wasted?",
    answer: "Every rupee is tracked. We set up proper conversion tracking from day one and share transparent reports showing cost-per-lead, return on ad spend, and which campaigns are driving real revenue, not just clicks. If something isn't working, we pivot fast.",
  },
  {
    question: "Can you help me if I'm just starting out and have no online presence?",
    answer: "That's actually our sweet spot. We've helped multiple businesses go from zero to a strong digital presence, from building their brand identity and website to launching their first ad campaigns. We'll create a phased roadmap so you're not overwhelmed.",
  },
  {
    question: "What makes a founder-led agency better for me?",
    answer: "When you work with us, you're talking to decision-makers who genuinely care about your growth, not layers of account managers. This means faster turnarounds, sharper strategy, and a team that treats your business like their own.",
  },
];
