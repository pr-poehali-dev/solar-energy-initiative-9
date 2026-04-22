import { useState } from "react";
import { Link } from "react-router-dom";
import Icon from "@/components/ui/icon";

interface Document {
  id: string;
  title: string;
  description: string;
  icon: string;
  tags: string[];
  recipient: string;
  template: (values: Record<string, string>) => string;
  fields: { key: string; label: string; placeholder: string; multiline?: boolean }[];
}

const documents: Document[] = [
  {
    id: "no-ramp",
    title: "Жалоба на отсутствие пандуса",
    description: "Для подачи в администрацию города или управляющую компанию, если у входа в здание нет пандуса",
    icon: "AlertTriangle",
    tags: ["Пандус", "Администрация", "УК"],
    recipient: "Главе администрации муниципального образования",
    fields: [
      { key: "fio", label: "Ваши ФИО", placeholder: "Иванов Иван Иванович" },
      { key: "address_applicant", label: "Ваш адрес", placeholder: "г. Анапа, ул. Ленина, д. 1, кв. 1" },
      { key: "address_object", label: "Адрес объекта (где нет пандуса)", placeholder: "г. Анапа, ул. Советская, д. 5" },
      { key: "object_name", label: "Название объекта", placeholder: "Магазин \"Продукты\", поликлиника №1 и т.д." },
      { key: "details", label: "Дополнительные подробности", placeholder: "Опишите ситуацию подробнее...", multiline: true },
    ],
    template: (v) => `ЗАЯВЛЕНИЕ

Главе администрации муниципального образования
город-курорт Анапа

от ${v.fio || "________________"},
проживающего(ей) по адресу:
${v.address_applicant || "________________"}

ЗАЯВЛЕНИЕ

Прошу принять меры по обеспечению доступной среды для маломобильных групп населения в соответствии с требованиями Федерального закона от 24.11.1995 № 181-ФЗ «О социальной защите инвалидов в Российской Федерации» и СП 59.13330.2020 «Доступность зданий и сооружений для маломобильных групп населения».

По адресу: ${v.address_object || "________________"}
Объект: ${v.object_name || "________________"}

отсутствует пандус или иное приспособление, обеспечивающее доступ маломобильных граждан (инвалидов-колясочников, пожилых людей, родителей с детскими колясками) к входу в здание.

${v.details ? `Дополнительно сообщаю: ${v.details}\n` : ""}
На основании изложенного прошу:
1. Провести проверку по данному факту.
2. Обязать ответственных лиц устранить нарушения в разумный срок.
3. Сообщить о принятых мерах по указанному адресу или на контактный телефон.

Дата: «___» ____________ ${new Date().getFullYear()} г.

Подпись: ________________ / ${v.fio || "________________"} /`,
  },
  {
    id: "steep-ramp",
    title: "Жалоба на крутой или неудобный пандус",
    description: "Если пандус есть, но слишком крутой, скользкий или не соответствует нормативам",
    icon: "TrendingUp",
    tags: ["Пандус", "Нарушение нормативов"],
    recipient: "Главе администрации / Роспотребнадзор",
    fields: [
      { key: "fio", label: "Ваши ФИО", placeholder: "Иванов Иван Иванович" },
      { key: "address_applicant", label: "Ваш адрес", placeholder: "г. Анапа, ул. Ленина, д. 1, кв. 1" },
      { key: "address_object", label: "Адрес объекта", placeholder: "г. Анапа, ул. Советская, д. 5" },
      { key: "object_name", label: "Название объекта", placeholder: "Магазин, поликлиника и т.д." },
      { key: "violation", label: "Описание нарушения", placeholder: "Уклон пандуса слишком большой, нет поручней, покрытие скользкое...", multiline: true },
    ],
    template: (v) => `ЗАЯВЛЕНИЕ

Главе администрации муниципального образования
город-курорт Анапа

от ${v.fio || "________________"},
проживающего(ей) по адресу:
${v.address_applicant || "________________"}

ЗАЯВЛЕНИЕ

В соответствии с СП 59.13330.2020 «Доступность зданий и сооружений для маломобильных групп населения» уклон пандуса не должен превышать 1:12 (8%), ширина должна быть не менее 0,9 м, пандус должен иметь поручни с обеих сторон и нескользящее покрытие.

По адресу: ${v.address_object || "________________"}
Объект: ${v.object_name || "________________"}

имеющийся пандус не соответствует установленным нормативным требованиям.

Описание нарушения: ${v.violation || "________________"}

Прошу:
1. Провести проверку соответствия пандуса требованиям СП 59.13330.2020.
2. Обязать ответственных лиц привести пандус в соответствие с нормативами.
3. Уведомить меня о результатах проверки.

Дата: «___» ____________ ${new Date().getFullYear()} г.

Подпись: ________________ / ${v.fio || "________________"} /`,
  },
  {
    id: "blocked-passage",
    title: "Жалоба на непроходимое место / препятствие",
    description: "Если на тротуаре, у перехода или в общественном месте есть препятствие для передвижения",
    icon: "XOctagon",
    tags: ["Тротуар", "Препятствие", "Дорога"],
    recipient: "Администрация / ГИБДД / УК",
    fields: [
      { key: "fio", label: "Ваши ФИО", placeholder: "Иванов Иван Иванович" },
      { key: "address_applicant", label: "Ваш адрес", placeholder: "г. Анапа, ул. Ленина, д. 1, кв. 1" },
      { key: "address_object", label: "Адрес проблемного места", placeholder: "г. Анапа, перекрёсток ул. Ленина и Советской" },
      { key: "obstacle", label: "Описание препятствия", placeholder: "Высокий бордюр у пешеходного перехода, яма, припаркованный автомобиль на тротуаре...", multiline: true },
    ],
    template: (v) => `ЗАЯВЛЕНИЕ

Главе администрации муниципального образования
город-курорт Анапа

от ${v.fio || "________________"},
проживающего(ей) по адресу:
${v.address_applicant || "________________"}

ЗАЯВЛЕНИЕ

Прошу принять меры по устранению препятствия, делающего невозможным или существенно затрудняющим передвижение маломобильных граждан в нарушение статьи 15 Федерального закона от 24.11.1995 № 181-ФЗ «О социальной защите инвалидов в Российской Федерации».

Местонахождение препятствия: ${v.address_object || "________________"}

Описание: ${v.obstacle || "________________"}

Данное препятствие лишает инвалидов-колясочников и иных маломобильных граждан возможности свободно передвигаться по указанному маршруту.

Прошу:
1. Провести проверку по данному факту.
2. Устранить препятствие в кратчайшие сроки.
3. Сообщить о принятых мерах.

Дата: «___» ____________ ${new Date().getFullYear()} г.

Подпись: ________________ / ${v.fio || "________________"} /`,
  },
  {
    id: "no-lowered-curb",
    title: "Жалоба на отсутствие съезда с тротуара",
    description: "Если у пешеходного перехода нет заниженного бордюра для проезда коляски",
    icon: "ArrowDownToLine",
    tags: ["Бордюр", "Переход", "Тротуар"],
    recipient: "Администрация / ГИБДД",
    fields: [
      { key: "fio", label: "Ваши ФИО", placeholder: "Иванов Иван Иванович" },
      { key: "address_applicant", label: "Ваш адрес", placeholder: "г. Анапа, ул. Ленина, д. 1, кв. 1" },
      { key: "address_object", label: "Адрес перехода", placeholder: "г. Анапа, пешеходный переход у д. 12 по ул. Ленина" },
      { key: "details", label: "Дополнительно", placeholder: "Высота бордюра примерно...", multiline: true },
    ],
    template: (v) => `ЗАЯВЛЕНИЕ

Главе администрации муниципального образования
город-курорт Анапа

от ${v.fio || "________________"},
проживающего(ей) по адресу:
${v.address_applicant || "________________"}

ЗАЯВЛЕНИЕ

В соответствии с ГОСТ Р 52289-2019 и СП 59.13330.2020 у пешеходных переходов должны быть обустроены заниженные бордюры (съезды) высотой не более 0,04 м для обеспечения доступности для маломобильных групп населения.

Адрес: ${v.address_object || "________________"}

У указанного пешеходного перехода отсутствует заниженный бордюр (съезд с тротуара), что делает переход недоступным для инвалидов-колясочников, родителей с детскими колясками и иных маломобильных граждан.

${v.details ? `Дополнительно: ${v.details}\n` : ""}
Прошу:
1. Обустроить заниженный бордюр у указанного пешеходного перехода.
2. Провести проверку аналогичных переходов в данном районе.
3. Уведомить меня о принятых мерах.

Дата: «___» ____________ ${new Date().getFullYear()} г.

Подпись: ________________ / ${v.fio || "________________"} /`,
  },
];

