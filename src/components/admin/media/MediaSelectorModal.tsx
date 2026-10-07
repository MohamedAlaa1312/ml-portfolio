'use client';

import React, { useState, useEffect } from 'react';
import type { MediaItemWithUsage } from '@/lib/supabase/types';
import { Button } from '@/components/ui/Button';
import { MediaCard } from './MediaCard';

interface MediaSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (media: MediaItemWithUsage) => void;
  allowedTypes?: ('image' | 'document')[];
  title?: string;
  selectedUrl?: string | null;
}

export const MediaSelectorModal: React.FC<MediaSelectorModalProps> = ({
  isOpen,
  onClose,
  onSelect,
  allowedTypes = ['image', 'document'],
  title = 'Select Media Asset',
  selectedUrl = null,
}) => {
  const [activeTab, setActiveTab] = useState<'library' | 'upload'>('library');
  const [mediaList, setMediaList] = useState<MediaItemWithUsage[]>([]);
  const [selectedItem, setSelectedItem] = useState<MediaItemWithUsage | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'image' | 'document'>('all');

  // Upload tab state
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const loadMedia = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (searchQuery.trim()) params.set('search', searchQuery.trim());
      if (typeFilter !== 'all') params.set('type', typeFilter);

      const res = await fetch(`/api/admin/media?${params.toString()}`);
      const data = await res.json();
      if (res.ok && data.success) {
        setMediaList(data.media || []);

        // Pre-select if URL matches
        if (selectedUrl && !selectedItem) {
          const match = (data.media as MediaItemWithUsage[]).find(
            (m) => m.public_url === selectedUrl || selectedUrl.endsWith(m.file_name)
          );
          if (match) setSelectedItem(match);
        }
      }
    } catch (err) {
      console.error('Failed to load media in selector:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch media items on open
  useEffect(() => {
    if (isOpen) {
      loadMedia();
    }
  }, [isOpen, searchQuery, typeFilter]);

  if (!isOpen) return null;

  const handleFileUpload = async (file: File) => {
    setIsUploading(true);
    setUploadError(null);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('title', file.name.replace(/\.[^/.]+$/, ''));
      formData.append(
        'bucket',
        file.type === 'application/pdf' ? 'portfolio-documents' : 'portfolio-images'
      );

      const res = await fetch('/api/admin/media', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to upload media');
      }

      // Reload list and auto-select uploaded item
      await loadMedia();
      if (data.media) {
        const itemWithUsage: MediaItemWithUsage = {
          ...data.media,
          references: [],
          usageCount: 0,
          inUse: false,
        };
        setSelectedItem(itemWithUsage);
      }
      setActiveTab('library');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Upload failed';
      setUploadError(msg);
    } finally {
      setIsUploading(false);
    }
  };

  const handleConfirmSelect = () => {
    if (selectedItem) {
      onSelect(selectedItem);
      onClose();
    }
  };

  const filteredMedia = mediaList.filter((m) =>
    allowedTypes.includes(m.media_type as 'image' | 'document')
  );

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="media-selector-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-4xl max-h-[85vh] bg-[#0D111A] border border-white/10 rounded-2xl shadow-2xl flex flex-col overflow-hidden text-slate-100"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-[#080B11]/60">
          <div className="flex items-center gap-3">
            <span className="text-xl">📁</span>
            <div>
              <h3 id="media-selector-title" className="text-base font-bold text-slate-100">
                {title}
              </h3>
              <p className="text-xs font-mono text-slate-400">
                Select an existing asset from the library or upload a new file
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close dialog"
            className="text-slate-400 hover:text-slate-100 p-2 rounded-lg hover:bg-white/5 transition-colors focus-ring"
          >
            ✕
          </button>
        </div>

        {/* Tab Controls */}
        <div className="flex items-center justify-between px-6 py-3 border-b border-white/5 bg-[#080B11]/30">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setActiveTab('library')}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-colors ${
                activeTab === 'library'
                  ? 'bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
              }`}
            >
              Browse Library ({filteredMedia.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('upload')}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-colors ${
                activeTab === 'upload'
                  ? 'bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
              }`}
            >
              + Upload New
            </button>
          </div>

          {activeTab === 'library' && (
            <div className="flex items-center gap-3">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search assets..."
                className="bg-[#080B11] border border-white/10 rounded-lg px-3 py-1 text-xs text-slate-200 placeholder:text-slate-600 focus-ring w-48 font-mono"
              />
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value as any)}
                aria-label="Filter media by type"
                className="bg-[#080B11] border border-white/10 rounded-lg px-2 py-1 text-xs text-slate-200 focus-ring font-mono"
              >
                <option value="all">All Types</option>
                <option value="image">Images</option>
                <option value="document">Documents</option>
              </select>
            </div>
          )}
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto p-6 min-h-[320px]">
          {activeTab === 'library' ? (
            isLoading ? (
              <div className="flex flex-col items-center justify-center h-64 text-slate-400 space-y-2">
                <span className="text-2xl animate-spin">⏳</span>
                <span className="text-xs font-mono">Loading media library...</span>
              </div>
            ) : filteredMedia.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-64 text-slate-400 space-y-3">
                <span className="text-4xl">🔍</span>
                <p className="text-sm font-semibold">No media matching your filters</p>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setActiveTab('upload')}
                  className="text-xs font-mono"
                >
                  Upload First Asset
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {filteredMedia.map((m) => {
                  const isSelected = selectedItem?.id === m.id;
                  return (
                    <div
                      key={m.id}
                      onClick={() => setSelectedItem(m)}
                      className={`group relative rounded-xl border overflow-hidden cursor-pointer transition-all duration-200 bg-[#080B11] ${
                        isSelected
                          ? 'border-amber-500 ring-2 ring-amber-500/50 shadow-[0_0_15px_rgba(245,158,11,0.2)]'
                          : 'border-white/10 hover:border-amber-500/40'
                      }`}
                    >
                      <div className="aspect-video w-full bg-black/40 flex items-center justify-center overflow-hidden">
                        {m.media_type === 'image' ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={m.public_url}
                            alt={m.alt_text || m.title || m.file_name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                          />
                        ) : (
                          <span className="text-3xl">📄</span>
                        )}
                        {isSelected && (
                          <div className="absolute top-2 right-2 bg-amber-500 text-black font-bold w-6 h-6 rounded-full flex items-center justify-center text-xs shadow">
                            ✓
                          </div>
                        )}
                      </div>
                      <div className="p-2.5">
                        <p className="text-xs font-semibold text-slate-200 truncate group-hover:text-amber-400">
                          {m.title || m.file_name}
                        </p>
                        <p className="text-[10px] font-mono text-slate-400 truncate mt-0.5">
                          {(m.file_size / 1024).toFixed(0)} KB • {m.mime_type.split('/')[1]?.toUpperCase()}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )
          ) : (
            /* Upload Tab */
            <div className="flex flex-col items-center justify-center p-8 space-y-4 max-w-md mx-auto">
              <div
                className="w-full border-2 border-dashed border-white/20 rounded-2xl p-8 text-center hover:border-amber-500/50 hover:bg-amber-500/5 transition-all cursor-pointer flex flex-col items-center justify-center gap-3"
                onClick={() => document.getElementById('selector-file-upload')?.click()}
              >
                <input
                  id="selector-file-upload"
                  type="file"
                  accept=".jpg,.jpeg,.png,.webp,.gif,.svg,.pdf"
                  className="hidden"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) handleFileUpload(f);
                  }}
                />
                <span className="text-5xl">📤</span>
                <p className="text-sm font-semibold text-slate-200">
                  Click to select file or drag here
                </p>
                <p className="text-xs font-mono text-slate-400">
                  Images (up to 5MB) • Documents (up to 10MB)
                </p>
              </div>

              {isUploading && (
                <div className="flex items-center gap-2 text-xs font-mono text-amber-400">
                  <span className="animate-spin">⏳</span> Uploading and registering asset...
                </div>
              )}

              {uploadError && (
                <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-mono">
                  ⚠️ {uploadError}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-white/10 bg-[#080B11]/60">
          <div className="text-xs font-mono text-slate-400 truncate max-w-sm">
            {selectedItem ? (
              <span className="text-amber-400 font-semibold">
                Selected: {selectedItem.title || selectedItem.file_name}
              </span>
            ) : (
              'Click an asset to select it'
            )}
          </div>

          <div className="flex items-center gap-3">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onClose}
              className="text-xs font-mono"
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="primary"
              size="sm"
              onClick={handleConfirmSelect}
              disabled={!selectedItem}
              className="text-xs font-mono font-bold"
            >
              Select Asset
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
