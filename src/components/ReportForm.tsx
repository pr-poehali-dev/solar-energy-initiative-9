import { useState, useRef, useEffect } from "react";
import Icon from "@/components/ui/icon";
import func2url from "../../backend/func2url.json";
import ReportFormSuccess from "./ReportFormSuccess";
import ReportLocationField from "./ReportLocationField";
import ReportDetailsFields from "./ReportDetailsFields";

const DRAFT_KEY = "ndlsv_report_draft";

function loadDraft() {
  try {
    const raw = localStorage.getItem(DRAFT_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (e) { void e; return null; }
}

function saveDraft(data: object) {
  try { localStorage.setItem(DRAFT_KEY, JSON.stringify(data)); } catch (e) { void e; }
}

function clearDraft() {
  try { localStorage.removeItem(DRAFT_KEY); } catch (e) { void e; }
}

interface ReportFormProps {
  onSuccess?: () => void;
}

export default function ReportForm({ onSuccess }: ReportFormProps) {
  const draft = loadDraft();

  const [accessibility, setAccessibility] = useState(draft?.accessibility ?? "");
  const [placeType, setPlaceType] = useState(draft?.placeType ?? "");
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>(draft?.selectedFeatures ?? []);
  const [comment, setComment] = useState(draft?.comment ?? "");
  const [submitterName, setSubmitterName] = useState(draft?.submitterName ?? "");
  const [gpsStatus, setGpsStatus] = useState<"idle" | "loading" | "found" | "denied" | "error">("idle");
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [photo, setPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    saveDraft({ accessibility, placeType, selectedFeatures, comment, submitterName });
  }, [accessibility, placeType, selectedFeatures, comment, submitterName]);

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPhoto(file);
    setPhotoPreview(URL.createObjectURL(file));
  };

  const handlePhotoClear = () => {
    setPhoto(null);
    setPhotoPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
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

  const compressImage = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      const url = URL.createObjectURL(file);
      img.onload = () => {
        URL.revokeObjectURL(url);
        const MAX = 1280;
        let { width, height } = img;
        if (width > MAX || height > MAX) {
          if (width > height) { height = Math.round(height * MAX / width); width = MAX; }
          else { width = Math.round(width * MAX / height); height = MAX; }
        }
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        canvas.getContext("2d")!.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL("image/jpeg", 0.8));
      };
      img.onerror = () => reject(new Error("Ошибка чтения изображения"));
      img.src = url;
    });
  };

  const uploadPhoto = async (file: File): Promise<string> => {
    const dataUrl = await compressImage(file);
    const res = await fetch(func2url["upload-photo"], {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ data: dataUrl, content_type: "image/jpeg" }),
    });
    const json = await res.json();
    const parsed = typeof json === "string" ? JSON.parse(json) : json;
    if (!parsed.url) throw new Error("Нет URL");
    return parsed.url;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!coords) {
      setError("Пожалуйста, определите местоположение");
      return;
    }
    setLoading(true);
    setError("");
    try {
      let photoUrl = "";
      if (photo) {
        photoUrl = await uploadPhoto(photo);
      }

      const res = await fetch(func2url["submit-report"], {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          latitude: coords.lat,
          longitude: coords.lng,
          city: "Анапа",
          location_type: accessibility,
          place_type: placeType,
          features: selectedFeatures,
          comment,
          submitter_name: submitterName,
          photo_url: photoUrl,
          photo_metadata: {
            coordinates: `${coords.lat.toFixed(5)}, ${coords.lng.toFixed(5)}`,
            timestamp: new Date().toISOString(),
          },
        }),
      });
      if (!res.ok) throw new Error("Ошибка при отправке");
      clearDraft();
      setSubmitted(true);
      onSuccess?.();
    } catch {
      setError("Не удалось отправить заявку. Попробуйте ещё раз.");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    clearDraft();
    setSubmitted(false);
    setCoords(null);
    setGpsStatus("idle");
    setAccessibility("");
    setPlaceType("");
    setSelectedFeatures([]);
    setComment("");
    setSubmitterName("");
    setPhoto(null);
    setPhotoPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  if (submitted) {
    return <ReportFormSuccess onReset={resetForm} />;
  }

  return (
    <div className="px-6 py-8">
        <h3 className="uppercase text-sm tracking-widest text-neutral-500 mb-4">Форма сбора данных</h3>
        <h2 className="text-2xl font-bold text-neutral-900 mb-2 leading-tight">
          Сообщите о месте
        </h2>
        <p className="text-neutral-600 mb-4">
          Поля отмеченные * обязательны. Данные пройдут проверку перед публикацией на карте.
        </p>
        {draft && (submitterName || comment || accessibility) && (
          <div className="flex items-center gap-2 text-xs text-neutral-500 bg-neutral-100 border border-neutral-200 px-4 py-2 mb-8">
            <Icon name="RotateCcw" size={13} />
            Черновик восстановлен — продолжайте с того места, где остановились
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          <ReportLocationField
            gpsStatus={gpsStatus}
            coords={coords}
            onDetect={detectLocation}
            onCoordsChange={(c) => { setCoords(c); setGpsStatus("found"); }}
          />

          <ReportDetailsFields
            submitterName={submitterName}
            onSubmitterNameChange={setSubmitterName}
            photo={photo}
            photoPreview={photoPreview}
            onPhotoChange={handlePhotoChange}
            onPhotoClear={handlePhotoClear}
            fileInputRef={fileInputRef}
            accessibility={accessibility}
            onAccessibilityChange={setAccessibility}
            placeType={placeType}
            onPlaceTypeChange={setPlaceType}
            selectedFeatures={selectedFeatures}
            onToggleFeature={toggleFeature}
            comment={comment}
            onCommentChange={setComment}
          />

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
            {loading ? (photo ? "Загружаем фото и отправляем..." : "Отправляем...") : "Отправить на проверку"}
          </button>
        </form>
    </div>
  );
}