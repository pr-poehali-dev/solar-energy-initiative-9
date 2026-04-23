import { useState, useEffect, useCallback } from "react";
import Icon from "@/components/ui/icon";
import func2url from "../../backend/func2url.json";
import AdminLogin from "@/components/admin/AdminLogin";
import AdminReportsTab, { Report } from "@/components/admin/AdminReportsTab";
import AdminVideosTab, { VideoItem, VideoForm } from "@/components/admin/AdminVideosTab";
import AdminPlacesTab from "@/components/admin/AdminPlacesTab";

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

  // Tab: "reports" | "videos" | "places" | "support"
  const [activeTab, setActiveTab] = useState<"reports" | "videos" | "places" | "support">("reports");

  // Support
  const [tickets, setTickets] = useState<{id: number; name: string; email: string | null; status: string; created_at: string; msg_count: number; last_msg: string | null}[]>([]);
  const [activeTicket, setActiveTicket] = useState<number | null>(null);
  const [messages, setMessages] = useState<{id: number; sender: string; text: string; created_at: string}[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [chatSending, setChatSending] = useState(false);

  // Videos
  const [videos, setVideos] = useState<VideoItem[]>([]);
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
    const res = await fetch(func2url["get-reports"], {
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
    await fetch(func2url["get-reports"], {
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

  const fetchTickets = useCallback(async () => {
    const res = await fetch(`${func2url["places"]}?type=support`, {
      headers: { "X-Admin-Token": token },
    });
    const raw = await res.json();
    const data = typeof raw === "string" ? JSON.parse(raw) : raw;
    setTickets(data.tickets || []);
  }, [token]);

  const fetchMessages = useCallback(async (ticketId: number) => {
    const res = await fetch(`${func2url["places"]}?type=support&ticket_id=${ticketId}`, {
      headers: { "X-Admin-Token": token },
    });
    const raw = await res.json();
    const data = typeof raw === "string" ? JSON.parse(raw) : raw;
    setMessages(data.messages || []);
  }, [token]);

  const openTicket = (id: number) => {
    setActiveTicket(id);
    fetchMessages(id);
  };

  const sendChatMessage = async () => {
    if (!chatInput.trim() || !activeTicket) return;
    setChatSending(true);
    await fetch(`${func2url["places"]}?type=support`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-Admin-Token": token },
      body: JSON.stringify({ ticket_id: activeTicket, text: chatInput.trim() }),
    });
    setChatInput("");
    await fetchMessages(activeTicket);
    await fetchTickets();
    setChatSending(false);
  };

  useEffect(() => {
    if (token) fetchTickets();
  }, [token, fetchTickets]);

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

  const toggleProblem = async (id: number, value: boolean) => {
    await fetch(func2url["get-reports"], {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-Admin-Token": token },
      body: JSON.stringify({ id, is_problem: value }),
    });
    await fetchReports(token);
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
        <div className="flex gap-2 mb-8 flex-wrap">
          <button
            onClick={() => setActiveTab("reports")}
            className={`px-4 py-2 text-sm font-medium transition-colors ${activeTab === "reports" ? "bg-neutral-900 text-white" : "bg-white border border-neutral-200 text-neutral-600 hover:border-neutral-400"}`}
          >
            <Icon name="ClipboardList" size={14} className="inline mr-1.5" />
            Заявки
          </button>
          <button
            onClick={() => setActiveTab("places")}
            className={`px-4 py-2 text-sm font-medium transition-colors ${activeTab === "places" ? "bg-neutral-900 text-white" : "bg-white border border-neutral-200 text-neutral-600 hover:border-neutral-400"}`}
          >
            <Icon name="MapPin" size={14} className="inline mr-1.5" />
            Карта доступности
          </button>
          <button
            onClick={() => setActiveTab("videos")}
            className={`px-4 py-2 text-sm font-medium transition-colors ${activeTab === "videos" ? "bg-neutral-900 text-white" : "bg-white border border-neutral-200 text-neutral-600 hover:border-neutral-400"}`}
          >
            <Icon name="Video" size={14} className="inline mr-1.5" />
            Интервью · {videos.length}
          </button>
          <button
            onClick={() => setActiveTab("support")}
            className={`px-4 py-2 text-sm font-medium transition-colors ${activeTab === "support" ? "bg-neutral-900 text-white" : "bg-white border border-neutral-200 text-neutral-600 hover:border-neutral-400"}`}
          >
            <Icon name="MessageCircle" size={14} className="inline mr-1.5" />
            Поддержка · {tickets.filter(t => t.status === "new").length}
          </button>
        </div>

        {activeTab === "videos" && (
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

        {activeTab === "places" && (
          <AdminPlacesTab token={token} />
        )}

        {activeTab === "support" && (
          <div className="flex gap-4 h-[calc(100vh-220px)] min-h-[500px]">
            {/* Список обращений */}
            <div className="w-72 shrink-0 flex flex-col border border-neutral-200 bg-white overflow-hidden">
              <div className="px-4 py-3 border-b border-neutral-100 text-xs uppercase tracking-widest text-neutral-400 font-medium">
                Обращения · {tickets.length}
              </div>
              <div className="flex-1 overflow-y-auto">
                {tickets.length === 0 && (
                  <p className="text-neutral-400 text-sm p-4">Обращений пока нет</p>
                )}
                {tickets.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => openTicket(t.id)}
                    className={`w-full text-left px-4 py-3 border-b border-neutral-100 hover:bg-neutral-50 transition-colors ${activeTicket === t.id ? "bg-neutral-50 border-l-2 border-l-neutral-900" : ""}`}
                  >
                    <div className="flex items-center justify-between gap-2 mb-0.5">
                      <span className="font-medium text-sm truncate">{t.name}</span>
                      {t.status === "new" && (
                        <span className="w-2 h-2 rounded-full bg-neutral-900 shrink-0" />
                      )}
                    </div>
                    {t.last_msg && (
                      <p className="text-xs text-neutral-400 truncate">{t.last_msg}</p>
                    )}
                    <p className="text-xs text-neutral-300 mt-0.5">
                      {new Date(t.created_at).toLocaleDateString("ru-RU")}
                    </p>
                  </button>
                ))}
              </div>
            </div>

            {/* Чат */}
            <div className="flex-1 flex flex-col border border-neutral-200 bg-white overflow-hidden">
              {!activeTicket ? (
                <div className="flex-1 flex items-center justify-center text-neutral-300">
                  <div className="text-center">
                    <Icon name="MessageCircle" size={40} className="mx-auto mb-2 opacity-30" />
                    <p className="text-sm">Выберите обращение слева</p>
                  </div>
                </div>
              ) : (
                <>
                  {/* Шапка чата */}
                  <div className="px-5 py-3 border-b border-neutral-100 flex items-center justify-between">
                    <div>
                      <p className="font-medium text-sm">{tickets.find(t => t.id === activeTicket)?.name}</p>
                      {tickets.find(t => t.id === activeTicket)?.email && (
                        <p className="text-xs text-neutral-400">{tickets.find(t => t.id === activeTicket)?.email}</p>
                      )}
                    </div>
                    <span className={`text-xs px-2 py-0.5 font-medium ${tickets.find(t => t.id === activeTicket)?.status === "new" ? "bg-neutral-900 text-white" : "bg-green-100 text-green-700"}`}>
                      {tickets.find(t => t.id === activeTicket)?.status === "new" ? "Новое" : "Отвечено"}
                    </span>
                  </div>

                  {/* Сообщения */}
                  <div className="flex-1 overflow-y-auto p-5 space-y-3">
                    {messages.map((m) => (
                      <div key={m.id} className={`flex ${m.sender === "admin" ? "justify-end" : "justify-start"}`}>
                        <div className={`max-w-[75%] px-4 py-2.5 text-sm rounded-sm ${m.sender === "admin" ? "bg-neutral-900 text-white" : "bg-neutral-100 text-neutral-800"}`}>
                          <p className="whitespace-pre-wrap">{m.text}</p>
                          <p className={`text-xs mt-1 ${m.sender === "admin" ? "text-neutral-400" : "text-neutral-400"}`}>
                            {new Date(m.created_at).toLocaleTimeString("ru-RU", {hour: "2-digit", minute: "2-digit"})}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Поле ввода */}
                  <div className="border-t border-neutral-100 p-3 flex gap-2">
                    <textarea
                      className="flex-1 border border-neutral-200 p-2.5 text-sm resize-none focus:outline-none focus:border-neutral-900"
                      rows={2}
                      placeholder="Напишите ответ..."
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendChatMessage(); } }}
                    />
                    <button
                      onClick={sendChatMessage}
                      disabled={chatSending || !chatInput.trim()}
                      className="bg-neutral-900 text-white px-4 py-2 text-sm hover:bg-neutral-700 transition-colors disabled:opacity-40 flex items-center gap-1.5"
                    >
                      <Icon name="Send" size={14} />
                      {chatSending ? "..." : "Отправить"}
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {activeTab === "reports" && (
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
            onToggleProblem={toggleProblem}
          />
        )}

      </div>
    </div>
  );
}