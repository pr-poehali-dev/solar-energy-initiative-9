import { useState, useEffect } from "react";
import Icon from "@/components/ui/icon";
import func2url from "../../../backend/func2url.json";

interface Place {
  id: number;
  name: string;
  category: string;
  address: string;
  city: string;
  latitude: number | null;
  longitude: number | null;
  access_rating: number;
  access_comment: string;
  features: string[];
  photo_url: string;
  website: string;
  phone: string;
  published: boolean;
}

const EMPTY_FORM: Omit<Place, "id"> = {
  name: "", category: "restaurant", address: "", city: "Анапа",
  latitude: null, longitude: null, access_rating: 3,
  access_comment: "", features: [], photo_url: "",
  website: "", phone: "", published: true,
};

const CATEGORIES = [
  { value: "restaurant", label: "Ресторан / кафе" },
  { value: "sanatorium", label: "Санаторий" },
  { value: "entertainment", label: "Развлечения" },
  { value: "hotel", label: "Отель" },
  { value: "beach", label: "Пляж" },
  { value: "shop", label: "Магазин" },
  { value: "other", label: "Прочее" },
];

function Stars({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((i) => (
        <button
          key={i}
          type="button"
          onClick={() => onChange(i)}
          className={`text-2xl transition-colors ${i <= value ? "text-yellow-400" : "text-neutral-200 hover:text-yellow-300"}`}
        >
          ★
        </button>
      ))}
      <span className="ml-2 text-sm text-neutral-500">{value}/5</span>
    </div>
  );
}

