import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Lê o token da sessão NextAuth do cookie
  const sessionCookie =
    req.cookies.get("authjs.session-token")?.value ||
    req.cookies.get("__Secure-authjs.session-token")?.value;

  // Protege rotas admin
  if (pathname.startsWith("/admin")) {
    if (!sessionCookie) {
      return NextResponse.redirect(new URL("/login", req.url));
    }
    // O role check é feito pelas páginas admin (server-side)
  }

  // Protege checkout e meus-pedidos
  if (pathname.startsWith("/meus-pedidos")) {
    if (!sessionCookie) {
      return NextResponse.redirect(new URL("/login", req.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/meus-pedidos/:path*", "/checkout/:path*"],
};
