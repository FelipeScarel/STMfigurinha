"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ShoppingBag, Package, Truck, DollarSign, ArrowRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatCurrency, orderStatusLabel, orderStatusColor } from "@/lib/utils";

interface OrderRow {
  id: string;
  total: number;
  status: string;
  createdAt: string;
  userName: string;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState({ total: 0, pending: 0, production: 0, shipped: 0, revenue: 0 });
  const [orders, setOrders] = useState<OrderRow[]>([]);

  useEffect(() => {
    fetch("/api/admin/stats")
      .then((r) => r.json())
      .then(setStats)
      .catch(() => {});

    fetch("/api/admin/orders/recent")
      .then((r) => r.json())
      .then(setOrders)
      .catch(() => {});
  }, []);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">Visão geral do seu negócio</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl text-blue-600 bg-blue-100">
                <ShoppingBag className="h-5 w-5" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.total}</p>
                <p className="text-xs text-muted-foreground">Total de Pedidos</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl text-yellow-600 bg-yellow-100">
                <DollarSign className="h-5 w-5" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.pending}</p>
                <p className="text-xs text-muted-foreground">Aguardando</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl text-purple-600 bg-purple-100">
                <Package className="h-5 w-5" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.production}</p>
                <p className="text-xs text-muted-foreground">Em Produção</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl text-orange-600 bg-orange-100">
                <Truck className="h-5 w-5" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.shipped}</p>
                <p className="text-xs text-muted-foreground">Enviados</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-green-100">
              <DollarSign className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-green-600">{formatCurrency(stats.revenue)}</p>
              <p className="text-xs text-muted-foreground">Faturamento total</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Pedidos Recentes</CardTitle>
          <Button variant="ghost" size="sm" asChild>
            <Link href="/admin/pedidos">Ver Todos <ArrowRight className="ml-1 h-4 w-4" /></Link>
          </Button>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-muted-foreground">
                  <th className="pb-2 font-medium">Pedido</th>
                  <th className="pb-2 font-medium">Total</th>
                  <th className="pb-2 font-medium">Status</th>
                  <th className="pb-2 font-medium">Data</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {orders.map((o) => (
                  <tr key={o.id} className="border-b last:border-0">
                    <td className="py-3 font-mono text-xs">#{o.id.slice(-8).toUpperCase()}</td>
                    <td className="py-3 font-medium">{formatCurrency(o.total)}</td>
                    <td className="py-3">
                      <Badge className={orderStatusColor(o.status)}>{orderStatusLabel(o.status)}</Badge>
                    </td>
                    <td className="py-3 text-xs text-muted-foreground">
                      {new Date(o.createdAt).toLocaleDateString("pt-BR")}
                    </td>
                    <td className="py-3">
                      <Link href={`/admin/pedidos/${o.id}`} className="text-primary text-xs hover:underline">
                        Ver →
                      </Link>
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
