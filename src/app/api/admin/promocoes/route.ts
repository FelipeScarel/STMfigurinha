import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth-utils";
import { prisma } from "@/lib/db";

export async function POST(req: Request) {
  const auth = await requireAdmin();
  if (auth instanceof NextResponse) return auth;

  try {
    const data = await req.json();

    const rule = await prisma.promotionRule.create({
      data: {
        name: data.name,
        type: data.type,
        buyQty: data.buyQty || null,
        payQty: data.payQty || null,
        discountPercent: data.discountPercent || null,
        applyTo: data.applyTo,
        startDate: new Date(data.startDate),
        endDate: new Date(data.endDate),
      },
    });

    return NextResponse.json(rule, { status: 201 });
  } catch (error) {
    console.error("Erro ao criar regra:", error);
    return NextResponse.json({ error: "Erro ao criar regra." }, { status: 500 });
  }
}
