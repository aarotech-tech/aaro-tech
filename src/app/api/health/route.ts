import { NextResponse } from 'next/server';

export async function GET() {
  const health = {
    app: 'healthy',
    database: 'unhealthy',
    inngest: 'unhealthy',
    clerk: 'unconfigured',
    storage: 'unconfigured',
    version: process.env.npm_package_version || '1.0.0',
    commit: process.env.VERCEL_GIT_COMMIT_SHA || 'dev',
    timestamp: new Date().toISOString(),
  };

  let isHealthy = true;

  // Check Database
  const { CoreService } = await import("@/modules/core/services");
  const isDbHealthy = await CoreService.checkDatabaseHealth();
  if (isDbHealthy) {
    health.database = 'healthy';
  } else {
    isHealthy = false;
  }

  // Check Inngest Config
  if (process.env.INNGEST_EVENT_KEY || process.env.NODE_ENV === 'development') {
    health.inngest = 'healthy';
  } else {
    isHealthy = false;
  }

  // Check Clerk Config
  if (process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY && process.env.CLERK_SECRET_KEY) {
    health.clerk = 'configured';
  } else {
    isHealthy = false;
  }

  // Check Storage Config (Vercel Blob)
  if (process.env.BLOB_READ_WRITE_TOKEN || process.env.BLOB_TOKEN || process.env.NODE_ENV === 'development') {
    health.storage = 'healthy';
  } else {
    isHealthy = false;
  }

  return NextResponse.json(health, {
    status: isHealthy ? 200 : 503,
  });
}
