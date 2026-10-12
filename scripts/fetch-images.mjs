// Downloads the real game imagery once and writes docs/ASSETS.md:
//   - every photo: Vietnam-context Commons category when one exists, else
//     Commons search with Vietnam-context queries first; candidates must match
//     the item's title pattern and are scored to prefer a single focused
//     subject (no markets, flocks, traffic scenes, collages, drawings...);
//     the Wikipedia lead image is the fallback
//   - square centre-crops via sips
//   - shapes + game icons: Twemoji SVGs (CC-BY 4.0, jdecked/twemoji fork)
// Run: node scripts/fetch-images.mjs   (needs network; overwrites existing)
import { execFileSync } from "node:child_process";
import { readdirSync, readFileSync, writeFileSync } from "node:fs";
import { mkdir, writeFile } from "node:fs/promises";

const OUT = new URL("../public/assets/", import.meta.url).pathname;
const TWEMOJI = "https://cdn.jsdelivr.net/gh/jdecked/twemoji@15.1.0/assets/svg/";

// match = the title must name the item (blocks "Cat Tien Park" for cat);
// cats = Vietnam-context Commons categories; queries = search fallback,
// Vietnam-flavoured first; avoid = known wrong subjects for this item.
const ANIMALS = [
  {
    id: "cat",
    article: "Cat",
    match: /\bcats?\b|kitten|mèo/i,
    cats: ["Category:Cats of Vietnam"],
    queries: ["cat Vietnam", "cat portrait", "tabby cat closeup"],
    avoid: /civet|langur|cat ba|cat tien|wildcat|leopard|tiger|lynx|bobcat|fishing cat|jungle cat|statue/i,
  },
  {
    id: "dog",
    article: "Labrador Retriever",
    match: /\bdogs?\b|puppy|chó/i,
    cats: ["Category:Dogs in Vietnam"],
    queries: ["dog Vietnam", "dog portrait", "labrador retriever head"],
    avoid: /meat|restaurant|slaughter|hot dog|bird dog|dawg|statue/i,
  },
  {
    id: "fish",
    article: "Goldfish",
    match: /\bfish\b|\bkoi\b|\bcarp\b/i,
    queries: ["koi carp closeup", "goldfish closeup", "goldfish white background"],
    avoid: /lantern|festival|\bart\b|paper|dish|cooked|market|sushi|sashimi|dead|fishing|greenhouse/i,
  },
  {
    id: "bird",
    article: "Budgerigar",
    match: /\bbirds?\b|bulbul|sparrow|\bmyna\b|starling|\bdove\b|pigeon|kingfisher|swallow|warbler|\bfinch\b|magpie|weaver/i,
    cats: ["Category:Birds of Vietnam"],
    queries: ["bird Vietnam", "budgerigar closeup", "budgerigar portrait"],
    avoid: /cessna|aircraft|plane|bird dog|nest|watching|egg|cage|market/i,
  },
  {
    id: "frog",
    article: "Common frog",
    match: /\bfrogs?\b|\btoads?\b|ếch|nhái/i,
    queries: ["tree frog closeup", "green frog white background", "frog macro", "frog Vietnam"],
    block: ["File:Frogs in Vietnam.jpg"],
    avoid: /\brats?\b|snake|fight|bait|dissection|anatomy|plate|cooked|fried|\bfood\b|eat|market|legs/i,
  },
  {
    id: "rabbit",
    article: "European rabbit",
    match: /\brabbits?\b|bunny|\bhare\b/i,
    queries: ["rabbit Vietnam", "white rabbit closeup", "rabbit portrait"],
    avoid: /roger|meat|cage|hutch|angora|figurine/i,
  },
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
  { id: "icon-most-size", code: "1f53c", name: "up-pointing small red triangle" },
  { id: "icon-drawing", code: "270f", name: "pencil" },
  { id: "icon-memory", code: "1f3b4", name: "flower playing cards" },
  { id: "icon-fruit", code: "1f347", name: "grapes" },
  { id: "icon-vehicle", code: "1f697", name: "automobile" },
];

