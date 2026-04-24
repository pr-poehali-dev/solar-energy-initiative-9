export default function Promo() {
  return (
    <div className="relative flex items-center justify-center h-screen overflow-hidden">
      <div className="absolute inset-0 w-full h-full">
        <img
          src="/images/spiral-circles.jpg"
          alt="Abstract spiral circles"
          className="w-full h-full object-cover"
          loading="lazy"
          decoding="async"
        />
      </div>

      <div className="absolute inset-0 bg-black/50 z-[1]" />
      <h3 className="absolute top-12 left-6 text-white uppercase z-10 text-sm md:text-base lg:text-lg tracking-widest">
        Цель проекта
      </h3>

      <div className="absolute bottom-12 left-6 right-6 z-10 max-w-xs sm:max-w-md md:max-w-lg lg:max-w-2xl">
        <p className="text-white text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl leading-tight font-light mb-4">
          Собираем данные сегодня — чтобы завтра построить навигатор для людей с инвалидностью в Анапе и по всей России.
        </p>
        <p className="text-white/60 text-sm sm:text-base leading-relaxed max-w-xl mb-6">
          Каждая отмеченная точка ляжет в основу первого в России навигатора, который прокладывает маршруты только по доступным улицам — в обход лестниц, крутых пандусов и разбитых тротуаров. Чем больше мест отмечено, тем точнее маршрут.
        </p>
        <div className="flex items-center gap-3 text-white/40 text-xs uppercase tracking-widest">
          <span className="w-8 h-px bg-white/40" />
          Это возможно только вместе
        </div>
      </div>
    </div>
  );
}