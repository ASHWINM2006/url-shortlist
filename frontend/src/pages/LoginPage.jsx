import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, Link2, AlertCircle, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { authAPI } from '../utils/api';
import { getErrorMessage } from '../utils/helpers';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const { isDark } = useTheme();
  const navigate = useNavigate();

  const validate = () => {
    const e = {};
    if (!form.email.trim()) e.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'Enter a valid email';
    if (!form.password) e.password = 'Password is required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (ev) => {
    ev.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      const res = await authAPI.login(form);
      login(res.data.token, res.data.user);
      toast.success(`Welcome back, ${res.data.user.name}!`);
      navigate('/dashboard');
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally { setLoading(false); }
  };

  const set = (field, val) => {
    setForm(p => ({ ...p, [field]: val }));
    if (errors[field]) setErrors(p => ({ ...p, [field]: '' }));
  };

  return (
    <div className="min-h-screen bg-mesh flex items-center justify-center p-4">
      {/* Glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[400px] rounded-full opacity-20 blur-3xl pointer-events-none"
        style={{ background: 'radial-gradient(ellipse,#7c3aed 0%,transparent 70%)' }} />

      <div className="relative w-full max-w-md animate-slide-up">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2.5 mb-6">
            <div className="w-11 h-11 rounded-2xl flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg,#7c3aed,#4f46e5)', boxShadow: '0 8px 25px rgba(124,58,237,0.4)' }}>
              <Link2 size={20} className="text-white" />
            </div>
            <span className="text-2xl font-black gradient-text">TinyHop</span>
          </Link>
          <h1 className="text-2xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>Welcome back</h1>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Sign in to your account to continue</p>
        </div>

        {/* Card */}
        <div className="rounded-2xl p-8"
          style={{
            background: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(255,255,255,0.95)',
            border: `1px solid var(--border)`,
            backdropFilter: 'blur(20px)',
            boxShadow: 'var(--shadow)',
          }}>
          <form onSubmit={handleSubmit} className="space-y-5" noValidate>
            {/* Email */}
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
                Email address
              </label>
              <div className="relative">
                <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
                <input type="email" value={form.email} onChange={e => set('email', e.target.value)}
                  placeholder="you@example.com"
                  className={`input-field pl-10 ${errors.email ? 'error' : ''}`}
                  autoComplete="email" />
              </div>
              {errors.email && (
                <p className="mt-1.5 text-xs text-red-500 flex items-center gap-1">
                  <AlertCircle size={11} /> {errors.email}
                </p>
              )}
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
                Password
              </label>
              <div className="relative">
                <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
                <input type={showPassword ? 'text' : 'password'} value={form.password}
                  onChange={e => set('password', e.target.value)} placeholder="••••••••"
                  className={`input-field pl-10 pr-10 ${errors.password ? 'error' : ''}`}
                  autoComplete="current-password" />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 transition-colors"
                  style={{ color: 'var(--text-muted)' }}
                  onMouseEnter={e => e.currentTarget.style.color = 'var(--text-primary)'}
                  onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}>
                  {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1.5 text-xs text-red-500 flex items-center gap-1">
                  <AlertCircle size={11} /> {errors.password}
                </p>
              )}
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full py-3 text-sm justify-center mt-2">
              {loading
                ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Signing in…</>
                : <>Sign in <ArrowRight size={15} /></>
              }
            </button>
          </form>

          <div className="divider my-6" />
          <p className="text-center text-sm" style={{ color: 'var(--text-muted)' }}>
            Don't have an account?{' '}
            <Link to="/signup" className="font-semibold transition-colors" style={{ color: '#7c3aed' }}
              onMouseEnter={e => e.currentTarget.style.color = '#a78bfa'}
              onMouseLeave={e => e.currentTarget.style.color = '#7c3aed'}>
              Create one free
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
