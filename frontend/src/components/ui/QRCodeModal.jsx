import React, { useEffect, useRef } from 'react';
import QRCode from 'qrcode';
import { Download } from 'lucide-react';
import Modal from './Modal';
import toast from 'react-hot-toast';

const QRCodeModal = ({ isOpen, onClose, url, shortCode }) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    if (isOpen && url && canvasRef.current) {
      QRCode.toCanvas(canvasRef.current, url, {
        width: 256,
        margin: 2,
        color: {
          dark: '#ffffff',
          light: '#111827'
        }
      }).catch(console.error);
    }
  }, [isOpen, url]);

  const handleDownload = () => {
    if (!canvasRef.current) return;
    const link = document.createElement('a');
    link.download = `qr-${shortCode}.png`;
    link.href = canvasRef.current.toDataURL();
    link.click();
    toast.success('QR code downloaded');
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="QR Code" size="sm">
      <div className="flex flex-col items-center gap-5">
        <div className="p-4 bg-gray-800 rounded-xl border border-white/10">
          <canvas ref={canvasRef} className="rounded-lg" />
        </div>
        <div className="text-center">
          <p className="text-sm text-gray-400 mb-1">Short URL</p>
          <p className="text-primary-400 font-mono text-sm">{url}</p>
        </div>
        <button onClick={handleDownload} className="btn-primary flex items-center gap-2 w-full justify-center">
          <Download className="w-4 h-4" />
          Download QR Code
        </button>
      </div>
    </Modal>
  );
};

export default QRCodeModal;
