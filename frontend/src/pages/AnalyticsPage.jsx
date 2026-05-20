import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, MousePointerClick, Clock, Calendar, ExternalLink,
  Copy, CheckCheck, QrCode, Globe, Monitor, Smartphone, TrendingUp,
  Activity, BarChart2
} from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, Legend, BarChart, Bar
} from 'recharts';
import Navbar from '../components/layout/Navbar';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import QRCodeModal from '../components/ui/QRCodeModal';
import { analyticsAPI } from '../utils/api';
import {
  formatDateTime, formatRelativeTime, copyToClipboard,
  truncateUrl, getErrorMessage, COLORS, formatNumber
} from '../utils/helpers';
import { useTheme } from '../context/ThemeContext';
import toast from 'react-hot-toast';

/* ── Stat Card ── */
const StatCard = ({ icon: Icon, label, value, color, bg }) => (
  <div className="stat-card">
    <div className="flex items-center gap-4">
      <div className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0"
        style={{ background: bg, boxShadow: `0 4px 15px ${color}30` }}>
        <Icon size={20} style={{ color }} />
      </div>
      <div>
        <p className="text-xs font-medium mb-1" style={{ color: 'var(--text-muted)' }}>{label}</p>
        <p className="text-xl font-black" style={{ color: 'var(--text-primary)' }}>{value}</p>
      </div>
    </div>
  </div>
);

/* ── Tooltips ── */
const ChartTip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl px-3 py-2 text-sm"
      style={{ background: 'var(--bg-surface-2)', border: '1px solid rgba(124,58,237,0.3)', boxShadow: 'var(--shadow-sm)' }}>
      <p className="text-xs mb-1" style={{ color: 'var(--text-muted)' }}>{label}</p>
      <p className="font-bold" style={{ color: '#a78bfa' }}>{payload[0].value} clicks</p>
    </div>
  );
};

const PieTip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl px-3 py-2 text-sm"
      style={{ background: 'var(--bg-surface-2)', border: '1px solid var(--border-strong)', boxShadow: 'var(--shadow-sm)' }}>
      <p className="font-semibold" style={{ color: 'var(--text-primary)' }}>{payload[0].name}</p>
      <p style={{ color: payload[0].payload.fill }}>{payload[0].value} visits</p>
    </div>
  );
};

