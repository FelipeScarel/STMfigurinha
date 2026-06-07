import Link from "next/link";
import { Star, Sparkles, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { prisma } from "@/lib/db";
import { ProductCard } from "@/components/vitrine/ProductCard";
import { CategoryCard } from "@/components/vitrine/CategoryCard";

export default async function HomePage() {
  const categories = await prisma.category.findMany({
    where: { active: true },
    orderBy: { order: "asc" },
    take: 6,
  });

  const featuredProducts = await prisma.product.findMany({
    where: { active: true, featured: true },
    include: { category: true, variants: true },
    take: 8,
  });

  const newProducts = await prisma.product.findMany({
    where: { active: true },
    include: { category: true, variants: true },
    orderBy: { createdAt: "desc" },
    take: 8,
  });

  return (
    <div>
      {/* Hero Banner */}
      <section className="relative bg-gradient-to-br from-primary/5 via-primary/10 to-purple-100 overflow-hidden">
        <div className="container mx-auto px-4 py-16 md:py-24">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div className="space-y-6">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight">
                Suas figurinhas,
                <br />
                <span className="text-primary">sua identidade</span>
              </h1>
              <p className="text-lg text-muted-foreground max-w-md">
                Crie figurinhas personalizadas com suas fotos ou escolha entre centenas de designs exclusivos. Acabamentos premium e frete para todo Brasil.
              </p>
              <div className="flex flex-wrap gap-3">
                <Button size="lg" asChild>
                  <Link href="/personalizar">
                    <Sparkles className="mr-2 h-5 w-5" />
                    Criar Figurinha Personalizada
                  </Link>
                </Button>
                <Button size="lg" variant="outline" asChild>
                  <Link href="/categorias/anime">
                    Ver Coleções
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
              <div className="flex gap-6 text-sm text-muted-foreground">
                <span>✓ Frete Grátis acima de R$99</span>
                <span>✓ Produção em 48h</span>
                <span>✓ Acabamento Premium</span>
              </div>
            </div>
            <div className="hidden md:flex justify-center">
              <div className="relative w-80 h-80">
                <div className="absolute inset-0 bg-primary/20 rounded-full blur-3xl" />
                <div className="relative grid grid-cols-2 gap-4 rotate-6">
                  {["🦊", "⭐", "🎮", "🎸"].map((emoji, i) => (
                    <div
                      key={i}
                      className="w-36 h-36 bg-white rounded-2xl shadow-lg flex items-center justify-center text-5xl border-4 border-white hover:scale-105 transition-transform"
                    >
                      {emoji}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
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

      {/* Featured Products */}
      {featuredProducts.length > 0 && (
        <section className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold">Destaques</h2>
              <p className="text-muted-foreground">As mais queridas da galera</p>
            </div>
            <Button variant="ghost" asChild>
              <Link href="/buscar?q=">Ver Todas <ArrowRight className="ml-1 h-4 w-4" /></Link>
            </Button>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 md:gap-6">
            {featuredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>
      )}

      {/* CTA Personalização */}
      <section className="container mx-auto px-4 py-16">
        <div className="relative bg-gradient-to-r from-primary to-purple-600 rounded-2xl p-8 md:p-12 overflow-hidden">
          <div className="absolute inset-0 bg-black/10" />
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

      {/* New Products */}
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
    </div>
  );
}
