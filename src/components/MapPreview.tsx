import { useEffect, useState } from "react";
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

// Анапа: lat ~44.895, lng ~37.316
const MAP_CENTER = { lat: 44.895, lng: 37.316 };
const LAT_RANGE = 0.05;
const LNG_RANGE = 0.08;

function latToPercent(lat: number) {
  return ((MAP_CENTER.lat + LAT_RANGE - lat) / (LAT_RANGE * 2)) * 100;
}
function lngToPercent(lng: number) {
  return ((lng - (MAP_CENTER.lng - LNG_RANGE)) / (LNG_RANGE * 2)) * 100;
}

export default function MapPreview() {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeId, setActiveId] = useState<number | null>(null);

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

  return (
    <div id="map" className="min-h-screen bg-white px-6 py-24">
      <div className="max-w-5xl mx-auto">
        <h3 className="uppercase text-sm tracking-widest text-neutral-500 mb-4">Публичная карта</h3>
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-10">
          <h2 className="text-3xl lg:text-5xl font-bold text-neutral-900 leading-tight">
            Подтверждённые<br />места на карте
          </h2>
          <p className="text-neutral-500 text-sm max-w-xs lg:text-right">
            {loading ? "Загружаем точки..." : `${reports.length} подтверждённых точек · Анапа`}
          </p>
        </div>

        {/* Map */}
        <div className="relative w-full h-[480px] bg-neutral-100 overflow-hidden border border-neutral-200">
          <div
            className="absolute inset-0 opacity-30"
            style={{
              backgroundImage:
                "repeating-linear-gradient(0deg, #ccc 0, #ccc 1px, transparent 1px, transparent 60px), repeating-linear-gradient(90deg, #ccc 0, #ccc 1px, transparent 1px, transparent 60px)",
            }}
          />
          <div className="absolute top-[40%] left-0 right-0 h-[2px] bg-neutral-300 opacity-60" />
          <div className="absolute top-[65%] left-0 right-0 h-[2px] bg-neutral-300 opacity-60" />
          <div className="absolute top-0 bottom-0 left-[40%] w-[2px] bg-neutral-300 opacity-60" />
          <div className="absolute top-0 bottom-0 left-[70%] w-[2px] bg-neutral-300 opacity-60" />
          <div className="absolute bottom-0 left-0 right-0 h-[15%] bg-blue-100 opacity-60 flex items-center justify-center">
            <span className="text-blue-400 text-xs uppercase tracking-widest">Чёрное море</span>
          </div>

          {loading && (
            <div className="absolute inset-0 flex items-center justify-center z-10">
              <Icon name="Loader2" size={32} className="animate-spin text-neutral-400" />
            </div>
          )}

          {!loading && reports.length === 0 && (
            <div className="absolute inset-0 flex flex-col items-center justify-center z-10 gap-2">
              <Icon name="MapPin" size={28} className="text-neutral-400" />
              <p className="text-sm text-neutral-500">Подтверждённых точек пока нет</p>
              <p className="text-xs text-neutral-400">Заявки появятся после проверки администратором</p>
            </div>
          )}

          {reports.map((r) => {
            const top = latToPercent(r.latitude);
            const left = lngToPercent(r.longitude);
            if (top < 0 || top > 100 || left < 0 || left > 100) return null;
            return (
              <div
                key={r.id}
                className="absolute -translate-x-1/2 -translate-y-1/2 group cursor-pointer z-10"
                style={{ top: `${top}%`, left: `${left}%` }}
                onClick={() => setActiveId(activeId === r.id ? null : r.id)}
              >
                <div
                  className="w-4 h-4 rounded-full border-2 border-white shadow-md transition-transform group-hover:scale-125"
                  style={{ backgroundColor: colorMap[r.location_type] || "#999" }}
                />
                {activeId === r.id && (
                  <div className="absolute -top-20 left-1/2 -translate-x-1/2 bg-neutral-900 text-white text-xs px-3 py-2 rounded whitespace-nowrap z-20 shadow-lg">
                    <p className="font-semibold">{labelMap[r.location_type] || r.location_type}</p>
                    {r.submitter_name && <p className="text-neutral-400">от {r.submitter_name}</p>}
                    <div
                      className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-neutral-900"
                    />
                  </div>
                )}
              </div>
            );
          })}

          <div className="absolute top-4 left-4 bg-white border border-neutral-200 px-3 py-1.5 text-xs text-neutral-600 shadow-sm">
            {reports.length > 0 ? `${reports.length} точек подтверждено` : "Нет данных"}
          </div>
        </div>

        <div className="flex flex-wrap gap-6 mt-6">
          {legend.map((l) => (
            <div key={l.label} className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded-full border border-white shadow-sm"
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
