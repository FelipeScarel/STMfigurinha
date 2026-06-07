import Link from "next/link";
import { notFound } from "next/navigation";
import { CheckCircle, Package, ArrowRight, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { prisma } from "@/lib/db";
import { formatCurrency, orderStatusLabel, orderStatusColor } from "@/lib/utils";

type Props = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ pagamento?: string }>;
};

const WHATSAPP_NUMERO = "5519987203886";
const PIX_CHAVE = "19987203886";

export default async function ConfirmacaoPage({ params, searchParams }: Props) {
  const { id } = await params;
  const { pagamento } = await searchParams;

  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      items: true,
      timeline: { orderBy: { createdAt: "desc" } },
    },
  });

  if (!order) notFound();

  const itensTexto = order.items
    .map((item) => {
      const nome = item.itemType === "personalizado" ? "🎨 Figurinha Personalizada" : "📦 Produto";
      return `  ${nome} x${item.quantity} — ${formatCurrency(item.subtotal)}`;
    })
    .join("\n");

  const isDinheiro = pagamento === "dinheiro";
  const isPix = pagamento === "pix";
  const protocolo = order.id.slice(-8).toUpperCase();

  const baseMensagem = encodeURIComponent(
    `🛒 *NOVO PEDIDO — STICKERSHOP*\n\n` +
    `📋 *Protocolo:* #${protocolo}\n` +
    `💰 *Total:* ${formatCurrency(order.total)}\n` +
    `💵 *Pagamento:* ${isDinheiro ? "Dinheiro" : "Pix"}\n\n` +
    `📦 *ITENS:*\n${itensTexto}\n`
  );

  const mensagemDinheiro = encodeURIComponent(
    `🛒 *NOVO PEDIDO — STICKERSHOP*\n\n` +
    `📋 *Protocolo:* #${protocolo}\n` +
    `💰 *Total:* ${formatCurrency(order.total)}\n` +
    `💵 *Pagamento:* Dinheiro\n\n` +
    `📦 *ITENS:*\n${itensTexto}\n\n` +
    `🔐 *Acessar Admin:*\n` +
    `👉 https://stickershop.onrender.com/admin\n` +
    `📧 admin@stickershop.com.br\n` +
    `🔑 admin123\n\n` +
    `_Entre no painel admin, veja o pedido e organize a produção!_`
  );

  const mensagemPix = encodeURIComponent(
    `🛒 *PEDIDO PAGO — STICKERSHOP*\n\n` +
    `📋 *Protocolo:* #${protocolo}\n` +
    `💰 *Valor:* ${formatCurrency(order.total)}\n` +
    `💵 *Pagamento:* Pix (Nubank)\n` +
    `📱 *Chave:* ${PIX_CHAVE}\n\n` +
    `📦 *ITENS:*\n${itensTexto}\n\n` +
    `_Comprovante de pagamento enviado pelo cliente._`
  );

  const mensagem = isDinheiro ? mensagemDinheiro : mensagemPix;
  const whatsappUrl = `https://wa.me/${WHATSAPP_NUMERO}?text=${mensagem}`;

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl text-center">
      <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-100 flex items-center justify-center">
        <CheckCircle className="h-8 w-8 text-green-600" />
      </div>
      <h1 className="text-2xl font-bold mb-2">Pedido Realizado com Sucesso!</h1>
      <p className="text-muted-foreground mb-8">
        {isDinheiro
          ? "Agora envie os detalhes do pedido pelo WhatsApp."
          : isPix
          ? "Seu pedido foi recebido! Faça o Pix para confirmar."
          : "Seu pedido foi recebido e está sendo processado."}
      </p>

      {/* Pix instructions */}
      {isPix && (
        <Card className="text-left mb-6 border-purple-300 bg-purple-50">
          <CardContent className="p-6 text-center space-y-4">
            <div className="w-12 h-12 mx-auto rounded-full bg-purple-200 flex items-center justify-center text-2xl">
              💰
            </div>
            <div>
              <h2 className="font-bold text-lg text-purple-800">Pague com Pix</h2>
              <p className="text-sm text-purple-700 mt-1">
                Chave Pix do Nubank (celular):
              </p>
              <p className="font-mono font-bold text-2xl text-purple-900 mt-2">{PIX_CHAVE}</p>
              <p className="text-sm text-purple-700 mt-2">
                Valor: {formatCurrency(order.total)}
              </p>
            </div>
            <p className="text-xs text-purple-600">
              Faça a transferência Pix e envie o comprovante pelo WhatsApp.
            </p>
            <Button variant="outline" size="sm" asChild className="border-purple-300">
              <a href={whatsappUrl} target="_blank" rel="noopener noreferrer">
                <Send className="mr-2 h-4 w-4" /> Enviar Comprovante
              </a>
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Dinheiro WhatsApp */}
      {isDinheiro && (
        <Card className="text-left mb-6 border-green-300 bg-green-50">
          <CardContent className="p-6 text-center space-y-4">
            <Send className="h-10 w-10 text-green-600 mx-auto" />
            <div>
              <h2 className="font-bold text-lg text-green-800">Pagamento em Dinheiro</h2>
              <p className="text-sm text-green-700 mt-1">
                Clique no botão abaixo para enviar os detalhes do pedido diretamente
                pelo WhatsApp. O pagamento será combinado com o vendedor.
              </p>
            </div>
            <Button size="lg" className="w-full bg-green-600 hover:bg-green-700 text-white" asChild>
              <a href={whatsappUrl} target="_blank" rel="noopener noreferrer">
                <Send className="mr-2 h-5 w-5" />
                Enviar Pedido pelo WhatsApp
              </a>
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Order details */}
      <Card className="text-left mb-8">
        <CardContent className="p-6 space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="font-bold">Pedido #{protocolo}</h2>
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
            <Separator />
            <div className="flex justify-between text-lg font-bold">
              <span>Total</span>
              <span className="text-primary">{formatCurrency(order.total)}</span>
            </div>
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

      <div className="flex gap-3 justify-center flex-wrap">
        {isDinheiro && (
          <Button variant="outline" className="bg-green-50 border-green-300" asChild>
            <a href={whatsappUrl} target="_blank" rel="noopener noreferrer">
              <Send className="mr-2 h-4 w-4" /> WhatsApp
            </a>
          </Button>
        )}
        {isPix && (
          <Button variant="outline" className="bg-purple-50 border-purple-300" asChild>
            <a href={whatsappUrl} target="_blank" rel="noopener noreferrer">
              <Send className="mr-2 h-4 w-4" /> Enviar Comprovante
            </a>
          </Button>
        )}
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
