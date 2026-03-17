import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

const RU_PREFIX = "/ru";

const DOMAIN_LANG_MAP: Record<string, string> = {
  "agroit.am": "hy",
  "www.agroit.am": "hy",
  "agroit.ge": "ka",
  "www.agroit.ge": "ka",
};

export function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const host = request.headers.get("host") || "";
  const domainLang = DOMAIN_LANG_MAP[host] || "ka";

  // Normalize URLs to lowercase (redirect uppercase to lowercase)
  // Skip static routes like /en, /about, /contact, /blog, /products, /admin, /auth
  const staticRoutes = ['/en', '/about', '/contact', '/blog', '/products', '/admin', '/auth', '/success-stories', '/success-story'];
  const isStaticRoute = staticRoutes.some(route => pathname === route || pathname.startsWith(route + '/'));

  if (!isStaticRoute && pathname !== pathname.toLowerCase()) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = pathname.toLowerCase();
    redirectUrl.search = search;
    return NextResponse.redirect(redirectUrl, 301);
  }

  // Redirect /ru/* to /en/*
  if (pathname === RU_PREFIX || pathname.startsWith(`${RU_PREFIX}/`)) {
    const strippedPath = pathname.replace(/^\/ru/, "");
    const targetPath = strippedPath ? `/en${strippedPath}` : "/en";
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = targetPath;
    redirectUrl.search = search;
    return NextResponse.redirect(redirectUrl, 308);
  }

  // Set domain language cookie for client-side hydration
  const response = NextResponse.next();
  response.cookies.set("x-domain-lang", domainLang, {
    path: "/",
    httpOnly: false,
    sameSite: "lax",
    maxAge: 60 * 60 * 24,
  });

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
