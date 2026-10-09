'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/Select';
import { Tag } from '@/components/ui/Tag';
import { MediaFrame } from '@/components/ui/MediaFrame';
import type { Project, PublishStatus, Skill } from '@/lib/supabase/types';
import { MediaSelectorModal } from '@/components/admin/media/MediaSelectorModal';

interface ProjectFormProps {
  initialData?: Project | null;
  availableSkills?: Skill[];
  onSubmit: (data: Partial<Project>) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

const STATUS_OPTIONS = [
  { value: 'published', label: 'Published (Public)' },
  { value: 'draft', label: 'Draft (Internal Only)' },
  { value: 'archived', label: 'Archived (Hidden)' },
];

function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

export const ProjectForm: React.FC<ProjectFormProps> = ({
  initialData,
  availableSkills = [],
  onSubmit,
  onCancel,
  isLoading = false,
}) => {
  // Form fields
  const [title, setTitle] = useState(initialData?.title || '');
  const [slug, setSlug] = useState(initialData?.slug || '');
  const [isSlugCustomized, setIsSlugCustomized] = useState(Boolean(initialData?.slug));
  const [shortDescription, setShortDescription] = useState(initialData?.short_description || '');
  const [fullDescription, setFullDescription] = useState(initialData?.full_description || '');

  // Media - Cover & Gallery
  const [thumbnailUrl, setThumbnailUrl] = useState(
    initialData?.thumbnail_url || initialData?.thumbnail || ''
  );
  const [galleryUrls, setGalleryUrls] = useState<string[]>(() => {
    if (Array.isArray(initialData?.gallery_urls)) return [...initialData.gallery_urls];
    if (Array.isArray((initialData as any)?.gallery)) return [...(initialData as any).gallery];
    return [];
  });
  const [isUploadingMedia, setIsUploadingMedia] = useState(false);
  const [isUploadingGallery, setIsUploadingGallery] = useState(false);
  const [isMediaSelectorOpen, setIsMediaSelectorOpen] = useState(false);
  const [isGalleryMediaSelectorOpen, setIsGalleryMediaSelectorOpen] = useState(false);
  const [manualGalleryUrl, setManualGalleryUrl] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const galleryFileInputRef = useRef<HTMLInputElement>(null);

  // Technologies
  const [technologies, setTechnologies] = useState<string[]>(
    initialData?.technologies ? [...initialData.technologies] : []
  );
  const [techInput, setTechInput] = useState('');

  // Links
  const [githubUrl, setGithubUrl] = useState(initialData?.github_url || '');
  const [liveUrl, setLiveUrl] = useState(initialData?.live_url || '');

  // Status & Visibility
  const [featured, setFeatured] = useState(Boolean(initialData?.featured));
  const [status, setStatus] = useState<PublishStatus>(initialData?.status || 'published');
  const [enabled, setEnabled] = useState(
    initialData?.enabled !== undefined ? initialData.enabled : (initialData?.status !== 'draft' && initialData?.status !== 'archived')
  );
  const [displayOrder, setDisplayOrder] = useState<string>(
    initialData?.display_order !== undefined ? String(initialData.display_order) : ''
  );

  // Errors & Unsaved changes
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isDirty, setIsDirty] = useState(false);

  // Auto-generate slug when title changes (unless slug was manually edited)
  const handleTitleChange = (val: string) => {
    setTitle(val);
    setIsDirty(true);
    if (!isSlugCustomized) {
      setSlug(generateSlug(val));
    }
  };

  const handleSlugChange = (val: string) => {
    setSlug(val);
    setIsSlugCustomized(true);
    setIsDirty(true);
  };

  // Warn on unsaved changes when navigating away
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

  // Technology handlers
  const addTechnology = (tech: string) => {
    const trimmed = tech.trim();
    if (!trimmed) return;
    if (!technologies.includes(trimmed)) {
      setTechnologies([...technologies, trimmed]);
      setIsDirty(true);
    }
    setTechInput('');
  };

