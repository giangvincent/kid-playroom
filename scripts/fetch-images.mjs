// Downloads the real game imagery once and writes docs/ASSETS.md:
//   - animal photos: Wikipedia lead images (Wikimedia Commons, free licences)
//   - shapes + game icons: Twemoji SVGs (CC-BY 4.0, jdecked/twemoji fork)
// Run: node scripts/fetch-images.mjs   (needs network; overwrites existing)
import { mkdir, writeFile } from "node:fs/promises";

const OUT = new URL("../public/assets/", import.meta.url).pathname;
const TWEMOJI = "https://cdn.jsdelivr.net/gh/jdecked/twemoji@15.1.0/assets/svg/";

const ANIMALS = [
  { id: "cat", article: "Cat" },
  { id: "dog", article: "Labrador Retriever" },
  { id: "fish", article: "Goldfish" },
  { id: "bird", article: "Budgerigar" },
  { id: "frog", article: "Common frog" },
  { id: "rabbit", article: "European rabbit" },
];

const SHAPES = [
  { id: "circle", code: "1f535", name: "large blue circle" },
  { id: "square", code: "1f7e9", name: "large green square" },
  { id: "triangle", code: "1f53a", name: "red triangle" },
  { id: "diamond", code: "1f536", name: "large orange diamond" },
  { id: "star", code: "2b50", name: "star" },
  { id: "heart", code: "2764", name: "red heart" },
  { id: "ring", code: "2b55", name: "heavy large circle" },
  { id: "plus", code: "2795", name: "heavy plus sign" },
];

const ICONS = [
  { id: "icon-matching", code: "1f9e9", name: "puzzle piece" },
  { id: "icon-color", code: "1f3a8", name: "artist palette" },
  { id: "icon-size", code: "1f4cf", name: "straight ruler" },
  { id: "icon-drawing", code: "270f", name: "pencil" },
  { id: "icon-memory", code: "1f3b4", name: "flower playing cards" },
];

const stripTags = (html) => html.replace(/<[^>]*>/g, "").replace(/&amp;/g, "&").trim();
const UA = { headers: { "User-Agent": "playroom-asset-fetch/1.0 (private offline kids app)" } };

async function download(url, file) {
  const res = await fetch(url, UA);
  if (!res.ok) {
    throw new Error(`${res.status} for ${url}`);
  }
  await writeFile(file, Buffer.from(await res.arrayBuffer()));
}

await mkdir(OUT, { recursive: true });

// Animal lead images via the Wikipedia pageimages API.
const titles = ANIMALS.map((animal) => encodeURIComponent(animal.article)).join("%7C");
const pageRes = await fetch(
  `https://en.wikipedia.org/w/api.php?action=query&format=json&formatversion=2&prop=pageimages&piprop=thumbnail%7Cname&pithumbsize=800&redirects=1&titles=${titles}`,
  UA,
);
const pages = (await pageRes.json()).query.pages;
const byTitle = new Map(pages.map((page) => [page.title, page]));

const animalRows = [];
for (const animal of ANIMALS) {
  const page = byTitle.get(animal.article);
  if (!page?.thumbnail?.source || !page.pageimage) {
    throw new Error(`No lead image for ${animal.article}`);
  }
  const file = `${animal.id}.jpg`;
  await download(page.thumbnail.source, OUT + file);

  const metaRes = await fetch(
    `https://commons.wikimedia.org/w/api.php?action=query&format=json&formatversion=2&prop=imageinfo&iiprop=extmetadata&titles=${encodeURIComponent(`File:${page.pageimage}`)}`,
    UA,
  );
  const info = (await metaRes.json()).query.pages[0].imageinfo?.[0];
  const meta = info?.extmetadata ?? {};
  const row = {
    file,
    image: page.pageimage,
    article: animal.article,
    license: stripTags(meta.LicenseShortName?.value ?? "unknown"),
    artist: stripTags(meta.Artist?.value ?? "unknown"),
  };
  animalRows.push(row);
  console.log(`${file} <- ${row.image} (${row.license})`);
}

const emojiRows = [];
for (const { id, code, name } of [...SHAPES, ...ICONS]) {
  const file = `${id}.svg`;
  await download(`${TWEMOJI}${code}.svg`, OUT + file);
  emojiRows.push({ file, name, code });
}
console.log(`${emojiRows.length} twemoji svg files`);

const mdLines = [];
mdLines.push(
  "# Asset sources",
  "",
  "All game imagery is downloaded from the internet (no AI-generated images).",
  "",
  "Regenerate with: node scripts/fetch-images.mjs",
  "",
  "## Animal photos (public/assets/*.jpg)",
  "",
  "| File | Wikipedia article | Commons file | Licence | Author |",
  "| --- | --- | --- | --- | --- |",
);
for (const row of animalRows) {
  const articleUrl = "https://en.wikipedia.org/wiki/" + encodeURIComponent(row.article.replace(/ /g, "_"));
  const commonsUrl = "https://commons.wikimedia.org/wiki/File:" + encodeURIComponent(row.image);
  mdLines.push(`| ${row.file} | [${row.article}](${articleUrl}) | [${row.image}](${commonsUrl}) | ${row.license} | ${row.artist} |`);
}
mdLines.push(
  "",
  "## Shapes and game icons (public/assets/*.svg)",
  "",
  "[Twemoji](https://github.com/jdecked/twemoji) graphics, licence",
  "[CC-BY 4.0](https://github.com/jdecked/twemoji/blob/master/LICENSE).",
  "",
  "| File | Twemoji name | Codepoint |",
  "| --- | --- | --- |",
);
for (const row of emojiRows) {
  mdLines.push(`| ${row.file} | ${row.name} | ${row.code} |`);
}
await writeFile(new URL("../docs/ASSETS.md", import.meta.url), mdLines.join("\n") + "\n");
console.log("docs/ASSETS.md written");
