import { NextResponse } from "next/server";
import { calculateDiscounts } from "@/lib/promocao-engine";

export async function POST(req: Request) {
  try {
    const { items, couponCode } = await req.json();

    if (!Array.isArray(items)) {
      return NextResponse.json({ error: "Itens inválidos" }, { status: 400 });
    }

    const result = await calculateDiscounts(items, couponCode);
    return NextResponse.json(result);
  } catch (error) {
    console.error("Erro ao calcular descontos:", error);
    return NextResponse.json(
      { discountTotal: 0, appliedRules: [], couponDiscount: 0, couponId: null },
      { status: 500 }
    );
  }
}
