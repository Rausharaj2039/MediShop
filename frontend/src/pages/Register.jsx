import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import api from '../api';
import { useAuth } from '../context/AuthContext';

const Register = () => {
  const { isAuthenticated } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setSuccess('');

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    setLoading(true);

    try {
      await api.post('/auth/register', { name, email, password });
      setSuccess('Account created successfully! Redirecting to login...');
      setTimeout(() => {
        navigate('/login');
      }, 2500);
    } catch (err) {
      console.error('Registration error:', err);
      setError(err.response?.data?.message || 'Failed to create account. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-950 text-white">
      {/* Left Side Gradient Banner */}
      <div className="hidden w-1/2 flex-col justify-between bg-gradient-to-br from-emerald-500 via-cyan-500 to-sky-600 p-10 lg:flex">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.35em] text-white/80">
            MediShop
          </p>
          <h1 className="mt-6 max-w-md text-4xl font-bold leading-tight">
            Create an Admin workspace for your pharmacy operations.
          </h1>
          <p className="mt-4 max-w-lg text-base text-white/85">
            Set up your management credentials to handle catalog records, trace inventory warning thresholds, and view revenue analytics.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="rounded-3xl bg-white/15 p-5 backdrop-blur">
            <p className="text-sm text-white/70">Role</p>
            <p className="mt-2 text-2xl font-semibold">Store Owner / Admin</p>
          </div>
          <div className="rounded-3xl bg-white/15 p-5 backdrop-blur">
            <p className="text-sm text-white/70">Security</p>
            <p className="mt-2 text-2xl font-semibold">Encrypted Passwords</p>
          </div>
        </div>
      </div>

      {/* Right Side Sign Up Card */}
      <div className="flex w-full items-center justify-center px-4 py-10 sm:px-6 lg:w-1/2">
        <div className="w-full max-w-md rounded-3xl border border-slate-800 bg-slate-900 p-8 shadow-2xl shadow-slate-950/40">
          <div className="mb-8">
            <p className="text-sm font-semibold uppercase tracking-[0.35em] text-emerald-400">
              Get Started
            </p>
            <h2 className="mt-3 text-3xl font-bold text-white">Create Admin Account</h2>
            <p className="mt-2 text-sm text-slate-400">
              Register a new administrative user to manage MediShop.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="name" className="mb-1 block text-xs font-semibold uppercase tracking-wider text-slate-400">
                Full Name
              </label>
              <input
                type="text"
                id="name"
                required
                placeholder="John Doe"
                className="w-full rounded-2xl border border-slate-750 bg-slate-950 px-4 py-3 text-sm text-white outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/10"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div>
              <label htmlFor="email" className="mb-1 block text-xs font-semibold uppercase tracking-wider text-slate-400">
                Email Address
              </label>
              <input
                type="email"
                id="email"
                required
                placeholder="john@example.com"
                className="w-full rounded-2xl border border-slate-750 bg-slate-950 px-4 py-3 text-sm text-white outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/10"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div>
              <label htmlFor="password" className="mb-1 block text-xs font-semibold uppercase tracking-wider text-slate-400">
                Password
              </label>
              <input
                type="password"
                id="password"
                required
                placeholder="At least 6 characters"
                className="w-full rounded-2xl border border-slate-750 bg-slate-950 px-4 py-3 text-sm text-white outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/10"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <div>
              <label htmlFor="confirmPassword" className="mb-1 block text-xs font-semibold uppercase tracking-wider text-slate-400">
                Confirm Password
              </label>
              <input
                type="password"
                id="confirmPassword"
                required
                placeholder="Repeat password"
                className="w-full rounded-2xl border border-slate-750 bg-slate-950 px-4 py-3 text-sm text-white outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/10"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>

            {error && (
              <div className="rounded-2xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-300">
                {error}
              </div>
            )}

            {success && (
              <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300">
                {success}
              </div>
            )}

            <button
              type="submit"
              disabled={loading || success}
              className="w-full rounded-2xl bg-emerald-500 px-4 py-3.5 font-bold text-slate-950 transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-75"
            >
              {loading ? 'Creating Account...' : 'Register as Admin'}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-400">
            Already have an account?{' '}
            <Link to="/login" className="font-semibold text-emerald-400 hover:text-emerald-300 transition">
              Login here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
