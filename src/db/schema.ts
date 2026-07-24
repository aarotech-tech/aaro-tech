import {
  pgTable,
  uuid,
  varchar,
  text,
  timestamp,
  integer,
  primaryKey,
  boolean,
  jsonb,
  index,
  uniqueIndex
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

export const organizations = pgTable("organizations", {
  id: uuid("id").primaryKey().defaultRandom(),
  clerkOrgId: varchar("clerk_org_id", { length: 255 }).unique().notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 255 }).unique().notNull(),
  logoUrl: text("logo_url"),
  type: varchar("type", { length: 50 }).default("client"), // internal, client, lead
  status: varchar("status", { length: 50 }).default("lead"), // lead, prospect, client, archived
  healthScore: integer("health_score").default(100),
    taxId: varchar("tax_id", { length: 100 }),
  address: varchar("address", { length: 255 }),
  city: varchar("city", { length: 100 }),
  country: varchar("country", { length: 100 }),
  deletedAt: timestamp("deleted_at"),
    createdBy: uuid("created_by").references(() => users.id, { onDelete: "set null" }),
  updatedBy: uuid("updated_by").references(() => users.id, { onDelete: "set null" }),
  deletedBy: uuid("deleted_by").references(() => users.id, { onDelete: "set null" }),
  updatedAt: timestamp("updated_at").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  clerkId: varchar("clerk_id", { length: 255 }).unique().notNull(),
  email: varchar("email", { length: 255 }).unique().notNull(),
  firstName: varchar("first_name", { length: 255 }),
  lastName: varchar("last_name", { length: 255 }),
  role: varchar("role", { length: 50 }).default("client"), // superadmin, employee, client
  userType: varchar("user_type", { length: 50 }).default("client"), // internal, client
  globalRole: varchar("global_role", { length: 50 }), // owner, admin, manager, staff
  status: varchar("status", { length: 50 }).default("active"), // active, suspended
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
    orgIdx: index("org_members_org_idx").on(t.organizationId),
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
    deletedAt: timestamp("deleted_at"),
    createdBy: uuid("created_by").references(() => users.id, { onDelete: "set null" }),
  updatedBy: uuid("updated_by").references(() => users.id, { onDelete: "set null" }),
  deletedBy: uuid("deleted_by").references(() => users.id, { onDelete: "set null" }),
  updatedAt: timestamp("updated_at").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
}, (t) => ({
  orgIdx: index("deals_organization_id_idx").on(t.organizationId),
  ownerIdx: index("deals_owner_id_idx").on(t.ownerId),
}));

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
  expiresAt: timestamp("expires_at"),
  
  createdAt: timestamp("created_at").defaultNow(),
}, (t) => ({
  dealIdx: index("proposals_deal_id_idx").on(t.dealId),
}));

export const clientAssets = pgTable("client_assets", {
  id: uuid("id").primaryKey().defaultRandom(),
  organizationId: uuid("organization_id").references(() => organizations.id, { onDelete: "cascade" }).notNull(),
  uploadedById: uuid("uploaded_by_id").references(() => users.id, { onDelete: "set null" }),
  name: varchar("name", { length: 255 }).notNull(),
  fileType: varchar("file_type", { length: 50 }).notNull(), // pdf, image, csv
  fileUrl: text("file_url").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
}, (t) => ({
  orgIdx: index("client_assets_org_idx").on(t.organizationId),
}));

export const projects = pgTable("projects", {
  id: uuid("id").primaryKey().defaultRandom(),
  organizationId: uuid("organization_id").references(() => organizations.id, { onDelete: "cascade" }).notNull(),
  dealId: uuid("deal_id").references(() => deals.id, { onDelete: "set null" }), // The won deal that spawned this project
  name: varchar("name", { length: 255 }).notNull(),
  status: varchar("status", { length: 50 }).default("active"), // active, paused, completed
  health: varchar("health", { length: 50 }).default("green"), // green, yellow, red
    value: integer("value"),
  expectedDeliveryDate: timestamp("expected_delivery_date"),
  deletedAt: timestamp("deleted_at"),
  ownerId: uuid("owner_id").references(() => users.id, { onDelete: "set null" }),
    createdBy: uuid("created_by").references(() => users.id, { onDelete: "set null" }),
  updatedBy: uuid("updated_by").references(() => users.id, { onDelete: "set null" }),
  deletedBy: uuid("deleted_by").references(() => users.id, { onDelete: "set null" }),
  updatedAt: timestamp("updated_at").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
}, (t) => ({
  orgIdx: index("projects_org_idx").on(t.organizationId),
}));

