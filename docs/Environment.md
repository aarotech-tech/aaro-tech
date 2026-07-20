# Environment Variables

Refer to `src/env.ts` for the single source of truth regarding required environment variables. The application will fail to start in production if any required variable is missing.

## Local Setup
Copy `.env.example` to `.env.local` and fill in your development keys for Neon, Clerk, Stripe, etc.