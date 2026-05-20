import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { Link2, LayoutDashboard, LogOut, Menu, X, ChevronDown, Sparkles, Sun, Moon } from 'lucide-react';

/* ── Theme Toggle Button ── */
const ThemeToggle = ({ size = 9 }) => {
  const { isDark, toggle } = useTheme();
  return (
    <button
      onClick={toggle}
      title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      className="relative w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-200"
      style={{
        background: 'var(--bg-surface)',
        border: '1px solid var(--border)',
        color: 'var(--text-secondary)',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.background = isDark ? 'rgba(251,191,36,0.12)' : 'rgba(124,58,237,0.1)';
        e.currentTarget.style.borderColor = isDark ? 'rgba(251,191,36,0.3)' : 'rgba(124,58,237,0.3)';
        e.currentTarget.style.color = isDark ? '#fbbf24' : '#7c3aed';
      }}
      onMouseLeave={e => {
        e.currentTarget.style.background = 'var(--bg-surface)';
        e.currentTarget.style.borderColor = 'var(--border)';
        e.currentTarget.style.color = 'var(--text-secondary)';
      }}
    >
      <span className="transition-all duration-300" style={{ display: 'flex' }}>
        {isDark
          ? <Sun size={16} style={{ color: '#fbbf24' }} />
          : <Moon size={16} style={{ color: '#7c3aed' }} />
        }
      </span>
    </button>
  );
};

