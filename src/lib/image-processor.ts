import sharp from "sharp";
import path from "path";
import fs from "fs/promises";

const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads");

async function ensureDir(dir: string) {
  try {
    await fs.mkdir(dir, { recursive: true });
  } catch {
    // already exists
  }
}

export async function processUpload(
  inputBuffer: Buffer,
  cropData?: { x: number; y: number; width: number; height: number }
) {
  const id = Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
  await ensureDir(UPLOAD_DIR);

  const metadata = await sharp(inputBuffer).metadata();
  const imgW = metadata.width || 800;
  const imgH = metadata.height || 800;

  let image = sharp(inputBuffer);

  // Aplica crop se especificado (cropData vem em PIXELS da imagem original)
  if (cropData && cropData.width > 0 && cropData.height > 0) {
    // Valida e limita as coordenadas dentro dos limites da imagem
    const left = Math.max(0, Math.min(Math.round(cropData.x), imgW - 1));
    const top = Math.max(0, Math.min(Math.round(cropData.y), imgH - 1));
    const cropWidth = Math.max(1, Math.min(Math.round(cropData.width), imgW - left));
    const cropHeight = Math.max(1, Math.min(Math.round(cropData.height), imgH - top));

    image = image.extract({
      left,
      top,
      width: cropWidth,
      height: cropHeight,
    });
  }

  try {
    // Preview WebP (300x300)
    const previewPath = path.join(UPLOAD_DIR, `${id}_preview.webp`);
    await image
      .clone()
      .resize(300, 300, { fit: "cover" })
      .webp({ quality: 85 })
      .toFile(previewPath);

    // Alta resolução PNG (300 DPI, ~1200px para 10cm)
    const highResPath = path.join(UPLOAD_DIR, `${id}_hires.png`);
    await image
      .clone()
      .resize(1200, 1200, { fit: "inside", withoutEnlargement: true })
      .png({ quality: 100 })
      .toFile(highResPath);

    // Original otimizado WebP
    const originalPath = path.join(UPLOAD_DIR, `${id}_original.webp`);
    await image
      .clone()
      .resize(800, 800, { fit: "inside", withoutEnlargement: true })
      .webp({ quality: 90 })
      .toFile(originalPath);

    return {
      id,
      previewUrl: `/uploads/${id}_preview.webp`,
      highResUrl: `/uploads/${id}_hires.png`,
      originalUrl: `/uploads/${id}_original.webp`,
    };
  } catch (err) {
    // Se o crop falhou, tenta sem crop
    if (cropData) {
      console.warn("Crop failed, processing without crop:", err);
      image = sharp(inputBuffer);
      const previewPath = path.join(UPLOAD_DIR, `${id}_preview.webp`);
      await image
        .resize(300, 300, { fit: "cover" })
        .webp({ quality: 85 })
        .toFile(previewPath);
      const highResPath = path.join(UPLOAD_DIR, `${id}_hires.png`);
      await image
        .resize(1200, 1200, { fit: "inside", withoutEnlargement: true })
        .png({ quality: 100 })
        .toFile(highResPath);
      const originalPath = path.join(UPLOAD_DIR, `${id}_original.webp`);
      await image
        .resize(800, 800, { fit: "inside", withoutEnlargement: true })
        .webp({ quality: 90 })
        .toFile(originalPath);
      return {
        id,
        previewUrl: `/uploads/${id}_preview.webp`,
        highResUrl: `/uploads/${id}_hires.png`,
        originalUrl: `/uploads/${id}_original.webp`,
      };
    }
    throw err;
  }
}

export async function deleteUploadFiles(urls: {
  originalUrl: string;
  previewUrl: string;
  highResUrl: string;
}) {
  const toDelete = [urls.originalUrl, urls.previewUrl, urls.highResUrl];
  for (const url of toDelete) {
    try {
      const filePath = path.join(process.cwd(), "public", url);
      await fs.unlink(filePath);
    } catch {
      // arquivo já não existe
    }
  }
}
