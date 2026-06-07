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

  let image = sharp(inputBuffer);

  // Aplica crop se especificado
  if (cropData) {
    const metadata = await image.metadata();
    const imgW = metadata.width || 1;
    const imgH = metadata.height || 1;

    image = image.extract({
      left: Math.round((cropData.x / 100) * imgW),
      top: Math.round((cropData.y / 100) * imgH),
      width: Math.round((cropData.width / 100) * imgW),
      height: Math.round((cropData.height / 100) * imgH),
    });
  }

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
