import Link from "next/link";
import { notFound } from "next/navigation";
import { CheckCircle, Package, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { prisma } from "@/lib/db";
import { formatCurrency, orderStatusLabel, orderStatusColor } from "@/lib/utils";

type Props = { params: Promise<{ id: string }> };

export default async function ConfirmacaoPage({ params }: Props) {
  const { id } = await params;

  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      items: true,
      timeline: { orderBy: { createdAt: "desc" } },
    },
  });

  if (!order) notFound();

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl text-center">
      <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-100 flex items-center justify-center">
        <CheckCircle className="h-8 w-8 text-green-600" />
      </div>
      <h1 className="text-2xl font-bold mb-2">Pedido Realizado com Sucesso!</h1>
      <p className="text-muted-foreground mb-8">
        Seu pedido foi recebido e está sendo processado.
      </p>

      <Card className="text-left mb-8">
        <CardContent className="p-6 space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="font-bold">Pedido #{order.id.slice(-8).toUpperCase()}</h2>
            <Badge className={orderStatusColor(order.status)}>
              {orderStatusLabel(order.status)}
            </Badge>
          </div>

          <Separator />

          <div>
            <h3 className="font-medium text-sm mb-2">Itens</h3>
            <div className="space-y-2">
              {order.items.map((item) => (
                <div key={item.id} className="flex justify-between text-sm">
                  <span>
                    {item.itemType === "personalizado" ? "🎨 Figurinha Personalizada" : "📦 Produto"}
                    <span className="text-muted-foreground"> x{item.quantity}</span>
                  </span>
                  <span>{formatCurrency(item.subtotal)}</span>
                </div>
              ))}
            </div>
          </div>

          <Separator />

          <div className="space-y-1 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Subtotal</span>
              <span>{formatCurrency(order.subtotal)}</span>
            </div>
            {order.discountTotal > 0 && (
              <div className="flex justify-between text-green-600">
                <span>Descontos</span>
                <span>-{formatCurrency(order.discountTotal)}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-muted-foreground">Frete</span>
              <span>{order.shipping === 0 ? "Grátis" : formatCurrency(order.shipping)}</span>
            </div>
            <Separator />
            <div className="flex justify-between text-lg font-bold">
              <span>Total</span>
              <span className="text-primary">{formatCurrency(order.total)}</span>
            </div>
          </div>

          <Separator />

          <div>
            <h3 className="font-medium text-sm mb-1">Endereço de Entrega</h3>
            <p className="text-sm text-muted-foreground">
              {order.addressStreet}, {order.addressNumber}
              {order.addressComplement && ` - ${order.addressComplement}`}
              <br />
              {order.addressDistrict} — {order.addressCity}/{order.addressState}
              <br />
              CEP: {order.addressZip}
            </p>
          </div>

          <div>
            <h3 className="font-medium text-sm mb-1">Status</h3>
            <div className="space-y-2">
              {order.timeline.map((t) => (
                <div key={t.id} className="flex items-center gap-2 text-sm">
                  <div className="w-2 h-2 rounded-full bg-primary" />
                  <span>{t.message}</span>
                  <span className="text-xs text-muted-foreground">
                    {new Date(t.createdAt).toLocaleString("pt-BR")}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex gap-3 justify-center">
        <Button variant="outline" asChild>
          <Link href="/meus-pedidos">
            <Package className="mr-2 h-4 w-4" /> Meus Pedidos
          </Link>
        </Button>
        <Button asChild>
          <Link href="/">
            Continuar Comprando <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </div>
    </div>
  );
}
