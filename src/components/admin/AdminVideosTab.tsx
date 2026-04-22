import Icon from "@/components/ui/icon";

export interface VideoItem {
  id: number;
  title: string;
  description: string;
  video_url: string;
  published: boolean;
  created_at: string;
}

export interface VideoForm {
  id: number;
  title: string;
  description: string;
  video_url: string;
  published: boolean;
}

interface AdminVideosTabProps {
  videos: VideoItem[];
  videoForm: VideoForm;
  videoSaving: boolean;
  editingVideoId: number | null;
  onFormChange: (form: VideoForm) => void;
  onSave: () => void;
  onCancelEdit: () => void;
  onEdit: (v: VideoItem) => void;
  onDelete: (id: number) => void;
}

export default function AdminVideosTab({
  videos,
  videoForm,
  videoSaving,
  editingVideoId,
  onFormChange,
  onSave,
  onCancelEdit,
  onEdit,
  onDelete,
}: AdminVideosTabProps) {
  return (
    <div className="space-y-6">
      {/* Form */}
      <div className="bg-white border border-neutral-200 p-6">
        <h2 className="font-semibold text-neutral-900 text-sm uppercase tracking-wide mb-5">
          {editingVideoId ? "Редактировать видео" : "Добавить видео"}
        </h2>
        <div className="space-y-4">
          <div>
            <label className="block text-xs uppercase tracking-widest text-neutral-500 mb-1.5">Заголовок *</label>
            <input
              type="text"
              value={videoForm.title}
              onChange={(e) => onFormChange({ ...videoForm, title: e.target.value })}
              placeholder="Интервью с Александром, инвалид-колясочник"
              className="w-full border border-neutral-200 p-3 text-sm focus:outline-none focus:border-neutral-400"
            />
          </div>
          <div>
            <label className="block text-xs uppercase tracking-widest text-neutral-500 mb-1.5">
              Ссылка на видео * <span className="normal-case font-normal text-neutral-400">(YouTube, VK, Rutube)</span>
            </label>
            <input
              type="text"
              value={videoForm.video_url}
              onChange={(e) => onFormChange({ ...videoForm, video_url: e.target.value })}
              placeholder="https://youtu.be/..."
              className="w-full border border-neutral-200 p-3 text-sm focus:outline-none focus:border-neutral-400"
            />
          </div>
          <div>
            <label className="block text-xs uppercase tracking-widest text-neutral-500 mb-1.5">Описание</label>
            <textarea
              rows={3}
              value={videoForm.description}
              onChange={(e) => onFormChange({ ...videoForm, description: e.target.value })}
              placeholder="Краткое описание видео..."
              className="w-full border border-neutral-200 p-3 text-sm focus:outline-none focus:border-neutral-400 resize-none"
            />
          </div>
          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={videoForm.published}
                onChange={(e) => onFormChange({ ...videoForm, published: e.target.checked })}
                className="accent-black w-4 h-4"
              />
              <span className="text-sm text-neutral-700">Опубликовать сразу</span>
            </label>
          </div>
          <div className="flex gap-2">
            <button
              onClick={onSave}
              disabled={videoSaving || !videoForm.title || !videoForm.video_url}
              className="flex items-center gap-2 bg-black text-white px-4 py-2 text-sm hover:bg-neutral-800 transition-colors disabled:opacity-40"
            >
              {videoSaving ? <Icon name="Loader2" size={14} className="animate-spin" /> : <Icon name="Save" size={14} />}
              {editingVideoId ? "Сохранить" : "Добавить"}
            </button>
            {editingVideoId && (
              <button
                onClick={onCancelEdit}
                className="px-4 py-2 text-sm border border-neutral-200 hover:bg-neutral-50 transition-colors"
              >
                Отмена
              </button>
            )}
          </div>
        </div>
      </div>

      {/* List */}
      {videos.length === 0 ? (
        <div className="text-center py-16 text-neutral-400 bg-white border border-neutral-200">
          <Icon name="Video" size={32} className="mx-auto mb-3 opacity-40" />
          <p className="text-sm">Видео ещё не добавлены</p>
        </div>
      ) : (
        <div className="bg-white border border-neutral-200 divide-y divide-neutral-100">
          {videos.map((v) => (
            <div key={v.id} className="px-6 py-4 flex items-start gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${v.published ? "bg-green-100 text-green-800" : "bg-neutral-100 text-neutral-600"}`}>
                    {v.published ? "Опубликовано" : "Скрыто"}
                  </span>
                  <span className="text-xs text-neutral-400">#{v.id}</span>
                </div>
                <p className="text-sm font-semibold text-neutral-900 mb-0.5">{v.title}</p>
                {v.description && <p className="text-xs text-neutral-500 line-clamp-1">{v.description}</p>}
                <p className="text-xs text-neutral-400 mt-1 truncate">{v.video_url}</p>
              </div>
              <div className="flex gap-2 shrink-0">
                <button onClick={() => onEdit(v)} className="text-xs text-neutral-500 hover:text-neutral-900 transition-colors flex items-center gap-1">
                  <Icon name="Pencil" size={12} /> Изменить
                </button>
                <button onClick={() => onDelete(v.id)} className="text-xs text-red-400 hover:text-red-600 transition-colors flex items-center gap-1">
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
