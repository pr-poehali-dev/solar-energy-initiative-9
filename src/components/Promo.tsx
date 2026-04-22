import { useScroll, useTransform, motion } from "framer-motion";
import { useRef } from "react";

export default function Promo() {
  const container = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: container,
    offset: ["start end", "end start"],
  });
  const y = useTransform(scrollYProgress, [0, 1], ["-10vh", "10vh"]);

  return (
    <div
      ref={container}
      className="relative flex items-center justify-center h-screen overflow-hidden"
      style={{ clipPath: "polygon(0% 0, 100% 0%, 100% 100%, 0 100%)" }}
    >
      <div className="fixed top-[-10vh] left-0 h-[120vh] w-full">
        <motion.div style={{ y }} className="relative w-full h-full">
          <img
            src="/images/spiral-circles.jpg"
            alt="Abstract spiral circles"
            className="w-full h-full object-cover"
          />
        </motion.div>
      </div>

      <div className="absolute inset-0 bg-black/50 z-[1]" />
      <h3 className="absolute top-12 left-6 text-white uppercase z-10 text-sm md:text-base lg:text-lg tracking-widest">
        Цель проекта
      </h3>

      <div className="absolute bottom-12 left-6 right-6 z-10 max-w-xs sm:max-w-md md:max-w-lg lg:max-w-2xl">
        <p className="text-white text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl leading-tight font-light mb-6">
          Каждая точка на карте — шаг к умному навигатору
        </p>
        <p className="text-white/70 text-sm sm:text-base md:text-lg leading-relaxed max-w-xl">
          Собранные данные лягут в основу первого в России навигатора для людей с ограниченными возможностями. Он будет прокладывать маршруты только по доступным улицам — в обход лестниц, крутых пандусов и разбитых тротуаров. Чем больше мест отмечено, тем точнее маршрут.
        </p>
        <div className="mt-6 flex items-center gap-3 text-white/40 text-xs uppercase tracking-widest">
          <span className="w-8 h-px bg-white/40" />
          Это возможно только вместе
        </div>
      </div>
    </div>
  );
}