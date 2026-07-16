import {
  pgTable,
  uuid,
  varchar,
  text,
  timestamp,
  integer,
  primaryKey,
} from "drizzle-orm/pg-core";

export const organizations = pgTable("organizations", {
  id: uuid("id").primaryKey().defaultRandom(),
  clerkOrgId: varchar("clerk_org_id", { length: 255 }).unique().notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 255 }).unique().notNull(),
  logoUrl: text("logo_url"),
  type: varchar("type", { length: 50 }).default("client"), // internal, client, lead
  healthScore: integer("health_score").default(100),
  createdAt: timestamp("created_at").defaultNow(),
});

export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  clerkId: varchar("clerk_id", { length: 255 }).unique().notNull(),
  email: varchar("email", { length: 255 }).unique().notNull(),
  firstName: varchar("first_name", { length: 255 }),
  lastName: varchar("last_name", { length: 255 }),
  role: varchar("role", { length: 50 }).default("client"), // superadmin, employee, client
  avatarUrl: text("avatar_url"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const organizationMembers = pgTable(
  "organization_members",
  {
    userId: uuid("user_id")
      .references(() => users.id, { onDelete: "cascade" })
      .notNull(),
    organizationId: uuid("organization_id")
      .references(() => organizations.id, { onDelete: "cascade" })
      .notNull(),
    role: varchar("role", { length: 50 }).notNull(), // admin, member
    createdAt: timestamp("created_at").defaultNow(),
  },
  (t) => ({
    pk: primaryKey({ columns: [t.userId, t.organizationId] }),
  })
);

export const deals = pgTable("deals", {
  id: uuid("id").primaryKey().defaultRandom(),
  organizationId: uuid("organization_id").references(() => organizations.id, { onDelete: "cascade" }).notNull(), // The Lead
  ownerId: uuid("owner_id").references(() => users.id, { onDelete: "set null" }), // The Sales Agent
  name: varchar("name", { length: 255 }).notNull(),
  stage: varchar("stage", { length: 50 }).default("discovery"), 
  value: integer("value").default(0), // Deal value
  expectedCloseDate: timestamp("expected_close_date"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const proposals = pgTable("proposals", {
  id: uuid("id").primaryKey().defaultRandom(),
  dealId: uuid("deal_id").references(() => deals.id, { onDelete: "cascade" }).notNull(),
  status: varchar("status", { length: 50 }).default("draft"), // draft, sent, accepted, rejected
  documentData: text("document_data"), // JSON or Markdown
  pdfUrl: text("pdf_url"), // Cloudflare R2 link
  
  // Phase 10: Approvals Engine
  approvedAt: timestamp("approved_at"),
  approvedByIp: varchar("approved_by_ip", { length: 45 }),
  signatureText: varchar("signature_text", { length: 255 }),
  
  createdAt: timestamp("created_at").defaultNow(),
});

export const clientAssets = pgTable("client_assets", {
  id: uuid("id").primaryKey().defaultRandom(),
  organizationId: uuid("organization_id").references(() => organizations.id, { onDelete: "cascade" }).notNull(),
  uploadedById: uuid("uploaded_by_id").references(() => users.id, { onDelete: "set null" }),
  name: varchar("name", { length: 255 }).notNull(),
  fileType: varchar("file_type", { length: 50 }).notNull(), // pdf, image, csv
  fileUrl: text("file_url").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const projects = pgTable("projects", {
  id: uuid("id").primaryKey().defaultRandom(),
  organizationId: uuid("organization_id").references(() => organizations.id, { onDelete: "cascade" }).notNull(),
  dealId: uuid("deal_id").references(() => deals.id, { onDelete: "set null" }), // The won deal that spawned this project
  name: varchar("name", { length: 255 }).notNull(),
  status: varchar("status", { length: 50 }).default("active"), // active, paused, completed
  health: varchar("health", { length: 50 }).default("green"), // green, yellow, red
  createdAt: timestamp("created_at").defaultNow(),
});

export const tasks = pgTable("tasks", {
  id: uuid("id").primaryKey().defaultRandom(),
  projectId: uuid("project_id").references(() => projects.id, { onDelete: "cascade" }).notNull(),
  assigneeId: uuid("assignee_id").references(() => users.id, { onDelete: "set null" }),
  title: varchar("title", { length: 255 }).notNull(),
  status: varchar("status", { length: 50 }).default("todo"), // todo, in_progress, done
  dueDate: timestamp("due_date"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const knowledgeBase = pgTable("knowledge_base", {
  id: uuid("id").primaryKey().defaultRandom(),
  title: varchar("title", { length: 255 }).notNull(),
  content: text("content"), // Markdown SOP content
  category: varchar("category", { length: 100 }), // e.g., "SEO", "Sales", "Onboarding"
  createdAt: timestamp("created_at").defaultNow(),
});

export const invoices = pgTable("invoices", {
  id: uuid("id").primaryKey().defaultRandom(),
  organizationId: uuid("organization_id").references(() => organizations.id, { onDelete: "cascade" }).notNull(),
  dealId: uuid("deal_id").references(() => deals.id, { onDelete: "set null" }),
  amount: integer("amount").notNull(), // Amount in dollars
  status: varchar("status", { length: 50 }).default("pending"), // pending, paid, overdue, cancelled
  dueDate: timestamp("due_date").notNull(),
  invoiceUrl: text("invoice_url"), // Link to PDF or Stripe
  createdAt: timestamp("created_at").defaultNow(),
});

export const automationLogs = pgTable("automation_logs", {
  id: uuid("id").primaryKey().defaultRandom(),
  jobName: varchar("job_name", { length: 255 }).notNull(), // e.g., "deal-won-alert", "generate-pdf"
  status: varchar("status", { length: 50 }).default("queued"), // queued, running, success, failed
  payload: text("payload"), // JSON payload
  errorMessage: text("error_message"),
  completedAt: timestamp("completed_at"),
  createdAt: timestamp("created_at").defaultNow(),
});
export const trackingEvents = pgTable("tracking_events", {
  id: uuid("id").primaryKey().defaultRandom(),
  organizationId: uuid("organization_id").references(() => organizations.id).notNull(),
  entityType: varchar("entity_type", { length: 50 }).notNull(), // 'proposal', 'invoice'
  entityId: uuid("entity_id").notNull(),
  eventType: varchar("event_type", { length: 50 }).notNull(), // 'viewed', 'downloaded'
  createdAt: timestamp("created_at").defaultNow(),
});

export const websiteLeads = pgTable("website_leads", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 255 }).notNull(),
  businessName: varchar("business_name", { length: 255 }),
  email: varchar("email", { length: 255 }).unique().notNull(), // Unique to prevent simple duplicates
  phone: varchar("phone", { length: 50 }),
  challenge: text("challenge"),
  status: varchar("status", { length: 50 }).default("new"), // new, contacted, archived
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});
