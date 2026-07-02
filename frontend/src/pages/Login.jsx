import { useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import api from '../api';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const { login, isAuthenticated } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const location = useLocation();
  const redirectTo = location.state?.from || '/dashboard';

  if (isAuthenticated) {
    return <Navigate to={redirectTo} replace />;
  }

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError('');

    try {
      const { data } = await api.post('/auth/admin/login', { email, password });
      login(data);
      navigate(redirectTo, { replace: true });
    } catch (err) {
      if (!err.response) {
        setError(
          'Backend server se connect nahi ho pa raha. Kripya check karein ki backend server running hai aur dynamic configuration sahi hai.'
        );
      } else {
        setError(err.response.data?.message || 'Admin login failed.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-950 text-white">
      <div className="hidden w-1/2 flex-col justify-between bg-gradient-to-br from-emerald-500 via-cyan-500 to-sky-600 p-10 lg:flex">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.35em] text-white/80">
            MediShop
          </p>
          <h1 className="mt-6 max-w-md text-4xl font-bold leading-tight">
            Run your medical shop with a secure admin workspace.
          </h1>
          <p className="mt-4 max-w-lg text-base text-white/85">
            Manage inventory, monitor orders, and keep pharmacy operations organized from a
            single dashboard.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="rounded-3xl bg-white/15 p-5 backdrop-blur">
            <p className="text-sm text-white/70">Access</p>
            <p className="mt-2 text-2xl font-semibold">JWT Protected</p>
          </div>
          <div className="rounded-3xl bg-white/15 p-5 backdrop-blur">
            <p className="text-sm text-white/70">Interface</p>
            <p className="mt-2 text-2xl font-semibold">Responsive UI</p>
          </div>
        </div>
      </div>

      <div className="flex w-full items-center justify-center px-4 py-10 sm:px-6 lg:w-1/2">
        <div className="w-full max-w-md rounded-3xl border border-slate-800 bg-slate-900 p-8 shadow-2xl shadow-slate-950/40">
          <div className="mb-8">
            <p className="text-sm font-semibold uppercase tracking-[0.35em] text-emerald-400">
              Admin Login
            </p>
            <h2 className="mt-3 text-3xl font-bold text-white">Welcome back</h2>
            <p className="mt-2 text-sm text-slate-400">
              Sign in to access the Medical Shop Management dashboard.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="email" className="mb-2 block text-sm font-medium text-slate-300">
                Admin Email
              </label>
              <input
                type="email"
                id="email"
                required
                placeholder="Enter your email"
                className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/20"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
              />
            </div>

            <div>
              <label htmlFor="password" className="mb-2 block text-sm font-medium text-slate-300">
                Password
              </label>
              <input
                type="password"
                id="password"
                required
                placeholder="Enter your password"
                className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/20"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
              />
            </div>

            {error && (
              <div className="rounded-2xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-2xl bg-emerald-500 px-4 py-3 font-semibold text-slate-950 transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {loading ? 'Signing in...' : 'Login to Dashboard'}
            </button>
          </form>

          <div className="mt-4 flex items-center justify-between text-sm">
            <Link to="/forgot-password" className="text-slate-450 hover:text-emerald-400 transition">
              Forgot password?
            </Link>
            <Link to="/register" className="font-semibold text-emerald-450 hover:text-emerald-300 transition">
              Create an account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
