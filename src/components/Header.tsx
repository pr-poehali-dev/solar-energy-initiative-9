import { useState } from "react";
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
      <div className="flex justify-between items-center">
        <div className="text-white text-sm uppercase tracking-widest font-bold">НДЛСВ</div>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-8">
          <a
            href="tel:112"
            className="flex items-center gap-2 bg-red-600 hover:bg-red-700 transition-colors text-white text-xs font-bold uppercase tracking-wide px-3 py-2 rounded-sm"
          >
            <Icon name="Phone" size={13} />
            Помогите! Я застрял
          </a>
          {NAV_LINKS.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="text-white hover:text-neutral-300 transition-colors duration-300 uppercase text-sm"
            >
              {l.label}
            </a>
          ))}
        </nav>

        {/* Mobile: SOS + burger */}
        <div className="md:hidden flex items-center gap-3">
          <a
            href="tel:112"
            className="flex items-center gap-1.5 bg-red-600 hover:bg-red-700 transition-colors text-white text-xs font-bold uppercase tracking-wide px-3 py-2 rounded-sm"
          >
            <Icon name="Phone" size={13} />
            112
          </a>
          <button
            onClick={() => setOpen((v) => !v)}
            className="text-white p-1"
            aria-label={open ? "Закрыть меню" : "Открыть меню"}
          >
            <Icon name={open ? "X" : "Menu"} size={24} />
          </button>
        </div>
      </div>

      {/* Mobile dropdown */}
      {open && (
        <div className="md:hidden mt-4 bg-black/80 backdrop-blur-sm border border-white/10 rounded-sm">
          {NAV_LINKS.map((l) => (
            <a
              key={l.href}
              href={l.href}
              onClick={close}
              className="block px-6 py-4 text-white uppercase text-sm tracking-wide hover:bg-white/10 transition-colors border-b border-white/10 last:border-0"
            >
              {l.label}
            </a>
          ))}
        </div>
      )}
    </header>
  );
}