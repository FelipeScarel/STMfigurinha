import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth-utils";
import { prisma } from "@/lib/db";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdmin();
  if (auth instanceof NextResponse) return auth;

  const { id } = await params;
  const { status } = await req.json();

  if (!status) {
    return NextResponse.json({ error: "Status é obrigatório." }, { status: 400 });
  }

  const order = await prisma.order.findUnique({ where: { id } });
  if (!order) {
    return NextResponse.json({ error: "Pedido não encontrado." }, { status: 404 });
  }

  const updated = await prisma.order.update({
    where: { id },
    data: {
      status,
      timeline: {
        create: {
          previousStatus: order.status,
          newStatus: status,
          message: `Status alterado para "${status}"`,
          createdBy: "admin",
        },
      },
    },
  });

  return NextResponse.json({ status: updated.status });
}
