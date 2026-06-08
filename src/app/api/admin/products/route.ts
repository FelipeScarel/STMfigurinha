import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  const products = await prisma.product.findMany({
    include: { category: true, variants: true },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(
    products.map((p) => ({
      id: p.id,
      name: p.name,
      slug: p.slug,
      basePrice: p.basePrice,
      type: p.type,
      active: p.active,
      featured: p.featured,
      categoryName: p.category.name,
      variantCount: p.variants.length,
    }))
  );
}
