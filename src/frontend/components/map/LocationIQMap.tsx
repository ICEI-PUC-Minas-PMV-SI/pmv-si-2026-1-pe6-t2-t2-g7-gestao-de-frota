"use client";

import { useEffect, useRef } from "react";
import type { Map as LeafletMap } from "leaflet";

type LocationIQMapProps = {
  className?: string;
};

/** Vista inicial: Brasil. Com geolocalização permitida, centraliza na posição do usuário. */
const DEFAULT_CENTER: [number, number] = [-14.235, -51.9253];
const DEFAULT_ZOOM = 5;

export function LocationIQMap({ className }: LocationIQMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<LeafletMap | null>(null);

  const token = process.env.NEXT_PUBLIC_LOCATIONIQ_ACCESS_TOKEN;

  useEffect(() => {
    if (!containerRef.current || !token) return;

    let cancelled = false;
    const el = containerRef.current;

    void (async () => {
      const L = (await import("leaflet")).default;
      await import("leaflet/dist/leaflet.css");

      if (cancelled || !el.isConnected) return;

      const map = L.map(el, { zoomControl: true }).setView(
        DEFAULT_CENTER,
        DEFAULT_ZOOM,
      );
      mapRef.current = map;

      L.tileLayer(
        `https://{s}-tiles.locationiq.com/v3/streets/r/{z}/{x}/{y}.png?key=${encodeURIComponent(token)}`,
        {
          attribution:
            '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://locationiq.com">LocationIQ</a>',
          maxZoom: 19,
          subdomains: ["a", "b", "c"],
        },
      ).addTo(map);

      if (typeof navigator !== "undefined" && "geolocation" in navigator) {
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            if (cancelled) return;
            const { latitude, longitude } = pos.coords;
            map.setView([latitude, longitude], 14);
          },
          () => {
            /* mantém vista padrão */
          },
          { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 },
        );
      }
    })();

    return () => {
      cancelled = true;
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [token]);

  if (!token) {
    return (
      <div
        className="flex min-h-[400px] flex-col items-center justify-center gap-2 rounded-xl border border-primary/25 bg-card px-6 text-center"
        role="status"
      >
        <p className="text-sm font-medium text-foreground">
          Token do LocationIQ não configurado
        </p>
        <p className="max-w-md text-xs text-muted-foreground">
          Crie uma conta em{" "}
          <a
            href="https://locationiq.com/"
            className="text-primary underline underline-offset-2 hover:opacity-80"
            target="_blank"
            rel="noopener noreferrer"
          >
            locationiq.com
          </a>{" "}
          e defina{" "}
          <code className="rounded bg-muted px-1.5 py-0.5 text-foreground">
            NEXT_PUBLIC_LOCATIONIQ_ACCESS_TOKEN
          </code>{" "}
          em <code className="rounded bg-muted px-1.5 py-0.5 text-foreground">.env.local</code>
        </p>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className={className ?? "h-full min-h-[400px] w-full"}
    />
  );
}
