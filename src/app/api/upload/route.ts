import { NextResponse } from "next/server";
import { processUpload } from "@/lib/image-processor";

export async function POST(req: Request) {
  let formData: FormData;
  try {
    formData = await req.formData();
  } catch {
    return NextResponse.json({ error: "Requisição inválida. Envie um formulário multipart." }, { status: 400 });
  }

  const file = formData.get("file") as File | null;

  if (!file || file.size === 0) {
    return NextResponse.json({ error: "Nenhuma imagem enviada." }, { status: 400 });
  }

  // Validação de tipo mais flexível
  const validTypes = ["image/png", "image/jpeg", "image/jpg", "image/webp", "image/gif"];
  const fileType = file.type.toLowerCase();
  if (fileType && !validTypes.includes(fileType)) {
    return NextResponse.json(
      { error: `Formato não suportado: ${file.type}. Use PNG, JPEG, WebP ou GIF.` },
      { status: 400 }
    );
  }

  // Validação de tamanho (10MB)
  if (file.size > 10 * 1024 * 1024) {
    return NextResponse.json(
      { error: "Arquivo muito grande. Máximo: 10MB." },
      { status: 400 }
    );
  }

  try {
    const buffer = Buffer.from(await file.arrayBuffer());
    const result = await processUpload(buffer);
    return NextResponse.json(result);
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { error: `Erro ao salvar imagem: ${error instanceof Error ? error.message : "Tente novamente."}` },
      { status: 500 }
    );
  }
}
