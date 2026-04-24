import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Icon from "@/components/ui/icon";
import func2url from "../../backend/func2url.json";

interface Video {
  id: number;
  title: string;
  description: string;
  video_url: string;
  created_at: string;
}

function VideoEmbed({ url }: { url: string }) {
  const getEmbed = (raw: string) => {
    // YouTube
    const yt = raw.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/))([a-zA-Z0-9_-]{11})/);
    if (yt) return `https://www.youtube.com/embed/${yt[1]}`;
    // VK video
    const vk = raw.match(/vk\.com\/video(-?\d+_\d+)/);
    if (vk) return `https://vk.com/video_ext.php?oid=${vk[1].split("_")[0]}&id=${vk[1].split("_")[1]}&hd=2`;
    // Rutube
    const rt = raw.match(/rutube\.ru\/video\/([a-f0-9]+)/);
    if (rt) return `https://rutube.ru/play/embed/${rt[1]}`;
    return null;
  };

  const embed = getEmbed(url);

  if (embed) {
    return (
      <iframe
        src={embed}
        className="w-full aspect-video"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        loading="lazy"
      />
    );
  }

  return (
    <a
      href={url}
      target="_blank"
      rel="noreferrer"
      className="flex items-center justify-center w-full aspect-video bg-neutral-100 hover:bg-neutral-200 transition-colors gap-3 text-neutral-600"
    >
      <Icon name="ExternalLink" size={20} />
      <span className="text-sm font-medium">Смотреть видео</span>
    </a>
  );
}

export default function Stories() {
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(func2url["videos"])
      .then((r) => r.json())
      .then((data) => {
        const parsed = typeof data === "string" ? JSON.parse(data) : data;
        setVideos(parsed.videos || []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Header */}
      <div className="bg-neutral-900 text-white px-6 py-5 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
          <Icon name="ArrowLeft" size={18} />
          <span className="text-sm font-bold uppercase tracking-widest">НДЛСВ</span>
        </Link>
        <span className="text-neutral-400 text-sm hidden sm:block">Вся правда</span>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-16">
        <h3 className="uppercase text-sm tracking-widest text-neutral-500 mb-4">Интервью и репортажи</h3>
        <h1 className="text-3xl lg:text-5xl font-bold text-neutral-900 leading-tight mb-4">
          Вся правда
        </h1>
        <p className="text-neutral-600 mb-14 max-w-2xl">
          Живые истории людей с инвалидностью, репортажи с мест и интервью о том, каково это — жить в городе, который не приспособлен для тебя.
        </p>

        {loading && (
          <div className="flex items-center justify-center py-24 gap-3 text-neutral-400">
            <Icon name="Loader2" size={28} className="animate-spin" />
          </div>
        )}

        {!loading && videos.length === 0 && (
          <div className="text-center py-24 text-neutral-400">
            <Icon name="Video" size={40} className="mx-auto mb-4 opacity-30" />
            <p className="text-sm">Видео скоро появятся</p>
          </div>
        )}

        {!loading && videos.length > 0 && (
          <div className="space-y-14">
            {videos.map((v) => (
              <article key={v.id} className="bg-white border border-neutral-200">
                <VideoEmbed url={v.video_url} />
                <div className="p-6">
                  <h2 className="text-xl font-bold text-neutral-900 mb-2">{v.title}</h2>
                  {v.description && (
                    <p className="text-neutral-600 text-sm leading-relaxed">{v.description}</p>
                  )}
                  <p className="text-xs text-neutral-400 mt-4">
                    {new Date(v.created_at).toLocaleDateString("ru-RU", { day: "numeric", month: "long", year: "numeric" })}
                  </p>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}