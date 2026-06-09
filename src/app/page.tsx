import Link from "next/link";
import { Sparkles, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { prisma } from "@/lib/db";
import { ProductCard } from "@/components/vitrine/ProductCard";
import { CategoryCard } from "@/components/vitrine/CategoryCard";
import { FeaturedCarousel } from "@/components/vitrine/FeaturedCarousel";

export default async function HomePage() {
  const categories = await prisma.category.findMany({
    where: { active: true },
    orderBy: { order: "asc" },
    take: 6,
  });

  const featuredProducts = await prisma.product.findMany({
    where: { active: true, featured: true },
    select: {
      id: true, name: true, slug: true, basePrice: true, showPrice: true,
      imageUrl: true, type: true, featured: true,
      category: { select: { id: true, name: true, slug: true } },
      variants: { select: { size: true, finish: true, priceExtra: true, stock: true } },
    },
    take: 10,
  });

  const newProducts = await prisma.product.findMany({
    where: { active: true },
    select: {
      id: true, name: true, slug: true, basePrice: true, showPrice: true,
      imageUrl: true, type: true, featured: true,
      category: { select: { id: true, name: true, slug: true } },
      variants: { select: { size: true, finish: true, priceExtra: true, stock: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 8,
  });

  return (
    <div>
      {/* ====== HERO: Featured Carousel ====== */}
      <FeaturedCarousel
        products={featuredProducts.map((p) => ({
          id: p.id,
          name: p.name,
          slug: p.slug,
          basePrice: p.basePrice,
          showPrice: p.showPrice !== false,
          imageUrl: p.imageUrl,
          categoryName: p.category?.name || "Figurinhas",
        }))}
      />

      {/* ====== Categories ====== */}
      <section className="container mx-auto px-4 py-16">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold">Categorias</h2>
            <p className="text-muted-foreground">Explore por tema</p>
          </div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
          {categories.map((cat) => (
            <CategoryCard key={cat.id} category={cat} />
          ))}
        </div>
      </section>

      {/* ====== New Products ====== */}
      <section className="container mx-auto px-4 py-8 pb-16">
        <div className="mb-8">
          <h2 className="text-2xl font-bold">Novidades</h2>
          <p className="text-muted-foreground">Acabaram de chegar</p>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 md:gap-6">
          {newProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      {/* ====== CTA Personalização ====== */}
      <section className="container mx-auto px-4 py-16">
        <div className="relative bg-gradient-to-r from-blue-600 to-blue-800 rounded-2xl p-8 md:p-12 overflow-hidden">
          <div className="absolute inset-0 bg-black/10" />
          {/* Star dots */}
          <div className="absolute inset-0 pointer-events-none opacity-20">
            <div className="absolute top-[10%] left-[5%] w-[2px] h-[2px] bg-white rounded-full" />
            <div className="absolute top-[30%] left-[20%] w-[1px] h-[1px] bg-white rounded-full" />
            <div className="absolute top-[60%] left-[70%] w-[2px] h-[2px] bg-white rounded-full" />
            <div className="absolute top-[20%] left-[80%] w-[1px] h-[1px] bg-white rounded-full" />
          </div>
          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="text-white space-y-3">
              <h2 className="text-2xl md:text-3xl font-bold">
                Transforme suas fotos em figurinhas!
              </h2>
              <p className="text-white/80 max-w-lg">
                Faça upload da sua imagem, escolha o tamanho e acabamento. Enviamos suas figurinhas personalizadas direto para você.
              </p>
            </div>
            <Button size="lg" variant="secondary" asChild className="shrink-0">
              <Link href="/personalizar">
                <Sparkles className="mr-2 h-5 w-5" />
                Começar Agora
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
