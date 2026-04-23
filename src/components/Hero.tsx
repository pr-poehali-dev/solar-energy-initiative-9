import { useScroll, useTransform, motion } from "framer-motion";
import { useRef, useEffect, useState } from "react";
import func2url from "../../backend/func2url.json";

export default function Hero({ onReportClick }: { onReportClick?: () => void }) {
  const [count, setCount] = useState<number | null>(null);
  const [displayed, setDisplayed] = useState(0);

  useEffect(() => {
    fetch(func2url["get-reports"])
      .then((r) => r.json())
      .then((data) => {
        const parsed = typeof data === "string" ? JSON.parse(data) : data;
        setCount(parsed.total ?? 0);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (count === null) return;
    if (count === 0) { setDisplayed(0); return; }
    const step = Math.ceil(count / 40);
    let cur = 0;
    const timer = setInterval(() => {
      cur = Math.min(cur + step, count);
      setDisplayed(cur);
      if (cur >= count) clearInterval(timer);
    }, 30);
    return () => clearInterval(timer);
  }, [count]);

  const container = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: container,
    offset: ["start start", "end start"],
  });
  const y = useTransform(scrollYProgress, [0, 1], ["0vh", "50vh"]);

  return (
    <div
      ref={container}
      className="relative flex items-center justify-center h-screen overflow-hidden"
    >
      <motion.div
        style={{ y }}
        className="absolute inset-0 w-full h-full"
      >
        <img
          src="/images/mountain-landscape.jpg"
          alt="Mountain landscape"
          className="w-full h-full object-cover"
        />
      </motion.div>

      <div className="absolute inset-0 bg-black/40 z-[1]" />
      <div className="relative z-10 text-center text-white px-6">
        <div className="inline-block bg-white/10 backdrop-blur-sm border border-white/20 text-white text-xs uppercase tracking-widest px-4 py-2 mb-8 rounded-sm">
          Бета-версия · Анапа
        </div>
        <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight mb-6 leading-tight">
          КАРТА<br/>ДОСТУПНОСТИ
        </h1>
        <p className="text-lg md:text-xl max-w-2xl mx-auto opacity-90 mb-10">
          Вместе создаём базу данных проходимых маршрутов для людей с инвалидностью. Отметь место рядом — помоги другим.
        </p>
        {count !== null && (
          <div className="inline-flex items-center gap-3 bg-white/10 backdrop-blur-sm border border-white/20 px-6 py-3 mb-8 rounded-sm">
            {count === 0 ? (
              <span className="text-sm opacity-80">Будьте первым, кто отметит место</span>
            ) : (
              <>
                <span className="text-3xl font-bold tabular-nums">{displayed}</span>
                <span className="text-sm opacity-80 text-left leading-tight">
                  мест уже<br/>подтверждено
                </span>
              </>
            )}
          </div>
        )}

        <div>
          <button
            onClick={onReportClick}
            className="text-white text-sm font-bold uppercase tracking-widest px-8 py-4 rounded-xl transition-all"
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
        </div>
      </div>
    </div>
  );
}