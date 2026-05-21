importScripts("https://cdn.jsdelivr.net/npm/@mercuryworkshop/scramjet@2.0.0-alpha/dist/scramjet.all.js");

const { ScramjetServiceWorker } = $scramjetLoadWorker();
const scramjet = new ScramjetServiceWorker();

self.addEventListener("fetch", (event) => {
    event.respondWith(async () => {
        await scramjet.loadConfig();
        if (scramjet.route(event)) {
            return scramjet.fetch(event);
        }
        return fetch(event.request);
    });
});
