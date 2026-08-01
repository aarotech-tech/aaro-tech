import { NextResponse } from "next/server";
import { auth, clerkClient } from "@clerk/nextjs/server";

export async function GET() {
  const { userId, sessionClaims } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  
  const client = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY });
  const user = await client.users.getUser(userId);

  return NextResponse.json({
    userId,
    sessionClaims,
    publicMetadataFromClerkAPI: user.publicMetadata
  });
}

function createClerkClient(options: { secretKey: string | undefined }) {
  const { createClerkClient } = require("@clerk/nextjs/server");
  return createClerkClient(options);
}
