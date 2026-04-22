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
  features: string[];
  comment: string;
  photo_url: string;
  status: string;
  submitter_name: string;
  created_at: string;
}

const colorMap: Record<string, string> = {
  easy: "#22c55e",
  hard: "#eab308",
  blocked: "#ef4444",
  historic: "#3b82f6",
  park: "#16a34a",
};

const labelMap: Record<string, string> = {
  easy: "🟢 Легко",
  hard: "🟡 Сложно",
  blocked: "🔴 Непроходимо",
  historic: "🏛️ Историческое",
  park: "🌳 Парк",
};

const legend = [
  { color: "#22c55e", label: "Легко" },
  { color: "#eab308", label: "Сложно" },
  { color: "#ef4444", label: "Непроходимо" },
  { color: "#3b82f6", label: "Историческое" },
  { color: "#16a34a", label: "Парк" },
];

export default function MapPreview() {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);

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

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    }).addTo(map);

    reports.forEach((r) => {
      const color = colorMap[r.location_type] || "#999";
      const label = labelMap[r.location_type] || r.location_type;

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

      circle.bindPopup(`
        <div style="min-width:180px;font-family:sans-serif">
          <p style="font-weight:600;margin:0 0 4px">${label}</p>
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
    };
  }, [loading, reports]);

  return (
    <div id="map" className="min-h-screen bg-white px-6 py-24">
      <div className="max-w-5xl mx-auto">
        <h3 className="uppercase text-sm tracking-widest text-neutral-500 mb-4">Публичная карта</h3>
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-10">
          <h2 className="text-3xl lg:text-5xl font-bold text-neutral-900 leading-tight">
            Подтверждённые<br />места на карте
          </h2>
          <p className="text-neutral-500 text-sm max-w-xs lg:text-right">
            {loading
              ? "Загружаем точки..."
              : reports.length > 0
              ? `${reports.length} подтверждённых точек · Анапа`
              : "Подтверждённых точек пока нет"}
          </p>
        </div>

        <div className="relative w-full h-[520px] border border-neutral-200 overflow-hidden">
          {loading && (
            <div className="absolute inset-0 flex items-center justify-center bg-neutral-100 z-10">
              <Icon name="Loader2" size={32} className="animate-spin text-neutral-400" />
            </div>
          )}
          <div ref={containerRef} style={{ height: "100%", width: "100%" }} />
        </div>

        <div className="flex flex-wrap gap-6 mt-6">
          {legend.map((l) => (
            <div key={l.label} className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded-full border-2 border-white shadow"
                style={{ backgroundColor: l.color }}
              />
              <span className="text-sm text-neutral-600">{l.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
