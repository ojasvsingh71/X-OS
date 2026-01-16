import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { decrypt } from "@/lib/auth";

export async function middleware(req: NextRequest) {
  // 1. Check for session cookie
  const cookie = req.cookies.get("session")?.value;
  const session = cookie ? await decrypt(cookie).catch(() => null) : null;

  // 2. Define paths
  const isDashboard = req.nextUrl.pathname.startsWith("/dashboard");
  const isAuthPage =
    req.nextUrl.pathname.startsWith("/login") ||
    req.nextUrl.pathname.startsWith("/register");

  // 3. Redirect Logic

  // If trying to access dashboard WITHOUT session -> Redirect to Login
  if (isDashboard && !session) {
    return NextResponse.redirect(new URL("/login", req.nextUrl));
  }

  // If trying to access login/register WITH session -> Redirect to Dashboard
  if (isAuthPage && session) {
    return NextResponse.redirect(new URL("/dashboard", req.nextUrl));
  }

  return NextResponse.next();
}

// 4. Config to prevent middleware from running on static files/images
export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
