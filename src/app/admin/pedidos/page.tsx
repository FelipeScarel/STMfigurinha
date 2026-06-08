"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, orderStatusLabel, orderStatusColor } from "@/lib/utils";

interface OrderRow {
  id: string;
  total: number;
  status: string;
  createdAt: string;
  userName: string;
  userEmail: string;
  itemCount: number;
  hasCustom: boolean;
}

export default function AdminPedidosPage() {
  const [orders, setOrders] = useState<OrderRow[]>([]);

  useEffect(() => {
    fetch("/api/admin/orders")
      .then((r) => r.json())
      .then(setOrders)
      .catch(() => {});
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Pedidos</h1>
        <p className="text-muted-foreground">{orders.length} pedidos</p>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-muted-foreground bg-muted/30">
                  <th className="p-4 font-medium">Pedido</th>
                  <th className="p-4 font-medium">Total</th>
                  <th className="p-4 font-medium">Status</th>
                  <th className="p-4 font-medium">Data</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {orders.map((o) => (
                  <tr key={o.id} className="border-b last:border-0 hover:bg-muted/20">
                    <td className="p-4">
                      <span className="font-mono text-xs">#{o.id.slice(-8).toUpperCase()}</span>
                      {o.hasCustom && <Badge variant="secondary" className="ml-2 text-[10px]">Personalizado</Badge>}
                    </td>
                    <td className="p-4 font-semibold">{formatCurrency(o.total)}</td>
                    <td className="p-4">
                      <Badge className={orderStatusColor(o.status)}>{orderStatusLabel(o.status)}</Badge>
                    </td>
                    <td className="p-4 text-xs text-muted-foreground">{new Date(o.createdAt).toLocaleDateString("pt-BR")}</td>
                    <td className="p-4">
                      <Link href={`/admin/pedidos/${o.id}`} className="text-primary text-xs hover:underline">Ver detalhes →</Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
