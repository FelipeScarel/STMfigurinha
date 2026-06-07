"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { orderStatusLabel } from "@/lib/utils";
import { toast } from "sonner";

export function UpdateStatusButton({
  orderId,
  nextStatus,
}: {
  orderId: string;
  nextStatus: string;
}) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleUpdate() {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/pedidos/${orderId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus }),
      });

      if (!res.ok) throw new Error("Erro ao atualizar");

      toast.success(`Status atualizado para "${orderStatusLabel(nextStatus)}"`);
      router.refresh();
    } catch {
      toast.error("Erro ao atualizar status.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Button onClick={handleUpdate} disabled={loading} className="w-full">
      {loading ? "Atualizando..." : `Marcar como "${orderStatusLabel(nextStatus)}"`}
    </Button>
  );
}
