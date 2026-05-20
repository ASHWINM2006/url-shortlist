import React from 'react';
import { Link } from 'react-router-dom';
import {
  Link2, BarChart3, ArrowRight, QrCode, Clock,
  CheckCircle2, Sparkles, Layers,
  Zap, Shield, TrendingUp, Globe
} from 'lucide-react';
import Navbar from '../components/layout/Navbar';
import { useTheme } from '../context/ThemeContext';

/* ── Feature Card ── */
const FeatureCard = ({ icon: Icon, title, desc, gradient, delay = 0 }) => (
  <div className="card card-hover group cursor-default"
    style={{ animationDelay: `${delay}ms` }}>
    <div className="w-13 h-13 w-12 h-12 rounded-2xl flex items-center justify-center mb-5 transition-all duration-300 group-hover:scale-110 group-hover:rotate-3"
      style={{ background: gradient, boxShadow: `0 8px 24px rgba(0,0,0,0.25)` }}>
      <Icon size={22} className="text-white" />
    </div>
    <h3 className="text-base font-bold mb-2" style={{ color: 'var(--text-primary)' }}>{title}</h3>
    <p className="text-sm leading-relaxed" style={{ color: 'var(--text-muted)' }}>{desc}</p>
  </div>
);

/* ── Step Card ── */
const StepCard = ({ num, title, desc, color }) => (
  <div className="flex gap-5 items-start">
    <div className="w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 text-sm font-black text-white"
      style={{ background: color, boxShadow: `0 4px 16px ${color}60` }}>
      {num}
    </div>
    <div>
      <h3 className="font-bold mb-1" style={{ color: 'var(--text-primary)' }}>{title}</h3>
      <p className="text-sm leading-relaxed" style={{ color: 'var(--text-muted)' }}>{desc}</p>
    </div>
  </div>
);

