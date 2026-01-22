import { useState, useEffect } from 'react';
import { Download, X, Film, FileSize, Check, Loader } from 'lucide-react';

/**
 * Download Modal with Quality Selection
 * Allows users to select video quality before downloading
 */
export const DownloadModal = ({
  isOpen,
  onClose,
  videoFormats,
  onDownload,
  isDownloading,
  darkMode,
}) => {
  const [selectedFormat, setSelectedFormat] = useState(null);

  useEffect(() => {
    if (videoFormats && videoFormats.length > 0 && !selectedFormat) {
      // Auto-select HD quality if available, otherwise SD
      const hdFormat = videoFormats.find(f => f.height >= 720);
      setSelectedFormat(hdFormat || videoFormats[0]);
    }
  }, [videoFormats, selectedFormat]);

  if (!isOpen || !videoFormats || videoFormats.length === 0) return null;

  const getQualityLabel = (format) => {
    if (format.height) {
      return `${format.height}p`;
    }
    if (format.format_id) {
      const match = format.format_id.match(/(\d+)p/);
      if (match) return `${match[1]}p`;
    }
    return 'SD';
  };

  const getEstimatedSize = (format) => {
    if (format.filesize) {
      return format.filesize < 1000000
        ? `${(format.filesize / 1024).toFixed(1)} KB`
        : `${(format.filesize / 1024 / 1024).toFixed(1)} MB`;
    }
    if (format.height) {
      // Rough estimation based on height
      const sizes = { 1080: '150 MB', 720: '80 MB', 480: '40 MB', 360: '25 MB' };
      return sizes[format.height] || '~50 MB';
    }
    return 'Unknown';
  };

  const getFormatType = (format) => {
    return format.ext || format.vcodec?.includes('h264') ? 'MP4' : 'WebM';
  };

  const getFormatColor = (height) => {
    if (height >= 1080) return 'from-purple-500 to-pink-500';
    if (height >= 720) return 'from-blue-500 to-cyan-500';
    if (height >= 480) return 'from-green-500 to-emerald-500';
    return 'from-gray-500 to-slate-500';
  };

  const handleDownload = () => {
    if (selectedFormat) {
      onDownload(selectedFormat);
    }
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      <div
        className={`relative w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden ${
          darkMode ? 'bg-gray-800' : 'bg-white'
        }`}
      >
        {/* Header */}
        <div className={`p-4 border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="bg-gradient-to-br from-green-500 to-emerald-600 p-2 rounded-xl">
                <Download className="w-5 h-5 text-white" />
              </div>
              <h2 className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                Download Video
              </h2>
            </div>
            <button
              onClick={onClose}
              disabled={isDownloading}
              className={`p-2 rounded-xl transition ${
                darkMode
                  ? 'hover:bg-gray-700 text-gray-400 hover:text-white'
                  : 'hover:bg-gray-100 text-gray-500 hover:text-gray-900'
              } ${isDownloading ? 'opacity-50 cursor-not-allowed' : ''}`}
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          <p className={`text-sm mb-4 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Select your preferred video quality:
          </p>

          {/* Format Options */}
          <div className="space-y-3 mb-6">
            {videoFormats.map((format, index) => {
              const height = format.height || 480;
              const qualityLabel = getQualityLabel(format);
              const isSelected = selectedFormat?.format_id === format.format_id;
              const estimatedSize = getEstimatedSize(format);
              const formatType = getFormatType(format);
              const colorClass = getFormatColor(height);

              return (
                <button
                  key={format.format_id || index}
                  onClick={() => setSelectedFormat(format)}
                  disabled={isDownloading}
                  className={`w-full p-4 rounded-xl border-2 transition-all duration-200 text-left ${
                    isSelected
                      ? 'border-green-500 bg-green-500/10 scale-[1.02]'
                      : darkMode
                        ? 'border-gray-600 hover:border-gray-500 bg-gray-700'
                        : 'border-gray-200 hover:border-gray-300 bg-gray-50'
                  } ${isDownloading ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {/* Quality Badge */}
                      <div className={`relative w-14 h-14 rounded-xl bg-gradient-to-br ${colorClass} flex items-center justify-center shadow-lg`}>
                        <Film className="w-6 h-6 text-white" />
                        {height >= 720 && !isSelected && (
                          <div className="absolute -top-1 -right-1 px-1.5 py-0.5 rounded-full bg-yellow-400 text-yellow-900 text-[8px] font-bold">
                            HD
                          </div>
                        )}
                        {isSelected && (
                          <div className="absolute inset-0 bg-black/30 rounded-xl flex items-center justify-center">
                            <Check className="w-8 h-8 text-white" />
                          </div>
                        )}
                      </div>

                      <div>
                        <div className="flex items-center gap-2">
                          <span className={`font-bold text-lg ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                            {qualityLabel}
                          </span>
                          <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                            darkMode ? 'bg-gray-600 text-gray-300' : 'bg-gray-200 text-gray-600'
                          }`}>
                            {formatType}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 text-xs mt-1">
                          <span className={darkMode ? 'text-gray-400' : 'text-gray-500'}>
                            {format.width || '1280'} x {format.height || '720'}
                          </span>
                          <span className={darkMode ? 'text-gray-400' : 'text-gray-500'}>
                            •
                          </span>
                          <span className={`flex items-center gap-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                            <FileSize className="w-3 h-3" />
                            {estimatedSize}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Selection Indicator */}
                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                      isSelected ? 'border-green-500 bg-green-500' : darkMode ? 'border-gray-500' : 'border-gray-300'
                    }`}>
                      {isSelected && <Check className="w-4 h-4 text-white" />}
                    </div>
                  </div>

                  {/* Format Details */}
                  {format.vcodec && (
                    <div className={`mt-2 text-xs ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                      Codec: {format.vcodec} / {format.acodec || 'audio'}
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          {/* Download Button */}
          <button
            onClick={handleDownload}
            disabled={!selectedFormat || isDownloading}
            className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-4 px-6 rounded-xl transition duration-200 flex items-center justify-center gap-3 shadow-lg shadow-green-500/30"
          >
            {isDownloading ? (
              <>
                <Loader className="w-5 h-5 animate-spin" />
                Downloading...
              </>
            ) : (
              <>
                <Download className="w-5 h-5" />
                Download {selectedFormat && getQualityLabel(selectedFormat)}
              </>
            )}
          </button>

          {/* Info */}
          <p className={`text-xs mt-4 text-center ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
            Download speed depends on your internet connection and the video size.
          </p>
        </div>
      </div>
    </div>
  );
};
