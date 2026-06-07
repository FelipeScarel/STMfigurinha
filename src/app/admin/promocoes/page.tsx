import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { prisma } from "@/lib/db";
import { PromoForm } from "./PromoForm";

export default async function AdminPromocoesPage() {
  const rules = await prisma.promotionRule.findMany({
    orderBy: { createdAt: "desc" },
  });

  const ruleTypeLabel: Record<string, string> = {
    compre_x_pague_y: "Compre X, Pague Y",
    desconto_por_qtde: "Desconto por Qtde",
    desconto_percentual: "Desconto Percentual",
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Regras de Promoção</h1>
        <p className="text-muted-foreground">{rules.length} regras cadastradas</p>
      </div>

      {/* Create Form */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Nova Regra de Promoção</CardTitle>
        </CardHeader>
        <CardContent>
          <PromoForm />
        </CardContent>
      </Card>

      {/* List */}
      <div className="space-y-4">
        {rules.map((rule) => (
          <Card key={rule.id}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold">{rule.name}</h3>
                    <Badge variant={rule.active ? "default" : "secondary"}>
                      {rule.active ? "Ativa" : "Inativa"}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    {ruleTypeLabel[rule.type] || rule.type}
                    {rule.type === "compre_x_pague_y" && ` — Compre ${rule.buyQty}, Pague ${rule.payQty}`}
                    {rule.type === "desconto_por_qtde" && ` — A partir de ${rule.buyQty} un. (${rule.discountPercent}% off)`}
                    {rule.type === "desconto_percentual" && ` — ${rule.discountPercent}% off`}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Aplica a: {rule.applyTo === "todos" ? "Todos os produtos" : rule.applyTo}
                    {" • "}
                    Válido até {new Date(rule.endDate).toLocaleDateString("pt-BR")}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
        {rules.length === 0 && (
          <Card>
            <CardContent className="p-8 text-center text-muted-foreground">
              Nenhuma regra de promoção cadastrada ainda.
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
