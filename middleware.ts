import { NextResponse } from "next/server";
import { withAuth } from "next-auth/middleware";

// Signed-out visitors are sent to sign-in; signed-in visitors without the
// right role are sent home. API routes enforce the same rules on their own.
export default withAuth(
  (req) => {
    const role = req.nextauth.token?.role;
    const { pathname } = req.nextUrl;
    if (pathname.startsWith("/admin") && role !== "ADMIN") {
      return NextResponse.redirect(new URL("/", req.url));
    }
    const isSellerArea = pathname.startsWith("/seller") && !pathname.startsWith("/seller/register");
    if (isSellerArea && role !== "SELLER" && role !== "ADMIN") {
      return NextResponse.redirect(new URL("/seller/register", req.url));
    }
    return NextResponse.next();
  },
  { pages: { signIn: "/auth/signin" } }
);

export const config = {
  matcher: ["/admin/:path*", "/seller/:path*", "/buyer/:path*", "/checkout", "/orders/:path*"],
};
