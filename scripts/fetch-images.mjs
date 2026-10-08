// Downloads the real game imagery once and writes docs/ASSETS.md:
//   - animal photos: Wikipedia lead images (Wikimedia Commons, free licences)
//   - new animals + fruit/vegetable + vehicle photos: Commons search,
//     Vietnam-context queries first, square centre-crops via sips
//   - shapes + game icons: Twemoji SVGs (CC-BY 4.0, jdecked/twemoji fork)
// Run: node scripts/fetch-images.mjs   (needs network; overwrites existing)
import { execFileSync } from "node:child_process";
import { readdirSync, readFileSync, writeFileSync } from "node:fs";
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
  { id: "icon-fruit", code: "1f347", name: "grapes" },
  { id: "icon-vehicle", code: "1f697", name: "automobile" },
];

// New Sprint 6 items: id = asset/file name, queries = VN-context first.
const SEARCH_ITEMS = [
  { id: "cow", wiki: "Cattle", queries: ["cow head", "brown cow", "cow meadow"], avoid: /buffalo/i },
  { id: "chicken", wiki: "Chicken", queries: [], avoid: /feet|meat/i },
  { id: "duck", wiki: "Domestic duck", queries: [], avoid: /feet|meat/i },
  { id: "pig", wiki: "Pig", queries: ["pig Vietnam", "piglet"] },
  { id: "dolphin", wiki: "Bottlenose dolphin", queries: ["bottlenose dolphin jump"] },
  { id: "shark", wiki: "Shark", queries: ["shark underwater"] },
  { id: "mango", wiki: "Mango", queries: ["mangoes Vietnam market"] },
  { id: "banana", wiki: "Banana", queries: [] },
  { id: "orange", wiki: "Orange (fruit)", queries: [] },
  { id: "guava", wiki: "Guava", queries: ["guava Vietnam"] },
  { id: "watermelon", wiki: "Watermelon", queries: ["watermelon Vietnam market"] },
  { id: "papaya", wiki: "Papaya", queries: [] },
  { id: "longan", wiki: "Longan", queries: ["longan Vietnam"] },
  { id: "mangosteen", wiki: "Mangosteen", queries: ["mangosteen Vietnam"] },
  { id: "durian", wiki: "Durian", queries: [] },
  { id: "lychee", wiki: "Lychee", queries: ["lychee Vietnam"] },
  { id: "dragonfruit", wiki: "Pitaya", queries: [] },
  { id: "avocado", wiki: "Avocado", queries: ["avocado Vietnam"] },
  { id: "tomato", wiki: "Tomato", queries: [] },
  { id: "carrot", wiki: "Carrot", queries: ["carrots Vietnam market"] },
  { id: "potato", wiki: "Potato", queries: ["potatoes Vietnam market"] },
  { id: "corn", wiki: "Corn on the cob", queries: [] },
  { id: "pumpkin", wiki: "Pumpkin", queries: ["pumpkin Vietnam market"] },
  { id: "pineapple", wiki: "Pineapple", queries: [] },
  { id: "motorbike", wiki: "Motorcycle", queries: ["motorbikes Hanoi", "motorbike Vietnam street"] },
  { id: "bicycle", wiki: "Bicycle", queries: [] },
  { id: "car", wiki: "Car", queries: ["car Vietnam street"], avoid: /cable|coach|bus/i },
  { id: "bus", wiki: "Bus", queries: ["bus Vietnam city"] },
  { id: "truck", wiki: "Truck", queries: [] },
  { id: "firetruck", wiki: "Fire engine", queries: ["fire truck"] },
  { id: "ambulance", wiki: "Ambulance", queries: ["ambulance Vietnam"] },
  { id: "train", wiki: "Train", queries: ["Reunification Express", "train locomotive"], minW: 480 },
  { id: "airplane", wiki: "Airplane", queries: [] },
  { id: "helicopter", wiki: "Helicopter", queries: [] },
  { id: "boat", wiki: "Boat", queries: ["rowboat lake", "wooden boat river"], minW: 480 },
  { id: "ship", wiki: "Ship", queries: [] },
  { id: "canoe", wiki: "Motorboat", queries: ["motorboat river"] },
  { id: "sampan", wiki: "Sampan", queries: [] },
  { id: "ferry", wiki: "Ferry", queries: ["ferry Vietnam"], avoid: /war|1966|military|navy/i },
  { id: "cyclo", wiki: "Cycle rickshaw", queries: [] },
  { id: "cablecar", wiki: "Aerial tramway", queries: ["Ba Na Hills cable car", "Hon Thom cable car"], avoid: /funicular/i },
  { id: "coach", wiki: "Coach (bus)", queries: ["coach bus Vietnam"] },
];

const stripTags = (html) => html.replace(/<[^>]*>/g, "").replace(/&amp;/g, "&").trim();
const UA = { headers: { "User-Agent": "playroom-asset-fetch/1.0 (private offline kids app)" } };

