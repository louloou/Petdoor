const CACHE = "petdoor-v1";
const ARCHIVOS = ["./", "index.html", "estadisticas.html", "style.css", "img/logo.png"];

self.addEventListener("install", (e) => {
    e.waitUntil(caches.open(CACHE).then((c) => c.addAll(ARCHIVOS)));
    self.skipWaiting();
});

self.addEventListener("activate", (e) => {
    e.waitUntil(
        caches.keys().then((claves) =>
            Promise.all(claves.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
        )
    );
    self.clients.claim();
});

// Primero internet (así ves los cambios de GitHub), y si no hay conexión, la copia guardada
self.addEventListener("fetch", (e) => {
    const req = e.request;
    if (req.method !== "GET" || new URL(req.url).origin !== self.location.origin) return;

    e.respondWith(
        fetch(req)
            .then((res) => {
                const copia = res.clone();
                caches.open(CACHE).then((c) => c.put(req, copia));
                return res;
            })
            .catch(() => caches.match(req))
    );
});