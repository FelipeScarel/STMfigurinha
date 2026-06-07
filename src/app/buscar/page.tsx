import { prisma } from "@/lib/db";
import { ProductCard } from "@/components/vitrine/ProductCard";

type Props = { searchParams: Promise<{ q?: string }> };

export default async function SearchPage({ searchParams }: Props) {
  const { q } = await searchParams;
  const query = q || "";

  const products = query
    ? await prisma.product.findMany({
        where: {
          active: true,
          OR: [
            { name: { contains: query } },
            { description: { contains: query } },
            { category: { name: { contains: query } } },
          ],
        },
        include: { category: true, variants: true },
        orderBy: { createdAt: "desc" },
      })
    : await prisma.product.findMany({
        where: { active: true },
        include: { category: true, variants: true },
        orderBy: { createdAt: "desc" },
        take: 40,
      });

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">
          {query ? `Resultados para "${query}"` : "Todas as Figurinhas"}
        </h1>
        <p className="text-muted-foreground mt-1">
          {products.length} {products.length === 1 ? "figurinha encontrada" : "figurinhas encontradas"}
        </p>
      </div>

      {products.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 md:gap-6">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <p className="text-6xl mb-4">🔍</p>
          <h2 className="text-xl font-semibold text-muted-foreground">Nenhum resultado encontrado</h2>
          <p className="text-muted-foreground mt-2">Tente buscar por outro termo.</p>
        </div>
      )}
    </div>
  );
}
