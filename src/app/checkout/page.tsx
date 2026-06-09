"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Check, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useCartStore } from "@/stores/cart";
import { formatCurrency } from "@/lib/utils";
import { toast } from "sonner";
import Link from "next/link";

const WHATSAPP = "5519987203886";

type Step = "review" | "confirm";

export default function CheckoutPage() {
  const router = useRouter();
  const { items, subtotal, clearCart } = useCartStore();
  const [step, setStep] = useState<Step>("review");
  const [loading, setLoading] = useState(false);
  const [discounts, setDiscounts] = useState<any>(null);

  useEffect(() => {
    if (items.length === 0) router.push("/carrinho");
    fetch("/api/promocoes/calcular", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        items: items.map((i) => ({
          id: i.cartItemId,
          productId: i.productId,
          name: i.name,
          quantity: i.quantity,
          unitPrice: i.unitPrice,
          subtotal: i.unitPrice * i.quantity,
        })),
      }),
    })
      .then((r) => r.json())
      .then(setDiscounts)
      .catch(() => {});
  }, []);

  const totalDiscount = (discounts?.discountTotal || 0) + (discounts?.couponDiscount || 0);
  const total = subtotal() - totalDiscount;
  const totalStr = formatCurrency(total);

  async function finalizar() {
    setLoading(true);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: items.map((i) => ({
            productId: i.productId || null,
            variantId: i.variantId || null,
            uploadId: i.uploadId || null,
            itemType: i.itemType || "produto_pronto",
            quantity: i.quantity || 1,
            unitPrice: i.unitPrice || 0,
          })),
        }),
      });

      if (!res.ok) {
        const texto = await res.text();
        throw new Error(texto || "Erro");
      }

      const order = await res.json();
      const protocolo = order.id.slice(-8).toUpperCase();

      // Monta itens como texto puro
      const itensTexto = items
        .map((i) => {
          const nome = i.itemType === "personalizado" ? "Figurinha Personalizada" : i.name;
          return `- ${nome} x${i.quantity} ${formatCurrency(i.unitPrice * i.quantity)}`;
        })
        .join("\n");

      // Monta mensagem completa e codifica UMA VEZ
      const mensagemPura =
        `*NOVO PEDIDO - STICKERSHOP*\n\n` +
        `*Protocolo:* ${protocolo}\n` +
        `*Total:* ${totalStr}\n\n` +
        `*ITENS:*\n${itensTexto}\n\n` +
        `_Obrigado pela preferência! 🎉_`;

      const msg = encodeURIComponent(mensagemPura);

      clearCart();

      // Abre WhatsApp
      window.open(`https://wa.me/${WHATSAPP}?text=${msg}`, "_blank");

      // Vai pra confirmação
      router.push(`/confirmacao/${order.id}`);
    } catch (err: any) {
      toast.error("Erro ao processar. Tente novamente.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  if (items.length === 0) return null;

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <Link
        href="/carrinho"
        className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-6"
      >
        <ArrowLeft className="h-4 w-4 mr-1" /> Voltar ao carrinho
      </Link>

      <h1 className="text-2xl font-bold mb-8">Checkout</h1>

      <div className="flex gap-2 mb-8">
        <div className="flex items-center gap-2">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${step === "review" ? "bg-primary text-white" : "bg-green-500 text-white"}`}>
            {step === "confirm" ? <Check className="h-4 w-4" /> : 1}
          </div>
          <span className="text-xs hidden sm:inline text-muted-foreground">Revisão</span>
        </div>
        <div className="w-8 h-px bg-border self-center" />
        <div className="flex items-center gap-2">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${step === "confirm" ? "bg-primary text-white" : "bg-muted text-muted-foreground"}`}>
            2
          </div>
          <span className="text-xs hidden sm:inline text-muted-foreground">Confirmação</span>
        </div>
      </div>

      {step === "review" && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Revisão do Pedido</h2>
          <div className="border rounded-xl p-4 space-y-2">
            {items.map((item) => (
              <div key={item.cartItemId} className="flex justify-between text-sm">
                <span>
                  {item.name} <span className="text-muted-foreground">x{item.quantity}</span>
                </span>
                <span>{formatCurrency(item.unitPrice * item.quantity)}</span>
              </div>
            ))}
          </div>
          <div className="space-y-1 text-sm">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>{formatCurrency(subtotal())}</span>
            </div>
            {totalDiscount > 0 && (
              <div className="flex justify-between text-green-600">
                <span>Descontos</span>
                <span>-{formatCurrency(totalDiscount)}</span>
              </div>
            )}
            <Separator />
            <div className="flex justify-between text-lg font-bold">
              <span>Total</span>
              <span className="text-primary">{formatCurrency(total)}</span>
            </div>
          </div>
          <div className="flex justify-end pt-4">
            <Button onClick={() => setStep("confirm")}>Continuar</Button>
          </div>
        </div>
      )}

      {step === "confirm" && (
        <div className="space-y-6 text-center">
          <div className="border rounded-xl p-8 space-y-4">
            <div className="w-16 h-16 mx-auto rounded-full bg-green-100 flex items-center justify-center">
              <Send className="h-8 w-8 text-green-600" />
            </div>
            <h2 className="text-xl font-bold">Finalizar via WhatsApp</h2>
            <p className="text-muted-foreground text-sm max-w-md mx-auto">
              Ao clicar no botão abaixo, seu pedido será registrado e você será
              redirecionado para o <strong>WhatsApp do vendedor</strong> com todos
              os detalhes. Negocie o pagamento diretamente com ele.
            </p>
            <div className="text-lg font-bold text-primary">
              Total: {formatCurrency(total)}
            </div>
            <div className="flex gap-2 justify-center pt-2">
              <Button variant="outline" onClick={() => setStep("review")}>
                Voltar
              </Button>
              <Button size="lg" className="bg-green-600 hover:bg-green-700" onClick={finalizar} disabled={loading}>
                <Send className="mr-2 h-5 w-5" />
                {loading ? "Processando..." : "Finalizar e Chamar no WhatsApp"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
