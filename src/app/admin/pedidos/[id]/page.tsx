"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Download, Package, ImageIcon } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { formatCurrency, orderStatusLabel, orderStatusColor } from "@/lib/utils";
import { toast } from "sonner";

const statusFlow = ["aguardando_pagamento", "pago", "em_producao", "enviado", "entregue"];

export default function AdminOrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const [id, setId] = useState<string | null>(null);
  const router = useRouter();
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    params.then((p) => setId(p.id));
  }, [params]);

  useEffect(() => {
    if (!id) return;
    fetch(`/api/admin/orders/${id}`)
      .then((r) => r.json())
      .then(setOrder)
      .catch(() => {});
  }, [id]);

  async function updateStatus(nextStatus: string) {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/pedidos/${id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus }),
      });
      if (!res.ok) throw new Error("Erro");
      toast.success(`Status atualizado!`);
      router.refresh();
      // Recarrega
      const r = await fetch(`/api/admin/orders/${id}`);
      setOrder(await r.json());
    } catch {
      toast.error("Erro ao atualizar");
    } finally {
      setLoading(false);
    }
  }

  if (!order) return <div className="p-8 text-muted-foreground">Carregando...</div>;

  const currentIdx = statusFlow.indexOf(order.status);
  const nextStatus = currentIdx >= 0 && currentIdx < statusFlow.length - 1 ? statusFlow[currentIdx + 1] : null;

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center gap-2">
        <Link href="/admin/pedidos" className="text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold">Pedido #{order.id.slice(-8).toUpperCase()}</h1>
          <p className="text-sm text-muted-foreground">{new Date(order.createdAt).toLocaleString("pt-BR")}</p>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader><CardTitle className="text-lg">Status</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <Badge className={`text-sm px-3 py-1 ${orderStatusColor(order.status)}`}>
                {orderStatusLabel(order.status)}
              </Badge>
              <div className="flex items-center gap-1">
                {statusFlow.map((s, i) => (
                  <div key={s} className="flex items-center gap-1 flex-1">
                    <div className={`flex-1 h-2 rounded-full ${i <= currentIdx ? "bg-primary" : "bg-muted"}`} />
                  </div>
                ))}
              </div>
              <div className="flex justify-between text-[10px] text-muted-foreground">
                {statusFlow.map((s) => (
                  <span key={s}>{orderStatusLabel(s)}</span>
                ))}
              </div>
              {nextStatus && (
                <Button onClick={() => updateStatus(nextStatus)} disabled={loading} className="w-full">
                  {loading ? "..." : `Marcar como "${orderStatusLabel(nextStatus)}"`}
                </Button>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="text-lg">Itens</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              {order.items.map((item: any) => (
                <div key={item.id} className="flex gap-4 p-4 border rounded-lg">
                  <div className="relative w-20 h-20 rounded-lg overflow-hidden bg-muted shrink-0">
                    {item.upload?.previewUrl ? (
                      <img src={item.upload.previewUrl} alt="Preview" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <ImageIcon className="h-8 w-8 text-muted-foreground/40" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between">
                      <div>
                        <p className="font-medium">{item.itemType === "personalizado" ? "🎨 Figurinha Personalizada" : "📦 Produto"}</p>
                        <p className="text-sm text-muted-foreground">Qtd: {item.quantity} • {formatCurrency(item.unitPrice)}/un</p>
                      </div>
                      <p className="font-bold">{formatCurrency(item.subtotal)}</p>
                    </div>
                    {item.upload && (
                      <div className="flex gap-2 mt-2">
                        <a href={item.upload.highResUrl} download className="inline-flex items-center gap-1 text-xs text-primary hover:underline">
                          <Download className="h-3 w-3" /> Alta Res (PNG)
                        </a>
                        <a href={item.upload.originalUrl} download className="inline-flex items-center gap-1 text-xs text-primary hover:underline">
                          <Download className="h-3 w-3" /> Original
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              ))}
              {order.items.some((i: any) => i.upload) && (
                <div className="pt-2">
                  <a href={`/api/admin/pedidos/${id}/download`} className="inline-flex items-center gap-2 text-sm text-primary hover:underline">
                    <Package className="h-4 w-4" /> Baixar todas (.zip)
                  </a>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader><CardTitle className="text-lg">Resumo</CardTitle></CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-muted-foreground">Subtotal</span><span>{formatCurrency(order.subtotal)}</span></div>
              {order.discountTotal > 0 && <div className="flex justify-between text-green-600"><span>Descontos</span><span>-{formatCurrency(order.discountTotal)}</span></div>}
              <Separator />
              <div className="flex justify-between font-bold text-lg"><span>Total</span><span className="text-primary">{formatCurrency(order.total)}</span></div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="text-lg">Histórico</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-3">
                {order.timeline.map((t: any) => (
                  <div key={t.id} className="flex gap-3 text-sm">
                    <div className="w-2 h-2 rounded-full bg-primary mt-1.5 shrink-0" />
                    <div>
                      <p>{t.message}</p>
                      <p className="text-xs text-muted-foreground">{new Date(t.createdAt).toLocaleString("pt-BR")}</p>
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
