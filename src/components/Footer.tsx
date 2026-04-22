export default function Footer() {
  return (
    <div
      className="relative h-[400px] sm:h-[600px] lg:h-[800px] max-h-[800px]"
      style={{ clipPath: "polygon(0% 0, 100% 0%, 100% 100%, 0 100%)" }}
    >
      <div className="relative h-[calc(100vh+400px)] sm:h-[calc(100vh+600px)] lg:h-[calc(100vh+800px)] -top-[100vh]">
        <div className="h-[400px] sm:h-[600px] lg:h-[800px] sticky top-[calc(100vh-400px)] sm:top-[calc(100vh-600px)] lg:top-[calc(100vh-800px)]">
          <div className="bg-neutral-900 py-4 sm:py-6 lg:py-8 px-4 sm:px-6 h-full w-full flex flex-col justify-between">
            <div className="flex flex-col lg:flex-row shrink-0 gap-8 lg:gap-20">
              <div className="flex gap-8 sm:gap-12 lg:gap-20">
                <div className="flex flex-col gap-1 sm:gap-2">
                  <h3 className="mb-1 sm:mb-2 uppercase text-neutral-400 text-xs sm:text-sm">Проект</h3>
                  <a href="#how" className="text-white hover:text-neutral-400 transition-colors duration-300 text-sm sm:text-base">Как это работает</a>
                  <a href="#report" className="text-white hover:text-neutral-400 transition-colors duration-300 text-sm sm:text-base">Сообщить о месте</a>
                  <a href="#map" className="text-white hover:text-neutral-400 transition-colors duration-300 text-sm sm:text-base">Карта доступности</a>
                </div>
                <div className="flex flex-col gap-1 sm:gap-2">
                  <h3 className="mb-1 sm:mb-2 uppercase text-neutral-400 text-xs sm:text-sm">Статусы точек</h3>
                  <span className="text-green-400 text-sm sm:text-base">🟢 Легко проехать</span>
                  <span className="text-blue-400 text-sm sm:text-base">🔵 Нейтрально</span>
                  <span className="text-yellow-400 text-sm sm:text-base">🟡 Сложно, но можно</span>
                  <span className="text-red-400 text-sm sm:text-base">🔴 Непроходимо</span>
                </div>
              </div>

              {/* Vision block */}
              <div className="lg:max-w-sm border-t border-neutral-700 lg:border-t-0 lg:border-l lg:border-neutral-700 pt-6 lg:pt-0 lg:pl-12">
                <h3 className="mb-3 uppercase text-neutral-400 text-xs sm:text-sm tracking-widest">Большая цель</h3>
                <p className="text-white text-lg sm:text-xl font-semibold leading-snug mb-3">
                  Каждая точка на карте — шаг к умному навигатору
                </p>
                <p className="text-neutral-400 text-sm leading-relaxed">
                  Собранные данные лягут в основу первого в России навигатора для людей с ограниченными возможностями. Он будет прокладывать маршруты только по доступным улицам — в обход лестниц, крутых пандусов и разбитых тротуаров. Чем больше мест отмечено, тем точнее маршрут.
                </p>
                <div className="mt-4 flex items-center gap-2 text-neutral-500 text-xs uppercase tracking-widest">
                  <span className="w-6 h-px bg-neutral-600" />
                  Это возможно только вместе
                </div>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 sm:gap-0">
              <h1 className="text-[14vw] sm:text-[12vw] lg:text-[10vw] leading-[0.8] mt-4 sm:mt-6 lg:mt-10 text-white font-bold tracking-tight">
                НДЛСВ
              </h1>
              <p className="text-neutral-400 text-sm sm:text-base">{new Date().getFullYear()} · Карта доступности городской среды · Бета</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}