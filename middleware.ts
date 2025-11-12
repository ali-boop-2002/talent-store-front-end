// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verify } from "@tsndr/cloudflare-worker-jwt";

const protectedRoutes = ["/find-gigs", "/profile", "/settings"];
const authRoutes = ["/sign-in", "/sign-up", "/login"];

export async function middleware(request: NextRequest) {
  const token = request.cookies.get("authToken")?.value;
  const { pathname } = request.nextUrl;

  let isAuthenticated = false;
  let decoded = null;

  if (token) {
    try {
      const isValid = await verify(token, process.env.JWT_SECRET!);
      console.log("isValid", isValid);
      if (isValid) {
        // Decode without verification (since we already verified)
        const payload = JSON.parse(atob(token.split(".")[1]));
        console.log("payload", payload);
        decoded = payload;
        isAuthenticated = true;
      }
    } catch (error) {
      isAuthenticated = false;
    }
  }

  // // Redirect authenticated users away from auth pages
  // if (isAuthenticated && authRoutes.includes(pathname)) {
  //   console.log(`Redirecting authenticated user from ${pathname} to /`);
  //   return NextResponse.redirect(new URL("/", request.url));
  // }

  if (isAuthenticated && authRoutes.includes(pathname)) {
    // console.log(`Redirecting authenticated user from ${pathname} to /`);
    return NextResponse.redirect(new URL("/", request.url));
  }

  // if (
  //   isAuthenticated &&
  //   authRoutes.includes(pathname) &&
  //   decoded.role === "TALENT"
  // ) {
  //   console.log(`Redirecting authenticated user from ${pathname} to /`);
  //   return NextResponse.redirect(new URL("/", request.url));
  // }

  // Redirect unauthenticated users away from protected pages
  if (
    !isAuthenticated &&
    protectedRoutes.some((route) => pathname.startsWith(route))
  ) {
    // console.log(
    //   `Redirecting unauthenticated user from ${pathname} to /sign-in`
    // );
    console.log(
      "Redirecting unauthenticated user from",
      pathname,
      "to /sign-in"
    );
    return NextResponse.redirect(new URL("/sign-in", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|api/).*)"],
};
