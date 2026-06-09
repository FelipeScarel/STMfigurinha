"use client";

import Link from "next/link";
import { Trash2, Minus, Plus, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useCartStore } from "@/stores/cart";
import { formatCurrency } from "@/lib/utils";
import Image from "next/image";

export function CartDrawer({ onClose }: { onClose: () => void }) {
  const { items, removeItem, updateQuantity, subtotal } = useCartStore();

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[80vh] text-center p-6">
        <ShoppingBag className="h-16 w-16 text-muted-foreground/30 mb-4" />
        <p className="text-lg font-medium text-muted-foreground">Seu carrinho está vazio</p>
        <p className="text-sm text-muted-foreground/60 mt-1 mb-6">
          Explore nossas figurinhas e encontre as suas favoritas!
        </p>
        <Button asChild onClick={onClose}>
          <Link href="/">Ver Figurinhas</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[85vh]">
      {/* Items */}
      <div className="flex-1 overflow-y-auto -mx-6 px-6 space-y-4">
        {items.map((item) => (
          <div key={item.cartItemId} className="flex gap-3 py-3 border-b last:border-0">
            <div className="relative w-16 h-16 rounded-md overflow-hidden bg-muted shrink-0">
              <Image
                src={item.imageUrl}
                alt={item.name}
                fill
                className="object-cover"
                sizes="64px"
              />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{item.name}</p>
              <p className="text-xs text-muted-foreground">
                {item.size} • {item.finish}
              </p>
              {item.itemType === "personalizado" && (
                <span className="text-[10px] bg-blue-500/15 text-blue-400 px-1.5 py-0.5 rounded-full">
                  Personalizada
                </span>
              )}
              <div className="flex items-center justify-between mt-2">
                <div className="flex items-center gap-1">
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-7 w-7"
                    onClick={() => updateQuantity(item.cartItemId, item.quantity - 1)}
                  >
                    <Minus className="h-3 w-3" />
                  </Button>
                  <span className="w-8 text-center text-sm">{item.quantity}</span>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-7 w-7"
                    onClick={() => updateQuantity(item.cartItemId, item.quantity + 1)}
                  >
                    <Plus className="h-3 w-3" />
                  </Button>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold">
                    {formatCurrency(item.unitPrice * item.quantity)}
                  </span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-muted-foreground hover:text-red-600"
                    onClick={() => removeItem(item.cartItemId)}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="mt-4 pt-4 border-t">
        <div className="flex justify-between text-sm mb-1">
          <span className="text-muted-foreground">Subtotal</span>
          <span>{formatCurrency(subtotal())}</span>
        </div>
        <p className="text-xs text-muted-foreground mb-4">
          Descontos calculados no checkout
        </p>
        <Button className="w-full" size="lg" asChild onClick={onClose}>
          <Link href="/carrinho">Ir para o Carrinho</Link>
        </Button>
        <Button variant="outline" className="w-full mt-2" size="lg" asChild onClick={onClose}>
          <Link href="/checkout">Finalizar Compra</Link>
        </Button>
      </div>
    </div>
  );
}
