const CACHE_NAME = "playroom-v4";

// Kept in sync with lib/games/registry.ts. Precaching every route (and the
// hashed chunks each page references) lets the whole playroom run offline
// after a single online visit. Ceiling: a new/renamed game must be added here;
// until then the runtime cache still covers routes the user has visited.
const ROUTES = [
  "/",
  "/play",
  "/play/matching",
  "/play/color",
  "/play/animal",
  "/play/size",
  "/play/drawing",
  "/play/memory",
];

// Real game imagery (photos + Twemoji SVGs, see docs/ASSETS.md).
const ASSET_FILES = [
  "/assets/bird.jpg", "/assets/cat.jpg", "/assets/circle.svg", "/assets/diamond.svg",
  "/assets/dog.jpg", "/assets/fish.jpg", "/assets/frog.jpg", "/assets/heart.svg",
  "/assets/icon-color.svg", "/assets/icon-drawing.svg", "/assets/icon-matching.svg",
  "/assets/icon-memory.svg", "/assets/icon-size.svg", "/assets/plus.svg",
  "/assets/rabbit.jpg", "/assets/ring.svg", "/assets/square.svg", "/assets/star.svg",
  "/assets/triangle.svg",
];

const EXTRA_ASSETS = [
  "/manifest.webmanifest",
  "/icons/icon-192.png",
  "/icons/icon-512.png",
  "/icons/apple-icon-180.png",
];

// Pre-recorded Vietnamese voice clips (see scripts/gen-speech.mjs). Kept in
// sync with the files in public/speech — the test in lib/speech-files.test.ts
// fails if a spoken phrase has no clip.
const SPEECH_CLIPS = [
  "/speech/cham-vao-hinh-lon-nhat.mp3", "/speech/cham-vao-hinh-nho-nhat.mp3", "/speech/con-ca.mp3", "/speech/con-chim.mp3",
  "/speech/con-cho.mp3", "/speech/con-ech.mp3", "/speech/con-meo.mp3", "/speech/con-tho.mp3",
  "/speech/ghep-cac-hinh-giong-nhau.mp3", "/speech/hinh-chu-thap.mp3", "/speech/hinh-ngoi-sao.mp3", "/speech/hinh-tam-giac.mp3",
  "/speech/hinh-thoi.mp3", "/speech/hinh-trai-tim.mp3", "/speech/hinh-tron-rong.mp3", "/speech/hinh-tron.mp3",
  "/speech/hinh-vuong.mp3", "/speech/mau-cam.mp3", "/speech/mau-do.mp3", "/speech/mau-hong.mp3",
  "/speech/mau-nau.mp3", "/speech/mau-tim.mp3", "/speech/mau-vang.mp3", "/speech/mau-xanh-duong.mp3",
  "/speech/mau-xanh-la.mp3", "/speech/tim-hai-the-giong-nhau.mp3", "/speech/tim-mau-cam.mp3", "/speech/tim-mau-do.mp3",
  "/speech/tim-mau-hong.mp3", "/speech/tim-mau-nau.mp3", "/speech/tim-mau-tim.mp3", "/speech/tim-mau-vang.mp3",
  "/speech/tim-mau-xanh-duong.mp3", "/speech/tim-mau-xanh-la.mp3", "/speech/tim-tat-ca-con-ca.mp3", "/speech/tim-tat-ca-con-chim.mp3",
  "/speech/tim-tat-ca-con-cho.mp3", "/speech/tim-tat-ca-con-ech.mp3", "/speech/tim-tat-ca-con-meo.mp3", "/speech/tim-tat-ca-con-tho.mp3",
];

async function precacheRoute(cache, route) {
  const assetPattern = /(?:src|href)="(\/_next\/static\/[^"]+)"/g;
  try {
    const response = await fetch(route, { credentials: "same-origin" });
    if (!response.ok) {
      return;
    }
    await cache.put(route, response.clone());

    const html = await response.text();
    const assets = new Set();
    let match;
    while ((match = assetPattern.exec(html)) !== null) {
      assets.add(match[1]);
    }
    await Promise.all(
      [...assets].map((asset) => cache.add(asset).catch(() => {})),
    );
  } catch {
    // Offline during install — runtime caching fills the gap later.
  }
}

self.addEventListener("install", (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(CACHE_NAME);
      await Promise.all(ROUTES.map((route) => precacheRoute(cache, route)));
  await Promise.all(
    EXTRA_ASSETS.concat(ASSET_FILES, SPEECH_CLIPS).map((asset) =>
      cache.add(asset).catch(() => {}),
    ),
  );
      await self.skipWaiting();
    })(),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((key) => caches.delete(key)),
      );
      await self.clients.claim();
    })(),
  );
});

async function cacheResponse(request, response) {
  if (response && response.ok) {
    try {
      const cache = await caches.open(CACHE_NAME);
      await cache.put(request, response.clone());
    } catch {
      // Quota or opaque response — serving the network response still works.
    }
  }
  return response;
}

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") {
    return;
  }

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) {
    return;
  }

  const isDocument =
    request.mode === "navigate" || url.searchParams.has("_rsc");

  if (isDocument) {
    event.respondWith(
      (async () => {
        try {
          const response = await fetch(request);
          return await cacheResponse(request, response);
        } catch {
          const cached = await caches.match(request);
          return cached || (await caches.match("/play")) || Response.error();
        }
      })(),
    );
    return;
  }

  event.respondWith(
    (async () => {
      const cached = await caches.match(request);
      const network = fetch(request)
        .then((response) => cacheResponse(request, response))
        .catch(() => cached);
      return cached || network;
    })(),
  );
});
