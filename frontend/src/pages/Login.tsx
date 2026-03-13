import { useState } from 'react';
import { useAuth } from '../context/AuthContext.js';
import { login } from '../api/auth.js';

export default function Login() {
  const { setAuth } = useAuth();
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [error, setError]       = useState<string | null>(null);
  const [loading, setLoading]   = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const { token, user } = await login(email, password);
      setAuth(token, user);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Något gick fel');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-zinc-50/50 flex items-center justify-center px-4">
      <div className="w-full max-w-sm">

        {/* Logo / branding */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-1.5 bg-white border border-slate-200 rounded-full px-3 py-1 text-xs text-slate-500 font-medium mb-4">
            <span>MediTrack</span>
            <span className="text-slate-300">•</span>
            <span>Läkemedelshantering</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Logga in</h1>
          <p className="mt-1 text-sm text-slate-500">Ange dina uppgifter för att fortsätta</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm px-6 py-6">
          <form onSubmit={handleSubmit} className="space-y-4">

            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1.5">
                E-post
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="din@email.se"
                required
                className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm text-slate-800 placeholder-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-slate-300"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1.5">
                Lösenord
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm text-slate-800 placeholder-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-slate-300"
              />
            </div>

            {error && (
              <p className="text-xs text-red-500 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 text-sm font-semibold text-white bg-slate-900 hover:bg-slate-700 rounded-xl transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Loggar in…' : 'Logga in'}
            </button>

          </form>
        </div>

        {/* Test credentials */}
        <div className="mt-4 bg-white border border-slate-200 rounded-xl px-4 py-3">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">Testkonton (Klicka på användare)</p>
          <div className="flex flex-col gap-1.5">
            {[
              { label: 'Sjuksköterska', email: 'nurse@meditrack.se',        password: 'nurse123' },
              { label: 'Apotekare',     email: 'pharmacist@meditrack.se',   password: 'pharmacist123' },
              { label: 'Admin',         email: 'admin@meditrack.se',        password: 'admin123' },
            ].map((account) => (
              <button
                key={account.email}
                type="button"
                onClick={() => { setEmail(account.email); setPassword(account.password); }}
                className="flex items-center justify-between px-3 py-2 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors cursor-pointer text-left"
              >
                <span className="text-xs font-medium text-slate-700">{account.label}</span>
                <span className="text-xs text-slate-400">{account.email}</span>
              </button>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
