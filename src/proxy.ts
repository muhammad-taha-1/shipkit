import NextAuth from "next-auth";
import { authConfig } from "@/modules/auth/auth.config";

const { auth } = NextAuth(authConfig);

const publicRoutes = [
  "/",
  "/pricing",
  "/docs",
  "/login",
  "/register",
  "/forgot-password",
  "/reset-password",
  "/verify-email",
  "/accept-invite",
];

const authRoutes = ["/login", "/register", "/forgot-password", "/reset-password"];

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const isLoggedIn = !!req.auth;

  const isPublicRoute = publicRoutes.some(
    (route) =>
      pathname === route ||
      pathname.startsWith("/api/webhooks") ||
      pathname.startsWith("/api/uploadthing") ||
      pathname.startsWith("/api/health"),
  );
  const isAuthRoute = authRoutes.some((route) => pathname === route);
  const isAdminRoute = pathname.startsWith("/admin");

  if (isAuthRoute && isLoggedIn) {
    return Response.redirect(new URL("/dashboard", req.url));
  }

  if (!isPublicRoute && !isLoggedIn) {
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return Response.redirect(loginUrl);
  }

  if (isAdminRoute && isLoggedIn && req.auth?.user?.role !== "SUPER_ADMIN") {
    return Response.redirect(new URL("/", req.url));
  }
});

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|ico)$).*)",
  ],
};
