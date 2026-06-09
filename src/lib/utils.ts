import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(value: number): string {
  const safe = isNaN(value) || value === null || value === undefined ? 0 : value;
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(safe);
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function orderStatusLabel(status: string): string {
  const map: Record<string, string> = {
    aguardando_pagamento: "Aguardando Pagamento",
    pago: "Pago",
    em_producao: "Em Produção",
    enviado: "Enviado",
    entregue: "Entregue",
    cancelado: "Cancelado",
  };
  return map[status] || status;
}

export function orderStatusColor(status: string): string {
  const map: Record<string, string> = {
    aguardando_pagamento: "bg-yellow-100 text-yellow-800",
    pago: "bg-blue-100 text-blue-800",
    em_producao: "bg-cyan-500/15 text-cyan-400",
    enviado: "bg-orange-100 text-orange-800",
    entregue: "bg-green-100 text-green-800",
    cancelado: "bg-red-100 text-red-800",
  };
  return map[status] || "bg-gray-100 text-gray-800";
}

export const SIZE_LABELS: Record<string, string> = {
  "5x5": "5×5 cm",
  "7x7": "7×7 cm",
  "10x10": "10×10 cm",
};

export const FINISH_LABELS: Record<string, string> = {
  brilhante: "Brilhante",
  fosco: "Fosco",
  holografico: "Holográfico",
};
