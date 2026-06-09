import { auth } from "./auth";
import { NextResponse, type NextRequest } from "next/server";

export type AuthUser = {
  id: string;
  name?: string | null;
  email?: string | null;
  role: string;
};

export async function getSessionUser(): Promise<AuthUser | null> {
  const session = await auth();
  if (!session?.user) return null;
  const user = session.user as { id: string; role: string; name?: string | null; email?: string | null };
  return { id: user.id, name: user.name, email: user.email, role: user.role };
}

// Wrapper for route handlers that require admin
export function adminRoute(handler: () => Promise<NextResponse>): () => Promise<NextResponse> {
  return async () => {
    const user = await getSessionUser();
    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Acesso negado. Área restrita para administradores." }, { status: 403 });
    }
    return handler();
  };
}

// Wrapper for route handlers with request body
export function adminRouteWithReq(
  handler: (req: NextRequest) => Promise<NextResponse>
): (req: NextRequest) => Promise<NextResponse> {
  return async (req: NextRequest) => {
    const user = await getSessionUser();
    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Acesso negado. Área restrita para administradores." }, { status: 403 });
    }
    return handler(req);
  };
}

// Simple check that returns user or null (no throw, no response)
export async function requireAdmin(): Promise<AuthUser | null> {
  const user = await getSessionUser();
  if (!user || user.role !== "admin") return null;
  return user;
}

export async function requireAuth(): Promise<AuthUser | null> {
  const user = await getSessionUser();
  if (!user) return null;
  return user;
}

// Helper: run handler only if admin, else return 403
export async function guardAdmin<T>(handler: () => Promise<T>): Promise<T | NextResponse> {
  const user = await requireAdmin();
  if (!user) {
    return NextResponse.json({ error: "Acesso negado. Área restrita para administradores." }, { status: 403 });
  }
  return handler();
}
