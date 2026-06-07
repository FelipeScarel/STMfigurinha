import { prisma } from "./db";

export type CartItem = {
  id: string;
  productId: string | null;
  categoryId?: string | null;
  name: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
};

export type AppliedRule = {
  id: string;
  name: string;
  discountAmount: number;
};

export async function calculateDiscounts(
  cartItems: CartItem[],
  couponCode?: string
): Promise<{ discountTotal: number; appliedRules: AppliedRule[]; couponDiscount: number; couponId: string | null }> {
  let discountTotal = 0;
  const appliedRules: AppliedRule[] = [];
  let couponDiscount = 0;
  let couponId: string | null = null;

  // --- Cupom ---
  if (couponCode) {
    const coupon = await prisma.coupon.findUnique({
      where: { code: couponCode.toUpperCase() },
    });

    if (
      coupon &&
      coupon.active &&
      new Date() >= coupon.startDate &&
      new Date() <= coupon.endDate &&
      (coupon.maxUses === null || coupon.currentUses < coupon.maxUses)
    ) {
      const cartTotal = cartItems.reduce((s, i) => s + i.subtotal, 0);
      if (cartTotal >= coupon.minOrderValue) {
        if (coupon.type === "percentual") {
          couponDiscount = cartTotal * (coupon.value / 100);
        } else {
          couponDiscount = Math.min(coupon.value, cartTotal);
        }
        couponId = coupon.id;
      }
    }
  }

  // --- Regras de Promoção ---
  const rules = await prisma.promotionRule.findMany({
    where: {
      active: true,
      startDate: { lte: new Date() },
      endDate: { gte: new Date() },
    },
  });

  for (const rule of rules) {
    // Filtra itens pelo escopo da regra
    let applicableItems = cartItems;
    if (rule.applyTo === "categoria") {
      applicableItems = cartItems.filter(
        (i) => i.categoryId === rule.categoryId
      );
    } else if (rule.applyTo === "produto") {
      applicableItems = cartItems.filter(
        (i) => i.productId === rule.productId
      );
    }

    if (applicableItems.length === 0) continue;

    const totalQty = applicableItems.reduce((s, i) => s + i.quantity, 0);
    let ruleDiscount = 0;

    switch (rule.type) {
      case "compre_x_pague_y": {
        if (rule.buyQty === null || rule.payQty === null) continue;
        if (totalQty >= rule.buyQty) {
          // A cada grupo de buyQty itens, (buyQty - payQty) itens mais baratos são grátis
          const groups = Math.floor(totalQty / rule.buyQty);
          const freePerGroup = rule.buyQty - rule.payQty;

          // Coleta todos os itens individuais ordenados por preço
          const individualItems: { unitPrice: number }[] = [];
          for (const item of applicableItems) {
            for (let q = 0; q < item.quantity; q++) {
              individualItems.push({ unitPrice: item.unitPrice });
            }
          }
          individualItems.sort((a, b) => a.unitPrice - b.unitPrice);

          let freeCount = groups * freePerGroup;
          for (const item of individualItems) {
            if (freeCount <= 0) break;
            ruleDiscount += item.unitPrice;
            freeCount--;
          }
        }
        break;
      }

      case "desconto_por_qtde": {
        if (rule.buyQty === null || rule.discountPercent === null) continue;
        if (totalQty >= rule.buyQty) {
          for (const item of applicableItems) {
            ruleDiscount += item.subtotal * (rule.discountPercent / 100);
          }
        }
        break;
      }

      case "desconto_percentual": {
        if (rule.discountPercent === null) continue;
        for (const item of applicableItems) {
          ruleDiscount += item.subtotal * (rule.discountPercent / 100);
        }
        break;
      }
    }

    if (ruleDiscount > 0) {
      discountTotal += ruleDiscount;
      appliedRules.push({
        id: rule.id,
        name: rule.name,
        discountAmount: Math.round(ruleDiscount * 100) / 100,
      });
    }
  }

  return {
    discountTotal: Math.round(discountTotal * 100) / 100,
    appliedRules,
    couponDiscount: Math.round(couponDiscount * 100) / 100,
    couponId,
  };
}
