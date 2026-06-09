import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { guardAdmin } from "@/lib/auth-utils";

export async function GET() {
  return guardAdmin(async () => {
    const products = await prisma.product.findMany({
      include: {
        category: true,
        variants: { orderBy: { size: "asc" } },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(
      products.map((p) => ({
        id: p.id,
        name: p.name,
        slug: p.slug,
        description: p.description,
        basePrice: p.basePrice,
        showPrice: p.showPrice,
        type: p.type,
        active: p.active,
        featured: p.featured,
        imageUrl: p.imageUrl,
        categoryId: p.categoryId,
        categoryName: p.category.name,
        variants: p.variants.map((v) => ({
          id: v.id,
          size: v.size,
          finish: v.finish,
          priceExtra: v.priceExtra,
          stock: v.stock,
        })),
        variantCount: p.variants.length,
      }))
    );
  });
}

export async function POST(req: Request) {
  return guardAdmin(async () => {
    const body = await req.json();
    const { name, description, basePrice, showPrice, categoryId, type, active, featured, imageUrl, variants } = body || {};

    if (!name || !categoryId || basePrice === undefined) {
      return NextResponse.json({ error: "Nome, categoria e preço base são obrigatórios" }, { status: 400 });
    }

    let slug = name.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
    const existing = await prisma.product.findUnique({ where: { slug } });
    if (existing) slug = `${slug}-${Date.now()}`;

    const product = await prisma.product.create({
      data: {
        name, slug,
        description: description || null,
        basePrice: Number(basePrice),
        showPrice: showPrice !== undefined ? Boolean(showPrice) : true,
        categoryId,
        imageUrl: imageUrl || null,
        type: type || "pronta",
        active: active !== undefined ? Boolean(active) : true,
        featured: featured !== undefined ? Boolean(featured) : false,
        variants: variants?.length ? {
          create: variants.map((v: any) => ({
            size: v.size || "5x5",
            finish: v.finish || "brilhante",
            priceExtra: Number(v.priceExtra) || 0,
            stock: Number(v.stock) || 0,
          })),
        } : undefined,
      },
      include: { category: true, variants: true },
    });

    return NextResponse.json(product, { status: 201 });
  });
}

export async function PUT(req: Request) {
  return guardAdmin(async () => {
    const body = await req.json();
    const { id, ...data } = body || {};

    if (!id) return NextResponse.json({ error: "ID do produto é obrigatório" }, { status: 400 });

    const existingProduct = await prisma.product.findUnique({ where: { id } });
    if (!existingProduct) return NextResponse.json({ error: "Produto não encontrado" }, { status: 404 });

    let slug = existingProduct.slug;
    if (data.name && data.name !== existingProduct.name) {
      slug = data.name.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
      const conflict = await prisma.product.findFirst({ where: { slug, id: { not: id } } });
      if (conflict) slug = `${slug}-${Date.now()}`;
    }

    if (data.variants) {
      await prisma.productVariant.deleteMany({ where: { productId: id } });
      await prisma.productVariant.createMany({
        data: data.variants.map((v: any) => ({
          productId: id,
          size: v.size || "5x5",
          finish: v.finish || "brilhante",
          priceExtra: Number(v.priceExtra) || 0,
          stock: Number(v.stock) || 0,
        })),
      });
    }

    const updateData: any = {};
    if (data.name !== undefined) updateData.name = data.name;
    if (slug !== undefined) updateData.slug = slug;
    if (data.description !== undefined) updateData.description = data.description || null;
    if (data.basePrice !== undefined) updateData.basePrice = Number(data.basePrice);
    if (data.showPrice !== undefined) updateData.showPrice = Boolean(data.showPrice);
    if (data.categoryId !== undefined) updateData.categoryId = data.categoryId;
    if (data.type !== undefined) updateData.type = data.type;
    if (data.active !== undefined) updateData.active = Boolean(data.active);
    if (data.featured !== undefined) updateData.featured = Boolean(data.featured);
    if (data.imageUrl !== undefined) updateData.imageUrl = data.imageUrl || null;

    const product = await prisma.product.update({
      where: { id },
      data: updateData,
      include: { category: true, variants: true },
    });

    return NextResponse.json(product);
  });
}

export async function DELETE(req: Request) {
  return guardAdmin(async () => {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "ID do produto é obrigatório" }, { status: 400 });

    await prisma.product.delete({ where: { id } });
    return NextResponse.json({ success: true });
  });
}
