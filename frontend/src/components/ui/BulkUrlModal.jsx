import React, { useState, useRef } from 'react';
import {
  Upload, FileText, Plus, Trash2, CheckCircle2,
  XCircle, AlertCircle, Download, Loader2, Layers
} from 'lucide-react';
import Modal from './Modal';
import { urlAPI } from '../../utils/api';
import { getErrorMessage, copyToClipboard } from '../../utils/helpers';
import toast from 'react-hot-toast';

/* Parse CSV / plain text input into array of URL strings */
const parseInput = (text) => {
  return text
    .split(/[\n,]+/)
    .map(line => line.trim())
    .filter(line => line.length > 0 && !line.startsWith('#'));
};

export default function BulkUrlModal({ isOpen, onClose, onCreated }) {
  const [tab, setTab] = useState('paste'); // 'paste' | 'csv'
  const [pasteText, setPasteText] = useState('');
  const [rows, setRows] = useState([]); // parsed preview rows
  const [results, setResults] = useState(null); // API results
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState('input'); // 'input' | 'preview' | 'done'
  const fileRef = useRef();

  const handleClose = () => {
    setPasteText('');
    setRows([]);
    setResults(null);
    setStep('input');
    setTab('paste');
    onClose();
  };

  /* Parse pasted text into preview rows */
  const handlePreview = () => {
    const parsed = parseInput(pasteText);
    if (parsed.length === 0) {
      toast.error('No valid URLs found');
      return;
    }
    if (parsed.length > 20) {
      toast.error('Maximum 20 URLs allowed');
      return;
    }
    setRows(parsed.map(url => ({ originalUrl: url, title: '' })));
    setStep('preview');
  };

  /* Handle CSV file upload */
  const handleFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target.result;
      const lines = text.split('\n').filter(l => l.trim());
      // Support: url,title or just url per line
      const parsed = lines
        .filter(l => !l.toLowerCase().startsWith('url')) // skip header
        .map(line => {
          const parts = line.split(',');
          return {
            originalUrl: (parts[0] || '').trim(),
            title: (parts[1] || '').trim()
          };
        })
        .filter(r => r.originalUrl.length > 0)
        .slice(0, 20);

      if (parsed.length === 0) { toast.error('No URLs found in CSV'); return; }
      setRows(parsed);
      setStep('preview');
    };
    reader.readAsText(file);
  };

  /* Remove a row from preview */
  const removeRow = (i) => setRows(r => r.filter((_, idx) => idx !== i));

  /* Update title in preview */
  const updateTitle = (i, val) => setRows(r => r.map((row, idx) => idx === i ? { ...row, title: val } : row));

  /* Submit bulk creation */
  const handleSubmit = async () => {
    setLoading(true);
    try {
      const payload = rows.map(r => ({ originalUrl: r.originalUrl, title: r.title || undefined }));
      const res = await urlAPI.createBulk(payload);
      setResults(res.data);
      setStep('done');
      toast.success(res.data.message);
      if (res.data.summary.succeeded > 0) onCreated();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  /* Download results as CSV */
  const downloadResults = () => {
    if (!results) return;
    const header = 'Original URL,Short URL,Status,Error\n';
    const rows = results.results.map(r =>
      `"${r.originalUrl}","${r.shortUrl || ''}","${r.success ? 'Success' : 'Failed'}","${r.error || ''}"`
    ).join('\n');
    const blob = new Blob([header + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'bulk-urls.csv'; a.click();
    URL.revokeObjectURL(url);
    toast.success('CSV downloaded');
  };

  const labelStyle = { color: 'var(--text-secondary)' };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Bulk URL Shortening" size="lg">
      {/* ── STEP 1: INPUT ── */}
      {step === 'input' && (
        <div className="space-y-5">
          {/* Tab switcher */}
          <div className="flex rounded-xl overflow-hidden" style={{ border: '1px solid var(--border)' }}>
            {[
              { id: 'paste', label: 'Paste URLs', icon: FileText },
              { id: 'csv',   label: 'Upload CSV', icon: Upload },
            ].map(({ id, label, icon: Icon }) => (
              <button key={id} onClick={() => setTab(id)}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-semibold transition-all"
                style={{
                  background: tab === id ? 'rgba(124,58,237,0.2)' : 'transparent',
                  color: tab === id ? '#a78bfa' : 'var(--text-muted)',
                  borderRight: id === 'paste' ? '1px solid var(--border)' : 'none'
                }}>
                <Icon size={14} /> {label}
              </button>
            ))}
          </div>

          {tab === 'paste' ? (
            <div>
              <label className="block text-sm font-medium mb-2" style={labelStyle}>
                Paste URLs (one per line, max 20)
              </label>
              <textarea
                value={pasteText}
                onChange={e => setPasteText(e.target.value)}
                placeholder={`https://example.com/page-one\nhttps://example.com/page-two\nhttps://example.com/page-three`}
                rows={8}
                className="input-field font-mono text-xs resize-none"
                style={{ lineHeight: '1.6' }}
              />
              <p className="text-xs mt-1.5" style={{ color: 'var(--text-muted)' }}>
                {parseInput(pasteText).length} URL{parseInput(pasteText).length !== 1 ? 's' : ''} detected
              </p>
            </div>
          ) : (
            <div>
              <label className="block text-sm font-medium mb-2" style={labelStyle}>
                Upload CSV file
              </label>
              <div
                onClick={() => fileRef.current?.click()}
                className="rounded-2xl p-10 text-center cursor-pointer transition-all"
                style={{
                  border: '2px dashed var(--border)',
                  background: 'var(--bg-surface)',
                }}
                onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(124,58,237,0.4)'}
                onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}>
                <Upload size={32} className="mx-auto mb-3" style={{ color: '#7c3aed' }} />
                <p className="font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>
                  Click to upload CSV
                </p>
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                  Format: url,title (title optional) — max 20 rows
                </p>
                <input ref={fileRef} type="file" accept=".csv,.txt" className="hidden" onChange={handleFile} />
              </div>
              {/* Sample CSV download */}
              <button
                onClick={() => {
                  const sample = 'url,title\nhttps://example.com/page1,Page One\nhttps://example.com/page2,Page Two\n';
                  const blob = new Blob([sample], { type: 'text/csv' });
                  const a = document.createElement('a'); a.href = URL.createObjectURL(blob);
                  a.download = 'sample-bulk.csv'; a.click();
                }}
                className="mt-3 text-xs flex items-center gap-1.5 transition-colors"
                style={{ color: '#7c3aed' }}
                onMouseEnter={e => e.currentTarget.style.color = '#a78bfa'}
                onMouseLeave={e => e.currentTarget.style.color = '#7c3aed'}>
                <Download size={12} /> Download sample CSV
              </button>
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <button onClick={handleClose} className="btn-secondary flex-1 justify-center">Cancel</button>
            <button
              onClick={handlePreview}
              disabled={tab === 'paste' && parseInput(pasteText).length === 0}
              className="btn-primary flex-1 justify-center">
              <Layers size={15} /> Preview & Shorten
            </button>
          </div>
        </div>
      )}

      {/* ── STEP 2: PREVIEW ── */}
      {step === 'preview' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
              {rows.length} URL{rows.length !== 1 ? 's' : ''} ready to shorten
            </p>
            <button onClick={() => setStep('input')} className="text-xs" style={{ color: 'var(--text-muted)' }}>
              ← Edit
            </button>
          </div>

          {/* Scrollable table */}
          <div className="rounded-2xl overflow-hidden" style={{ border: '1px solid var(--border)', maxHeight: 320, overflowY: 'auto' }}>
            <table className="w-full text-sm">
              <thead style={{ position: 'sticky', top: 0, background: 'var(--bg-surface-2)', zIndex: 1 }}>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  <th className="text-left px-4 py-2.5 text-xs font-semibold" style={{ color: 'var(--text-muted)' }}>#</th>
                  <th className="text-left px-4 py-2.5 text-xs font-semibold" style={{ color: 'var(--text-muted)' }}>URL</th>
                  <th className="text-left px-4 py-2.5 text-xs font-semibold" style={{ color: 'var(--text-muted)' }}>Title (optional)</th>
                  <th className="px-4 py-2.5" />
                </tr>
              </thead>
              <tbody>
                {rows.map((row, i) => (
                  <tr key={i} style={{ borderBottom: i < rows.length - 1 ? '1px solid var(--border)' : 'none' }}>
                    <td className="px-4 py-2.5 text-xs" style={{ color: 'var(--text-muted)' }}>{i + 1}</td>
                    <td className="px-4 py-2.5 max-w-[200px]">
                      <p className="text-xs font-mono truncate" style={{ color: 'var(--text-primary)' }}>{row.originalUrl}</p>
                    </td>
                    <td className="px-4 py-2.5">
                      <input
                        type="text"
                        value={row.title}
                        onChange={e => updateTitle(i, e.target.value)}
                        placeholder="Optional title"
                        className="input-field py-1.5 text-xs"
                        style={{ minWidth: 120 }}
                      />
                    </td>
                    <td className="px-4 py-2.5">
                      <button onClick={() => removeRow(i)}
                        className="w-7 h-7 rounded-lg flex items-center justify-center transition-all"
                        style={{ color: 'var(--text-muted)' }}
                        onMouseEnter={e => { e.currentTarget.style.color = '#f87171'; e.currentTarget.style.background = 'rgba(239,68,68,0.1)'; }}
                        onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-muted)'; e.currentTarget.style.background = 'transparent'; }}>
                        <Trash2 size={13} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex gap-3">
            <button onClick={() => setStep('input')} className="btn-secondary flex-1 justify-center">Back</button>
            <button onClick={handleSubmit} disabled={loading || rows.length === 0} className="btn-primary flex-1 justify-center">
              {loading
                ? <><Loader2 size={15} className="animate-spin" />Shortening {rows.length} URLs…</>
                : <><Layers size={15} />Shorten {rows.length} URLs</>
              }
            </button>
          </div>
        </div>
      )}

      {/* ── STEP 3: RESULTS ── */}
      {step === 'done' && results && (
        <div className="space-y-4">
          {/* Summary */}
          <div className="grid grid-cols-3 gap-3">
            <div className="rounded-2xl p-4 text-center"
              style={{ background: 'rgba(74,222,128,0.1)', border: '1px solid rgba(74,222,128,0.2)' }}>
              <div className="text-2xl font-black" style={{ color: '#4ade80' }}>{results.summary.succeeded}</div>
              <div className="text-xs font-medium mt-0.5" style={{ color: '#4ade80' }}>Succeeded</div>
            </div>
            <div className="rounded-2xl p-4 text-center"
              style={{ background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.2)' }}>
              <div className="text-2xl font-black" style={{ color: '#f87171' }}>{results.summary.failed}</div>
              <div className="text-xs font-medium mt-0.5" style={{ color: '#f87171' }}>Failed</div>
            </div>
            <div className="rounded-2xl p-4 text-center"
              style={{ background: 'rgba(124,58,237,0.1)', border: '1px solid rgba(124,58,237,0.2)' }}>
              <div className="text-2xl font-black" style={{ color: '#a78bfa' }}>{results.summary.total}</div>
              <div className="text-xs font-medium mt-0.5" style={{ color: '#a78bfa' }}>Total</div>
            </div>
          </div>

          {/* Results list */}
          <div className="rounded-2xl overflow-hidden" style={{ border: '1px solid var(--border)', maxHeight: 280, overflowY: 'auto' }}>
            {results.results.map((r, i) => (
              <div key={i} className="flex items-center gap-3 px-4 py-3"
                style={{ borderBottom: i < results.results.length - 1 ? '1px solid var(--border)' : 'none' }}>
                {r.success
                  ? <CheckCircle2 size={16} style={{ color: '#4ade80', shrink: 0 }} />
                  : <XCircle size={16} style={{ color: '#f87171', shrink: 0 }} />
                }
                <div className="flex-1 min-w-0">
                  <p className="text-xs truncate" style={{ color: 'var(--text-muted)' }}>{r.originalUrl}</p>
                  {r.success
                    ? <p className="text-xs font-mono font-semibold" style={{ color: '#a78bfa' }}>{r.shortUrl}</p>
                    : <p className="text-xs" style={{ color: '#f87171' }}>{r.error}</p>
                  }
                </div>
                {r.success && (
                  <button
                    onClick={() => { copyToClipboard(r.shortUrl); toast.success('Copied!'); }}
                    className="text-xs px-2 py-1 rounded-lg transition-all shrink-0"
                    style={{ background: 'rgba(124,58,237,0.1)', color: '#a78bfa', border: '1px solid rgba(124,58,237,0.2)' }}>
                    Copy
                  </button>
                )}
              </div>
            ))}
          </div>

          <div className="flex gap-3">
            <button onClick={downloadResults} className="btn-secondary flex-1 justify-center">
              <Download size={14} /> Download CSV
            </button>
            <button onClick={handleClose} className="btn-primary flex-1 justify-center">
              Done
            </button>
          </div>
        </div>
      )}
    </Modal>
  );
}
