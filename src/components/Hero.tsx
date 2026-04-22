import { useScroll, useTransform, motion } from "framer-motion";
import { useRef } from "react";

export default function Hero() {
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
        <a
          href="#report"
          className="inline-block bg-white text-black text-sm uppercase tracking-widest px-8 py-4 font-semibold hover:bg-neutral-200 transition-colors duration-300"
        >
          Отметить место
        </a>
      </div>
    </div>
  );
}