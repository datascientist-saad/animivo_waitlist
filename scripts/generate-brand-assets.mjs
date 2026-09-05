import { copyFileSync, mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import sharp from "sharp";

const ROOT = path.resolve(".");
const SRC = path.join(ROOT, "brand/animivo-logo-master.png");
const CREAM = { r: 250, g: 247, b: 242, alpha: 1 };

const FULL = { left: 154, top: 491, width: 1694, height: 1009 };
const ARCH = { left: 368, top: 492, width: 1306, height: 625 };

async function toTransparentPng(extract, padding, dest, maxWidth) {
  const padded = {
    left: extract.left - padding,
    top: extract.top - padding,
    width: extract.width + padding * 2,
    height: extract.height + padding * 2,
  };

  const { data, info } = await sharp(SRC, { autoOrient: false })
    .extract(padded)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    if (r > 246 && g > 246 && b > 246) {
      data[i + 3] = 0;
    }
  }

  let image = sharp(data, {
    raw: { width: info.width, height: info.height, channels: 4 },
  }).png({ compressionLevel: 9 });

  if (maxWidth) {
    image = image.resize({ width: maxWidth, withoutEnlargement: true });
  }

  await image.toFile(dest);
}

function pngToIco(png32, png16) {
  // Minimal ICO with 32x32 and 16x16 PNG images.
  const images = [png32, png16];
  const header = Buffer.alloc(6 + 16 * images.length);
  header.writeUInt16LE(0, 0);
  header.writeUInt16LE(1, 2);
  header.writeUInt16LE(images.length, 4);

  const chunks = [header];
  let offset = header.length;
  const sizes = [32, 16];

  for (let i = 0; i < images.length; i++) {
    const png = images[i];
    const dir = header.subarray(6 + i * 16, 6 + (i + 1) * 16);
    dir.writeUInt8(sizes[i] >= 256 ? 0 : sizes[i], 0);
    dir.writeUInt8(sizes[i] >= 256 ? 0 : sizes[i], 1);
    dir.writeUInt8(0, 2);
    dir.writeUInt8(0, 3);
    dir.writeUInt16LE(1, 4);
    dir.writeUInt16LE(32, 6);
    dir.writeUInt32LE(png.length, 8);
    dir.writeUInt32LE(offset, 12);
    chunks.push(png);
    offset += png.length;
  }

  return Buffer.concat(chunks);
}

async function squareIcon(size, dest) {
  const arch = await sharp(SRC, { autoOrient: false }).extract(ARCH).png().toBuffer();
  await sharp({
    create: {
      width: size,
      height: size,
      channels: 3,
      background: { r: 250, g: 247, b: 242 },
    },
  })
    .composite([
      {
        input: await sharp(arch, { autoOrient: false })
          .resize({
            width: Math.round(size * 0.86),
            height: Math.round(size * 0.86),
            fit: "inside",
          })
          .png()
          .toBuffer(),
        gravity: "center",
      },
    ])
    .png({ compressionLevel: 9 })
    .toFile(dest);
}

async function main() {
  mkdirSync(path.join(ROOT, "public/brand"), { recursive: true });
  mkdirSync(path.join(ROOT, "public/icons"), { recursive: true });

  const fullLockupPath = path.join(ROOT, "public/brand/animivo-logo.png");
  await toTransparentPng(FULL, 24, fullLockupPath, 1400);

  await squareIcon(32, path.join(ROOT, "public/icons/icon-32.png"));
  await squareIcon(48, path.join(ROOT, "public/icons/icon-48.png"));
  await squareIcon(180, path.join(ROOT, "public/icons/apple-touch-icon.png"));
  await squareIcon(192, path.join(ROOT, "public/icons/icon-192.png"));
  await squareIcon(512, path.join(ROOT, "public/icons/icon-512.png"));

  const png32 = await sharp(path.join(ROOT, "public/icons/icon-32.png")).png().toBuffer();
  const png16 = await sharp(path.join(ROOT, "public/icons/icon-32.png"))
    .resize(16, 16)
    .png()
    .toBuffer();
  writeFileSync(path.join(ROOT, "public/favicon.ico"), pngToIco(png32, png16));

  const logoFull = await sharp(fullLockupPath)
    .resize({ height: 420, withoutEnlargement: true })
    .png()
    .toBuffer();
  const logoMeta = await sharp(logoFull).metadata();
  const ogWidth = 1200;
  const ogHeight = 630;

  const fittedLogo =
    (logoMeta.width ?? 0) > ogWidth || (logoMeta.height ?? 0) > ogHeight
      ? await sharp(logoFull)
          .resize({
            width: ogWidth - 80,
            height: ogHeight - 80,
            fit: "inside",
          })
          .png()
          .toBuffer()
      : logoFull;
  const fittedMeta = await sharp(fittedLogo).metadata();

  await sharp({
    create: {
      width: ogWidth,
      height: ogHeight,
      channels: 3,
      background: { r: 250, g: 247, b: 242 },
    },
  })
    .composite([
      {
        input: fittedLogo,
        left: Math.round((ogWidth - (fittedMeta.width ?? 0)) / 2),
        top: Math.round((ogHeight - (fittedMeta.height ?? 0)) / 2),
      },
    ])
    .png({ compressionLevel: 9 })
    .toFile(path.join(ROOT, "public/brand/og-image.png"));

  copyFileSync(path.join(ROOT, "public/icons/icon-512.png"), path.join(ROOT, "app/icon.png"));
  copyFileSync(
    path.join(ROOT, "public/icons/apple-touch-icon.png"),
    path.join(ROOT, "app/apple-icon.png"),
  );
  copyFileSync(path.join(ROOT, "public/favicon.ico"), path.join(ROOT, "app/favicon.ico"));

  console.log("Brand assets written.");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
