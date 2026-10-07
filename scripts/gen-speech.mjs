// One-off generator for public/speech/*.mp3 (vi-VN-HoaiMyNeural via edge-tts).
// Setup: python3 -m venv /tmp/tts-venv && /tmp/tts-venv/bin/pip install edge-tts
// Run with the venv on PATH so edge-tts resolves (skips existing files):
//   PATH="/private/tmp/tts-venv/bin:$PATH" node scripts/gen-speech.mjs
import { execFileSync } from "node:child_process";
import { mkdirSync, statSync } from "node:fs";
import { join } from "node:path";

const OUT = join(import.meta.dirname, "..", "public", "speech");
const VOICE = "vi-VN-HoaiMyNeural";

const LABELS = [
  "hình tròn",
  "hình vuông",
  "hình tam giác",
  "hình thoi",
  "hình ngôi sao",
  "hình trái tim",
  "hình tròn rỗng",
  "hình chữ thập",
  "con mèo",
  "con chó",
  "con cá",
  "con chim",
  "con ếch",
  "con thỏ",
  "màu đỏ",
  "màu cam",
  "màu vàng",
  "màu xanh lá",
  "màu xanh dương",
  "màu tím",
  "màu hồng",
  "màu nâu",
];

const COLORS = [
  "màu đỏ", "màu cam", "màu vàng", "màu xanh lá",
  "màu xanh dương", "màu tím", "màu hồng", "màu nâu",
];
const ANIMALS = ["con mèo", "con chó", "con cá", "con chim", "con ếch", "con thỏ"];

const PHRASES = [
  ...LABELS,
  "Những hình giống nhau ở đâu?",
  "Hai thẻ giống nhau ở đâu?",
  ...COLORS.map(goal),
  ...ANIMALS.map(goal),
  goal("hình lớn nhất"),
  goal("hình nhỏ nhất"),
];

function goal(phrase) {
  return `${phrase.charAt(0).toUpperCase()}${phrase.slice(1)} ở đâu?`;
}

function slug(text) {
  return text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

mkdirSync(OUT, { recursive: true });
for (const phrase of PHRASES) {
  const file = join(OUT, `${slug(phrase)}.mp3`);
  if (statSync(file, { throwIfNoEntry: false })?.size > 0) {
    continue;
  }
  console.log(phrase);
  execFileSync("edge-tts", [
    "--voice",
    VOICE,
    "--text",
    phrase,
    "--write-media",
    file,
  ]);
}
