import { auth } from "./auth";
import { NextResponse } from "next/server";

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

export async function requireAdmin() {
  const user = await getSessionUser();
  if (!user || user.role !== "admin") {
    return NextResponse.json({ error: "Acesso negado" }, { status: 403 });
  }
  return user;
}

export async function requireAuth() {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }
  return user;
}
