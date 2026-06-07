"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { ArrowLeft, CreditCard, QrCode, Barcode, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useCartStore } from "@/stores/cart";
import { formatCurrency } from "@/lib/utils";
import { toast } from "sonner";
import Link from "next/link";

type Step = "address" | "review" | "payment";

export default function CheckoutPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const { items, subtotal, clearCart } = useCartStore();
  const [step, setStep] = useState<Step>("address");
  const [loading, setLoading] = useState(false);
  const [address, setAddress] = useState({
    street: "", number: "", complement: "",
    district: "", city: "", state: "", zip: "",
  });
  const [paymentMethod, setPaymentMethod] = useState<"pix" | "card" | "boleto">("pix");
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
  const shipping = subtotal() >= 99 ? 0 : 15.9;
  const total = subtotal() - totalDiscount + shipping;

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
          address,
          couponId: discounts?.couponId || null,
          promotionRuleId: discounts?.appliedRules?.[0]?.id || null,
          paymentMethod,
        }),
      });

      if (!res.ok) throw new Error((await res.json()).error || "Erro");

      const order = await res.json();
      clearCart();
      router.push(`/confirmacao/${order.id}`);
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
        {(["address", "review", "payment"] as Step[]).map((s, i) => (
          <div key={s} className="flex items-center gap-2">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
              step === s ? "bg-primary text-white" : step === "review" && s === "address" || step === "payment" && s !== "payment" ? "bg-green-500 text-white" : "bg-muted text-muted-foreground"
            }`}>
              {step === "payment" && s !== "payment" ? <Check className="h-4 w-4" /> : step === "review" && s === "address" ? <Check className="h-4 w-4" /> : i + 1}
            </div>
            <span className="text-xs hidden sm:inline text-muted-foreground">
              {["Endereço", "Revisão", "Pagamento"][i]}
            </span>
            {i < 2 && <div className="w-8 h-px bg-border" />}
          </div>
        ))}
      </div>

      {/* Step 1: Address */}
      {step === "address" && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Endereço de Entrega</h2>
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <Label>Rua</Label>
              <Input value={address.street} onChange={e => setAddress({...address, street: e.target.value})} placeholder="Rua Exemplo" />
            </div>
            <div>
              <Label>Número</Label>
              <Input value={address.number} onChange={e => setAddress({...address, number: e.target.value})} placeholder="123" />
            </div>
            <div>
              <Label>Complemento</Label>
              <Input value={address.complement} onChange={e => setAddress({...address, complement: e.target.value})} placeholder="Apto 45" />
            </div>
            <div>
              <Label>Bairro</Label>
              <Input value={address.district} onChange={e => setAddress({...address, district: e.target.value})} placeholder="Centro" />
            </div>
            <div>
              <Label>Cidade</Label>
              <Input value={address.city} onChange={e => setAddress({...address, city: e.target.value})} placeholder="São Paulo" />
            </div>
            <div>
              <Label>Estado</Label>
              <Input value={address.state} onChange={e => setAddress({...address, state: e.target.value})} placeholder="SP" maxLength={2} />
            </div>
            <div>
              <Label>CEP</Label>
              <Input value={address.zip} onChange={e => setAddress({...address, zip: e.target.value})} placeholder="00000-000" />
            </div>
          </div>
          <div className="flex justify-end pt-4">
            <Button onClick={() => setStep("review")} disabled={!address.street || !address.number || !address.city}>
              Continuar para Revisão
            </Button>
          </div>
        </div>
      )}

      {/* Step 2: Review */}
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
            <div className="flex justify-between"><span>Frete</span><span>{shipping === 0 ? "Grátis" : formatCurrency(shipping)}</span></div>
            <Separator />
            <div className="flex justify-between text-lg font-bold"><span>Total</span><span className="text-primary">{formatCurrency(total)}</span></div>
          </div>
          <div className="flex gap-2 justify-end pt-4">
            <Button variant="outline" onClick={() => setStep("address")}>Voltar</Button>
            <Button onClick={() => setStep("payment")}>Ir para Pagamento</Button>
          </div>
        </div>
      )}

      {/* Step 3: Payment */}
      {step === "payment" && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Forma de Pagamento</h2>
          <div className="space-y-2">
            {[
              { id: "pix" as const, label: "Pix", icon: QrCode, desc: "Pagamento instantâneo" },
              { id: "card" as const, label: "Cartão de Crédito", icon: CreditCard, desc: "Até 3x sem juros" },
              { id: "boleto" as const, label: "Boleto", icon: Barcode, desc: "Vencimento em 3 dias" },
            ].map((method) => (
              <button key={method.id}
                onClick={() => setPaymentMethod(method.id)}
                className={`w-full flex items-center gap-3 p-4 rounded-xl border transition-all ${
                  paymentMethod === method.id ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"
                }`}
              >
                <method.icon className="h-5 w-5" />
                <div className="text-left">
                  <p className="font-medium text-sm">{method.label}</p>
                  <p className="text-xs text-muted-foreground">{method.desc}</p>
                </div>
                {paymentMethod === method.id && <Check className="h-5 w-5 text-primary ml-auto" />}
              </button>
            ))}
          </div>

          <div className="pt-4 space-y-2">
            <div className="flex justify-between text-lg font-bold">
              <span>Total a pagar</span>
              <span className="text-primary">{formatCurrency(total)}</span>
            </div>
            <Button className="w-full" size="lg" onClick={handlePlaceOrder} disabled={loading}>
              {loading ? "Processando..." : "Finalizar Pedido"}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
