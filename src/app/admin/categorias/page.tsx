import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { prisma } from "@/lib/db";

export default async function AdminCategoriasPage() {
  const categories = await prisma.category.findMany({
    include: { products: true },
    orderBy: { order: "asc" },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Categorias</h1>
        <p className="text-muted-foreground">{categories.length} categorias</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {categories.map((cat) => (
          <Card key={cat.id}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold">{cat.name}</h3>
                  <p className="text-xs text-muted-foreground">/{cat.slug}</p>
                </div>
                <Badge variant={cat.active ? "default" : "secondary"}>
                  {cat.active ? "Ativa" : "Inativa"}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                {cat.products.length} produtos
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
