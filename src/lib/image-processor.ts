import path from "path";
import fs from "fs/promises";

// Usa diretório "data" (fora do public) — as imagens são servidas via /api/uploads/[...path]
const UPLOAD_DIR = path.join(process.cwd(), "data", "uploads");

async function ensureDir(dir: string) {
  try {
    await fs.mkdir(dir, { recursive: true });
  } catch {
    // já existe ou sem permissão — tenta criar mesmo assim
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

  // URL servida pela API route /api/uploads/...
  const url = `/api/uploads/${filename}`;

  return {
    id,
    previewUrl: url,
    originalUrl: url,
    highResUrl: url,
  };
}

function detectImageFormat(buffer: Buffer): string {
  if (buffer.length < 4) return "png";
  // Detecta pelo magic number
  if (buffer[0] === 0xff && buffer[1] === 0xd8) return "jpg";
  if (buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4e && buffer[3] === 0x47) return "png";
  if (buffer[0] === 0x52 && buffer[1] === 0x49 && buffer[2] === 0x46 && buffer[3] === 0x46) return "webp";
  return "png";
}

export async function deleteUploadFiles(urls: {
  originalUrl: string;
  previewUrl: string;
  highResUrl: string;
}) {
  const toDelete = [urls.originalUrl, urls.previewUrl, urls.highResUrl];
  for (const url of toDelete) {
    try {
      // Extrai o filename da URL: /api/uploads/filename.jpg -> filename.jpg
      const filename = url.replace(/^\/api\/uploads\//, "");
      const filePath = path.join(UPLOAD_DIR, filename);
      await fs.unlink(filePath);
    } catch {
      // arquivo já não existe
    }
  }
}
