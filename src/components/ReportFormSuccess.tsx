import Icon from "@/components/ui/icon";

interface ReportFormSuccessProps {
  onReset: () => void;
}

export default function ReportFormSuccess({ onReset }: ReportFormSuccessProps) {
  return (
    <div id="report" className="min-h-screen bg-neutral-50 flex items-center justify-center px-6">
      <div className="text-center max-w-md">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <Icon name="CheckCircle" size={32} className="text-green-600" />
        </div>
        <h2 className="text-2xl font-bold text-neutral-900 mb-3">Спасибо!</h2>
        <p className="text-neutral-600 mb-8">
          Ваша заявка отправлена на проверку. После подтверждения место появится на карте.
        </p>
        <button
          onClick={onReset}
          className="bg-black text-white px-6 py-3 text-sm uppercase tracking-widest hover:bg-neutral-800 transition-colors"
        >
          Отметить ещё одно место
        </button>
      </div>
    </div>
  );
}
