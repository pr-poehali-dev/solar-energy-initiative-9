import { useState } from "react";
import Icon from "@/components/ui/icon";

const locationTypes = [
  { value: "easy", label: "🟢 Легко. Ровный асфальт, пологий пандус" },
  { value: "hard", label: "🟡 Сложно. Щебень, бордюры, уклон" },
  { value: "blocked", label: "🔴 Непроходимо. Лестница, глубокие ямы, нет пандуса" },
  { value: "historic", label: "🏛️ Историческое/Туристическое место (добраться можно)" },
  { value: "park", label: "🌳 Парк или зона отдыха" },
];

const features = [
  "Подходит для электроскутера",
  "Можно только с сопровождающим",
  "Есть парковка для инвалидов рядом",
  "Узкий проход",
];

export default function ReportForm() {
  const [locationType, setLocationType] = useState("");
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>([]);
  const [comment, setComment] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const toggleFeature = (f: string) => {
    setSelectedFeatures((prev) =>
      prev.includes(f) ? prev.filter((x) => x !== f) : [...prev, f]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div id="report" className="min-h-screen bg-neutral-50 flex items-center justify-center px-6">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Icon name="CheckCircle" size={32} className="text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-neutral-900 mb-3">Спасибо!</h2>
          <p className="text-neutral-600 mb-8">
            Ваша заявка отправлена на проверку. После подтверждения место появится на карте.
          </p>
          <button
            onClick={() => setSubmitted(false)}
            className="bg-black text-white px-6 py-3 text-sm uppercase tracking-widest hover:bg-neutral-800 transition-colors"
          >
            Отметить ещё одно место
          </button>
        </div>
      </div>
    );
  }

  return (
    <div id="report" className="min-h-screen bg-neutral-50 px-6 py-24">
      <div className="max-w-2xl mx-auto">
        <h3 className="uppercase text-sm tracking-widest text-neutral-500 mb-4">Форма сбора данных</h3>
        <h2 className="text-3xl lg:text-4xl font-bold text-neutral-900 mb-2 leading-tight">
          Сообщите о месте
        </h2>
        <p className="text-neutral-600 mb-12">
          Все поля отмеченные * обязательны. Данные пройдут проверку перед публикацией на карте.
        </p>

        <form onSubmit={handleSubmit} className="space-y-8">

          {/* GPS */}
          <div className="bg-white border border-neutral-200 p-6">
            <label className="block text-sm font-semibold uppercase tracking-wide text-neutral-700 mb-3">
              Местоположение *
            </label>
            <div className="flex items-center gap-3 p-4 bg-neutral-50 border border-dashed border-neutral-300 cursor-pointer hover:bg-neutral-100 transition-colors">
              <Icon name="MapPin" size={20} className="text-neutral-500 shrink-0" />
              <div>
                <p className="text-sm font-medium text-neutral-800">Определить моё местоположение</p>
                <p className="text-xs text-neutral-500 mt-0.5">GPS автоматически. Можно скорректировать точку на карте пальцем.</p>
              </div>
              <Icon name="Navigation" size={16} className="text-blue-500 ml-auto shrink-0" />
            </div>
            <div className="mt-3 h-32 bg-neutral-200 flex items-center justify-center relative overflow-hidden">
              <div className="absolute inset-0 opacity-20"
                style={{
                  backgroundImage: "repeating-linear-gradient(0deg, #999 0, #999 1px, transparent 1px, transparent 40px), repeating-linear-gradient(90deg, #999 0, #999 1px, transparent 1px, transparent 40px)"
                }}
              />
              <div className="flex flex-col items-center gap-1 z-10">
                <Icon name="MapPin" size={24} className="text-red-500" />
                <span className="text-xs text-neutral-600">Карта загрузится после разрешения геолокации</span>
              </div>
            </div>
          </div>

          {/* Photo */}
          <div className="bg-white border border-neutral-200 p-6">
            <label className="block text-sm font-semibold uppercase tracking-wide text-neutral-700 mb-3">
              Фото препятствия или маршрута *
            </label>
            <div className="flex items-center justify-center gap-3 p-8 bg-neutral-50 border border-dashed border-neutral-300 cursor-pointer hover:bg-neutral-100 transition-colors">
              <Icon name="Camera" size={24} className="text-neutral-400" />
              <div>
                <p className="text-sm font-medium text-neutral-800">Сделать фото</p>
                <p className="text-xs text-neutral-500 mt-0.5">На снимке будут отпечатаны координаты и время</p>
              </div>
            </div>
          </div>

          {/* Location type */}
          <div className="bg-white border border-neutral-200 p-6">
            <label className="block text-sm font-semibold uppercase tracking-wide text-neutral-700 mb-3">
              Тип локации *
            </label>
            <div className="space-y-2">
              {locationTypes.map((t) => (
                <label
                  key={t.value}
                  className={`flex items-center gap-3 p-3 cursor-pointer border transition-colors ${
                    locationType === t.value
                      ? "border-neutral-900 bg-neutral-50"
                      : "border-transparent hover:border-neutral-200"
                  }`}
                >
                  <input
                    type="radio"
                    name="locationType"
                    value={t.value}
                    checked={locationType === t.value}
                    onChange={() => setLocationType(t.value)}
                    className="accent-black"
                    required
                  />
                  <span className="text-sm text-neutral-800">{t.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Features */}
          <div className="bg-white border border-neutral-200 p-6">
            <label className="block text-sm font-semibold uppercase tracking-wide text-neutral-700 mb-3">
              Особенности маршрута <span className="text-neutral-400 font-normal normal-case">(можно выбрать несколько)</span>
            </label>
            <div className="space-y-2">
              {features.map((f) => (
                <label
                  key={f}
                  className="flex items-center gap-3 p-3 cursor-pointer hover:bg-neutral-50 transition-colors"
                >
                  <input
                    type="checkbox"
                    checked={selectedFeatures.includes(f)}
                    onChange={() => toggleFeature(f)}
                    className="accent-black w-4 h-4"
                  />
                  <span className="text-sm text-neutral-800">{f}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Comment */}
          <div className="bg-white border border-neutral-200 p-6">
            <label className="block text-sm font-semibold uppercase tracking-wide text-neutral-700 mb-1">
              Личный комментарий очевидца
            </label>
            <p className="text-xs text-neutral-500 mb-3">
              Напишите подробности: например, с какой стороны есть съезд или где конкретно яма
            </p>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={4}
              placeholder="Например: с северной стороны есть пологий съезд, но он узкий..."
              className="w-full border border-neutral-200 p-3 text-sm text-neutral-800 placeholder-neutral-400 focus:outline-none focus:border-neutral-400 resize-none"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-black text-white py-4 text-sm uppercase tracking-widest font-semibold hover:bg-neutral-800 transition-colors flex items-center justify-center gap-2"
          >
            <Icon name="Send" size={16} />
            Отправить на проверку
          </button>
        </form>
      </div>
    </div>
  );
}