export default function LandingPage() {
  const { isDark } = useTheme();
  const mockBg = isDark ? 'rgba(255,255,255,0.03)' : 'rgba(255,255,255,0.9)';
  const mockBorder = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)';
  const mockRowBorder = isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)';
  const mockItemBg = isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)';

  return (
    <div className="min-h-screen bg-mesh" style={{ color: 'var(--text-primary)' }}>
      <Navbar />

      {/* ══ HERO ══ */}
      <section className="relative overflow-hidden pt-24 pb-32 px-4">
        {/* Ambient blobs */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[700px] rounded-full blur-3xl opacity-30"
            style={{ background: 'radial-gradient(ellipse,#7c3aed 0%,transparent 65%)' }} />
          <div className="absolute top-20 right-10 w-96 h-96 rounded-full blur-3xl opacity-15"
            style={{ background: '#3b82f6' }} />
          <div className="absolute bottom-10 left-10 w-80 h-80 rounded-full blur-3xl opacity-10"
            style={{ background: '#ec4899' }} />
        </div>

        <div className="max-w-5xl mx-auto text-center relative z-10">
          {/* Headline */}
          <h1 className="text-6xl md:text-8xl font-black mb-6 leading-[1.05] tracking-tight animate-fade-in">
            <span style={{ color: 'var(--text-primary)' }}>Shorten Links,</span>
            <br />
            <span className="gradient-text-hero">Amplify Reach</span>
          </h1>

          <p className="text-xl md:text-2xl max-w-2xl mx-auto mb-10 leading-relaxed animate-fade-in"
            style={{ color: 'var(--text-secondary)', animationDelay: '100ms' }}>
            Create powerful short links with real-time analytics, QR codes, and custom aliases.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12 animate-fade-in"
            style={{ animationDelay: '200ms' }}>
            <Link to="/signup"
              className="btn-primary text-base px-10 py-4 rounded-2xl"
              style={{ fontSize: 16, boxShadow: '0 8px 30px rgba(124,58,237,0.5)' }}>
              <Sparkles size={18} /> Get started free <ArrowRight size={18} />
            </Link>
            <Link to="/login" className="btn-secondary text-base px-10 py-4 rounded-2xl" style={{ fontSize: 16 }}>
              Sign in
            </Link>
          </div>

          {/* Trust badges */}
          <div className="flex flex-wrap items-center justify-center gap-6 animate-fade-in"
            style={{ color: 'var(--text-muted)', animationDelay: '300ms' }}>
            {['No credit card required', 'Free forever plan', 'Setup in 30 seconds'].map(t => (
              <div key={t} className="flex items-center gap-2 text-sm">
                <CheckCircle2 size={15} style={{ color: '#4ade80' }} /> {t}
              </div>
            ))}
          </div>

          {/* ── Dashboard Mockup ── */}
          <div className="mt-20 animate-slide-up" style={{ animationDelay: '200ms' }}>
            {/* Glow behind card */}
            <div className="absolute left-1/2 -translate-x-1/2 w-3/4 h-32 blur-3xl opacity-30 pointer-events-none"
              style={{ background: 'linear-gradient(90deg,#7c3aed,#4f46e5,#3b82f6)', marginTop: '-20px' }} />

            <div className="rounded-3xl overflow-hidden mx-auto max-w-4xl relative"
              style={{
                background: mockBg,
                border: `1px solid ${mockBorder}`,
                boxShadow: isDark ? '0 40px 100px rgba(0,0,0,0.6), 0 0 0 1px rgba(124,58,237,0.1)' : '0 40px 100px rgba(0,0,0,0.15)',
                backdropFilter: 'blur(20px)',
              }}>
              {/* Browser bar */}
              <div className="flex items-center gap-3 px-5 py-3.5"
                style={{ borderBottom: `1px solid ${mockBorder}`, background: isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)' }}>
                <div className="flex gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ background: '#ff5f57' }} />
                  <div className="w-3 h-3 rounded-full" style={{ background: '#febc2e' }} />
                  <div className="w-3 h-3 rounded-full" style={{ background: '#28c840' }} />
                </div>
                <div className="flex-1 mx-4 px-4 py-1.5 rounded-lg text-xs font-medium"
                  style={{ background: mockItemBg, color: 'var(--text-muted)', border: `1px solid ${mockBorder}` }}>
                  🔒 TinyHop.app/dashboard
                </div>
              </div>

              {/* Dashboard content */}
              <div className="p-6">
                {/* Stat row */}
                <div className="grid grid-cols-4 gap-3 mb-4">
                  {[
                    { label: 'Total Links', value: '248', color: '#7c3aed', bg: 'rgba(124,58,237,0.12)' },
                    { label: 'Total Clicks', value: '12.4K', color: '#3b82f6', bg: 'rgba(59,130,246,0.12)' },
                    { label: 'Active Links', value: '231', color: '#10b981', bg: 'rgba(16,185,129,0.12)' },
                    { label: 'This Month', value: '3.2K', color: '#f59e0b', bg: 'rgba(245,158,11,0.12)' },
                  ].map(s => (
                    <div key={s.label} className="rounded-2xl p-4"
                      style={{ background: s.bg, border: `1px solid ${s.color}25` }}>
                      <div className="text-2xl font-black mb-0.5" style={{ color: s.color }}>{s.value}</div>
                      <div className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>{s.label}</div>
                    </div>
                  ))}
                </div>

                {/* Links list */}
                <div className="rounded-2xl overflow-hidden"
                  style={{ background: mockItemBg, border: `1px solid ${mockBorder}` }}>
                  <div className="flex items-center justify-between px-4 py-3"
                    style={{ borderBottom: `1px solid ${mockRowBorder}` }}>
                    <span className="text-xs font-bold" style={{ color: 'var(--text-secondary)' }}>Recent Links</span>
                    <span className="text-xs font-semibold" style={{ color: '#7c3aed' }}>View all →</span>
                  </div>
                  {[
                    { url: 'lnk.app/launch', orig: 'https://myproduct.com/launch-2024', clicks: 1240 },
                    { url: 'lnk.app/promo', orig: 'https://shop.example.com/summer-sale', clicks: 856 },
                    { url: 'lnk.app/docs', orig: 'https://docs.myapp.com/getting-started', clicks: 432 },
                  ].map((item, i) => (
                    <div key={item.url} className="flex items-center justify-between px-4 py-3"
                      style={{ borderBottom: i < 2 ? `1px solid ${mockRowBorder}` : 'none' }}>
                      <div className="flex items-center gap-3">
                        <div className="w-7 h-7 rounded-lg flex items-center justify-center"
                          style={{ background: 'rgba(124,58,237,0.15)' }}>
                          <Link2 size={12} style={{ color: '#a78bfa' }} />
                        </div>
                        <div>
                          <div className="text-xs font-bold" style={{ color: '#a78bfa' }}>{item.url}</div>
                          <div className="text-xs" style={{ color: 'var(--text-muted)' }}>{item.orig.slice(0, 35)}…</div>
                        </div>
                      </div>
                      <div className="text-xs font-bold" style={{ color: 'var(--text-secondary)' }}>{item.clicks} clicks</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══ HOW IT WORKS ══ */}
      <section className="max-w-6xl mx-auto px-4 py-24">
        <div className="grid md:grid-cols-2 gap-16 items-center">
          <div>
            <div className="badge badge-purple mb-5">How it works</div>
            <h2 className="text-4xl font-black mb-4" style={{ color: 'var(--text-primary)' }}>
              Three steps to<br /><span className="gradient-text">powerful links</span>
            </h2>
            <p className="mb-10 leading-relaxed" style={{ color: 'var(--text-muted)' }}>
              From long URL to trackable short link in seconds. No technical knowledge required.
            </p>
            <div className="space-y-7">
              <StepCard num="1" title="Paste your long URL" color="#7c3aed"
                desc="Drop any URL — product pages, blog posts, social profiles, anything." />
              <StepCard num="2" title="Customize your link" color="#4f46e5"
                desc="Add a custom alias, set an expiry date, or let us generate a unique code." />
              <StepCard num="3" title="Share & track clicks" color="#3b82f6"
                desc="Share anywhere and watch real-time analytics roll in — clicks, devices, browsers." />
            </div>
          </div>
          <div className="relative">
            <div className="absolute inset-0 rounded-3xl blur-3xl opacity-20 pointer-events-none"
              style={{ background: 'linear-gradient(135deg,#7c3aed,#3b82f6)' }} />
            <div className="relative card p-8 space-y-4">
              {/* URL input mockup */}
              <div>
                <label className="text-xs font-semibold mb-2 block" style={{ color: 'var(--text-muted)' }}>DESTINATION URL</label>
                <div className="rounded-xl px-4 py-3 text-sm font-mono"
                  style={{ background: 'var(--input-bg)', border: '1px solid var(--input-border)', color: 'var(--text-secondary)' }}>
                  https://example.com/very-long-url-that-nobody-wants-to-type
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-px flex-1" style={{ background: 'var(--border)' }} />
                <div className="w-8 h-8 rounded-full flex items-center justify-center"
                  style={{ background: 'linear-gradient(135deg,#7c3aed,#4f46e5)' }}>
                  <ArrowRight size={14} className="text-white" style={{ transform: 'rotate(90deg)' }} />
                </div>
                <div className="h-px flex-1" style={{ background: 'var(--border)' }} />
              </div>
              <div>
                <label className="text-xs font-semibold mb-2 block" style={{ color: 'var(--text-muted)' }}>YOUR SHORT LINK</label>
                <div className="rounded-xl px-4 py-3 text-sm font-mono font-bold flex items-center justify-between"
                  style={{ background: 'rgba(124,58,237,0.1)', border: '1px solid rgba(124,58,237,0.3)', color: '#a78bfa' }}>
                  lnk.app/my-link
                  <span className="text-xs px-2 py-1 rounded-lg font-semibold"
                    style={{ background: 'rgba(74,222,128,0.15)', color: '#4ade80' }}>✓ Ready</span>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3 pt-2">
                {[
                  { label: 'Clicks', value: '0', icon: '👆' },
                  { label: 'QR Code', value: 'Ready', icon: '📱' },
                  { label: 'Analytics', value: 'Live', icon: '📊' },
                ].map(s => (
                  <div key={s.label} className="rounded-xl p-3 text-center"
                    style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)' }}>
                    <div className="text-lg mb-0.5">{s.icon}</div>
                    <div className="text-xs font-bold" style={{ color: 'var(--text-primary)' }}>{s.value}</div>
                    <div className="text-xs" style={{ color: 'var(--text-muted)' }}>{s.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══ FEATURES ══ */}
      <section className="max-w-6xl mx-auto px-4 pb-24">
        <div className="text-center mb-16">
          <div className="badge badge-purple mx-auto mb-5">Features</div>
          <h2 className="text-4xl md:text-5xl font-black mb-4" style={{ color: 'var(--text-primary)' }}>
            Everything you need
          </h2>
          <p className="max-w-xl mx-auto text-lg" style={{ color: 'var(--text-muted)' }}>
            Built for marketers, developers, and businesses who need reliable link management.
          </p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          <FeatureCard icon={Link2} title="Smart URL Shortening"
            desc="Generate short links instantly with custom aliases. Auto-validate URLs and prevent duplicates."
            gradient="linear-gradient(135deg,#7c3aed,#4f46e5)" delay={0} />
          <FeatureCard icon={BarChart3} title="Deep Analytics"
            desc="Track clicks, browsers, devices, and visit history. Visualize trends with beautiful charts."
            gradient="linear-gradient(135deg,#3b82f6,#6366f1)" delay={60} />
          <FeatureCard icon={QrCode} title="QR Code Generation"
            desc="Every link gets a downloadable QR code. Perfect for print materials and offline campaigns."
            gradient="linear-gradient(135deg,#10b981,#059669)" delay={120} />
          <FeatureCard icon={Clock} title="Link Expiration"
            desc="Set expiry dates on your links. Perfect for time-limited promotions and campaigns."
            gradient="linear-gradient(135deg,#ef4444,#dc2626)" delay={180} />
          <FeatureCard icon={Layers} title="Custom Aliases"
            desc="Create memorable short codes like /launch or /promo that reflect your brand."
            gradient="linear-gradient(135deg,#ec4899,#db2777)" delay={240} />
        </div>
      </section>

      {/* ══ CTA BANNER ══ */}
      <section className="max-w-5xl mx-auto px-4 pb-24">
        <div className="relative overflow-hidden rounded-3xl p-14 text-center"
          style={{
            background: 'linear-gradient(135deg,rgba(124,58,237,0.25) 0%,rgba(79,70,229,0.2) 50%,rgba(59,130,246,0.15) 100%)',
            border: '1px solid rgba(139,92,246,0.3)',
            boxShadow: '0 0 100px rgba(124,58,237,0.15)',
          }}>
          <div className="absolute top-0 right-0 w-80 h-80 rounded-full blur-3xl opacity-25 pointer-events-none"
            style={{ background: '#7c3aed' }} />
          <div className="absolute bottom-0 left-0 w-80 h-80 rounded-full blur-3xl opacity-20 pointer-events-none"
            style={{ background: '#3b82f6' }} />
          <div className="relative">
            <h2 className="text-4xl md:text-5xl font-black mb-4" style={{ color: 'var(--text-primary)' }}>
              Ready to get started?
            </h2>
            <p className="text-lg mb-8 max-w-lg mx-auto" style={{ color: 'var(--text-secondary)' }}>
              Join thousands of users who trust TinyHop for their link management needs.
            </p>
            <Link to="/signup" className="btn-primary text-base px-12 py-4 rounded-2xl mx-auto"
              style={{ fontSize: 16, boxShadow: '0 8px 30px rgba(124,58,237,0.5)' }}>
              <Sparkles size={18} /> Create free account <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </section>

      {/* ══ FOOTER ══ */}
      <footer style={{ borderTop: '1px solid var(--border)' }}>
        <div className="max-w-6xl mx-auto px-4 py-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg,#7c3aed,#4f46e5)', boxShadow: '0 4px 12px rgba(124,58,237,0.4)' }}>
              <Link2 size={15} className="text-white" />
            </div>
            <span className="font-black gradient-text text-lg">TinyHop</span>
          </div>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>© 2026 TinyHop.</p>
          <div className="flex items-center gap-5 text-sm" style={{ color: 'var(--text-muted)' }}>
            <span className="cursor-pointer hover:text-violet-400 transition-colors">Privacy</span>
            <span className="cursor-pointer hover:text-violet-400 transition-colors">Terms</span>
            <span className="cursor-pointer hover:text-violet-400 transition-colors">Support</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
