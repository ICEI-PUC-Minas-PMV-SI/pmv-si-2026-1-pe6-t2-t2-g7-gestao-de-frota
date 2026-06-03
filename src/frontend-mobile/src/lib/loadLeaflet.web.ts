const LEAFLET_CSS_ID = "leaflet-css";
const LEAFLET_CSS_URL = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";

let leafletPromise: Promise<typeof import("leaflet").default> | null = null;

/** Carrega Leaflet apenas no browser (evita `window is not defined` no SSR). */
export function loadLeaflet(): Promise<typeof import("leaflet").default> {
  if (typeof window === "undefined") {
    return Promise.reject(new Error("Leaflet disponível apenas no cliente."));
  }

  if (!leafletPromise) {
    leafletPromise = (async () => {
      if (!document.getElementById(LEAFLET_CSS_ID)) {
        const link = document.createElement("link");
        link.id = LEAFLET_CSS_ID;
        link.rel = "stylesheet";
        link.href = LEAFLET_CSS_URL;
        document.head.appendChild(link);
      }
      const mod = await import("leaflet");
      return mod.default;
    })();
  }

  return leafletPromise;
}
