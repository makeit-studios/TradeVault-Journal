import { getToken } from "next-auth/jwt";
import { NextRequest, NextResponse } from "next/server";

export async function middleware(request: NextRequest) {
  const token = await getToken({ req: request });
  const { pathname } = request.nextUrl;

  const protectedPaths = ["/dashboard", "/accounts", "/journal", "/analytics", "/calendar", "/psychology", "/payouts", "/settings"];

  const isProtected = protectedPaths.some((path) => pathname.startsWith(path));
  if (isProtected && !token) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/accounts/:path*", "/journal/:path*", "/analytics/:path*", "/calendar/:path*", "/psychology/:path*", "/payouts/:path*", "/settings/:path*"]
};
