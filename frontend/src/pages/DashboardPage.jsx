import React, { useState, useEffect, useCallback } from 'react';
import {
  Plus, Search, Link2, MousePointerClick, BarChart3, TrendingUp,
  RefreshCw, Copy, Trash2, Pencil, ExternalLink, CheckCheck, Clock,
  Calendar, AlertTriangle, QrCode, ChevronLeft, ChevronRight,
  LayoutGrid, List, Zap, Globe, Activity
} from 'lucide-react';
import Navbar from '../components/layout/Navbar';
import CreateUrlModal from '../components/ui/CreateUrlModal';
import EditUrlModal from '../components/ui/EditUrlModal';
import ConfirmDialog from '../components/ui/ConfirmDialog';
import QRCodeModal from '../components/ui/QRCodeModal';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { urlAPI, analyticsAPI } from '../utils/api';
import {
  getErrorMessage, formatNumber, formatRelativeTime,
  formatDate, truncateUrl, copyToClipboard
} from '../utils/helpers';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, BarChart, Bar
} from 'recharts';

/* ─── tiny hooks ─────────────────────────────────────────── */
const useNow = (ms = 30000) => {
  const [now, setNow] = useState(Date.now());
  useEffect(() => { const id = setInterval(() => setNow(Date.now()), ms); return () => clearInterval(id); }, [ms]);
  return now;
};

/* ─── Toggle Switch ──────────────────────────────────────── */
const Toggle = ({ checked, onChange, disabled }) => (
  <button
    type="button"
    onClick={() => !disabled && onChange(!checked)}
    disabled={disabled}
    className="relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full transition-all duration-300 focus:outline-none disabled:opacity-40 disabled:cursor-not-allowed"
    style={{
      background: checked
        ? 'linear-gradient(135deg,#7c3aed,#6d28d9)'
        : 'var(--border-strong)',
      border: checked ? '1px solid rgba(139,92,246,0.4)' : '1px solid var(--border)',
      boxShadow: checked ? '0 0 12px rgba(124,58,237,0.4)' : 'none'
    }}
  >
    <span
      className="inline-block h-3.5 w-3.5 rounded-full bg-white shadow-md transition-transform duration-300"
      style={{
        transform: checked ? 'translateX(18px)' : 'translateX(2px)',
        marginTop: '2px',
        boxShadow: '0 1px 4px rgba(0,0,0,0.3)'
      }}
    />
  </button>
);

/* ─── Stat Card ──────────────────────────────────────────── */
const StatCard = ({ icon: Icon, label, value, sub, color, bg, trend }) => (
  <div className="stat-card group cursor-default">
    <div className="flex items-start justify-between mb-4">
      <div className="w-11 h-11 rounded-2xl flex items-center justify-center"
        style={{ background: bg, boxShadow: `0 4px 15px ${color}30` }}>
        <Icon size={20} style={{ color }} />
      </div>
      {trend !== undefined && (
        <span className="text-xs font-semibold px-2 py-0.5 rounded-full"
          style={{
            background: trend >= 0 ? 'rgba(74,222,128,0.12)' : 'rgba(248,113,113,0.12)',
            color: trend >= 0 ? '#4ade80' : '#f87171'
          }}>
          {trend >= 0 ? '+' : ''}{trend}%
        </span>
      )}
    </div>
    <div className="text-3xl font-black mb-1 tracking-tight" style={{ color: 'var(--text-primary)' }}>{value}</div>
    <div className="text-sm font-medium" style={{ color: 'var(--text-muted)' }}>{label}</div>
    {sub && <div className="text-xs mt-1.5 font-medium" style={{ color }}>{sub}</div>}
  </div>
);

/* ─── Chart Tooltip ──────────────────────────────────────── */
const ChartTip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl px-3 py-2 text-sm"
      style={{ background: 'var(--bg-surface-2)', border: '1px solid rgba(139,92,246,0.3)', boxShadow: 'var(--shadow)' }}>
      <p style={{ color: 'var(--text-muted)', fontSize: 11 }}>{label}</p>
      <p style={{ color: '#a78bfa', fontWeight: 700 }}>{payload[0].value} clicks</p>
    </div>
  );
};

