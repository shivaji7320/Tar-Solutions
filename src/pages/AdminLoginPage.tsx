import React, { useState } from 'react';
import { TarLogo } from '../components/TarLogo';
import {
  ShieldCheck,
  Lock,
  User,
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  ArrowRight,
  Eye,
  EyeOff
} from 'lucide-react';

interface AdminLoginPageProps {
  onLogin: (username: string, password: string) => Promise<{ success: boolean; error?: string }>;
  onBackToHome: () => void;
}

export const AdminLoginPage: React.FC<AdminLoginPageProps> = ({
  onLogin,
  onBackToHome
}) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      setError('Please enter both username and password.');
      return;
    }
    setError('');
    setLoading(true);

    try {
      const res = await onLogin(username.trim(), password.trim());
      if (res.success) {
        setSuccessMsg('Authentication successful! Accessing TAR Admin Dashboard...');
      } else {
        setError(res.error || 'Invalid credentials. Access restricted to authorized TAR administrator.');
        setLoading(false);
      }
    } catch (err) {
      setError('Authentication server error. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="w-full bg-slate-950 min-h-screen py-12 sm:py-16 flex flex-col items-center justify-center px-4 relative overflow-hidden text-slate-100">
      {/* Subtle ambient lighting */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-9 shadow-2xl space-y-6 relative z-10">
        
        {/* Back navigation */}
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={onBackToHome}
            className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Main Site</span>
          </button>
        </div>

        {/* Portal Branding Header */}
        <div className="text-center space-y-2">
          <div className="flex justify-center">
            <TarLogo variant="white" />
          </div>
          <div className="inline-flex items-center gap-1.5 bg-blue-950/80 border border-blue-600/40 px-3 py-1 rounded-full text-[10px] font-bold text-blue-300 tracking-wider">
            <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
            <span>ADMIN SECURITY PORTAL</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold font-heading text-white">
            Administrator Login
          </h1>
          <p className="text-xs text-slate-400 leading-relaxed">
            Restricted portal for TAR civil and waterproofing administration.
          </p>
        </div>

        {/* Error Notification */}
        {error && (
          <div className="p-3 rounded-xl bg-rose-950/80 border border-rose-800 text-rose-300 text-xs flex items-center gap-2.5 animate-shake">
            <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-400" />
            <span>{error}</span>
          </div>
        )}

        {/* Success Banner */}
        {successMsg && (
          <div className="p-3.5 rounded-xl bg-emerald-950/90 border border-emerald-700 text-emerald-200 text-xs flex items-center gap-2.5 animate-pulse">
            <CheckCircle2 className="w-5 h-5 flex-shrink-0 text-emerald-400" />
            <span className="font-semibold">{successMsg}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
              Admin Username
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                placeholder="Enter admin username"
                value={username}
                onChange={(e) => {
                  setUsername(e.target.value);
                  setError('');
                }}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs sm:text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none placeholder:text-slate-600 transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                placeholder="Enter password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setError('');
                }}
                className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs sm:text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none placeholder:text-slate-600 transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 cursor-pointer"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-xl bg-blue-600 hover:bg-blue-500 active:scale-[0.98] text-white font-extrabold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg transition-all disabled:opacity-70 mt-2 cursor-pointer"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                <span>Authenticating...</span>
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <span>Sign In to Admin Portal</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </span>
            )}
          </button>

          <div className="pt-2 text-center">
            <p className="text-[11px] text-slate-500 flex items-center justify-center gap-1.5">
              <Lock className="w-3 h-3 text-slate-400" />
              <span>Protected by encrypted authentication</span>
            </p>
          </div>
        </form>

      </div>
    </div>
  );
};
