import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
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
  submitter_name: string;
  created_at: string;
}

const ACCESS_LABELS: Record<string, { label: string; color: string; bg: string }> = {
  blocked: { label: "Непроходимо", color: "text-red-700", bg: "bg-red-100" },
  hard:    { label: "Сложно",      color: "text-yellow-700", bg: "bg-yellow-100" },
  neutral: { label: "Нейтрально",  color: "text-blue-700", bg: "bg-blue-100" },
  easy:    { label: "Легко",       color: "text-green-700", bg: "bg-green-100" },
};

const PLACE_LABELS: Record<string, string> = {
  regular:   "🏘️ Обычное место",
  historic:  "🏛️ Историческое",
  park:      "🌳 Парк / зона отдыха",
  medical:   "🏥 Медицинское",
  transport: "🚌 Транспортный узел",
};

const ORDER = ["blocked", "hard", "neutral", "easy"];

export default function Problems() {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${func2url["get-reports"]}?problems=1`)
      .then((r) => r.json())
      .then((data) => {
        const parsed = typeof data === "string" ? JSON.parse(data) : data;
        const sorted = (parsed.reports || []).slice().sort(
          (a: Report, b: Report) =>
            (ORDER.indexOf(a.location_type) ?? 99) - (ORDER.indexOf(b.location_type) ?? 99)
        );
        setReports(sorted);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const blocked = reports.filter((r) => r.location_type === "blocked");
  const hard = reports.filter((r) => r.location_type === "hard");
  const other = reports.filter((r) => r.location_type !== "blocked" && r.location_type !== "hard");

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Header */}
      <div className="bg-neutral-900 text-white px-6 py-5 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
          <Icon name="ArrowLeft" size={18} />
          <span className="text-sm font-bold uppercase tracking-widest">НДЛСВ</span>
        </Link>
        <span className="text-neutral-400 text-sm hidden sm:block">Публичный список проблем</span>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-16">
        <h3 className="uppercase text-sm tracking-widest text-neutral-500 mb-4">Проверено и подтверждено</h3>
        <h1 className="text-3xl lg:text-5xl font-bold text-neutral-900 leading-tight mb-4">
          Проблемные места
        </h1>
        <p className="text-neutral-600 mb-4 max-w-2xl">
          Места, которые прошли проверку и признаны непригодными или труднопроходимыми для людей с ограниченными возможностями. Список обновляется по мере поступления подтверждённых заявок.
        </p>

        {!loading && (
          <div className="flex items-center gap-4 mb-12">
            {blocked.length > 0 && (
              <span className="flex items-center gap-1.5 text-sm font-medium text-red-700 bg-red-100 px-3 py-1.5">
                🔴 Непроходимых: {blocked.length}
              </span>
            )}
            {hard.length > 0 && (
              <span className="flex items-center gap-1.5 text-sm font-medium text-yellow-700 bg-yellow-100 px-3 py-1.5">
                🟡 Сложных: {hard.length}
              </span>
            )}
          </div>
        )}

        {loading && (
          <div className="flex items-center justify-center py-24 gap-3 text-neutral-400">
            <Icon name="Loader2" size={28} className="animate-spin" />
          </div>
        )}

        {!loading && reports.length === 0 && (
          <div className="text-center py-24 text-neutral-400">
            <Icon name="CheckCircle" size={40} className="mx-auto mb-4 opacity-30" />
            <p className="text-sm">Проблемных мест пока нет — отличные новости!</p>
          </div>
        )}

        {!loading && reports.length > 0 && (
          <div className="space-y-4">
            {reports.map((r, i) => {
              const access = ACCESS_LABELS[r.location_type];
              return (
                <div key={r.id} className="bg-white border border-neutral-200 flex gap-4 p-0 overflow-hidden">
                  {/* Номер */}
                  <div className="w-12 shrink-0 bg-neutral-900 flex items-center justify-center">
                    <span className="text-white text-xs font-bold">{i + 1}</span>
                  </div>

                  {/* Фото */}
                  {r.photo_url ? (
                    <a href={r.photo_url} target="_blank" rel="noreferrer" className="shrink-0 self-stretch">
                      <img src={r.photo_url} alt="Фото" className="h-full w-20 object-cover hover:opacity-80 transition-opacity" />
                    </a>
                  ) : (
                    <div className="w-20 shrink-0 bg-neutral-100 flex items-center justify-center">
                      <Icon name="ImageOff" size={18} className="text-neutral-300" />
                    </div>
                  )}

                  {/* Контент */}
                  <div className="flex-1 py-4 pr-4 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      {access && (
                        <span className={`text-xs font-semibold px-2 py-0.5 ${access.bg} ${access.color}`}>
                          {access.label}
                        </span>
                      )}
                      {r.place_type && (
                        <span className="text-xs text-neutral-500">{PLACE_LABELS[r.place_type] || r.place_type}</span>
                      )}
                    </div>
                    <p className="text-xs text-neutral-500 mb-1 font-mono">
                      {r.latitude.toFixed(5)}, {r.longitude.toFixed(5)} · {r.city}
                    </p>
                    {r.comment && (
                      <p className="text-sm text-neutral-700 leading-snug mb-2">{r.comment}</p>
                    )}
                    {r.features?.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-2">
                        {r.features.map((f) => (
                          <span key={f} className="text-xs bg-neutral-100 text-neutral-600 px-2 py-0.5">
                            {f}
                          </span>
                        ))}
                      </div>
                    )}
                    <div className="flex items-center gap-3 mt-1">
                      <a
                        href={`https://maps.google.com/?q=${r.latitude},${r.longitude}`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs text-blue-600 hover:underline flex items-center gap-1"
                      >
                        <Icon name="MapPin" size={11} /> Открыть на карте
                      </a>
                      <span className="text-xs text-neutral-400">
                        {new Date(r.created_at).toLocaleDateString("ru-RU")}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
