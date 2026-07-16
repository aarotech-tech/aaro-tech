# Production Content Requirements Document: Aarotech

This document serves as the master checklist for collecting all real business information before launch. Every placeholder, fake value, and mock data point across the Next.js project has been documented here.

## 1. Company Information

| Item | Required | Current Status | File(s) | Priority |
|------|----------|---------------|----------|----------|
| Company Name | Official legal and brand name | COMPLETE (`Aarotech`) | `src/app/layout.tsx`, `seo.ts` | P0 |
| Tagline | Short brand tagline | MOCK | `src/app/layout.tsx` | P1 |
| Short Description | 1-2 sentence description | MOCK (Generic text) | `src/app/layout.tsx` | P0 |
| Long Description | Full company about text | MISSING | `src/data/content.ts` | P1 |
| Mission & Vision | Core company goals | MISSING | `src/data/content.ts` | P1 |
| Company Story | Background/Founding story | MISSING | N/A | P2 |
| Years of Experience | Numeric value | MISSING | `src/app/page.tsx` | P2 |
| Team Size | Numeric value | MISSING | N/A | P3 |
| Office Address | Physical operating address | MOCK | `src/components/layout/Footer.tsx` | P0 |
| Business Hours | Open/Close times | MISSING | `src/components/layout/Footer.tsx` | P1 |
| Google Maps URL | Direct link to GBP map | MISSING | `src/components/layout/Footer.tsx` | P1 |
| Email | Primary contact email | MOCK (`you@company.com`) | `src/components/shared/ContactForm.tsx` | P0 |
| Phone Number | Primary phone | MOCK (`+91 98765 43210`) | `src/lib/seo.ts` | P0 |
| WhatsApp Number | WA Business number | MOCK (`+91 98765 43210`) | `src/components/layout/WhatsAppButton.tsx` | P0 |
| Social Media Links | LinkedIn, Twitter, FB, IG | MISSING/MOCK | `src/components/layout/Footer.tsx` | P1 |
| Google Business Profile | GBP Link | MISSING | `src/lib/seo.ts` | P1 |
| GST | Tax Identification Number | MISSING | `src/app/(admin)/crm/finance/page.tsx` | P0 |

## 2. Branding

| Item | Required | Current Status | File(s) | Priority |
|------|----------|---------------|----------|----------|
| Primary Logo | High-res transparent PNG/SVG | MOCK (`footer-logo-primary.png`) | `src/components/layout/Header.tsx` | P0 |
| Favicon | .ico / .png for browser tab | COMPLETE (`icon.png`) | `src/app/icon.png` | P0 |
| Brand Colors | Hex codes (Primary/Secondary) | MOCK (`slate` theme used) | `tailwind.config.ts` | P0 |
| Fonts | Primary and Secondary Fonts | COMPLETE (`Inter`) | `src/app/layout.tsx` | P0 |
| Brand Guidelines | Document for consistency | MISSING | N/A | P2 |
| Hero Images | High-res background/hero images | MOCK (`placeholder.svg`) | `src/app/page.tsx` | P0 |
| Team Photos | Professional headshots | MOCK (`/images/crew/*.jpeg`) | `src/data/content.ts` | P1 |

## 3. Services

*All current services in `src/data/content.ts` (Content Creation, Social Media, Digital Advertising, Branding, Web Dev, SEO) require real data.*

| Item | Required | Current Status | File(s) | Priority |
|------|----------|---------------|----------|----------|
| Service Descriptions | 100-200 word technical description | MOCK (Shallow text) | `src/data/content.ts` | P0 |
| Service Benefits | 3-5 clear bullet points | MOCK | `src/data/content.ts` | P0 |
| Delivery Process | Step-by-step workflow | MOCK (`processSteps`) | `src/data/content.ts` | P1 |
| Pricing / Plans | Base pricing or "Starting at" | MISSING | `src/data/content.ts` | P1 |
| Service FAQs | 5-7 specific Q&As per service | MISSING for most | `src/data/content.ts` | P1 |
| CTA Text | Unique Call-To-Action per service | MOCK | `src/data/content.ts` | P0 |

## 4. Portfolio (Case Studies)

*Current Case Studies in `src/data/content.ts` (CS-1, CS-2, CS-3) are generic placeholders.*

| Item | Required | Current Status | File(s) | Priority |
|------|----------|---------------|----------|----------|
| Client Name | Real client/company name | MOCK ("Healthcare Client") | `src/data/content.ts` | P0 |
| Industry | Client industry | MOCK | `src/data/content.ts` | P0 |
| Problem | Initial challenge faced | MOCK (Generic text) | `src/data/content.ts` | P0 |
| Solution | Exact services provided | MOCK | `src/data/content.ts` | P0 |
| Outcomes / Metrics | Hard numbers (e.g., +210% ROI) | MOCK | `src/data/content.ts` | P0 |
| Case Study Images | Real campaign/website screenshots | MOCK (`/images/showcase/*.jpeg`) | `src/data/content.ts` | P0 |
| Client Logo | Permission to use logo | MOCK (`tosh.jpeg`, etc.) | `src/data/content.ts` | P1 |

## 5. Testimonials

| Item | Required | Current Status | File(s) | Priority |
|------|----------|---------------|----------|----------|
| Client Name | Full name of reviewer | MOCK | `src/data/content.ts` | P0 |
| Company | Reviewer's company | MOCK | `src/data/content.ts` | P0 |
| Designation | Job Title | MOCK | `src/data/content.ts` | P1 |
| Review Text | Exact quote/testimonial | MOCK | `src/data/content.ts` | P0 |
| Photo | Headshot of reviewer | MOCK (`client-logos/*.jpeg`)| `src/data/content.ts` | P1 |
| Rating | Star rating (out of 5) | MISSING | `src/data/content.ts` | P1 |

