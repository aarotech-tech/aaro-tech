export function validateEnv() {
  const requiredVars = [
    'DATABASE_URL',
    'NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY',
    'CLERK_SECRET_KEY',
    'RESEND_API_KEY',
    'UPLOADTHING_SECRET',
    'UPLOADTHING_APP_ID'
  ];

  const missing = requiredVars.filter(v => !process.env[v]);

  if (missing.length > 0) {
    if (process.env.NODE_ENV === 'production') {
      // Hard fail in production
      throw new Error(`CRITICAL: Missing required environment variables: ${missing.join(', ')}`);
    } else {
      // Warn in development
      console.warn(`WARNING: Missing environment variables: ${missing.join(', ')}`);
    }
  }
}
