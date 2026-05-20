import React, { useState } from 'react';
import { Link2, Wand2, Calendar, Tag, AlertCircle, Sparkles } from 'lucide-react';
import Modal from './Modal';
import { urlAPI } from '../../utils/api';
import { getErrorMessage } from '../../utils/helpers';
import toast from 'react-hot-toast';

export default function CreateUrlModal({ isOpen, onClose, onCreated }) {
  const [form, setForm] = useState({ originalUrl: '', customAlias: '', title: '', expiresAt: '' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const e = {};
    if (!form.originalUrl.trim()) { e.originalUrl = 'URL is required'; }
    else {
      try {
        const u = new URL(form.originalUrl);
        if (!['http:', 'https:'].includes(u.protocol)) e.originalUrl = 'URL must start with http:// or https://';
      } catch { e.originalUrl = 'Please enter a valid URL'; }
    }
    if (form.customAlias && !/^[a-zA-Z0-9_-]{3,30}$/.test(form.customAlias))
      e.customAlias = 'Alias: 3-30 chars, letters/numbers/- or _';
    if (form.expiresAt && new Date(form.expiresAt) <= new Date())
      e.expiresAt = 'Expiry date must be in the future';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (ev) => {
    ev.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      const payload = { originalUrl: form.originalUrl };
      if (form.customAlias) payload.customAlias = form.customAlias;
      if (form.title) payload.title = form.title;
      if (form.expiresAt) payload.expiresAt = form.expiresAt;
      const res = await urlAPI.create(payload);
      toast.success('Short link created!');
      onCreated(res.data.url);
      handleClose();
    } catch (err) { toast.error(getErrorMessage(err)); }
    finally { setLoading(false); }
  };

  const handleClose = () => {
    setForm({ originalUrl: '', customAlias: '', title: '', expiresAt: '' });
    setErrors({});
    onClose();
  };

  const set = (f, v) => { setForm(p => ({ ...p, [f]: v })); if (errors[f]) setErrors(p => ({ ...p, [f]: '' })); };

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const minDate = tomorrow.toISOString().slice(0, 16);

  const labelStyle = { color: 'var(--text-secondary)' };
  const errEl = (msg) => msg ? (
    <p className="mt-1.5 text-xs text-red-500 flex items-center gap-1"><AlertCircle size={11} />{msg}</p>
  ) : null;

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Create Short Link" size="md">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2" style={labelStyle}>
            Destination URL <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <Link2 size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
            <input type="text" value={form.originalUrl} onChange={e => set('originalUrl', e.target.value)}
              placeholder="https://example.com/very-long-url"
              className={`input-field pl-10 ${errors.originalUrl ? 'error' : ''}`} />
          </div>
          {errEl(errors.originalUrl)}
        </div>

        <div>
          <label className="block text-sm font-medium mb-2" style={labelStyle}>Custom Alias <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>(optional)</span></label>
          <div className="flex">
            <span className="px-3 py-2.5 text-xs rounded-l-xl shrink-0 flex items-center"
              style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRight: 'none', color: 'var(--text-muted)' }}>
              localhost:5001/
            </span>
            <input type="text" value={form.customAlias} onChange={e => set('customAlias', e.target.value)}
              placeholder="my-link" className={`input-field rounded-l-none ${errors.customAlias ? 'error' : ''}`} />
          </div>
          {errEl(errors.customAlias)}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2" style={labelStyle}>Title <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>(optional)</span></label>
            <div className="relative">
              <Tag size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
              <input type="text" value={form.title} onChange={e => set('title', e.target.value)}
                placeholder="My link" className="input-field pl-10" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2" style={labelStyle}>Expiry <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>(optional)</span></label>
            <div className="relative">
              <Calendar size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
              <input type="datetime-local" value={form.expiresAt} min={minDate}
                onChange={e => set('expiresAt', e.target.value)}
                className={`input-field pl-10 ${errors.expiresAt ? 'error' : ''}`} />
            </div>
            {errEl(errors.expiresAt)}
          </div>
        </div>

        <div className="flex gap-3 pt-2">
          <button type="button" onClick={handleClose} className="btn-secondary flex-1 justify-center" disabled={loading}>Cancel</button>
          <button type="submit" className="btn-primary flex-1 justify-center" disabled={loading}>
            {loading
              ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Creating…</>
              : <><Sparkles size={14} />Create Link</>
            }
          </button>
        </div>
      </form>
    </Modal>
  );
}