export default function Documents() {
  const [activeId, setActiveId] = useState<string | null>(null);
  const [values, setValues] = useState<Record<string, string>>({});

  const activeDoc = documents.find((d) => d.id === activeId);
  const preview = activeDoc ? activeDoc.template(values) : "";

  const download = () => {
    if (!activeDoc) return;
    const blob = new Blob([preview], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${activeDoc.id}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleOpen = (id: string) => {
    setActiveId(id);
    setValues({});
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleClose = () => {
    setActiveId(null);
    setValues({});
  };

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Header */}
      <div className="bg-neutral-900 text-white px-6 py-5 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
          <Icon name="ArrowLeft" size={18} />
          <span className="text-sm font-bold uppercase tracking-widest">НДЛСВ</span>
        </Link>
        <span className="text-neutral-400 text-sm hidden sm:block">Документы и заявления</span>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-16">

        {/* Title */}
        <h3 className="uppercase text-sm tracking-widest text-neutral-500 mb-4">Готовые шаблоны</h3>
        <h1 className="text-3xl lg:text-5xl font-bold text-neutral-900 leading-tight mb-4">
          Формы заявлений<br />и жалоб
        </h1>
        <p className="text-neutral-600 mb-12 max-w-2xl">
          Выберите нужный шаблон, заполните свои данные прямо здесь и скачайте готовое заявление. Распечатайте и подайте лично или отправьте через портал Госуслуги.
        </p>

        {/* Editor */}
        {activeDoc && (
          <div className="mb-12 bg-white border border-neutral-200">
            <div className="px-6 py-4 border-b border-neutral-100 flex items-center justify-between">
              <div>
                <h2 className="font-semibold text-neutral-900">{activeDoc.title}</h2>
                <p className="text-xs text-neutral-500 mt-0.5">Заполните поля — текст обновится автоматически</p>
              </div>
              <button onClick={handleClose} className="text-neutral-400 hover:text-neutral-900 transition-colors">
                <Icon name="X" size={20} />
              </button>
            </div>

            <div className="grid lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-neutral-100">
              {/* Fields */}
              <div className="p-6 space-y-4">
                {activeDoc.fields.map((f) => (
                  <div key={f.key}>
                    <label className="block text-xs font-semibold uppercase tracking-wide text-neutral-600 mb-1.5">
                      {f.label}
                    </label>
                    {f.multiline ? (
                      <textarea
                        rows={3}
                        placeholder={f.placeholder}
                        value={values[f.key] ?? ""}
                        onChange={(e) => setValues((v) => ({ ...v, [f.key]: e.target.value }))}
                        className="w-full border border-neutral-200 p-3 text-sm text-neutral-800 placeholder-neutral-400 focus:outline-none focus:border-neutral-400 resize-none"
                      />
                    ) : (
                      <input
                        type="text"
                        placeholder={f.placeholder}
                        value={values[f.key] ?? ""}
                        onChange={(e) => setValues((v) => ({ ...v, [f.key]: e.target.value }))}
                        className="w-full border border-neutral-200 p-3 text-sm text-neutral-800 placeholder-neutral-400 focus:outline-none focus:border-neutral-400"
                      />
                    )}
                  </div>
                ))}

                <button
                  onClick={download}
                  className="w-full flex items-center justify-center gap-2 bg-black text-white py-3 text-sm uppercase tracking-widest font-semibold hover:bg-neutral-800 transition-colors mt-2"
                >
                  <Icon name="Download" size={16} />
                  Скачать заявление (.txt)
                </button>
                <p className="text-xs text-neutral-400 text-center">
                  Файл откроется в любом текстовом редакторе. Перед подачей поставьте дату и подпись от руки.
                </p>
              </div>

              {/* Preview */}
              <div className="p-6">
                <p className="text-xs font-semibold uppercase tracking-wide text-neutral-500 mb-3">Предпросмотр</p>
                <pre className="text-xs text-neutral-700 leading-relaxed whitespace-pre-wrap font-mono bg-neutral-50 border border-neutral-100 p-4 max-h-[420px] overflow-y-auto">
                  {preview}
                </pre>
              </div>
            </div>
          </div>
        )}

        {/* Cards */}
        <div className="grid sm:grid-cols-2 gap-4">
          {documents.map((doc) => (
            <button
              key={doc.id}
              onClick={() => handleOpen(doc.id)}
              className={`text-left p-6 border transition-all ${
                activeId === doc.id
                  ? "border-neutral-900 bg-white"
                  : "border-neutral-200 bg-white hover:border-neutral-400"
              }`}
            >
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-neutral-100 flex items-center justify-center shrink-0">
                  <Icon name={doc.icon as "AlertTriangle"} size={20} className="text-neutral-700" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-neutral-900 text-sm mb-1">{doc.title}</h3>
                  <p className="text-xs text-neutral-500 mb-3 leading-relaxed">{doc.description}</p>
                  <div className="flex flex-wrap gap-1">
                    {doc.tags.map((t) => (
                      <span key={t} className="text-xs bg-neutral-100 text-neutral-600 px-2 py-0.5">
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>

        {/* Info block */}
        <div className="mt-12 border border-neutral-200 bg-white p-6">
          <div className="flex items-start gap-4">
            <Icon name="Info" size={20} className="text-neutral-400 shrink-0 mt-0.5" />
            <div className="text-sm text-neutral-600 space-y-2">
              <p className="font-semibold text-neutral-800">Как подать заявление?</p>
              <p>1. Выберите нужный шаблон выше, заполните данные и скачайте файл.</p>
              <p>2. Распечатайте и подайте лично в канцелярию администрации — вам обязаны выдать отметку о принятии.</p>
              <p>3. Или отправьте через <a href="https://www.gosuslugi.ru" target="_blank" rel="noreferrer" className="underline hover:text-neutral-900">Госуслуги</a> — раздел «Обращения граждан».</p>
              <p>4. Ответ обязаны дать в течение <strong>30 дней</strong> согласно Федеральному закону № 59-ФЗ.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