const MANIFEST_PATH = new URL("../public/assets/manifest.json", import.meta.url).pathname;
let manifest = {};
try {
  manifest = JSON.parse(readFileSync(MANIFEST_PATH, "utf8"));
} catch {
  manifest = {};
}

const BAD_SUBJECT = /map|diagram|logo|coat of arms|flag|chart|drawing|sketch|painting|cartoon|statue|sculpture|feet|slaughter|butcher|grilled|dish|cuisine|portrait|bust|kfc|kentucky|fried|restaurant|shop|store|sign|cafe/i;

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function apiJson(url) {
  for (let attempt = 0; attempt < 2; attempt++) {
    const res = await fetch(url, UA);
    const text = await res.text();
    if (res.ok && text.startsWith("{")) {
    await sleep(400);
      return JSON.parse(text);
    }
    await sleep(5000 + attempt * 12000);
  }
  throw new Error("api failed: " + url);
}

function squareCrop(file) {
  const dims = execFileSync("sips", ["-g", "pixelWidth", "-g", "pixelHeight", file]).toString();
  const w = Number(dims.match(/pixelWidth: (\d+)/)?.[1]);
  const h = Number(dims.match(/pixelHeight: (\d+)/)?.[1]);
  if (!w || !h) {
    throw new Error("no dims for " + file);
  }
  const side = Math.min(w, h);
  if (w !== h) {
    execFileSync("sips", ["-c", String(side), String(side), file]);
  }
  execFileSync("sips", ["-Z", "640", file]);
}

async function searchPhoto(item) {
  for (const query of item.queries) {
    const url =
      "https://commons.wikimedia.org/w/api.php?action=query&format=json&formatversion=2" +
      "&generator=search&gsrnamespace=6&gsrlimit=10&prop=imageinfo" +
      "&iiprop=url%7Csize%7Cextmetadata&iiurlwidth=800&gsrsearch=" +
      encodeURIComponent(query + " filemime:image/jpeg");
    const pages = (await apiJson(url)).query?.pages ?? [];
    for (const page of pages) {
      const info = page.imageinfo?.[0];
      const title = page.title ?? "";
      const license = stripTags(info?.extmetadata?.LicenseShortName?.value ?? "");
      if (!info || !info.thumburl) continue;
      if (info.width < (item.minW ?? 600) || info.height < (item.minH ?? 450)) continue;
      if (BAD_SUBJECT.test(title) || (item.avoid && item.avoid.test(title))) continue;
      if (!/(CC|Public domain|PD)/i.test(license)) continue;
      return { title, thumb: info.thumburl, license, artist: stripTags(info.extmetadata?.Artist?.value ?? "unknown") };
    }
  }
  throw new Error("no free photo for: " + queries.join(" / "));
}

// Curated fallback: the Wikipedia article lead images (same source as the
// original six animals), fetched in two batched calls for all items.
async function batchLead(articles) {
  const queryPages = (
    await apiJson(
      "https://en.wikipedia.org/w/api.php?action=query&format=json&formatversion=2" +
        "&prop=pageimages&piprop=thumbnail%7Cname&pithumbsize=800&redirects=1&titles=" +
        articles.map((article) => encodeURIComponent(article)).join("%7C"),
    )
  ).query ?? {};
  const redirects = new Map(
    (queryPages.redirects ?? []).map((r) => [r.from, r.to]),
  );
  const byArticle = new Map();
  const fileNames = [];
  for (const page of queryPages.pages ?? []) {
    if (page.thumbnail?.source && page.pageimage) {
      byArticle.set(page.title, { thumb: page.thumbnail.source, file: page.pageimage });
      fileNames.push("File:" + page.pageimage);
    }
  }
  const metaByFile = new Map();
  if (fileNames.length > 0) {
    const metaPages = (
      await apiJson(
        "https://commons.wikimedia.org/w/api.php?action=query&format=json&formatversion=2" +
          "&prop=imageinfo&iiprop=extmetadata&titles=" +
          fileNames.map((f) => encodeURIComponent(f)).join("%7C"),
      )
    ).query?.pages ?? [];
    for (const mp of metaPages) {
      const meta = mp.imageinfo?.[0]?.extmetadata ?? {};
      metaByFile.set(mp.title.replace(/_/g, " "), {
        license: stripTags(meta.LicenseShortName?.value ?? "unknown"),
        artist: stripTags(meta.Artist?.value ?? "unknown"),
      });
    }
  }
  return { byArticle, metaByFile, redirects };
}

async function download(url, file) {
  const res = await fetch(url, UA);
  if (!res.ok) {
    throw new Error(`${res.status} for ${url}`);
  }
  await writeFile(file, Buffer.from(await res.arrayBuffer()));
}

