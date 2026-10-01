import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get("celibrate_token")?.value;

  // Protect Admin routes (except /admin/login)
  if (pathname.startsWith("/admin") && pathname !== "/admin/login") {
    if (!token) {
      const url = new URL("/admin/login", request.url);
      url.searchParams.set("from", pathname);
      return NextResponse.redirect(url);
    }

    try {
      const payloadBase64 = token.split(".")[1];
      if (!payloadBase64) {
        return NextResponse.redirect(new URL("/admin/login", request.url));
      }
      const payloadJson = Buffer.from(payloadBase64, "base64").toString("utf-8");
      const payload = JSON.parse(payloadJson);

      if (payload.role !== "ADMIN") {
        const url = new URL("/admin/login", request.url);
        url.searchParams.set("error", "unauthorized");
        return NextResponse.redirect(url);
      }
    } catch {
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }
  }

  // Protect Owner routes (except /owner/register)
  if (pathname.startsWith("/owner") && pathname !== "/owner/register") {
    if (!token) {
      const url = new URL("/login", request.url);
      url.searchParams.set("from", pathname);
      return NextResponse.redirect(url);
    }

    try {
      const payloadBase64 = token.split(".")[1];
      if (!payloadBase64) {
        return NextResponse.redirect(new URL("/login", request.url));
      }
      const payloadJson = Buffer.from(payloadBase64, "base64").toString("utf-8");
      const payload = JSON.parse(payloadJson);

      if (payload.role !== "VENUE_OWNER" && payload.role !== "ADMIN") {
        return NextResponse.redirect(new URL("/profile", request.url));
      }
    } catch {
      return NextResponse.redirect(new URL("/login", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/owner/:path*"],
};
