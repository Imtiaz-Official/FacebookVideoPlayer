import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Link2, Video, Sparkles, ArrowRight, Download, Zap, Shield } from 'lucide-react';

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

    // Navigate to player page with the URL
    navigate(`/player?url=${encodeURIComponent(url)}`);
  };

  return (
    <div className="min-h-screen">
      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-12 sm:py-16 pt-8">
        {/* Hero Section */}
        <div className="text-center mb-12 animate-fade-in">
          {/* Animated Icon */}
          <div className="inline-flex items-center justify-center mb-6">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl blur-xl opacity-30 animate-pulse-slow"></div>
              <div className="relative bg-gradient-to-r from-purple-600 to-blue-600 p-4 rounded-2xl shadow-xl animate-float">
                <Video className="w-12 h-12 text-white" />
              </div>
            </div>
          </div>

          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-purple-100 dark:bg-purple-950/50 text-purple-700 dark:text-purple-300 px-4 py-2 rounded-full text-sm font-medium mb-6 border border-purple-200 dark:border-purple-800">
            <Sparkles className="w-4 h-4" />
            HD Video Extraction
          </div>

          {/* Heading */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-4">
            <span className="gradient-text">Facebook Video</span>
            <br />
            <span className="text-gray-900 dark:text-white">Player & Extractor</span>
          </h1>

          {/* Description */}
          <p className="text-gray-600 dark:text-gray-400 text-lg max-w-2xl mx-auto">
            Extract and watch Facebook videos in stunning HD quality. No ads, no distractions, just pure content.
          </p>
        </div>

        {/* URL Input Card */}
        <div className="card max-w-2xl mx-auto mb-12 animate-fade-in" style={{ animationDelay: '0.1s' }}>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Facebook Video URL
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Link2 className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="url"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://www.facebook.com/watch/..."
                  className="input pl-12"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isProcessing || !url.trim()}
              className="btn btn-primary w-full text-base"
            >
              {isProcessing ? (
                <>
                  <div className="spinner" />
                  Processing...
                </>
              ) : (
                <>
                  Extract & Play
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </form>

          {/* Supported URLs */}
          <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
            <p className="text-xs text-gray-500 dark:text-gray-400 text-center mb-3">
              Supported URL formats:
            </p>
            <div className="flex flex-wrap justify-center gap-2">
              <span className="px-3 py-1 bg-purple-100 dark:bg-purple-950/50 text-purple-700 dark:text-purple-300 rounded-full text-xs font-medium border border-purple-200 dark:border-purple-800">
                facebook.com/watch
              </span>
              <span className="px-3 py-1 bg-blue-100 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 rounded-full text-xs font-medium border border-blue-200 dark:border-blue-800">
                fb.watch
              </span>
              <span className="px-3 py-1 bg-indigo-100 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 rounded-full text-xs font-medium border border-indigo-200 dark:border-indigo-800">
                facebook.com/videos
              </span>
              <span className="px-3 py-1 bg-pink-100 dark:bg-pink-950/50 text-pink-700 dark:text-pink-300 rounded-full text-xs font-medium border border-pink-200 dark:border-pink-800">
                facebook.com/reel
              </span>
            </div>
          </div>
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
          <div className="card text-center animate-fade-in" style={{ animationDelay: '0.2s' }}>
            <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
              <Video className="w-7 h-7 text-white" />
            </div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2 text-lg">HD Quality</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">Watch in 1080p, 720p, or 480p quality</p>
          </div>

          <div className="card text-center animate-fade-in" style={{ animationDelay: '0.3s' }}>
            <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
              <Sparkles className="w-7 h-7 text-white" />
            </div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2 text-lg">No Ads</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">Clean, distraction-free viewing</p>
          </div>

          <div className="card text-center animate-fade-in" style={{ animationDelay: '0.4s' }}>
            <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
              <Download className="w-7 h-7 text-white" />
            </div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2 text-lg">Download</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">Save videos for offline watching</p>
          </div>
        </div>

        {/* Additional Features Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mt-6">
          <div className="card animate-fade-in" style={{ animationDelay: '0.5s' }}>
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-amber-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg">
                <Zap className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-1">Lightning Fast</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">Extract videos in seconds with our optimized backend</p>
              </div>
            </div>
          </div>

          <div className="card animate-fade-in" style={{ animationDelay: '0.6s' }}>
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-gradient-to-br from-rose-500 to-pink-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-1">Secure & Private</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">Your data is never stored or shared</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
