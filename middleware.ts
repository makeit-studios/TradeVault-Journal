import { withAuth } from "next-auth/middleware";

export default withAuth({
  pages: {
    signIn: "/login"
  }
});

export const config = {
  matcher: ["/dashboard/:path*", "/accounts/:path*", "/journal/:path*", "/analytics/:path*", "/calendar/:path*", "/psychology/:path*", "/payouts/:path*", "/settings/:path*"]
};
