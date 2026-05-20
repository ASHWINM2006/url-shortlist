import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, User, Link2, AlertCircle, ArrowRight, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { authAPI } from '../utils/api';
import { getErrorMessage } from '../utils/helpers';
import toast from 'react-hot-toast';

const StrengthBar = ({ password }) => {
  if (!password) return null;
  const checks = [
    { label: 'At least 6 characters', pass: password.length >= 6 },
    { label: 'Contains a number', pass: /\d/.test(password) },
    { label: 'Contains a letter', pass: /[a-zA-Z]/.test(password) },
  ];
  const score = checks.filter(c => c.pass).length;
  const colors = ['#ef4444', '#f59e0b', '#10b981'];
  const labels = ['Weak', 'Fair', 'Strong'];
  return (
    <div className="mt-2.5 space-y-2">
      <div className="flex gap-1">
        {[0,1,2].map(i => (
          <div key={i} className="h-1 flex-1 rounded-full transition-all duration-300"
            style={{ background: i < score ? colors[score-1] : 'var(--border)' }} />
        ))}
      </div>
      <div className="flex items-center gap-3 flex-wrap">
        {checks.map(c => (
          <span key={c.label} className="text-xs flex items-center gap-1 transition-colors"
            style={{ color: c.pass ? '#10b981' : 'var(--text-muted)' }}>
            <CheckCircle2 size={10} /> {c.label}
          </span>
        ))}
        {score > 0 && <span className="text-xs font-semibold ml-auto" style={{ color: colors[score-1] }}>{labels[score-1]}</span>}
      </div>
    </div>
  );
};

export default function SignupPage() {
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const { isDark } = useTheme();
  const navigate = useNavigate();

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = 'Name is required';
    else if (form.name.trim().length < 2) e.name = 'Name must be at least 2 characters';
    if (!form.email.trim()) e.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'Enter a valid email';
    if (!form.password) e.password = 'Password is required';
    else if (form.password.length < 6) e.password = 'Password must be at least 6 characters';
    if (!form.confirmPassword) e.confirmPassword = 'Please confirm your password';
    else if (form.password !== form.confirmPassword) e.confirmPassword = 'Passwords do not match';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (ev) => {
    ev.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      const res = await authAPI.signup({ name: form.name, email: form.email, password: form.password });
      login(res.data.token, res.data.user);
      toast.success(`Welcome to TinyHop, ${res.data.user.name}!`);
      navigate('/dashboard');
    } catch (err) { toast.error(getErrorMessage(err)); }
    finally { setLoading(false); }
  };

  const set = (field, val) => {
    setForm(p => ({ ...p, [field]: val }));
    if (errors[field]) setErrors(p => ({ ...p, [field]: '' }));
  };

  const labelStyle = { color: 'var(--text-secondary)' };
  const errEl = (msg) => msg ? (
    <p className="mt-1.5 text-xs text-red-500 flex items-center gap-1"><AlertCircle size={11} />{msg}</p>
  ) : null;

  return (
    <div className="min-h-screen bg-mesh flex items-center justify-center p-4 py-10">
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[400px] rounded-full opacity-20 blur-3xl pointer-events-none"
        style={{ background: 'radial-gradient(ellipse,#7c3aed 0%,transparent 70%)' }} />

      <div className="relative w-full max-w-md animate-slide-up">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2.5 mb-6">
            <div className="w-11 h-11 rounded-2xl flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg,#7c3aed,#4f46e5)', boxShadow: '0 8px 25px rgba(124,58,237,0.4)' }}>
              <Link2 size={20} className="text-white" />
            </div>
            <span className="text-2xl font-black gradient-text">TinyHop</span>
          </Link>
          <h1 className="text-2xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>Create your account</h1>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Start shortening links for free today</p>
        </div>

        <div className="rounded-2xl p-8"
          style={{
            background: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(255,255,255,0.95)',
            border: '1px solid var(--border)',
            backdropFilter: 'blur(20px)',
            boxShadow: 'var(--shadow)',
          }}>
          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            <div>
              <label className="block text-sm font-medium mb-2" style={labelStyle}>Full Name</label>
              <div className="relative">
                <User size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
                <input type="text" value={form.name} onChange={e => set('name', e.target.value)}
                  placeholder="John Doe" className={`input-field pl-10 ${errors.name ? 'error' : ''}`} autoComplete="name" />
              </div>
              {errEl(errors.name)}
            </div>

            <div>
              <label className="block text-sm font-medium mb-2" style={labelStyle}>Email address</label>
              <div className="relative">
                <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
                <input type="email" value={form.email} onChange={e => set('email', e.target.value)}
                  placeholder="you@example.com" className={`input-field pl-10 ${errors.email ? 'error' : ''}`} autoComplete="email" />
              </div>
              {errEl(errors.email)}
            </div>

            <div>
              <label className="block text-sm font-medium mb-2" style={labelStyle}>Password</label>
              <div className="relative">
                <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
                <input type={showPassword ? 'text' : 'password'} value={form.password}
                  onChange={e => set('password', e.target.value)} placeholder="••••••••"
                  className={`input-field pl-10 pr-10 ${errors.password ? 'error' : ''}`} autoComplete="new-password" />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 transition-colors"
                  style={{ color: 'var(--text-muted)' }}>
                  {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
              {errEl(errors.password)}
              <StrengthBar password={form.password} />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2" style={labelStyle}>Confirm Password</label>
              <div className="relative">
                <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
                <input type={showPassword ? 'text' : 'password'} value={form.confirmPassword}
                  onChange={e => set('confirmPassword', e.target.value)} placeholder="••••••••"
                  className={`input-field pl-10 ${errors.confirmPassword ? 'error' : ''}`} autoComplete="new-password" />
              </div>
              {errEl(errors.confirmPassword)}
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full py-3 text-sm justify-center mt-2">
              {loading
                ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Creating account…</>
                : <>Create account <ArrowRight size={15} /></>
              }
            </button>
          </form>

          <div className="divider my-6" />
          <p className="text-center text-sm" style={{ color: 'var(--text-muted)' }}>
            Already have an account?{' '}
            <Link to="/login" className="font-semibold" style={{ color: '#7c3aed' }}>Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
