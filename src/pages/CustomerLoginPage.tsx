import React, { useState } from 'react';
import { CustomerUser } from '../types';
import { TarLogo } from '../components/TarLogo';
import { User, Lock, ArrowRight, ShieldCheck, AlertCircle } from 'lucide-react';

interface CustomerLoginPageProps {
  onLogin: (emailOrMobile: string, password: string) => Promise<{ success: boolean; customer?: CustomerUser; error?: string }>;
  onNavigate: (page: string) => void;
}

export const CustomerLoginPage: React.FC<CustomerLoginPageProps> = ({
  onLogin,
  onNavigate
}) => {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [forgotSent, setForgotSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier.trim() || !password.trim()) {
      setError('Please enter your email/phone and password.');
      return;
    }
    setError('');
    setLoading(true);

    try {
      const res = await onLogin(identifier, password);
      if (res.success) {
        onNavigate('customer-dashboard');
      } else {
        setError(res.error || 'Invalid credentials. Please check your phone/email and password.');
      }
    } catch (err) {
      setError('Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full bg-slate-50 min-h-screen py-16 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-3xl p-8 sm:p-10 border border-slate-200 shadow-xl space-y-6">
        <div className="text-center space-y-2">
          <div className="flex justify-center">
            <TarLogo variant="full" />
          </div>
          <h1 className="text-2xl font-black font-heading text-slate-900 pt-2">
            Customer Portal Login
          </h1>
          <p className="text-xs text-slate-500">
            Sign in to track your waterproofing appointments, site inspection status, and service history.
          </p>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {forgotSent && (
          <div className="p-3 rounded-xl bg-blue-50 border border-blue-200 text-blue-800 text-xs">
            Password reset link sent to your registered mobile/email.
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Email or Mobile Number
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                placeholder="e.g. 9848012345 or email"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-bold text-slate-700">Password</label>
              <button
                type="button"
                onClick={() => setForgotSent(true)}
                className="text-[11px] text-blue-600 hover:underline font-semibold"
              >
                Forgot Password?
              </button>
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs flex items-center justify-center gap-2 shadow-md transition-all disabled:opacity-70"
          >
            {loading ? <span>Authenticating...</span> : <span>Login to Dashboard</span>}
          </button>
        </form>

        <div className="pt-4 border-t border-slate-100 text-center space-y-3">
          <p className="text-xs text-slate-500">
            Don't have an account yet?{' '}
            <button
              onClick={() => onNavigate('customer-register')}
              className="text-blue-600 font-bold hover:underline"
            >
              Create Account
            </button>
          </p>

          <button
            onClick={() => onNavigate('book')}
            className="text-xs font-semibold text-slate-600 hover:text-slate-900 inline-flex items-center gap-1"
          >
            <span>Or proceed with Guest Booking</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>
      </div>
    </div>
  );
};
