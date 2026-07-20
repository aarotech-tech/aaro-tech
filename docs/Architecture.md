# Architecture Overview

## Stack
- **Framework**: Next.js (App Router)
- **Deployment**: Vercel
- **Database**: Neon (Serverless Postgres) with Drizzle ORM
- **Auth**: Clerk
- **Payments**: Stripe
- **Storage**: UploadThing
- **Email**: Resend

## Patterns
- Server Actions for data mutations (wrapped in `withActionErrorHandling`)
- Redis for caching specific heavy queries
- React Server Components (RSC) for optimized initial loads