await mkdir(OUT, { recursive: true });

const animalRows = [];
for (const animal of ANIMALS) {
  const cached = manifest["_a:" + animal.id + ".jpg"];
  if (cached) {
    animalRows.push(cached);
    continue;
  }
  const page = (
    await apiJson(
      "https://en.wikipedia.org/w/api.php?action=query&format=json&formatversion=2&prop=pageimages&piprop=thumbnail%7Cname&pithumbsize=800&redirects=1&titles=" + encodeURIComponent(animal.article),
    )
  ).query.pages[0];
  if (!page?.thumbnail?.source || !page.pageimage) {
    throw new Error("No lead image for " + animal.article);
  }
  const file = `${animal.id}.jpg`;
  await download(page.thumbnail.source, OUT + file);

  const info = (
    await apiJson(
      "https://commons.wikimedia.org/w/api.php?action=query&format=json&formatversion=2&prop=imageinfo&iiprop=extmetadata&titles=" + encodeURIComponent("File:" + page.pageimage),
    )
  ).query.pages[0].imageinfo?.[0];
  const meta = info?.extmetadata ?? {};
  const row = {
    file,
    image: page.pageimage,
    article: animal.article,
    license: stripTags(meta.LicenseShortName?.value ?? "unknown"),
    artist: stripTags(meta.Artist?.value ?? "unknown"),
  };
  manifest["_a:" + file] = row;
  writeFileSync(MANIFEST_PATH, JSON.stringify(manifest, null, 2) + String.fromCharCode(10));
  animalRows.push(row);
  console.log(`${file} <- ${row.image} (${row.license})`);
}

const emojiRows = [];
for (const { id, code, name } of [...SHAPES, ...ICONS]) {
  const cached = manifest["_i:" + id + ".svg"];
  if (cached) {
    emojiRows.push(cached);
    continue;
  }
  const file = `${id}.svg`;
  await download(`${TWEMOJI}${code}.svg`, OUT + file);
  const row = { file, name, code };
  manifest["_i:" + file] = row;
  writeFileSync(MANIFEST_PATH, JSON.stringify(manifest, null, 2) + String.fromCharCode(10));
  emojiRows.push(row);
}
console.log(emojiRows.length + " twemoji svg files");

const itemRows = [];
const failed = [];
for (const item of SEARCH_ITEMS) {
  const file = item.id + ".jpg";
  if (manifest[file]) {
    itemRows.push({ file, ...manifest[file] });
    continue;
  }
  try {
    const photo = await searchPhoto(item);
    await download(photo.thumb, OUT + file);
    manifest[file] = { image: photo.title, license: photo.license, artist: photo.artist };
    writeFileSync(MANIFEST_PATH, JSON.stringify(manifest, null, 2) + String.fromCharCode(10));
    itemRows.push({ file, ...manifest[file] });
    console.log(file + " <- " + photo.title + " (" + photo.license + ")");
  } catch {
    failed.push(item);
  }
}
if (failed.length > 0) {
  const { byArticle, metaByFile, redirects } = await batchLead(failed.map((item) => item.wiki));
  for (const item of failed) {
    const lead = byArticle.get(redirects.get(item.wiki) ?? item.wiki);
    if (!lead) {
      throw new Error("no lead image for " + item.wiki);
    }
    const file = item.id + ".jpg";
    await download(lead.thumb, OUT + file);
    const meta = metaByFile.get("File:" + lead.file.replace(/_/g, " ")) ?? {};
    const row = { file, image: "File:" + lead.file, license: meta.license ?? "unknown", artist: meta.artist ?? "unknown" };
    manifest[file] = { image: row.image, license: row.license, artist: row.artist };
    writeFileSync(MANIFEST_PATH, JSON.stringify(manifest, null, 2) + String.fromCharCode(10));
    itemRows.push(row);
    console.log(file + " <- " + row.image + " (" + row.license + ")");
  }
}
writeFileSync(MANIFEST_PATH, JSON.stringify(manifest, null, 2) + "\n");

// Square centre-crop + resize every photo (existing and new).
const photos = readdirSync(OUT).filter((name) => name.endsWith(".jpg"));
for (const name of photos) {
  squareCrop(OUT + name);
}
console.log(photos.length + " photos square-cropped to <=640px");

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
  "## New item photos, square crops (public/assets/*.jpg)",
  "",
  "Commons search, Vietnam-context queries first; centre-cropped to 1:1.",
  "",
  "| File | Commons file | Licence | Author |",
  "| --- | --- | --- | --- |",
);
for (const row of itemRows) {
  const commonsUrl = "https://commons.wikimedia.org/wiki/" + encodeURIComponent(row.image.replace(/ /g, "_"));
  mdLines.push("| " + row.file + " | [" + row.image + "](" + commonsUrl + ") | " + row.license + " | " + row.artist + " |");
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
