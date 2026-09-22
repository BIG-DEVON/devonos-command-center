import sharp from "sharp";
import { fileURLToPath } from "node:url";
import path from "node:path";

const here = path.dirname(fileURLToPath(import.meta.url));
const source = path.join(here, "front-cover-v2-editable.svg");
const bleedOutput = path.join(here, "front-cover-v2-minimal-300dpi.png");
const trimOutput = path.join(here, "front-cover-v2-minimal-6x9.jpg");

const rendered = await sharp(source)
  .png({ compressionLevel: 9, quality: 100 })
  .withMetadata({ density: 300 })
  .toBuffer();

await sharp(rendered)
  .withMetadata({ density: 300 })
  .toFile(bleedOutput);

await sharp(rendered)
  .extract({ left: 37, top: 37, width: 1800, height: 2700 })
  .jpeg({ quality: 96, chromaSubsampling: "4:4:4" })
  .withMetadata({ density: 300 })
  .toFile(trimOutput);

console.log(bleedOutput);
console.log(trimOutput);
