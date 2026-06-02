import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const root = path.resolve(__dirname, "..");

const outputDir = path.join(root, "public", "images");

const sources = [
  {
    input: path.join(root, "Screenshot 2026-05-20 235238.png"),
    output: path.join(outputDir, "project-screenshot.webp"),
    width: 1200,
  },
  {
    input: path.join(root, "console.png"),
    output: path.join(outputDir, "project-console.webp"),
    width: 1200,
  },
  {
    input: path.join(root, "opus.png"),
    output: path.join(outputDir, "project-opus.webp"),
    width: 1200,
  },
  {
    input: path.join(root, "muzeer.png"),
    output: path.join(outputDir, "project-muzeer.webp"),
    width: 1200,
  },
];

await fs.mkdir(outputDir, { recursive: true });

for (const file of sources) {
  const sourceMeta = await sharp(file.input).metadata();
  const resizeWidth = sourceMeta.width && sourceMeta.width > file.width ? file.width : sourceMeta.width;

  await sharp(file.input)
    .resize({ width: resizeWidth, withoutEnlargement: true })
    .webp({ quality: 90, effort: 6 })
    .toFile(file.output);

  const [srcStat, outStat] = await Promise.all([fs.stat(file.input), fs.stat(file.output)]);
  const saved = srcStat.size - outStat.size;
  const savedPct = srcStat.size > 0 ? (saved / srcStat.size) * 100 : 0;

  console.log(`${path.basename(file.input)} -> ${path.basename(file.output)} | ${Math.round(srcStat.size / 1024)}KB -> ${Math.round(outStat.size / 1024)}KB | saved ${savedPct.toFixed(1)}%`);
}
