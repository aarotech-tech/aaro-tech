# Authorization

Authorization logic is located in `src/lib/auth.ts`.

## Core Functions
- `requireAuthenticatedUser()`: Ensures active Clerk session.
- `requireInternalUser()`: Ensures the user is a staff member.
- `requireOrganizationMember(orgId)`: Ensures the user belongs to a specific client organization.

> [!WARNING]
> Never trust client-provided Organization IDs without verifying membership via `requireOrganizationMember`.