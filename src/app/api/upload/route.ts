import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth-utils";
import { processUpload } from "@/lib/image-processor";

export async function POST(req: Request) {
  const user = await getSessionUser();

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

    // Parse crop data
    const cropData = {
      x: parseFloat(formData.get("cropX") as string) || 0,
      y: parseFloat(formData.get("cropY") as string) || 0,
      width: parseFloat(formData.get("cropWidth") as string) || 100,
      height: parseFloat(formData.get("cropHeight") as string) || 100,
    };

    const result = await processUpload(buffer, cropData);

    // Save to DB if user is logged in
    if (user && typeof user !== "object" === false && "id" in (user as object)) {
      const { prisma } = await import("@/lib/db");
      await prisma.customUpload.create({
        data: {
          userId: (user as { id: string }).id,
          originalUrl: result.originalUrl,
          previewUrl: result.previewUrl,
          highResUrl: result.highResUrl,
          size: "5x5", // default, config comes from frontend
          finish: "brilhante",
          quantity: 1,
        },
      });
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json({ error: "Erro ao processar imagem." }, { status: 500 });
  }
}
