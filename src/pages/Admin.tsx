import { useState, useEffect, useCallback } from "react";
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
  reviewed_at: string | null;
}

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  new: { label: "Новая заявка", color: "bg-yellow-100 text-yellow-800" },
  approved: { label: "Подтверждено", color: "bg-green-100 text-green-800" },
  rejected: { label: "Отклонено", color: "bg-red-100 text-red-800" },
};

const TYPE_LABELS: Record<string, string> = {
  easy: "🟢 Легко",
  hard: "🟡 Сложно",
  blocked: "🔴 Непроходимо",
  historic: "🏛️ Историческое",
  park: "🌳 Парк",
};

export default function Admin() {
  const [password, setPassword] = useState("");
  const [token, setToken] = useState(() => sessionStorage.getItem("admin_token") || "");
  const [loginError, setLoginError] = useState("");
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState<"all" | "new" | "approved" | "rejected">("new");
  const [actionId, setActionId] = useState<number | null>(null);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [rejectTarget, setRejectTarget] = useState<number | null>(null);

  const fetchReports = useCallback(async (tok: string) => {
    setLoading(true);
    try {
      const res = await fetch(`${func2url["get-reports"]}?admin=1`);
      const raw = await res.json();
      const data = typeof raw === "string" ? JSON.parse(raw) : raw;
      setReports(data.reports || []);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (token) fetchReports(token);
  }, [token, fetchReports]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError("");
    const res = await fetch(func2url["moderate-report"], {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-Admin-Token": password },
      body: JSON.stringify({ id: 0, status: "new" }),
    });
    if (res.status === 403) {
      setLoginError("Неверный пароль");
      return;
    }
    sessionStorage.setItem("admin_token", password);
    setToken(password);
  };

  const moderate = async (id: number, status: "approved" | "rejected", reason = "") => {
    setActionId(id);
    await fetch(func2url["moderate-report"], {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-Admin-Token": token },
      body: JSON.stringify({ id, status, reject_reason: reason }),
    });
    await fetchReports(token);
    setActionId(null);
    setRejectTarget(null);
    setRejectReason("");
  };

  const logout = () => {
    sessionStorage.removeItem("admin_token");
    setToken("");
    setPassword("");
  };

  const filtered = filter === "all" ? reports : reports.filter((r) => r.status === filter);
  const counts = {
    all: reports.length,
    new: reports.filter((r) => r.status === "new").length,
    approved: reports.filter((r) => r.status === "approved").length,
    rejected: reports.filter((r) => r.status === "rejected").length,
  };

  // LOGIN SCREEN
  if (!token) {
    return (
      <div className="min-h-screen bg-neutral-900 flex items-center justify-center px-6">
        <div className="w-full max-w-sm">
          <div className="text-white text-center mb-8">
            <h1 className="text-2xl font-bold tracking-tight mb-1">НДЛСВ</h1>
            <p className="text-neutral-400 text-sm">Панель администратора</p>
          </div>
          <form onSubmit={handleLogin} className="bg-white p-8 space-y-4">
            <div>
              <label className="block text-xs uppercase tracking-widest text-neutral-500 mb-2">Пароль</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoFocus
                required
                placeholder="Введите пароль администратора"
                className="w-full border border-neutral-200 p-3 text-sm focus:outline-none focus:border-neutral-900"
              />
            </div>
            {loginError && (
              <p className="text-red-600 text-sm flex items-center gap-2">
                <Icon name="AlertCircle" size={14} /> {loginError}
              </p>
            )}
            <button
              type="submit"
              className="w-full bg-black text-white py-3 text-sm uppercase tracking-widest hover:bg-neutral-800 transition-colors"
            >
              Войти
            </button>
          </form>
        </div>
      </div>
    );
  }

  // ADMIN PANEL
  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Header */}
      <div className="bg-neutral-900 text-white px-6 py-4 flex items-center justify-between">
        <div>
          <span className="font-bold tracking-widest text-sm uppercase">НДЛСВ</span>
          <span className="text-neutral-400 text-sm ml-3">Панель модерации</span>
        </div>
        <div className="flex items-center gap-4">
          <a href="/" className="text-neutral-400 hover:text-white text-xs uppercase tracking-wide transition-colors">
            На сайт
          </a>
          <button onClick={logout} className="text-neutral-400 hover:text-white text-xs uppercase tracking-wide transition-colors flex items-center gap-1">
            <Icon name="LogOut" size={14} /> Выйти
          </button>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-10">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {(["all", "new", "approved", "rejected"] as const).map((key) => (
            <button
              key={key}
              onClick={() => setFilter(key)}
              className={`p-4 border text-left transition-colors ${
                filter === key ? "bg-neutral-900 text-white border-neutral-900" : "bg-white border-neutral-200 hover:border-neutral-400"
              }`}
            >
              <div className={`text-3xl font-bold mb-1 ${filter === key ? "text-white" : "text-neutral-900"}`}>
                {counts[key]}
              </div>
              <div className={`text-xs uppercase tracking-wide ${filter === key ? "text-neutral-300" : "text-neutral-500"}`}>
                {key === "all" && "Всего"}
                {key === "new" && "Ожидают"}
                {key === "approved" && "Подтверждено"}
                {key === "rejected" && "Отклонено"}
              </div>
            </button>
          ))}
        </div>

        {/* Table */}
        <div className="bg-white border border-neutral-200">
          <div className="px-6 py-4 border-b border-neutral-100 flex items-center justify-between">
            <h2 className="font-semibold text-neutral-900 text-sm uppercase tracking-wide">
              Заявки {filter !== "all" && `· ${STATUS_LABELS[filter]?.label}`}
            </h2>
            <button
              onClick={() => fetchReports(token)}
              className="flex items-center gap-1 text-xs text-neutral-500 hover:text-neutral-900 transition-colors"
            >
              <Icon name="RefreshCw" size={12} /> Обновить
            </button>
          </div>

          {loading && (
            <div className="flex items-center justify-center py-16 gap-2 text-neutral-400">
              <Icon name="Loader2" size={20} className="animate-spin" />
              <span className="text-sm">Загружаем...</span>
            </div>
          )}

          {!loading && filtered.length === 0 && (
            <div className="text-center py-16 text-neutral-400">
              <Icon name="Inbox" size={32} className="mx-auto mb-3 opacity-40" />
              <p className="text-sm">Заявок нет</p>
            </div>
          )}

          {!loading && filtered.map((r) => (
            <div key={r.id} className="border-b border-neutral-100 last:border-0">
              <div className="px-6 py-4 flex items-start gap-4">
                {/* Photo thumbnail */}
                {r.photo_url ? (
                  <a href={r.photo_url} target="_blank" rel="noreferrer" className="shrink-0">
                    <img
                      src={r.photo_url}
                      alt="Фото"
                      className="w-20 h-20 object-cover rounded border border-neutral-200 hover:opacity-80 transition-opacity"
                    />
                  </a>
                ) : (
                  <div className="w-20 h-20 bg-neutral-100 rounded border border-neutral-200 flex items-center justify-center shrink-0">
                    <Icon name="ImageOff" size={20} className="text-neutral-300" />
                  </div>
                )}

                {/* Left info */}
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_LABELS[r.status]?.color}`}>
                      {STATUS_LABELS[r.status]?.label}
                    </span>
                    <span className="text-xs text-neutral-500">{TYPE_LABELS[r.location_type] || r.location_type}</span>
                    <span className="text-xs text-neutral-400">#{r.id}</span>
                  </div>
                  <p className="text-sm font-medium text-neutral-900 mb-1">
                    {r.submitter_name || "Аноним"} · {r.city}
                  </p>
                  <p className="text-xs text-neutral-500 mb-1">
                    {r.latitude.toFixed(5)}, {r.longitude.toFixed(5)}
                  </p>
                  {r.comment && (
                    <p className="text-sm text-neutral-600 line-clamp-2">{r.comment}</p>
                  )}
                  {r.features?.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {r.features.map((f) => (
                        <span key={f} className="text-xs bg-neutral-100 text-neutral-600 px-2 py-0.5 rounded">
                          {f}
                        </span>
                      ))}
                    </div>
                  )}
                  <p className="text-xs text-neutral-400 mt-2">
                    {new Date(r.created_at).toLocaleString("ru-RU")}
                  </p>
                </div>

                {/* Actions */}
                <div className="flex flex-col gap-2 shrink-0">
                  <button
                    onClick={() => setExpandedId(expandedId === r.id ? null : r.id)}
                    className="text-xs text-neutral-500 hover:text-neutral-900 transition-colors flex items-center gap-1"
                  >
                    <Icon name="MapPin" size={12} />
                    Карта
                  </button>
                  {r.status !== "approved" && (
                    <button
                      onClick={() => moderate(r.id, "approved")}
                      disabled={actionId === r.id}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-green-600 text-white text-xs rounded hover:bg-green-700 transition-colors disabled:opacity-50"
                    >
                      {actionId === r.id
                        ? <Icon name="Loader2" size={12} className="animate-spin" />
                        : <Icon name="CheckCircle" size={12} />
                      }
                      Подтвердить
                    </button>
                  )}
                  {r.status !== "rejected" && (
                    <button
                      onClick={() => setRejectTarget(r.id)}
                      disabled={actionId === r.id}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-red-50 text-red-700 border border-red-200 text-xs rounded hover:bg-red-100 transition-colors disabled:opacity-50"
                    >
                      <Icon name="XCircle" size={12} />
                      Отклонить
                    </button>
                  )}
                </div>
              </div>

              {/* Expanded map link */}
              {expandedId === r.id && (
                <div className="px-6 pb-4">
                  <a
                    href={`https://maps.google.com/?q=${r.latitude},${r.longitude}`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 text-xs text-blue-600 hover:underline"
                  >
                    <Icon name="ExternalLink" size={12} />
                    Открыть в Google Maps ({r.latitude.toFixed(5)}, {r.longitude.toFixed(5)})
                  </a>
                </div>
              )}

              {/* Reject reason input */}
              {rejectTarget === r.id && (
                <div className="px-6 pb-4 bg-red-50 border-t border-red-100">
                  <p className="text-xs text-red-700 font-medium mb-2 pt-3">Причина отклонения (необязательно):</p>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={rejectReason}
                      onChange={(e) => setRejectReason(e.target.value)}
                      placeholder="Например: дубль, фейк, нет фото..."
                      className="flex-1 border border-red-200 px-3 py-1.5 text-xs focus:outline-none focus:border-red-400 bg-white"
                    />
                    <button
                      onClick={() => moderate(r.id, "rejected", rejectReason)}
                      className="px-3 py-1.5 bg-red-600 text-white text-xs rounded hover:bg-red-700 transition-colors"
                    >
                      Отклонить
                    </button>
                    <button
                      onClick={() => { setRejectTarget(null); setRejectReason(""); }}
                      className="px-3 py-1.5 border border-neutral-200 text-xs rounded hover:bg-neutral-100 transition-colors"
                    >
                      Отмена
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}