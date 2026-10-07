'use client';

import React, { useState, useRef } from 'react';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/Select';
import { Tag } from '@/components/ui/Tag';
import type { Experience, PublishStatus } from '@/lib/supabase/types';
import { MediaSelectorModal } from '@/components/admin/media/MediaSelectorModal';

interface ExperienceFormProps {
  initialData?: Experience | null;
  onSubmit: (data: Partial<Experience>) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

const EMPLOYMENT_TYPES = [
  { value: 'Full-time', label: 'Full-time' },
  { value: 'Part-time', label: 'Part-time' },
  { value: 'Contract', label: 'Contract' },
  { value: 'Internship', label: 'Internship' },
  { value: 'Freelance', label: 'Freelance' },
];

export const ExperienceForm: React.FC<ExperienceFormProps> = ({
  initialData,
  onSubmit,
  onCancel,
  isLoading = false,
}) => {
  // Form fields
  const [company, setCompany] = useState(initialData?.company || '');
  const [role, setRole] = useState(initialData?.role || '');
  const [employmentType, setEmploymentType] = useState(
    initialData?.employment_type || 'Full-time'
  );
  const [location, setLocation] = useState(initialData?.location || 'Remote');

  // Dates
  const [startDate, setStartDate] = useState(
    initialData?.start_date ? initialData.start_date.substring(0, 10) : ''
  );
  const [endDate, setEndDate] = useState(
    initialData?.end_date ? initialData.end_date.substring(0, 10) : ''
  );
  const [isCurrent, setIsCurrent] = useState(
    initialData ? Boolean(initialData.is_current ?? initialData.current_position) : false
  );

  // Content
  const [description, setDescription] = useState(initialData?.description || '');
  const [achievements, setAchievements] = useState<string[]>(
    initialData?.achievements && initialData.achievements.length > 0
      ? initialData.achievements
      : []
  );
  const [responsibilities, setResponsibilities] = useState<string[]>(
    initialData?.responsibilities && initialData.responsibilities.length > 0
      ? initialData.responsibilities
      : []
  );
  const [technologies, setTechnologies] = useState<string[]>(
    initialData?.technologies && initialData.technologies.length > 0
      ? initialData.technologies
      : []
  );

  // New technology tag input state
  const [techInput, setTechInput] = useState('');

  // Media
  const [companyLogo, setCompanyLogo] = useState(
    initialData?.company_logo || initialData?.company_logo_url || ''
  );
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);
  const [isMediaSelectorOpen, setIsMediaSelectorOpen] = useState(false);
  const logoInputRef = useRef<HTMLInputElement>(null);

  // Settings
  const [enabled, setEnabled] = useState(
    initialData !== undefined && initialData !== null ? initialData.enabled : true
  );
  const [status, setStatus] = useState<PublishStatus>(
    initialData?.status || 'published'
  );
  const [displayOrder] = useState<number>(
    initialData?.display_order || 1
  );

