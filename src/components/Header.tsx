import { useState } from "react";
import { Link } from "react-router-dom";
import Icon from "@/components/ui/icon";

interface HeaderProps {
  className?: string;
  onReportClick?: () => void;
}

export default function Header({ className, onReportClick }: HeaderProps) {
  const [open, setOpen] = useState(false);

  const close = () => setOpen(false);

  return (
    <header className={`absolute top-0 left-0 right-0 z-20 p-6 ${className ?? ""}`}>
      <div className="flex items-center justify-between">

        {/* Лого */}
        <div className="text-white text-sm uppercase tracking-widest font-bold w-20">НДЛСВ</div>

        {/* Центр — SOS кнопка строго по центру */}
        <a
          href="tel:112"
          className="flex items-center gap-2 bg-red-600 hover:bg-red-700 transition-colors text-white text-xs font-bold uppercase tracking-wide px-4 py-2.5 rounded-sm absolute left-1/2 -translate-x-1/2"
        >
          <Icon name="Phone" size={13} />
          Помогите! Я застрял
        </a>

        {/* Белая кнопка + Бургер */}
        <div className="flex items-center gap-3">
          <button
            onClick={onReportClick}
            className="hidden sm:inline-block text-white text-xs font-bold uppercase tracking-wide px-4 py-2.5 whitespace-nowrap rounded-xl transition-all"
            style={{
              background: "rgba(255,255,255,0.15)",
              backdropFilter: "blur(20px) saturate(180%)",
              WebkitBackdropFilter: "blur(20px) saturate(180%)",
              border: "1px solid rgba(255,255,255,0.3)",
              boxShadow: "inset 0 1px 0 rgba(255,255,255,0.25)",
            }}
          >
            Отметить место
          </button>
          <button
            onClick={() => setOpen((v) => !v)}
            className="text-white p-1"
            aria-label={open ? "Закрыть меню" : "Открыть меню"}
          >
            <Icon name={open ? "X" : "Menu"} size={24} />
          </button>
        </div>
      </div>

      {/* Оверлей для закрытия по клику вне меню */}
      {open && (
        <div className="fixed inset-0 z-[-1]" onClick={close} />
      )}

      {/* Dropdown меню */}
      {open && (
        <div className="mt-4 bg-black/80 backdrop-blur-sm border border-white/10 rounded-sm">
          <button
            onClick={() => { close(); onReportClick?.(); }}
            className="flex items-center gap-2 w-full text-left px-6 py-4 text-white font-bold uppercase text-sm tracking-wide hover:bg-white/10 transition-colors border-b border-white/10"
          >
            <Icon name="MapPin" size={14} />
            Отметить место
          </button>
          <a
            href="#how"
            onClick={close}
            className="block px-6 py-4 text-white uppercase text-sm tracking-wide hover:bg-white/10 transition-colors border-b border-white/10"
          >
            Как это работает
          </a>
          <Link
            to="/places"
            onClick={close}
            className="flex items-center gap-2 px-6 py-4 text-white uppercase text-sm tracking-wide hover:bg-white/10 transition-colors border-b border-white/10"
          >
            <Icon name="Star" size={14} />
            Карта доступности
          </Link>
          <Link
            to="/stories"
            onClick={close}
            className="flex items-center gap-2 px-6 py-4 text-white uppercase text-sm tracking-wide hover:bg-white/10 transition-colors border-b border-white/10"
          >
            <Icon name="Video" size={14} />
            Интервью
          </Link>
          <Link
            to="/problems"
            onClick={close}
            className="flex items-center gap-2 px-6 py-4 text-white uppercase text-sm tracking-wide hover:bg-white/10 transition-colors border-b border-white/10"
          >
            <Icon name="AlertTriangle" size={14} />
            Проблемные места
          </Link>
          <Link
            to="/documents"
            onClick={close}
            className="flex items-center gap-2 px-6 py-4 text-white uppercase text-sm tracking-wide hover:bg-white/10 transition-colors"
          >
            <Icon name="FileText" size={14} />
            Заявления
          </Link>
        </div>
      )}
    </header>
  );
}