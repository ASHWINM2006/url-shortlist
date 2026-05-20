import React from 'react';
import { Link } from 'react-router-dom';
import { Link2, AlertTriangle, Clock, Home, ArrowLeft } from 'lucide-react';

export default function NotFoundPage({ type = 'page' }) {
  const configs = {
    url: { icon: AlertTriangle, title: 'Link Not Found', message: "This short link doesn't exist or may have been deleted.", color: '#f87171', bg: 'rgba(239,68,68,0.1)', border: 'rgba(239,68,68,0.2)' },
    expired: { icon: Clock, title: 'Link Expired', message: 'This link has expired and is no longer accessible.', color: '#fbbf24', bg: 'rgba(245,158,11,0.1)', border: 'rgba(245,158,11,0.2)' },
    page: { icon: Link2, title: 'Page Not Found', message: "The page you're looking for doesn't exist.", color: '#a78bfa', bg: 'rgba(139,92,246,0.1)', border: 'rgba(139,92,246,0.2)' },
  };

  const c = configs[type];
  const Icon = c.icon;

  return (
    <div className="min-h-screen bg-mesh flex items-center justify-center p-4">
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-96 h-96 rounded-full opacity-10 blur-3xl pointer-events-none"
        style={{ background: c.color }} />
      <div className="relative text-center max-w-md animate-slide-up">
        <div className="w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-6"
          style={{ background: c.bg, border: `1px solid ${c.border}` }}>
          <Icon size={36} style={{ color: c.color }} />
        </div>
        <h1 className="text-3xl font-bold text-white mb-3">{c.title}</h1>
        <p className="text-slate-400 mb-8 leading-relaxed">{c.message}</p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link to="/" className="btn-primary justify-center">
            <Home size={15} /> Go Home
          </Link>
          <Link to="/dashboard" className="btn-secondary justify-center">
            <ArrowLeft size={15} /> Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
