import Link from "next/link";
import { Search } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { prisma } from "@/lib/db";
import { formatCurrency, orderStatusLabel, orderStatusColor } from "@/lib/utils";

export default async function AdminPedidosPage() {
  const orders = await prisma.order.findMany({
    include: {
      user: { select: { name: true, email: true } },
      items: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Pedidos</h1>
          <p className="text-muted-foreground">{orders.length} pedidos no total</p>
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-muted-foreground bg-muted/30">
                  <th className="p-4 font-medium">Pedido</th>
                  <th className="p-4 font-medium">Cliente</th>
                  <th className="p-4 font-medium">Itens</th>
                  <th className="p-4 font-medium">Total</th>
                  <th className="p-4 font-medium">Status</th>
                  <th className="p-4 font-medium">Data</th>
                  <th className="p-4 font-medium"></th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order.id} className="border-b last:border-0 hover:bg-muted/20">
                    <td className="p-4">
                      <span className="font-mono text-xs">#{order.id.slice(-8).toUpperCase()}</span>
                    </td>
                    <td className="p-4">
                      <p className="font-medium">{order.user?.name || "Visitante"}</p>
                      <p className="text-xs text-muted-foreground">{order.user?.email || "—"}</p>
                    </td>
                    <td className="p-4">
                      {order.items.length} {order.items.length === 1 ? "item" : "itens"}
                      {order.items.some(i => i.itemType === "personalizado") && (
                        <Badge variant="secondary" className="ml-2 text-[10px]">Personalizado</Badge>
                      )}
                    </td>
                    <td className="p-4 font-semibold">{formatCurrency(order.total)}</td>
                    <td className="p-4">
                      <Badge className={orderStatusColor(order.status)}>
                        {orderStatusLabel(order.status)}
                      </Badge>
                    </td>
                    <td className="p-4 text-xs text-muted-foreground">
                      {new Date(order.createdAt).toLocaleDateString("pt-BR")}
                    </td>
                    <td className="p-4">
                      <Link href={`/admin/pedidos/${order.id}`} className="text-primary text-xs hover:underline">
                        Ver detalhes →
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
