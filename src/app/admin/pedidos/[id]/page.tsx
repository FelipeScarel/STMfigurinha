import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, Download, Package, ImageIcon } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { prisma } from "@/lib/db";
import { formatCurrency, orderStatusLabel, orderStatusColor } from "@/lib/utils";
import { UpdateStatusButton } from "./UpdateStatusButton";

type Props = { params: Promise<{ id: string }> };

export default async function AdminOrderDetailPage({ params }: Props) {
  const { id } = await params;

  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      user: { select: { name: true, email: true, phone: true } },
      items: true,
      timeline: { orderBy: { createdAt: "asc" } },
      coupon: true,
    },
  });

  if (!order) notFound();

  // Find uploads linked to this order's items
  const uploadIds = order.items
    .filter((i) => i.uploadId)
    .map((i) => i.uploadId!);

  const uploads = uploadIds.length > 0
    ? await prisma.customUpload.findMany({
        where: { id: { in: uploadIds } },
      })
    : [];

  const statusFlow = [
    "aguardando_pagamento",
    "pago",
    "em_producao",
    "enviado",
    "entregue",
  ];

  const currentIdx = statusFlow.indexOf(order.status);
  const nextStatus = currentIdx >= 0 && currentIdx < statusFlow.length - 1
    ? statusFlow[currentIdx + 1]
    : null;

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center gap-2">
        <Link href="/admin/pedidos" className="text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold">Pedido #{order.id.slice(-8).toUpperCase()}</h1>
          <p className="text-sm text-muted-foreground">
            Criado em {new Date(order.createdAt).toLocaleString("pt-BR")}
          </p>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {/* Main info */}
        <div className="md:col-span-2 space-y-6">
          {/* Status */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Status do Pedido</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <Badge className={`text-sm px-3 py-1 ${orderStatusColor(order.status)}`}>
                  {orderStatusLabel(order.status)}
                </Badge>
                {order.coupon && (
                  <Badge variant="secondary" className="text-xs">
                    Cupom: {order.coupon.code}
                  </Badge>
                )}
              </div>

              {/* Status flow */}
              <div className="flex items-center gap-1">
                {statusFlow.map((s, i) => (
                  <div key={s} className="flex items-center gap-1 flex-1">
                    <div className={`flex-1 h-2 rounded-full ${
                      i <= currentIdx ? "bg-primary" : "bg-muted"
                    }`} />
                    {i < statusFlow.length - 1 && (
                      <div className="w-1" />
                    )}
                  </div>
                ))}
              </div>
              <div className="flex justify-between text-[10px] text-muted-foreground">
                {statusFlow.map((s) => (
                  <span key={s}>{orderStatusLabel(s)}</span>
                ))}
              </div>

              {nextStatus && (
                <UpdateStatusButton orderId={order.id} nextStatus={nextStatus} />
              )}
            </CardContent>
          </Card>

          {/* Items */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Itens do Pedido</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {order.items.map((item) => {
                const upload = uploads.find((u) => u.id === item.uploadId);
                return (
                  <div key={item.id} className="flex gap-4 p-4 border rounded-lg">
                    <div className="relative w-20 h-20 rounded-lg overflow-hidden bg-muted shrink-0">
                      {upload?.previewUrl ? (
                        <Image src={upload.previewUrl} alt="Preview" fill className="object-cover" sizes="80px" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <ImageIcon className="h-8 w-8 text-muted-foreground/40" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between">
                        <div>
                          <p className="font-medium">
                            {item.itemType === "personalizado" ? "🎨 Figurinha Personalizada" : "📦 Produto"}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Qtd: {item.quantity} • {formatCurrency(item.unitPrice)}/un
                          </p>
                        </div>
                        <p className="font-bold">{formatCurrency(item.subtotal)}</p>
                      </div>
                      {upload && (
                        <div className="flex gap-2 mt-2">
                          <a
                            href={upload.highResUrl}
                            download
                            className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
                          >
                            <Download className="h-3 w-3" />
                            Alta Resolução (PNG)
                          </a>
                          <a
                            href={upload.originalUrl}
                            download
                            className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
                          >
                            <Download className="h-3 w-3" />
                            Original (WebP)
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}

              {/* Bulk download all personalized */}
              {uploads.length > 0 && (
                <div className="pt-2">
                  <a
                    href={`/api/admin/pedidos/${order.id}/download`}
                    className="inline-flex items-center gap-2 text-sm text-primary hover:underline"
                  >
                    <Package className="h-4 w-4" />
                    Baixar todas as imagens do pedido (.zip)
                  </a>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Customer */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Cliente</CardTitle>
            </CardHeader>
            <CardContent className="text-sm space-y-1">
              <p className="font-medium">{order.user?.name || "Visitante"}</p>
              <p className="text-muted-foreground">{order.user?.email || "—"}</p>
              <p className="text-muted-foreground">{order.user?.phone || "—"}</p>
            </CardContent>
          </Card>

          {/* Address */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Entrega</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              <p>{order.addressStreet}, {order.addressNumber}</p>
              {order.addressComplement && <p>{order.addressComplement}</p>}
              <p>{order.addressDistrict}</p>
              <p>{order.addressCity}/{order.addressState}</p>
              <p>CEP: {order.addressZip}</p>
            </CardContent>
          </Card>

          {/* Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Resumo</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
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
              <div className="flex justify-between font-bold text-lg">
                <span>Total</span>
                <span className="text-primary">{formatCurrency(order.total)}</span>
              </div>
            </CardContent>
          </Card>

          {/* Timeline */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Histórico</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {order.timeline.map((t) => (
                  <div key={t.id} className="flex gap-3 text-sm">
                    <div className="w-2 h-2 rounded-full bg-primary mt-1.5 shrink-0" />
                    <div>
                      <p>{t.message}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(t.createdAt).toLocaleString("pt-BR")}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
