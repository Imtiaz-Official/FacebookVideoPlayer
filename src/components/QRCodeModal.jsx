import { useState, useRef } from 'react';
import { QrCode, X, Download, Share2, Copy, Check } from 'lucide-react';

/**
 * QR Code Modal for sharing video URLs
 * Generates QR codes using a free API
 */
export const QRCodeModal = ({ isOpen, onClose, url, title, darkMode }) => {
  const [copied, setCopied] = useState(false);
  const canvasRef = useRef(null);

  if (!isOpen) return null;

  // Use a free QR code API (qrserver.com)
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(url)}`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleDownload = () => {
    // Create a link and trigger download
    const link = document.createElement('a');
    link.href = qrCodeUrl;
    link.download = `qr-code-${Date.now()}.png`;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: title || 'Facebook Video',
          url: url,
        });
      } catch (err) {
        console.log('Share canceled');
      }
    }
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      <div
        className={`relative w-full max-w-sm rounded-2xl shadow-2xl overflow-hidden ${
          darkMode ? 'bg-gray-800' : 'bg-white'
        }`}
      >
        {/* Header */}
        <div className={`p-4 border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-2 rounded-xl">
                <QrCode className="w-5 h-5 text-white" />
              </div>
              <h2 className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                Share via QR Code
              </h2>
            </div>
            <button
              onClick={onClose}
              className={`p-2 rounded-xl transition ${
                darkMode
                  ? 'hover:bg-gray-700 text-gray-400 hover:text-white'
                  : 'hover:bg-gray-100 text-gray-500 hover:text-gray-900'
              }`}
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* QR Code Image */}
          <div className="flex justify-center mb-6">
            <div className={`p-4 rounded-2xl ${darkMode ? 'bg-white' : 'bg-gray-100'}`}>
              <img
                src={qrCodeUrl}
                alt="QR Code"
                className="w-64 h-64"
              />
            </div>
          </div>

          {/* URL Display */}
          <div className={`mb-6 p-4 rounded-xl ${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
            <p className="text-xs text-gray-500 mb-1">Video URL</p>
            <p className="text-sm break-all font-mono truncate">
              {url}
            </p>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <button
              onClick={handleCopy}
              className={`w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-medium transition ${
                darkMode
                  ? 'bg-gray-700 hover:bg-gray-600 text-white'
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-900'
              }`}
            >
              {copied ? (
                <>
                  <Check className="w-5 h-5 text-green-500" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="w-5 h-5" />
                  Copy URL
                </>
              )}
            </button>

            {navigator.share && (
              <button
                onClick={handleShare}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-medium transition"
              >
                <Share2 className="w-5 h-5" />
                Share
              </button>
            )}

            <button
              onClick={handleDownload}
              className={`w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-medium transition ${
                darkMode
                  ? 'bg-gray-700 hover:bg-gray-600 text-white'
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-900'
              }`}
            >
              <Download className="w-5 h-5" />
              Download QR Code
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
