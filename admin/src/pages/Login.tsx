import { useState, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { Gauge, AlertCircle } from 'lucide-react';
import api from '../lib/api';

export default function Login() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { data } = await api.post('/auth/login', form);
      localStorage.setItem('ecm_token', data.token);
      localStorage.setItem('ecm_user', data.username);
      navigate('/dashboard');
    } catch {
      setError("Login yoki parol noto'g'ri");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[hsl(205,45%,20%)] flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-14 h-14 bg-[hsl(25,80%,50%)] rounded-2xl flex items-center justify-center mb-4 shadow-lg">
            <Gauge size={28} className="text-white" />
          </div>
          <h1 className="text-white font-bold text-xl">ECM CALIBRATION</h1>
          <p className="text-white/50 text-sm mt-1">Admin Panel</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl p-8 shadow-2xl">
          <h2 className="text-gray-800 font-bold text-lg mb-6">Tizimga kirish</h2>

          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg mb-4 text-sm text-red-600">
              <AlertCircle size={14} />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Foydalanuvchi nomi
              </label>
              <input
                type="text"
                value={form.username}
                onChange={(e) => setForm((p) => ({ ...p, username: e.target.value }))}
                required
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm outline-none focus:border-[hsl(205,45%,25%)] focus:ring-2 focus:ring-[hsl(205,45%,25%)]/10 transition-all"
                placeholder="admin"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Parol
              </label>
              <input
                type="password"
                value={form.password}
                onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))}
                required
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm outline-none focus:border-[hsl(205,45%,25%)] focus:ring-2 focus:ring-[hsl(205,45%,25%)]/10 transition-all"
                placeholder="••••••••"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-lg font-semibold text-white text-sm transition-all disabled:opacity-60"
              style={{ background: 'hsl(205,45%,25%)' }}
            >
              {loading ? 'Kirish...' : 'Kirish'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