  // Validation errors
  const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});

  // Achievements handlers
  const addAchievement = () => {
    setAchievements([...achievements, '']);
  };

  const updateAchievement = (index: number, val: string) => {
    const updated = [...achievements];
    updated[index] = val;
    setAchievements(updated);
  };

  const removeAchievement = (index: number) => {
    setAchievements(achievements.filter((_, i) => i !== index));
  };

  const moveAchievement = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= achievements.length) return;
    const updated = [...achievements];
    const temp = updated[index];
    updated[index] = updated[targetIndex];
    updated[targetIndex] = temp;
    setAchievements(updated);
  };

  // Responsibilities handlers
  const addResponsibility = () => {
    setResponsibilities([...responsibilities, '']);
  };

  const updateResponsibility = (index: number, val: string) => {
    const updated = [...responsibilities];
    updated[index] = val;
    setResponsibilities(updated);
  };

  const removeResponsibility = (index: number) => {
    setResponsibilities(responsibilities.filter((_, i) => i !== index));
  };

  // Technologies handlers
  const handleAddTech = (e: React.KeyboardEvent | React.MouseEvent) => {
    if ('key' in e && e.key !== 'Enter') return;
    e.preventDefault();
    const trimmed = techInput.trim();
    if (!trimmed) return;
    if (!technologies.includes(trimmed)) {
      setTechnologies([...technologies, trimmed]);
    }
    setTechInput('');
  };

  const handleRemoveTech = (tag: string) => {
    setTechnologies(technologies.filter((t) => t !== tag));
  };

  // Logo upload handler
  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml'];
    if (!validTypes.includes(file.type)) {
      setFormErrors({ logo: 'Invalid image format (JPEG, PNG, WEBP, SVG).' });
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      setFormErrors({ logo: 'Logo image must be smaller than 2MB.' });
      return;
    }

    setIsUploadingLogo(true);
    setFormErrors((prev) => ({ ...prev, logo: '' }));

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
        throw new Error(data.error || 'Failed to upload logo.');
      }

      setCompanyLogo(data.url);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Logo upload failed';
      setFormErrors((prev) => ({ ...prev, logo: msg }));
    } finally {
      setIsUploadingLogo(false);
      if (logoInputRef.current) logoInputRef.current.value = '';
    }
  };

  // Form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const errors: { [key: string]: string } = {};
    if (!company.trim()) errors.company = 'Company is required.';
    if (!role.trim()) errors.role = 'Role is required.';
    if (!startDate.trim()) errors.startDate = 'Start date is required.';

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    setFormErrors({});

    const payload: Partial<Experience> = {
      id: initialData?.id,
      company: company.trim(),
      role: role.trim(),
      employment_type: employmentType,
      location: location.trim(),
      start_date: startDate.trim(),
      end_date: isCurrent ? null : (endDate.trim() || null),
      is_current: isCurrent,
      current_position: isCurrent,
      description: description.trim(),
      achievements: achievements.filter((a) => a.trim()),
      responsibilities: responsibilities.filter((r) => r.trim()),
      technologies,
      company_logo: companyLogo.trim() || null,
      company_logo_url: companyLogo.trim() || null,
      display_order: displayOrder,
      enabled,
      status,
    };

    await onSubmit(payload);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Basic Information */}
      <div className="space-y-4">
        <h4 className="text-xs font-mono font-bold text-amber-500 uppercase tracking-wider">
          1. Basic Information
        </h4>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Company / Organization"
            value={company}
            onChange={(e) => setCompany(e.target.value)}
            placeholder="e.g. Google, DeepMind"
            error={formErrors.company}
            required
          />

          <Input
            label="Role / Title"
            value={role}
            onChange={(e) => setRole(e.target.value)}
            placeholder="e.g. Machine Learning Engineer"
            error={formErrors.role}
            required
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Select
            label="Employment Type"
            value={employmentType}
            onChange={(e) => setEmploymentType(e.target.value)}
            options={EMPLOYMENT_TYPES}
          />

          <Input
            label="Location"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="e.g. Remote, Cairo, San Francisco"
          />
        </div>
      </div>

      {/* Dates & Timeline */}
      <div className="space-y-4 pt-2 border-t border-white/5">
        <h4 className="text-xs font-mono font-bold text-amber-500 uppercase tracking-wider">
          2. Timeline & Dates
        </h4>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-start">
          <Input
            label="Start Date"
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            error={formErrors.startDate}
            required
          />

          <div>
            <Input
              label="End Date"
              type="date"
              value={endDate}
              disabled={isCurrent}
              onChange={(e) => setEndDate(e.target.value)}
              helperText={isCurrent ? 'Ongoing position' : undefined}
            />

            <label className="flex items-center gap-2 mt-2 cursor-pointer">
              <input
                type="checkbox"
                checked={isCurrent}
                onChange={(e) => {
                  setIsCurrent(e.target.checked);
                  if (e.target.checked) setEndDate('');
                }}
                className="w-4 h-4 rounded bg-[#131926] border border-white/20 text-amber-500 focus:ring-amber-500/20 cursor-pointer"
              />
              <span className="text-xs font-mono text-slate-300">
                I currently work in this position (Ongoing)
              </span>
            </label>
          </div>
        </div>
      </div>

      {/* Main Description */}
      <div className="space-y-2 pt-2 border-t border-white/5">
        <h4 className="text-xs font-mono font-bold text-amber-500 uppercase tracking-wider">
          3. Summary & Role Description
        </h4>
        <Textarea
          rows={3}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Brief summary of your core focus, technical scope, and team objectives..."
          helperText="General overview paragraph displayed on the timeline card."
        />
      </div>

      {/* Key Achievements */}
      <div className="space-y-3 pt-2 border-t border-white/5">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-xs font-mono font-bold text-amber-500 uppercase tracking-wider">
              4. Key Achievements
            </h4>
            <p className="text-[11px] text-slate-400 font-mono">
              Highlighted metrics and outcomes (with checkmark icons)
            </p>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={addAchievement}
            className="text-xs min-h-[32px]"
          >
            + Add Achievement
          </Button>
        </div>

        {achievements.length === 0 ? (
          <p className="text-xs text-slate-500 font-mono italic">
            No specific achievements added yet.
          </p>
        ) : (
          <div className="space-y-2">
            {achievements.map((item, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <span className="text-xs font-mono text-emerald-400">✔</span>
                <input
                  type="text"
                  value={item}
                  onChange={(e) => updateAchievement(idx, e.target.value)}
                  placeholder="e.g. Reduced model inference latency by 40%"
                  className="flex-1 px-3 py-2 text-xs rounded-lg bg-[#131926] border border-white/10 text-slate-100 focus-ring"
                />
                <button
                  type="button"
                  onClick={() => moveAchievement(idx, 'up')}
                  disabled={idx === 0}
                  className="text-slate-400 hover:text-slate-200 disabled:opacity-30 p-1 text-xs"
                  aria-label="Move achievement up"
                >
                  ▲
                </button>
                <button
                  type="button"
                  onClick={() => moveAchievement(idx, 'down')}
                  disabled={idx === achievements.length - 1}
                  className="text-slate-400 hover:text-slate-200 disabled:opacity-30 p-1 text-xs"
                  aria-label="Move achievement down"
                >
                  ▼
                </button>
                <button
                  type="button"
                  onClick={() => removeAchievement(idx)}
                  className="text-slate-400 hover:text-red-400 p-1 text-xs"
                  aria-label="Remove achievement"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Responsibilities */}
      <div className="space-y-3 pt-2 border-t border-white/5">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-xs font-mono font-bold text-amber-500 uppercase tracking-wider">
              5. Responsibilities
            </h4>
            <p className="text-[11px] text-slate-400 font-mono">
              Bullet points detailing daily technical responsibilities
            </p>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={addResponsibility}
            className="text-xs min-h-[32px]"
          >
            + Add Responsibility
          </Button>
        </div>

        {responsibilities.length === 0 ? (
          <p className="text-xs text-slate-500 font-mono italic">
            No responsibilities added yet.
          </p>
        ) : (
          <div className="space-y-2">
            {responsibilities.map((resp, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <span className="text-xs font-mono text-amber-500">•</span>
                <input
                  type="text"
                  value={resp}
                  onChange={(e) => updateResponsibility(idx, e.target.value)}
                  placeholder="e.g. Collaborated with cross-functional teams to deliver AI features"
                  className="flex-1 px-3 py-2 text-xs rounded-lg bg-[#131926] border border-white/10 text-slate-100 focus-ring"
                />
                <button
                  type="button"
                  onClick={() => removeResponsibility(idx)}
                  className="text-slate-400 hover:text-red-400 p-1 text-xs"
                  aria-label="Remove responsibility"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Technologies */}
      <div className="space-y-3 pt-2 border-t border-white/5">
        <h4 className="text-xs font-mono font-bold text-amber-500 uppercase tracking-wider">
          6. Technologies & Tools
        </h4>

        <div className="flex items-center gap-2">
          <input
            type="text"
            value={techInput}
            onChange={(e) => setTechInput(e.target.value)}
            onKeyDown={handleAddTech}
            placeholder="Type technology (e.g. PyTorch, Docker) and press Enter"
            className="flex-1 px-3.5 py-2.5 text-xs rounded-xl bg-[#131926] border border-white/10 text-slate-100 focus-ring"
          />
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={handleAddTech}
            className="text-xs min-h-[38px]"
          >
            Add Tag
          </Button>
        </div>

        {technologies.length > 0 && (
          <div className="flex flex-wrap gap-2 pt-1">
            {technologies.map((tech) => (
              <Tag
                key={tech}
                className="flex items-center gap-1.5 text-xs pr-2 bg-[#1A2234]"
              >
                <span>{tech}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveTech(tech)}
                  className="text-slate-400 hover:text-red-400 ml-1 font-bold text-xs"
                  aria-label={`Remove ${tech}`}
                >
                  ✕
                </button>
              </Tag>
            ))}
          </div>
        )}
      </div>

      {/* Company Logo / Media */}
      <div className="space-y-3 pt-2 border-t border-white/5">
        <h4 className="text-xs font-mono font-bold text-amber-500 uppercase tracking-wider">
          7. Company Logo
        </h4>

        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-[#131926] border border-white/10 flex items-center justify-center overflow-hidden shrink-0">
            {companyLogo ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={companyLogo}
                alt={`${company} logo preview`}
                className="w-full h-full object-contain p-1"
              />
            ) : (
              <span className="text-xs font-mono font-bold text-slate-500">
                {company ? company.slice(0, 2).toUpperCase() : '🏢'}
              </span>
            )}
          </div>

          <div className="flex-1 space-y-2">
            <div className="flex items-center gap-2">
              <input
                ref={logoInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/svg+xml"
                className="hidden"
                onChange={handleLogoUpload}
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => logoInputRef.current?.click()}
                isLoading={isUploadingLogo}
                disabled={isUploadingLogo}
                className="text-xs min-h-[34px]"
              >
                {isUploadingLogo ? 'Uploading...' : 'Upload Logo'}
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsMediaSelectorOpen(true)}
                disabled={isUploadingLogo}
                className="text-xs min-h-[34px] border-amber-500/30 text-amber-300 hover:bg-amber-500/10 font-mono"
              >
                📁 Select
              </Button>
              <MediaSelectorModal
                isOpen={isMediaSelectorOpen}
                onClose={() => setIsMediaSelectorOpen(false)}
                allowedTypes={['image']}
                title="Select Company Logo"
                selectedUrl={companyLogo}
                onSelect={(m) => setCompanyLogo(m.public_url)}
              />
              {companyLogo && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setCompanyLogo('')}
                  className="text-xs text-red-400 hover:text-red-300 min-h-[34px]"
                >
                  Remove Logo
                </Button>
              )}
            </div>

            <Input
              value={companyLogo}
              onChange={(e) => setCompanyLogo(e.target.value)}
              placeholder="Or enter logo image URL directly"
              className="text-xs py-2"
            />
          </div>
        </div>
        {formErrors.logo && (
          <p className="text-xs text-red-400 font-mono">{formErrors.logo}</p>
        )}
      </div>

      {/* Visibility & Publication Status */}
      <div className="space-y-4 pt-2 border-t border-white/5">
        <h4 className="text-xs font-mono font-bold text-amber-500 uppercase tracking-wider">
          8. Publication & Visibility
        </h4>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
          <Select
            label="Publication Status"
            value={status}
            onChange={(e) => setStatus(e.target.value as PublishStatus)}
            options={[
              { value: 'published', label: 'Published (Public)' },
              { value: 'draft', label: 'Draft (Admin Only)' },
              { value: 'archived', label: 'Archived (Hidden)' },
            ]}
          />

          <div className="flex items-center justify-between p-3 rounded-xl bg-[#131926] border border-white/5 mt-auto">
            <div>
              <span className="text-xs font-bold text-slate-200 block">
                Enable Entry
              </span>
              <span className="text-[11px] text-slate-400 font-mono block">
                {enabled ? 'Active on portfolio' : 'Temporarily disabled'}
              </span>
            </div>
            <input
              type="checkbox"
              checked={enabled}
              onChange={(e) => setEnabled(e.target.checked)}
              className="w-5 h-5 rounded bg-[#0D111A] border border-white/20 text-amber-500 focus:ring-amber-500/20 cursor-pointer"
            />
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-end gap-3 pt-6 border-t border-white/10">
        <Button
          type="button"
          variant="secondary"
          size="md"
          onClick={onCancel}
          disabled={isLoading}
          className="min-h-[44px]"
        >
          Cancel
        </Button>
        <Button
          type="submit"
          variant="primary"
          size="md"
          isLoading={isLoading}
          disabled={isLoading}
          className="min-h-[44px]"
        >
          {initialData ? 'Update Experience' : 'Create Experience'}
        </Button>
      </div>
    </form>
  );
};
