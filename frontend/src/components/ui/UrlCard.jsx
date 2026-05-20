import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Copy, Trash2, BarChart3, ExternalLink, QrCode,
  Clock, MousePointerClick, CheckCheck, Calendar,
  AlertTriangle, Pencil
} from 'lucide-react';
import { copyToClipboard, formatRelativeTime, formatDate, truncateUrl } from '../../utils/helpers';
import toast from 'react-hot-toast';

const UrlCard = ({ url, onDelete, onEdit }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    const success = await copyToClipboard(url.shortUrl);
    if (success) {
      setCopied(true);
      toast.success('Copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const isExpired = url.isExpired || (url.expiresAt && new Date(url.expiresAt) < new Date());
  const isInactive = !url.isActive;

  return (
    <div className={`card hover:border-white/20 transition-all duration-200 group animate-fade-in ${
      isExpired || isInactive ? 'opacity-60' : ''
    }`}>
      <div className="flex flex-col gap-3">
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            {/* Title or short code */}
            <div className="flex items-center gap-2 mb-1">
              {url.title && (
                <span className="text-sm font-semibold text-gray-200 truncate">{url.title}</span>
              )}
              {isExpired && (
                <span className="flex items-center gap-1 text-xs bg-red-500/20 text-red-400 px-2 py-0.5 rounded-full border border-red-500/20">
                  <AlertTriangle className="w-3 h-3" /> Expired
                </span>
              )}
              {isInactive && !isExpired && (
                <span className="text-xs bg-gray-500/20 text-gray-400 px-2 py-0.5 rounded-full border border-gray-500/20">
                  Inactive
                </span>
              )}
            </div>

            {/* Short URL */}
            <div className="flex items-center gap-2">
              <a
                href={url.shortUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary-400 hover:text-primary-300 font-mono text-sm font-medium transition-colors flex items-center gap-1"
              >
                {url.shortUrl}
                <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
              </a>
            </div>

            {/* Original URL */}
            <p className="text-gray-500 text-xs mt-1 truncate" title={url.originalUrl}>
              {truncateUrl(url.originalUrl, 60)}
            </p>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-1 shrink-0">
            <button
              onClick={handleCopy}
              title="Copy short URL"
              className="p-2 rounded-lg text-gray-400 hover:text-gray-200 hover:bg-white/10 transition-colors"
            >
              {copied ? <CheckCheck className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
            </button>
            <button
              onClick={() => onEdit(url)}
              title="Edit"
              className="p-2 rounded-lg text-gray-400 hover:text-gray-200 hover:bg-white/10 transition-colors"
            >
              <Pencil className="w-4 h-4" />
            </button>
            <Link
              to={`/analytics/${url._id}`}
              title="View analytics"
              className="p-2 rounded-lg text-gray-400 hover:text-primary-400 hover:bg-primary-500/10 transition-colors"
            >
              <BarChart3 className="w-4 h-4" />
            </Link>
            <button
              onClick={() => onDelete(url)}
              title="Delete"
              className="p-2 rounded-lg text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Stats Row */}
        <div className="flex items-center gap-4 pt-2 border-t border-white/5">
          <div className="flex items-center gap-1.5 text-xs text-gray-500">
            <MousePointerClick className="w-3.5 h-3.5 text-primary-500" />
            <span className="font-semibold text-gray-300">{url.totalClicks || 0}</span>
            <span>clicks</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-gray-500">
            <Clock className="w-3.5 h-3.5 text-accent-500" />
            <span>{formatRelativeTime(url.lastVisited)}</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-gray-500 ml-auto">
            <Calendar className="w-3.5 h-3.5" />
            <span>{formatDate(url.createdAt)}</span>
          </div>
          {url.expiresAt && !isExpired && (
            <div className="flex items-center gap-1.5 text-xs text-amber-500">
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>Expires {formatRelativeTime(url.expiresAt)}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UrlCard;
