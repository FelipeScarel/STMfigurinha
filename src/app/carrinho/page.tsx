"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Trash2, Minus, Plus, ShoppingBag, ArrowRight, Tag, Percent } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { useCartStore, type CartItemType } from "@/stores/cart";
import { formatCurrency } from "@/lib/utils";
import { toast } from "sonner";

export default function CartPage() {
  const { items, removeItem, updateQuantity, subtotal } = useCartStore();
  const [couponCode, setCouponCode] = useState("");
  const [discounts, setDiscounts] = useState<{
    discountTotal: number;
    appliedRules: { id: string; name: string; discountAmount: number }[];
    couponDiscount: number;
    couponId: string | null;
  } | null>(null);
  const [loadingDiscount, setLoadingDiscount] = useState(false);

  useEffect(() => {
    if (items.length === 0) { setDiscounts(null); return; }
    fetchDiscounts();
  }, [items]);

  async function fetchDiscounts(code?: string) {
    setLoadingDiscount(true);
    try {
      const cartForEngine = items.map((i) => ({
        id: i.cartItemId,
        productId: i.productId,
        name: i.name,
        quantity: i.quantity,
        unitPrice: i.unitPrice,
        subtotal: i.unitPrice * i.quantity,
      }));
      const res = await fetch("/api/promocoes/calcular", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items: cartForEngine, couponCode: code || couponCode }),
      });
      if (res.ok) setDiscounts(await res.json());
    } catch { /* fallback */ }
    finally { setLoadingDiscount(false); }
  }

  function handleApplyCoupon() {
    if (!couponCode.trim()) return;
    fetchDiscounts(couponCode.trim().toUpperCase());
    toast.success(`Cupom ${couponCode.toUpperCase()} aplicado!`);
  }

  const totalDiscount = (discounts?.discountTotal || 0) + (discounts?.couponDiscount || 0);
  const total = subtotal() - totalDiscount;

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <ShoppingBag className="h-20 w-20 text-muted-foreground/20 mx-auto mb-4" />
        <h1 className="text-2xl font-bold mb-2">Seu carrinho está vazio</h1>
        <p className="text-muted-foreground mb-8">Que tal explorar nossas figurinhas?</p>
        <Button size="lg" asChild>
          <Link href="/">Ver Figurinhas</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-8">Meu Carrinho ({items.length} itens)</h1>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Items */}
        <div className="lg:col-span-2 space-y-4">
          {items.map((item) => (
            <div key={item.cartItemId} className="flex gap-4 p-4 border rounded-xl">
              <div className="relative w-20 h-20 md:w-24 md:h-24 rounded-lg overflow-hidden bg-muted shrink-0">
                <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between">
                  <div>
                    <h3 className="font-semibold">{item.name}</h3>
                    <p className="text-sm text-muted-foreground">{item.size} • {item.finish}</p>
                    {item.itemType === "personalizado" && (
                      <Badge variant="secondary" className="mt-1 text-[10px]">Personalizada</Badge>
                    )}
                  </div>
                  <p className="font-bold text-primary">{formatCurrency(item.unitPrice * item.quantity)}</p>
                </div>
                <div className="flex items-center justify-between mt-3">
                  <div className="flex items-center border rounded-lg">
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => updateQuantity(item.cartItemId, item.quantity - 1)}>
                      <Minus className="h-3 w-3" />
                    </Button>
                    <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => updateQuantity(item.cartItemId, item.quantity + 1)}>
                      <Plus className="h-3 w-3" />
                    </Button>
                  </div>
                  <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700" onClick={() => removeItem(item.cartItemId)}>
                    <Trash2 className="h-4 w-4 mr-1" /> Remover
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Summary */}
        <div className="lg:col-span-1">
          <div className="border rounded-xl p-6 sticky top-24 space-y-4">
            <h3 className="font-bold text-lg">Resumo</h3>

            {/* Coupon */}
            <div>
              <p className="text-sm font-medium mb-1.5">Cupom de desconto</p>
              <div className="flex gap-2">
                <Input placeholder="Código" value={couponCode} onChange={(e) => setCouponCode(e.target.value.toUpperCase())} className="h-9" />
                <Button size="sm" variant="outline" onClick={handleApplyCoupon} disabled={loadingDiscount}>
                  {loadingDiscount ? "..." : "Aplicar"}
                </Button>
              </div>
            </div>

            <Separator />

            {/* Totals */}
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span>{formatCurrency(subtotal())}</span>
              </div>

              {discounts?.appliedRules.map((rule) => (
                <div key={rule.id} className="flex justify-between text-green-600">
                  <span className="flex items-center gap-1">
                    <Percent className="h-3 w-3" /> {rule.name}
                  </span>
                  <span>-{formatCurrency(rule.discountAmount)}</span>
                </div>
              ))}

              {discounts && discounts.couponDiscount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span className="flex items-center gap-1">
                    <Tag className="h-3 w-3" /> Cupom {couponCode}
                  </span>
                  <span>-{formatCurrency(discounts.couponDiscount)}</span>
                </div>
              )}

              <Separator />

              <div className="flex justify-between text-lg font-bold">
                <span>Total</span>
                <span className="text-primary">{formatCurrency(total)}</span>
              </div>
            </div>

            <Button className="w-full" size="lg" asChild>
              <Link href="/checkout">
                Finalizar Compra <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
