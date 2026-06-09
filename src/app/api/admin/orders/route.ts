import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { guardAdmin } from "@/lib/auth-utils";

export async function GET() {
  return guardAdmin(async () => {
    const orders = await prisma.order.findMany({
      include: { items: { select: { itemType: true } } },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(
      orders.map((o) => ({
        id: o.id,
        total: o.total,
        status: o.status,
        createdAt: o.createdAt.toISOString(),
        itemCount: o.items.length,
        hasCustom: o.items.some((i) => i.itemType === "personalizado"),
      }))
    );
  });
}
