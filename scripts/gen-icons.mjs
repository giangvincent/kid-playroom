import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { deflateSync } from "node:zlib";

const PALETTE = {
  ".": null,
  "0": "#1d2b53",
  "3": "#ffec27",
};

// Same star as lib/pixel/sprites.ts; duplicated here so this build-time
// script stays dependency-free and does not import TypeScript.
const STAR = [
  "..0330..",
  "..0330..",
  "03333330",
  "03333330",
  ".033330.",
  "..0330..",
  ".033330.",
  "..0..0..",
];

const CRC_TABLE = (() => {
  const table = new Int32Array(256);
  for (let n = 0; n < 256; n += 1) {
    let c = n;
    for (let k = 0; k < 8; k += 1) {
      c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    }
    table[n] = c;
  }
  return table;
})();

function crc32(buffer) {
  let c = 0xffffffff;
  for (let i = 0; i < buffer.length; i += 1) {
    c = CRC_TABLE[(c ^ buffer[i]) & 0xff] ^ (c >>> 8);
  }
  return (c ^ 0xffffffff) >>> 0;
}

function chunk(type, data) {
  const length = Buffer.alloc(4);
  length.writeUInt32BE(data.length, 0);
  const body = Buffer.concat([Buffer.from(type, "ascii"), data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(body), 0);
  return Buffer.concat([length, body, crc]);
}

function encodePng(width, height, rgba) {
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8;
  ihdr[9] = 6;

  const stride = width * 4;
  const raw = Buffer.alloc((stride + 1) * height);
  for (let y = 0; y < height; y += 1) {
    raw[y * (stride + 1)] = 0;
    rgba.copy(raw, y * (stride + 1) + 1, y * stride, y * stride + stride);
  }

  return Buffer.concat([
    signature,
    chunk("IHDR", ihdr),
    chunk("IDAT", deflateSync(raw, { level: 9 })),
    chunk("IEND", Buffer.alloc(0)),
  ]);
}

function hexToRgb(hex) {
  const value = Number.parseInt(hex.slice(1), 16);
  return [(value >> 16) & 255, (value >> 8) & 255, value & 255];
}

function renderIcon(size, background, rows, paddingRatio) {
  const buffer = Buffer.alloc(size * size * 4);
  const [br, bg, bb] = hexToRgb(background);
  for (let i = 0; i < size * size; i += 1) {
    buffer[i * 4] = br;
    buffer[i * 4 + 1] = bg;
    buffer[i * 4 + 2] = bb;
    buffer[i * 4 + 3] = 255;
  }

  const columns = rows[0].length;
  const padding = Math.round(size * paddingRatio);
  const scale = Math.max(
    1,
    Math.floor((size - padding * 2) / Math.max(columns, rows.length)),
  );
  const offsetX = Math.round((size - columns * scale) / 2);
  const offsetY = Math.round((size - rows.length * scale) / 2);

  rows.forEach((row, y) => {
    [...row].forEach((char, x) => {
      const hex = PALETTE[char];
      if (!hex) {
        return;
      }
      const [r, g, b] = hexToRgb(hex);
      for (let dy = 0; dy < scale; dy += 1) {
        for (let dx = 0; dx < scale; dx += 1) {
          const index =
            ((offsetY + y * scale + dy) * size + offsetX + x * scale + dx) * 4;
          buffer[index] = r;
          buffer[index + 1] = g;
          buffer[index + 2] = b;
          buffer[index + 3] = 255;
        }
      }
    });
  });

  return buffer;
}

const outDir = resolve(dirname(fileURLToPath(import.meta.url)), "../public/icons");
mkdirSync(outDir, { recursive: true });

const targets = [
  { file: "icon-192.png", size: 192, background: "#fff1e8", padding: 0.16 },
  { file: "icon-512.png", size: 512, background: "#fff1e8", padding: 0.16 },
  {
    file: "icon-maskable-512.png",
    size: 512,
    background: "#29adff",
    padding: 0.24,
  },
  { file: "apple-icon-180.png", size: 180, background: "#fff1e8", padding: 0.16 },
];

for (const target of targets) {
  const rgba = renderIcon(target.size, target.background, STAR, target.padding);
  writeFileSync(
    resolve(outDir, target.file),
    encodePng(target.size, target.size, rgba),
  );
  console.log(`wrote public/icons/${target.file}`);
}
