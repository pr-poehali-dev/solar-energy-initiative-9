import { lazy, Suspense } from "react";
import Icon from "@/components/ui/icon";

const LocationPicker = lazy(() => import("./LocationPicker"));

type GpsStatus = "idle" | "loading" | "found" | "denied" | "error";

interface ReportLocationFieldProps {
  gpsStatus: GpsStatus;
  coords: { lat: number; lng: number } | null;
  onDetect: () => void;
  onCoordsChange: (c: { lat: number; lng: number }) => void;
}

const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
const isAndroid = /Android/.test(navigator.userAgent);

export default function ReportLocationField({
  gpsStatus,
  coords,
  onDetect,
  onCoordsChange,
}: ReportLocationFieldProps) {
  return (
    <div className="bg-white border border-neutral-200 p-6">
      <label className="block text-sm font-semibold uppercase tracking-wide text-neutral-700 mb-3">
        Местоположение *
      </label>
      <button
        type="button"
        onClick={gpsStatus === "denied" ? undefined : onDetect}
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
                { num: "1", text: 'Откройте приложение «Настройки» (серая шестерёнка)' },
                { num: "2", text: 'Прокрутите вниз → «Конфиденциальность» → «Службы геолокации»' },
                { num: "3", text: 'Найдите Safari или Chrome → выберите «При использовании»' },
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
                { num: "1", text: 'В браузере нажмите на значок 🔒 замка слева от адресной строки' },
                { num: "2", text: 'Выберите «Разрешения» → «Местоположение»' },
                { num: "3", text: 'Переключите на «Разрешить» и обновите страницу' },
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
              onClick={onDetect}
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
          onChange={(c) => { onCoordsChange(c); }}
        />
      </Suspense>
      {!coords && (
        <p className="text-xs text-neutral-400 mt-2 text-center">Нажмите на карту, чтобы поставить точку вручную</p>
      )}
    </div>
  );
}
