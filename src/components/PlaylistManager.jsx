import { useState, useEffect } from 'react';
import {
  ListPlus,
  Play,
  Trash2,
  X,
  Edit2,
  Check,
  FolderPlus,
  Folder,
  MoreVertical,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

/**
 * Playlist Manager Component
 * Allows users to create, manage, and play from playlists
 */
export const PlaylistManager = ({
  isOpen,
  onClose,
  playlists,
  onCreatePlaylist,
  onDeletePlaylist,
  onAddToPlaylist,
  onPlayPlaylist,
  currentVideo,
  darkMode,
}) => {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newPlaylistName, setNewPlaylistName] = useState('');
  const [selectedPlaylist, setSelectedPlaylist] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState('');
  const [expandedPlaylists, setExpandedPlaylists] = useState({});

  useEffect(() => {
    if (isOpen && !selectedPlaylist && playlists.length > 0) {
      setSelectedPlaylist(playlists[0].id);
    }
  }, [isOpen, playlists, selectedPlaylist]);

  const handleCreatePlaylist = () => {
    if (newPlaylistName.trim()) {
      onCreatePlaylist(newPlaylistName.trim());
      setNewPlaylistName('');
      setShowCreateForm(false);
    }
  };

  const handleAddToPlaylist = (playlistId) => {
    if (currentVideo) {
      onAddToPlaylist(playlistId, currentVideo);
    }
  };

  const handleDeletePlaylist = (playlistId, e) => {
    e.stopPropagation();
    if (confirm('Delete this playlist?')) {
      onDeletePlaylist(playlistId);
      if (selectedPlaylist === playlistId) {
        setSelectedPlaylist(playlists[0]?.id || null);
      }
    }
  };

  const handleRenamePlaylist = (playlistId) => {
    if (editName.trim()) {
      // This would need to be passed in from parent
      setEditingId(null);
      setEditName('');
    }
  };

  const toggleExpand = (playlistId) => {
    setExpandedPlaylists(prev => ({
      ...prev,
      [playlistId]: !prev[playlistId],
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[150] flex">
      <div
        className="fixed inset-0 bg-black/50"
        onClick={onClose}
      />
      <div
        className={`relative w-full sm:w-96 h-full ${
          darkMode ? 'bg-gray-800' : 'bg-white'
        } shadow-2xl overflow-y-auto`}
      >
        {/* Header */}
        <div className="p-4 border-b sticky top-0 z-10 bg-inherit">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="bg-gradient-to-br from-purple-500 to-pink-600 p-2 rounded-xl">
                <ListPlus className="w-5 h-5 text-white" />
              </div>
              <h2 className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                Playlists
              </h2>
            </div>
            <button
              onClick={onClose}
              className={`p-2 rounded-lg transition ${
                darkMode ? 'hover:bg-gray-700 text-gray-400' : 'hover:bg-gray-100 text-gray-600'
              }`}
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Create New Playlist Button */}
          {!showCreateForm ? (
            <button
              onClick={() => setShowCreateForm(true)}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-medium py-3 px-4 rounded-xl transition flex items-center justify-center gap-2"
            >
              <FolderPlus className="w-4 h-4" />
              Create New Playlist
            </button>
          ) : (
            <div className="space-y-2">
              <input
                type="text"
                value={newPlaylistName}
                onChange={(e) => setNewPlaylistName(e.target.value)}
                placeholder="Playlist name..."
                className={`w-full px-4 py-3 rounded-xl outline-none border-2 ${
                  darkMode
                    ? 'bg-gray-700 border-gray-600 text-white focus:border-purple-500'
                    : 'bg-gray-100 border-gray-200 text-gray-900 focus:border-purple-500'
                }`}
                autoFocus
                onKeyDown={(e) => e.key === 'Enter' && handleCreatePlaylist()}
              />
              <div className="flex gap-2">
                <button
                  onClick={handleCreatePlaylist}
                  disabled={!newPlaylistName.trim()}
                  className="flex-1 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white font-medium py-2 px-4 rounded-xl transition"
                >
                  Create
                </button>
                <button
                  onClick={() => {
                    setShowCreateForm(false);
                    setNewPlaylistName('');
                  }}
                  className={`px-4 py-2 rounded-xl font-medium transition ${
                    darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-700'
                  }`}
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Playlists List */}
        <div className="p-4 space-y-3">
          {playlists.length === 0 ? (
            <div className="text-center py-12">
              <Folder className={`w-16 h-16 mx-auto mb-4 ${darkMode ? 'text-gray-600' : 'text-gray-300'}`} />
              <p className={darkMode ? 'text-gray-400' : 'text-gray-500'}>
                No playlists yet
              </p>
              <p className={`text-sm mt-2 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                Create a playlist to organize your videos
              </p>
            </div>
          ) : (
            playlists.map((playlist) => (
              <div
                key={playlist.id}
                className={`rounded-xl border-2 overflow-hidden ${
                  darkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'
                }`}
              >
                {/* Playlist Header */}
                <div
                  className={`p-4 flex items-center justify-between cursor-pointer ${
                    darkMode ? 'hover:bg-gray-600' : 'hover:bg-gray-100'
                  }`}
                  onClick={() => toggleExpand(playlist.id)}
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <Folder className={`w-5 h-5 flex-shrink-0 ${darkMode ? 'text-purple-400' : 'text-purple-500'}`} />
                    <div className="flex-1 min-w-0">
                      {editingId === playlist.id ? (
                        <input
                          type="text"
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          onBlur={() => handleRenamePlaylist(playlist.id)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handleRenamePlaylist(playlist.id);
                            if (e.key === 'Escape') {
                              setEditingId(null);
                              setEditName('');
                            }
                          }}
                          className={`w-full px-2 py-1 rounded outline-none ${
                            darkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'
                          }`}
                          autoFocus
                          onClick={(e) => e.stopPropagation()}
                        />
                      ) : (
                        <h3 className={`font-semibold truncate ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                          {playlist.name}
                        </h3>
                      )}
                      <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        {playlist.videos?.length || 0} videos
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditingId(playlist.id);
                        setEditName(playlist.name);
                      }}
                      className={`p-2 rounded-lg transition ${
                        darkMode ? 'hover:bg-gray-500 text-gray-400' : 'hover:bg-gray-200 text-gray-500'
                      }`}
                      title="Rename"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>

                    {currentVideo && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleAddToPlaylist(playlist.id);
                        }}
                        className="p-2 bg-green-500/20 hover:bg-green-500/30 text-green-500 rounded-lg transition"
                        title="Add current video"
                      >
                        <Check className="w-4 h-4" />
                      </button>
                    )}

                    <button
                      onClick={(e) => handleDeletePlaylist(playlist.id, e)}
                      className="p-2 hover:bg-red-500/20 text-red-500 rounded-lg transition"
                      title="Delete playlist"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleExpand(playlist.id);
                      }}
                      className={`p-2 rounded-lg transition ${
                        darkMode ? 'hover:bg-gray-500 text-gray-400' : 'hover:bg-gray-200 text-gray-500'
                      }`}
                    >
                      {expandedPlaylists[playlist.id] ? (
                        <ChevronUp className="w-4 h-4" />
                      ) : (
                        <ChevronDown className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Playlist Videos (Expanded) */}
                {expandedPlaylists[playlist.id] && playlist.videos && playlist.videos.length > 0 && (
                  <div className={`border-t ${darkMode ? 'border-gray-600' : 'border-gray-200'}`}>
                    <div className="max-h-64 overflow-y-auto">
                      {playlist.videos.map((video, index) => (
                        <div
                          key={index}
                          className={`p-3 flex items-center gap-3 cursor-pointer transition ${
                            darkMode
                              ? 'hover:bg-gray-600 border-b border-gray-600 last:border-b-0'
                              : 'hover:bg-gray-200 border-b border-gray-200 last:border-b-0'
                          }`}
                          onClick={() => onPlayPlaylist(playlist.id, index)}
                        >
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                            darkMode ? 'bg-purple-500/20 text-purple-400' : 'bg-purple-100 text-purple-600'
                          }`}>
                            {index + 1}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className={`text-sm font-medium truncate ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                              {video.title || 'Facebook Video'}
                            </p>
                            <p className="text-xs text-gray-500 truncate">{video.url}</p>
                          </div>
                          <Play className="w-4 h-4 text-gray-400 flex-shrink-0" />
                        </div>
                      ))}
                    </div>

                    {/* Play All Button */}
                    <button
                      onClick={() => onPlayPlaylist(playlist.id, 0)}
                      className="w-full py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-medium flex items-center justify-center gap-2 transition"
                    >
                      <Play className="w-4 h-4" />
                      Play All
                    </button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
