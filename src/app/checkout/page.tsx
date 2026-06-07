"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { ArrowLeft, QrCode, Check, Banknote, Copy, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useCartStore } from "@/stores/cart";
import { formatCurrency } from "@/lib/utils";
import { toast } from "sonner";
import Link from "next/link";

const PIX_CHAVE = "19987203886"; // Chave Pix Nubank - celular
const WHATSAPP_NUMERO = "5519987203886";

type Step = "review" | "payment";

export default function CheckoutPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const { items, subtotal, clearCart } = useCartStore();
  const [step, setStep] = useState<Step>("review");
  const [loading, setLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<"pix" | "dinheiro">("pix");
  const [discounts, setDiscounts] = useState<any>(null);

  useEffect(() => {
    if (items.length === 0) router.push("/carrinho");
    fetch("/api/promocoes/calcular", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ items: items.map((i) => ({
        id: i.cartItemId, productId: i.productId, name: i.name,
        quantity: i.quantity, unitPrice: i.unitPrice, subtotal: i.unitPrice * i.quantity,
      })) }),
    }).then(r => r.json()).then(setDiscounts).catch(() => {});
  }, []);

  const totalDiscount = (discounts?.discountTotal || 0) + (discounts?.couponDiscount || 0);
  const total = subtotal() - totalDiscount;

  function copiarChavePix() {
    navigator.clipboard.writeText(PIX_CHAVE);
    toast.success("Chave Pix copiada!");
  }

  async function handlePlaceOrder() {
    setLoading(true);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: items.map((i) => ({
            productId: i.productId,
            variantId: i.variantId || null,
            uploadId: i.uploadId || null,
            itemType: i.itemType,
            quantity: i.quantity,
            unitPrice: i.unitPrice,
          })),
          couponId: discounts?.couponId || null,
          promotionRuleId: discounts?.appliedRules?.[0]?.id || null,
          paymentMethod,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Erro");
      }

      const order = await res.json();
      clearCart();
      router.push(`/confirmacao/${order.id}?pagamento=${paymentMethod}`);
    } catch (err: any) {
      toast.error(err.message || "Erro ao criar pedido.");
    } finally {
      setLoading(false);
    }
  }

  if (items.length === 0) return null;

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <Link href="/carrinho" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-6">
        <ArrowLeft className="h-4 w-4 mr-1" /> Voltar ao carrinho
      </Link>

      <h1 className="text-2xl font-bold mb-8">Checkout</h1>

      {/* Steps */}
      <div className="flex gap-2 mb-8">
        {(["review", "payment"] as Step[]).map((s, i) => (
          <div key={s} className="flex items-center gap-2">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
              step === s ? "bg-primary text-white" : step === "payment" && s === "review" ? "bg-green-500 text-white" : "bg-muted text-muted-foreground"
            }`}>
              {step === "payment" && s === "review" ? <Check className="h-4 w-4" /> : i + 1}
            </div>
            <span className="text-xs hidden sm:inline text-muted-foreground">
              {["Revisão", "Pagamento"][i]}
            </span>
            {i < 1 && <div className="w-8 h-px bg-border" />}
          </div>
        ))}
      </div>

      {/* Step 1: Review */}
      {step === "review" && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Revisão do Pedido</h2>
          <div className="border rounded-xl p-4 space-y-2">
            {items.map(item => (
              <div key={item.cartItemId} className="flex justify-between text-sm">
                <span>{item.name} <span className="text-muted-foreground">x{item.quantity}</span></span>
                <span>{formatCurrency(item.unitPrice * item.quantity)}</span>
              </div>
            ))}
          </div>
          <div className="space-y-1 text-sm">
            <div className="flex justify-between"><span>Subtotal</span><span>{formatCurrency(subtotal())}</span></div>
            {totalDiscount > 0 && <div className="flex justify-between text-green-600"><span>Descontos</span><span>-{formatCurrency(totalDiscount)}</span></div>}
            <Separator />
            <div className="flex justify-between text-lg font-bold"><span>Total</span><span className="text-primary">{formatCurrency(total)}</span></div>
          </div>
          <div className="flex justify-end pt-4">
            <Button onClick={() => setStep("payment")}>Ir para Pagamento</Button>
          </div>
        </div>
      )}

      {/* Step 2: Payment */}
      {step === "payment" && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Forma de Pagamento</h2>

          <div className="space-y-2">
            <button
              onClick={() => setPaymentMethod("pix")}
              className={`w-full flex items-center gap-3 p-4 rounded-xl border transition-all ${
                paymentMethod === "pix" ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"
              }`}
            >
              <QrCode className="h-5 w-5" />
              <div className="text-left flex-1">
                <p className="font-medium text-sm">Pix</p>
                <p className="text-xs text-muted-foreground">Pagamento instantâneo via Nubank</p>
              </div>
              {paymentMethod === "pix" && <Check className="h-5 w-5 text-primary" />}
            </button>

            <button
              onClick={() => setPaymentMethod("dinheiro")}
              className={`w-full flex items-center gap-3 p-4 rounded-xl border transition-all ${
                paymentMethod === "dinheiro" ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"
              }`}
            >
              <Banknote className="h-5 w-5" />
              <div className="text-left flex-1">
                <p className="font-medium text-sm">Dinheiro</p>
                <p className="text-xs text-muted-foreground">Pagamento combinado via WhatsApp</p>
              </div>
              {paymentMethod === "dinheiro" && <Check className="h-5 w-5 text-primary" />}
            </button>
          </div>

          {/* Pix info */}
          {paymentMethod === "pix" && (
            <div className="bg-purple-50 border border-purple-200 rounded-xl p-4 space-y-3">
              <div className="flex items-center gap-2 text-purple-800">
                <QrCode className="h-5 w-5" />
                <span className="font-semibold">Pix — Chave do Nubank</span>
              </div>
              <div className="bg-white rounded-lg p-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">Chave Pix (celular)</p>
                    <p className="font-mono font-bold text-lg">{PIX_CHAVE}</p>
                  </div>
                </div>
                <Button variant="outline" size="sm" onClick={copiarChavePix}>
                  <Copy className="h-3 w-3 mr-1" /> Copiar
                </Button>
              </div>
              <p className="text-xs text-purple-700">
                Após finalizar, faça o Pix no valor de {formatCurrency(total)}. O pedido será confirmado após o pagamento.
              </p>
            </div>
          )}

          {/* Dinheiro info */}
          {paymentMethod === "dinheiro" && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-800">
              Ao finalizar, você será redirecionado para enviar os detalhes do pedido diretamente
              pelo WhatsApp. O pagamento é combinado diretamente com o vendedor.
            </div>
          )}

          <div className="pt-4 space-y-2">
            <div className="flex justify-between text-lg font-bold">
              <span>Total a pagar</span>
              <span className="text-primary">{formatCurrency(total)}</span>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setStep("review")}>Voltar</Button>
              <Button className="flex-1" size="lg" onClick={handlePlaceOrder} disabled={loading}>
                {loading ? "Processando..." : "Finalizar Pedido"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
