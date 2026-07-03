import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { clearAuthError, login, register } from '../../redux/features/auth/authSlice';
import { ROUTES } from '../../constants/routes';
import { getDefaultRouteForRole } from '../../utils/roleRedirect';
import { AlertTriangle, Eye, EyeOff, LifeBuoy, Shield, Siren } from 'lucide-react';

const initialForm = { name: '', email: '', password: '', role: 'victim' };

const roleOptions = [
  {
    role: 'victim',
    label: 'Victim',
    description: 'I need shelter, alerts, and rescue support.',
    icon: LifeBuoy
  },
  {
    role: 'helper',
    label: 'Helper',
    description: 'I coordinate resources, volunteers, and field response.',
    icon: Shield
  },
  {
    role: 'authority',
    label: 'Authority',
    description: 'I manage alerts, analytics, and response coordination.',
    icon: Siren
  },
  {
    role: 'admin',
    label: 'Admin',
    description: 'I oversee platform operations and system health.',
    icon: AlertTriangle
  }
];

export default function AuthForm({ mode = 'login' }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { error, status, user } = useSelector((state) => state.auth);
  const [form, setForm] = useState(initialForm);
  const [showPw, setShowPw] = useState(false);
  const [selectedRole, setSelectedRole] = useState(mode === 'register' ? 'victim' : null);
  const isRegister = mode === 'register';
  const isLoading = status === 'loading';
  const selectedRoleLabel = roleOptions.find((option) => option.role === selectedRole)?.label || 'Selected role';

  useEffect(() => {
    if (isRegister) {
      setSelectedRole('victim');
    } else {
      setSelectedRole(null);
    }
  }, [isRegister]);

  useEffect(() => { dispatch(clearAuthError()); }, [dispatch, mode]);
  useEffect(() => {
    if (user) navigate(getDefaultRouteForRole(user.role), { replace: true });
  }, [navigate, user]);

  const handleChange = (e) =>
    setForm((c) => ({ ...c, [e.target.name]: e.target.value }));

  const handleSubmit = (e) => {
    e.preventDefault();
    dispatch(
      isRegister
        ? register(form)
        : login({ email: form.email, password: form.password, role: selectedRole })
    );
  };

  return (
    <div className="min-h-screen flex bg-slate-950">
      {/* ── LEFT PANEL ── */}
      <div className="hidden lg:flex flex-col justify-between w-[480px] shrink-0 bg-gradient-to-br from-indigo-950 via-slate-900 to-slate-950 p-10 border-r border-white/5 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-indigo-600/10 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-48 h-48 rounded-full bg-violet-600/10 blur-3xl pointer-events-none" />
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-16">
            <div className="h-10 w-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-600/40">
              <Shield className="text-white h-5 w-5" />
            </div>
            <div>
              <p className="text-xl font-black text-white leading-none">AEGIS</p>
              <p className="text-[9px] font-black uppercase tracking-[0.2em] text-indigo-400">Disaster Intel</p>
            </div>
          </div>
          <h2 className="text-4xl font-black text-white leading-tight mb-5">
            Coordinate.<br />Rescue.<br />Recover.
          </h2>
          <p className="text-slate-400 text-sm leading-relaxed mb-10">
            Real-time disaster intelligence platform for victims, rescue teams, and authorities.
          </p>
          <div className="space-y-4">
            {[
              { icon: Siren, text: 'One-tap SOS with live authority alerts' },
              { icon: AlertTriangle, text: 'AI risk prediction from weather + seismic data' },
              { icon: Shield, text: 'Role-based command for all responders' },
            ].map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-center gap-3 text-sm text-slate-300">
                <div className="w-8 h-8 rounded-lg bg-indigo-600/20 flex items-center justify-center shrink-0">
                  <Icon className="h-4 w-4 text-indigo-400" />
                </div>
                {text}
              </div>
            ))}
          </div>
        </div>
        <p className="relative z-10 text-xs text-slate-600">
          © {new Date().getFullYear()} AEGIS · Built for life-critical operations
        </p>
      </div>

      {/* ── RIGHT PANEL ── */}
      <div className="flex-1 flex items-center justify-center p-6 bg-slate-950">
        <div className="w-full max-w-md">
          {/* mobile logo */}
          <div className="flex items-center gap-3 mb-10 lg:hidden">
            <div className="h-9 w-9 bg-indigo-600 rounded-xl flex items-center justify-center">
              <Shield className="text-white h-4 w-4" />
            </div>
            <span className="text-lg font-black text-white">AEGIS</span>
          </div>

          <h1 className="text-3xl font-black text-white mb-1">
            {isRegister ? 'Create account' : 'Welcome back'}
          </h1>
          <p className="text-slate-500 text-sm mb-8">
            {isRegister
              ? 'Choose your operational role and join the platform.'
              : 'Sign in to access the disaster response workspace.'}
          </p>

          {error && (
            <div className="mb-6 flex items-start gap-3 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
              <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0" />
              {error}
            </div>
          )}

          {!isRegister && !selectedRole ? (
            <div className="space-y-6">
              <div className="rounded-3xl border border-slate-700 bg-slate-900 p-6 shadow-2xl">
                <div className="mb-6">
                  <h2 className="text-2xl font-black text-white">Select your role first</h2>
                  <p className="text-sm text-slate-400">Choose the role that matches your account before signing in.</p>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  {roleOptions.map(({ role, label, description, icon: Icon }) => (
                    <button
                      key={role}
                      type="button"
                      onClick={() => setSelectedRole(role)}
                      className="rounded-3xl border border-slate-700 bg-slate-950/90 p-4 text-left transition-all hover:border-indigo-500 hover:bg-slate-900"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-indigo-600 text-white">
                          <Icon className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="font-semibold text-white">{label}</p>
                          <p className="text-xs text-slate-400">{description}</p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <>
              {!isRegister && (
                <div className="mb-4 rounded-2xl border border-slate-700 bg-slate-900 px-4 py-3 text-sm text-slate-200">
                  Signing in as <span className="font-semibold text-white">{selectedRoleLabel}</span>.{' '}
                  <button
                    type="button"
                    onClick={() => setSelectedRole(null)}
                    className="font-semibold text-indigo-300 hover:text-indigo-200"
                  >
                    Change role
                  </button>
                </div>
              )}

              <form className="space-y-4" onSubmit={handleSubmit}>
                {isRegister && (
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Full Name</label>
                    <input
                      className="w-full bg-white/5 border border-white/10 text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-500 focus:bg-white/10 transition-all placeholder:text-slate-600"
                      name="name"
                      onChange={handleChange}
                      placeholder="Your full name"
                      required
                      value={form.name}
                    />
                  </div>
                )}

                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Email</label>
                  <input
                    className="w-full bg-white/5 border border-white/10 text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-500 focus:bg-white/10 transition-all placeholder:text-slate-600"
                    name="email"
                    onChange={handleChange}
                    placeholder="name@example.com"
                    required
                    type="email"
                    value={form.email}
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Password</label>
                  <div className="relative">
                    <input
                      className="w-full bg-white/5 border border-white/10 text-white rounded-xl px-4 py-3 pr-12 text-sm focus:outline-none focus:border-indigo-500 focus:bg-white/10 transition-all placeholder:text-slate-600"
                      minLength={isRegister ? 8 : 1}
                      name="password"
                      onChange={handleChange}
                      placeholder={isRegister ? 'At least 8 characters' : '••••••••'}
                      required
                      type={showPw ? 'text' : 'password'}
                      value={form.password}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPw((p) => !p)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                    >
                      {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                {isRegister && (
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Role</label>
                    <select
                      className="w-full bg-white text-slate-900 border border-slate-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-500 focus:bg-white transition-all"
                      name="role"
                      onChange={handleChange}
                      value={form.role}
                    >
                      <option value="victim">Victim / Civilian</option>
                      <option value="helper">Helper / NGO Volunteer</option>
                      <option value="authority">Authority / Government</option>
                      <option value="admin">Admin</option>
                    </select>
                  </div>
                )}

                <button
                  className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-xl py-3.5 text-sm transition-all hover:shadow-lg hover:shadow-indigo-600/30 mt-2"
                  disabled={isLoading}
                  type="submit"
                >
                  {isLoading ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" className="opacity-25" />
                        <path fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" className="opacity-75" />
                      </svg>
                      Please wait…
                    </span>
                  ) : isRegister ? 'Create Account' : 'Sign In to Aegis'}
                </button>
              </form>
            </>
          )}

          <p className="mt-6 text-center text-sm text-slate-500">
            {isRegister ? 'Already registered?' : 'Need an account?'}{' '}
            <Link
              className="font-bold text-indigo-400 hover:text-indigo-300 transition-colors"
              to={isRegister ? ROUTES.LOGIN : ROUTES.REGISTER}
            >
              {isRegister ? 'Sign in' : 'Create one'}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
