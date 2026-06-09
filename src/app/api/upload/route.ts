import { NextResponse } from "next/server";
import { getSessionUser, type AuthUser } from "@/lib/auth-utils";
import { processUpload } from "@/lib/image-processor";

export async function POST(req: Request) {
  // Tenta pegar usuário da sessão (não bloqueia upload se falhar)
  let user: AuthUser | null = null;
  try {
    user = await getSessionUser();
  } catch {
    // continua sem usuário — upload público permitido
  }

  const formData = await req.formData();
  const file = formData.get("file") as File | null;

  if (!file) {
    return NextResponse.json({ error: "Nenhuma imagem enviada." }, { status: 400 });
  }

  // Validar tipo
  const validTypes = ["image/png", "image/jpeg", "image/webp"];
  if (!validTypes.includes(file.type)) {
    return NextResponse.json(
      { error: "Formato inválido. Use PNG, JPEG ou WebP." },
      { status: 400 }
    );
  }

  // Validar tamanho
  if (file.size > 10 * 1024 * 1024) {
    return NextResponse.json(
      { error: "Arquivo muito grande. Máximo: 10MB." },
      { status: 400 }
    );
  }

  try {
    const buffer = Buffer.from(await file.arrayBuffer());

    // Parse crop data (valores padrão: sem crop)
    const cropData = {
      x: parseFloat(formData.get("cropX") as string) || 0,
      y: parseFloat(formData.get("cropY") as string) || 0,
      width: parseFloat(formData.get("cropWidth") as string) || 0,
      height: parseFloat(formData.get("cropHeight") as string) || 0,
    };

    // Só aplica crop se todos os valores forem > 0
    const effectiveCrop = cropData.width > 0 && cropData.height > 0 ? cropData : undefined;

    const result = await processUpload(buffer, effectiveCrop);

    // Save to DB if user is logged in
    if (user?.id) {
      try {
        const { prisma } = await import("@/lib/db");
        await prisma.customUpload.create({
          data: {
            userId: user.id,
            originalUrl: result.originalUrl,
            previewUrl: result.previewUrl,
            highResUrl: result.highResUrl,
            size: "5x5",
            finish: "brilhante",
            quantity: 1,
          },
        });
      } catch (dbErr) {
        console.error("Erro ao salvar upload no banco:", dbErr);
        // não bloqueia — a imagem já foi salva
      }
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { error: `Erro ao processar imagem: ${error instanceof Error ? error.message : "Desconhecido"}` },
      { status: 500 }
    );
  }
}
