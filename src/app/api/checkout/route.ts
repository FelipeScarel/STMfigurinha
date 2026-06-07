import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth-utils";
import { prisma } from "@/lib/db";
import { calculateDiscounts } from "@/lib/promocao-engine";

export async function POST(req: Request) {
  try {
    const user = await getSessionUser();
    // Allow guest checkout
    const userId = user && "id" in user ? (user as { id: string }).id : null;

    const { items, address, couponId, promotionRuleId } = await req.json();

    if (!items || items.length === 0) {
      return NextResponse.json({ error: "Carrinho vazio." }, { status: 400 });
    }

    // Calculate subtotal
    const subtotal = items.reduce(
      (sum: number, i: { unitPrice: number; quantity: number }) =>
        sum + i.unitPrice * i.quantity,
      0
    );

    // Calculate discounts via engine
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
    const shipping = subtotal >= 99 ? 0 : 15.9;
    const total = subtotal - totalDiscount + shipping;

    // Create order
    const order = await prisma.order.create({
      data: {
        userId: userId || "guest",
        status: "aguardando_pagamento",
        subtotal,
        discountTotal: totalDiscount,
        shipping,
        total,
        couponId: discountResult.couponId || couponId,
        promotionRuleId: discountResult.appliedRules[0]?.id || promotionRuleId,
        addressStreet: address?.street,
        addressNumber: address?.number,
        addressComplement: address?.complement,
        addressDistrict: address?.district,
        addressCity: address?.city,
        addressState: address?.state,
        addressZip: address?.zip,
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

    // Update coupon usage
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
