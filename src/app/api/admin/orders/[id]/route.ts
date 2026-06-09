import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { guardAdmin } from "@/lib/auth-utils";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  return guardAdmin(async () => {
    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        items: true,
        timeline: { orderBy: { createdAt: "asc" } },
        coupon: true,
      },
    });

    if (!order) return NextResponse.json({ error: "Não encontrado" }, { status: 404 });

    const uploadIds = order.items.filter((i) => i.uploadId).map((i) => i.uploadId!);
    const uploads = uploadIds.length > 0
      ? await prisma.customUpload.findMany({ where: { id: { in: uploadIds } } })
      : [];

    return NextResponse.json({
      id: order.id,
      total: order.total,
      subtotal: order.subtotal,
      discountTotal: order.discountTotal,
      shipping: order.shipping,
      status: order.status,
      createdAt: order.createdAt.toISOString(),
      coupon: order.coupon ? { code: order.coupon.code } : null,
      items: order.items.map((i) => ({
        id: i.id,
        itemType: i.itemType,
        quantity: i.quantity,
        unitPrice: i.unitPrice,
        subtotal: i.subtotal,
        upload: uploads.find((u) => u.id === i.uploadId) || null,
      })),
      timeline: order.timeline.map((t) => ({
        id: t.id,
        message: t.message,
        newStatus: t.newStatus,
        createdBy: t.createdBy,
        createdAt: t.createdAt.toISOString(),
      })),
    });
  });
}
