import path from "path";
import fs from "fs/promises";
import { existsSync } from "fs";

const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads", "products");

async function ensureDir(dir: string) {
  if (!existsSync(dir)) {
    await fs.mkdir(dir, { recursive: true });
  }
}

export async function processUpload(
  inputBuffer: Buffer,
  _cropData?: { x: number; y: number; width: number; height: number }
) {
  const id = Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
  await ensureDir(UPLOAD_DIR);

  const ext = detectImageFormat(inputBuffer);
  const filename = `${id}.${ext}`;
  const filePath = path.join(UPLOAD_DIR, filename);

  await fs.writeFile(filePath, inputBuffer);

  return {
    id,
    previewUrl: `/uploads/products/${filename}`,
    originalUrl: `/uploads/products/${filename}`,
    highResUrl: `/uploads/products/${filename}`,
  };
}

function detectImageFormat(buffer: Buffer): string {
  // Detecta pelo magic number
  if (buffer[0] === 0xff && buffer[1] === 0xd8) return "jpg";
  if (buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4e && buffer[3] === 0x47) return "png";
  if (buffer[0] === 0x52 && buffer[1] === 0x49 && buffer[2] === 0x46 && buffer[3] === 0x46) return "webp"; // RIFF
  return "png"; // fallback
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
