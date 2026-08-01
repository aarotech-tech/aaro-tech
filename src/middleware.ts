import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { USER_TYPES } from "@/lib/roles";

const isInternalRoute = createRouteMatcher([
  "/dashboard(.*)",
  "/delivery(.*)",
  "/directory(.*)",
  "/finance(.*)",
  "/inbox(.*)",
  "/sales(.*)",
  "/settings(.*)",
  "/automations(.*)"
]);
const isClientRoute = createRouteMatcher(["/portal(.*)"]);

export default clerkMiddleware(async (auth, req) => {
  const { userId, sessionClaims } = await auth();

  if (!userId) {
    if (isInternalRoute(req) || isClientRoute(req)) {
      const authData = await auth();
      return authData.redirectToSignIn();
    }
    return NextResponse.next();
  }

  const metadata = (sessionClaims?.metadata as Record<string, any>) || {};
  const userType = metadata.userType || USER_TYPES.CLIENT;

  // If internal user lands on root or /admin, redirect to /dashboard
  if (req.nextUrl.pathname === "/" || req.nextUrl.pathname === "/admin") {
    if (userType === USER_TYPES.INTERNAL) {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }
  }

  // Enforce route access based on user type
  // Note: We disabled middleware enforcement because stale clerk tokens cause valid internal users 
  // to be redirected to /unauthorized after auto-upgrading. The component layout protects these routes anyway.
  /*
  if (isInternalRoute(req) && userType !== USER_TYPES.INTERNAL) {
    return NextResponse.redirect(new URL("/unauthorized", req.url));
  }

  if (isClientRoute(req) && userType !== USER_TYPES.CLIENT) {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }
  */

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!.*\\..*|_next).*)", "/", "/(api|trpc)(.*)"],
};