const Navbar = () => {
  const { user, logout } = useAuth();
  const { isDark, toggle } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const menuRef = useRef(null);

  const handleLogout = () => { logout(); navigate('/'); setUserMenuOpen(false); };
  const isActive = (path) => location.pathname === path;

  useEffect(() => {
    const h = (e) => { if (menuRef.current && !menuRef.current.contains(e.target)) setUserMenuOpen(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  const navBg = isDark ? 'rgba(10,10,15,0.85)' : 'rgba(248,250,252,0.9)';
  const borderColor = isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.08)';

  return (
    <nav className="sticky top-0 z-50" style={{ background: navBg, backdropFilter: 'blur(20px)', borderBottom: `1px solid ${borderColor}` }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* Logo */}
          <Link to={user ? '/dashboard' : '/'} className="flex items-center gap-2.5">
            <div className="relative">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center"
                style={{ background: 'linear-gradient(135deg,#7c3aed,#4f46e5)', boxShadow: '0 4px 15px rgba(124,58,237,0.4)' }}>
                <Link2 size={18} className="text-white" />
              </div>
              <div className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-violet-400 rounded-full"
                style={{ border: `2px solid ${isDark ? '#0a0a0f' : '#f8fafc'}` }} />
            </div>
            <span className="text-lg font-black gradient-text">TinyHop</span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-2">
            {/* Theme Toggle */}
            <ThemeToggle />

            {user ? (
              <>
                <Link to="/dashboard"
                  className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200"
                  style={{
                    background: isActive('/dashboard') ? 'rgba(124,58,237,0.12)' : 'transparent',
                    color: isActive('/dashboard') ? '#a78bfa' : 'var(--text-secondary)',
                    border: isActive('/dashboard') ? '1px solid rgba(124,58,237,0.2)' : '1px solid transparent',
                  }}
                  onMouseEnter={e => { if (!isActive('/dashboard')) { e.currentTarget.style.background = 'var(--bg-hover)'; e.currentTarget.style.color = 'var(--text-primary)'; } }}
                  onMouseLeave={e => { if (!isActive('/dashboard')) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-secondary)'; } }}
                >
                  <LayoutDashboard size={15} /> Dashboard
                </Link>

                {/* User dropdown */}
                <div className="relative ml-1" ref={menuRef}>
                  <button onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-medium transition-all duration-200"
                    style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}>
                    <div className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold text-white"
                      style={{ background: 'linear-gradient(135deg,#7c3aed,#4f46e5)' }}>
                      {user.name?.charAt(0).toUpperCase()}
                    </div>
                    <span className="max-w-[100px] truncate">{user.name?.split(' ')[0]}</span>
                    <ChevronDown size={13} className={`transition-transform duration-200 ${userMenuOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {userMenuOpen && (
                    <div className="absolute right-0 mt-2 w-56 rounded-2xl shadow-2xl overflow-hidden animate-scale-in"
                      style={{
                        background: isDark ? 'rgba(15,12,28,0.97)' : 'rgba(255,255,255,0.98)',
                        backdropFilter: 'blur(20px)',
                        border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`,
                        boxShadow: isDark ? '0 20px 60px rgba(0,0,0,0.6)' : '0 20px 60px rgba(0,0,0,0.15)',
                      }}>
                      <div className="px-4 py-3" style={{ borderBottom: `1px solid ${isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.07)'}` }}>
                        <p className="text-xs mb-0.5" style={{ color: 'var(--text-muted)' }}>Signed in as</p>
                        <p className="text-sm font-semibold truncate" style={{ color: 'var(--text-primary)' }}>{user.name}</p>
                        <p className="text-xs truncate" style={{ color: 'var(--text-muted)' }}>{user.email}</p>
                      </div>
                      {/* Theme toggle inside menu */}
                      <div className="px-2 pt-2">
                        <button onClick={toggle}
                          className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm transition-all"
                          style={{ color: 'var(--text-secondary)' }}
                          onMouseEnter={e => { e.currentTarget.style.background = 'var(--bg-hover)'; }}
                          onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}>
                          <span className="flex items-center gap-2">
                            {isDark ? <Sun size={14} style={{ color: '#fbbf24' }} /> : <Moon size={14} style={{ color: '#7c3aed' }} />}
                            {isDark ? 'Light mode' : 'Dark mode'}
                          </span>
                          <span className="text-xs px-2 py-0.5 rounded-full"
                            style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', color: 'var(--text-muted)' }}>
                            {isDark ? 'ON' : 'OFF'}
                          </span>
                        </button>
                      </div>
                      <div className="p-2">
                        <button onClick={handleLogout}
                          className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm text-red-400 hover:text-red-300 transition-all"
                          onMouseEnter={e => e.currentTarget.style.background = 'rgba(239,68,68,0.08)'}
                          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                          <LogOut size={14} /> Sign out
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Link to="/login" className="btn-secondary text-sm py-2 px-4">Sign in</Link>
                <Link to="/signup" className="btn-primary text-sm py-2 px-4">
                  <Sparkles size={14} /> Get started
                </Link>
              </div>
            )}
          </div>

          {/* Mobile: theme toggle + hamburger */}
          <div className="md:hidden flex items-center gap-2">
            <ThemeToggle />
            <button className="p-2 rounded-xl transition-colors"
              style={{ color: 'var(--text-secondary)' }}
              onClick={() => setMobileOpen(!mobileOpen)}>
              {mobileOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="md:hidden animate-fade-in"
          style={{ borderTop: `1px solid ${borderColor}`, background: isDark ? 'rgba(10,10,15,0.97)' : 'rgba(248,250,252,0.97)' }}>
          <div className="px-4 py-3 space-y-1">
            {user ? (
              <>
                <div className="flex items-center gap-3 px-3 py-3 mb-2"
                  style={{ borderBottom: `1px solid ${isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.07)'}` }}>
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold text-white"
                    style={{ background: 'linear-gradient(135deg,#7c3aed,#4f46e5)' }}>
                    {user.name?.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{user.name}</p>
                    <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{user.email}</p>
                  </div>
                </div>
                <Link to="/dashboard" onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm transition-colors"
                  style={{ color: 'var(--text-secondary)' }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-hover)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                  <LayoutDashboard size={15} /> Dashboard
                </Link>
                <button onClick={handleLogout}
                  className="w-full flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm text-red-400 transition-colors"
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(239,68,68,0.08)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                  <LogOut size={15} /> Sign out
                </button>
              </>
            ) : (
              <>
                <Link to="/login" onClick={() => setMobileOpen(false)}
                  className="block px-3 py-2.5 text-sm rounded-xl transition-colors"
                  style={{ color: 'var(--text-secondary)' }}>Sign in</Link>
                <Link to="/signup" onClick={() => setMobileOpen(false)}
                  className="block px-3 py-2.5 text-sm font-semibold rounded-xl transition-colors"
                  style={{ color: '#7c3aed' }}>Get started free</Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
