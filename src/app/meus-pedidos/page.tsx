import Link from "next/link";
import { redirect } from "next/navigation";
import { Package, ArrowRight, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { formatCurrency, orderStatusLabel, orderStatusColor } from "@/lib/utils";

export default async function MeusPedidosPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const userId = (session.user as { id: string }).id;

  const orders = await prisma.order.findMany({
    where: { userId },
    include: { items: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <h1 className="text-2xl font-bold mb-8">Meus Pedidos</h1>

      {orders.length === 0 ? (
        <div className="text-center py-16">
          <Package className="h-16 w-16 text-muted-foreground/30 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-muted-foreground mb-2">Nenhum pedido ainda</h2>
          <p className="text-muted-foreground mb-6">Que tal comprar suas primeiras figurinhas?</p>
          <Button asChild>
            <Link href="/">Ver Figurinhas</Link>
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <Link key={order.id} href={`/confirmacao/${order.id}`}>
              <Card className="hover:shadow-md transition-all hover:-translate-y-0.5">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <p className="font-bold">Pedido #{order.id.slice(-8).toUpperCase()}</p>
                      <p className="text-xs text-muted-foreground flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {new Date(order.createdAt).toLocaleDateString("pt-BR")}
                      </p>
                    </div>
                    <Badge className={orderStatusColor(order.status)}>
                      {orderStatusLabel(order.status)}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">
                        {order.items.length} {order.items.length === 1 ? "item" : "itens"}
                      </p>
                      <p className="text-lg font-bold text-primary">{formatCurrency(order.total)}</p>
                    </div>
                    <ArrowRight className="h-5 w-5 text-muted-foreground" />
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
