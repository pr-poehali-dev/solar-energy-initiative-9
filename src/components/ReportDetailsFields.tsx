import Icon from "@/components/ui/icon";

const accessibilityTypes = [
  { value: "easy", label: "🟢 Легко", description: "Ровный асфальт, пологий пандус" },
  { value: "neutral", label: "🔵 Нейтрально", description: "Проехать можно, но есть небольшие неудобства" },
  { value: "hard", label: "🟡 Сложно", description: "Щебень, бордюры, уклон" },
  { value: "blocked", label: "🔴 Непроходимо", description: "Лестница, глубокие ямы, нет пандуса" },
];

const placeTypes = [
  { value: "regular", label: "🏘️ Обычное место", description: "Улица, двор, магазин, остановка" },
  { value: "historic", label: "🏛️ Историческое / туристическое", description: "Достопримечательность, музей, памятник" },
  { value: "park", label: "🌳 Парк или зона отдыха", description: "Сквер, набережная, пляж" },
  { value: "medical", label: "🏥 Медицинское учреждение", description: "Больница, поликлиника, аптека" },
  { value: "transport", label: "🚌 Транспортный узел", description: "Остановка, вокзал, автостанция" },
];

const featuresList = [
  "Подходит для электроскутера",
  "Можно только с сопровождающим",
  "Есть парковка для инвалидов рядом",
  "Узкий проход",
];

interface ReportDetailsFieldsProps {
  submitterName: string;
  onSubmitterNameChange: (v: string) => void;
  photo: File | null;
  photoPreview: string | null;
  onPhotoChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onPhotoClear: () => void;
  fileInputRef: React.RefObject<HTMLInputElement>;
  accessibility: string;
  onAccessibilityChange: (v: string) => void;
  placeType: string;
  onPlaceTypeChange: (v: string) => void;
  selectedFeatures: string[];
  onToggleFeature: (f: string) => void;
  comment: string;
  onCommentChange: (v: string) => void;
}

export default function ReportDetailsFields({
  submitterName,
  onSubmitterNameChange,
  photo,
  photoPreview,
  onPhotoChange,
  onPhotoClear,
  fileInputRef,
  accessibility,
  onAccessibilityChange,
  placeType,
  onPlaceTypeChange,
  selectedFeatures,
  onToggleFeature,
  comment,
  onCommentChange,
}: ReportDetailsFieldsProps) {
  return (
    <>
      {/* Submitter name */}
      <div className="bg-white border border-neutral-200 p-6">
        <label className="block text-sm font-semibold uppercase tracking-wide text-neutral-700 mb-3">
          Ваше имя *
        </label>
        <input
          type="text"
          value={submitterName}
          onChange={(e) => onSubmitterNameChange(e.target.value)}
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
          onChange={onPhotoChange}
          className="hidden"
          id="photo-input"
          required
        />
        {photoPreview ? (
          <div className="relative">
            <img src={photoPreview} alt="Превью" className="w-full max-h-64 object-cover" />
            <button
              type="button"
              onClick={onPhotoClear}
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

      {/* Accessibility */}
      <div className="bg-white border border-neutral-200 p-6">
        <label className="block text-sm font-semibold uppercase tracking-wide text-neutral-700 mb-1">
          Доступность *
        </label>
        <p className="text-xs text-neutral-500 mb-3">Насколько это место проходимо для колясочника</p>
        <div className="space-y-2">
          {accessibilityTypes.map((t) => (
            <label
              key={t.value}
              className={`flex items-center gap-3 p-3 cursor-pointer border transition-colors ${
                accessibility === t.value
                  ? "border-neutral-900 bg-neutral-50"
                  : "border-transparent hover:border-neutral-200"
              }`}
            >
              <input
                type="radio"
                name="accessibility"
                value={t.value}
                checked={accessibility === t.value}
                onChange={() => onAccessibilityChange(t.value)}
                className="accent-black"
                required
              />
              <div>
                <span className="text-sm font-medium text-neutral-800">{t.label}</span>
                <span className="text-xs text-neutral-500 ml-2">{t.description}</span>
              </div>
            </label>
          ))}
        </div>
      </div>

      {/* Place type */}
      <div className="bg-white border border-neutral-200 p-6">
        <label className="block text-sm font-semibold uppercase tracking-wide text-neutral-700 mb-1">
          Тип места *
        </label>
        <p className="text-xs text-neutral-500 mb-3">Что это за место</p>
        <div className="space-y-2">
          {placeTypes.map((t) => (
            <label
              key={t.value}
              className={`flex items-center gap-3 p-3 cursor-pointer border transition-colors ${
                placeType === t.value
                  ? "border-neutral-900 bg-neutral-50"
                  : "border-transparent hover:border-neutral-200"
              }`}
            >
              <input
                type="radio"
                name="placeType"
                value={t.value}
                checked={placeType === t.value}
                onChange={() => onPlaceTypeChange(t.value)}
                className="accent-black"
                required
              />
              <div>
                <span className="text-sm font-medium text-neutral-800">{t.label}</span>
                <span className="text-xs text-neutral-500 ml-2">{t.description}</span>
              </div>
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
          {featuresList.map((f) => (
            <label
              key={f}
              className="flex items-center gap-3 p-3 cursor-pointer hover:bg-neutral-50 transition-colors"
            >
              <input
                type="checkbox"
                checked={selectedFeatures.includes(f)}
                onChange={() => onToggleFeature(f)}
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
          onChange={(e) => onCommentChange(e.target.value)}
          rows={4}
          placeholder="Например: с северной стороны есть пологий съезд, но он узкий..."
          className="w-full border border-neutral-200 p-3 text-sm text-neutral-800 placeholder-neutral-400 focus:outline-none focus:border-neutral-400 resize-none"
        />
      </div>
    </>
  );
}