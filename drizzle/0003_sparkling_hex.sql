ALTER TABLE "retainers" ADD COLUMN "billing_day" integer DEFAULT 1 NOT NULL;--> statement-breakpoint
ALTER TABLE "retainers" ADD COLUMN "end_date" timestamp;