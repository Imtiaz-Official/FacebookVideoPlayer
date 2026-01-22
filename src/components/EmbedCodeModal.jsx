import { useState, useRef } from 'react';
import { Code, X, Copy, Check, Settings, Monitor, Smartphone } from 'lucide-react';

/**
 * Embed Code Generator Modal
 * Generates iframe embed codes for sharing videos on other sites
 */
export const EmbedCodeModal = ({ isOpen, onClose, videoUrl, videoTitle, darkMode }) => {
  const [copied, setCopied] = useState(false);
  const [size, setSize] = useState('responsive');
  const [customWidth, setCustomWidth] = useState(640);
  const [customHeight, setCustomHeight] = useState(360);
  const [autoplay, setAutoplay] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [loop, setLoop] = useState(false);

  if (!isOpen || !videoUrl) return null;

  // Generate the embed code
  const generateEmbedCode = () => {
    const baseUrl = window.location.origin;
    const params = new URLSearchParams();

    if (autoplay) params.append('autoplay', '1');
    if (!showControls) params.append('controls', '0');
    if (loop) params.append('loop', '1');

    const src = `${baseUrl}/embed?url=${encodeURIComponent(videoUrl)}${params.toString() ? '&' + params.toString() : ''}`;

    if (size === 'responsive') {
      return `<div style="position: relative; padding-bottom: 56.25%; height: 0; overflow: hidden;">
  <iframe
    src="${src}"
    style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; border: 0;"
    allowfullscreen
    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
    title="${videoTitle || 'Facebook Video'}">
  </iframe>
</div>`;
    } else {
      return `<iframe
  src="${src}"
  width="${customWidth}"
  height="${customHeight}"
  style="border: 0;"
  allowfullscreen
  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
  title="${videoTitle || 'Facebook Video'}">
</iframe>`;
    }
  };

  const embedCode = generateEmbedCode();

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(embedCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const sizePresets = [
    { name: 'Responsive', value: 'responsive', icon: Monitor },
    { name: '640x360', value: '640x360', width: 640, height: 360 },
    { name: '854x480', value: '854x480', width: 854, height: 480 },
    { name: '1280x720', value: '1280x720', width: 1280, height: 720 },
  ];

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      <div
        className={`relative w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden ${
          darkMode ? 'bg-gray-800' : 'bg-white'
        }`}
      >
        {/* Header */}
        <div className={`p-4 border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="bg-gradient-to-br from-blue-500 to-cyan-600 p-2 rounded-xl">
                <Code className="w-5 h-5 text-white" />
              </div>
              <h2 className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                Embed Video
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

        <div className="p-6">
          {/* Size Options */}
          <div className="mb-6">
            <label className={`block text-sm font-medium mb-3 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              <Settings className="w-4 h-4 inline mr-2" />
              Player Size
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {sizePresets.map((preset) => {
                const Icon = preset.icon;
                return (
                  <button
                    key={preset.value}
                    onClick={() => {
                      setSize(preset.value);
                      if (preset.width) setCustomWidth(preset.width);
                      if (preset.height) setCustomHeight(preset.height);
                    }}
                    className={`p-3 rounded-xl border-2 transition flex flex-col items-center gap-2 ${
                      size === preset.value
                        ? 'border-blue-500 bg-blue-500/10'
                        : darkMode
                          ? 'border-gray-600 hover:border-gray-500 bg-gray-700'
                          : 'border-gray-200 hover:border-gray-300 bg-gray-50'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="text-xs font-medium">{preset.name}</span>
                  </button>
                );
              })}
            </div>

            {/* Custom Size */}
            {size !== 'responsive' && (
              <div className="grid grid-cols-2 gap-4 mt-4">
                <div>
                  <label className={`block text-xs mb-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    Width (px)
                  </label>
                  <input
                    type="number"
                    value={customWidth}
                    onChange={(e) => setCustomWidth(parseInt(e.target.value) || 640)}
                    className={`w-full px-3 py-2 rounded-lg outline-none border-2 ${
                      darkMode
                        ? 'bg-gray-700 border-gray-600 text-white focus:border-blue-500'
                        : 'bg-gray-100 border-gray-200 text-gray-900 focus:border-blue-500'
                    }`}
                  />
                </div>
                <div>
                  <label className={`block text-xs mb-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    Height (px)
                  </label>
                  <input
                    type="number"
                    value={customHeight}
                    onChange={(e) => setCustomHeight(parseInt(e.target.value) || 360)}
                    className={`w-full px-3 py-2 rounded-lg outline-none border-2 ${
                      darkMode
                        ? 'bg-gray-700 border-gray-600 text-white focus:border-blue-500'
                        : 'bg-gray-100 border-gray-200 text-gray-900 focus:border-blue-500'
                    }`}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Player Options */}
          <div className="mb-6">
            <label className={`block text-sm font-medium mb-3 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              Player Options
            </label>
            <div className="space-y-3">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={autoplay}
                  onChange={(e) => setAutoplay(e.target.checked)}
                  className="w-5 h-5 rounded border-gray-500 text-blue-500 focus:ring-blue-500"
                />
                <span className={darkMode ? 'text-gray-300' : 'text-gray-700'}>Autoplay</span>
              </label>

              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showControls}
                  onChange={(e) => setShowControls(e.target.checked)}
                  className="w-5 h-5 rounded border-gray-500 text-blue-500 focus:ring-blue-500"
                />
                <span className={darkMode ? 'text-gray-300' : 'text-gray-700'}>Show Controls</span>
              </label>

              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={loop}
                  onChange={(e) => setLoop(e.target.checked)}
                  className="w-5 h-5 rounded border-gray-500 text-blue-500 focus:ring-blue-500"
                />
                <span className={darkMode ? 'text-gray-300' : 'text-gray-700'}>Loop Video</span>
              </label>
            </div>
          </div>

          {/* Embed Code */}
          <div className="mb-4">
            <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              Embed Code
            </label>
            <div className={`relative rounded-xl overflow-hidden ${darkMode ? 'bg-gray-900' : 'bg-gray-100'}`}>
              <pre className="p-4 text-xs overflow-x-auto font-mono whitespace-pre-wrap break-words max-h-48 overflow-y-auto">
                <code className={darkMode ? 'text-green-400' : 'text-gray-800'}>{embedCode}</code>
              </pre>
              <button
                onClick={handleCopy}
                className={`absolute top-2 right-2 p-2 rounded-lg transition ${
                  darkMode
                    ? 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                    : 'bg-white hover:bg-gray-200 text-gray-700 shadow'
                }`}
                title="Copy to clipboard"
              >
                {copied ? (
                  <Check className="w-4 h-4 text-green-500" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>

          {/* Preview */}
          <div className="mb-4">
            <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              Preview
            </label>
            <div className={`rounded-xl overflow-hidden border-2 ${darkMode ? 'border-gray-600' : 'border-gray-200'}`}>
              <div
                className="bg-gray-900 flex items-center justify-center"
                style={{
                  width: size === 'responsive' ? '100%' : customWidth + 'px',
                  height: size === 'responsive' ? '0' : customHeight + 'px',
                  paddingBottom: size === 'responsive' ? '56.25%' : '0',
                  position: size === 'responsive' ? 'relative' : 'static',
                }}
              >
                <div className="absolute inset-0 flex items-center justify-center">
                  <p className="text-gray-400 text-sm">Video Player Preview</p>
                </div>
              </div>
            </div>
          </div>

          {/* Copy Button */}
          <button
            onClick={handleCopy}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-xl transition flex items-center justify-center gap-2"
          >
            {copied ? (
              <>
                <Check className="w-5 h-5" />
                Copied to Clipboard!
              </>
            ) : (
              <>
                <Copy className="w-5 h-5" />
                Copy Embed Code
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
