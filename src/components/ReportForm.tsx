import { useState, lazy, Suspense, useRef } from "react";
import Icon from "@/components/ui/icon";
import func2url from "../../backend/func2url.json";

const LocationPicker = lazy(() => import("./LocationPicker"));

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
  const [submitterName, setSubmitterName] = useState("");
  const [gpsStatus, setGpsStatus] = useState<"idle" | "loading" | "found" | "denied" | "error">("idle");
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [photo, setPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPhoto(file);
    setPhotoPreview(URL.createObjectURL(file));
  };

  const toggleFeature = (f: string) => {
    setSelectedFeatures((prev) =>
      prev.includes(f) ? prev.filter((x) => x !== f) : [...prev, f]
    );
  };

  const detectLocation = async () => {
    if (!navigator.geolocation) {
      setGpsStatus("error");
      return;
    }

    // Проверяем текущее состояние разрешения (если браузер поддерживает)
    if (navigator.permissions) {
      const perm = await navigator.permissions.query({ name: "geolocation" });
      if (perm.state === "denied") {
        setGpsStatus("denied");
        return;
      }
    }

    setGpsStatus("loading");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setGpsStatus("found");
      },
      (err) => {
        if (err.code === err.PERMISSION_DENIED) {
          setGpsStatus("denied");
        } else {
          setGpsStatus("error");
        }
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
  const isAndroid = /Android/.test(navigator.userAgent);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!coords) {
      setError("Пожалуйста, определите местоположение");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await fetch(func2url["submit-report"], {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          latitude: coords.lat,
          longitude: coords.lng,
          city: "Анапа",
          location_type: locationType,
          features: selectedFeatures,
          comment,
          submitter_name: submitterName,
        }),
      });
      if (!res.ok) throw new Error("Ошибка при отправке");
      setSubmitted(true);
    } catch {
      setError("Не удалось отправить заявку. Попробуйте ещё раз.");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setSubmitted(false);
    setCoords(null);
    setGpsStatus("idle");
    setLocationType("");
    setSelectedFeatures([]);
    setComment("");
    setSubmitterName("");
    setPhoto(null);
    setPhotoPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
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
            onClick={resetForm}
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
          Поля отмеченные * обязательны. Данные пройдут проверку перед публикацией на карте.
        </p>

        <form onSubmit={handleSubmit} className="space-y-8">

          {/* GPS */}
          <div className="bg-white border border-neutral-200 p-6">
            <label className="block text-sm font-semibold uppercase tracking-wide text-neutral-700 mb-3">
              Местоположение *
            </label>
            <button
              type="button"
              onClick={gpsStatus === "denied" ? undefined : detectLocation}
              disabled={gpsStatus === "loading"}
              className={`w-full flex items-center gap-3 p-4 border transition-colors text-left mb-3 ${
                gpsStatus === "denied"
                  ? "bg-orange-50 border-orange-200 cursor-default"
                  : gpsStatus === "found"
                  ? "bg-green-50 border-green-200 hover:bg-green-100"
                  : "bg-neutral-50 border-dashed border-neutral-300 hover:bg-neutral-100"
              }`}
            >
              <Icon
                name={
                  gpsStatus === "loading" ? "Loader2" :
                  gpsStatus === "found" ? "MapPinCheck" :
                  gpsStatus === "denied" ? "ShieldOff" :
                  gpsStatus === "error" ? "AlertCircle" :
                  "Navigation"
                }
                size={20}
                className={`shrink-0 ${
                  gpsStatus === "found" ? "text-green-500" :
                  gpsStatus === "denied" ? "text-orange-500" :
                  gpsStatus === "error" ? "text-red-500" :
                  gpsStatus === "loading" ? "text-blue-500 animate-spin" :
                  "text-blue-500"
                }`}
              />
              <div className="flex-1">
                {gpsStatus === "idle" && <p className="text-sm font-medium text-neutral-800">Определить моё местоположение</p>}
                {gpsStatus === "loading" && <p className="text-sm font-medium text-neutral-800">Определяем координаты...</p>}
                {gpsStatus === "found" && coords && (
                  <p className="text-sm font-medium text-green-700">✓ {coords.lat.toFixed(5)}, {coords.lng.toFixed(5)}</p>
                )}
                {gpsStatus === "error" && <p className="text-sm font-medium text-red-600">Сигнал GPS слабый. Попробуйте ещё раз или поставьте точку на карте.</p>}
                {gpsStatus === "denied" && <p className="text-sm font-medium text-orange-700">Доступ к геолокации заблокирован</p>}
                {gpsStatus !== "denied" && (
                  <p className="text-xs text-neutral-500 mt-0.5">Нажмите — браузер запросит разрешение · или поставьте точку на карте</p>
                )}
              </div>
            </button>

            {gpsStatus === "denied" && (
              <div className="mb-3 border border-orange-200 bg-orange-50 overflow-hidden">
                <div className="px-4 py-3 bg-orange-100 border-b border-orange-200">
                  <p className="text-sm font-semibold text-orange-900">Как разрешить геолокацию — 3 шага</p>
                </div>

                {isIOS && (
                  <div className="p-4 space-y-3">
                    {[
                      { num: "1", icon: "Settings", text: 'Откройте приложение «Настройки» (серая шестерёнка)' },
                      { num: "2", icon: "MapPin", text: 'Прокрутите вниз → «Конфиденциальность» → «Службы геолокации»' },
                      { num: "3", icon: "CheckCircle", text: 'Найдите Safari или Chrome → выберите «При использовании»' },
                    ].map((s) => (
                      <div key={s.num} className="flex items-start gap-3">
                        <div className="w-6 h-6 rounded-full bg-orange-500 text-white text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">{s.num}</div>
                        <p className="text-sm text-orange-900 leading-snug">{s.text}</p>
                      </div>
                    ))}
                    <div className="mt-2 p-3 bg-white border border-orange-200 rounded text-xs text-orange-700">
                      После этого вернитесь сюда и нажмите «Попробовать снова»
                    </div>
                  </div>
                )}

                {isAndroid && (
                  <div className="p-4 space-y-3">
                    {[
                      { num: "1", icon: "Chrome", text: 'В браузере нажмите на значок 🔒 замка слева от адресной строки' },
                      { num: "2", icon: "MapPin", text: 'Выберите «Разрешения» → «Местоположение»' },
                      { num: "3", icon: "CheckCircle", text: 'Переключите на «Разрешить» и обновите страницу' },
                    ].map((s) => (
                      <div key={s.num} className="flex items-start gap-3">
                        <div className="w-6 h-6 rounded-full bg-orange-500 text-white text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">{s.num}</div>
                        <p className="text-sm text-orange-900 leading-snug">{s.text}</p>
                      </div>
                    ))}
                    <div className="mt-2 p-3 bg-white border border-orange-200 rounded text-xs text-orange-700">
                      После этого вернитесь сюда и нажмите «Попробовать снова»
                    </div>
                  </div>
                )}

                {!isIOS && !isAndroid && (
                  <div className="p-4 space-y-3">
                    {[
                      { num: "1", text: 'Нажмите на значок 🔒 замка в адресной строке браузера' },
                      { num: "2", text: '«Разрешения сайта» → «Местоположение» → «Разрешить»' },
                      { num: "3", text: 'Обновите страницу и нажмите кнопку ещё раз' },
                    ].map((s) => (
                      <div key={s.num} className="flex items-start gap-3">
                        <div className="w-6 h-6 rounded-full bg-orange-500 text-white text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">{s.num}</div>
                        <p className="text-sm text-orange-900 leading-snug">{s.text}</p>
                      </div>
                    ))}
                  </div>
                )}

                <div className="px-4 pb-4 flex gap-2 flex-wrap">
                  <button
                    type="button"
                    onClick={detectLocation}
                    className="text-sm bg-orange-600 text-white px-4 py-2 hover:bg-orange-700 transition-colors font-medium"
                  >
                    Попробовать снова
                  </button>
                  <span className="text-xs text-orange-600 self-center">или укажите точку на карте вручную ↓</span>
                </div>
              </div>
            )}

            <Suspense fallback={<div className="h-[220px] bg-neutral-100 flex items-center justify-center text-sm text-neutral-400">Загрузка карты...</div>}>
              <LocationPicker
                coords={coords}
                onChange={(c) => { setCoords(c); setGpsStatus("found"); }}
              />
            </Suspense>
            {!coords && (
              <p className="text-xs text-neutral-400 mt-2 text-center">Нажмите на карту, чтобы поставить точку вручную</p>
            )}
          </div>

          {/* Submitter name */}
          <div className="bg-white border border-neutral-200 p-6">
            <label className="block text-sm font-semibold uppercase tracking-wide text-neutral-700 mb-3">
              Ваше имя *
            </label>
            <input
              type="text"
              value={submitterName}
              onChange={(e) => setSubmitterName(e.target.value)}
              required
              placeholder="Как к вам обращаться?"
              className="w-full border border-neutral-200 p-3 text-sm text-neutral-800 placeholder-neutral-400 focus:outline-none focus:border-neutral-400"
            />
          </div>

          {/* Photo */}
          <div className="bg-white border border-neutral-200 p-6">
            <label className="block text-sm font-semibold uppercase tracking-wide text-neutral-700 mb-3">
              Фото препятствия или маршрута *
            </label>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handlePhotoChange}
              className="hidden"
              id="photo-input"
              required
            />
            {photoPreview ? (
              <div className="relative">
                <img src={photoPreview} alt="Превью" className="w-full max-h-64 object-cover" />
                <button
                  type="button"
                  onClick={() => { setPhoto(null); setPhotoPreview(null); if (fileInputRef.current) fileInputRef.current.value = ""; }}
                  className="absolute top-2 right-2 bg-black/60 text-white rounded-full p-1 hover:bg-black transition-colors"
                >
                  <Icon name="X" size={14} />
                </button>
                <p className="text-xs text-green-600 mt-2 flex items-center gap-1">
                  <Icon name="CheckCircle" size={12} /> {photo?.name}
                </p>
              </div>
            ) : (
              <label
                htmlFor="photo-input"
                className="flex items-center justify-center gap-3 p-8 bg-neutral-50 border border-dashed border-neutral-300 cursor-pointer hover:bg-neutral-100 transition-colors"
              >
                <Icon name="Camera" size={24} className="text-neutral-400" />
                <div>
                  <p className="text-sm font-medium text-neutral-800">Сделать фото или выбрать из галереи</p>
                  <p className="text-xs text-neutral-500 mt-0.5">На снимке будут видны координаты и время</p>
                </div>
              </label>
            )}
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
              Особенности маршрута{" "}
              <span className="text-neutral-400 font-normal normal-case">(можно выбрать несколько)</span>
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

          {error && (
            <div className="flex items-center gap-2 p-4 bg-red-50 border border-red-200 text-red-700 text-sm">
              <Icon name="AlertCircle" size={16} />
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-black text-white py-4 text-sm uppercase tracking-widest font-semibold hover:bg-neutral-800 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? <Icon name="Loader2" size={16} className="animate-spin" /> : <Icon name="Send" size={16} />}
            {loading ? "Отправляем..." : "Отправить на проверку"}
          </button>
        </form>
      </div>
    </div>
  );
}