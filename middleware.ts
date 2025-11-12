// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const protectedRoutes = ["/find-gigs", "/profile", "/settings"];
const authRoutes = ["/sign-in", "/sign-up"];

export function middleware(request: NextRequest) {
  const token = request.cookies.get("authToken")?.value;
  const { pathname } = request.nextUrl;

  let isAuthenticated = false;

  if (token) {
    try {
      // Simple JWT validation: check if it has 3 parts (header.payload.signature)
      const parts = token.split(".");
      if (parts.length === 3) {
        // Token exists and has proper JWT format, consider it authenticated
        // Full verification happens on the backend anyway
        isAuthenticated = true;
      }
    } catch (error) {
      isAuthenticated = false;
    }
  }

  // Redirect authenticated users away from auth pages
  if (isAuthenticated && authRoutes.includes(pathname)) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  // Redirect unauthenticated users away from protected pages
  if (
    !isAuthenticated &&
    protectedRoutes.some((route) => pathname.startsWith(route))
  ) {
    return NextResponse.redirect(new URL("/sign-in", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|api/).*)"],
};