export default function AnalyticsPage() {
  const { urlId } = useParams();
  const navigate = useNavigate();
  const { isDark } = useTheme();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);
  const [qrOpen, setQrOpen] = useState(false);

  useEffect(() => {
    analyticsAPI.getUrlAnalytics(urlId)
      .then(res => setData(res.data))
      .catch(err => setError(getErrorMessage(err)))
      .finally(() => setLoading(false));
  }, [urlId]);

  const handleCopy = async () => {
    if (!data?.url?.shortUrl) return;
    await copyToClipboard(data.url.shortUrl);
    setCopied(true); toast.success('Copied!');
    setTimeout(() => setCopied(false), 2000);
  };

  const gridColor = isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.05)';
  const tickColor = isDark ? '#475569' : '#94a3b8';
  const legendColor = isDark ? '#94a3b8' : '#64748b';

  if (loading) return (
    <div className="min-h-screen bg-mesh">
      <Navbar />
      <div className="flex items-center justify-center h-96"><LoadingSpinner size="lg" /></div>
    </div>
  );

  if (error) return (
    <div className="min-h-screen bg-mesh">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
          style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)' }}>
          <Activity size={28} style={{ color: '#f87171' }} />
        </div>
        <p className="text-red-400 mb-4">{error}</p>
        <button onClick={() => navigate('/dashboard')} className="btn-secondary">Back to Dashboard</button>
      </div>
    </div>
  );

  const { url, analytics } = data;

  return (
    <div className="min-h-screen bg-mesh">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">

        {/* Back */}
        <Link to="/dashboard"
          className="inline-flex items-center gap-2 text-sm font-medium transition-all group"
          style={{ color: 'var(--text-muted)' }}
          onMouseEnter={e => e.currentTarget.style.color = 'var(--text-primary)'}
          onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}>
          <ArrowLeft size={15} className="group-hover:-translate-x-0.5 transition-transform" />
          Back to Dashboard
        </Link>

        {/* URL Info Card */}
        <div className="card">
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-5">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                  style={{ background: 'rgba(124,58,237,0.15)', border: '1px solid rgba(124,58,237,0.25)' }}>
                  <BarChart2 size={18} style={{ color: '#a78bfa' }} />
                </div>
                {url.title && <h1 className="text-xl font-black" style={{ color: 'var(--text-primary)' }}>{url.title}</h1>}
              </div>
              <a href={url.shortUrl} target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 font-mono font-semibold text-base mb-2 transition-colors"
                style={{ color: '#7c3aed' }}
                onMouseEnter={e => e.currentTarget.style.color = '#a78bfa'}
                onMouseLeave={e => e.currentTarget.style.color = '#7c3aed'}>
                {url.shortUrl} <ExternalLink size={13} />
              </a>
              <p className="text-sm truncate mb-3" style={{ color: 'var(--text-muted)' }}>
                → {truncateUrl(url.originalUrl, 80)}
              </p>
              <div className="flex items-center gap-4 text-xs flex-wrap" style={{ color: 'var(--text-muted)' }}>
                <span className="flex items-center gap-1.5">
                  <Calendar size={11} style={{ color: '#4ade80' }} />
                  Created {formatDateTime(url.createdAt)}
                </span>
                {url.expiresAt && (
                  <span className="flex items-center gap-1.5" style={{ color: '#fbbf24' }}>
                    <Clock size={11} /> Expires {formatDateTime(url.expiresAt)}
                  </span>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button onClick={handleCopy} className="btn-secondary text-sm py-2">
                {copied ? <CheckCheck size={14} style={{ color: '#4ade80' }} /> : <Copy size={14} />}
                {copied ? 'Copied!' : 'Copy URL'}
              </button>
              <button onClick={() => setQrOpen(true)} className="btn-secondary text-sm py-2">
                <QrCode size={14} /> QR Code
              </button>
            </div>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <StatCard icon={MousePointerClick} label="Total Clicks" value={formatNumber(analytics.totalClicks)}
            color="#a78bfa" bg="rgba(167,139,250,0.15)" />
          <StatCard icon={Clock} label="Last Visited" value={formatRelativeTime(analytics.lastVisited)}
            color="#60a5fa" bg="rgba(96,165,250,0.15)" />
          <StatCard icon={Calendar} label="Link Age" value={formatRelativeTime(url.createdAt)}
            color="#4ade80" bg="rgba(74,222,128,0.15)" />
        </div>

        {/* Daily Clicks Chart */}
        <div className="card">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-base font-bold" style={{ color: 'var(--text-primary)' }}>Daily Clicks</h2>
              <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>Last 30 days performance</p>
            </div>
            <span className="badge badge-purple"><TrendingUp size={10} /> Trend</span>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={analytics.dailyClicks}>
              <defs>
                <linearGradient id="ag" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#7c3aed" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#7c3aed" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
              <XAxis dataKey="date" tick={{ fill: tickColor, fontSize: 10 }}
                tickFormatter={v => v.slice(5)} interval={4} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: tickColor, fontSize: 10 }} axisLine={false} tickLine={false} allowDecimals={false} />
              <Tooltip content={<ChartTip />} />
              <Area type="monotone" dataKey="clicks" stroke="#7c3aed" strokeWidth={2.5} fill="url(#ag)" dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Breakdown Charts */}
        <div className="grid md:grid-cols-3 gap-5">
          {[
            { title: 'Browsers', icon: Globe, color: '#a78bfa', data: analytics.browserStats },
            { title: 'Operating Systems', icon: Monitor, color: '#60a5fa', data: analytics.osStats },
            { title: 'Devices', icon: Smartphone, color: '#4ade80', data: analytics.deviceStats },
          ].map(({ title, icon: Icon, color, data: d }) => (
            <div key={title} className="card">
              <h3 className="text-sm font-bold mb-4 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
                <div className="w-7 h-7 rounded-lg flex items-center justify-center"
                  style={{ background: `${color}20`, border: `1px solid ${color}30` }}>
                  <Icon size={13} style={{ color }} />
                </div>
                {title}
              </h3>
              {d.length > 0 ? (
                <ResponsiveContainer width="100%" height={190}>
                  <PieChart>
                    <Pie data={d} cx="50%" cy="50%" innerRadius={48} outerRadius={72} paddingAngle={3} dataKey="value">
                      {d.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                    </Pie>
                    <Tooltip content={<PieTip />} />
                    <Legend formatter={v => <span style={{ fontSize: 11, color: legendColor }}>{v}</span>} />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-48 flex flex-col items-center justify-center gap-2">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                    style={{ background: 'var(--bg-hover)' }}>
                    <Icon size={18} style={{ color: 'var(--text-muted)' }} />
                  </div>
                  <p className="text-sm" style={{ color: 'var(--text-muted)' }}>No data yet</p>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Recent Visits Table */}
        <div className="card">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-base font-bold" style={{ color: 'var(--text-primary)' }}>Recent Visits</h2>
            {analytics.recentVisits.length > 0 && (
              <span className="badge badge-blue">{analytics.recentVisits.length} visits</span>
            )}
          </div>
          {analytics.recentVisits.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-3"
                style={{ background: 'var(--bg-hover)', border: '1px solid var(--border)' }}>
                <MousePointerClick size={22} style={{ color: 'var(--text-muted)' }} />
              </div>
              <p className="font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>No visits yet</p>
              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Share your link to start tracking!</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border)' }}>
                    {['Time', 'Browser', 'OS', 'Device', 'Referer'].map(h => (
                      <th key={h} className="text-left text-xs font-semibold pb-3 pr-4"
                        style={{ color: 'var(--text-muted)' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {analytics.recentVisits.map((v, i) => (
                    <tr key={i} className="table-row-hover transition-colors rounded-xl"
                      style={{ borderBottom: i < analytics.recentVisits.length - 1 ? '1px solid var(--border)' : 'none' }}>
                      <td className="py-3 pr-4 text-xs whitespace-nowrap font-medium" style={{ color: 'var(--text-primary)' }}>
                        {formatRelativeTime(v.timestamp)}
                      </td>
                      <td className="py-3 pr-4 text-xs" style={{ color: 'var(--text-secondary)' }}>{v.browser || 'Unknown'}</td>
                      <td className="py-3 pr-4 text-xs" style={{ color: 'var(--text-secondary)' }}>{v.os || 'Unknown'}</td>
                      <td className="py-3 pr-4 text-xs">
                        <span className="badge badge-blue capitalize">{v.device || 'desktop'}</span>
                      </td>
                      <td className="py-3 text-xs truncate max-w-[120px]" style={{ color: 'var(--text-muted)' }}>
                        {v.referer ? truncateUrl(v.referer, 25) : 'Direct'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      <QRCodeModal isOpen={qrOpen} onClose={() => setQrOpen(false)} url={url.shortUrl} shortCode={url.shortCode} />
    </div>
  );
}
