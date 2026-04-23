import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Icon from "@/components/ui/icon";
import func2url from "../../backend/func2url.json";

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
}

const CATEGORIES: { value: string; label: string; icon: string }[] = [
  { value: "", label: "Все", icon: "LayoutGrid" },
  { value: "restaurant", label: "Рестораны", icon: "UtensilsCrossed" },
  { value: "sanatorium", label: "Санатории", icon: "Building2" },
  { value: "entertainment", label: "Развлечения", icon: "Smile" },
  { value: "hotel", label: "Отели", icon: "BedDouble" },
  { value: "beach", label: "Пляжи", icon: "Waves" },
  { value: "shop", label: "Магазины", icon: "ShoppingBag" },
  { value: "other", label: "Прочее", icon: "MoreHorizontal" },
];

function Stars({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <span key={i} className={`text-base ${i <= rating ? "text-yellow-400" : "text-neutral-200"}`}>
          ★
        </span>
      ))}
      <span className="ml-1.5 text-xs text-neutral-500 font-medium">{rating}/5</span>
    </div>
  );
}

const RATING_LABELS: Record<number, { label: string; color: string }> = {
  1: { label: "Недоступно", color: "text-red-600" },
  2: { label: "Очень сложно", color: "text-orange-600" },
  3: { label: "С трудом", color: "text-yellow-600" },
  4: { label: "Доступно", color: "text-lime-600" },
  5: { label: "Отлично", color: "text-green-600" },
};

export default function Places() {
  const [places, setPlaces] = useState<Place[]>([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState("");

  useEffect(() => {
    setLoading(true);
    const url = category
      ? `${func2url["places"]}?category=${category}`
      : func2url["places"];
    fetch(url)
      .then((r) => r.json())
      .then((data) => {
        const parsed = typeof data === "string" ? JSON.parse(data) : data;
        setPlaces(parsed.places || []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [category]);

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Header */}
      <div className="bg-neutral-900 text-white px-6 py-5 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
          <Icon name="ArrowLeft" size={18} />
          <span className="text-sm font-bold uppercase tracking-widest">НДЛСВ</span>
        </Link>
        <span className="text-neutral-400 text-sm hidden sm:block">Карта доступности</span>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-16">
        <h3 className="uppercase text-sm tracking-widest text-neutral-500 mb-4">Проверено и оценено</h3>
        <h1 className="text-3xl lg:text-5xl font-bold text-neutral-900 leading-tight mb-4">
          Карта доступности
        </h1>
        <p className="text-neutral-600 mb-10 max-w-2xl">
          Рестораны, санатории, отели и развлечения Анапы — с реальной оценкой доступности для людей с ограниченными возможностями.
        </p>

        {/* Фильтры */}
        <div className="flex flex-wrap gap-2 mb-10">
          {CATEGORIES.map((c) => (
            <button
              key={c.value}
              onClick={() => setCategory(c.value)}
              className={`flex items-center gap-1.5 px-4 py-2 text-sm border transition-colors ${
                category === c.value
                  ? "bg-neutral-900 text-white border-neutral-900"
                  : "bg-white text-neutral-600 border-neutral-200 hover:border-neutral-400"
              }`}
            >
              <Icon name={c.icon as Parameters<typeof Icon>[0]["name"]} size={13} />
              {c.label}
            </button>
          ))}
        </div>

        {loading && (
          <div className="flex items-center justify-center py-24 text-neutral-400">
            <Icon name="Loader2" size={28} className="animate-spin" />
          </div>
        )}

        {!loading && places.length === 0 && (
          <div className="text-center py-24 text-neutral-400">
            <Icon name="MapPin" size={40} className="mx-auto mb-4 opacity-30" />
            <p className="text-sm">Мест пока нет — скоро появятся</p>
          </div>
        )}

        {!loading && places.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {places.map((p) => {
              const rating = RATING_LABELS[p.access_rating];
              return (
                <div key={p.id} className="bg-white border border-neutral-200 flex flex-col overflow-hidden">
                  {/* Фото */}
                  {p.photo_url ? (
                    <img
                      src={p.photo_url}
                      alt={p.name}
                      className="w-full h-44 object-cover"
                    />
                  ) : (
                    <div className="w-full h-44 bg-neutral-100 flex items-center justify-center">
                      <Icon name="ImageOff" size={28} className="text-neutral-300" />
                    </div>
                  )}

                  {/* Контент */}
                  <div className="flex-1 p-4 flex flex-col gap-2">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs uppercase tracking-wide text-neutral-400">
                        {CATEGORIES.find((c) => c.value === p.category)?.label || p.category}
                      </span>
                      {rating && (
                        <span className={`text-xs font-semibold ${rating.color}`}>{rating.label}</span>
                      )}
                    </div>

                    <h2 className="text-base font-bold text-neutral-900 leading-snug">{p.name}</h2>

                    <Stars rating={p.access_rating} />

                    {p.access_comment && (
                      <p className="text-sm text-neutral-600 leading-snug">{p.access_comment}</p>
                    )}

                    {p.features?.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {p.features.map((f) => (
                          <span key={f} className="text-xs bg-neutral-100 text-neutral-600 px-2 py-0.5">
                            {f}
                          </span>
                        ))}
                      </div>
                    )}

                    <div className="mt-auto pt-2 flex flex-col gap-1">
                      {p.address && (
                        <p className="text-xs text-neutral-500 flex items-start gap-1">
                          <Icon name="MapPin" size={11} className="mt-0.5 shrink-0" />
                          {p.address}
                        </p>
                      )}
                      <div className="flex items-center gap-3 mt-1">
                        {p.latitude && p.longitude && (
                          <a
                            href={`https://maps.google.com/?q=${p.latitude},${p.longitude}`}
                            target="_blank"
                            rel="noreferrer"
                            className="text-xs text-blue-600 hover:underline flex items-center gap-1"
                          >
                            <Icon name="Navigation" size={11} /> Маршрут
                          </a>
                        )}
                        {p.phone && (
                          <a href={`tel:${p.phone}`} className="text-xs text-neutral-500 hover:text-neutral-900 flex items-center gap-1">
                            <Icon name="Phone" size={11} /> {p.phone}
                          </a>
                        )}
                        {p.website && (
                          <a href={p.website} target="_blank" rel="noreferrer" className="text-xs text-neutral-500 hover:text-neutral-900 flex items-center gap-1">
                            <Icon name="ExternalLink" size={11} /> Сайт
                          </a>
                        )}
                      </div>
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
