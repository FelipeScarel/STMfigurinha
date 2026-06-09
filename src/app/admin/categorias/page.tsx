"use client";

import { useEffect, useState, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, Tags } from "lucide-react";

type CategoryForm = {
  id?: string;
  name: string;
  description: string;
  imageUrl: string;
  active: boolean;
  order: number;
};

const emptyForm: CategoryForm = {
  name: "",
  description: "",
  imageUrl: "",
  active: true,
  order: 0,
};

export default function AdminCategoriasPage() {
  const [categories, setCategories] = useState<any[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState<CategoryForm>(emptyForm);
  const [saving, setSaving] = useState(false);

  const loadData = useCallback(() => {
    fetch("/api/admin/categories")
      .then((r) => r.json())
      .then(setCategories)
      .catch(() => {});
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  function openCreate() {
    setForm({ ...emptyForm, order: categories.length + 1 });
    setDialogOpen(true);
  }

  function openEdit(cat: any) {
    setForm({
      id: cat.id,
      name: cat.name,
      description: cat.description || "",
      imageUrl: cat.imageUrl || "",
      active: cat.active,
      order: cat.order || 0,
    });
    setDialogOpen(true);
  }

  async function handleSave() {
    if (!form.name) {
      toast.error("Nome da categoria é obrigatório.");
      return;
    }
    setSaving(true);
    try {
      const method = form.id ? "PUT" : "POST";
      const body = form.id ? { id: form.id, ...form } : form;
      const res = await fetch("/api/admin/categories", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Erro ao salvar");
      }
      toast.success(form.id ? "Categoria atualizada!" : "Categoria criada!");
      setDialogOpen(false);
      loadData();
    } catch (err: any) {
      toast.error(err.message || "Erro ao salvar categoria");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Tem certeza que deseja excluir esta categoria?")) return;
    try {
      const res = await fetch(`/api/admin/categories?id=${id}`, { method: "DELETE" });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Erro ao excluir");
      }
      toast.success("Categoria excluída!");
      loadData();
    } catch (err: any) {
      toast.error(err.message || "Erro ao excluir categoria");
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Categorias</h1>
          <p className="text-muted-foreground">{categories.length} categorias</p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="mr-2 h-4 w-4" /> Nova Categoria
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {categories.map((c) => (
          <Card key={c.id} className="overflow-hidden">
            <CardContent className="p-0">
              <div className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <h3 className="font-semibold">{c.name}</h3>
                    <p className="text-xs text-muted-foreground">/{c.slug}</p>
                  </div>
                  <div className="flex gap-1">
                    <Badge variant={c.active ? "default" : "secondary"}>
                      {c.active ? "Ativa" : "Inativa"}
                    </Badge>
                  </div>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">{c.productCount} produtos</span>
                  <span className="text-xs text-muted-foreground">Ordem: {c.order}</span>
                </div>
                {c.description && (
                  <p className="text-xs text-muted-foreground mt-2 line-clamp-2">{c.description}</p>
                )}
              </div>
              <div className="flex border-t">
                <Button variant="ghost" size="sm" className="flex-1 rounded-none h-9" onClick={() => openEdit(c)}>
                  <Pencil className="h-3.5 w-3.5 mr-1" /> Editar
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="flex-1 rounded-none h-9 text-red-600 hover:text-red-700 hover:bg-red-50"
                  onClick={() => handleDelete(c.id)}
                  disabled={c.productCount > 0}
                  title={c.productCount > 0 ? "Remova os produtos primeiro" : "Excluir categoria"}
                >
                  <Trash2 className="h-3.5 w-3.5 mr-1" /> Excluir
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
        {categories.length === 0 && (
          <div className="col-span-full text-center py-12 text-muted-foreground">
            <Tags className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p>Nenhuma categoria cadastrada</p>
            <Button variant="outline" size="sm" className="mt-2" onClick={openCreate}>
              Criar primeira categoria
            </Button>
          </div>
        )}
      </div>

      {/* Form Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{form.id ? "Editar Categoria" : "Nova Categoria"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div>
              <Label>Nome *</Label>
              <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Ex: Anime" />
            </div>
            <div>
              <Label>Descrição</Label>
              <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Breve descrição..." rows={2} />
            </div>
            <div>
              <Label>URL da Imagem</Label>
              <Input value={form.imageUrl} onChange={(e) => setForm({ ...form, imageUrl: e.target.value })} placeholder="https://..." />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Ordem</Label>
                <Input type="number" value={form.order} onChange={(e) => setForm({ ...form, order: parseInt(e.target.value) || 0 })} />
              </div>
              <div className="flex items-end pb-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={form.active} onChange={(e) => setForm({ ...form, active: e.target.checked })} className="rounded" />
                  <span className="text-sm">Ativa</span>
                </label>
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-4 border-t">
              <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancelar</Button>
              <Button onClick={handleSave} disabled={saving}>
                {saving ? "Salvando..." : form.id ? "Atualizar" : "Criar Categoria"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
