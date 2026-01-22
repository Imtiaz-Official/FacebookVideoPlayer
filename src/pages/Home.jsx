import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Link2, Video, Sparkles, ArrowRight, Download, Zap, Shield, Play } from 'lucide-react';

export default function Home() {
  const [url, setUrl] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!url.trim()) return;

    // Validate Facebook URL
    const fbRegex = /(facebook\.com|fb\.watch)/i;
    if (!fbRegex.test(url)) {
      alert('Please enter a valid Facebook URL');
      return;
    }

    setIsProcessing(true);
    navigate(`/player?url=${encodeURIComponent(url)}`);
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Hero Section */}
      <section className="flex-1 flex items-center justify-center px-4 py-16 sm:py-24">
        <div className="max-w-4xl mx-auto w-full text-center">
          {/* Icon */}
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-purple-600 to-blue-600 rounded-3xl shadow-2xl mb-8 relative">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-600 to-blue-600 rounded-3xl blur-2xl opacity-40 animate-pulse"></div>
            <Video className="w-10 h-10 text-white relative z-10" />
          </div>

          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-100 to-blue-100 dark:from-purple-950/50 dark:to-blue-950/50 text-purple-700 dark:text-purple-300 px-4 py-2 rounded-full text-sm font-semibold mb-8 border border-purple-200 dark:border-purple-800">
            <Sparkles className="w-4 h-4" />
            HD Video Extraction
          </div>

          {/* Heading */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-6 tracking-tight">
            <span className="bg-gradient-to-r from-purple-600 via-blue-600 to-purple-600 bg-clip-text text-transparent bg-[length:200%_auto] animate-shimmer">
              Facebook Video Player
            </span>
          </h1>

          {/* Description */}
          <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto mb-12 leading-relaxed">
            Extract and watch Facebook videos in stunning HD quality. No ads, no distractions, just pure content.
          </p>

          {/* URL Input Form */}
          <form onSubmit={handleSubmit} className="max-w-2xl mx-auto mb-16">
            <div className="flex flex-col sm:flex-row gap-3 items-stretch">
              <div className="relative flex-1">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Link2 className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="url"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="Paste Facebook video URL here..."
                  className="w-full h-14 pl-12 pr-4 rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:border-purple-500 focus:ring-4 focus:ring-purple-500/20 transition-all text-base"
                  required
                />
              </div>
              <button
                type="submit"
                disabled={isProcessing || !url.trim()}
                className="btn btn-primary h-14 px-8 text-base font-semibold whitespace-nowrap disabled:opacity-50"
              >
                {isProcessing ? (
                  <>
                    <div className="spinner" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Play className="w-5 h-5" />
                    Extract & Play
                  </>
                )}
              </button>
            </div>

            {/* Supported URLs */}
            <div className="mt-6 flex flex-wrap items-center justify-center gap-3 text-sm">
              <span className="text-gray-500 dark:text-gray-400">Supports:</span>
              <span className="text-purple-600 dark:text-purple-400 font-medium">facebook.com/watch</span>
              <span className="text-gray-300 dark:text-gray-600">•</span>
              <span className="text-blue-600 dark:text-blue-400 font-medium">fb.watch</span>
              <span className="text-gray-300 dark:text-gray-600">•</span>
              <span className="text-indigo-600 dark:text-indigo-400 font-medium">videos</span>
              <span className="text-gray-300 dark:text-gray-600">•</span>
              <span className="text-pink-600 dark:text-pink-400 font-medium">reels</span>
            </div>
          </form>
        </div>
      </section>

      {/* Features Section */}
      <section className="px-4 pb-16 sm:pb-24">
        <div className="max-w-6xl mx-auto">
          {/* Feature Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div className="card group hover:border-purple-200 dark:hover:border-purple-800 transition-all">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform">
                <Video className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">HD Quality</h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">Watch videos in 1080p, 720p, or 480p quality with crisp clear audio.</p>
            </div>

            <div className="card group hover:border-green-200 dark:hover:border-green-800 transition-all">
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No Ads</h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">Clean, distraction-free viewing experience without any interruptions.</p>
            </div>

            <div className="card group hover:border-blue-200 dark:hover:border-blue-800 transition-all">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform">
                <Download className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Download</h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">Save videos directly to your device for offline watching anytime.</p>
            </div>
          </div>

          {/* Secondary Features */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="card group hover:border-orange-200 dark:hover:border-orange-800 transition-all">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-amber-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg group-hover:scale-110 transition-transform">
                  <Zap className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">Lightning Fast</h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">Extract videos in seconds with our optimized backend</p>
                </div>
              </div>
            </div>

            <div className="card group hover:border-rose-200 dark:hover:border-rose-800 transition-all">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-rose-500 to-pink-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg group-hover:scale-110 transition-transform">
                  <Shield className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">Secure & Private</h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">Your data is never stored or shared with anyone</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