export const tasks = pgTable("tasks", {
  id: uuid("id").primaryKey().defaultRandom(),
  projectId: uuid("project_id").references(() => projects.id, { onDelete: "cascade" }).notNull(),
  assigneeId: uuid("assignee_id").references(() => users.id, { onDelete: "set null" }),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  status: varchar("status", { length: 50 }).default("todo"), // backlog, todo, in_progress, review, completed
  dueDate: timestamp("due_date"),
  priority: varchar("priority", { length: 50 }).default("medium"),
  labels: jsonb("labels"), // array of strings or objects
  attachments: jsonb("attachments"), // array of file objects
  completedAt: timestamp("completed_at"),
  deletedAt: timestamp("deleted_at"),
  createdBy: uuid("created_by").references(() => users.id, { onDelete: "set null" }),
  updatedBy: uuid("updated_by").references(() => users.id, { onDelete: "set null" }),
  updatedAt: timestamp("updated_at").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const milestones = pgTable("milestones", {
  id: uuid("id").primaryKey().defaultRandom(),
  projectId: uuid("project_id").references(() => projects.id, { onDelete: "cascade" }).notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  status: varchar("status", { length: 50 }).default("pending"), // pending, completed
  dueDate: timestamp("due_date"),
  completedAt: timestamp("completed_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const taskComments = pgTable("task_comments", {
  id: uuid("id").primaryKey().defaultRandom(),
  taskId: uuid("task_id").references(() => tasks.id, { onDelete: "cascade" }).notNull(),
  userId: uuid("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  text: text("text").notNull(),
  visibility: varchar("visibility", { length: 50 }).default("client_visible"), // client_visible, internal_only
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const knowledgeBase = pgTable("knowledge_base", {
  id: uuid("id").primaryKey().defaultRandom(),
  title: varchar("title", { length: 255 }).notNull(),
  content: text("content"), // Markdown SOP content
  category: varchar("category", { length: 100 }), // e.g., "SEO", "Sales", "Onboarding"
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
  organizationId: uuid("organization_id").references(() => organizations.id, { onDelete: "cascade" }).notNull(),
  entityType: varchar("entity_type", { length: 50 }).notNull(), // 'proposal', 'invoice'
  entityId: uuid("entity_id").notNull(),
  eventType: varchar("event_type", { length: 50 }).notNull(), // 'viewed', 'downloaded'
  createdAt: timestamp("created_at").defaultNow(),
}, (t) => ({
  orgIdx: index("tracking_events_org_idx").on(t.organizationId),
}));

export const websiteLeads = pgTable("website_leads", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 255 }).notNull(),
  businessName: varchar("business_name", { length: 255 }),
  email: varchar("email", { length: 255 }).unique().notNull(), // Unique to prevent simple duplicates
  phone: varchar("phone", { length: 50 }),
  websiteUrl: text("website_url"), // Optional website URL
  challenge: text("challenge"),
  status: varchar("status", { length: 50 }).default("new"), // new, contacted, archived
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (t) => ({
  emailIdx: uniqueIndex("website_leads_email_idx").on(t.email),
}));

export const organizationStatusHistory = pgTable("organization_status_history", {
  id: uuid("id").primaryKey().defaultRandom(),
  organizationId: uuid("organization_id").references(() => organizations.id, { onDelete: "cascade" }).notNull(),
  fromStatus: varchar("from_status", { length: 50 }).notNull(),
  toStatus: varchar("to_status", { length: 50 }).notNull(),
  changedById: uuid("changed_by_id").references(() => users.id, { onDelete: "set null" }),
  createdAt: timestamp("created_at").defaultNow(),
});

export const contacts = pgTable("contacts", {
  id: uuid("id").primaryKey().defaultRandom(),
  organizationId: uuid("organization_id").references(() => organizations.id, { onDelete: "cascade" }).notNull(),
  userId: uuid("user_id").references(() => users.id, { onDelete: "set null" }), // Link to portal user if active
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }).notNull(),
  phone: varchar("phone", { length: 50 }),
  createdAt: timestamp("created_at").defaultNow(),
  deletedAt: timestamp("deleted_at"),
}, (t) => ({
  orgEmailIdx: uniqueIndex("contacts_org_email_idx").on(t.organizationId, t.email),
}));

export const services = pgTable("services", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  basePrice: integer("base_price").default(0).notNull(),
  isActive: boolean("is_active").default(true).notNull(),
});

export const dealLineItems = pgTable("deal_line_items", {
  id: uuid("id").primaryKey().defaultRandom(),
  dealId: uuid("deal_id").references(() => deals.id, { onDelete: "cascade" }).notNull(),
  serviceId: uuid("service_id").references(() => services.id, { onDelete: "set null" }),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  quantity: integer("quantity").default(1).notNull(),
  unitPrice: integer("unit_price").default(0).notNull(),
  total: integer("total").default(0).notNull(),
  isRecurring: boolean("is_recurring").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const clientOnboardings = pgTable("client_onboardings", {
  id: uuid("id").primaryKey().defaultRandom(),
  organizationId: uuid("organization_id").references(() => organizations.id, { onDelete: "cascade" }).notNull(),
  status: varchar("status", { length: 50 }).default("pending"), // pending, completed
  createdAt: timestamp("created_at").defaultNow(),
});

export const onboardingSteps = pgTable("onboarding_steps", {
  id: uuid("id").primaryKey().defaultRandom(),
  onboardingId: uuid("onboarding_id").references(() => clientOnboardings.id, { onDelete: "cascade" }).notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  status: varchar("status", { length: 50 }).default("pending"), // pending, completed
  dataPayload: jsonb("data_payload"),
});

export const clientOnboardingsRelations = relations(clientOnboardings, ({ many }) => ({
  steps: many(onboardingSteps),
}));

export const onboardingStepsRelations = relations(onboardingSteps, ({ one }) => ({
  onboarding: one(clientOnboardings, {
    fields: [onboardingSteps.onboardingId],
    references: [clientOnboardings.id],
  }),
}));

export const retainers = pgTable("retainers", {
  id: uuid("id").primaryKey().defaultRandom(),
  organizationId: uuid("organization_id").references(() => organizations.id, { onDelete: "cascade" }).notNull(),
  dealId: uuid("deal_id").references(() => deals.id, { onDelete: "set null" }), // Optional link to origin deal
  name: varchar("name", { length: 255 }).notNull(),
  status: varchar("status", { length: 50 }).default("active"), // active, paused, cancelled
  amount: integer("amount").notNull(), // Monthly recurring revenue amount
  startDate: timestamp("start_date").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const retainerPeriods = pgTable("retainer_periods", {
  id: uuid("id").primaryKey().defaultRandom(),
  retainerId: uuid("retainer_id").references(() => retainers.id, { onDelete: "cascade" }).notNull(),
  periodName: varchar("period_name", { length: 100 }).notNull(), // e.g. "July 2026"
  status: varchar("status", { length: 50 }).default("active"), // active, completed
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const invoices = pgTable("invoices", {
  id: uuid("id").primaryKey().defaultRandom(),
  invoiceNumber: varchar("invoice_number", { length: 50 }).unique(), // E.g., ARO-2026-000001
  organizationId: uuid("organization_id").references(() => organizations.id, { onDelete: "cascade" }).notNull(),
  dealId: uuid("deal_id").references(() => deals.id, { onDelete: "set null" }), // Keep existing field to prevent breaking changes
  projectId: uuid("project_id").references(() => projects.id, { onDelete: "set null" }), // Added for Phase 4
  retainerPeriodId: uuid("retainer_period_id").references(() => retainerPeriods.id, { onDelete: "set null" }), // Added for Phase 4
  amount: integer("amount").notNull(), // Amount in cents
  status: varchar("status", { length: 50 }).default("open"), // draft, open, partially_paid, paid, overdue, cancelled
  razorpayOrderId: varchar("razorpay_order_id", { length: 255 }),
  paymentUtr: varchar("payment_utr", { length: 255 }),
  paymentReceiptUrl: text("payment_receipt_url"),
  dueDate: timestamp("due_date").notNull(),
  invoiceUrl: text("invoice_url"), // Keep existing field
    notes: text("notes"),
  updatedAt: timestamp("updated_at").defaultNow(),
    createdBy: uuid("created_by").references(() => users.id, { onDelete: "set null" }),
  updatedBy: uuid("updated_by").references(() => users.id, { onDelete: "set null" }),
  createdAt: timestamp("created_at").defaultNow(),
}, (t) => ({
  orgIdx: index("invoices_org_idx").on(t.organizationId),
}));

export const payments = pgTable("payments", {
  id: uuid("id").primaryKey().defaultRandom(),
  invoiceId: uuid("invoice_id").references(() => invoices.id, { onDelete: "cascade" }).notNull(),
  amount: integer("amount").notNull(), // Amount in cents
  status: varchar("status", { length: 50 }).default("pending"), // pending, succeeded, failed
  provider: varchar("provider", { length: 50 }).default("razorpay"), // razorpay, manual
  providerPaymentId: varchar("provider_payment_id", { length: 255 }).unique(), // Razorpay Payment ID
  paidAt: timestamp("paid_at"),
    method: varchar("method", { length: 50 }),
  verifiedAt: timestamp("verified_at"),
    referenceNumber: varchar("reference_number", { length: 255 }),
  verifiedBy: uuid("verified_by").references(() => users.id, { onDelete: "set null" }),
    notes: text("notes"),
    createdBy: uuid("created_by").references(() => users.id, { onDelete: "set null" }),
  updatedBy: uuid("updated_by").references(() => users.id, { onDelete: "set null" }),
  deletedBy: uuid("deleted_by").references(() => users.id, { onDelete: "set null" }),
  updatedAt: timestamp("updated_at").defaultNow(),
  deletedAt: timestamp("deleted_at"),
  createdAt: timestamp("created_at").defaultNow(),
}, (t) => ({
  invoiceIdx: index("payments_invoice_idx").on(t.invoiceId),
}));

export const files = pgTable("files", {
  id: uuid("id").primaryKey().defaultRandom(),
  organizationId: uuid("organization_id").references(() => organizations.id, { onDelete: "cascade" }), // Nullable for global files
  projectId: uuid("project_id").references(() => projects.id, { onDelete: "cascade" }), // Optional
  retainerPeriodId: uuid("retainer_period_id").references(() => retainerPeriods.id, { onDelete: "cascade" }), // Optional
  name: varchar("name", { length: 255 }).notNull(),
  url: text("url").notNull(), // UploadThing URL
  key: varchar("key", { length: 255 }).notNull(), // UploadThing internal key
  size: integer("size").notNull(), // bytes
  mimeType: varchar("mime_type", { length: 100 }),
  uploadedById: uuid("uploaded_by_id").references(() => users.id, { onDelete: "set null" }),
  createdAt: timestamp("created_at").defaultNow(),
});

export const deliverables = pgTable("deliverables", {
  id: uuid("id").primaryKey().defaultRandom(),
  projectId: uuid("project_id").references(() => projects.id, { onDelete: "cascade" }), // OR retainerPeriodId
  retainerPeriodId: uuid("retainer_period_id").references(() => retainerPeriods.id, { onDelete: "cascade" }),
  name: varchar("name", { length: 255 }).notNull(),
  status: varchar("status", { length: 50 }).default("draft"), // draft, in_review, changes_requested, approved
  currentVersionId: uuid("current_version_id"), // Manually updated to track latest
  createdAt: timestamp("created_at").defaultNow(),
});

export const deliverableVersions = pgTable("deliverable_versions", {
  id: uuid("id").primaryKey().defaultRandom(),
  deliverableId: uuid("deliverable_id").references(() => deliverables.id, { onDelete: "cascade" }).notNull(),
  fileId: uuid("file_id").references(() => files.id, { onDelete: "cascade" }).notNull(),
  versionNumber: integer("version_number").notNull(),
  reviewStatus: varchar("review_status", { length: 50 }).default("draft"), // draft, submitted, changes_requested, approved, superseded
  createdAt: timestamp("created_at").defaultNow(),
});

export const comments = pgTable("comments", {
  id: uuid("id").primaryKey().defaultRandom(),
  deliverableId: uuid("deliverable_id").references(() => deliverables.id, { onDelete: "cascade" }).notNull(),
  versionId: uuid("version_id").references(() => deliverableVersions.id, { onDelete: "cascade" }), // Optional, can be general comment
  userId: uuid("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  text: text("text").notNull(),
  visibility: varchar("visibility", { length: 50 }).default("client_visible"), // client_visible, internal_only
  createdAt: timestamp("created_at").defaultNow(),
});

export const activityLogs = pgTable("activity_logs", {
  id: uuid("id").primaryKey().defaultRandom(),
  organizationId: uuid("organization_id").references(() => organizations.id, { onDelete: "cascade" }).notNull(),
  userId: uuid("user_id").references(() => users.id, { onDelete: "set null" }), // Who performed the action
  action: varchar("action", { length: 255 }).notNull(), // e.g., 'invoice.created', 'deliverable.approved'
  entityType: varchar("entity_type", { length: 50 }).notNull(), // e.g., 'invoice', 'deliverable'
  entityId: uuid("entity_id").notNull(),
  metadata: text("metadata"), // JSON stringified metadata for extra context
  createdAt: timestamp("created_at").defaultNow(),
});

export const rateLimits = pgTable("rate_limits", {
  key: varchar("key", { length: 255 }).primaryKey(),
  points: integer("points").notNull().default(0),
  expireAt: timestamp("expire_at").notNull(),
});

export const auditLogs = pgTable("audit_logs", {
  id: uuid("id").primaryKey().defaultRandom(),
  organizationId: uuid("organization_id").references(() => organizations.id, { onDelete: "cascade" }).notNull(),
  entityType: varchar("entity_type", { length: 50 }).notNull(),
  entityId: uuid("entity_id").notNull(),
  action: varchar("action", { length: 255 }).notNull(),
  previousValue: text("previous_value"),
  newValue: text("new_value"),
  userId: uuid("user_id"),
  ipAddress: varchar("ip_address", { length: 45 }),
  userAgent: text("user_agent"),
  metadata: text("metadata"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const notifications = pgTable("notifications", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  organizationId: uuid("organization_id").references(() => organizations.id, { onDelete: "cascade" }).notNull(),
  message: text("message").notNull(),
  entityType: varchar("entity_type", { length: 50 }),
  entityId: uuid("entity_id"),
  type: varchar("type", { length: 50 }), // forward-compatible notification type
  metadata: text("metadata"), // optional metadata
  read: boolean("read").default(false).notNull(),
  archived: boolean("archived").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
}, (t) => ({
  orgIdx: index("notifications_org_idx").on(t.organizationId),
  userIdx: index("notifications_user_idx").on(t.userId),
  readIdx: index("notifications_read_idx").on(t.read),
  createdAtIdx: index("notifications_created_at_idx").on(t.createdAt),
}));

export const invoicesRelations = relations(invoices, ({ many, one }) => ({
  payments: many(payments),
  project: one(projects, {
    fields: [invoices.projectId],
    references: [projects.id],
  }),
  organization: one(organizations, {
    fields: [invoices.organizationId],
    references: [organizations.id],
  }),
}));

export const paymentsRelations = relations(payments, ({ one }) => ({
  invoice: one(invoices, {
    fields: [payments.invoiceId],
    references: [invoices.id],
  }),
}));

export const projectsRelations = relations(projects, ({ one, many }) => ({
  organization: one(organizations, {
    fields: [projects.organizationId],
    references: [organizations.id]
  }),
  tasks: many(tasks),
  milestones: many(milestones),
  invoices: many(invoices),
  activities: many(activityLogs, { relationName: "projectActivities" })
}));

export const tasksRelations = relations(tasks, ({ one }) => ({
  project: one(projects, {
    fields: [tasks.projectId],
    references: [projects.id]
  }),
  assignee: one(users, {
    fields: [tasks.assigneeId],
    references: [users.id]
  })
}));

export const activityLogsRelations = relations(activityLogs, ({ one }) => ({
  user: one(users, {
    fields: [activityLogs.userId],
    references: [users.id],
    relationName: "projectActivities"
  })
}));

export const filesRelations = relations(files, ({ one }) => ({
  uploadedBy: one(users, {
    fields: [files.uploadedById],
    references: [users.id]
  })
}));
