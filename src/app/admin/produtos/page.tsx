"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";

export default function AdminProdutosPage() {
  const [products, setProducts] = useState<any[]>([]);

  useEffect(() => {
    fetch("/api/admin/products")
      .then((r) => r.json())
      .then(setProducts)
      .catch(() => {});
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Produtos</h1>
        <p className="text-muted-foreground">{products.length} produtos</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {products.map((p) => (
          <Card key={p.id}>
            <CardContent className="p-4">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h3 className="font-semibold text-sm">{p.name}</h3>
                  <p className="text-xs text-muted-foreground">{p.categoryName}</p>
                </div>
                <Badge variant={p.active ? "default" : "secondary"}>{p.active ? "Ativo" : "Inativo"}</Badge>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="font-bold text-primary">{formatCurrency(p.basePrice)}</span>
                <span className="text-xs text-muted-foreground">{p.variantCount} variantes</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