const SEARCH_ITEMS = [
  {
    id: "cow", wiki: "Cattle", match: /\bcows?\b|cattle|\bbull\b|\box\b/i,
    cats: ["Category:Cattle in Vietnam"],
    queries: ["cow Vietnam", "cow portrait", "brown cow closeup"],
    avoid: /buffalo|herd|meadow|alp|switzerland|india|cows\b/i,
  },
  {
    id: "chicken", wiki: "Chicken", match: /\bchickens?\b|\bhen\b|rooster|gà/i,
    cats: ["Category:Chickens in Vietnam"],
    queries: ["chicken Vietnam", "hen portrait", "hen closeup", "chicken closeup"],
    avoid: /chickens\b|flock|coop|farm|feet|meat|chick|market|stall|male and female|rooster and/i,
  },
  {
    id: "duck", wiki: "Domestic duck", match: /\bducks?\b|duckling|mallard|vịt/i,
    queries: ["duck Vietnam", "duck portrait", "mallard closeup", "domestic duck white background"],
    avoid: /ducks\b|flock|farm|feet|meat|pancake|foie|market|inflatable|giant|festival|parade|museum|keeper|ethnology|statue|sculpt|herding|herd|retriever|tolling|scotia/i,
  },
  { id: "pig", wiki: "Pig", match: /\bpigs?\b|piglet/i, queries: ["pig Vietnam", "piglet"] },
  { id: "dolphin", wiki: "Bottlenose dolphin", match: /\bdolphin/i, queries: ["bottlenose dolphin jump"] },
  { id: "shark", wiki: "Shark", match: /\bsharks?\b/i, queries: ["shark underwater"] },
  { id: "mango", wiki: "Mango", match: /\bmango/i, queries: ["mangoes Vietnam market"] },
  {
    id: "banana", wiki: "Banana", match: /\bbananas?\b|chuối/i,
    queries: ["banana Vietnam", "banana bunch closeup", "banana white background"],
    avoid: /varieties|collage|montage|split|cake|bread|plantation/i,
  },
  {
    id: "orange", wiki: "Orange (fruit)", match: /\boranges?\b/i,
    queries: ["orange fruit white background", "orange fruit closeup", "orange fruit Vietnam"],
    avoid: /juice|segment|tree|orchard|graph|box|helicopter|spraying|plane|agent|market|stall/i,
  },
  {
    id: "guava", wiki: "Guava", match: /\bguavas?\b|ổi/i,
    queries: ["guava fruit", "guavas white background", "guava Vietnam", "pink guava fruit"],
    avoid: /tree|leaf|orchard|salad|juice|market|cut|slice|plate|knife|bowl/i,
  },
  {
    id: "watermelon", wiki: "Watermelon", match: /\bwatermelons?\b|dưa hấu/i,
    queries: ["watermelon whole white background", "watermelon whole fruit", "watermelon fruit isolated", "whole watermelon"],
    avoid: /field|farm|slice|slices|market|piece|carved|vampire|sculpt|plate|cut|enjoying|\bmen\b|\b19\d\d\b|qld|hamster|\bpet\b|with|sale|tokyo|stall|\bfor sale\b/i,
  },
  {
    id: "papaya", wiki: "Papaya", match: /\bpapayas?\b|đu đủ/i,
    queries: ["papaya fruit", "ripe papaya", "papaya white background", "papaya closeup"],
    avoid: /drawing|illustration|k[öo]hler|medizinal|tree|leaf|flower|salad|seeds|cross section|gỏi|khô bò|\bgoi\b|\bfood\b|shredded/i,
  },
  {
    id: "longan", wiki: "Longan", match: /\blongan\b/i,
    queries: ["longan fruits", "longan fruit closeup", "longan white background"],
    block: ["File:Tân thạnh , longan, vietnam - panoramio.jpg"],
    avoid: /tree|orchard|dried|peeled|bowl|market/i,
  },
  {
    id: "mangosteen", wiki: "Mangosteen", match: /\bmangosteens?\b/i,
    queries: ["mangosteen Vietnam", "mangosteen closeup", "mangosteen white background"],
    avoid: /basket|bowl|market|cross section|open|box/i,
  },
  { id: "durian", wiki: "Durian", match: /\bdurians?\b/i, queries: ["durian"] },
  {
    id: "lychee", wiki: "Lychee", match: /\blychees?\b|litchis?\b/i,
    queries: ["lychee Vietnam", "lychee closeup", "litchi Vietnam", "lychee white background"],
    avoid: /market|can|tree|dessert|peeled|bowl/i,
  },
  {
    id: "dragonfruit", wiki: "Pitaya", match: /dragon ?fruits?\b|dragonfruit|pitaya|pitahaya|thanh long/i,
    queries: ["dragon fruit Vietnam", "dragon fruit white background", "dragon fruit closeup"],
    avoid: /farm|plant|flower|cross section|slice|market/i,
  },
  {
    id: "avocado", wiki: "Avocado", match: /\bavocados?\b/i,
    queries: ["avocado Vietnam", "avocado closeup", "avocado white background", "whole avocado"],
    avoid: /market|stall|tree|toast|guacamole|halved|cut|bowl|plate|farm|seedling|sprout|sapling|\bplant\b|peppers?|salad|with|\bseed\b/i,
  },
  {
    id: "tomato", wiki: "Tomato", match: /\btomatoes?\b/i,
    queries: ["tomatoes white background", "red tomato closeup", "tomato white background", "tomato Vietnam"],
    avoid: /sauce|plant|market|slice|ketchup|bowl|greenhouse|nara|university|research|solar|young|unripe|\bgreen\b|holding|person|hand|\bdgj\b|\bpack\b|cherry|plastic|supermarket/i,
  },
  {
    id: "carrot", wiki: "Carrot", match: /\bcarrots?\b/i,
    queries: ["carrot Vietnam", "carrot white background", "carrots closeup"],
    avoid: /bundle|bunch|market|cake|juice|field|bag/i,
  },
  {
    id: "potato", wiki: "Potato", match: /\bpotatoes?\b/i,
    queries: ["potato Vietnam", "potatoes closeup", "potato white background"],
    avoid: /field|farm|chips|fries|harvest|market|bag|curry|cooked|fried|bowl|plate|dish|\bpow\b|mess|peel|camp|soldier/i,
  },
  {
    id: "corn", wiki: "Corn on the cob", match: /\bcorn\b|maize|\bcob\b/i,
    queries: ["corn Vietnam", "corn on the cob closeup", "sweet corn cob", "corn cob white background"],
    avoid: /cooked|grilled|roast|hawker|skewer|kernels|field|popcorn|dish|market|boiled|drying|tarp|harvest|commune|cobs\b|plantation|rice|wheat|palm|mui ne|employee|sell|seller|vendor|people|woman|\bman\b|chicken|peck|blt|lunch|butter|sandwich|damage|pigeon|duiven|schade|holding|\bwork\b/i,
  },
  {
    id: "pumpkin", wiki: "Pumpkin", match: /\bpumpkins?\b/i,
    queries: ["pumpkin Vietnam", "pumpkin closeup", "pumpkin white background"],
    avoid: /market|pile|patch|field|carved|halloween|lantern|festival|wagon|shaped|museum|\bwood\b|people|box/i,
  },
  {
    id: "pineapple", wiki: "Pineapple", match: /\bpineapples?\b|ananas/i,
    queries: ["pineapple Vietnam", "pineapple closeup", "pineapple white background"],
    avoid: /field|plantation|slices|juice|market|plant|salad|pastry|dessert/i,
  },
  {
    id: "motorbike", wiki: "Motorcycle", match: /motorbikes?\b|motorcycles?\b|scooter|moped|honda|yamaha|vespa/i,
    cats: ["Category:Motorcycles in Vietnam"],
    queries: ["motorbike Vietnam", "motorbike side view", "motorcycle side view"],
    avoid: /traffic|street|jam|parked|\brow\b|many|rush|crowd|helmet|festival|rally|race|motorbikes\b|motorcycles\b/i,
  },
  {
    id: "bicycle", wiki: "Bicycle", match: /\bbicycles?\b|\bbike\b/i,
    // Commons' "Bicycles in Vietnam" is mostly ridden/loaded bikes; a clean
    // single bicycle beats the Vietnam context here.
    queries: ["bicycle white background", "bicycle side view", "bicycle closeup"],
    block: ["File:Bicycle in Vietnam forest trail (Unsplash).jpg"],
    avoid: /traffic|rickshaw|rental|rack|parked|bicycles\b|bikes\b|woman|cyclist|riding|rider|people|war|supplies|transport|loaded|cargo|nun|\bwith\b|forest|trail/i,
  },
  {
    id: "car", wiki: "Car", match: /\bcars?\b|sedan|hatchback|\bsuv\b/i,
    queries: ["sedan side view", "car isolated white background", "car white background", "car Vietnam street"],
    block: ["File:Returning to Hue via car from Hoi An, Vietnam (6944599420).jpg"],
    avoid: /cable|coach|bus|cyclo|motorbike|truck|text|airplane|travel|writing|\bhow to\b/i,
  },
  { id: "bus", wiki: "Bus", match: /\bbuses?\b/i, queries: ["bus Vietnam city"] },
  {
    id: "truck", wiki: "Truck", match: /\btrucks?\b|lorry/i,
    cats: ["Category:Trucks in Vietnam"],
    queries: ["truck Vietnam", "truck side view", "lorry Vietnam"],
    avoid: /traffic|fire|military|dump|crash|trucks\b|container/i,
  },
  {
    id: "firetruck", wiki: "Fire engine", match: /fire ?trucks?\b|fire ?engines?\b|firetruck/i,
    cats: ["Category:Fire engines of Vietnam"],
    queries: ["fire truck Vietnam", "fire truck side view", "fire engine closeup"],
    avoid: /firemen|firefighter|burning|station|crash|fire engines\b|fire trucks\b/i,
  },
  { id: "ambulance", wiki: "Ambulance", match: /\bambulances?\b/i, queries: ["ambulance Vietnam"] },
  {
    id: "train", wiki: "Train", match: /\btrains?\b|locomotive|railcar/i,
    cats: ["Category:Trains of Vietnam"],
    queries: ["train Vietnam", "Reunification Express", "locomotive Vietnam", "train side view"],
    avoid: /station|platform|map|ticket|yard|crowd|trains\b/i, minW: 480,
  },
  {
    id: "airplane", wiki: "Airplane", match: /\bairplanes?\b|airliner|aircraft|\bplane\b|boeing|airbus|\ba3\d\d|\bb7\d\d|787|777/i,
    cats: ["Category:Aircraft of Vietnam"],
    queries: ["airplane white background", "airliner side view", "a320 side view", "Vietnam Airlines airplane"],
    block: ["File:Vietnam airlines a plane.jpg"],
    avoid: /crash|cockpit|terminal|airport crowd|airliners\b|war|museum|wreck|double|two|fleet|lineup|runway|command post|\be-\d\b|df-st|airborne/i,
  },
  {
    id: "helicopter", wiki: "Helicopter", match: /\bhelicopters?\b/i,
    // Commons' Vietnam helicopter photos are war-era shots with people, so no
    // Vietnam category here: a clear single civilian helicopter wins.
    queries: ["helicopter side view", "helicopter flying", "rescue helicopter", "helicopter white background"],
    block: ["File:Helicopter side view.jpg"],
    avoid: /military|war|crash|display|helicopters\b|pilots|association|dedication|ceremony|museum|huey|spraying|chinook|khe sanh|\bbase\b|us-|circa|196\d|195\d|landing strip|\bon\b|drone|quadcopter|\buav\b|camera|hangar|kobe|\bjcg\b|akitsushima|ah-\d|adas|attack|expo|marine|squadron|hmm-\d|ch-\d|dpla|air force|navy|uh-\d|gun|periscope|mitrus/i,
  },
  {
    id: "boat", wiki: "Boat", match: /\bboats?\b|rowboat|thuyền/i,
    cats: ["Category:Boats in Vietnam"],
    queries: ["wooden boat river Vietnam", "boat Mekong Vietnam", "rowboat closeup", "boat side view"],
    avoid: /harbor|fleet|market|festival|regatta|boats\b|view|roof|deck|aerial/i, minW: 480,
  },
  {
    id: "ship", wiki: "Ship", match: /\bships?\b|freighter/i,
    cats: ["Category:Ships of Vietnam"],
    queries: ["ship Vietnam", "cargo ship side view", "ship at sea"],
    avoid: /terminal|port|harbor|containers|cranes|dock|fleet|ships\b/i,
  },
  {
    id: "canoe", wiki: "Motorboat", match: /\bmotorboats?\b|\bcanoes?\b|\bspeedboat/i,
    queries: ["motorboat river Vietnam", "motorboat closeup", "speedboat side view", "motorboat side view"],
    avoid: /fleet|race|harbor|market|motorboats\b|kankaria|regatta|monochrome|black and white|\bam \d/i,
  },
  {
    id: "sampan", wiki: "Sampan", match: /\bsampans?\b|\bthúng\b/i,
    queries: ["sampan Hoi An", "basket boat Hoi An", "sampan Vietnam", "sampan closeup"],
    block: ["File:Hòa Bình, Đồng Hỷ District, Vietnam, Sampan auf dem Cầu-Fluss (Sông Cầu). Anlagen auf dem anderen Flussufer gehören zu einer Mine.jpg"],
    avoid: /fleet|many|yangtze|sampans\b|bell|uh-1|huey|attack|196\d|military|navy|usn|war|aerial|panorama|\bbay\b|harbor|pbr|crew|patrol/i,
  },
  { id: "ferry", wiki: "Ferry", match: /\bferries\b|\bferry\b/i, queries: ["ferry Vietnam"], avoid: /war|1966|military|navy/i },
  {
    id: "cyclo", wiki: "Cycle rickshaw", match: /\bcyclos?\b|rickshaw|xích lô/i,
    cats: ["Category:Cycle rickshaws in Vietnam"],
    queries: ["cyclo Vietnam", "cyclo Hanoi", "cyclo closeup"],
    avoid: /festival|decorated|rickshaws\b|race|cyclos\b/i,
  },
  {
    id: "cablecar", wiki: "Aerial tramway", match: /cable ?cars?\b|gondola|ropeway|tramway/i,
    cats: ["Category:Ba Na Hills", "Category:Hon Thom cable car"],
    queries: ["Ba Na Hills cable car", "Hon Thom cable car", "cable car Vietnam"],
    avoid: /funicular|\bski\b|map|cable cars\b/i,
  },
  { id: "coach", wiki: "Coach (bus)", match: /\bcoaches?\b|\bcoach\b/i, queries: ["coach bus Vietnam"] },
];

