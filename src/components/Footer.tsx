import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import func2url from "../../backend/func2url.json";
import Icon from "@/components/ui/icon";

const LS_KEY = "support_ticket_id";

interface Message {
  id: number;
  sender: string;
  text: string;
  created_at: string;
}

export default function Footer() {
  const [open, setOpen] = useState(false);
  const [ticketId, setTicketId] = useState<number | null>(() => {
    const v = localStorage.getItem(LS_KEY);
    return v ? Number(v) : null;
  });
  const [messages, setMessages] = useState<Message[]>([]);
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [chatText, setChatText] = useState("");
  const [sending, setSending] = useState(false);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [error, setError] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const fetchMessages = async (id: number) => {
    setLoadingMessages(true);
    try {
      const res = await fetch(`${func2url["places"]}?type=support&ticket_id=${id}`);
      if (res.ok) {
        const raw = await res.json();
        const data = typeof raw === "string" ? JSON.parse(raw) : raw;
        setMessages(data.messages || []);
      } else {
        localStorage.removeItem(LS_KEY);
        setTicketId(null);
      }
    } finally {
      setLoadingMessages(false);
    }
  };

  useEffect(() => {
    if (open && ticketId) {
      fetchMessages(ticketId);
    }
  }, [open, ticketId]);

  useEffect(() => {
    if (open && messages.length > 0) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, open]);

  const handleCreateTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!form.name.trim() || !form.message.trim()) {
      setError("Заполните имя и сообщение");
      return;
    }
    setSending(true);
    try {
      const res = await fetch(`${func2url["places"]}?type=support`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        const raw = await res.json();
        const data = typeof raw === "string" ? JSON.parse(raw) : raw;
        const newId = data.id;
        localStorage.setItem(LS_KEY, String(newId));
        setTicketId(newId);
        setForm({ name: "", email: "", message: "" });
        await fetchMessages(newId);
      } else {
        setError("Не удалось отправить. Попробуйте ещё раз.");
      }
    } catch {
      setError("Ошибка сети. Попробуйте ещё раз.");
    } finally {
      setSending(false);
    }
  };

  const handleSendMessage = async () => {
    if (!chatText.trim() || !ticketId) return;
    setSending(true);
    try {
      const res = await fetch(`${func2url["places"]}?type=support`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ticket_id: ticketId, text: chatText.trim() }),
      });
      if (res.ok) {
        setChatText("");
        await fetchMessages(ticketId);
      } else {
        setError("Не удалось отправить. Попробуйте ещё раз.");
      }
    } catch {
      setError("Ошибка сети.");
    } finally {
      setSending(false);
    }
  };

  const handleClose = () => {
    setOpen(false);
    setError("");
  };

  const handleNewTicket = () => {
    localStorage.removeItem(LS_KEY);
    setTicketId(null);
    setMessages([]);
    setError("");
  };

  const formatTime = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleString("ru-RU", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" });
  };

  return (
    <div
      className="relative h-[400px] sm:h-[600px] lg:h-[800px] max-h-[800px]"
      style={{ clipPath: "polygon(0% 0, 100% 0%, 100% 100%, 0 100%)" }}
    >
      <div className="relative h-[calc(100vh+400px)] sm:h-[calc(100vh+600px)] lg:h-[calc(100vh+800px)] -top-[100vh]">
        <div className="h-[400px] sm:h-[600px] lg:h-[800px] sticky top-[calc(100vh-400px)] sm:top-[calc(100vh-600px)] lg:top-[calc(100vh-800px)]">
          <div className="bg-neutral-900 py-4 sm:py-6 lg:py-8 px-4 sm:px-6 h-full w-full flex flex-col justify-between">
            <div className="flex shrink-0 gap-8 sm:gap-12 lg:gap-20 flex-wrap">
              <div className="flex flex-col gap-1 sm:gap-2">
                <h3 className="mb-1 sm:mb-2 uppercase text-neutral-400 text-xs sm:text-sm">Проект</h3>
                <a href="#how" className="text-white hover:text-neutral-400 transition-colors duration-300 text-sm sm:text-base">Как это работает</a>
                <a href="#report" className="text-white hover:text-neutral-400 transition-colors duration-300 text-sm sm:text-base">Сообщить о месте</a>
                <a href="#map" className="text-white hover:text-neutral-400 transition-colors duration-300 text-sm sm:text-base">Карта доступности</a>
                <button
                  onClick={() => { setOpen(true); setError(""); }}
                  className="text-left text-white hover:text-neutral-400 transition-colors duration-300 text-sm sm:text-base flex items-center gap-1.5 mt-1"
                >
                  <Icon name="MessageCircle" size={14} />
                  Поддержка
                  {ticketId && (
                    <span className="w-2 h-2 rounded-full bg-green-400 inline-block ml-1" title="Есть активный чат" />
                  )}
                </button>
              </div>
              <div className="flex flex-col gap-1 sm:gap-2">
                <h3 className="mb-1 sm:mb-2 uppercase text-neutral-400 text-xs sm:text-sm">Статусы точек</h3>
                <span className="text-green-400 text-sm sm:text-base">🟢 Легко проехать</span>
                <span className="text-blue-400 text-sm sm:text-base">🔵 Нейтрально</span>
                <span className="text-yellow-400 text-sm sm:text-base">🟡 Сложно, но можно</span>
                <span className="text-red-400 text-sm sm:text-base">🔴 Непроходимо</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 sm:gap-0">
              <div>
                <h1 className="text-[14vw] sm:text-[12vw] lg:text-[10vw] leading-[0.8] mt-4 sm:mt-6 lg:mt-10 text-white font-bold tracking-tight">
                  НДЛСВ
                </h1>
                <p className="text-neutral-500 text-xs mt-2 tracking-wide">
                  Создатель проекта — <span className="text-neutral-300">Шинакан Д.В.</span>
                </p>
              </div>
              <p className="text-neutral-400 text-sm sm:text-base">{new Date().getFullYear()} · Карта доступности городской среды · Бета</p>
            </div>
          </div>
        </div>
      </div>

      {open && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 px-4">
          <div className="bg-white w-full max-w-md relative flex flex-col" style={{ maxHeight: "90vh" }}>
            {/* Шапка */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-100">
              <div>
                <h2 className="text-base font-bold">
                  {ticketId ? "Переписка с поддержкой" : "Написать в поддержку"}
                </h2>
                {ticketId && (
                  <p className="text-xs text-neutral-400 mt-0.5">Обращение #{ticketId}</p>
                )}
              </div>
              <button onClick={handleClose} className="text-neutral-400 hover:text-neutral-900 p-1">
                <Icon name="X" size={20} />
              </button>
            </div>

            {ticketId ? (
              <>
                {/* Чат */}
                <div className="flex-1 overflow-y-auto px-6 py-4 space-y-3 min-h-[200px]">
                  {loadingMessages ? (
                    <div className="text-center text-neutral-400 text-sm py-8">Загрузка...</div>
                  ) : messages.length === 0 ? (
                    <div className="text-center text-neutral-400 text-sm py-8">Сообщений пока нет</div>
                  ) : (
                    messages.map((msg) => (
                      <div key={msg.id} className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}>
                        <div className={`max-w-[80%] px-3 py-2 text-sm ${msg.sender === "user" ? "bg-neutral-900 text-white" : "bg-neutral-100 text-neutral-900"}`}>
                          {msg.sender === "admin" && (
                            <p className="text-xs font-medium text-neutral-500 mb-1">Поддержка</p>
                          )}
                          <p className="whitespace-pre-wrap">{msg.text}</p>
                          <p className={`text-xs mt-1 ${msg.sender === "user" ? "text-neutral-400" : "text-neutral-400"}`}>
                            {formatTime(msg.created_at)}
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Поле ввода */}
                <div className="px-6 py-4 border-t border-neutral-100">
                  {error && <p className="text-red-500 text-sm mb-2">{error}</p>}
                  <div className="flex gap-2">
                    <textarea
                      value={chatText}
                      onChange={(e) => setChatText(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) handleSendMessage();
                      }}
                      rows={2}
                      className="flex-1 border border-neutral-200 p-2.5 text-sm focus:outline-none focus:border-neutral-900 resize-none"
                      placeholder="Ваш ответ... (Ctrl+Enter для отправки)"
                    />
                    <button
                      onClick={handleSendMessage}
                      disabled={sending || !chatText.trim()}
                      className="bg-neutral-900 text-white px-4 hover:bg-neutral-700 transition-colors disabled:opacity-40 flex items-center"
                    >
                      <Icon name="Send" size={16} />
                    </button>
                  </div>
                  <button
                    onClick={handleNewTicket}
                    className="mt-3 text-xs text-neutral-400 hover:text-neutral-700 transition-colors"
                  >
                    Создать новое обращение
                  </button>
                </div>
              </>
            ) : (
              /* Форма нового обращения */
              <div className="px-6 py-5">
                <p className="text-neutral-400 text-sm mb-5">Мы ответим на ваш вопрос в ближайшее время</p>
                <form onSubmit={handleCreateTicket} className="space-y-3">
                  <div>
                    <label className="block text-xs uppercase tracking-widest text-neutral-500 mb-1">Ваше имя *</label>
                    <input
                      type="text"
                      value={form.name}
                      onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                      className="w-full border border-neutral-200 p-2.5 text-sm focus:outline-none focus:border-neutral-900"
                      placeholder="Иван Иванов"
                    />
                  </div>
                  <div>
                    <label className="block text-xs uppercase tracking-widest text-neutral-500 mb-1">Email (необязательно)</label>
                    <input
                      type="email"
                      value={form.email}
                      onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                      className="w-full border border-neutral-200 p-2.5 text-sm focus:outline-none focus:border-neutral-900"
                      placeholder="email@example.com"
                    />
                  </div>
                  <div>
                    <label className="block text-xs uppercase tracking-widest text-neutral-500 mb-1">Сообщение *</label>
                    <textarea
                      value={form.message}
                      onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))}
                      rows={4}
                      className="w-full border border-neutral-200 p-2.5 text-sm focus:outline-none focus:border-neutral-900 resize-none"
                      placeholder="Опишите ваш вопрос или проблему..."
                    />
                  </div>
                  {error && <p className="text-red-500 text-sm">{error}</p>}
                  <button
                    type="submit"
                    disabled={sending}
                    className="w-full bg-neutral-900 text-white py-3 text-sm uppercase tracking-widest hover:bg-neutral-700 transition-colors disabled:opacity-50"
                  >
                    {sending ? "Отправляем..." : "Отправить"}
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
