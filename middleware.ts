import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { USER_TYPES } from "./src/lib/roles";

const isInternalRoute = createRouteMatcher(["/(admin)(.*)", "/(internal)(.*)"]);
const isClientRoute = createRouteMatcher(["/(client)(.*)"]);

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
  if (isInternalRoute(req) && userType !== USER_TYPES.INTERNAL) {
    return NextResponse.redirect(new URL("/unauthorized", req.url));
  }

  if (isClientRoute(req) && userType !== USER_TYPES.CLIENT) {
    // If an internal user tries to access client area, maybe we allow them or redirect them to admin?
    // Let's redirect them to dashboard for strict separation.
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!.*\\..*|_next).*)", "/", "/(api|trpc)(.*)"],
};
