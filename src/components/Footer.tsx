import { useState } from "react";
import { createPortal } from "react-dom";
import func2url from "../../backend/func2url.json";
import Icon from "@/components/ui/icon";

export default function Footer() {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
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
        setSent(true);
        setForm({ name: "", email: "", message: "" });
      } else {
        setError("Не удалось отправить. Попробуйте ещё раз.");
      }
    } catch {
      setError("Ошибка сети. Попробуйте ещё раз.");
    } finally {
      setSending(false);
    }
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
                  onClick={() => { setOpen(true); setSent(false); setError(""); }}
                  className="text-left text-white hover:text-neutral-400 transition-colors duration-300 text-sm sm:text-base flex items-center gap-1.5 mt-1"
                >
                  <Icon name="MessageCircle" size={14} />
                  Поддержка
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
          <div className="bg-white w-full max-w-md p-6 relative">
            <button
              onClick={() => setOpen(false)}
              className="absolute top-4 right-4 text-neutral-400 hover:text-neutral-900 p-1"
            >
              <Icon name="X" size={20} />
            </button>
            <h2 className="text-lg font-bold mb-1">Написать в поддержку</h2>
            <p className="text-neutral-400 text-sm mb-5">Мы ответим на ваш вопрос в ближайшее время</p>

            {sent ? (
              <div className="text-center py-6">
                <Icon name="CheckCircle" size={40} className="mx-auto text-green-500 mb-3" />
                <p className="font-medium">Обращение отправлено!</p>
                <p className="text-neutral-400 text-sm mt-1">Мы скоро ответим вам.</p>
                <button
                  onClick={() => setOpen(false)}
                  className="mt-4 bg-neutral-900 text-white px-6 py-2 text-sm hover:bg-neutral-700 transition-colors"
                >
                  Закрыть
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-3">
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
            )}
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}