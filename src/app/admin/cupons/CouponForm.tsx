"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export function CouponForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const data = {
      code: (formData.get("code") as string).toUpperCase(),
      type: formData.get("type") as string,
      value: parseFloat(formData.get("value") as string),
      minOrderValue: parseFloat(formData.get("minOrderValue") as string) || 0,
      maxUses: formData.get("maxUses") ? parseInt(formData.get("maxUses") as string) : null,
      startDate: formData.get("startDate") as string,
      endDate: formData.get("endDate") as string,
    };

    try {
      const res = await fetch("/api/admin/cupons", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) throw new Error((await res.json()).error);

      toast.success(`Cupom ${data.code} criado!`);
      (e.target as HTMLFormElement).reset();
      router.refresh();
    } catch (err: any) {
      toast.error(err.message || "Erro ao criar cupom.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <div>
        <Label htmlFor="code">Código</Label>
        <Input id="code" name="code" placeholder="STICKER20" required />
      </div>
      <div>
        <Label htmlFor="type">Tipo</Label>
        <select id="type" name="type" className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" required>
          <option value="percentual">Percentual (%)</option>
          <option value="valor_fixo">Valor Fixo (R$)</option>
        </select>
      </div>
      <div>
        <Label htmlFor="value">Valor</Label>
        <Input id="value" name="value" type="number" step="0.01" placeholder="20" required />
      </div>
      <div>
        <Label htmlFor="minOrderValue">Pedido Mínimo (R$)</Label>
        <Input id="minOrderValue" name="minOrderValue" type="number" step="0.01" defaultValue="0" />
      </div>
      <div>
        <Label htmlFor="maxUses">Limite de Usos</Label>
        <Input id="maxUses" name="maxUses" type="number" placeholder="Ilimitado" />
      </div>
      <div>
        <Label htmlFor="startDate">Data Início</Label>
        <Input id="startDate" name="startDate" type="date" required />
      </div>
      <div>
        <Label htmlFor="endDate">Data Expiração</Label>
        <Input id="endDate" name="endDate" type="date" required />
      </div>
      <div className="flex items-end">
        <Button type="submit" disabled={loading} className="w-full">
          {loading ? "Criando..." : "Criar Cupom"}
        </Button>
      </div>
    </form>
  );
}