const stripTags = (html) => html.replace(/<[^>]*>/g, "").replace(/&amp;/g, "&").trim();
const UA = { headers: { "User-Agent": "playroom-asset-fetch/1.2 (private offline kids app; contact: parent)" } };

const MANIFEST_PATH = new URL("../public/assets/manifest.json", import.meta.url).pathname;
let manifest = {};
try {
  manifest = JSON.parse(readFileSync(MANIFEST_PATH, "utf8"));
} catch {
  manifest = {};
}

// Not a usable photo of one object: artwork, packaging, human portrait, dish...
const BAD_SUBJECT = /map|diagram|logo|coat of arms|flag|chart|drawing|sketch|painting|cartoon|statue|sculpture|bust|illustration|botanical|watercolor|watercolour|lithograph|engraving|etching|k[öo]hler|medizinal|specimen|taxidermy|montage|collage|varieties|stamp|coin|banknote|screenshot|render|figurine|ceramic|porcelain|portrait of|slaughter|butcher|grilled|dish|cuisine|feet|kfc|kentucky|fried|restaurant|sign|cafe|\bcakes?\b|rubber|inflatable|memorial|cemetery|curry|agent[- ]orange/i;

// More than one subject / a scene instead of the object: soft penalty, the
// per-item `avoid` list does the hard rejections.
const SCENE = /market|marketplace|bazaar|stall|shop|store|festival|traffic|jam|crowd|flock|herd|swarm|group|fleet|row of|parked|terminal|harbor|harbour|dock|yard|depot|farm|field|plantation|orchard|paddy|pile|heap|many|several|various|assorted|mixed|harvest|basket of|bowl of|plate of|bag of|place name|national park|\bpark\b|province|district|commune|\bisland\b|pagoda|temple|museum|\bbridge\b/i;

