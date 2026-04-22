import Icon from "@/components/ui/icon";

export interface Report {
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
  neutral: "🔵 Нейтрально",
  hard: "🟡 Сложно",
  blocked: "🔴 Непроходимо",
};

interface AdminReportsTabProps {
  filtered: Report[];
  loading: boolean;
  filter: "all" | "new" | "approved" | "rejected";
  counts: Record<string, number>;
  actionId: number | null;
  expandedId: number | null;
  rejectTarget: number | null;
  rejectReason: string;
  onFilterChange: (f: "all" | "new" | "approved" | "rejected") => void;
  onRefresh: () => void;
  onApprove: (id: number) => void;
  onRejectTarget: (id: number) => void;
  onRejectConfirm: (id: number, reason: string) => void;
  onRejectCancel: () => void;
  onRejectReasonChange: (v: string) => void;
  onToggleExpand: (id: number) => void;
}

export default function AdminReportsTab({
  filtered,
  loading,
  filter,
  counts,
  actionId,
  expandedId,
  rejectTarget,
  rejectReason,
  onFilterChange,
  onRefresh,
  onApprove,
  onRejectTarget,
  onRejectConfirm,
  onRejectCancel,
  onRejectReasonChange,
  onToggleExpand,
}: AdminReportsTabProps) {
  return (
    <>
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {(["all", "new", "approved", "rejected"] as const).map((key) => (
          <button
            key={key}
            onClick={() => onFilterChange(key)}
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
            onClick={onRefresh}
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
                  onClick={() => onToggleExpand(r.id)}
                  className="text-xs text-neutral-500 hover:text-neutral-900 transition-colors flex items-center gap-1"
                >
                  <Icon name="MapPin" size={12} />
                  Карта
                </button>
                {r.status !== "approved" && (
                  <button
                    onClick={() => onApprove(r.id)}
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
                    onClick={() => onRejectTarget(r.id)}
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
                    onChange={(e) => onRejectReasonChange(e.target.value)}
                    placeholder="Например: дубль, фейк, нет фото..."
                    className="flex-1 border border-red-200 px-3 py-1.5 text-xs focus:outline-none focus:border-red-400 bg-white"
                  />
                  <button
                    onClick={() => onRejectConfirm(r.id, rejectReason)}
                    className="px-3 py-1.5 bg-red-600 text-white text-xs rounded hover:bg-red-700 transition-colors"
                  >
                    Отклонить
                  </button>
                  <button
                    onClick={onRejectCancel}
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
    </>
  );
}
