import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { prisma } from "@/lib/db";
import { formatCurrency, SIZE_LABELS, FINISH_LABELS } from "@/lib/utils";
import { AddToCartButton } from "./AddToCartButton";

type Props = { params: Promise<{ slug: string }> };

export default async function ProductDetailPage({ params }: Props) {
  const { slug } = await params;

  const product = await prisma.product.findUnique({
    where: { slug, active: true },
    include: {
      category: true,
      variants: { orderBy: { size: "asc" } },
    },
  });

  if (!product) notFound();

  const sizes = [...new Set(product.variants.map((v) => v.size))];
  const finishes = [...new Set(product.variants.map((v) => v.finish))];

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <Link
        href={`/categorias/${product.category.slug}`}
        className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-6"
      >
        <ChevronLeft className="h-4 w-4 mr-1" />
        {product.category.name}
      </Link>

      <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
        {/* Image */}
        <div className="relative aspect-square bg-muted rounded-xl overflow-hidden">
          {product.imageUrl ? (
            <Image
              src={product.imageUrl}
              alt={product.name}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 50vw"
              priority
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-8xl bg-gradient-to-br from-primary/10 to-blue-900/30">
              🎴
            </div>
          )}
          {product.type === "personalizada" && (
            <Badge className="absolute top-4 left-4 bg-blue-600 text-sm px-3 py-1">
              Personalizável
            </Badge>
          )}
        </div>

        {/* Info */}
        <div className="space-y-6">
          <div>
            <p className="text-sm text-primary font-medium mb-1">
              {product.category.name}
            </p>
            <h1 className="text-2xl md:text-3xl font-bold">{product.name}</h1>
            {product.description && (
              <p className="text-muted-foreground mt-3 leading-relaxed">
                {product.description}
              </p>
            )}
          </div>

          {/* Variant Selectors & Price */}
          <AddToCartButton
            product={{
              id: product.id,
              name: product.name,
              slug: product.slug,
              imageUrl: product.imageUrl,
              type: product.type,
              basePrice: product.basePrice,
              showPrice: product.showPrice,
            }}
            variants={product.variants.map((v) => ({
              id: v.id,
              size: v.size,
              finish: v.finish,
              priceExtra: v.priceExtra,
              stock: v.stock,
            }))}
          />

          {/* Info cards */}
          <div className="grid grid-cols-3 gap-3 pt-4 border-t">
            <div className="text-center p-3 bg-muted/50 rounded-lg">
              <p className="text-lg font-bold">🏭</p>
              <p className="text-xs text-muted-foreground">Produção</p>
              <p className="text-[10px] text-muted-foreground">em 48h úteis</p>
            </div>
            <div className="text-center p-3 bg-muted/50 rounded-lg">
              <p className="text-lg font-bold">✨</p>
              <p className="text-xs text-muted-foreground">Acabamento</p>
              <p className="text-[10px] text-muted-foreground">Premium</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
