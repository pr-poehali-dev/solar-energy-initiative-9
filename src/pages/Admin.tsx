import { useState, useEffect, useCallback } from "react";
import Icon from "@/components/ui/icon";
import func2url from "../../backend/func2url.json";
import AdminLogin from "@/components/admin/AdminLogin";
import AdminReportsTab, { Report } from "@/components/admin/AdminReportsTab";
import AdminVideosTab, { VideoItem, VideoForm } from "@/components/admin/AdminVideosTab";

const ACCESSIBILITY_ORDER: Record<string, number> = {
  blocked: 0,
  hard: 1,
  neutral: 2,
  easy: 3,
};

export default function Admin() {
  const [password, setPassword] = useState("");
  const [token, setToken] = useState(() => sessionStorage.getItem("admin_token") || "");
  const [loginError, setLoginError] = useState("");
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState<"all" | "new" | "approved" | "rejected">("new");
  const [actionId, setActionId] = useState<number | null>(null);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [rejectTarget, setRejectTarget] = useState<number | null>(null);

  // Videos
  const [videos, setVideos] = useState<VideoItem[]>([]);
  const [videoTab, setVideoTab] = useState(false);
  const [videoForm, setVideoForm] = useState<VideoForm>({ id: 0, title: "", description: "", video_url: "", published: true });
  const [videoSaving, setVideoSaving] = useState(false);
  const [editingVideoId, setEditingVideoId] = useState<number | null>(null);

  const fetchReports = useCallback(async (tok: string) => {
    setLoading(true);
    try {
      const res = await fetch(`${func2url["get-reports"]}?admin=1`);
      const raw = await res.json();
      const data = typeof raw === "string" ? JSON.parse(raw) : raw;
      setReports(data.reports || []);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (token) fetchReports(token);
  }, [token, fetchReports]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError("");
    const res = await fetch(func2url["moderate-report"], {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-Admin-Token": password },
      body: JSON.stringify({ id: 0, status: "new" }),
    });
    if (res.status === 403) {
      setLoginError("Неверный пароль");
      return;
    }
    sessionStorage.setItem("admin_token", password);
    setToken(password);
  };

  const moderate = async (id: number, status: "approved" | "rejected", reason = "") => {
    setActionId(id);
    await fetch(func2url["moderate-report"], {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-Admin-Token": token },
      body: JSON.stringify({ id, status, reject_reason: reason }),
    });
    await fetchReports(token);
    setActionId(null);
    setRejectTarget(null);
    setRejectReason("");
  };

  const logout = () => {
    sessionStorage.removeItem("admin_token");
    setToken("");
    setPassword("");
  };

  const fetchVideos = useCallback(async () => {
    const res = await fetch(`${func2url["videos"]}?admin=1`);
    const raw = await res.json();
    const data = typeof raw === "string" ? JSON.parse(raw) : raw;
    setVideos(data.videos || []);
  }, []);

  useEffect(() => {
    if (token) fetchVideos();
  }, [token, fetchVideos]);

  const saveVideo = async () => {
    setVideoSaving(true);
    await fetch(func2url["videos"], {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-Admin-Token": token },
      body: JSON.stringify(videoForm),
    });
    await fetchVideos();
    setVideoForm({ id: 0, title: "", description: "", video_url: "", published: true });
    setEditingVideoId(null);
    setVideoSaving(false);
  };

  const deleteVideo = async (id: number) => {
    if (!confirm("Удалить это видео?")) return;
    await fetch(func2url["videos"], {
      method: "DELETE",
      headers: { "Content-Type": "application/json", "X-Admin-Token": token },
      body: JSON.stringify({ id }),
    });
    await fetchVideos();
  };

  const startEdit = (v: VideoItem) => {
    setVideoForm({ id: v.id, title: v.title, description: v.description, video_url: v.video_url, published: v.published });
    setEditingVideoId(v.id);
    setVideoTab(true);
  };

  const filtered = (filter === "all" ? reports : reports.filter((r) => r.status === filter))
    .slice()
    .sort((a, b) => (ACCESSIBILITY_ORDER[a.location_type] ?? 99) - (ACCESSIBILITY_ORDER[b.location_type] ?? 99));

  const counts = {
    all: reports.length,
    new: reports.filter((r) => r.status === "new").length,
    approved: reports.filter((r) => r.status === "approved").length,
    rejected: reports.filter((r) => r.status === "rejected").length,
  };

  if (!token) {
    return (
      <AdminLogin
        password={password}
        onPasswordChange={setPassword}
        onSubmit={handleLogin}
        error={loginError}
      />
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Header */}
      <div className="bg-neutral-900 text-white px-6 py-4 flex items-center justify-between">
        <div>
          <span className="font-bold tracking-widest text-sm uppercase">НДЛСВ</span>
          <span className="text-neutral-400 text-sm ml-3">Панель модерации</span>
        </div>
        <div className="flex items-center gap-4">
          <a href="/" className="text-neutral-400 hover:text-white text-xs uppercase tracking-wide transition-colors">
            На сайт
          </a>
          <button onClick={logout} className="text-neutral-400 hover:text-white text-xs uppercase tracking-wide transition-colors flex items-center gap-1">
            <Icon name="LogOut" size={14} /> Выйти
          </button>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-10">

        {/* Tab switcher */}
        <div className="flex gap-2 mb-8">
          <button
            onClick={() => setVideoTab(false)}
            className={`px-4 py-2 text-sm font-medium transition-colors ${!videoTab ? "bg-neutral-900 text-white" : "bg-white border border-neutral-200 text-neutral-600 hover:border-neutral-400"}`}
          >
            <Icon name="ClipboardList" size={14} className="inline mr-1.5" />
            Заявки
          </button>
          <button
            onClick={() => setVideoTab(true)}
            className={`px-4 py-2 text-sm font-medium transition-colors ${videoTab ? "bg-neutral-900 text-white" : "bg-white border border-neutral-200 text-neutral-600 hover:border-neutral-400"}`}
          >
            <Icon name="Video" size={14} className="inline mr-1.5" />
            Вся правда · {videos.length}
          </button>
        </div>

        {videoTab && (
          <AdminVideosTab
            videos={videos}
            videoForm={videoForm}
            videoSaving={videoSaving}
            editingVideoId={editingVideoId}
            onFormChange={setVideoForm}
            onSave={saveVideo}
            onCancelEdit={() => { setEditingVideoId(null); setVideoForm({ id: 0, title: "", description: "", video_url: "", published: true }); }}
            onEdit={startEdit}
            onDelete={deleteVideo}
          />
        )}

        {!videoTab && (
          <AdminReportsTab
            filtered={filtered}
            loading={loading}
            filter={filter}
            counts={counts}
            actionId={actionId}
            expandedId={expandedId}
            rejectTarget={rejectTarget}
            rejectReason={rejectReason}
            onFilterChange={setFilter}
            onRefresh={() => fetchReports(token)}
            onApprove={(id) => moderate(id, "approved")}
            onRejectTarget={setRejectTarget}
            onRejectConfirm={(id, reason) => moderate(id, "rejected", reason)}
            onRejectCancel={() => { setRejectTarget(null); setRejectReason(""); }}
            onRejectReasonChange={setRejectReason}
            onToggleExpand={(id) => setExpandedId(expandedId === id ? null : id)}
          />
        )}

      </div>
    </div>
  );
}
