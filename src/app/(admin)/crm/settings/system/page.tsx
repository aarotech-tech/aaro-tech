import { db } from "@/db";
import { sql } from "drizzle-orm";
import { CheckCircle2, AlertTriangle, XCircle, Activity, Database, Key, HardDrive, Mail, CreditCard, Shield, BarChart, Server } from "lucide-react";
import { requireInternalUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function SystemHealthPage() {
  await requireInternalUser();

  let dbStatus = "error";
  try {
    await db.execute(sql`SELECT 1`);
    dbStatus = "ok";
  } catch (e) {
    console.error("DB Health Check Failed:", e);
  }

  const checks = [
    {
      name: "Database (Neon)",
      icon: <Database className="w-5 h-5" />,
      status: dbStatus === "ok" ? "ok" : "error",
      detail: dbStatus === "ok" ? "Connected and responsive" : "Connection failed",
    },
    {
      name: "Authentication (Clerk)",
      icon: <Shield className="w-5 h-5" />,
      status: process.env.CLERK_SECRET_KEY ? "ok" : "error",
      detail: process.env.CLERK_SECRET_KEY ? "Configured" : "Missing secret key",
    },
    {
      name: "Payments (Manual)",
      icon: <CreditCard className="w-5 h-5" />,
      status: "ok",
      detail: "UTR-based manual verification",
    },
    {
      name: "Storage (UploadThing)",
      icon: <HardDrive className="w-5 h-5" />,
      status: process.env.UPLOADTHING_SECRET ? "ok" : "error",
      detail: process.env.UPLOADTHING_SECRET ? "Configured" : "Missing secret",
    },
    {
      name: "Emails (Resend)",
      icon: <Mail className="w-5 h-5" />,
      status: process.env.RESEND_API_KEY ? "ok" : "error",
      detail: process.env.RESEND_API_KEY ? "Configured" : "Missing API key",
    },
    {
      name: "Error Tracking (Sentry)",
      icon: <Activity className="w-5 h-5" />,
      status: process.env.SENTRY_DSN ? "ok" : "warning",
      detail: process.env.SENTRY_DSN ? "Active" : "Not configured (Recommended for Prod)",
    },
    {
      name: "Analytics (GA/Clarity)",
      icon: <BarChart className="w-5 h-5" />,
      status: process.env.NEXT_PUBLIC_GA_ID || process.env.NEXT_PUBLIC_CLARITY_ID ? "ok" : "warning",
      detail: (process.env.NEXT_PUBLIC_GA_ID || process.env.NEXT_PUBLIC_CLARITY_ID) ? "Tracking Active" : "No analytics configured",
    }
  ];

  return (
    <div className="max-w-5xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Server className="w-6 h-6 text-gray-700" />
          System Health & Readiness
        </h1>
        <p className="text-gray-500 mt-2">Real-time status of production integrations and core services.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {checks.map((check) => (
          <div key={check.name} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex flex-col">
            <div className="flex items-start justify-between mb-4">
              <div className="p-2 bg-gray-50 rounded-lg text-gray-600">
                {check.icon}
              </div>
              {check.status === "ok" && <CheckCircle2 className="w-6 h-6 text-emerald-500" />}
              {check.status === "warning" && <AlertTriangle className="w-6 h-6 text-amber-500" />}
              {check.status === "error" && <XCircle className="w-6 h-6 text-red-500" />}
            </div>
            <h3 className="font-semibold text-gray-900">{check.name}</h3>
            <p className="text-sm text-gray-500 mt-1">{check.detail}</p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="font-semibold text-gray-900 mb-4">Operational Metrics</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-500 font-medium">Last Backup</p>
            <p className="text-lg font-semibold text-gray-900 mt-1">Continuous (PITR)</p>
          </div>
          <div className="p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-500 font-medium">Last Stripe Webhook</p>
            <p className="text-lg font-semibold text-gray-900 mt-1">N/A</p>
          </div>
          <div className="p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-500 font-medium">Last Email Sent</p>
            <p className="text-lg font-semibold text-gray-900 mt-1">N/A</p>
          </div>
          <div className="p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-500 font-medium">Storage Usage</p>
            <p className="text-lg font-semibold text-gray-900 mt-1">~</p>
          </div>
        </div>
      </div>
    </div>
  );
}