/* ─── URL Card (grid view) ───────────────────────────────── */
const UrlCard = ({ url, onDelete, onEdit, onQR, onToggle, toggling, now }) => {
  const [copied, setCopied] = useState(false);
  const isExpired = url.isExpired || (url.expiresAt && new Date(url.expiresAt) < new Date());

  const handleCopy = async () => {
    await copyToClipboard(url.shortUrl);
    setCopied(true); toast.success('Copied!');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="rounded-2xl p-5 flex flex-col gap-4 transition-all duration-200"
      style={{
        background: 'var(--card-bg)',
        border: url.isActive ? '1px solid rgba(139,92,246,0.15)' : '1px solid var(--border)',
        opacity: !url.isActive ? 0.7 : 1
      }}>
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
            style={{ background: 'rgba(124,58,237,0.2)', border: '1px solid rgba(124,58,237,0.25)' }}>
            <Link2 size={14} style={{ color: '#a78bfa' }} />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold truncate" style={{ color: 'var(--text-primary)' }}>
              {url.title || url.shortCode}
            </p>
            <a href={url.shortUrl} target="_blank" rel="noopener noreferrer"
              className="text-xs font-mono truncate block transition-colors"
              style={{ color: '#7c3aed' }}
              onMouseEnter={e => e.currentTarget.style.color = '#a78bfa'}
              onMouseLeave={e => e.currentTarget.style.color = '#7c3aed'}>
              {url.shortUrl}
            </a>
          </div>
        </div>
        {/* Active Toggle */}
        <div className="flex items-center gap-1.5 shrink-0">
          {isExpired && (
            <span className="text-xs px-1.5 py-0.5 rounded-md font-semibold"
              style={{ background: 'rgba(239,68,68,0.12)', color: '#f87171' }}>Exp</span>
          )}
          <Toggle checked={url.isActive} onChange={() => onToggle(url)} disabled={toggling === url._id || isExpired} />
        </div>
      </div>

      {/* Original URL */}
      <p className="text-xs truncate" style={{ color: '#475569' }}>{truncateUrl(url.originalUrl, 55)}</p>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-2">
        <div className="rounded-xl p-2.5 text-center"
          style={{ background: 'rgba(167,139,250,0.08)', border: '1px solid rgba(167,139,250,0.12)' }}>
          <div className="text-lg font-black" style={{ color: '#a78bfa' }}>{url.totalClicks ?? 0}</div>
          <div className="text-xs" style={{ color: '#64748b' }}>clicks</div>
        </div>
        <div className="rounded-xl p-2.5 text-center"
          style={{ background: 'rgba(96,165,250,0.08)', border: '1px solid rgba(96,165,250,0.12)' }}>
          <div className="text-xs font-semibold truncate" style={{ color: '#60a5fa' }}>
            {url.lastVisited ? formatRelativeTime(url.lastVisited) : 'Never'}
          </div>
          <div className="text-xs" style={{ color: '#64748b' }}>last visit</div>
        </div>
      </div>

      {/* Footer actions */}
      <div className="flex items-center justify-between pt-1"
        style={{ borderTop: '1px solid var(--border)' }}>
        <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{formatDate(url.createdAt)}</span>
        <div className="flex items-center gap-0.5">
          {[
            { icon: copied ? CheckCheck : Copy, action: handleCopy, color: copied ? '#4ade80' : '#64748b', title: 'Copy' },
            { icon: QrCode, action: () => onQR(url), color: '#64748b', title: 'QR Code' },
            { icon: BarChart3, action: null, to: `/analytics/${url._id}`, color: '#64748b', title: 'Analytics' },
            { icon: Pencil, action: () => onEdit(url), color: '#64748b', title: 'Edit' },
            { icon: Trash2, action: () => onDelete(url), color: '#64748b', hoverColor: '#f87171', title: 'Delete' },
          ].map(({ icon: Ic, action, to, color, hoverColor, title }, i) =>
            to ? (
              <Link key={i} to={to} title={title}
                className="w-7 h-7 rounded-lg flex items-center justify-center transition-all"
                style={{ color }}
                onMouseEnter={e => { e.currentTarget.style.color = '#60a5fa'; e.currentTarget.style.background = 'rgba(59,130,246,0.1)'; }}
                onMouseLeave={e => { e.currentTarget.style.color = color; e.currentTarget.style.background = 'transparent'; }}>
                <Ic size={13} />
              </Link>
            ) : (
              <button key={i} onClick={action} title={title}
                className="w-7 h-7 rounded-lg flex items-center justify-center transition-all"
                style={{ color }}
                onMouseEnter={e => { e.currentTarget.style.color = hoverColor || 'var(--text-primary)'; e.currentTarget.style.background = hoverColor ? 'rgba(239,68,68,0.1)' : 'var(--bg-hover)'; }}
                onMouseLeave={e => { e.currentTarget.style.color = color; e.currentTarget.style.background = 'transparent'; }}>
                <Ic size={13} />
              </button>
            )
          )}
        </div>
      </div>
    </div>
  );
};

