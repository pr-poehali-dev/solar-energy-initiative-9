const mockPoints = [
  { id: 1, top: "30%", left: "25%", type: "easy", label: "Набережная" },
  { id: 2, top: "45%", left: "55%", type: "hard", label: "Ул. Горького" },
  { id: 3, top: "60%", left: "35%", type: "blocked", label: "Рынок" },
  { id: 4, top: "25%", left: "65%", type: "historic", label: "Центральный парк" },
  { id: 5, top: "70%", left: "70%", type: "easy", label: "Пр. Революции" },
];

const colorMap: Record<string, string> = {
  easy: "#22c55e",
  hard: "#eab308",
  blocked: "#ef4444",
  historic: "#3b82f6",
  park: "#16a34a",
};

const legend = [
  { color: "#22c55e", label: "Легко" },
  { color: "#eab308", label: "Сложно" },
  { color: "#ef4444", label: "Непроходимо" },
  { color: "#3b82f6", label: "Историческое" },
  { color: "#16a34a", label: "Парк" },
];

export default function MapPreview() {
  return (
    <div id="map" className="min-h-screen bg-white px-6 py-24">
      <div className="max-w-5xl mx-auto">
        <h3 className="uppercase text-sm tracking-widest text-neutral-500 mb-4">Публичная карта</h3>
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-10">
          <h2 className="text-3xl lg:text-5xl font-bold text-neutral-900 leading-tight">
            Подтверждённые<br />места на карте
          </h2>
          <p className="text-neutral-500 text-sm max-w-xs lg:text-right">
            Отображаются только проверенные точки. Анапа, 2024.
          </p>
        </div>

        {/* Map mockup */}
        <div className="relative w-full h-[480px] bg-neutral-100 overflow-hidden border border-neutral-200">
          {/* Grid lines */}
          <div
            className="absolute inset-0 opacity-30"
            style={{
              backgroundImage:
                "repeating-linear-gradient(0deg, #ccc 0, #ccc 1px, transparent 1px, transparent 60px), repeating-linear-gradient(90deg, #ccc 0, #ccc 1px, transparent 1px, transparent 60px)",
            }}
          />

          {/* Roads */}
          <div className="absolute top-[40%] left-0 right-0 h-[2px] bg-neutral-300 opacity-60" />
          <div className="absolute top-[65%] left-0 right-0 h-[2px] bg-neutral-300 opacity-60" />
          <div className="absolute top-0 bottom-0 left-[40%] w-[2px] bg-neutral-300 opacity-60" />
          <div className="absolute top-0 bottom-0 left-[70%] w-[2px] bg-neutral-300 opacity-60" />

          {/* Water */}
          <div className="absolute bottom-0 left-0 right-0 h-[15%] bg-blue-100 opacity-60 flex items-center justify-center">
            <span className="text-blue-400 text-xs uppercase tracking-widest">Чёрное море</span>
          </div>

          {/* Points */}
          {mockPoints.map((p) => (
            <div
              key={p.id}
              className="absolute -translate-x-1/2 -translate-y-1/2 group cursor-pointer"
              style={{ top: p.top, left: p.left }}
            >
              <div
                className="w-4 h-4 rounded-full border-2 border-white shadow-md transition-transform group-hover:scale-125"
                style={{ backgroundColor: colorMap[p.type] }}
              />
              <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-neutral-900 text-white text-xs px-2 py-1 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                {p.label}
              </div>
            </div>
          ))}

          {/* Badge */}
          <div className="absolute top-4 left-4 bg-white border border-neutral-200 px-3 py-1.5 text-xs text-neutral-600 shadow-sm">
            Демо-режим · {mockPoints.length} точек
          </div>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap gap-6 mt-6">
          {legend.map((l) => (
            <div key={l.label} className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded-full border border-white shadow-sm"
                style={{ backgroundColor: l.color }}
              />
              <span className="text-sm text-neutral-600">{l.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
