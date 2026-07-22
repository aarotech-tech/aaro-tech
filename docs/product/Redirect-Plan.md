# Route Migration & Redirect Plan

As part of the incremental monolith dismantling strategy, legacy routes will be redirected to their target bounded contexts only *after* the new implementation is validated.

## Redirection Mapping Table

| Legacy Route (Source) | Target Route (Destination) | Workspace Owner | Status |
| :--- | :--- | :--- | :--- |
| `/crm/leads` | `/sales/leads` | Sales | Pending Migration |
| `/crm` (Root Pipeline) | `/sales/pipeline` | Sales | Pending Migration |
| `/crm/proposals` | `/sales/proposals` | Sales | Pending Migration |
| `/crm/projects` | `/delivery/projects` | Delivery | Pending Migration |
| `/crm/tasks` | `/delivery/tasks` | Delivery | Pending Migration |
| `/crm/deliverables` | `/delivery/reviews` | Delivery | Pending Migration |
| `/crm/billing` | `/finance/invoices` | Finance | Pending Migration |
| `/crm/finance` | `/finance/payments` | Finance | Pending Migration |
| `/crm/contacts` | `/directory/contacts` | Directory | Pending Migration |
| `/crm/clients` | `/directory/organizations` | Directory | Pending Migration |
| `/crm/automations` | `/settings/automations` | Settings | Pending Migration |
| `/crm/kb` | *Deprecated* | None | To be removed |

## Implementation Mechanism
Once a workspace epic (e.g., Epic 2: Sales) is completed and validated:
1.  We will add the relevant mappings to `next.config.ts` using the `redirects()` function:
    ```javascript
    async redirects() {
      return [
        {
          source: '/crm/leads/:path*',
          destination: '/sales/leads/:path*',
          permanent: true,
        },
        // ...
      ]
    }
    ```
2.  The legacy source code in `src/app/(admin)/crm/leads` will be deleted.
3.  Any deep links referencing the old `/crm/leads` will gracefully land in `/sales/leads`.
