import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { guardAdmin } from "@/lib/auth-utils";

export async function GET() {
  return guardAdmin(async () => {
    const [total, pending, production, shipped, revenue] = await Promise.all([
      prisma.order.count(),
      prisma.order.count({ where: { status: "aguardando_pagamento" } }),
      prisma.order.count({ where: { status: "em_producao" } }),
      prisma.order.count({ where: { status: "enviado" } }),
      prisma.order.aggregate({
        _sum: { total: true },
        where: { status: { not: "cancelado" } },
      }),
    ]);

    return NextResponse.json({
      total,
      pending,
      production,
      shipped,
      revenue: revenue._sum.total || 0,
    });
  });
}
