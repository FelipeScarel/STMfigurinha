import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  const orders = await prisma.order.findMany({
    include: { user: { select: { name: true } } },
    orderBy: { createdAt: "desc" },
    take: 10,
  });

  return NextResponse.json(
    orders.map((o) => ({
      id: o.id,
      total: o.total,
      status: o.status,
      createdAt: o.createdAt.toISOString(),
      userName: o.user?.name || "Visitante",
    }))
  );
}
