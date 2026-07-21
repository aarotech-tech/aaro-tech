# Aarotech Enterprise Platform — Radical Product UX & IA Audit

**Role:** Head of Product Design / Enterprise UX Architect  
**Goal:** Tear down the existing product assumptions and rebuild the Information Architecture (IA) and workflows from the ground up, optimizing exclusively for how high-performing agency teams actually operate. 

---

## 1. The Fundamental IA Tear-Down: The "CRM" Fallacy

**The Critical Flaw:** The current product assumes *everything* an agency does is "CRM". It places leads, projects, invoices, and deliverables all under a single `/crm` namespace. This is fundamentally wrong and a catastrophic UX failure for scalability.

* **CRM (Customer Relationship Management)** is for pre-sales. It ends the moment a deal is won.
* **Delivery** is post-sales. A Project Manager does not care about the sales pipeline. 
* **Finance** is operational. An accountant should never have to click into a "CRM" to find an invoice.

**The Verdict:** We are dismantling the `/crm` monolith. The product must be split into dedicated **Workspaces** that map to actual agency departments.

---

## 2. Dashboard Audit: Is it actually a Dashboard?

**Current State (Assumed):** The current "Dashboard" is likely a glorified list of recent activity or a flat table of metrics that serve no specific role. 

**The Challenge:** A true dashboard drives *action*, not just reporting. If a user looks at a dashboard and doesn't immediately know what they need to do next, it's a failure.

**The Redesign:** We are killing the generic "Dashboard" and replacing it with Role-Specific Command Centers:

1. **Sales Command Center (The Pipeline):** 
   - *KPIs:* Deals at Risk, Uncontacted Leads, Weekly Quota Progress.
   - *Action:* "You have 3 leads that have been waiting > 24 hours."
2. **Delivery Command Center (The Blockers):** 
   - *KPIs:* Deliverables Awaiting Client Approval, Overdue Tasks, Team Utilization.
   - *Action:* "Client X rejected Deliverable Y. Reassign to Design."
3. **Finance Command Center (The Ledger):** 
   - *KPIs:* Overdue Invoices, Expected MRR this month, Unrecognized Revenue.
   - *Action:* "Send reminder for Invoice #102."
4. **Client Hub Home (External):** 
   - *KPIs:* None. Clients don't want KPIs. 
   - *Action:* "You have 1 Invoice Due" and "2 Designs to Approve." Period.

---

## 3. Labeling & Terminology Audit

We must challenge every noun in the system. Agency terminology must be universally understood.

| Current Label | Proposed Label | Why we are changing it |
| :--- | :--- | :--- |
| **Portal** | **Client Workspace** or **Hub** | "Portal" feels like a 2010 legacy IT ticketing system. "Workspace" implies collaboration. |
| **Finance** | **Billing** | To clients, it's "Billing". To internal teams, it's "Revenue" or "Finance". Keep the internal/external labels distinct. |
| **KB** | **Help Center** | "Knowledge Base" is too technical. Clients want "Help". |
| **Deal** | **Opportunity** | "Deal" is fine, but "Opportunity" is the enterprise standard (Salesforce/HubSpot). We can stick to Deal if we want a modern Linear feel. |
| **Deliverable** | **Review Item** (Client facing) | Internally it's a deliverable. To a client, it's simply an item requiring their review. |

---

## 4. User Journey Teardowns

### Journey 1: The Account Executive (Sales)
- **The Broken Way:** Log in -> Click CRM -> Hunt through a sidebar mixed with Projects and Invoices -> Find Deals -> Try to figure out what needs attention.
- **The Optimized Way:** Log in -> Land directly on the **Sales Workspace**. The default view is the Kanban Pipeline. Red badges indicate stalled deals. Global 'Cmd+K' allows instant proposal generation.

### Journey 2: The Client Approver
- **The Broken Way:** Receive email -> Log in -> See a generic dashboard -> Click "Deliverables" -> Figure out which one changed -> Leave a comment.
- **The Optimized Way:** Receive deep-link email -> Click link (magic auth) -> Land exactly on the Deliverable detail view -> Big green "Approve" button or red "Request Changes" button. Friction is zero.

---

## 5. Entity Placement & The "Who Owns What" Matrix

Entities must live where they are created and managed.

- **Lead / Opportunity / Proposal** -> **Sales Workspace**. (Strictly pre-revenue).
- **Project / Task / Deliverable / Retainer** -> **Delivery Workspace**. (Strictly execution).
- **Invoice / Payment / Subscription** -> **Finance Workspace**. (Strictly money).
- **Organization / Contact / Assets** -> **Directory**. (Shared globally, but managed here).

---

## 6. Critical Missing Workflows & Gaps

We are optimizing for how agencies *actually* work. The current system is missing:

1. **The "Handoff" Workflow:** There is no concept of a Deal converting to a Project. When a proposal is signed, it should instantly spawn a Project template and alert the Delivery team.
2. **Draft vs. Published States:** Project Managers need to draft deliverables internally *before* the client sees them. If a deliverable is created, is it instantly visible? We need a strict "Internal Review" -> "Awaiting Client" status pipeline.
3. **Command Palette (Cmd+K):** Enterprise users don't use mice to navigate 4 levels deep. They hit Cmd+K and type "Go to Project Acme".
4. **Saved Views:** A PM managing 40 projects needs to save a view called "My High Priority Projects". 

---

## 7. The Final Radically Redesigned Product Map

This is the definitive Information Architecture that Aarotech must adopt.

### **Global Navigation (Always Visible)**
- **Global Search (Cmd+K)**
- **Inbox** (Aggregated notifications: Approvals, Mentions, Payments)

### **Workspace: Sales**
- **Overview** (Sales Command Center)
- **Leads** (List View: Unqualified)
- **Pipeline** (Kanban View: Qualified Opportunities)
- **Proposals** (Draft & Sent Contracts)

### **Workspace: Delivery**
- **Overview** (Operations Command Center)
- **Projects** (Active Client Engagements)
- **Tasks** (Granular internal execution)
- **Reviews** (Global queue of all deliverables awaiting internal/external approval)

### **Workspace: Finance**
- **Overview** (Revenue Command Center)
- **Invoices** (Accounts Receivable)
- **Payments** (Ledger)

### **Workspace: Directory (The Source of Truth)**
- **Organizations** (The central hub for a Client. Clicking an Org shows their active Deals, Projects, and Invoices all in one 360-degree view).
- **Contacts** 

### **Workspace: System**
- **Settings**
- **Automations**

---

## 8. Implementation Impact & Strategy

This is a structural tear-down.

- **Breaking Change:** Moving the physical routes from `src/app/(admin)/crm/*` to `src/app/(admin)/sales/*`, `src/app/(admin)/delivery/*`, etc. 
- **High Impact (Positive):** This completely eliminates cognitive overload for users. A salesperson never has to see a task; a PM never has to see a lead. 
- **Recommendation:** Do not write a single line of business logic until the Next.js App Router folders perfectly mirror the Product Map outlined in Section 7. The folder structure *is* the Information Architecture.
