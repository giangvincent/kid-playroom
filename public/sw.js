const CACHE_NAME = "playroom-v2";

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

const EXTRA_ASSETS = [
  "/manifest.webmanifest",
  "/icons/icon-192.png",
  "/icons/icon-512.png",
  "/icons/apple-icon-180.png",
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
        EXTRA_ASSETS.map((asset) => cache.add(asset).catch(() => {})),
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
