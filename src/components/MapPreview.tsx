import { useEffect, useRef, useState } from "react";
import L from "leaflet";
import Icon from "@/components/ui/icon";
import func2url from "../../backend/func2url.json";

interface Report {
  id: number;
  latitude: number;
  longitude: number;
  city: string;
  location_type: string;
  place_type: string;
  features: string[];
  comment: string;
  photo_url: string;
  status: string;
  submitter_name: string;
  created_at: string;
}

const accessibilityColorMap: Record<string, string> = {
  easy: "#22c55e",
  neutral: "#3b82f6",
  hard: "#eab308",
  blocked: "#ef4444",
};

const accessibilityLabelMap: Record<string, string> = {
  easy: "🟢 Легко",
  neutral: "🔵 Нейтрально",
  hard: "🟡 Сложно",
  blocked: "🔴 Непроходимо",
};

const placeTypeLabelMap: Record<string, string> = {
  regular: "🏘️ Обычное место",
  historic: "🏛️ Историческое",
  park: "🌳 Парк / зона отдыха",
  medical: "🏥 Медицинское",
  transport: "🚌 Транспортный узел",
};

const legend = [
  { color: "#22c55e", label: "Легко" },
  { color: "#3b82f6", label: "Нейтрально" },
  { color: "#eab308", label: "Сложно" },
  { color: "#ef4444", label: "Непроходимо" },
];

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

export default function MapPreview() {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const tileRef = useRef<L.TileLayer | null>(null);
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [mode, setMode] = useState<"satellite" | "map">("satellite");

  useEffect(() => {
    fetch(func2url["get-reports"])
      .then((r) => r.json())
      .then((data) => {
        const parsed = typeof data === "string" ? JSON.parse(data) : data;
        setReports(parsed.reports || []);
      })
      .catch(() => setReports([]))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (loading || !containerRef.current || mapRef.current) return;

    const map = L.map(containerRef.current, {
      center: [44.895, 37.316],
      zoom: 14,
      scrollWheelZoom: true,
    });

    const tile = L.tileLayer(TILES.satellite.url, {
      attribution: TILES.satellite.attribution,
      maxZoom: 19,
    }).addTo(map);

    tileRef.current = tile;

    reports.forEach((r) => {
      const color = accessibilityColorMap[r.location_type] || "#999";
      const accessLabel = accessibilityLabelMap[r.location_type] || r.location_type;
      const placeLabel = placeTypeLabelMap[r.place_type] || "";

      const circle = L.circleMarker([r.latitude, r.longitude], {
        radius: 10,
        color: "#fff",
        weight: 2,
        fillColor: color,
        fillOpacity: 0.9,
      }).addTo(map);

      const featuresHtml = r.features?.length
        ? `<div style="margin-top:6px;display:flex;flex-wrap:wrap;gap:4px">${r.features.map(
            (f) => `<span style="font-size:11px;background:#f3f4f6;padding:2px 6px;border-radius:4px">${f}</span>`
          ).join("")}</div>`
        : "";

      const photoHtml = r.photo_url
        ? `<a href="${r.photo_url}" target="_blank" rel="noreferrer"><img src="${r.photo_url}" style="width:100%;max-height:120px;object-fit:cover;margin-bottom:6px;border-radius:4px" /></a>`
        : "";

      circle.bindPopup(`
        <div style="min-width:200px;font-family:sans-serif">
          ${photoHtml}
          <p style="font-weight:600;margin:0 0 2px">${accessLabel}</p>
          ${placeLabel ? `<p style="color:#6b7280;font-size:12px;margin:0 0 4px">${placeLabel}</p>` : ""}
          ${r.submitter_name ? `<p style="color:#6b7280;font-size:12px;margin:0 0 4px">от ${r.submitter_name}</p>` : ""}
          ${r.comment ? `<p style="font-size:12px;margin:0 0 6px;color:#374151">${r.comment}</p>` : ""}
          ${featuresHtml}
          <p style="color:#9ca3af;font-size:11px;margin:6px 0 0">${new Date(r.created_at).toLocaleDateString("ru-RU")}</p>
        </div>
      `);
    });

    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
      tileRef.current = null;
    };
  }, [loading, reports]);

  useEffect(() => {
    if (!tileRef.current) return;
    tileRef.current.setUrl(TILES[mode].url);
  }, [mode]);

  return (
    <div id="map" className="relative w-full h-screen overflow-hidden">
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-neutral-100 z-10">
          <Icon name="Loader2" size={32} className="animate-spin text-neutral-400" />
        </div>
      )}
      <div ref={containerRef} style={{ height: "100%", width: "100%" }} />

      {/* Заголовок поверх карты */}
      <div className="absolute bottom-10 left-6 z-[1000] pointer-events-none">
        <p className="text-white/70 text-xs uppercase tracking-widest mb-1">Публичная карта</p>
        <h2 className="text-2xl lg:text-4xl font-bold text-white leading-tight drop-shadow-lg">
          Подтверждённые<br />места на карте
        </h2>
        <p className="text-white/70 text-sm mt-2 drop-shadow">
          {loading
            ? "Загружаем точки..."
            : reports.length > 0
            ? `${reports.length} подтверждённых точек · Анапа`
            : "Подтверждённых точек пока нет"}
        </p>
      </div>

      {/* Легенда */}
      <div className="absolute bottom-10 right-6 z-[1000] flex flex-col gap-2 pointer-events-none">
        {legend.map((l) => (
          <div key={l.label} className="flex items-center gap-2">
            <div
              className="w-3 h-3 rounded-full border-2 border-white shadow"
              style={{ backgroundColor: l.color }}
            />
            <span className="text-sm text-white drop-shadow">{l.label}</span>
          </div>
        ))}
      </div>

      {/* Переключатель слоя */}
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-[1000] flex rounded overflow-hidden shadow">
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