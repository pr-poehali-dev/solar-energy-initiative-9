import { useEffect, useRef, useState } from "react";
import L from "leaflet";

interface Props {
  coords: { lat: number; lng: number } | null;
  onChange: (coords: { lat: number; lng: number }) => void;
}

const TILES = {
  satellite: {
    url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
    attribution: "Tiles &copy; Esri &mdash; Source: Esri, Maxar, Earthstar Geographics",
  },
  map: {
    url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
  },
};

export default function LocationPicker({ coords, onChange }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);
  const tileRef = useRef<L.TileLayer | null>(null);
  const [mode, setMode] = useState<"satellite" | "map">("satellite");

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = L.map(containerRef.current, {
      center: coords ? [coords.lat, coords.lng] : [44.895, 37.316],
      zoom: coords ? 17 : 14,
      scrollWheelZoom: false,
      zoomControl: true,
    });

    const tile = L.tileLayer(TILES.satellite.url, {
      attribution: TILES.satellite.attribution,
      maxZoom: 19,
    }).addTo(map);

    tileRef.current = tile;

    map.on("click", (e: L.LeafletMouseEvent) => {
      onChange({ lat: e.latlng.lat, lng: e.latlng.lng });
    });

    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
      markerRef.current = null;
      tileRef.current = null;
    };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    const tile = tileRef.current;
    if (!map || !tile) return;

    tile.setUrl(TILES[mode].url);
  }, [mode]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !coords) return;

    if (markerRef.current) {
      markerRef.current.setLatLng([coords.lat, coords.lng]);
    } else {
      markerRef.current = L.marker([coords.lat, coords.lng]).addTo(map);
    }

    map.flyTo([coords.lat, coords.lng], 17, { duration: 1 });
  }, [coords]);

  return (
    <div className="relative">
      <div ref={containerRef} style={{ height: "280px", width: "100%" }} />
      <div className="absolute bottom-2 left-2 z-[1000] flex rounded overflow-hidden shadow">
        <button
          type="button"
          onClick={() => setMode("satellite")}
          className={`px-3 py-1.5 text-xs font-medium transition-colors ${
            mode === "satellite"
              ? "bg-black text-white"
              : "bg-white text-neutral-700 hover:bg-neutral-100"
          }`}
        >
          Спутник
        </button>
        <button
          type="button"
          onClick={() => setMode("map")}
          className={`px-3 py-1.5 text-xs font-medium transition-colors ${
            mode === "map"
              ? "bg-black text-white"
              : "bg-white text-neutral-700 hover:bg-neutral-100"
          }`}
        >
          Схема
        </button>
      </div>
    </div>
  );
}
