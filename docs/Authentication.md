# Authentication

We use Clerk for all authentication needs.

## Roles
- **Internal Users**: Managed via Clerk metadata or DB `userType: "internal"`. They have access to the `/crm` admin panel.
- **Client Users**: Managed via Clerk Organizations. A client user belongs to an organization.

## Configuration
Requires `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` and `CLERK_SECRET_KEY`.