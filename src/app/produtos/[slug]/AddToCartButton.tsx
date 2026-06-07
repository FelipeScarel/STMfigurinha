"use client";

import { useState } from "react";
import { ShoppingCart, Minus, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useCartStore } from "@/stores/cart";
import { formatCurrency, SIZE_LABELS, FINISH_LABELS } from "@/lib/utils";
import { toast } from "sonner";

type VariantInfo = {
  id: string;
  size: string;
  finish: string;
  priceExtra: number;
  stock: number;
};

type ProductInfo = {
  id: string;
  name: string;
  slug: string;
  imageUrl: string | null;
  type: string;
  basePrice: number;
};

export function AddToCartButton({
  product,
  variants,
}: {
  product: ProductInfo;
  variants: VariantInfo[];
}) {
  const [selectedSize, setSelectedSize] = useState(variants[0]?.size || "");
  const [selectedFinish, setSelectedFinish] = useState(variants[0]?.finish || "");
  const [quantity, setQuantity] = useState(1);
  const addItem = useCartStore((s) => s.addItem);

  const currentVariant = variants.find(
    (v) => v.size === selectedSize && v.finish === selectedFinish
  );

  const price = product.basePrice + (currentVariant?.priceExtra || 0);
  const inStock = (currentVariant?.stock || 0) > 0;

  const sizes = [...new Set(variants.map((v) => v.size))];
  const finishes = [...new Set(variants.map((v) => v.finish))];

  // Filtra acabamentos disponíveis para o tamanho selecionado
  const availableFinishes = variants
    .filter((v) => v.size === selectedSize)
    .map((v) => v.finish);

  function handleAddToCart() {
    if (!currentVariant || !inStock) return;

    addItem({
      productId: product.id,
      variantId: currentVariant.id,
      itemType: product.type === "personalizada" ? "personalizado" : "produto_pronto",
      name: product.name,
      imageUrl: product.imageUrl || "/placeholder.png",
      size: SIZE_LABELS[selectedSize] || selectedSize,
      finish: FINISH_LABELS[selectedFinish] || selectedFinish,
      unitPrice: price,
      quantity,
      categoryId: null,
    });

    toast.success(`${product.name} adicionado ao carrinho!`);
  }

  return (
    <div className="space-y-5">
      {/* Size */}
      <div>
        <p className="text-sm font-medium mb-2">Tamanho</p>
        <div className="flex flex-wrap gap-2">
          {sizes.map((size) => (
            <button
              key={size}
              onClick={() => {
                setSelectedSize(size);
                // Se o acabamento atual não existe para este tamanho, troca
                if (!variants.some((v) => v.size === size && v.finish === selectedFinish)) {
                  setSelectedFinish(
                    variants.find((v) => v.size === size)?.finish || selectedFinish
                  );
                }
              }}
              className={`px-4 py-2 rounded-lg border text-sm font-medium transition-all ${
                selectedSize === size
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border hover:border-primary/50"
              }`}
            >
              {SIZE_LABELS[size] || size}
            </button>
          ))}
        </div>
      </div>

      {/* Finish */}
      <div>
        <p className="text-sm font-medium mb-2">Acabamento</p>
        <div className="flex flex-wrap gap-2">
          {finishes.map((finish) => {
            const available = availableFinishes.includes(finish);
            return (
              <button
                key={finish}
                onClick={() => available && setSelectedFinish(finish)}
                disabled={!available}
                className={`px-4 py-2 rounded-lg border text-sm font-medium transition-all ${
                  selectedFinish === finish
                    ? "border-primary bg-primary/10 text-primary"
                    : available
                    ? "border-border hover:border-primary/50"
                    : "border-border opacity-40 cursor-not-allowed line-through"
                }`}
              >
                {FINISH_LABELS[finish] || finish}
              </button>
            );
          })}
        </div>
      </div>

      {/* Price */}
      <div className="flex items-baseline gap-2">
        <span className="text-3xl font-bold text-primary">
          {formatCurrency(price)}
        </span>
        {currentVariant?.priceExtra > 0 && (
          <span className="text-sm text-muted-foreground">
            ({formatCurrency(product.basePrice)} + {formatCurrency(currentVariant.priceExtra)})
          </span>
        )}
      </div>

      {/* Stock */}
      {currentVariant && (
        <Badge variant={inStock ? "secondary" : "destructive"} className="text-xs">
          {inStock ? `${currentVariant.stock} em estoque` : "Indisponível"}
        </Badge>
      )}

      {/* Quantity + Add to Cart */}
      <div className="flex items-center gap-3">
        <div className="flex items-center border rounded-lg">
          <Button
            variant="ghost"
            size="icon"
            className="h-10 w-10"
            onClick={() => setQuantity(Math.max(1, quantity - 1))}
            disabled={!inStock}
          >
            <Minus className="h-4 w-4" />
          </Button>
          <span className="w-10 text-center font-medium">{quantity}</span>
          <Button
            variant="ghost"
            size="icon"
            className="h-10 w-10"
            onClick={() => setQuantity(quantity + 1)}
            disabled={!inStock}
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
        <Button
          className="flex-1"
          size="lg"
          disabled={!inStock}
          onClick={handleAddToCart}
        >
          <ShoppingCart className="mr-2 h-5 w-5" />
          Adicionar ao Carrinho
        </Button>
      </div>
    </div>
  );
}