// Vietnam context wins over everything else (categories grant it outright).
const VIETNAM = /vietnam|việt nam|vietnamese|hà nội|hanoi|sài gòn|saigon|huế|đà lạt|da lat|hội an|hoi an|sa pa|sapa|mekong|hạ long|ha long|ninh bình|đà nẵng|da nang|phú quốc|bắc giang|hưng yên|thái bình|bình thuận|đồng tháp|đắk lắk|lâm đồng/i;

// A single focused subject beats a loose shot.
const FOCUSED = /closeup|close-up|close up|portrait|head|side view|profile|single|isolated|white background/i;

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function apiJson(url) {
  for (let attempt = 0; attempt < 4; attempt++) {
    try {
      const res = await fetch(url, UA);
      const text = await res.text();
      if (res.ok && text.startsWith("{")) {
        await sleep(1500);
        return JSON.parse(text);
      }
      console.log(`  api ${res.status}, retrying...`);
    } catch (error) {
      console.log(`  api error, retrying... (${error.message})`);
    }
    await sleep(5000 + attempt * 15000);
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

function scoreTitle(title, base) {
  let score = base;
  if (VIETNAM.test(title)) score += 40;
  if (FOCUSED.test(title)) score += 8;
  if (SCENE.test(title)) score -= 30;
  return score;
}

function acceptable(item, page) {
  const title = page.title ?? "";
  const info = page.imageinfo?.[0];
  if (seenTitles.has(title)) return null;
  seenTitles.add(title);
  if (!info || !info.thumburl) return null;
  if ((item.block ?? []).includes(title)) return null;
  if (!item.match.test(title)) return null;
  if (info.width < (item.minW ?? 600) || info.height < (item.minH ?? 450)) return null;
  if (BAD_SUBJECT.test(title) || (item.avoid && item.avoid.test(title))) return null;
  const license = stripTags(info.extmetadata?.LicenseShortName?.value ?? "");
  if (!/(CC|Public domain|PD)/i.test(license)) return null;
  return {
    title,
    thumb: info.thumburl,
    license,
    artist: stripTags(info.extmetadata?.Artist?.value ?? "unknown"),
  };
}

const seenTitles = new Set();

const categoryCache = new Map();
async function categoryMembers(category) {
  if (categoryCache.has(category)) return categoryCache.get(category);
  const url =
    "https://commons.wikimedia.org/w/api.php?action=query&format=json&formatversion=2" +
    "&generator=categorymembers&gcmtitle=" + encodeURIComponent(category) +
    "&gcmtype=file&gcmlimit=100&prop=imageinfo" +
    "&iiprop=url%7Csize%7Cextmetadata&iiurlwidth=800";
  const pages = (await apiJson(url)).query?.pages ?? [];
  categoryCache.set(category, pages);
  return pages;
}

const SEARCH_URL =
  "https://commons.wikimedia.org/w/api.php?action=query&format=json&formatversion=2" +
  "&generator=search&gsrnamespace=6&gsrlimit=20&prop=imageinfo" +
  "&iiprop=url%7Csize%7Cextmetadata&iiurlwidth=800&gsrsearch=";

async function searchPhoto(item) {
  let best = null;
  const consider = (page, base) => {
    const candidate = acceptable(item, page);
    if (!candidate) return;
    candidate.score = scoreTitle(candidate.title, base);
    if (!best || candidate.score > best.score) best = candidate;
  };

  // Vietnam categories first: a category hit is VN context by construction.
  for (const category of item.cats ?? []) {
    for (const page of await categoryMembers(category)) {
      consider(page, 40);
    }
    if (best && best.score >= 40) return best;
  }

  for (const query of item.queries) {
    const pages = (await apiJson(SEARCH_URL + encodeURIComponent(query + " filemime:image/jpeg"))).query?.pages ?? [];
    for (const page of pages) {
      consider(page, 0);
    }
    if (best && best.score >= 40) return best;
  }

  // Every candidate passed the hard filters, so even a scene-flawed one beats
  // the Wikipedia lead fallback (which can be a botanical plate).
  if (!best) {
    throw new Error("no acceptable photo for: " + item.id);
  }
  return best;
}

// Curated fallback: the Wikipedia article lead images, fetched in two batched
// calls for all items.
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
  const file = `${animal.id}.jpg`;
  const cached = manifest["_a:" + file];
  if (cached) {
    animalRows.push(cached);
    continue;
  }
  let row;
  try {
    const photo = await searchPhoto(animal);
    await download(photo.thumb, OUT + file);
    row = { file, image: photo.title, article: animal.article, license: photo.license, artist: photo.artist };
    console.log(`${file} <- search: ${photo.title} (score ${photo.score}, ${photo.license})`);
  } catch {
    const page = (
      await apiJson(
        "https://en.wikipedia.org/w/api.php?action=query&format=json&formatversion=2&prop=pageimages&piprop=thumbnail%7Cname&pithumbsize=800&redirects=1&titles=" + encodeURIComponent(animal.article),
      )
    ).query.pages[0];
    if (!page?.thumbnail?.source || !page.pageimage) {
      throw new Error("No lead image for " + animal.article);
    }
    await download(page.thumbnail.source, OUT + file);
    const info = (
      await apiJson(
        "https://commons.wikimedia.org/w/api.php?action=query&format=json&formatversion=2&prop=imageinfo&iiprop=extmetadata&titles=" + encodeURIComponent("File:" + page.pageimage),
      )
    ).query.pages[0].imageinfo?.[0];
    const meta = info?.extmetadata ?? {};
    row = {
      file,
      image: page.pageimage,
      article: animal.article,
      license: stripTags(meta.LicenseShortName?.value ?? "unknown"),
      artist: stripTags(meta.Artist?.value ?? "unknown"),
    };
    console.log(`${file} <- lead: ${row.image} (${row.license})`);
  }
  manifest["_a:" + file] = row;
  writeFileSync(MANIFEST_PATH, JSON.stringify(manifest, null, 2) + String.fromCharCode(10));
  animalRows.push(row);
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
    console.log(file + " <- search: " + photo.title + " (score " + photo.score + ", " + photo.license + ")");
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
    console.log(file + " <- lead: " + row.image + " (" + row.license + ")");
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
  "Photos prefer a single focused subject in a Vietnam context (Commons",
  "categories per item, then Vietnam-first search); the Wikipedia lead image is",
  "the fallback when nothing acceptable is found.",
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
  "## Item photos, square crops (public/assets/*.jpg)",
  "",
  "Commons: Vietnam-context category or search first, single-subject candidates",
  "preferred; centre-cropped to 1:1.",
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
