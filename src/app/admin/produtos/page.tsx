import Link from "next/link";
import { Plus, Pencil } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { prisma } from "@/lib/db";
import { formatCurrency } from "@/lib/utils";

export default async function AdminProdutosPage() {
  const products = await prisma.product.findMany({
    include: { category: true, variants: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Produtos</h1>
          <p className="text-muted-foreground">{products.length} produtos cadastrados</p>
        </div>
        <div className="text-sm text-muted-foreground">
          Adicione produtos via painel de admin (seed script para lote)
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {products.map((product) => (
          <Card key={product.id} className="hover:shadow-md transition-all">
            <CardContent className="p-4">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h3 className="font-semibold text-sm">{product.name}</h3>
                  <p className="text-xs text-muted-foreground">{product.category.name}</p>
                </div>
                <Badge variant={product.active ? "default" : "secondary"}>
                  {product.active ? "Ativo" : "Inativo"}
                </Badge>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="font-bold text-primary">{formatCurrency(product.basePrice)}</span>
                <span className="text-xs text-muted-foreground">
                  {product.variants.length} variantes
                </span>
              </div>
              <div className="flex gap-1 mt-2">
                {product.featured && <Badge variant="outline" className="text-[10px]">Destaque</Badge>}
                {product.type === "personalizada" && <Badge variant="outline" className="text-[10px]">Personalizável</Badge>}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
