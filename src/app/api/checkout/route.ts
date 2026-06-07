import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth-utils";
import { prisma } from "@/lib/db";
import { calculateDiscounts } from "@/lib/promocao-engine";

export async function POST(req: Request) {
  try {
    const user = await getSessionUser();
    if (!user || !("id" in user)) {
      return NextResponse.json({ error: "Faça login para comprar." }, { status: 401 });
    }
    const userId = (user as { id: string }).id;

    const { items, couponId, promotionRuleId } = await req.json();

    if (!items || items.length === 0) {
      return NextResponse.json({ error: "Carrinho vazio." }, { status: 400 });
    }

    const subtotal = items.reduce(
      (sum: number, i: { unitPrice: number; quantity: number }) =>
        sum + i.unitPrice * i.quantity,
      0
    );

    const cartForEngine = items.map((i: any) => ({
      id: "temp",
      productId: i.productId,
      name: "",
      quantity: i.quantity,
      unitPrice: i.unitPrice,
      subtotal: i.unitPrice * i.quantity,
    }));

    const discountResult = await calculateDiscounts(cartForEngine);
    const totalDiscount = discountResult.discountTotal + discountResult.couponDiscount;
    const total = subtotal - totalDiscount;

    const order = await prisma.order.create({
      data: {
        userId: userId,
        status: "aguardando_pagamento",
        subtotal,
        discountTotal: totalDiscount,
        shipping: 0,
        total,
        couponId: discountResult.couponId || couponId,
        promotionRuleId: discountResult.appliedRules[0]?.id || promotionRuleId,
        items: {
          create: items.map((i: any) => ({
            productId: i.productId || null,
            variantId: i.variantId || null,
            uploadId: i.uploadId || null,
            itemType: i.itemType,
            quantity: i.quantity,
            unitPrice: i.unitPrice,
            subtotal: i.unitPrice * i.quantity,
          })),
        },
        timeline: {
          create: {
            newStatus: "aguardando_pagamento",
            message: "Pedido criado com sucesso.",
            createdBy: "sistema",
          },
        },
      },
    });

    if (discountResult.couponId) {
      await prisma.coupon.update({
        where: { id: discountResult.couponId },
        data: { currentUses: { increment: 1 } },
      });
    }

    return NextResponse.json({ id: order.id, total: order.total }, { status: 201 });
  } catch (error) {
    console.error("Checkout error:", error);
    return NextResponse.json(
      { error: "Erro ao processar pedido." },
      { status: 500 }
    );
  }
}
