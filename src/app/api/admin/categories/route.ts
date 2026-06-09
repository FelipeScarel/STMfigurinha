import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { guardAdmin } from "@/lib/auth-utils";

export async function GET() {
  return guardAdmin(async () => {
    const cats = await prisma.category.findMany({
      include: { products: true },
      orderBy: { order: "asc" },
    });

    return NextResponse.json(
      cats.map((c) => ({
        id: c.id,
        name: c.name,
        slug: c.slug,
        description: c.description,
        imageUrl: c.imageUrl,
        active: c.active,
        order: c.order,
        productCount: c.products.length,
      }))
    );
  });
}

export async function POST(req: Request) {
  return guardAdmin(async () => {
    const body = await req.json();
    const { name, description, imageUrl, active, order } = body || {};

    if (!name) return NextResponse.json({ error: "Nome da categoria é obrigatório" }, { status: 400 });

    let slug = name.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
    const existing = await prisma.category.findUnique({ where: { slug } });
    if (existing) slug = `${slug}-${Date.now()}`;

    const category = await prisma.category.create({
      data: {
        name, slug,
        description: description || null,
        imageUrl: imageUrl || null,
        active: active !== undefined ? Boolean(active) : true,
        order: Number(order) || 0,
      },
    });

    return NextResponse.json(category, { status: 201 });
  });
}

export async function PUT(req: Request) {
  return guardAdmin(async () => {
    const body = await req.json();
    const { id, ...data } = body || {};

    if (!id) return NextResponse.json({ error: "ID da categoria é obrigatório" }, { status: 400 });

    const existing = await prisma.category.findUnique({ where: { id } });
    if (!existing) return NextResponse.json({ error: "Categoria não encontrada" }, { status: 404 });

    let slug = existing.slug;
    if (data.name && data.name !== existing.name) {
      slug = data.name.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
      const conflict = await prisma.category.findFirst({ where: { slug, id: { not: id } } });
      if (conflict) slug = `${slug}-${Date.now()}`;
    }

    const updateData: any = {};
    if (data.name !== undefined) updateData.name = data.name;
    if (slug !== undefined) updateData.slug = slug;
    if (data.description !== undefined) updateData.description = data.description || null;
    if (data.imageUrl !== undefined) updateData.imageUrl = data.imageUrl || null;
    if (data.active !== undefined) updateData.active = Boolean(data.active);
    if (data.order !== undefined) updateData.order = Number(data.order);

    const category = await prisma.category.update({ where: { id }, data: updateData });
    return NextResponse.json(category);
  });
}

export async function DELETE(req: Request) {
  return guardAdmin(async () => {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "ID da categoria é obrigatório" }, { status: 400 });

    const productCount = await prisma.product.count({ where: { categoryId: id } });
    if (productCount > 0) {
      return NextResponse.json(
        { error: `Categoria possui ${productCount} produto(s). Remova ou mova os produtos primeiro.` },
        { status: 400 }
      );
    }

    await prisma.category.delete({ where: { id } });
    return NextResponse.json({ success: true });
  });
}
