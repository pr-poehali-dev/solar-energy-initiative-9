interface HeaderProps {
  className?: string;
}

export default function Header({ className }: HeaderProps) {
  return (
    <header className={`absolute top-0 left-0 right-0 z-10 p-6 ${className ?? ""}`}>
      <div className="flex justify-between items-center">
        <div className="text-white text-sm uppercase tracking-widest font-bold">НДЛСВ</div>
        <nav className="flex gap-8">
          <a
            href="#how"
            className="text-white hover:text-neutral-300 transition-colors duration-300 uppercase text-sm"
          >
            Как это работает
          </a>
          <a
            href="#report"
            className="text-white hover:text-neutral-300 transition-colors duration-300 uppercase text-sm"
          >
            Сообщить о месте
          </a>
        </nav>
      </div>
    </header>
  );
}