  const handleKeyDownTech = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addTechnology(techInput);
    }
  };

  const removeTechnology = (tech: string) => {
    setTechnologies(technologies.filter((t) => t !== tech));
    setIsDirty(true);
  };

  // Single Media upload handler (Cover image)
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml'];
    if (!validTypes.includes(file.type)) {
      setErrors((prev) => ({ ...prev, media: 'Invalid image format. Allowed: JPEG, PNG, WEBP, SVG.' }));
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setErrors((prev) => ({ ...prev, media: 'Image size must be smaller than 5MB.' }));
      return;
    }

    setIsUploadingMedia(true);
    setErrors((prev) => ({ ...prev, media: '' }));

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('bucket', 'portfolio-images');

      const res = await fetch('/api/admin/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to upload image.');
      }

      setThumbnailUrl(data.url);
      setGalleryUrls((prev) => (prev.includes(data.url) ? prev : [data.url, ...prev]));
      setIsDirty(true);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Media upload failed';
      setErrors((prev) => ({ ...prev, media: msg }));
    } finally {
      setIsUploadingMedia(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // Multi-photo batch upload handler (Gallery images)
  const handleGalleryFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml'];
    for (const f of files) {
      if (!validTypes.includes(f.type)) {
        setErrors((prev) => ({ ...prev, gallery: `Invalid format for "${f.name}". Allowed: JPEG, PNG, WEBP, SVG.` }));
        return;
      }
      if (f.size > 5 * 1024 * 1024) {
        setErrors((prev) => ({ ...prev, gallery: `"${f.name}" exceeds the 5MB size limit.` }));
        return;
      }
    }

    setIsUploadingGallery(true);
    setErrors((prev) => ({ ...prev, gallery: '' }));

    try {
      const formData = new FormData();
      files.forEach((f) => formData.append('files', f));
      formData.append('bucket', 'portfolio-images');

      const res = await fetch('/api/admin/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to upload gallery images.');
      }

      const newUrls: string[] = Array.isArray(data.urls)
        ? data.urls
        : data.url
        ? [data.url]
        : [];

      if (newUrls.length > 0) {
        setGalleryUrls((prev) => {
          const combined = [...prev];
          newUrls.forEach((u) => {
            if (u && !combined.includes(u)) combined.push(u);
          });
          return combined;
        });

        // If no cover thumbnail yet, assign the first uploaded photo
        if (!thumbnailUrl) {
          setThumbnailUrl(newUrls[0]);
        }
        setIsDirty(true);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Gallery upload failed';
      setErrors((prev) => ({ ...prev, gallery: msg }));
    } finally {
      setIsUploadingGallery(false);
      if (galleryFileInputRef.current) galleryFileInputRef.current.value = '';
    }
  };

  // Manual URL add to gallery
  const addManualGalleryUrl = () => {
    const u = manualGalleryUrl.trim();
    if (!u) return;
    if (!galleryUrls.includes(u)) {
      setGalleryUrls((prev) => [...prev, u]);
      if (!thumbnailUrl) setThumbnailUrl(u);
      setIsDirty(true);
    }
    setManualGalleryUrl('');
  };

  // Remove photo from gallery
  const removeGalleryPhoto = (urlToRemove: string) => {
    setGalleryUrls((prev) => prev.filter((u) => u !== urlToRemove));
    if (thumbnailUrl === urlToRemove) {
      const remaining = galleryUrls.filter((u) => u !== urlToRemove);
      setThumbnailUrl(remaining[0] || '');
    }
    setIsDirty(true);
  };

  // Set photo as cover
  const makeCover = (url: string) => {
    setThumbnailUrl(url);
    setIsDirty(true);
  };

  // Reorder photos
  const moveGalleryPhoto = (idx: number, direction: 'left' | 'right') => {
    const targetIdx = direction === 'left' ? idx - 1 : idx + 1;
    if (targetIdx < 0 || targetIdx >= galleryUrls.length) return;
    setGalleryUrls((prev) => {
      const next = [...prev];
      const temp = next[idx];
      next[idx] = next[targetIdx];
      next[targetIdx] = temp;
      return next;
    });
    setIsDirty(true);
  };

  // Form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const newErrors: { [key: string]: string } = {};

    if (!title.trim()) {
      newErrors.title = 'Project title is required.';
    }

    if (!shortDescription.trim()) {
      newErrors.short_description = 'Short description is required.';
    }

    const finalSlug = slug.trim() ? generateSlug(slug) : generateSlug(title);
    if (!finalSlug) {
      newErrors.slug = 'Slug is required.';
    }

    const validateUrl = (u: string) => {
      if (!u.trim()) return true;
      const t = u.trim();
      return t.startsWith('/') || t.startsWith('http://') || t.startsWith('https://');
    };

    if (githubUrl.trim() && !validateUrl(githubUrl)) {
      newErrors.github_url = 'Must be a valid URL starting with http://, https://, or /';
    }

    if (liveUrl.trim() && !validateUrl(liveUrl)) {
      newErrors.live_url = 'Must be a valid URL starting with http://, https://, or /';
    }

    if (thumbnailUrl.trim() && !validateUrl(thumbnailUrl)) {
      newErrors.thumbnail_url = 'Must be a valid URL starting with http://, https://, or /';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    let parsedOrder: number | undefined = undefined;
    if (displayOrder.trim() !== '') {
      const o = Number(displayOrder);
      if (!isNaN(o) && o >= 0) {
        parsedOrder = Math.round(o);
      }
    }

    const finalThumbnail = thumbnailUrl.trim() || galleryUrls[0] || null;

    const payload: Partial<Project> & { gallery?: string[] } = {
      ...(initialData?.id ? { id: initialData.id } : {}),
      title: title.trim(),
      slug: finalSlug,
      short_description: shortDescription.trim(),
      full_description: fullDescription.trim(),
      thumbnail: finalThumbnail,
      thumbnail_url: finalThumbnail,
      gallery_urls: galleryUrls,
      gallery: galleryUrls,
      technologies,
      github_url: githubUrl.trim() || null,
      live_url: liveUrl.trim() || null,
      featured,
      status,
      enabled,
      ...(parsedOrder !== undefined ? { display_order: parsedOrder } : {}),
    };

    try {
      await onSubmit(payload);
      setIsDirty(false);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to save project.';
      setErrors({ form: msg });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {errors.form && (
        <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
          {errors.form}
        </div>
      )}

      {/* 1. Title & Slug */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
            Project Title <span className="text-amber-400">*</span>
          </label>
          <Input
            value={title}
            onChange={(e) => handleTitleChange(e.target.value)}
            placeholder="e.g. Distributed LLM Fine-Tuning Pipeline"
            required
            autoFocus
          />
          {errors.title && <p className="text-xs text-red-400 mt-1">{errors.title}</p>}
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
            URL Slug <span className="text-amber-400">*</span>
          </label>
          <Input
            value={slug}
            onChange={(e) => handleSlugChange(e.target.value)}
            placeholder="e.g. distributed-llm-fine-tuning"
            required
          />
          {errors.slug && <p className="text-xs text-red-400 mt-1">{errors.slug}</p>}
        </div>
      </div>

      {/* 2. Short Description */}
      <div>
        <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
          Short Summary (Shown on Project Card) <span className="text-amber-400">*</span>
        </label>
        <Textarea
          value={shortDescription}
          onChange={(e) => {
            setShortDescription(e.target.value);
            setIsDirty(true);
          }}
          placeholder="Brief 1-2 sentence description explaining the model, task, and impact..."
          rows={2}
          required
        />
        {errors.short_description && (
          <p className="text-xs text-red-400 mt-1">{errors.short_description}</p>
        )}
      </div>

      {/* 3. Full Description / Problem & Approach */}
      <div>
        <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
          Detailed Description (Objective, Approach, Results)
        </label>
        <Textarea
          value={fullDescription}
          onChange={(e) => {
            setFullDescription(e.target.value);
            setIsDirty(true);
          }}
          placeholder="Expanded technical overview, architecture design, evaluation metrics, and implementation details..."
          rows={4}
        />
      </div>

      {/* 4. Technologies & Tools */}
      <div className="space-y-3">
        <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300">
          Technologies & Tools
        </label>

        {/* Selected Tags */}
        <div className="flex flex-wrap gap-2 min-h-[32px] p-2 bg-black/20 border border-white/10 rounded-xl">
          {technologies.length > 0 ? (
            technologies.map((tech) => (
              <span
                key={tech}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-mono rounded-lg bg-amber-500/10 text-amber-300 border border-amber-500/30"
              >
                <span>{tech}</span>
                <button
                  type="button"
                  onClick={() => removeTechnology(tech)}
                  aria-label={`Remove ${tech}`}
                  className="hover:text-red-400 cursor-pointer ml-1 text-xs"
                >
                  ✕
                </button>
              </span>
            ))
          ) : (
            <span className="text-xs text-slate-400 italic">No technologies added yet.</span>
          )}
        </div>

        {/* Add custom tag input */}
        <div className="flex gap-2">
          <Input
            value={techInput}
            onChange={(e) => setTechInput(e.target.value)}
            onKeyDown={handleKeyDownTech}
            placeholder="Type technology name (e.g. PyTorch, Ray, Docker) and press Enter"
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => addTechnology(techInput)}
          >
            Add
          </Button>
        </div>

        {/* Suggested from existing Skills */}
        {availableSkills.length > 0 && (
          <div className="space-y-1.5 pt-1">
            <span className="text-[11px] text-slate-400">Quick-select from your Skills:</span>
            <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto p-1 bg-white/5 rounded-lg border border-white/5">
              {availableSkills
                .filter((s) => !technologies.includes(s.name))
                .slice(0, 20)
                .map((skill) => (
                  <button
                    key={skill.id}
                    type="button"
                    onClick={() => addTechnology(skill.name)}
                    className="px-2 py-0.5 text-[11px] font-mono rounded bg-white/5 hover:bg-amber-500/20 text-slate-300 hover:text-amber-300 border border-white/10 transition-colors cursor-pointer"
                  >
                    + {skill.name}
                  </button>
                ))}
            </div>
          </div>
        )}
      </div>

      {/* 5. Project Media / Thumbnail */}
      <div className="space-y-3">
        <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300">
          Cover Image / Thumbnail
        </label>

        <div className="flex flex-col sm:flex-row gap-4 items-start">
          {/* Thumbnail Preview */}
          <div className="w-full sm:w-48 flex-shrink-0">
            <MediaFrame
              src={thumbnailUrl || undefined}
              alt="Project Cover Preview"
              aspectRatio="16/9"
              fallbackIcon="🚀"
              className="border border-white/10 rounded-xl overflow-hidden"
            />
          </div>

          <div className="flex-1 space-y-2 w-full">
            <div className="flex gap-2">
              <Input
                value={thumbnailUrl}
                onChange={(e) => {
                  setThumbnailUrl(e.target.value);
                  setIsDirty(true);
                }}
                placeholder="https://... or /images/project-cover.jpg"
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                isLoading={isUploadingMedia}
              >
                Upload
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsMediaSelectorOpen(true)}
                className="border-amber-500/30 text-amber-300 hover:bg-amber-500/10 font-mono text-xs"
              >
                📁 Select
              </Button>
            </div>

            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              accept="image/png,image/jpeg,image/webp,image/svg+xml"
              className="hidden"
            />

            <MediaSelectorModal
              isOpen={isMediaSelectorOpen}
              onClose={() => setIsMediaSelectorOpen(false)}
              allowedTypes={['image']}
              title="Select Project Cover"
              selectedUrl={thumbnailUrl}
              onSelect={(m) => {
                setThumbnailUrl(m.public_url);
                setIsDirty(true);
              }}
            />

            {thumbnailUrl && (
              <button
                type="button"
                onClick={() => {
                  setThumbnailUrl('');
                  setIsDirty(true);
                }}
                className="text-xs text-red-400 hover:text-red-300 underline cursor-pointer"
              >
                Remove Cover Image
              </button>
            )}

            {errors.media && <p className="text-xs text-red-400">{errors.media}</p>}
            {errors.thumbnail_url && <p className="text-xs text-red-400">{errors.thumbnail_url}</p>}
          </div>
        </div>
      </div>

      {/* 5b. Project Photo Gallery / Screenshots (Multi-Photo) */}
      <div className="space-y-3 p-4 bg-white/[0.02] border border-white/10 rounded-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <div className="flex items-center gap-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-300">
                Project Photo Gallery & Screenshots
              </label>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-amber-500/15 text-amber-300 border border-amber-500/30">
                {galleryUrls.length} {galleryUrls.length === 1 ? 'photo' : 'photos'}
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Upload multiple screenshots or diagrams. Users will see all of them in the interactive project modal.
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <Button
              type="button"
              variant="primary"
              size="sm"
              onClick={() => galleryFileInputRef.current?.click()}
              isLoading={isUploadingGallery}
              className="text-xs font-mono"
            >
              📷 Upload Photos (Multiple)
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsGalleryMediaSelectorOpen(true)}
              className="border-amber-500/30 text-amber-300 hover:bg-amber-500/10 font-mono text-xs"
            >
              📁 From Media
            </Button>
          </div>
        </div>

        {/* Hidden Multi-file input */}
        <input
          type="file"
          ref={galleryFileInputRef}
          onChange={handleGalleryFileUpload}
          accept="image/png,image/jpeg,image/webp,image/svg+xml"
          multiple
          className="hidden"
        />

        {/* Media Selector Modal for Gallery */}
        <MediaSelectorModal
          isOpen={isGalleryMediaSelectorOpen}
          onClose={() => setIsGalleryMediaSelectorOpen(false)}
          allowedTypes={['image']}
          title="Add Images to Project Gallery"
          onSelect={(m) => {
            if (!galleryUrls.includes(m.public_url)) {
              setGalleryUrls((prev) => [...prev, m.public_url]);
              if (!thumbnailUrl) setThumbnailUrl(m.public_url);
              setIsDirty(true);
            }
          }}
        />

        {/* Quick URL Adder */}
        <div className="flex gap-2 pt-1">
          <Input
            value={manualGalleryUrl}
            onChange={(e) => setManualGalleryUrl(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                addManualGalleryUrl();
              }
            }}
            placeholder="Paste image URL to append to gallery and press Add..."
            className="text-xs"
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={addManualGalleryUrl}
            disabled={!manualGalleryUrl.trim()}
          >
            Add URL
          </Button>
        </div>

        {errors.gallery && <p className="text-xs text-red-400">{errors.gallery}</p>}

        {/* Gallery Thumbnails Reel / Grid */}
        {galleryUrls.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 pt-2">
            {galleryUrls.map((url, idx) => {
              const isCover = thumbnailUrl === url;
              return (
                <div
                  key={url + idx}
                  className={`group relative rounded-lg overflow-hidden border bg-[#0A0D14] transition-all ${
                    isCover
                      ? 'border-amber-400 ring-2 ring-amber-400/20'
                      : 'border-white/10 hover:border-white/20'
                  }`}
                >
                  <div className="aspect-[16/9] w-full overflow-hidden bg-black/40">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={url}
                      alt={`Gallery item ${idx + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Badges */}
                  <div className="absolute top-1.5 left-1.5 flex items-center gap-1">
                    <span className="px-1.5 py-0.5 rounded text-[9px] font-mono bg-black/75 text-white border border-white/10">
                      #{idx + 1}
                    </span>
                    {isCover && (
                      <span className="px-1.5 py-0.5 rounded text-[9px] font-mono bg-amber-500 text-slate-950 font-bold shadow">
                        COVER
                      </span>
                    )}
                  </div>

                  {/* Actions overlay */}
                  <div className="p-1.5 bg-[#0D1017] border-t border-white/5 flex items-center justify-between text-[10px]">
                    <div className="flex items-center gap-1">
                      {idx > 0 && (
                        <button
                          type="button"
                          onClick={() => moveGalleryPhoto(idx, 'left')}
                          title="Move left"
                          className="px-1.5 py-0.5 rounded bg-white/5 hover:bg-white/15 text-slate-300"
                        >
                          ◀
                        </button>
                      )}
                      {idx < galleryUrls.length - 1 && (
                        <button
                          type="button"
                          onClick={() => moveGalleryPhoto(idx, 'right')}
                          title="Move right"
                          className="px-1.5 py-0.5 rounded bg-white/5 hover:bg-white/15 text-slate-300"
                        >
                          ▶
                        </button>
                      )}
                      {!isCover && (
                        <button
                          type="button"
                          onClick={() => makeCover(url)}
                          title="Set as Cover Thumbnail"
                          className="px-1.5 py-0.5 rounded bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/20"
                        >
                          Make Cover
                        </button>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={() => removeGalleryPhoto(url)}
                      title="Remove photo"
                      className="px-1.5 py-0.5 rounded bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="p-4 border border-dashed border-white/10 rounded-lg text-center font-mono text-xs text-slate-500">
            No gallery screenshots added yet. Click &quot;Upload Photos&quot; to select one or more images.
          </div>
        )}
      </div>

      {/* 6. External Links */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
            GitHub Repository URL
          </label>
          <Input
            value={githubUrl}
            onChange={(e) => {
              setGithubUrl(e.target.value);
              setIsDirty(true);
            }}
            placeholder="https://github.com/username/project"
          />
          {errors.github_url && <p className="text-xs text-red-400 mt-1">{errors.github_url}</p>}
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
            Live Demo / Model Demo URL
          </label>
          <Input
            value={liveUrl}
            onChange={(e) => {
              setLiveUrl(e.target.value);
              setIsDirty(true);
            }}
            placeholder="https://huggingface.co/spaces/... or https://demo..."
          />
          {errors.live_url && <p className="text-xs text-red-400 mt-1">{errors.live_url}</p>}
        </div>
      </div>

      {/* 7. Status, Featured, Enabled & Display Order */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 border-t border-white/10">
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
            Publication Status
          </label>
          <Select
            value={status}
            onChange={(e) => {
              const val = e.target.value as PublishStatus;
              setStatus(val);
              if (val === 'published') setEnabled(true);
              if (val === 'draft' || val === 'archived') setEnabled(false);
              setIsDirty(true);
            }}
            options={STATUS_OPTIONS}
          />
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
            Display Order
          </label>
          <Input
            type="number"
            min={1}
            value={displayOrder}
            onChange={(e) => {
              setDisplayOrder(e.target.value);
              setIsDirty(true);
            }}
            placeholder="Auto-calculated"
          />
        </div>

        <div className="flex flex-col justify-end space-y-2 pb-1">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={featured}
              onChange={(e) => {
                setFeatured(e.target.checked);
                setIsDirty(true);
              }}
              className="w-4 h-4 rounded border-white/20 bg-black/40 text-amber-500 focus:ring-amber-500"
            />
            <span className="text-xs font-medium text-slate-200">Featured Highlight</span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={enabled}
              onChange={(e) => {
                const val = e.target.checked;
                setEnabled(val);
                if (val && status !== 'published') setStatus('published');
                if (!val && status === 'published') setStatus('draft');
                setIsDirty(true);
              }}
              className="w-4 h-4 rounded border-white/20 bg-black/40 text-amber-500 focus:ring-amber-500"
            />
            <span className="text-xs font-medium text-slate-200">Enabled (Visible Publicly)</span>
          </label>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-between pt-4 border-t border-white/10">
        <div>
          {isDirty && (
            <span className="text-xs text-amber-400/90 font-mono">
              ● Unsaved changes
            </span>
          )}
        </div>

        <div className="flex items-center gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            isLoading={isLoading}
          >
            {initialData ? 'Update Project' : 'Create Project'}
          </Button>
        </div>
      </div>
    </form>
  );
};
