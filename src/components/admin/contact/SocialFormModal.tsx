'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { isValidUrl, getPlatformIcon } from '@/lib/social-utils';
import type { SocialLinkItem } from '@/lib/supabase/types';

interface SocialFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (link: Partial<SocialLinkItem>) => Promise<void>;
  initialData?: SocialLinkItem | null;
  nextDisplayOrder?: number;
}

export const SocialFormModal: React.FC<SocialFormModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialData,
  nextDisplayOrder = 1,
}) => {
  const isEditing = Boolean(initialData?.id);

  const [platform, setPlatform] = useState(initialData?.platform || '');
  const [label, setLabel] = useState(initialData?.label || '');
  const [url, setUrl] = useState(initialData?.url || '');
  const [displayOrder, setDisplayOrder] = useState<number>(
    initialData?.display_order ?? nextDisplayOrder
  );
  const [enabled, setEnabled] = useState<boolean>(initialData?.enabled ?? true);

  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (initialData) {
      setPlatform(initialData.platform || '');
      setLabel(initialData.label || initialData.platform || '');
      setUrl(initialData.url || '');
      setDisplayOrder(initialData.display_order ?? nextDisplayOrder);
      setEnabled(initialData.enabled ?? true);
    } else {
      setPlatform('');
      setLabel('');
      setUrl('');
      setDisplayOrder(nextDisplayOrder);
      setEnabled(true);
    }
    setError(null);
  }, [initialData, nextDisplayOrder, isOpen]);

  // Handle ESC key to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validation
    const cleanPlatform = platform.trim();
    if (!cleanPlatform) {
      setError('Please enter a platform name (e.g. GitHub, LinkedIn, Kaggle).');
      return;
    }

    const cleanUrl = url.trim();
    if (!cleanUrl) {
      setError('Please enter the URL for this social link.');
      return;
    }

    if (!isValidUrl(cleanUrl)) {
      setError('Please enter a valid URL (e.g. https://... or mailto:...).');
      return;
    }

    setIsSubmitting(true);
    try {
      await onSave({
        ...(initialData?.id && { id: initialData.id }),
        platform: cleanPlatform,
        label: label.trim() || cleanPlatform,
        url: cleanUrl,
        icon: getPlatformIcon(cleanPlatform),
        display_order: Number(displayOrder) || 1,
        enabled,
      });
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to save social link.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in"
      role="dialog"
      aria-modal="true"
      aria-labelledby="social-modal-title"
    >
      <div className="w-full max-w-lg">
        <Card variant="standard" className="bg-[#0D111A] border-white/10 shadow-2xl overflow-hidden">
          <CardHeader className="p-5 border-b border-white/10 flex flex-row items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-base text-amber-400">
                {platform ? getPlatformIcon(platform) : '🔗'}
              </div>
              <CardTitle id="social-modal-title" className="text-base font-bold text-slate-100">
                {isEditing ? 'Edit Social Link' : 'Add Social Link'}
              </CardTitle>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="text-slate-400 hover:text-slate-200 transition-colors p-1.5 rounded-lg hover:bg-white/5 focus-ring"
              aria-label="Close dialog"
            >
              ✕
            </button>
          </CardHeader>

          <CardContent className="p-5 sm:p-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div
                  role="alert"
                  className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-mono flex items-start gap-2"
                >
                  <span className="shrink-0">⚠️</span>
                  <span>{error}</span>
                </div>
              )}

              {/* Platform */}
              <div>
                <label
                  htmlFor="social-platform"
                  className="block text-xs font-mono font-medium text-slate-300 mb-1.5"
                >
                  Platform Name <span className="text-amber-400">*</span>
                </label>
                <Input
                  id="social-platform"
                  placeholder="e.g. GitHub, LinkedIn, Kaggle, Hugging Face"
                  value={platform}
                  onChange={(e) => {
                    setPlatform(e.target.value);
                    if (!label || label === platform) {
                      setLabel(e.target.value);
                    }
                  }}
                  required
                />
                <p className="text-[11px] text-slate-500 mt-1 font-mono">
                  Enter any service name without restrictions.
                </p>
              </div>

              {/* Label */}
              <div>
                <label
                  htmlFor="social-label"
                  className="block text-xs font-mono font-medium text-slate-300 mb-1.5"
                >
                  Display Label <span className="text-slate-500 font-normal">(Optional)</span>
                </label>
                <Input
                  id="social-label"
                  placeholder="e.g. Kaggle Profile, Follow on X"
                  value={label}
                  onChange={(e) => setLabel(e.target.value)}
                />
              </div>

              {/* URL */}
              <div>
                <label
                  htmlFor="social-url"
                  className="block text-xs font-mono font-medium text-slate-300 mb-1.5"
                >
                  Destination URL <span className="text-amber-400">*</span>
                </label>
                <Input
                  id="social-url"
                  type="text"
                  placeholder="https://github.com/your-username"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  required
                />
                <p className="text-[11px] text-slate-500 mt-1 font-mono">
                  Must be a valid web URL starting with https://, http://, or mailto:
                </p>
              </div>

              {/* Display Order & Enabled Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-white/5">
                <div>
                  <label
                    htmlFor="social-order"
                    className="block text-xs font-mono font-medium text-slate-300 mb-1.5"
                  >
                    Display Order
                  </label>
                  <Input
                    id="social-order"
                    type="number"
                    min={1}
                    value={displayOrder}
                    onChange={(e) => setDisplayOrder(parseInt(e.target.value, 10) || 1)}
                  />
                </div>

                <div className="flex flex-col justify-end">
                  <label className="flex items-center gap-3 p-3 rounded-xl bg-[#131926] border border-white/5 cursor-pointer hover:border-white/10 transition-colors">
                    <input
                      type="checkbox"
                      checked={enabled}
                      onChange={(e) => setEnabled(e.target.checked)}
                      className="w-4 h-4 rounded border-slate-700 bg-slate-900 text-amber-500 focus:ring-amber-500/20"
                    />
                    <div>
                      <span className="text-xs font-medium text-slate-200 block">
                        Visible on Portfolio
                      </span>
                      <span className="text-[10px] text-slate-500 font-mono">
                        {enabled ? 'Active publicly' : 'Hidden from visitors'}
                      </span>
                    </div>
                  </label>
                </div>
              </div>

              {/* Modal Actions */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={onClose}
                  disabled={isSubmitting}
                  className="text-xs font-mono min-h-[40px]"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  isLoading={isSubmitting}
                  className="text-xs font-mono font-semibold min-h-[40px]"
                >
                  {isEditing ? 'Save Changes' : 'Add Link'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