export default function AdminPlacesTab({ token }: { token: string }) {
  const [places, setPlaces] = useState<Place[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState<Omit<Place, "id">>(EMPTY_FORM);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [featuresInput, setFeaturesInput] = useState("");

  const fetch_places = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${func2url["places"]}?all=1`);
      const raw = await res.json();
      const data = typeof raw === "string" ? JSON.parse(raw) : raw;
      setPlaces(data.places || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetch_places(); }, []);

  const startEdit = (p: Place) => {
    const { id, ...rest } = p;
    setForm(rest);
    setFeaturesInput(p.features?.join(", ") || "");
    setEditingId(id);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const resetForm = () => {
    setForm(EMPTY_FORM);
    setFeaturesInput("");
    setEditingId(null);
  };

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const payload = {
      ...form,
      features: featuresInput.split(",").map((s) => s.trim()).filter(Boolean),
    };
    await fetch(func2url["places"], {
      method: editingId ? "PUT" : "POST",
      headers: { "Content-Type": "application/json", "X-Admin-Token": token },
      body: JSON.stringify(editingId ? { id: editingId, ...payload } : payload),
    });
    await fetch_places();
    resetForm();
    setSaving(false);
  };

  const remove = async (id: number) => {
    if (!confirm("Удалить это место?")) return;
    await fetch(func2url["places"], {
      method: "DELETE",
      headers: { "Content-Type": "application/json", "X-Admin-Token": token },
      body: JSON.stringify({ id }),
    });
    await fetch_places();
  };

  const f = (field: keyof typeof form, value: unknown) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  return (
    <div className="space-y-8">
      {/* Форма */}
      <form onSubmit={save} className="bg-white border border-neutral-200 p-6 space-y-4">
        <h2 className="font-bold text-neutral-900 text-base">
          {editingId ? "Редактировать место" : "Добавить место"}
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs text-neutral-500 mb-1">Название *</label>
            <input
              required
              value={form.name}
              onChange={(e) => f("name", e.target.value)}
              className="w-full border border-neutral-200 px-3 py-2 text-sm focus:outline-none focus:border-neutral-500"
              placeholder="Ресторан «Якорь»"
            />
          </div>
          <div>
            <label className="block text-xs text-neutral-500 mb-1">Категория</label>
            <select
              value={form.category}
              onChange={(e) => f("category", e.target.value)}
              className="w-full border border-neutral-200 px-3 py-2 text-sm focus:outline-none focus:border-neutral-500"
            >
              {CATEGORIES.map((c) => (
                <option key={c.value} value={c.value}>{c.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs text-neutral-500 mb-1">Адрес</label>
            <input
              value={form.address}
              onChange={(e) => f("address", e.target.value)}
              className="w-full border border-neutral-200 px-3 py-2 text-sm focus:outline-none focus:border-neutral-500"
              placeholder="ул. Ленина, 12"
            />
          </div>
          <div>
            <label className="block text-xs text-neutral-500 mb-1">Город</label>
            <input
              value={form.city}
              onChange={(e) => f("city", e.target.value)}
              className="w-full border border-neutral-200 px-3 py-2 text-sm focus:outline-none focus:border-neutral-500"
            />
          </div>
          <div>
            <label className="block text-xs text-neutral-500 mb-1">Телефон</label>
            <input
              value={form.phone}
              onChange={(e) => f("phone", e.target.value)}
              className="w-full border border-neutral-200 px-3 py-2 text-sm focus:outline-none focus:border-neutral-500"
              placeholder="+7 (861) 000-00-00"
            />
          </div>
          <div>
            <label className="block text-xs text-neutral-500 mb-1">Сайт</label>
            <input
              value={form.website}
              onChange={(e) => f("website", e.target.value)}
              className="w-full border border-neutral-200 px-3 py-2 text-sm focus:outline-none focus:border-neutral-500"
              placeholder="https://..."
            />
          </div>
          <div>
            <label className="block text-xs text-neutral-500 mb-1">Широта</label>
            <input
              type="number"
              step="any"
              value={form.latitude ?? ""}
              onChange={(e) => f("latitude", e.target.value ? parseFloat(e.target.value) : null)}
              className="w-full border border-neutral-200 px-3 py-2 text-sm focus:outline-none focus:border-neutral-500"
              placeholder="44.895"
            />
          </div>
          <div>
            <label className="block text-xs text-neutral-500 mb-1">Долгота</label>
            <input
              type="number"
              step="any"
              value={form.longitude ?? ""}
              onChange={(e) => f("longitude", e.target.value ? parseFloat(e.target.value) : null)}
              className="w-full border border-neutral-200 px-3 py-2 text-sm focus:outline-none focus:border-neutral-500"
              placeholder="37.316"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs text-neutral-500 mb-1">URL фото</label>
          <input
            value={form.photo_url}
            onChange={(e) => f("photo_url", e.target.value)}
            className="w-full border border-neutral-200 px-3 py-2 text-sm focus:outline-none focus:border-neutral-500"
            placeholder="https://cdn..."
          />
        </div>

        <div>
          <label className="block text-xs text-neutral-500 mb-2">Оценка доступности</label>
          <Stars value={form.access_rating} onChange={(v) => f("access_rating", v)} />
        </div>

        <div>
          <label className="block text-xs text-neutral-500 mb-1">Комментарий о доступности</label>
          <textarea
            value={form.access_comment}
            onChange={(e) => f("access_comment", e.target.value)}
            rows={2}
            className="w-full border border-neutral-200 px-3 py-2 text-sm focus:outline-none focus:border-neutral-500 resize-none"
            placeholder="Есть пандус, но нет лифта..."
          />
        </div>

        <div>
          <label className="block text-xs text-neutral-500 mb-1">Особенности (через запятую)</label>
          <input
            value={featuresInput}
            onChange={(e) => setFeaturesInput(e.target.value)}
            className="w-full border border-neutral-200 px-3 py-2 text-sm focus:outline-none focus:border-neutral-500"
            placeholder="Пандус, Парковка для инвалидов, Широкие двери"
          />
        </div>

        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 text-sm cursor-pointer">
            <input
              type="checkbox"
              checked={form.published}
              onChange={(e) => f("published", e.target.checked)}
              className="accent-neutral-900"
            />
            Опубликовано
          </label>
        </div>

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={saving}
            className="px-5 py-2 bg-neutral-900 text-white text-sm font-medium hover:bg-neutral-700 transition-colors disabled:opacity-50"
          >
            {saving ? "Сохраняю..." : editingId ? "Сохранить" : "Добавить"}
          </button>
          {editingId && (
            <button type="button" onClick={resetForm} className="px-5 py-2 border border-neutral-200 text-sm text-neutral-600 hover:border-neutral-400 transition-colors">
              Отмена
            </button>
          )}
        </div>
      </form>

      {/* Список */}
      {loading ? (
        <div className="flex items-center justify-center py-16 text-neutral-400">
          <Icon name="Loader2" size={24} className="animate-spin" />
        </div>
      ) : places.length === 0 ? (
        <p className="text-neutral-400 text-sm text-center py-12">Мест пока нет — добавьте первое</p>
      ) : (
        <div className="space-y-3">
          {places.map((p) => (
            <div key={p.id} className="bg-white border border-neutral-200 flex gap-4 overflow-hidden">
              {p.photo_url ? (
                <img src={p.photo_url} alt={p.name} className="w-20 h-20 object-cover shrink-0" />
              ) : (
                <div className="w-20 h-20 bg-neutral-100 flex items-center justify-center shrink-0">
                  <Icon name="ImageOff" size={18} className="text-neutral-300" />
                </div>
              )}
              <div className="flex-1 py-3 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="text-xs text-neutral-400">{CATEGORIES.find((c) => c.value === p.category)?.label}</span>
                  {!p.published && <span className="text-xs bg-neutral-100 text-neutral-500 px-1.5">Скрыто</span>}
                </div>
                <p className="font-semibold text-sm text-neutral-900">{p.name}</p>
                <div className="flex items-center gap-0.5 mt-0.5">
                  {[1,2,3,4,5].map((i) => (
                    <span key={i} className={`text-sm ${i <= p.access_rating ? "text-yellow-400" : "text-neutral-200"}`}>★</span>
                  ))}
                </div>
                {p.address && <p className="text-xs text-neutral-500 mt-0.5">{p.address}</p>}
              </div>
              <div className="flex flex-col gap-2 p-3 shrink-0">
                <button
                  onClick={() => startEdit(p)}
                  className="text-xs text-neutral-500 hover:text-neutral-900 transition-colors flex items-center gap-1"
                >
                  <Icon name="Pencil" size={12} /> Изменить
                </button>
                <button
                  onClick={() => remove(p.id)}
                  className="text-xs text-red-400 hover:text-red-600 transition-colors flex items-center gap-1"
                >
                  <Icon name="Trash2" size={12} /> Удалить
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