/* ─── URL Row (list view) ────────────────────────────────── */
const UrlRow = ({ url, onDelete, onEdit, onQR, onToggle, toggling, now }) => {
  const [copied, setCopied] = useState(false);
  const isExpired = url.isExpired || (url.expiresAt && new Date(url.expiresAt) < new Date());

  const handleCopy = async () => {
    await copyToClipboard(url.shortUrl);
    setCopied(true); toast.success('Copied!');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="rounded-2xl px-4 py-3.5 transition-all duration-200"
      style={{
        background: 'var(--bg-surface)',
        border: url.isActive ? '1px solid var(--border)' : '1px solid var(--border)',
        opacity: !url.isActive ? 0.65 : 1
      }}
      onMouseEnter={e => { e.currentTarget.style.background = 'var(--bg-hover)'; e.currentTarget.style.borderColor = 'rgba(139,92,246,0.2)'; }}
      onMouseLeave={e => { e.currentTarget.style.background = 'var(--bg-surface)'; e.currentTarget.style.borderColor = 'var(--border)'; }}>

      <div className="flex items-center gap-3">
        {/* Icon */}
        <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
          style={{ background: 'rgba(124,58,237,0.15)', border: '1px solid rgba(124,58,237,0.2)' }}>
          <Link2 size={14} style={{ color: '#a78bfa' }} />
        </div>

        {/* Title + URLs */}
        <div className="flex-1 min-w-0 grid grid-cols-1 sm:grid-cols-2 gap-0.5">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold truncate" style={{ color: 'var(--text-primary)' }}>
                {url.title || url.shortCode}
              </span>
              {isExpired && (
                <span className="text-xs px-1.5 py-0.5 rounded font-semibold shrink-0"
                  style={{ background: 'rgba(239,68,68,0.12)', color: '#f87171' }}>Expired</span>
              )}
            </div>
            <a href={url.shortUrl} target="_blank" rel="noopener noreferrer"
              className="text-xs font-mono transition-colors"
              style={{ color: '#7c3aed' }}
              onMouseEnter={e => e.currentTarget.style.color = '#a78bfa'}
              onMouseLeave={e => e.currentTarget.style.color = '#7c3aed'}>
              {url.shortUrl} <ExternalLink size={9} style={{ display: 'inline' }} />
            </a>
          </div>
          <p className="text-xs truncate hidden sm:block self-center" style={{ color: '#475569' }}>
            {truncateUrl(url.originalUrl, 50)}
          </p>
        </div>

        {/* Stats */}
        <div className="hidden md:flex items-center gap-5 shrink-0">
          <div className="text-center">
            <div className="text-sm font-black" style={{ color: '#a78bfa' }}>{url.totalClicks ?? 0}</div>
            <div className="text-xs" style={{ color: '#475569' }}>clicks</div>
          </div>
          <div className="text-center">
            <div className="text-xs font-medium" style={{ color: '#94a3b8' }}>
              {url.lastVisited ? formatRelativeTime(url.lastVisited) : 'Never'}
            </div>
            <div className="text-xs" style={{ color: '#475569' }}>last visit</div>
          </div>
          <div className="text-center">
            <div className="text-xs font-medium" style={{ color: '#94a3b8' }}>{formatDate(url.createdAt)}</div>
            <div className="text-xs" style={{ color: '#475569' }}>created</div>
          </div>
        </div>

        {/* Toggle + Actions */}
        <div className="flex items-center gap-2 shrink-0">
          <Toggle checked={url.isActive} onChange={() => onToggle(url)} disabled={toggling === url._id || isExpired} />
          <div className="flex items-center gap-0.5">
            {[
              { icon: copied ? CheckCheck : Copy, action: handleCopy, color: copied ? '#4ade80' : '#64748b' },
              { icon: QrCode, action: () => onQR(url), color: '#64748b' },
              { icon: BarChart3, to: `/analytics/${url._id}`, color: '#64748b' },
              { icon: Pencil, action: () => onEdit(url), color: '#64748b' },
              { icon: Trash2, action: () => onDelete(url), color: '#64748b', danger: true },
            ].map(({ icon: Ic, action, to, color, danger }, i) =>
              to ? (
                <Link key={i} to={to}
                  className="w-7 h-7 rounded-lg flex items-center justify-center transition-all"
                  style={{ color }}
                  onMouseEnter={e => { e.currentTarget.style.color = '#60a5fa'; e.currentTarget.style.background = 'rgba(59,130,246,0.1)'; }}
                  onMouseLeave={e => { e.currentTarget.style.color = color; e.currentTarget.style.background = 'transparent'; }}>
                  <Ic size={13} />
                </Link>
              ) : (
                <button key={i} onClick={action}
                  className="w-7 h-7 rounded-lg flex items-center justify-center transition-all"
                  style={{ color }}
                  onMouseEnter={e => { e.currentTarget.style.color = danger ? '#f87171' : 'var(--text-primary)'; e.currentTarget.style.background = danger ? 'rgba(239,68,68,0.1)' : 'var(--bg-hover)'; }}
                  onMouseLeave={e => { e.currentTarget.style.color = color; e.currentTarget.style.background = 'transparent'; }}>
                  <Ic size={13} />
                </button>
              )
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

/* ─── Main Dashboard ─────────────────────────────────────── */
export default function DashboardPage() {
  const { user } = useAuth();
  const [urls, setUrls] = useState([]);
  const [stats, setStats] = useState(null);
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(true);
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState(null);
  const [viewMode, setViewMode] = useState('list'); // 'list' | 'grid'
  const [filterActive, setFilterActive] = useState('all'); // 'all' | 'active' | 'inactive'
  const [createOpen, setCreateOpen] = useState(false);
  const [editUrl, setEditUrl] = useState(null);
  const [deleteUrl, setDeleteUrl] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [qrUrl, setQrUrl] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [lastRefreshed, setLastRefreshed] = useState(null);
  const [toggling, setToggling] = useState(null); // url._id being toggled
  const now = useNow(30000);

  const fetchUrls = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const res = await urlAPI.getAll({ page, limit: 9, search });
      setUrls(res.data.urls);
      setPagination(res.data.pagination);
    } catch (err) {
      if (!silent) toast.error(getErrorMessage(err));
    } finally {
      if (!silent) setLoading(false);
    }
  }, [page, search]);

  const fetchStats = useCallback(async (silent = false) => {
    if (!silent) setStatsLoading(true);
    try {
      const [s, o] = await Promise.all([urlAPI.getStats(), analyticsAPI.getOverview()]);
      setStats(s.data.stats);
      setChartData(o.data.dailyClicks || []);
    } catch {}
    finally { if (!silent) setStatsLoading(false); }
  }, []);

  useEffect(() => { fetchUrls(); }, [fetchUrls]);
  useEffect(() => { fetchStats(); }, [fetchStats]);

  // Auto-refresh every 30s
  useEffect(() => {
    const id = setInterval(() => {
      fetchUrls(true); fetchStats(true); setLastRefreshed(new Date());
    }, 30000);
    return () => clearInterval(id);
  }, [fetchUrls, fetchStats]);

  // Debounced search
  useEffect(() => {
    const t = setTimeout(() => { setSearch(searchInput); setPage(1); }, 400);
    return () => clearTimeout(t);
  }, [searchInput]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await Promise.all([fetchUrls(true), fetchStats(true)]);
    setLastRefreshed(new Date());
    setRefreshing(false);
    toast.success('Refreshed');
  };

  const handleCreated = (u) => { setUrls(p => [u, ...p]); fetchStats(true); setLastRefreshed(new Date()); };
  const handleUpdated = (u) => setUrls(p => p.map(x => x._id === u._id ? { ...x, ...u } : x));

  const handleDelete = async () => {
    if (!deleteUrl) return;
    setDeleteLoading(true);
    try {
      await urlAPI.delete(deleteUrl._id);
      setUrls(p => p.filter(u => u._id !== deleteUrl._id));
      toast.success('Link deleted');
      setDeleteUrl(null);
      fetchStats(true);
    } catch (err) { toast.error(getErrorMessage(err)); }
    finally { setDeleteLoading(false); }
  };

  // Toggle active/inactive
  const handleToggle = async (url) => {
    setToggling(url._id);
    try {
      const res = await urlAPI.update(url._id, { isActive: !url.isActive });
      handleUpdated(res.data.url);
      toast.success(res.data.url.isActive ? 'Link activated' : 'Link deactivated');
    } catch (err) { toast.error(getErrorMessage(err)); }
    finally { setToggling(null); }
  };

  // Filter urls by active status
  const filteredUrls = urls.filter(u => {
    if (filterActive === 'active') return u.isActive;
    if (filterActive === 'inactive') return !u.isActive;
    return true;
  });

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <div className="min-h-screen bg-mesh">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">

        {/* ── Header ── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black tracking-tight" style={{ color: 'var(--text-primary)' }}>
              {greeting()}, <span className="gradient-text">{user?.name?.split(' ')[0]}</span> 👋
            </h1>
            <p className="text-sm mt-1" style={{ color: '#475569' }}>
              Manage your links and track performance
            </p>
          </div>
          <button onClick={() => setCreateOpen(true)} className="btn-primary self-start sm:self-auto">
            <Plus size={16} /> Create Link
          </button>
        </div>

        {/* ── Stat Cards ── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {statsLoading
            ? Array(4).fill(0).map((_, i) => <div key={i} className="skeleton h-32 rounded-2xl" />)
            : <>
              <StatCard icon={Link2} label="Total Links" value={formatNumber(stats?.totalUrls || 0)}
                sub={`${stats?.activeUrls || 0} active`} color="#a78bfa" bg="rgba(167,139,250,0.15)" />
              <StatCard icon={MousePointerClick} label="Total Clicks" value={formatNumber(stats?.totalClicks || 0)}
                sub="All time" color="#60a5fa" bg="rgba(96,165,250,0.15)" />
              <StatCard icon={Activity} label="Active Links" value={formatNumber(stats?.activeUrls || 0)}
                color="#4ade80" bg="rgba(74,222,128,0.15)" />
              <StatCard icon={Zap} label="Expired" value={formatNumber(stats?.expiredUrls || 0)}
                color="#fbbf24" bg="rgba(251,191,36,0.15)" />
            </>
          }
        </div>

        {/* ── Chart ── */}
        {chartData.length > 0 && (
          <div className="card">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="text-base font-bold" style={{ color: 'var(--text-primary)' }}>Click Trends</h2>
                <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>Last 30 days</p>
              </div>
              <span className="badge badge-purple"><TrendingUp size={10} /> Analytics</span>
            </div>
            <ResponsiveContainer width="100%" height={160}>
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="cg" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#7c3aed" stopOpacity={0.5} />
                    <stop offset="95%" stopColor="#7c3aed" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                <XAxis dataKey="date" tick={{ fill: '#475569', fontSize: 10 }}
                  tickFormatter={v => v.slice(5)} interval={6} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#475569', fontSize: 10 }} axisLine={false} tickLine={false} allowDecimals={false} />
                <Tooltip content={<ChartTip />} />
                <Area type="monotone" dataKey="clicks" stroke="#7c3aed" strokeWidth={2.5} fill="url(#cg)" dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* ── Links Panel ── */}
        <div className="card">
          {/* Toolbar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
            <div className="flex items-center gap-3">
              <h2 className="text-base font-bold" style={{ color: 'var(--text-primary)' }}>Your Links</h2>
              {pagination && <span className="badge badge-purple">{pagination.total}</span>}
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              {/* Filter tabs */}
              <div className="flex rounded-xl overflow-hidden" style={{ border: '1px solid var(--border)' }}>
                {['all', 'active', 'inactive'].map(f => (
                  <button key={f} onClick={() => setFilterActive(f)}
                    className="px-3 py-1.5 text-xs font-semibold capitalize transition-all"
                    style={{
                      background: filterActive === f ? 'rgba(124,58,237,0.2)' : 'transparent',
                      color: filterActive === f ? '#a78bfa' : 'var(--text-muted)',
                      borderRight: f !== 'inactive' ? '1px solid var(--border)' : 'none'
                    }}>
                    {f}
                  </button>
                ))}
              </div>
              {/* Search */}
              <div className="relative">
                <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
                <input type="text" value={searchInput} onChange={e => setSearchInput(e.target.value)}
                  placeholder="Search…" className="input-field pl-8 py-1.5 text-sm w-44" />
              </div>
              {/* View toggle */}
              <div className="flex rounded-xl overflow-hidden" style={{ border: '1px solid var(--border)' }}>
                <button onClick={() => setViewMode('list')}
                  className="w-8 h-8 flex items-center justify-center transition-all"
                  style={{ background: viewMode === 'list' ? 'rgba(124,58,237,0.2)' : 'transparent', color: viewMode === 'list' ? '#a78bfa' : 'var(--text-muted)' }}>
                  <List size={14} />
                </button>
                <button onClick={() => setViewMode('grid')}
                  className="w-8 h-8 flex items-center justify-center transition-all"
                  style={{ background: viewMode === 'grid' ? 'rgba(124,58,237,0.2)' : 'transparent', color: viewMode === 'grid' ? '#a78bfa' : 'var(--text-muted)', borderLeft: '1px solid var(--border)' }}>
                  <LayoutGrid size={14} />
                </button>
              </div>
              {/* Refresh */}
              <button onClick={handleRefresh} disabled={refreshing}
                className="w-8 h-8 rounded-xl flex items-center justify-center transition-all disabled:opacity-40"
                style={{ border: '1px solid var(--border)', color: 'var(--text-muted)' }}
                onMouseEnter={e => { e.currentTarget.style.color = 'var(--text-primary)'; e.currentTarget.style.background = 'var(--bg-hover)'; }}
                onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-muted)'; e.currentTarget.style.background = 'transparent'; }}
                title="Refresh">
                <RefreshCw size={13} className={refreshing ? 'animate-spin' : ''} />
              </button>
            </div>
          </div>

          {/* Last refreshed */}
          {lastRefreshed && (
            <p className="text-xs mb-3" style={{ color: '#334155' }}>
              Auto-refreshes every 30s · Last updated {formatRelativeTime(lastRefreshed)}
            </p>
          )}

          {/* Content */}
          {loading ? (
            <div className="flex items-center justify-center py-16"><LoadingSpinner size="lg" /></div>
          ) : filteredUrls.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
                style={{ background: 'rgba(124,58,237,0.1)', border: '1px solid rgba(124,58,237,0.15)' }}>
                <Link2 size={28} style={{ color: '#7c3aed' }} />
              </div>
              <h3 className="font-semibold text-slate-300 mb-2">
                {search ? 'No links found' : filterActive !== 'all' ? `No ${filterActive} links` : 'No links yet'}
              </h3>
              <p className="text-sm mb-6" style={{ color: '#475569' }}>
                {search ? 'Try a different search term' : 'Create your first short link to get started'}
              </p>
              {!search && filterActive === 'all' && (
                <button onClick={() => setCreateOpen(true)} className="btn-primary mx-auto">
                  <Plus size={15} /> Create your first link
                </button>
              )}
            </div>
          ) : viewMode === 'grid' ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredUrls.map(url => (
                <UrlCard key={url._id} url={url} now={now} toggling={toggling}
                  onDelete={setDeleteUrl} onEdit={setEditUrl} onQR={setQrUrl} onToggle={handleToggle} />
              ))}
            </div>
          ) : (
            <div className="space-y-2">
              {filteredUrls.map(url => (
                <UrlRow key={url._id} url={url} now={now} toggling={toggling}
                  onDelete={setDeleteUrl} onEdit={setEditUrl} onQR={setQrUrl} onToggle={handleToggle} />
              ))}
            </div>
          )}

          {/* Pagination */}
          {pagination && pagination.pages > 1 && (
            <div className="flex items-center justify-between mt-5 pt-4"
              style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
              <p className="text-xs" style={{ color: '#475569' }}>
                Page {page} of {pagination.pages} · {pagination.total} links
              </p>
              <div className="flex gap-2">
                <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                  className="btn-secondary text-xs py-1.5 px-3 disabled:opacity-40">
                  <ChevronLeft size={13} /> Prev
                </button>
                <button onClick={() => setPage(p => Math.min(pagination.pages, p + 1))} disabled={page === pagination.pages}
                  className="btn-secondary text-xs py-1.5 px-3 disabled:opacity-40">
                  Next <ChevronRight size={13} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      <CreateUrlModal isOpen={createOpen} onClose={() => setCreateOpen(false)} onCreated={handleCreated} />
      <EditUrlModal isOpen={!!editUrl} onClose={() => setEditUrl(null)} url={editUrl} onUpdated={handleUpdated} />
      <ConfirmDialog isOpen={!!deleteUrl} onClose={() => setDeleteUrl(null)} onConfirm={handleDelete}
        title="Delete Link" message="Are you sure? All analytics data will be permanently removed." loading={deleteLoading} />
      <QRCodeModal isOpen={!!qrUrl} onClose={() => setQrUrl(null)} url={qrUrl?.shortUrl} shortCode={qrUrl?.shortCode} />
    </div>
  );
}
