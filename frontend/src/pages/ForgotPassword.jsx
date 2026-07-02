import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import api from '../api';
import { useAuth } from '../context/AuthContext';

const ForgotPassword = () => {
  const { isAuthenticated } = useAuth();
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [hasCode, setHasCode] = useState(false);
  const [simulatedCode, setSimulatedCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleRequestCode = async (e) => {
    e.preventDefault();
    if (!email) {
      setError('Please enter your email address.');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await api.post('/auth/forgot-password', { email });
      setSimulatedCode(response.data.simulatedCode || '');
      setSuccess('Reset code generated successfully!');
      setHasCode(true);
    } catch (err) {
      console.error('Request code error:', err);
      setError(err.response?.data?.message || 'No account found with this email.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!code || !newPassword || !confirmPassword) {
      setError('Please fill in all fields.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    setLoading(true);

    try {
      await api.post('/auth/reset-password', {
        email,
        token: code,
        newPassword,
      });
      
      setSuccess('Password updated successfully! Redirecting to login...');
      setTimeout(() => {
        navigate('/login');
      }, 2500);
    } catch (err) {
      console.error('Reset password error:', err);
      setError(err.response?.data?.message || 'Failed to reset password. Check if the code is correct.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-950 text-white">
      {/* Left Side Banner */}
      <div className="hidden w-1/2 flex-col justify-between bg-gradient-to-br from-emerald-500 via-cyan-500 to-sky-600 p-10 lg:flex">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.35em] text-white/80">
            MediShop
          </p>
          <h1 className="mt-6 max-w-md text-4xl font-bold leading-tight">
            Security & Credential Recovery
          </h1>
          <p className="mt-4 max-w-lg text-base text-white/85">
            Retrieve access to your pharmacy management workspace safely. Verify your registered email, input the generated reset code, and configure a new password.
          </p>
        </div>
        <div className="rounded-3xl bg-white/15 p-6 backdrop-blur">
          <p className="text-sm text-white/70">Development Mode Warning</p>
          <p className="mt-2 text-sm leading-relaxed text-white/90">
            Since there is no live SMTP server configured locally, the verification code is safely displayed on screen in a green card once requested.
          </p>
        </div>
      </div>

      {/* Right Side Form Card */}
      <div className="flex w-full items-center justify-center px-4 py-10 sm:px-6 lg:w-1/2">
        <div className="w-full max-w-md rounded-3xl border border-slate-800 bg-slate-900 p-8 shadow-2xl shadow-slate-950/40">
          <div className="mb-8">
            <p className="text-sm font-semibold uppercase tracking-[0.35em] text-emerald-400">
              Recover Account
            </p>
            <h2 className="mt-3 text-3xl font-bold text-white">Reset Password</h2>
            <p className="mt-2 text-sm text-slate-400">
              {!hasCode 
                ? 'Enter your registered email address and we will generate a recovery code.' 
                : 'Enter the recovery code and your new password below.'}
            </p>
          </div>

          {/* Alert messages */}
          {error && (
            <div className="mb-5 rounded-2xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-300">
              {error}
            </div>
          )}

          {success && (
            <div className="mb-5 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300">
              {success}
            </div>
          )}

          {/* Dev Simulated Code Helper Card */}
          {hasCode && simulatedCode && (
            <div className="mb-5 rounded-2xl border border-indigo-500/30 bg-indigo-500/15 p-4 text-sm text-indigo-300">
              <p className="font-semibold text-white">Simulated Verification Code</p>
              <p className="mt-1 text-slate-400">Use this 6-digit code to reset your password:</p>
              <div className="mt-2 text-center text-3xl font-extrabold tracking-[0.3em] text-emerald-400 bg-slate-950 rounded-xl py-2 font-mono">
                {simulatedCode}
              </div>
            </div>
          )}

          {!hasCode ? (
            /* Phase 1: Request Code Form */
            <form onSubmit={handleRequestCode} className="space-y-5">
              <div>
                <label htmlFor="email" className="mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-400">
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

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-2xl bg-emerald-500 px-4 py-3.5 font-bold text-slate-950 transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-75"
              >
                {loading ? 'Requesting Code...' : 'Get Verification Code'}
              </button>
            </form>
          ) : (
            /* Phase 2: Enter Code & Password Form */
            <form onSubmit={handleResetPassword} className="space-y-4">
              <div>
                <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Email Address
                </label>
                <input
                  type="email"
                  disabled
                  className="w-full rounded-2xl border border-slate-800 bg-slate-950/60 px-4 py-3 text-sm text-slate-500 cursor-not-allowed"
                  value={email}
                />
              </div>

              <div>
                <label htmlFor="code" className="mb-1 block text-xs font-semibold uppercase tracking-wider text-slate-400">
                  6-Digit Reset Code
                </label>
                <input
                  type="text"
                  id="code"
                  required
                  maxLength={6}
                  placeholder="123456"
                  className="w-full text-center tracking-[0.2em] font-mono rounded-2xl border border-slate-750 bg-slate-950 px-4 py-3 text-sm text-white outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/10"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                />
              </div>

              <div>
                <label htmlFor="newPassword" className="mb-1 block text-xs font-semibold uppercase tracking-wider text-slate-400">
                  New Password
                </label>
                <input
                  type="password"
                  id="newPassword"
                  required
                  placeholder="At least 6 characters"
                  className="w-full rounded-2xl border border-slate-750 bg-slate-950 px-4 py-3 text-sm text-white outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/10"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
              </div>

              <div>
                <label htmlFor="confirmPassword" className="mb-1 block text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  id="confirmPassword"
                  required
                  placeholder="Repeat new password"
                  className="w-full rounded-2xl border border-slate-750 bg-slate-950 px-4 py-3 text-sm text-white outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/10"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setHasCode(false);
                    setSuccess('');
                    setError('');
                  }}
                  className="w-1/3 rounded-2xl border border-slate-800 bg-slate-900 px-4 py-3 text-sm font-semibold text-slate-300 hover:bg-slate-800 transition"
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={loading || success}
                  className="w-2/3 rounded-2xl bg-emerald-500 px-4 py-3 font-bold text-slate-950 transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-75"
                >
                  {loading ? 'Resetting...' : 'Change Password'}
                </button>
              </div>
            </form>
          )}

          <p className="mt-6 text-center text-sm text-slate-400">
            Remembered password?{' '}
            <Link to="/login" className="font-semibold text-emerald-400 hover:text-emerald-300 transition">
              Login here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
