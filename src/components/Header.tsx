import { useState } from "react";
import { Link } from "react-router-dom";
import Icon from "@/components/ui/icon";

interface HeaderProps {
  className?: string;
}

const NAV_LINKS = [
  { href: "#how", label: "Как это работает" },
  { href: "#report", label: "Сообщить о месте" },
];

export default function Header({ className }: HeaderProps) {
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
          className="flex items-center gap-2 bg-red-600 hover:bg-red-700 transition-colors text-white text-xs font-bold uppercase tracking-wide px-4 py-2.5 rounded-sm"
        >
          <Icon name="Phone" size={13} />
          Помогите! Я застрял
        </a>

        {/* Бургер */}
        <div className="w-20 flex justify-end">
          <button
            onClick={() => setOpen((v) => !v)}
            className="text-white p-1"
            aria-label={open ? "Закрыть меню" : "Открыть меню"}
          >
            <Icon name={open ? "X" : "Menu"} size={24} />
          </button>
        </div>
      </div>

      {/* Dropdown меню */}
      {open && (
        <div className="mt-4 bg-black/80 backdrop-blur-sm border border-white/10 rounded-sm">
          {NAV_LINKS.map((l) => (
            <a
              key={l.href}
              href={l.href}
              onClick={close}
              className="block px-6 py-4 text-white uppercase text-sm tracking-wide hover:bg-white/10 transition-colors border-b border-white/10"
            >
              {l.label}
            </a>
          ))}
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