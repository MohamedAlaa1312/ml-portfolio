'use client';

import React, { useState, useEffect, useCallback } from 'react';
import type { MediaItemWithUsage } from '@/lib/supabase/types';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { MediaCard } from './MediaCard';
import { MediaDetailsModal } from './MediaDetailsModal';
import { MediaUploadModal } from './MediaUploadModal';
import { MediaDeleteModal } from './MediaDeleteModal';

function formatBytes(bytes: number, decimals = 1): string {
  if (!bytes || bytes === 0) return '0 B';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}

interface MediaManagerProps {
  initialMedia?: MediaItemWithUsage[];
  initialStats?: {
    totalMedia: number;
    totalImages: number;
    totalDocuments: number;
    inUseCount: number;
    unusedCount: number;
    totalSizeBytes: number;
  };
}

export const MediaManager: React.FC<MediaManagerProps> = ({
  initialMedia,
  initialStats,
}) => {
  const [mediaList, setMediaList] = useState<MediaItemWithUsage[]>(initialMedia || []);
  const [isLoading, setIsLoading] = useState(!initialMedia);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'image' | 'document'>('all');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'name' | 'size'>('newest');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Modal States
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [selectedForDetails, setSelectedForDetails] = useState<MediaItemWithUsage | null>(null);
  const [selectedForDelete, setSelectedForDelete] = useState<MediaItemWithUsage | null>(null);

  // Toast / Feedback State
  const [feedback, setFeedback] = useState<{ message: string; type: 'success' | 'error' } | null>(
    null
  );

  const showNotification = (message: string, type: 'success' | 'error' = 'success') => {
    setFeedback({ message, type });
    setTimeout(() => setFeedback(null), 4000);
  };

  const fetchMedia = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (searchQuery.trim()) params.set('search', searchQuery.trim());
      if (typeFilter !== 'all') params.set('type', typeFilter);
      if (sortBy) params.set('sort', sortBy);

      const res = await fetch(`/api/admin/media?${params.toString()}`);
      const data = await res.json();
      if (res.ok && data.success) {
        setMediaList(data.media || []);
      } else {
        throw new Error(data.error || 'Failed to fetch media');
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error loading media library';
      showNotification(msg, 'error');
    } finally {
      setIsLoading(false);
    }
  }, [searchQuery, typeFilter, sortBy]);

  useEffect(() => {
    fetchMedia();
  }, [fetchMedia]);

  // Save metadata handler
  const handleSaveMetadata = async (
    id: string,
    metadata: { title?: string; alt_text?: string; description?: string }
  ) => {
    try {
      const res = await fetch(`/api/admin/media/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(metadata),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to update metadata');
      }
      showNotification('Media metadata updated successfully.');
      fetchMedia();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to update metadata';
      showNotification(msg, 'error');
      throw err;
    }
  };

  // Delete media handler
  const handleConfirmDelete = async (media: MediaItemWithUsage) => {
    try {
      const res = await fetch(`/api/admin/media/${media.id}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to delete media asset');
      }
      showNotification(`"${media.title || media.file_name}" deleted successfully.`);
      fetchMedia();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to delete media asset';
      showNotification(msg, 'error');
      throw err;
    }
  };

  // Stats calculation
  const totalCount = mediaList.length;
  const imageCount = mediaList.filter((m) => m.media_type === 'image').length;
  const docCount = mediaList.filter((m) => m.media_type === 'document').length;
  const inUseCount = mediaList.filter((m) => m.inUse).length;
  const unusedCount = totalCount - inUseCount;
  const totalBytes = mediaList.reduce((acc, m) => acc + (m.file_size || 0), 0);

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Toast Notification */}
      {feedback && (
        <div
          role="status"
          className={`fixed bottom-6 right-6 z-50 p-4 rounded-xl shadow-2xl border text-xs font-mono font-semibold flex items-center gap-3 backdrop-blur-md transition-all ${
            feedback.type === 'success'
              ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
              : 'bg-rose-500/20 text-rose-300 border-rose-500/30'
          }`}
        >
          <span>{feedback.type === 'success' ? '✓' : '⚠️'}</span>
          <span>{feedback.message}</span>
        </div>
      )}

      {/* 1. Header & Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#0D111A] p-6 rounded-2xl border border-white/10">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <span className="text-2xl">🖼️</span>
            <h1 className="text-2xl font-bold tracking-tight text-slate-100">Media Library</h1>
            <Badge variant="outline" className="text-xs font-mono uppercase text-amber-400 border-amber-500/30">
              Phase 14
            </Badge>
          </div>
          <p className="text-xs sm:text-sm text-slate-400">
            Centralized repository for images, documents, and assets with real-time usage reference tracking.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            type="button"
            variant="primary"
            size="md"
            onClick={() => setIsUploadOpen(true)}
            className="font-mono text-xs font-bold tracking-wide"
          >
            + Upload Media
          </Button>
        </div>
      </div>

      {/* 2. Aggregate Metrics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="bg-[#0D111A] border border-white/10 rounded-xl p-3.5 flex flex-col justify-between">
          <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider">Total Assets</span>
          <span className="text-2xl font-bold text-slate-100 mt-1 font-mono">{totalCount}</span>
        </div>
        <div className="bg-[#0D111A] border border-white/10 rounded-xl p-3.5 flex flex-col justify-between">
          <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider">Images</span>
          <span className="text-2xl font-bold text-amber-400 mt-1 font-mono">{imageCount}</span>
        </div>
        <div className="bg-[#0D111A] border border-white/10 rounded-xl p-3.5 flex flex-col justify-between">
          <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider">Documents</span>
          <span className="text-2xl font-bold text-sky-400 mt-1 font-mono">{docCount}</span>
        </div>
        <div className="bg-[#0D111A] border border-white/10 rounded-xl p-3.5 flex flex-col justify-between">
          <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider">In Active Use</span>
          <span className="text-2xl font-bold text-emerald-400 mt-1 font-mono">{inUseCount}</span>
        </div>
        <div className="bg-[#0D111A] border border-white/10 rounded-xl p-3.5 flex flex-col justify-between">
          <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider">Unused (Deletable)</span>
          <span className="text-2xl font-bold text-slate-400 mt-1 font-mono">{unusedCount}</span>
        </div>
        <div className="bg-[#0D111A] border border-white/10 rounded-xl p-3.5 flex flex-col justify-between">
          <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider">Storage Used</span>
          <span className="text-2xl font-bold text-slate-300 mt-1 font-mono">{formatBytes(totalBytes)}</span>
        </div>
      </div>

      {/* 3. Search, Filter, Sort Toolbar */}
      <div className="bg-[#0D111A] p-4 rounded-2xl border border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 text-xs">🔍</span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name, title, description, or MIME type..."
            className="w-full bg-[#080B11] border border-white/10 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-200 placeholder:text-slate-600 focus-ring font-mono"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 text-xs"
            >
              ✕
            </button>
          )}
        </div>

        {/* Filters and Controls */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Type Filter Tabs */}
          <div className="flex items-center bg-[#080B11] border border-white/10 rounded-xl p-1 text-xs font-mono">
            <button
              type="button"
              onClick={() => setTypeFilter('all')}
              className={`px-3 py-1 rounded-lg transition-colors ${
                typeFilter === 'all'
                  ? 'bg-amber-500 text-black font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              All
            </button>
            <button
              type="button"
              onClick={() => setTypeFilter('image')}
              className={`px-3 py-1 rounded-lg transition-colors ${
                typeFilter === 'image'
                  ? 'bg-amber-500 text-black font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Images
            </button>
            <button
              type="button"
              onClick={() => setTypeFilter('document')}
              className={`px-3 py-1 rounded-lg transition-colors ${
                typeFilter === 'document'
                  ? 'bg-amber-500 text-black font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Docs
            </button>
          </div>

          {/* Sort Dropdown */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            aria-label="Sort media assets"
            className="bg-[#080B11] border border-white/10 rounded-xl px-3 py-1.5 text-xs text-slate-200 focus-ring font-mono"
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="name">Name (A-Z)</option>
            <option value="size">Size (Largest)</option>
          </select>

          {/* View Mode Toggle */}
          <div className="flex items-center bg-[#080B11] border border-white/10 rounded-xl p-1 text-xs">
            <button
              type="button"
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg transition-colors ${
                viewMode === 'grid' ? 'bg-white/15 text-slate-100' : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Grid View"
            >
              ⊞
            </button>
            <button
              type="button"
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-lg transition-colors ${
                viewMode === 'list' ? 'bg-white/15 text-slate-100' : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Table / List View"
            >
              ☰
            </button>
          </div>
        </div>
      </div>

      {/* 4. Media Library Body */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center p-16 text-slate-400 space-y-3">
          <span className="text-3xl animate-spin">⏳</span>
          <span className="text-xs font-mono">Loading portfolio media assets...</span>
        </div>
      ) : mediaList.length === 0 ? (
        <div className="bg-[#0D111A] border border-white/10 rounded-2xl p-16 text-center space-y-4">
          <span className="text-5xl block">🖼️</span>
          <div className="space-y-1">
            <h3 className="text-base font-bold text-slate-200">No media assets found</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              {searchQuery || typeFilter !== 'all'
                ? 'Try adjusting your search criteria or type filters.'
                : 'Your media library is empty. Upload your first image or PDF document to get started.'}
            </p>
          </div>
          <Button
            type="button"
            variant="primary"
            size="sm"
            onClick={() => setIsUploadOpen(true)}
            className="font-mono text-xs"
          >
            + Upload Media
          </Button>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {mediaList.map((m) => (
            <MediaCard
              key={m.id}
              media={m}
              onViewDetails={(item) => setSelectedForDetails(item)}
              onDelete={(item) => setSelectedForDelete(item)}
            />
          ))}
        </div>
      ) : (
        /* List / Table View */
        <div className="bg-[#0D111A] border border-white/10 rounded-2xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-[#080B11] text-slate-400 uppercase tracking-wider border-b border-white/10">
                <tr>
                  <th className="py-3.5 px-4">Asset</th>
                  <th className="py-3.5 px-4">Type</th>
                  <th className="py-3.5 px-4">Size</th>
                  <th className="py-3.5 px-4">Usage References</th>
                  <th className="py-3.5 px-4">Uploaded</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-slate-300">
                {mediaList.map((m) => (
                  <tr
                    key={m.id}
                    onClick={() => setSelectedForDetails(m)}
                    className="hover:bg-white/[0.02] cursor-pointer transition-colors"
                  >
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg overflow-hidden bg-[#080B11] border border-white/10 flex-shrink-0 flex items-center justify-center">
                          {m.media_type === 'image' ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={m.public_url} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <span className="text-xl">📄</span>
                          )}
                        </div>
                        <div className="overflow-hidden max-w-xs">
                          <span className="font-semibold text-slate-100 block truncate">
                            {m.title || m.file_name}
                          </span>
                          <span className="text-[11px] text-slate-500 truncate block">
                            {m.file_name}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 uppercase text-[11px] text-slate-400">
                      {m.mime_type.split('/')[1] || m.media_type}
                    </td>
                    <td className="py-3 px-4 text-slate-400">{formatBytes(m.file_size)}</td>
                    <td className="py-3 px-4">
                      {m.inUse ? (
                        <div className="flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                          <span className="text-emerald-300 font-semibold">
                            {m.usageCount} reference{m.usageCount === 1 ? '' : 's'}
                          </span>
                        </div>
                      ) : (
                        <span className="text-slate-500 italic">Unused</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-slate-500">
                      {new Date(m.created_at).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedForDetails(m)}
                          className="text-xs font-mono py-1 px-2.5 h-auto min-h-0"
                        >
                          Details
                        </Button>
                        {!m.inUse && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => setSelectedForDelete(m)}
                            className="text-xs font-mono py-1 px-2.5 h-auto min-h-0 text-rose-400 hover:text-rose-300 hover:bg-rose-500/10"
                          >
                            Delete
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 5. Modals */}
      <MediaUploadModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        onUploadSuccess={() => {
          showNotification('Media asset uploaded and registered successfully.');
          fetchMedia();
        }}
      />

      <MediaDetailsModal
        media={selectedForDetails}
        isOpen={Boolean(selectedForDetails)}
        onClose={() => setSelectedForDetails(null)}
        onSaveMetadata={handleSaveMetadata}
        onDeleteRequest={(item) => {
          setSelectedForDetails(null);
          setSelectedForDelete(item);
        }}
      />

      <MediaDeleteModal
        media={selectedForDelete}
        isOpen={Boolean(selectedForDelete)}
        onClose={() => setSelectedForDelete(null)}
        onConfirmDelete={handleConfirmDelete}
      />
    </div>
  );
};
