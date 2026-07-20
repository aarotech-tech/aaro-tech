# Stripe Integration

Stripe handles all billing, retainers, and invoice generation.

## Webhooks
Webhooks are crucial. They must be configured in the Stripe Dashboard to point to our production endpoint `/api/webhooks/stripe`. Ensure the `STRIPE_WEBHOOK_SECRET` is updated in Vercel to allow signature verification.