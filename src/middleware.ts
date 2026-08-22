import { auth } from "@/modules/auth/auth";
import { NextResponse } from "next/server";

const publicRoutes = [
  "/",
  "/pricing",
  "/docs",
  "/login",
  "/register",
  "/forgot-password",
  "/reset-password",
  "/verify-email",
];

const authRoutes = ["/login", "/register", "/forgot-password", "/reset-password"];

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const isLoggedIn = !!req.auth;

  const isPublicRoute = publicRoutes.some(
    (route) => pathname === route || pathname.startsWith("/api/webhooks") || pathname.startsWith("/api/health"),
  );
  const isAuthRoute = authRoutes.some((route) => pathname === route);
  const isAdminRoute = pathname.startsWith("/admin");

  if (isAuthRoute && isLoggedIn) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  if (!isPublicRoute && !isLoggedIn) {
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (isAdminRoute && isLoggedIn && req.auth?.user?.role !== "SUPER_ADMIN") {
    return NextResponse.redirect(new URL("/", req.url));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|ico)$).*)"],
};
