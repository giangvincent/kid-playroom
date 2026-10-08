const CACHE_NAME = "playroom-v7";

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
  "/play/fruit",
  "/play/vehicle",
  "/play/size",
  "/play/drawing",
  "/play/memory",
];

// Real game imagery (photos + Twemoji SVGs, see docs/ASSETS.md).
const ASSET_FILES = [
  "/assets/airplane.jpg", "/assets/ambulance.jpg", "/assets/avocado.jpg", "/assets/banana.jpg",
  "/assets/bicycle.jpg", "/assets/bird.jpg", "/assets/boat.jpg", "/assets/bus.jpg",
  "/assets/cablecar.jpg", "/assets/canoe.jpg", "/assets/car.jpg", "/assets/carrot.jpg",
  "/assets/cat.jpg", "/assets/chicken.jpg", "/assets/circle.svg", "/assets/coach.jpg",
  "/assets/corn.jpg", "/assets/cow.jpg", "/assets/cyclo.jpg", "/assets/diamond.svg",
  "/assets/dog.jpg", "/assets/dolphin.jpg", "/assets/dragonfruit.jpg", "/assets/duck.jpg",
  "/assets/durian.jpg", "/assets/ferry.jpg", "/assets/firetruck.jpg", "/assets/fish.jpg",
  "/assets/frog.jpg", "/assets/guava.jpg", "/assets/heart.svg", "/assets/helicopter.jpg",
  "/assets/icon-color.svg", "/assets/icon-drawing.svg", "/assets/icon-fruit.svg", "/assets/icon-matching.svg",
  "/assets/icon-memory.svg", "/assets/icon-size.svg", "/assets/icon-vehicle.svg", "/assets/longan.jpg",
  "/assets/lychee.jpg", "/assets/mango.jpg", "/assets/mangosteen.jpg", "/assets/motorbike.jpg",
  "/assets/orange.jpg", "/assets/papaya.jpg", "/assets/pig.jpg", "/assets/pineapple.jpg",
  "/assets/plus.svg", "/assets/potato.jpg", "/assets/pumpkin.jpg", "/assets/rabbit.jpg",
  "/assets/ring.svg", "/assets/sampan.jpg", "/assets/shark.jpg", "/assets/ship.jpg",
  "/assets/square.svg", "/assets/star.svg", "/assets/tomato.jpg", "/assets/train.jpg",
  "/assets/triangle.svg", "/assets/truck.jpg", "/assets/watermelon.jpg",
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
  "/speech/bap-ngo-o-dau.mp3", "/speech/bap-ngo.mp3", "/speech/cap-treo-o-dau.mp3", "/speech/cap-treo.mp3",
  "/speech/con-bo-o-dau.mp3", "/speech/con-bo.mp3", "/speech/con-ca-heo-o-dau.mp3", "/speech/con-ca-heo.mp3",
  "/speech/con-ca-map-o-dau.mp3", "/speech/con-ca-map.mp3", "/speech/con-ca-o-dau.mp3", "/speech/con-ca.mp3",
  "/speech/con-chim-o-dau.mp3", "/speech/con-chim.mp3", "/speech/con-cho-o-dau.mp3", "/speech/con-cho.mp3",
  "/speech/con-ech-o-dau.mp3", "/speech/con-ech.mp3", "/speech/con-ga-o-dau.mp3", "/speech/con-ga.mp3",
  "/speech/con-gioi-qua.mp3", "/speech/con-heo-o-dau.mp3", "/speech/con-heo.mp3", "/speech/con-meo-o-dau.mp3",
  "/speech/con-meo.mp3", "/speech/con-tho-o-dau.mp3", "/speech/con-tho.mp3", "/speech/con-vit-o-dau.mp3",
  "/speech/con-vit.mp3", "/speech/cu-ca-rot-o-dau.mp3", "/speech/cu-ca-rot.mp3", "/speech/cu-khoai-tay-o-dau.mp3",
  "/speech/cu-khoai-tay.mp3", "/speech/dung-roi.mp3", "/speech/hai-the-giong-nhau-o-dau.mp3", "/speech/hinh-chu-thap.mp3",
  "/speech/hinh-lon-nhat-o-dau.mp3", "/speech/hinh-ngoi-sao.mp3", "/speech/hinh-nho-nhat-o-dau.mp3", "/speech/hinh-tam-giac.mp3",
  "/speech/hinh-thoi.mp3", "/speech/hinh-trai-tim.mp3", "/speech/hinh-tron-rong.mp3", "/speech/hinh-tron.mp3",
  "/speech/hinh-vuong.mp3", "/speech/mau-cam-o-dau.mp3", "/speech/mau-cam.mp3", "/speech/mau-do-o-dau.mp3",
  "/speech/mau-do.mp3", "/speech/mau-hong-o-dau.mp3", "/speech/mau-hong.mp3", "/speech/mau-nau-o-dau.mp3",
  "/speech/mau-nau.mp3", "/speech/mau-tim-o-dau.mp3", "/speech/mau-tim.mp3", "/speech/mau-vang-o-dau.mp3",
  "/speech/mau-vang.mp3", "/speech/mau-xanh-duong-o-dau.mp3", "/speech/mau-xanh-duong.mp3", "/speech/mau-xanh-la-o-dau.mp3",
  "/speech/mau-xanh-la.mp3", "/speech/may-bay-o-dau.mp3", "/speech/may-bay.mp3", "/speech/nhung-hinh-giong-nhau-o-dau.mp3",
  "/speech/pha-o-dau.mp3", "/speech/pha.mp3", "/speech/qua-bi-ngo-o-dau.mp3", "/speech/qua-bi-ngo.mp3",
  "/speech/qua-bo-o-dau.mp3", "/speech/qua-bo.mp3", "/speech/qua-ca-chua-o-dau.mp3", "/speech/qua-ca-chua.mp3",
  "/speech/qua-cam-o-dau.mp3", "/speech/qua-cam.mp3", "/speech/qua-chuoi-o-dau.mp3", "/speech/qua-chuoi.mp3",
  "/speech/qua-du-du-o-dau.mp3", "/speech/qua-du-du.mp3", "/speech/qua-dua-hau-o-dau.mp3", "/speech/qua-dua-hau.mp3",
  "/speech/qua-dua-o-dau.mp3", "/speech/qua-dua.mp3", "/speech/qua-mang-cau-o-dau.mp3", "/speech/qua-mang-cau.mp3",
  "/speech/qua-nhan-o-dau.mp3", "/speech/qua-nhan.mp3", "/speech/qua-oi-o-dau.mp3", "/speech/qua-oi.mp3",
  "/speech/qua-sau-rieng-o-dau.mp3", "/speech/qua-sau-rieng.mp3", "/speech/qua-thanh-long-o-dau.mp3", "/speech/qua-thanh-long.mp3",
  "/speech/qua-vai-o-dau.mp3", "/speech/qua-vai.mp3", "/speech/qua-xoai-o-dau.mp3", "/speech/qua-xoai.mp3",
  "/speech/tau-hoa-o-dau.mp3", "/speech/tau-hoa.mp3", "/speech/tau-thuy-o-dau.mp3", "/speech/tau-thuy.mp3",
  "/speech/thuyen-may-o-dau.mp3", "/speech/thuyen-may.mp3", "/speech/thuyen-o-dau.mp3", "/speech/thuyen.mp3",
  "/speech/truc-thang-o-dau.mp3", "/speech/truc-thang.mp3", "/speech/tuyet-voi.mp3", "/speech/xe-buyt-o-dau.mp3",
  "/speech/xe-buyt.mp3", "/speech/xe-cuu-hoa-o-dau.mp3", "/speech/xe-cuu-hoa.mp3", "/speech/xe-cuu-thuong-o-dau.mp3",
  "/speech/xe-cuu-thuong.mp3", "/speech/xe-dap-o-dau.mp3", "/speech/xe-dap.mp3", "/speech/xe-khach-o-dau.mp3",
  "/speech/xe-khach.mp3", "/speech/xe-may-o-dau.mp3", "/speech/xe-may.mp3", "/speech/xe-o-to-o-dau.mp3",
  "/speech/xe-o-to.mp3", "/speech/xe-tai-o-dau.mp3", "/speech/xe-tai.mp3", "/speech/xich-lo-o-dau.mp3",
  "/speech/xich-lo.mp3", "/speech/xuong-o-dau.mp3", "/speech/xuong.mp3",
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
