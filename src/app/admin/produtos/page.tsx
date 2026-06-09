"use client";

import { useEffect, useState, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { formatCurrency } from "@/lib/utils";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, Package } from "lucide-react";

type VariantForm = {
  size: string;
  finish: string;
  priceExtra: number;
  stock: number;
};

type ProductForm = {
  id?: string;
  name: string;
  description: string;
  basePrice: number;
  showPrice: boolean;
  categoryId: string;
  type: string;
  active: boolean;
  featured: boolean;
  imageUrl: string;
  variants: VariantForm[];
};

const emptyForm: ProductForm = {
  name: "",
  description: "",
  basePrice: 0,
  showPrice: true,
  categoryId: "",
  type: "pronta",
  active: true,
  featured: false,
  imageUrl: "",
  variants: [{ size: "5x5", finish: "brilhante", priceExtra: 0, stock: 0 }],
};

const SIZES = ["5x5", "7x7", "10x10"];
const FINISHES = ["brilhante", "fosco", "holografico"];
const TYPES = ["pronta", "personalizada"];

export default function AdminProdutosPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState<ProductForm>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);

  const loadData = useCallback(() => {
    fetch("/api/admin/products")
      .then((r) => r.json())
      .then(setProducts)
      .catch(() => {});
    fetch("/api/admin/categories")
      .then((r) => r.json())
      .then(setCategories)
      .catch(() => {});
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  function openCreate() {
    setForm({ ...emptyForm, categoryId: categories[0]?.id || "" });
    setDialogOpen(true);
  }

  function openEdit(product: any) {
    setForm({
      id: product.id,
      name: product.name,
      description: product.description || "",
      basePrice: product.basePrice,
      showPrice: product.showPrice !== false,
      categoryId: product.categoryId,
      type: product.type,
      active: product.active,
      featured: product.featured,
      imageUrl: product.imageUrl || "",
      variants: product.variants?.length
        ? product.variants.map((v: any) => ({
            size: v.size,
            finish: v.finish,
            priceExtra: v.priceExtra,
            stock: v.stock,
          }))
        : [{ size: "5x5", finish: "brilhante", priceExtra: 0, stock: 0 }],
    });
    setDialogOpen(true);
  }

  function addVariant() {
    setForm((f) => ({
      ...f,
      variants: [...f.variants, { size: "5x5", finish: "brilhante", priceExtra: 0, stock: 0 }],
    }));
  }

  function removeVariant(idx: number) {
    setForm((f) => ({
      ...f,
      variants: f.variants.filter((_, i) => i !== idx),
    }));
  }

  function updateVariant(idx: number, field: keyof VariantForm, value: any) {
    setForm((f) => ({
      ...f,
      variants: f.variants.map((v, i) => (i === idx ? { ...v, [field]: value } : v)),
    }));
  }

  async function handleSave() {
    if (!form.name || !form.categoryId) {
      toast.error("Nome e categoria são obrigatórios.");
      return;
    }
    setSaving(true);
    try {
      const method = form.id ? "PUT" : "POST";
      const body = form.id
        ? { id: form.id, ...form }
        : form;
      const res = await fetch("/api/admin/products", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Erro ao salvar");
      }
      toast.success(form.id ? "Produto atualizado!" : "Produto criado!");
      setDialogOpen(false);
      loadData();
    } catch (err: any) {
      toast.error(err.message || "Erro ao salvar produto");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Tem certeza que deseja excluir este produto?")) return;
    setDeleting(id);
    try {
      const res = await fetch(`/api/admin/products?id=${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Erro ao excluir");
      toast.success("Produto excluído!");
      loadData();
    } catch {
      toast.error("Erro ao excluir produto");
    } finally {
      setDeleting(null);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Produtos</h1>
          <p className="text-muted-foreground">{products.length} produtos</p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="mr-2 h-4 w-4" /> Novo Produto
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {products.map((p) => (
          <Card key={p.id} className="overflow-hidden">
            <CardContent className="p-0">
              <div className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-sm truncate">{p.name}</h3>
                    <p className="text-xs text-muted-foreground">{p.categoryName}</p>
                  </div>
                  <div className="flex gap-1">
                    {p.featured && <Badge variant="default">⭐</Badge>}
                    <Badge variant={p.active ? "default" : "secondary"}>{p.active ? "Ativo" : "Inativo"}</Badge>
                  </div>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="font-bold text-primary">
                    {p.showPrice !== false ? formatCurrency(p.basePrice) : "Valor a Consultar"}
                  </span>
                  <span className="text-xs text-muted-foreground">{p.variantCount} variantes</span>
                </div>
              </div>
              <div className="flex border-t">
                <Button variant="ghost" size="sm" className="flex-1 rounded-none h-9" onClick={() => openEdit(p)}>
                  <Pencil className="h-3.5 w-3.5 mr-1" /> Editar
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="flex-1 rounded-none h-9 text-red-600 hover:text-red-700 hover:bg-red-50"
                  onClick={() => handleDelete(p.id)}
                  disabled={deleting === p.id}
                >
                  <Trash2 className="h-3.5 w-3.5 mr-1" /> {deleting === p.id ? "..." : "Excluir"}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
        {products.length === 0 && (
          <div className="col-span-full text-center py-12 text-muted-foreground">
            <Package className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p>Nenhum produto cadastrado</p>
            <Button variant="outline" size="sm" className="mt-2" onClick={openCreate}>
              Criar primeiro produto
            </Button>
          </div>
        )}
      </div>

      {/* Form Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{form.id ? "Editar Produto" : "Novo Produto"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            {/* Nome */}
            <div>
              <Label>Nome *</Label>
              <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Ex: Pacote Stickers Anime" />
            </div>

            {/* Descrição */}
            <div>
              <Label>Descrição</Label>
              <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Descrição do produto..." rows={2} />
            </div>

            {/* Categoria + Tipo */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Categoria *</Label>
                <Select value={form.categoryId} onValueChange={(v) => setForm({ ...form, categoryId: v })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione..." />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((c) => (
                      <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Tipo</Label>
                <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {TYPES.map((t) => (
                      <SelectItem key={t} value={t}>{t === "pronta" ? "Pronta" : "Personalizável"}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Preço + Exibir Preço */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Preço Base (R$)</Label>
                <Input type="number" step="0.01" value={form.basePrice} onChange={(e) => setForm({ ...form, basePrice: parseFloat(e.target.value) || 0 })} />
              </div>
              <div className="flex items-end pb-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={form.showPrice} onChange={(e) => setForm({ ...form, showPrice: e.target.checked })} className="rounded" />
                  <span className="text-sm">Exibir preço na vitrine</span>
                </label>
              </div>
            </div>

            {/* Status */}
            <div className="flex gap-8">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={form.active} onChange={(e) => setForm({ ...form, active: e.target.checked })} className="rounded" />
                <span className="text-sm">Ativo</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={form.featured} onChange={(e) => setForm({ ...form, featured: e.target.checked })} className="rounded" />
                <span className="text-sm">Destaque ⭐</span>
              </label>
            </div>

            {/* Imagem / Capa do Produto */}
            <div>
              <Label>Imagem de Capa</Label>
              <p className="text-xs text-muted-foreground mb-2">Faça upload de uma imagem do seu dispositivo ou cole uma URL</p>
              <div className="flex gap-2 mb-2">
                <div className="flex-1">
                  <Input
                    type="file"
                    accept="image/png,image/jpeg,image/jpg,image/webp,image/gif,.png,.jpg,.jpeg,.webp,.gif"
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      if (file.size > 10 * 1024 * 1024) {
                        toast.error("Imagem muito grande. Máximo: 10MB.");
                        return;
                      }
                      const uploading = toast.loading("Enviando imagem...");
                      try {
                        const uploadForm = new FormData();
                        uploadForm.append("file", file);
                        const res = await fetch("/api/upload", { method: "POST", body: uploadForm });
                        const data = await res.json();
                        if (!res.ok) throw new Error(data.error || "Upload failed");
                        setForm((prev) => ({ ...prev, imageUrl: data.previewUrl }));
                        toast.success("Imagem enviada!", { id: uploading });
                      } catch (err: any) {
                        toast.error(err.message || "Erro ao enviar imagem.", { id: uploading });
                      }
                    }}
                    className="cursor-pointer file:mr-3 file:py-1 file:px-3 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
                  />
                </div>
              </div>
              <div className="flex gap-2 items-center">
                <div className="flex-1">
                  <Input value={form.imageUrl} onChange={(e) => setForm({ ...form, imageUrl: e.target.value })} placeholder="ou cole a URL da imagem: https://..." />
                </div>
              </div>
              {form.imageUrl && (
                <div className="mt-3 relative w-24 h-24 rounded-lg overflow-hidden bg-muted border-2 border-primary/30">
                  <img src={form.imageUrl} alt="Preview" className="w-full h-full object-cover" onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
                  <button
                    onClick={() => setForm({ ...form, imageUrl: "" })}
                    className="absolute top-0 right-0 bg-red-500 text-white text-xs w-5 h-5 flex items-center justify-center rounded-bl-lg hover:bg-red-600"
                  >×</button>
                </div>
              )}
            </div>

            {/* Variantes */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <Label>Variantes (Tamanho × Acabamento)</Label>
                <Button type="button" variant="outline" size="sm" onClick={addVariant}>
                  <Plus className="h-3 w-3 mr-1" /> Adicionar
                </Button>
              </div>
              <div className="space-y-2">
                {form.variants.map((v, idx) => (
                  <div key={idx} className="flex items-center gap-2 p-2 border rounded-lg bg-muted/30">
                    <Select value={v.size} onValueChange={(val) => updateVariant(idx, "size", val)}>
                      <SelectTrigger className="w-24">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {SIZES.map((s) => <SelectItem key={s} value={s}>{s} cm</SelectItem>)}
                      </SelectContent>
                    </Select>
                    <Select value={v.finish} onValueChange={(val) => updateVariant(idx, "finish", val)}>
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {FINISHES.map((f) => (
                          <SelectItem key={f} value={f}>
                            {f === "brilhante" ? "Brilhante" : f === "fosco" ? "Fosco" : "Holográfico"}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <div className="flex-1 flex items-center gap-1">
                      <span className="text-xs text-muted-foreground">+R$</span>
                      <Input type="number" step="0.01" value={v.priceExtra} onChange={(e) => updateVariant(idx, "priceExtra", parseFloat(e.target.value) || 0)} className="w-20 h-8 text-xs" />
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="text-xs text-muted-foreground">Est:</span>
                      <Input type="number" value={v.stock} onChange={(e) => updateVariant(idx, "stock", parseInt(e.target.value) || 0)} className="w-16 h-8 text-xs" />
                    </div>
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-red-500" onClick={() => removeVariant(idx)} disabled={form.variants.length <= 1}>
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-2 pt-4 border-t">
              <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancelar</Button>
              <Button onClick={handleSave} disabled={saving}>
                {saving ? "Salvando..." : form.id ? "Atualizar" : "Criar Produto"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
