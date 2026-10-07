'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/Select';
import { MediaFrame } from '@/components/ui/MediaFrame';
import type { Certification, PublishStatus } from '@/lib/supabase/types';
import { MediaSelectorModal } from '@/components/admin/media/MediaSelectorModal';

interface CertificationFormProps {
  initialData?: Certification | null;
  onSubmit: (data: Partial<Certification>) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

const STATUS_OPTIONS = [
  { value: 'published', label: 'Published (Public)' },
  { value: 'draft', label: 'Draft (Internal Only)' },
  { value: 'archived', label: 'Archived (Hidden)' },
];

const COMMON_ISSUERS = [
  'Coursera',
  'DeepLearning.AI',
  'Udemy',
  'DataCamp',
  'Microsoft',
  'AWS',
  'Google Cloud',
  'Stanford Online',
  'NVIDIA',
  'Kaggle',
];

export const CertificationForm: React.FC<CertificationFormProps> = ({
  initialData,
  onSubmit,
  onCancel,
  isLoading = false,
}) => {
  // Core Fields
  const [title, setTitle] = useState(initialData?.title || '');
  const [issuer, setIssuer] = useState(initialData?.issuer || '');
  const [issueDate, setIssueDate] = useState(initialData?.issue_date || '');
  const [expirationDate, setExpirationDate] = useState(initialData?.expiration_date || '');
  const [credentialId, setCredentialId] = useState(initialData?.credential_id || '');
  const [credentialUrl, setCredentialUrl] = useState(initialData?.credential_url || '');
  const [description, setDescription] = useState(initialData?.description || '');

  // Media
  const [imageUrl, setImageUrl] = useState(
    initialData?.image_url || initialData?.image || ''
  );
  const [isUploadingMedia, setIsUploadingMedia] = useState(false);
  const [isMediaSelectorOpen, setIsMediaSelectorOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Status & Visibility
  const [status, setStatus] = useState<PublishStatus>(initialData?.status || 'published');
  const [enabled, setEnabled] = useState(
    initialData?.enabled !== undefined
      ? initialData.enabled
      : initialData?.status !== 'draft' && initialData?.status !== 'archived'
  );
  const [displayOrder, setDisplayOrder] = useState<string>(
    initialData?.display_order !== undefined ? String(initialData.display_order) : ''
  );

  // Validation & Dirtiness
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isDirty, setIsDirty] = useState(false);

  // Warn on unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isDirty) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isDirty]);

  const handleFieldChange = (setter: React.Dispatch<React.SetStateAction<any>>, value: any) => {
    setter(value);
    setIsDirty(true);
  };

  // Upload certificate image via existing /api/admin/upload endpoint
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      setErrors((prev) => ({
        ...prev,
        imageUrl: 'Supported file types: JPEG, PNG, or WebP.',
      }));
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setErrors((prev) => ({
        ...prev,
        imageUrl: 'File size exceeds maximum limit of 5MB.',
      }));
      return;
    }

    setIsUploadingMedia(true);
    setErrors((prev) => {
      const copy = { ...prev };
      delete copy.imageUrl;
      return copy;
    });

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('bucket', 'certifications');

