const steps = [
  {
    num: "01",
    title: "Выходишь на улицу",
    desc: "Открываешь форму прямо на телефоне и нажимаешь «Определить моё местоположение».",
  },
  {
    num: "02",
    title: "Описываешь место",
    desc: "Выбираешь тип покрытия, отмечаешь особенности и делаешь фото — всё за 2 минуты.",
  },
  {
    num: "03",
    title: "Данные проходят модерацию",
    desc: "Администратор проверяет информацию и подтверждает точку. Фейки не проходят.",
  },
  {
    num: "04",
    title: "Точка появляется на карте",
    desc: "Подтверждённые места видны всем. Зелёные — проходимо, жёлтые — сложно, красные — нельзя.",
  },
];

export default function Featured() {
  return (
    <div id="how" className="min-h-screen px-6 py-24 bg-white flex flex-col justify-center">
      <div className="max-w-5xl mx-auto w-full">
        <h3 className="uppercase mb-4 text-sm tracking-widest text-neutral-500">Как это работает</h3>
        <p className="text-3xl lg:text-5xl mb-16 text-neutral-900 leading-tight font-bold max-w-2xl">
          Четыре шага — и город стал чуть доступнее.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {steps.map((s) => (
            <div key={s.num} className="flex gap-6">
              <div className="text-4xl font-bold text-neutral-200 leading-none shrink-0">{s.num}</div>
              <div>
                <h4 className="text-lg font-semibold text-neutral-900 mb-2">{s.title}</h4>
                <p className="text-neutral-600 leading-relaxed">{s.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}