"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

const tipoLabel: Record<string, string> = {
  compre_x_pague_y: "Compre X, Pague Y",
  desconto_por_qtde: "Desconto por Qtde",
  desconto_percentual: "Desconto Percentual",
};

export default function AdminPromocoesPage() {
  const [rules, setRules] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const load = () => {
    fetch("/api/admin/promocoes")
      .then((r) => r.json())
      .then(setRules);
  };

  useEffect(() => load(), []);

  async function create(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const fd = new FormData(e.currentTarget);
    const data: any = {
      name: fd.get("name"),
      type: fd.get("type"),
      applyTo: fd.get("applyTo"),
      startDate: fd.get("startDate"),
      endDate: fd.get("endDate"),
    };

    if (data.type === "compre_x_pague_y") {
      data.buyQty = parseInt(fd.get("buyQty") as string);
      data.payQty = parseInt(fd.get("payQty") as string);
    } else if (data.type === "desconto_por_qtde") {
      data.buyQty = parseInt(fd.get("buyQty") as string);
      data.discountPercent = parseFloat(fd.get("discountPercent") as string);
    } else {
      data.discountPercent = parseFloat(fd.get("discountPercent") as string);
    }

    const res = await fetch("/api/admin/promocoes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (res.ok) {
      toast.success(`Regra criada!`);
      (e.target as HTMLFormElement).reset();
      load();
    } else {
      toast.error("Erro ao criar");
    }
    setLoading(false);
  }

  const [tipo, setTipo] = useState("compre_x_pague_y");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Promoções</h1>
        <p className="text-muted-foreground">{rules.length} regras</p>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-lg">Nova Regra</CardTitle></CardHeader>
        <CardContent>
          <form onSubmit={create} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div><Label>Nome</Label><Input name="name" placeholder="Leve 5, Pague 4" required /></div>
              <div>
                <Label>Tipo</Label>
                <select name="type" value={tipo} onChange={(e) => setTipo(e.target.value)} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                  <option value="compre_x_pague_y">Compre X, Pague Y</option>
                  <option value="desconto_por_qtde">Desconto por Qtde</option>
                  <option value="desconto_percentual">Desconto Percentual</option>
                </select>
              </div>
              <div>
                <Label>Aplicar a</Label>
                <select name="applyTo" className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                  <option value="todos">Todos</option>
                  <option value="categoria">Categoria</option>
                  <option value="produto">Produto</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {tipo === "compre_x_pague_y" && (
                <>
                  <div><Label>Qtd Comprar</Label><Input name="buyQty" type="number" placeholder="5" required /></div>
                  <div><Label>Qtd Pagar</Label><Input name="payQty" type="number" placeholder="4" required /></div>
                </>
              )}
              {tipo === "desconto_por_qtde" && (
                <>
                  <div><Label>Qtd Mínima</Label><Input name="buyQty" type="number" placeholder="10" required /></div>
                  <div><Label>Desconto (%)</Label><Input name="discountPercent" type="number" step="0.01" placeholder="15" required /></div>
                </>
              )}
              {tipo === "desconto_percentual" && (
                <div><Label>Desconto (%)</Label><Input name="discountPercent" type="number" step="0.01" placeholder="10" required /></div>
              )}
              <div><Label>Início</Label><Input name="startDate" type="date" required /></div>
              <div><Label>Expiração</Label><Input name="endDate" type="date" required /></div>
            </div>
            <Button type="submit" disabled={loading}>{loading ? "..." : "Criar Regra"}</Button>
          </form>
        </CardContent>
      </Card>

      <div className="space-y-4">
        {rules.map((r) => (
          <Card key={r.id}>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold">{r.name}</h3>
                <Badge variant={r.active ? "default" : "secondary"}>{r.active ? "Ativa" : "Inativa"}</Badge>
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                {tipoLabel[r.type]} • {r.applyTo === "todos" ? "Todos" : r.applyTo} • Até {new Date(r.endDate).toLocaleDateString("pt-BR")}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