      const res = await fetch('/api/admin/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to upload certificate image');
      }

      setImageUrl(data.url);
      setIsDirty(true);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Upload failed. Please try again.';
      setErrors((prev) => ({ ...prev, imageUrl: msg }));
    } finally {
      setIsUploadingMedia(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const validate = (): boolean => {
    const newErrors: { [key: string]: string } = {};

    if (!title.trim()) {
      newErrors.title = 'Certification name is required.';
    }

    if (!issuer.trim()) {
      newErrors.issuer = 'Issuing organization is required.';
    }

    if (!issueDate.trim()) {
      newErrors.issueDate = 'Issue date is required.';
    }

    if (issueDate.trim() && expirationDate.trim()) {
      const issueTime = new Date(issueDate.trim()).getTime();
      const expireTime = new Date(expirationDate.trim()).getTime();
      if (!isNaN(issueTime) && !isNaN(expireTime) && expireTime < issueTime) {
        newErrors.expirationDate = 'Expiration date cannot precede the issue date.';
      }
    }

    const isValidUrl = (url: string) => {
      if (!url.trim()) return true;
      const trimmed = url.trim();
      return (
        trimmed.startsWith('http://') ||
        trimmed.startsWith('https://') ||
        trimmed.startsWith('/')
      );
    };

    if (credentialUrl && !isValidUrl(credentialUrl)) {
      newErrors.credentialUrl =
        'Verification URL must begin with http://, https://, or /';
    }

    if (imageUrl && !isValidUrl(imageUrl)) {
      newErrors.imageUrl = 'Image URL must begin with http://, https://, or /';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const payload: Partial<Certification> = {
      ...(initialData?.id ? { id: initialData.id } : {}),
      title: title.trim(),
      issuer: issuer.trim(),
      issue_date: issueDate.trim(),
      expiration_date: expirationDate.trim() ? expirationDate.trim() : null,
      credential_id: credentialId.trim() ? credentialId.trim() : null,
      credential_url: credentialUrl.trim() ? credentialUrl.trim() : null,
      image: imageUrl.trim() ? imageUrl.trim() : null,
      image_url: imageUrl.trim() ? imageUrl.trim() : null,
      description: description.trim(),
      display_order: displayOrder ? parseInt(displayOrder, 10) : undefined,
      enabled,
      status,
    };

    await onSubmit(payload);
    setIsDirty(false);
  };

  const handleCancelClick = () => {
    if (isDirty) {
      if (window.confirm('You have unsaved changes. Discard them and close?')) {
        onCancel();
      }
    } else {
      onCancel();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* 1. Header Information */}
      <div className="border-b border-white/10 pb-4">
        <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
          <span>📜</span>
          {initialData ? 'Edit Certification' : 'Create New Certification'}
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          {initialData
            ? 'Update the certification details, credential reference, dates, and certificate image.'
            : 'Add an industry credential, machine learning specialization, or verified certificate.'}
        </p>
      </div>

      {/* 2. Core Fields */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-mono text-slate-400 uppercase tracking-wider mb-1.5">
            Certification Name / Title <span className="text-amber-400">*</span>
          </label>
          <Input
            value={title}
            onChange={(e) => handleFieldChange(setTitle, e.target.value)}
            placeholder="e.g. Deep Learning Specialization"
            disabled={isLoading}
            className="w-full font-sans"
          />
          {errors.title && (
            <p className="text-xs text-red-400 mt-1">{errors.title}</p>
          )}
        </div>

        <div>
          <label className="block text-xs font-mono text-slate-400 uppercase tracking-wider mb-1.5">
            Issuing Organization <span className="text-amber-400">*</span>
          </label>
          <Input
            value={issuer}
            onChange={(e) => handleFieldChange(setIssuer, e.target.value)}
            placeholder="e.g. Coursera / DeepLearning.AI"
            disabled={isLoading}
            className="w-full font-sans"
          />
          {errors.issuer && (
            <p className="text-xs text-red-400 mt-1">{errors.issuer}</p>
          )}
        </div>
      </div>

      {/* Quick Select Common Issuers */}
      <div>
        <label className="block text-[11px] font-mono text-slate-500 mb-1">
          Quick-select Issuer:
        </label>
        <div className="flex flex-wrap gap-1.5">
          {COMMON_ISSUERS.map((org) => (
            <button
              key={org}
              type="button"
              onClick={() => handleFieldChange(setIssuer, org)}
              className={`px-2.5 py-1 rounded text-xs font-mono transition-colors cursor-pointer border ${
                issuer === org
                  ? 'border-amber-500/50 bg-amber-500/10 text-amber-300'
                  : 'border-white/10 bg-white/5 text-slate-400 hover:border-white/20 hover:text-slate-200'
              }`}
            >
              + {org}
            </button>
          ))}
        </div>
      </div>

      {/* 3. Dates */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-mono text-slate-400 uppercase tracking-wider mb-1.5">
            Issue Date <span className="text-amber-400">*</span>
          </label>
          <Input
            type="date"
            value={issueDate}
            onChange={(e) => handleFieldChange(setIssueDate, e.target.value)}
            disabled={isLoading}
            className="w-full font-sans"
          />
          {errors.issueDate && (
            <p className="text-xs text-red-400 mt-1">{errors.issueDate}</p>
          )}
        </div>

        <div>
          <label className="block text-xs font-mono text-slate-400 uppercase tracking-wider mb-1.5">
            Expiration Date (Optional)
          </label>
          <Input
            type="date"
            value={expirationDate}
            onChange={(e) => handleFieldChange(setExpirationDate, e.target.value)}
            disabled={isLoading}
            className="w-full font-sans"
          />
          <p className="text-[11px] text-slate-500 mt-1">
            Leave blank if this certificate does not expire.
          </p>
          {errors.expirationDate && (
            <p className="text-xs text-red-400 mt-1">{errors.expirationDate}</p>
          )}
        </div>
      </div>

      {/* 4. Credential ID & Verification URL */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-mono text-slate-400 uppercase tracking-wider mb-1.5">
            Credential ID (Optional)
          </label>
          <Input
            value={credentialId}
            onChange={(e) => handleFieldChange(setCredentialId, e.target.value)}
            placeholder="e.g. AB0123456"
            disabled={isLoading}
            className="w-full font-mono text-xs"
          />
        </div>

        <div>
          <label className="block text-xs font-mono text-slate-400 uppercase tracking-wider mb-1.5">
            Verification URL (Optional)
          </label>
          <Input
            value={credentialUrl}
            onChange={(e) => handleFieldChange(setCredentialUrl, e.target.value)}
            placeholder="https://coursera.org/verify/AB0123"
            disabled={isLoading}
            className="w-full font-sans text-xs"
          />
          {errors.credentialUrl && (
            <p className="text-xs text-red-400 mt-1">{errors.credentialUrl}</p>
          )}
        </div>
      </div>

      {/* 5. Description */}
      <div>
        <label className="block text-xs font-mono text-slate-400 uppercase tracking-wider mb-1.5">
          Description / Learned Competencies (Optional)
        </label>
        <Textarea
          value={description}
          onChange={(e) => handleFieldChange(setDescription, e.target.value)}
          rows={3}
          placeholder="Brief description of the topics, frameworks, and practical projects covered by this certification..."
          disabled={isLoading}
          className="w-full font-sans text-sm"
        />
      </div>

      {/* 6. Certificate Media / Badge */}
      <div className="border-t border-white/10 pt-4">
        <label className="block text-xs font-mono text-slate-400 uppercase tracking-wider mb-1.5">
          Certificate Image / Badge (Optional)
        </label>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
          <div className="w-24 h-24 rounded-xl border border-white/10 bg-[#131926] overflow-hidden flex items-center justify-center shrink-0">
            {imageUrl ? (
              <MediaFrame
                src={imageUrl}
                alt="Certificate preview"
                aspectRatio="1/1"
                fallbackIcon="📜"
                className="w-full h-full rounded-none border-0"
              />
            ) : (
              <span className="text-3xl text-slate-600">📜</span>
            )}
          </div>

          <div className="md:col-span-2 space-y-2">
            <div className="flex gap-2">
              <Input
                value={imageUrl}
                onChange={(e) => handleFieldChange(setImageUrl, e.target.value)}
                placeholder="/images/certificate.png or https://..."
                disabled={isLoading || isUploadingMedia}
                className="flex-1 text-xs font-mono"
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                disabled={isLoading || isUploadingMedia}
                className="whitespace-nowrap"
              >
                {isUploadingMedia ? 'Uploading...' : 'Upload'}
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsMediaSelectorOpen(true)}
                disabled={isLoading || isUploadingMedia}
                className="whitespace-nowrap border-amber-500/30 text-amber-300 hover:bg-amber-500/10 font-mono text-xs"
              >
                📁 Select
              </Button>
              {imageUrl && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handleFieldChange(setImageUrl, '')}
                  disabled={isLoading}
                  className="text-red-400 hover:text-red-300"
                >
                  Clear
                </Button>
              )}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/png,image/jpeg,image/webp"
              onChange={handleFileUpload}
              className="hidden"
            />
            <MediaSelectorModal
              isOpen={isMediaSelectorOpen}
              onClose={() => setIsMediaSelectorOpen(false)}
              allowedTypes={['image']}
              title="Select Certificate Badge"
              selectedUrl={imageUrl}
              onSelect={(m) => {
                handleFieldChange(setImageUrl, m.public_url);
              }}
            />
            <p className="text-[11px] text-slate-500">
              Supports JPEG, PNG, or WebP up to 5MB. Rendered as 1:1 badge preview.
            </p>
            {errors.imageUrl && (
              <p className="text-xs text-red-400">{errors.imageUrl}</p>
            )}
          </div>
        </div>
      </div>

      {/* 7. Settings: Status, Order, Enabled */}
      <div className="border-t border-white/10 pt-4 grid grid-cols-1 sm:grid-cols-3 gap-4 items-center">
        <div>
          <label className="block text-xs font-mono text-slate-400 uppercase tracking-wider mb-1.5">
            Publication Status
          </label>
          <Select
            value={status}
            onChange={(e) => handleFieldChange(setStatus, e.target.value as PublishStatus)}
            options={STATUS_OPTIONS}
            disabled={isLoading}
          />
        </div>

        <div>
          <label className="block text-xs font-mono text-slate-400 uppercase tracking-wider mb-1.5">
            Display Order
          </label>
          <Input
            type="number"
            value={displayOrder}
            onChange={(e) => handleFieldChange(setDisplayOrder, e.target.value)}
            placeholder="Auto"
            disabled={isLoading}
            className="w-full font-mono text-xs"
          />
        </div>

        <div className="flex items-center gap-3 pt-4 sm:pt-6">
          <input
            type="checkbox"
            id="cert-enabled-toggle"
            checked={enabled}
            onChange={(e) => handleFieldChange(setEnabled, e.target.checked)}
            disabled={isLoading}
            className="w-4 h-4 rounded border-white/20 bg-[#131926] text-amber-500 focus:ring-amber-500/30 cursor-pointer"
          />
          <label
            htmlFor="cert-enabled-toggle"
            className="text-xs font-mono text-slate-300 select-none cursor-pointer"
          >
            Enabled on Public Portfolio
          </label>
        </div>
      </div>

      {/* 8. Action Buttons */}
      <div className="border-t border-white/10 pt-4 flex items-center justify-end gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={handleCancelClick}
          disabled={isLoading}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          variant="primary"
          disabled={isLoading || isUploadingMedia}
          className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold"
        >
          {isLoading
            ? 'Saving...'
            : initialData
            ? 'Update Certification'
            : 'Create Certification'}
        </Button>
      </div>
    </form>
  );
};
