import Link from "next/link";
import { ShoppingBag, Package, Truck, DollarSign, ArrowRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { prisma } from "@/lib/db";
import { formatCurrency, orderStatusLabel, orderStatusColor } from "@/lib/utils";

export default async function AdminDashboard() {
  const [totalOrders, pendingOrders, inProduction, shipped, revenue] = await Promise.all([
    prisma.order.count(),
    prisma.order.count({ where: { status: "aguardando_pagamento" } }),
    prisma.order.count({ where: { status: "em_producao" } }),
    prisma.order.count({ where: { status: "enviado" } }),
    prisma.order.aggregate({
      _sum: { total: true },
      where: { status: { not: "cancelado" } },
    }),
  ]);

  const recentOrders = await prisma.order.findMany({
    include: { user: { select: { name: true, email: true } } },
    orderBy: { createdAt: "desc" },
    take: 10,
  });

  const stats = [
    { label: "Total de Pedidos", value: totalOrders, icon: ShoppingBag, color: "text-blue-600 bg-blue-100" },
    { label: "Aguardando Pagamento", value: pendingOrders, icon: DollarSign, color: "text-yellow-600 bg-yellow-100" },
    { label: "Em Produção", value: inProduction, icon: Package, color: "text-purple-600 bg-purple-100" },
    { label: "Enviados", value: shipped, icon: Truck, color: "text-orange-600 bg-orange-100" },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">Visão geral do seu negócio</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-xl ${stat.color}`}>
                  <stat.icon className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stat.value}</p>
                  <p className="text-xs text-muted-foreground">{stat.label}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Revenue */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-green-100">
              <DollarSign className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-green-600">
                {formatCurrency(revenue._sum.total || 0)}
              </p>
              <p className="text-xs text-muted-foreground">Faturamento total (excluindo cancelados)</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recent Orders */}
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
                  <th className="pb-2 font-medium">Cliente</th>
                  <th className="pb-2 font-medium">Total</th>
                  <th className="pb-2 font-medium">Status</th>
                  <th className="pb-2 font-medium">Data</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map((order) => (
                  <tr key={order.id} className="border-b last:border-0">
                    <td className="py-3">
                      <Link href={`/admin/pedidos/${order.id}`} className="text-primary font-mono text-xs hover:underline">
                        #{order.id.slice(-8).toUpperCase()}
                      </Link>
                    </td>
                    <td className="py-3">{order.user?.name || "Visitante"}</td>
                    <td className="py-3 font-medium">{formatCurrency(order.total)}</td>
                    <td className="py-3">
                      <Badge className={orderStatusColor(order.status)}>
                        {orderStatusLabel(order.status)}
                      </Badge>
                    </td>
                    <td className="py-3 text-muted-foreground text-xs">
                      {new Date(order.createdAt).toLocaleDateString("pt-BR")}
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
