"use client";

import { useState, useCallback } from "react";
import Image from "next/image";
import { Upload, Crop, Scissors, Sparkles, ShoppingCart, Check } from "lucide-react";
import { useDropzone } from "react-dropzone";
import Cropper, { type Area } from "react-easy-crop";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useCartStore } from "@/stores/cart";
import { formatCurrency, SIZE_LABELS, FINISH_LABELS } from "@/lib/utils";
import { toast } from "sonner";

const SIZES = ["5x5", "7x7", "10x10"];
const FINISHES = ["brilhante", "fosco", "holografico"];
const PRICES: Record<string, number> = { "5x5": 7.9, "7x7": 11.9, "10x10": 16.9 };
const FINISH_PRICES: Record<string, number> = { brilhante: 0, fosco: 2, holografico: 4 };

type Step = "upload" | "crop" | "configure" | "done";

export default function PersonalizarPage() {
  const [step, setStep] = useState<Step>("upload");
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedArea, setCroppedArea] = useState<Area | null>(null);
  const [croppedImageUrl, setCroppedImageUrl] = useState<string | null>(null);
  const [selectedSize, setSelectedSize] = useState("5x5");
  const [selectedFinish, setSelectedFinish] = useState("brilhante");
  const [quantity, setQuantity] = useState(1);
  const [uploading, setUploading] = useState(false);
  const [uploadId, setUploadId] = useState<string | null>(null);

  const addItem = useCartStore((s) => s.addItem);

  // Dropzone
  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      toast.error("Arquivo muito grande. Máximo: 10MB.");
      return;
    }

    setUploadedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
    setStep("crop");
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "image/*": [".png", ".jpg", ".jpeg", ".webp"] },
    maxFiles: 1,
    maxSize: 10 * 1024 * 1024,
  });

  // Crop complete
  function handleCropComplete(_: Area, croppedAreaPixels: Area) {
    setCroppedArea(croppedAreaPixels);
  }

  // Create cropped preview
  async function handleConfirmCrop() {
    if (!uploadedFile || !croppedArea || !previewUrl) return;

    // Create a canvas to crop
    const img = document.createElement("img");
    img.src = previewUrl;
    await new Promise((r) => (img.onload = r));

    const canvas = document.createElement("canvas");
    canvas.width = 500;
    canvas.height = 500;
    const ctx = canvas.getContext("2d")!;
    ctx.drawImage(
      img,
      croppedArea.x,
      croppedArea.y,
      croppedArea.width,
      croppedArea.height,
      0,
      0,
      500,
      500
    );

    canvas.toBlob((blob) => {
      if (blob) setCroppedImageUrl(URL.createObjectURL(blob));
    }, "image/png");
    setStep("configure");
  }

  // Upload and add to cart
  async function handleAddToCart() {
    if (!uploadedFile || !croppedArea) return;
    setUploading(true);

    try {
      const formData = new FormData();
      formData.append("file", uploadedFile);
      // Envia coordenadas de crop em pixels (croppedArea já está em pixels da imagem original)
      const safeX = Math.max(0, Math.round(croppedArea.x));
      const safeY = Math.max(0, Math.round(croppedArea.y));
      const safeW = Math.max(1, Math.round(croppedArea.width));
      const safeH = Math.max(1, Math.round(croppedArea.height));
      formData.append("cropX", String(safeX));
      formData.append("cropY", String(safeY));
      formData.append("cropWidth", String(safeW));
      formData.append("cropHeight", String(safeH));

      const res = await fetch("/api/upload", { method: "POST", body: formData });
      if (!res.ok) throw new Error("Upload failed");

      const { previewUrl: uploadedPreviewUrl, id } = await res.json();

      const price = PRICES[selectedSize] + FINISH_PRICES[selectedFinish];

      addItem({
        productId: null,
        uploadId: id,
        itemType: "personalizado",
        name: `Figurinha Personalizada (${SIZE_LABELS[selectedSize]})`,
        imageUrl: uploadedPreviewUrl || "/placeholder.png",
        size: SIZE_LABELS[selectedSize],
        finish: FINISH_LABELS[selectedFinish],
        unitPrice: price,
        quantity,
        categoryId: null,
      });

      setUploadId(id);
      setStep("done");
      toast.success("Figurinha personalizada adicionada ao carrinho!");
    } catch {
      toast.error("Erro ao processar imagem. Tente novamente.");
    } finally {
      setUploading(false);
    }
  }

  const price = PRICES[selectedSize] + FINISH_PRICES[selectedFinish];

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <h1 className="text-2xl font-bold mb-2">Criar Figurinha Personalizada</h1>
      <p className="text-muted-foreground mb-8">Faça upload da sua imagem, recorte e configure sua figurinha.</p>

      {/* Steps indicator */}
      <div className="flex items-center gap-2 mb-8">
        {(["upload", "crop", "configure", "done"] as Step[]).map((s, i) => (
          <div key={s} className="flex items-center gap-2">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
              step === s ? "bg-primary text-white" : step > s || (s === "upload" && step !== "upload") ? "bg-green-500 text-white" : "bg-muted text-muted-foreground"
            }`}>
              {step > s ? <Check className="h-4 w-4" /> : i + 1}
            </div>
            <span className="text-xs hidden sm:inline text-muted-foreground">
              {["Enviar", "Recortar", "Configurar", "Pronto"][i]}
            </span>
            {i < 3 && <div className="w-8 h-px bg-border" />}
          </div>
        ))}
      </div>

      {/* Step 1: Upload */}
      {step === "upload" && (
        <Card
          {...getRootProps()}
          className={`p-12 text-center cursor-pointer border-2 border-dashed transition-colors ${
            isDragActive ? "border-primary bg-primary/5" : "border-muted-foreground/25 hover:border-primary/50"
          }`}
        >
          <input {...getInputProps()} />
          <Upload className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">
            {isDragActive ? "Solte sua imagem aqui!" : "Arraste sua imagem ou clique aqui"}
          </h3>
          <p className="text-sm text-muted-foreground">
            PNG, JPEG ou WebP • Máximo 10MB • Mínimo 500×500px
          </p>
        </Card>
      )}

      {/* Step 2: Crop */}
      {step === "crop" && previewUrl && (
        <div className="space-y-4">
          <div className="relative h-[400px] bg-black rounded-xl overflow-hidden">
            <Cropper
              image={previewUrl}
              crop={crop}
              zoom={zoom}
              aspect={1}
              cropShape="rect"
              onCropChange={setCrop}
              onZoomChange={setZoom}
              onCropComplete={handleCropComplete}
            />
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => { setStep("upload"); setPreviewUrl(null); }}>
              Voltar
            </Button>
            <Button className="flex-1" onClick={handleConfirmCrop}>
              <Scissors className="mr-2 h-4 w-4" /> Confirmar Recorte
            </Button>
          </div>
        </div>
      )}

      {/* Step 3: Configure */}
      {step === "configure" && croppedImageUrl && (
        <div className="space-y-6">
          {/* Preview */}
          <div className="flex justify-center">
            <div className={`relative w-56 h-56 rounded-xl overflow-hidden shadow-lg ${
              selectedFinish === "holografico" ? "ring-4 ring-cyan-400" :
              selectedFinish === "brilhante" ? "ring-4 ring-blue-400" : "ring-4 ring-gray-600"
            }`}>
              <Image src={croppedImageUrl} alt="Preview" fill className="object-cover" sizes="224px" />
              {selectedFinish === "holografico" && (
                <div className="absolute inset-0 bg-gradient-to-tr from-cyan-500/20 via-transparent to-blue-500/20" />
              )}
            </div>
          </div>

          {/* Size */}
          <div>
            <p className="text-sm font-medium mb-2">Tamanho</p>
            <div className="flex gap-2">
              {SIZES.map((s) => (
                <button key={s} onClick={() => setSelectedSize(s)}
                  className={`flex-1 py-3 rounded-lg border text-sm font-medium transition-all ${
                    selectedSize === s ? "border-primary bg-primary/10 text-primary" : "border-border hover:border-primary/50"
                  }`}>
                  {SIZE_LABELS[s]}<br />
                  <span className="text-xs text-muted-foreground">{formatCurrency(PRICES[s])}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Finish */}
          <div>
            <p className="text-sm font-medium mb-2">Acabamento</p>
            <div className="flex gap-2">
              {FINISHES.map((f) => (
                <button key={f} onClick={() => setSelectedFinish(f)}
                  className={`flex-1 py-3 rounded-lg border text-sm font-medium transition-all ${
                    selectedFinish === f ? "border-primary bg-primary/10 text-primary" : "border-border hover:border-primary/50"
                  }`}>
                  {FINISH_LABELS[f]}<br />
                  <span className="text-xs text-muted-foreground">
                    {FINISH_PRICES[f] > 0 ? `+${formatCurrency(FINISH_PRICES[f])}` : "Grátis"}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Price + Add to Cart */}
          <div className="flex items-center justify-between pt-4 border-t">
            <div>
              <p className="text-2xl font-bold text-primary">{formatCurrency(price)}</p>
              <p className="text-xs text-muted-foreground">por unidade</p>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="outline" size="icon" onClick={() => setQuantity(Math.max(1, quantity - 1))}>
                -
              </Button>
              <span className="font-bold text-lg w-6 text-center">{quantity}</span>
              <Button variant="outline" size="icon" onClick={() => setQuantity(quantity + 1)}>
                +
              </Button>
              <Button onClick={handleAddToCart} disabled={uploading}>
                {uploading ? "Processando..." : (
                  <><ShoppingCart className="mr-2 h-4 w-4" /> Adicionar</>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Step 4: Done */}
      {step === "done" && (
        <Card className="p-12 text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-100 flex items-center justify-center">
            <Check className="h-8 w-8 text-green-600" />
          </div>
          <h2 className="text-xl font-bold mb-2">Figurinha adicionada ao carrinho!</h2>
          <p className="text-muted-foreground mb-6">Sua figurinha personalizada está pronta para compra.</p>
          <div className="flex gap-3 justify-center">
            <Button variant="outline" onClick={() => { setStep("upload"); setUploadedFile(null); setPreviewUrl(null); setCroppedImageUrl(null); }}>
              Criar Outra
            </Button>
            <Button onClick={() => window.location.href = "/carrinho"}>
              <ShoppingCart className="mr-2 h-4 w-4" /> Ver Carrinho
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
}
