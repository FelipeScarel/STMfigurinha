import Link from "next/link";
import { Star } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";

type ProductWithRelations = {
  id: string;
  name: string;
  slug: string;
  basePrice: number;
  showPrice?: boolean;
  imageUrl: string | null;
  type: string;
  featured: boolean;
  category: { id: string; name: string; slug: string } | null;
  variants: { size: string; finish: string; priceExtra: number; stock: number }[];
};

export function ProductCard({ product }: { product: ProductWithRelations }) {
  const minPrice = product.basePrice + Math.min(...product.variants.map((v) => v.priceExtra));
  const totalStock = product.variants.reduce((s, v) => s + v.stock, 0);
  const showPrice = product.showPrice !== false;

  return (
    <Link href={`/produtos/${product.slug}`}>
      <Card className="group h-full overflow-hidden hover:shadow-md transition-all duration-300 hover:-translate-y-1">
        {/* Image */}
        <div className="relative aspect-square bg-muted overflow-hidden">
          {product.imageUrl ? (
            <img
              src={product.imageUrl}
              alt={product.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              loading="lazy"
              onError={(e) => {
                const el = e.target as HTMLImageElement;
                el.style.display = "none";
                const parent = el.parentElement;
                if (parent && !parent.querySelector(".img-fallback")) {
                  const fallback = document.createElement("div");
                  fallback.className = "img-fallback w-full h-full flex items-center justify-center text-6xl bg-gradient-to-br from-primary/10 to-blue-900/30";
                  fallback.textContent = "🎴";
                  parent.appendChild(fallback);
                }
              }}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-6xl bg-gradient-to-br from-primary/10 to-blue-900/30">
              🎴
            </div>
          )}
          {product.type === "personalizada" && (
            <Badge className="absolute top-2 left-2 bg-blue-600">Personalizável</Badge>
          )}
          {totalStock === 0 && (
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
              <Badge variant="secondary" className="text-sm">Indisponível</Badge>
            </div>
          )}
        </div>

        <CardContent className="p-4">
          <p className="text-xs text-muted-foreground mb-1">
            {product.category?.name || "Sem categoria"}
          </p>
          <h3 className="font-medium text-sm leading-tight line-clamp-2 mb-2 group-hover:text-primary transition-colors">
            {product.name}
          </h3>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-lg font-bold text-primary">
                {showPrice ? formatCurrency(minPrice) : "Valor a Consultar"}
              </p>
              <p className="text-xs text-muted-foreground">
                {product.variants.length} opções
              </p>
            </div>
            {product.featured && (
              <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
