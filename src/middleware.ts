import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const RU_PREFIX = "/ru";

const DOMAIN_LANG_MAP: Record<string, string> = {
  "agroit.am": "hy",
  "www.agroit.am": "hy",
  "agroit.ge": "ka",
  "www.agroit.ge": "ka",
};

// Cache redirects in memory to avoid hitting Supabase on every request
let redirectsCache: Array<{
  from_path: string;
  to_path: string;
  status_code: number;
  is_regex: boolean;
}> = [];
let redirectsCacheTime = 0;
const CACHE_TTL = 60 * 1000; // 1 minute

async function getRedirects() {
  const now = Date.now();
  if (redirectsCache.length > 0 && now - redirectsCacheTime < CACHE_TTL) {
    return redirectsCache;
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    return redirectsCache;
  }

  try {
    const client = createClient(supabaseUrl, supabaseKey, {
      auth: { persistSession: false },
    });

    const { data, error } = await client
      .from("redirects")
      .select("from_path, to_path, status_code, is_regex")
      .eq("is_active", true);

    if (!error && data) {
      redirectsCache = data.map((r: any) => ({
        from_path: r.from_path as string,
        to_path: r.to_path as string,
        status_code: (r.status_code as number) || 301,
        is_regex: !!r.is_regex,
      }));
      redirectsCacheTime = now;
    }
  } catch {
    // If fetch fails, use stale cache
  }

  return redirectsCache;
}

function matchRedirect(
  pathname: string,
  redirects: typeof redirectsCache
): (typeof redirectsCache)[number] | null {
  for (const r of redirects) {
    if (r.is_regex) {
      try {
        const regex = new RegExp(`^${r.from_path}$`);
        if (regex.test(pathname)) return r;
      } catch {
        // Invalid regex, skip
      }
    } else {
      if (r.from_path === pathname) return r;
    }
  }
  return null;
}

export async function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const host = request.headers.get("host") || "";
  const domainLang = DOMAIN_LANG_MAP[host] || "ka";

  // Normalize trailing slashes: /path/ → /path (except root /)
  const normalizedPath = pathname.length > 1 && pathname.endsWith("/")
    ? pathname.slice(0, -1)
    : pathname;

  if (normalizedPath !== pathname) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = normalizedPath;
    redirectUrl.search = search;
    return NextResponse.redirect(redirectUrl, 301);
  }

  // Normalize URLs to lowercase (redirect uppercase to lowercase)
  const staticRoutes = ['/en', '/about', '/contact', '/blog', '/products', '/admin', '/auth', '/success-stories', '/success-story'];
  const isStaticRoute = staticRoutes.some(route => pathname === route || pathname.startsWith(route + '/'));

  if (!isStaticRoute && pathname !== pathname.toLowerCase()) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = pathname.toLowerCase();
    redirectUrl.search = search;
    return NextResponse.redirect(redirectUrl, 301);
  }

  // Check database redirects BEFORE generic /ru/ handling
  // so specific redirects take priority
  const redirects = await getRedirects();
  const matched = matchRedirect(pathname, redirects);

  if (matched) {
    let targetPath = matched.to_path;

    // For regex redirects, apply capture group replacements
    if (matched.is_regex) {
      try {
        const regex = new RegExp(`^${matched.from_path}$`);
        targetPath = pathname.replace(regex, matched.to_path);
      } catch {
        // Fall through with literal to_path
      }
    }

    const redirectUrl = request.nextUrl.clone();
    // Support both relative paths and absolute URLs
    if (targetPath.startsWith("http")) {
      return NextResponse.redirect(targetPath, matched.status_code);
    }
    redirectUrl.pathname = targetPath;
    redirectUrl.search = search;

    // Fire-and-forget hit count update
    trackRedirectHit(request, matched.from_path).catch(() => {});

    return NextResponse.redirect(redirectUrl, matched.status_code);
  }

  // Redirect /ru/* to /en/* (generic fallback for paths not in redirects table)
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

async function trackRedirectHit(request: NextRequest, fromPath: string) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!supabaseUrl || !supabaseKey) return;

  try {
    const client = createClient(supabaseUrl, supabaseKey, {
      auth: { persistSession: false },
    });
    await client.rpc("increment_redirect_hit", { redirect_from_path: fromPath });
  } catch {
    // Non-critical, ignore errors
  }
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
