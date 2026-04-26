import { NextRequest, NextResponse } from "next/server";
import { supabaseMiddleware } from "@/lib/supabase";

const PUBLIC_PATHS = ["/login", "/auth/callback"];

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const supabase = supabaseMiddleware(req, res);
  const { data: { user } } = await supabase.auth.getUser();

  const { pathname } = req.nextUrl;
  const isPublic = PUBLIC_PATHS.some((p) => pathname === p || pathname.startsWith(p + "/"));

  if (!user && !isPublic) {
    const loginUrl = req.nextUrl.clone();
    loginUrl.pathname = "/login";
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }
  if (user && pathname === "/login") {
    const home = req.nextUrl.clone();
    home.pathname = "/";
    home.search = "";
    return NextResponse.redirect(home);
  }
  return res;
}

export const config = {
  matcher: [
    // Run on everything except static assets and the auth API routes themselves
    "/((?!_next/static|_next/image|favicon.ico|manifest.webmanifest|icon-.*|api/ai).*)",
  ],
};
