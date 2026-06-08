import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  const cats = await prisma.category.findMany({
    include: { products: true },
    orderBy: { order: "asc" },
  });

  return NextResponse.json(
    cats.map((c) => ({
      id: c.id,
      name: c.name,
      slug: c.slug,
      active: c.active,
      productCount: c.products.length,
    }))
  );
}
