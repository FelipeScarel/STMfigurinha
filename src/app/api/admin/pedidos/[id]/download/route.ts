import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth-utils";
import { prisma } from "@/lib/db";
import archiver from "archiver";
import path from "path";
import fs from "fs";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdmin();
  if (auth instanceof NextResponse) return auth;

  const { id } = await params;

  const order = await prisma.order.findUnique({
    where: { id },
    include: { items: true },
  });

  if (!order) {
    return NextResponse.json({ error: "Pedido não encontrado." }, { status: 404 });
  }

  const uploadIds = order.items
    .filter((i) => i.uploadId)
    .map((i) => i.uploadId!);

  if (uploadIds.length === 0) {
    return NextResponse.json(
      { error: "Nenhuma imagem personalizada neste pedido." },
      { status: 400 }
    );
  }

  const uploads = await prisma.customUpload.findMany({
    where: { id: { in: uploadIds } },
  });

  // Create ZIP
  const archive = archiver("zip", { zlib: { level: 9 } });
  const chunks: Buffer[] = [];

  archive.on("data", (chunk: Buffer) => chunks.push(chunk));

  const zipPromise = new Promise<Buffer>((resolve, reject) => {
    archive.on("end", () => resolve(Buffer.concat(chunks)));
    archive.on("error", reject);
  });

  for (const upload of uploads) {
    const files = [
      { url: upload.highResUrl, suffix: "alta-res" },
      { url: upload.originalUrl, suffix: "original" },
    ];

    for (const file of files) {
      const filePath = path.join(process.cwd(), "public", file.url);
      if (fs.existsSync(filePath)) {
        const ext = path.extname(file.url);
        archive.file(filePath, { name: `upload_${upload.id.slice(-6)}_${file.suffix}${ext}` });
      }
    }
  }

  await archive.finalize();
  const zipBuffer = await zipPromise;

  return new NextResponse(zipBuffer, {
    headers: {
      "Content-Type": "application/zip",
      "Content-Disposition": `attachment; filename="pedido-${id.slice(-8)}-imagens.zip"`,
    },
  });
}