## 6. Blog

*There are 3 semi-real articles and 17 explicitly auto-generated placeholder articles in `src/data/blog.ts`.*

| Item | Required | Current Status | File(s) | Priority |
|------|----------|---------------|----------|----------|
| Real Articles (x20) | Replace 17 placeholder topics | MOCK | `src/data/blog.ts` | P0 |
| Authors | Real names and bios | MOCK ("Aarotech Strategy Team") | `src/data/blog.ts` | P0 |
| Publish Dates | Accurate chronological dates | MOCK (Future 2026 dates) | `src/data/blog.ts` | P0 |
| Featured Images | High-quality thumbnails | MOCK (`placeholder.svg`) | `src/components/blog/BlogPostLayout.tsx` | P0 |
| Internal Links | Links to relevant services | MISSING | `src/data/blog.ts` | P1 |

## 7. Team

| Item | Required | Current Status | File(s) | Priority |
|------|----------|---------------|----------|----------|
| Full Names | Suriyanarayanan, Aaron, Susinthiran | COMPLETE | `src/data/content.ts` | P0 |
| Roles | Exact job titles | COMPLETE | `src/data/content.ts` | P0 |
| Bios | Real background / experience | MOCK / Generic | `src/data/content.ts` | P1 |
| LinkedIn URLs | Direct links to profiles | MISSING (Empty strings) | `src/data/content.ts` | P1 |
| Team Photos | Real headshots | MOCK (`*.jpeg`) | `src/data/content.ts` | P0 |

## 8. Contact

| Item | Required | Current Status | File(s) | Priority |
|------|----------|---------------|----------|----------|
| Contact Emails | Sales, Support, General | MOCK | `src/components/shared/ContactForm.tsx` | P0 |
| Calendly URL | For booking strategy calls | MISSING | N/A | P1 |
| Emergency Contact | Urgent client support | MISSING | N/A | P2 |

## 9. SEO

| Item | Required | Current Status | File(s) | Priority |
|------|----------|---------------|----------|----------|
| Global Title | Site-wide title | COMPLETE | `src/app/layout.tsx` | P0 |
| Global Description | Site-wide meta description | MOCK (Generic) | `src/app/layout.tsx` | P0 |
| OG Image | Social sharing image | MOCK | `src/app/opengraph-image.tsx` | P0 |
| Location Page Data | Unique content for city pages | MOCK (Duplicate pages) | `src/app/locations/[city]/page.tsx` | P0 |
| Industry Page Data | Unique content for industries | MOCK | `src/data/content.ts` | P0 |

## 10. CRM

*The CRM (`src/app/(admin)/crm`) has mock data baked into the Server Actions.*

| Item | Required | Current Status | File(s) | Priority |
|------|----------|---------------|----------|----------|
| Invoice Prefix | e.g. "AARO-2026-" | MISSING | `src/app/(admin)/crm/finance/page.tsx` | P0 |
| Payment Methods | Bank Details, UPI, Stripe keys | MISSING | `src/app/(admin)/crm/finance/page.tsx` | P0 |
| Invoice Footer | Terms, Tax info | MISSING | `src/app/(admin)/crm/finance/page.tsx` | P0 |
| Automated AI Prompts| Real CRM proposal templates | MOCK (`mockAIResponse`) | `crm/proposals/[proposalId]/actions.ts` | P0 |

## 11. Legal

| Item | Required | Current Status | File(s) | Priority |
|------|----------|---------------|----------|----------|
| Privacy Policy | Legally compliant text | MISSING/MOCK | `src/app/privacy-policy/page.tsx` | P0 |
| Terms of Service | Legally compliant text | MISSING/MOCK | `src/app/terms/page.tsx` | P0 |
| Refund Policy | Specific to digital services | MISSING | N/A | P0 |
| Cookie Banner Text | Consent description | MISSING | N/A | P1 |

## 12. Media

| Item | Required | Current Status | File(s) | Priority |
|------|----------|---------------|----------|----------|
| Client Logos (High-res)| Transparent PNG/SVGs | MOCK (`tosh.jpeg` etc.)| `src/data/content.ts` | P0 |
| Case Study Images | Real screenshots/graphs | MOCK (`placeholder.svg`) | `src/data/content.ts` | P0 |
| Blog Thumbnails | Real custom graphics | MOCK (`placeholder.svg`) | `src/components/blog/BlogPostLayout.tsx` | P0 |

## 13. Configuration

| Item | Required | Current Status | File(s) | Priority |
|------|----------|---------------|----------|----------|
| Production Domain | `NEXT_PUBLIC_SITE_URL` | COMPLETE | `src/app/layout.tsx` | P0 |
| Google Analytics ID | `NEXT_PUBLIC_GA_ID` | COMPLETE (via ENV) | `src/app/layout.tsx` | P0 |
| GTM ID | `NEXT_PUBLIC_GTM_ID` | COMPLETE (via ENV) | `src/app/layout.tsx` | P0 |
| Clarity ID | `NEXT_PUBLIC_CLARITY_ID` | COMPLETE (via ENV) | `src/app/layout.tsx` | P0 |
| SMTP / Email Service| SendGrid/Resend API Keys | MISSING | `src/components/shared/ContactForm.tsx` | P0 |
| Meta Pixel | FB Tracking ID | MISSING | N/A | P1 |
| DB Connection String| Neon Postgres URL | COMPLETE (via ENV) | `.env.local` | P0 |
| Clerk Auth Keys | Clerk Prod Keys | COMPLETE (via ENV) | `.env.local` | P0 |
