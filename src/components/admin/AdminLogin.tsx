import Icon from "@/components/ui/icon";

interface AdminLoginProps {
  password: string;
  onPasswordChange: (v: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  error: string;
}

export default function AdminLogin({ password, onPasswordChange, onSubmit, error }: AdminLoginProps) {
  return (
    <div className="min-h-screen bg-neutral-900 flex items-center justify-center px-6">
      <div className="w-full max-w-sm">
        <div className="text-white text-center mb-8">
          <h1 className="text-2xl font-bold tracking-tight mb-1">НДЛСВ</h1>
          <p className="text-neutral-400 text-sm">Панель администратора</p>
        </div>
        <form onSubmit={onSubmit} className="bg-white p-8 space-y-4">
          <div>
            <label className="block text-xs uppercase tracking-widest text-neutral-500 mb-2">Пароль</label>
            <input
              type="password"
              value={password}
              onChange={(e) => onPasswordChange(e.target.value)}
              autoFocus
              required
              placeholder="Введите пароль администратора"
              className="w-full border border-neutral-200 p-3 text-sm focus:outline-none focus:border-neutral-900"
            />
          </div>
          {error && (
            <p className="text-red-600 text-sm flex items-center gap-2">
              <Icon name="AlertCircle" size={14} /> {error}
            </p>
          )}
          <button
            type="submit"
            className="w-full bg-black text-white py-3 text-sm uppercase tracking-widest hover:bg-neutral-800 transition-colors"
          >
            Войти
          </button>
        </form>
      </div>
    </div>
  );
}
