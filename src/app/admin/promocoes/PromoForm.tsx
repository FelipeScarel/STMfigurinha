"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export function PromoForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [tipo, setTipo] = useState("compre_x_pague_y");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const data: any = {
      name: formData.get("name") as string,
      type: formData.get("type") as string,
      applyTo: formData.get("applyTo") as string,
      startDate: formData.get("startDate") as string,
      endDate: formData.get("endDate") as string,
    };

    if (data.type === "compre_x_pague_y") {
      data.buyQty = parseInt(formData.get("buyQty") as string);
      data.payQty = parseInt(formData.get("payQty") as string);
    } else if (data.type === "desconto_por_qtde") {
      data.buyQty = parseInt(formData.get("buyQty") as string);
      data.discountPercent = parseFloat(formData.get("discountPercent") as string);
    } else {
      data.discountPercent = parseFloat(formData.get("discountPercent") as string);
    }

    try {
      const res = await fetch("/api/admin/promocoes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) throw new Error((await res.json()).error);

      toast.success(`Regra "${data.name}" criada!`);
      (e.target as HTMLFormElement).reset();
      router.refresh();
    } catch (err: any) {
      toast.error(err.message || "Erro ao criar regra.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <Label htmlFor="name">Nome da Regra</Label>
          <Input id="name" name="name" placeholder="Leve 5, Pague 4" required />
        </div>
        <div>
          <Label htmlFor="type">Tipo</Label>
          <select
            id="type" name="type"
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            value={tipo}
            onChange={(e) => setTipo(e.target.value)}
            required
          >
            <option value="compre_x_pague_y">Compre X, Pague Y</option>
            <option value="desconto_por_qtde">Desconto por Quantidade</option>
            <option value="desconto_percentual">Desconto Percentual</option>
          </select>
        </div>
        <div>
          <Label htmlFor="applyTo">Aplicar a</Label>
          <select id="applyTo" name="applyTo" className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" required>
            <option value="todos">Todos os produtos</option>
            <option value="categoria">Categoria específica</option>
            <option value="produto">Produto específico</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {tipo === "compre_x_pague_y" && (
          <>
            <div>
              <Label htmlFor="buyQty">Quantidade Comprar</Label>
              <Input id="buyQty" name="buyQty" type="number" placeholder="5" required />
            </div>
            <div>
              <Label htmlFor="payQty">Quantidade Pagar</Label>
              <Input id="payQty" name="payQty" type="number" placeholder="4" required />
            </div>
          </>
        )}
        {tipo === "desconto_por_qtde" && (
          <>
            <div>
              <Label htmlFor="buyQty">Quantidade Mínima</Label>
              <Input id="buyQty" name="buyQty" type="number" placeholder="10" required />
            </div>
            <div>
              <Label htmlFor="discountPercent">Desconto (%)</Label>
              <Input id="discountPercent" name="discountPercent" type="number" step="0.01" placeholder="15" required />
            </div>
          </>
        )}
        {tipo === "desconto_percentual" && (
          <div>
            <Label htmlFor="discountPercent">Desconto (%)</Label>
            <Input id="discountPercent" name="discountPercent" type="number" step="0.01" placeholder="10" required />
          </div>
        )}
        <div>
          <Label htmlFor="startDate">Data Início</Label>
          <Input id="startDate" name="startDate" type="date" required />
        </div>
        <div>
          <Label htmlFor="endDate">Data Expiração</Label>
          <Input id="endDate" name="endDate" type="date" required />
        </div>
      </div>

      <Button type="submit" disabled={loading}>
        {loading ? "Criando..." : "Criar Regra"}
      </Button>
    </form>
  );
}
