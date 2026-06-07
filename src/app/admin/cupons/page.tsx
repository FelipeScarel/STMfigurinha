import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { prisma } from "@/lib/db";
import { formatCurrency } from "@/lib/utils";
import { CouponForm } from "./CouponForm";

export default async function AdminCuponsPage() {
  const coupons = await prisma.coupon.findMany({
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Cupons de Desconto</h1>
        <p className="text-muted-foreground">{coupons.length} cupons cadastrados</p>
      </div>

      {/* Create Form */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Novo Cupom</CardTitle>
        </CardHeader>
        <CardContent>
          <CouponForm />
        </CardContent>
      </Card>

      {/* List */}
      <Card>
        <CardContent className="p-0">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left text-muted-foreground bg-muted/30">
                <th className="p-4 font-medium">Código</th>
                <th className="p-4 font-medium">Tipo</th>
                <th className="p-4 font-medium">Valor</th>
                <th className="p-4 font-medium">Uso</th>
                <th className="p-4 font-medium">Validade</th>
                <th className="p-4 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {coupons.map((c) => (
                <tr key={c.id} className="border-b last:border-0">
                  <td className="p-4 font-mono font-bold">{c.code}</td>
                  <td className="p-4">{c.type === "percentual" ? "Percentual" : "Valor Fixo"}</td>
                  <td className="p-4">
                    {c.type === "percentual" ? `${c.value}%` : formatCurrency(c.value)}
                  </td>
                  <td className="p-4">
                    {c.currentUses}{c.maxUses ? `/${c.maxUses}` : ""}
                  </td>
                  <td className="p-4 text-xs">
                    {new Date(c.endDate).toLocaleDateString("pt-BR")}
                  </td>
                  <td className="p-4">
                    <Badge variant={c.active ? "default" : "secondary"}>
                      {c.active ? "Ativo" : "Inativo"}
                    </Badge>
                    {c.maxUses && c.currentUses >= c.maxUses && (
                      <Badge variant="destructive" className="ml-1">Esgotado</Badge>
                    )}
                  </td>
                </tr>
              ))}
              {coupons.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-muted-foreground">
                    Nenhum cupom cadastrado ainda.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
