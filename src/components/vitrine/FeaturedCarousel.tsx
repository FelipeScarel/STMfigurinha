"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight, Sparkles, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";

type FeaturedProduct = {
  id: string;
  name: string;
  slug: string;
  basePrice: number;
  showPrice: boolean;
  imageUrl: string | null;
  categoryName: string;
};

export function FeaturedCarousel({ products }: { products: FeaturedProduct[] }) {
  const [current, setCurrent] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const total = products.length;

  const next = useCallback(() => {
    setCurrent((prev) => (prev + 1) % total);
  }, [total]);

  const prev = useCallback(() => {
    setCurrent((prev) => (prev - 1 + total) % total);
  }, [total]);

  // Auto-play
  useEffect(() => {
    if (total <= 1 || isPaused) return;
    const timer = setInterval(next, 4000);
    return () => clearInterval(timer);
  }, [total, isPaused, next]);

  if (total === 0) return null;

  const product = products[current];

  return (
    <section
      className="relative overflow-hidden bg-gradient-to-br from-[#0a1628] via-[#0d2137] to-[#0a1a30]"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Starry background dots */}
      <div className="absolute inset-0 pointer-events-none opacity-30">
        <div className="absolute top-[10%] left-[5%] w-[2px] h-[2px] bg-white rounded-full" />
        <div className="absolute top-[20%] left-[15%] w-[1px] h-[1px] bg-white rounded-full" />
        <div className="absolute top-[35%] left-[25%] w-[2px] h-[2px] bg-white rounded-full" />
        <div className="absolute top-[15%] left-[45%] w-[1px] h-[1px] bg-white rounded-full" />
        <div className="absolute top-[50%] left-[65%] w-[2px] h-[2px] bg-white rounded-full" />
        <div className="absolute top-[30%] left-[80%] w-[1px] h-[1px] bg-white rounded-full" />
        <div className="absolute top-[70%] left-[10%] w-[2px] h-[2px] bg-white rounded-full" />
        <div className="absolute top-[60%] left-[35%] w-[1px] h-[1px] bg-white rounded-full" />
        <div className="absolute top-[75%] left-[55%] w-[2px] h-[2px] bg-white rounded-full" />
        <div className="absolute top-[80%] left-[75%] w-[1px] h-[1px] bg-white rounded-full" />
        <div className="absolute top-[45%] left-[90%] w-[2px] h-[2px] bg-white rounded-full" />
        <div className="absolute top-[5%] left-[70%] w-[1px] h-[1px] bg-white rounded-full" />
      </div>

      <div className="container mx-auto px-4 py-10 md:py-16 relative z-10">
        {/* Section header */}
        <div className="flex items-center gap-3 mb-8">
          <Sparkles className="h-6 w-6 text-blue-400" />
          <h2 className="text-xl md:text-2xl font-bold text-white">Destaques da Semana</h2>
          <div className="h-px flex-1 bg-gradient-to-r from-blue-500/50 to-transparent" />
        </div>

        {/* Carousel */}
        <div className="relative">
          {/* Slide */}
          <div className="grid md:grid-cols-2 gap-8 items-center min-h-[320px]">
            {/* Image */}
            <div className="relative aspect-square md:aspect-[4/3] rounded-2xl overflow-hidden bg-[#0d1f33] border border-blue-900/30 shadow-2xl shadow-blue-500/10">
              {product.imageUrl ? (
                <img
                  src={product.imageUrl}
                  alt={product.name}
                  className="w-full h-full object-cover transition-all duration-700"
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center gap-4 bg-gradient-to-br from-blue-900/40 to-blue-950/60">
                  <span className="text-7xl">🎴</span>
                  <span className="text-blue-300/60 text-sm">Produto artesanal</span>
                </div>
              )}
              {/* Gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-[#0a1628]/60 via-transparent to-transparent" />

              {/* Category badge */}
              <Badge className="absolute top-4 left-4 bg-blue-600/90 text-white border-0 text-xs px-3 py-1 backdrop-blur-sm">
                {product.categoryName}
              </Badge>
            </div>

            {/* Info */}
            <div className="space-y-6 animate-fade-in">
              <div>
                <p className="text-blue-400 text-sm font-medium mb-2 tracking-wider uppercase">
                  ⭐ Em Destaque
                </p>
                <h3 className="text-2xl md:text-3xl lg:text-4xl font-bold text-white leading-tight">
                  {product.name}
                </h3>
              </div>

              <div className="flex items-baseline gap-3">
                <span className="text-3xl md:text-4xl font-black text-blue-400">
                  {product.showPrice !== false
                    ? formatCurrency(product.basePrice)
                    : "Valor a Consultar"}
                </span>
                {product.showPrice !== false && (
                  <span className="text-blue-300/60 text-sm">à vista no PIX</span>
                )}
              </div>

              <div className="flex flex-wrap gap-3">
                <Button
                  size="lg"
                  className="bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-600/30 transition-all hover:shadow-blue-500/40 hover:scale-105"
                  asChild
                >
                  <Link href={`/produtos/${product.slug}`}>
                    <ShoppingCart className="mr-2 h-5 w-5" />
                    Adquira Já
                  </Link>
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="border-blue-700/50 text-blue-300 hover:bg-blue-900/30 hover:text-blue-200 transition-all"
                  asChild
                >
                  <Link href={`/produtos/${product.slug}`}>
                    Ver Detalhes
                  </Link>
                </Button>
              </div>

              {/* Slide indicator */}
              <div className="flex items-center gap-1.5 pt-4">
                {products.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrent(i)}
                    className={`h-1.5 rounded-full transition-all duration-300 ${
                      i === current
                        ? "w-8 bg-blue-400"
                        : "w-1.5 bg-blue-700/50 hover:bg-blue-600/70"
                    }`}
                    aria-label={`Slide ${i + 1}`}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Arrows (only if multiple slides) */}
          {total > 1 && (
            <>
              <button
                onClick={prev}
                className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 md:-translate-x-6 w-10 h-10 md:w-12 md:h-12 rounded-full bg-[#0d2137]/90 border border-blue-700/40 text-blue-300 hover:bg-blue-900/60 hover:text-white flex items-center justify-center transition-all backdrop-blur-sm shadow-lg"
                aria-label="Anterior"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button
                onClick={next}
                className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 md:translate-x-6 w-10 h-10 md:w-12 md:h-12 rounded-full bg-[#0d2137]/90 border border-blue-700/40 text-blue-300 hover:bg-blue-900/60 hover:text-white flex items-center justify-center transition-all backdrop-blur-sm shadow-lg"
                aria-label="Próximo"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </>
          )}
        </div>
      </div>

      {/* Bottom fade */}
      <div className="h-8 bg-gradient-to-b from-transparent to-background" />
    </section>
  );
}
