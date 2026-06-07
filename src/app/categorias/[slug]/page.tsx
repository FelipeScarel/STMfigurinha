import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { ProductCard } from "@/components/vitrine/ProductCard";

type Props = { params: Promise<{ slug: string }> };

export default async function CategoryPage({ params }: Props) {
  const { slug } = await params;

  const category = await prisma.category.findUnique({
    where: { slug, active: true },
  });

  if (!category) notFound();

  const products = await prisma.product.findMany({
    where: { categoryId: category.id, active: true },
    include: { category: true, variants: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold">{category.name}</h1>
        {category.description && (
          <p className="text-muted-foreground mt-1">{category.description}</p>
        )}
        <p className="text-sm text-muted-foreground mt-2">
          {products.length} {products.length === 1 ? "figurinha encontrada" : "figurinhas encontradas"}
        </p>
      </div>

      {/* Products Grid */}
      {products.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 md:gap-6">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <p className="text-6xl mb-4">📭</p>
          <h2 className="text-xl font-semibold text-muted-foreground">
            Nenhuma figurinha nesta categoria ainda
          </h2>
          <p className="text-muted-foreground mt-2">
            Volte em breve! Estamos sempre adicionando novidades.
          </p>
        </div>
      )}
    </div>
  );
}
