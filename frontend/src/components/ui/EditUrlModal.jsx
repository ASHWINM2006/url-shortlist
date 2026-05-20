import React, { useState, useEffect } from 'react';
import { Link2, Calendar, Tag, AlertCircle, ToggleLeft, ToggleRight } from 'lucide-react';
import Modal from './Modal';
import { urlAPI } from '../../utils/api';
import { getErrorMessage } from '../../utils/helpers';
import toast from 'react-hot-toast';

const EditUrlModal = ({ isOpen, onClose, url, onUpdated }) => {
  const [form, setForm] = useState({ originalUrl: '', title: '', expiresAt: '', isActive: true });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (url) {
      setForm({
        originalUrl: url.originalUrl || '',
        title: url.title || '',
        expiresAt: url.expiresAt ? new Date(url.expiresAt).toISOString().slice(0, 16) : '',
        isActive: url.isActive !== false
      });
    }
  }, [url]);

  const validate = () => {
    const newErrors = {};
    if (!form.originalUrl.trim()) {
      newErrors.originalUrl = 'URL is required';
    } else {
      try {
        const u = new URL(form.originalUrl);
        if (!['http:', 'https:'].includes(u.protocol)) {
          newErrors.originalUrl = 'URL must start with http:// or https://';
        }
      } catch {
        newErrors.originalUrl = 'Please enter a valid URL';
      }
    }
    if (form.expiresAt && new Date(form.expiresAt) <= new Date()) {
      newErrors.expiresAt = 'Expiry date must be in the future';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      const payload = {
        originalUrl: form.originalUrl,
        title: form.title || null,
        isActive: form.isActive,
        expiresAt: form.expiresAt || null
      };

      const res = await urlAPI.update(url._id, payload);
      toast.success('URL updated successfully!');
      onUpdated(res.data.url);
      onClose();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: '' }));
  };

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const minDate = tomorrow.toISOString().slice(0, 16);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Edit URL" size="md">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1.5">
            Destination URL <span className="text-red-400">*</span>
          </label>
          <div className="relative">
            <Link2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input
              type="text"
              value={form.originalUrl}
              onChange={e => handleChange('originalUrl', e.target.value)}
              className={`input-field pl-10 ${errors.originalUrl ? 'border-red-500/50' : ''}`}
            />
          </div>
          {errors.originalUrl && (
            <p className="mt-1 text-xs text-red-400 flex items-center gap-1">
              <AlertCircle className="w-3 h-3" /> {errors.originalUrl}
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1.5">Title</label>
          <div className="relative">
            <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input
              type="text"
              value={form.title}
              onChange={e => handleChange('title', e.target.value)}
              placeholder="Optional title"
              className="input-field pl-10"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1.5">Expiry Date</label>
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input
              type="datetime-local"
              value={form.expiresAt}
              min={minDate}
              onChange={e => handleChange('expiresAt', e.target.value)}
              className={`input-field pl-10 ${errors.expiresAt ? 'border-red-500/50' : ''}`}
            />
          </div>
          {errors.expiresAt && (
            <p className="mt-1 text-xs text-red-400 flex items-center gap-1">
              <AlertCircle className="w-3 h-3" /> {errors.expiresAt}
            </p>
          )}
        </div>

        {/* Active Toggle */}
        <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/10">
          <div>
            <p className="text-sm font-medium text-gray-300">Link Status</p>
            <p className="text-xs text-gray-500">{form.isActive ? 'Link is active and accessible' : 'Link is disabled'}</p>
          </div>
          <button
            type="button"
            onClick={() => handleChange('isActive', !form.isActive)}
            className="transition-colors"
          >
            {form.isActive
              ? <ToggleRight className="w-8 h-8 text-primary-400" />
              : <ToggleLeft className="w-8 h-8 text-gray-500" />
            }
          </button>
        </div>

        <div className="flex gap-3 pt-2">
          <button type="button" onClick={onClose} className="btn-secondary flex-1" disabled={loading}>
            Cancel
          </button>
          <button type="submit" className="btn-primary flex-1 flex items-center justify-center gap-2" disabled={loading}>
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Saving...
              </>
            ) : 'Save Changes'}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default EditUrlModal;
