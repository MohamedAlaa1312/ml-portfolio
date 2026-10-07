'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { parseSocialLinks } from '@/lib/social-utils';
import type { SiteSettings, Section, HeroContent } from '@/lib/supabase/types';
import { MediaSelectorModal } from '@/components/admin/media/MediaSelectorModal';

interface ProfileHeroEditorProps {
  initialSettings: SiteSettings | null;
  initialHeroSection: Section | null;
}

export const ProfileHeroEditor: React.FC<ProfileHeroEditorProps> = ({
  initialSettings,
  initialHeroSection,
}) => {
  const initialHeroContent = (initialHeroSection?.content as HeroContent) || null;

  // Form State — Profile
  const [name, setName] = useState(initialSettings?.name || 'Mohamed Khaled');
  const [professionalTitle, setProfessionalTitle] = useState(
    initialSettings?.professional_title || 'Machine Learning Engineer'
  );
  const [subtitle, setSubtitle] = useState(
    initialSettings?.subtitle || 'Turning Data Into Intelligent Solutions'
  );
  const [bio, setBio] = useState(
    initialSettings?.bio ||
      'I am a Machine Learning Engineer with a passion for building AI systems that solve real-world problems. I enjoy working with data, designing models, and turning complex ideas into practical solutions.'
  );
  const [email, setEmail] = useState(initialSettings?.email || 'mohamed@example.com');
  const [phone, setPhone] = useState(initialSettings?.phone || '+20 100 123 4567');
  const [location, setLocation] = useState(initialSettings?.location || 'Cairo, Egypt');

  // Centralized Social Links Initialization
  const parsedSocials = parseSocialLinks(initialSettings?.social_links);
  const getSocialValue = (platform: string, fallback: string) => {
    const found = parsedSocials.find(
      (s) => s.platform.toLowerCase() === platform.toLowerCase()
    );
    if (found?.url) return found.url;
    if (
      initialSettings?.social_links &&
      typeof initialSettings.social_links === 'object' &&
      !Array.isArray(initialSettings.social_links)
    ) {
      return (initialSettings.social_links as Record<string, string>)[platform] || fallback;
    }
    return fallback;
  };

  const [linkedin, setLinkedin] = useState(getSocialValue('linkedin', 'https://linkedin.com'));
  const [github, setGithub] = useState(getSocialValue('github', 'https://github.com'));
  const [xSocial, setXSocial] = useState(getSocialValue('x', 'https://x.com'));
  const [emailSocial, setEmailSocial] = useState(getSocialValue('email', 'mailto:mohamed@example.com'));

  // Profile Image & Resume
  const [profileImageUrl, setProfileImageUrl] = useState(
    initialSettings?.profile_image_url || initialSettings?.profile_image || '/images/profile.jpg'
  );
  const [resumeUrl, setResumeUrl] = useState(
    initialSettings?.resume_url || '/documents/resume.pdf'
  );

  // Form State — Hero
  const [greeting, setGreeting] = useState(initialHeroContent?.greeting || "Hello, I'm");
  const [heroSummary, setHeroSummary] = useState(
    initialHeroContent?.summary ||
      'I build intelligent systems using data, machine learning and modern technologies. Passionate about solving real-world problems and creating impactful solutions.'
  );
  const [primaryCtaLabel, setPrimaryCtaLabel] = useState(
    initialHeroContent?.primaryCta?.label || 'View My Projects'
  );
  const [primaryCtaAnchor, setPrimaryCtaAnchor] = useState(
    initialHeroContent?.primaryCta?.anchor || '#projects'
  );
  const [secondaryCtaLabel, setSecondaryCtaLabel] = useState(
    initialHeroContent?.secondaryCta?.label || 'Contact Me'
  );
  const [secondaryCtaAnchor, setSecondaryCtaAnchor] = useState(
    initialHeroContent?.secondaryCta?.anchor || '#contact'
  );

  // Interaction States
  const [isDirty, setIsDirty] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [isUploadingDoc, setIsUploadingDoc] = useState(false);
  const [isProfileMediaModalOpen, setIsProfileMediaModalOpen] = useState(false);
  const [isResumeMediaModalOpen, setIsResumeMediaModalOpen] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(
    null
  );

  const fileInputRef = useRef<HTMLInputElement>(null);
  const docInputRef = useRef<HTMLInputElement>(null);

  // Mark form as dirty when any field changes
  const markDirty = () => {
    if (!isDirty) setIsDirty(true);
    if (feedback) setFeedback(null);
  };

  // Prevent accidental navigation with unsaved changes
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

  // Handle Profile Image Upload
  const handleImageFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Client-side quick validations
    const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      setFeedback({
        type: 'error',
        message: 'Invalid image format. Supported formats: JPEG, PNG, WEBP.',
      });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setFeedback({
        type: 'error',
        message: 'Image size exceeds 5MB limit. Please choose a compressed photo.',
      });
      return;
    }

    setIsUploadingImage(true);
    setFeedback(null);

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

      setProfileImageUrl(data.url);
      markDirty();
      setFeedback({
        type: 'success',
        message: 'Profile image uploaded successfully. Click "Save Changes" to apply.',
      });
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : 'Image upload failed';
      setFeedback({ type: 'error', message: errorMsg });
    } finally {
      setIsUploadingImage(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // Handle Resume Upload
  const handleDocFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== 'application/pdf') {
      setFeedback({
        type: 'error',
        message: 'Invalid document type. Only PDF documents (.pdf) are supported.',
      });
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setFeedback({
        type: 'error',
        message: 'Document size exceeds 10MB limit.',
      });
      return;
    }

    setIsUploadingDoc(true);
    setFeedback(null);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('bucket', 'portfolio-documents');

      const res = await fetch('/api/admin/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to upload resume.');
      }

      setResumeUrl(data.url);
      markDirty();
      setFeedback({
        type: 'success',
        message: 'Resume document uploaded successfully. Click "Save Changes" to apply.',
      });
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : 'Resume upload failed';
      setFeedback({ type: 'error', message: errorMsg });
    } finally {
      setIsUploadingDoc(false);
      if (docInputRef.current) docInputRef.current.value = '';
    }
  };

  // Handle Form Submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);

    // Validation
    if (!name.trim()) {
      setFeedback({ type: 'error', message: 'Full name cannot be empty.' });
      return;
    }

    if (!professionalTitle.trim()) {
      setFeedback({ type: 'error', message: 'Professional title cannot be empty.' });
      return;
    }

    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setFeedback({ type: 'error', message: 'Please enter a valid email address.' });
      return;
    }

    setIsSaving(true);

    try {
      const payload = {
        profile: {
          name,
          professional_title: professionalTitle,
          subtitle,
          bio,
          email,
          phone,
          location,
          profile_image: profileImageUrl,
          profile_image_url: profileImageUrl,
          resume_url: resumeUrl,
          social_links: {
            linkedin,
            github,
            x: xSocial,
            email: emailSocial,
          },
        },
        hero: {
          greeting,
          summary: heroSummary,
          primaryCta: {
            label: primaryCtaLabel,
            anchor: primaryCtaAnchor,
          },
          secondaryCta: {
            label: secondaryCtaLabel,
            anchor: secondaryCtaAnchor,
          },
        },
      };

      const res = await fetch('/api/admin/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to update profile.');
      }

      setIsDirty(false);
      setFeedback({
        type: 'success',
        message: 'Profile and Hero updated successfully. Public portfolio revalidated.',
      });
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to save changes.';
      setFeedback({ type: 'error', message: errorMsg });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8 max-w-5xl">
      {/* Action Bar Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/10">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight text-slate-100">
              Profile & Hero CMS
            </h1>
            {isDirty ? (
              <Badge variant="gold" dot className="font-mono">
                Unsaved Changes
              </Badge>
            ) : (
              <Badge variant="success" dot className="font-mono">
                All Changes Saved
              </Badge>
            )}
          </div>
          <p className="text-xs text-slate-400 mt-1 font-mono">
            Manage your personal brand identity, contact points, and public Hero showcase.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            type="submit"
            variant="primary"
            size="md"
            disabled={!isDirty || isSaving}
            className="font-mono text-xs font-semibold px-6 min-h-[44px]"
          >
            {isSaving ? 'Saving Changes...' : 'Save Changes'}
          </Button>
        </div>
      </div>

      {/* Status Feedback Notification */}
      {feedback && (
        <div
          role="alert"
          className={`p-4 rounded-xl text-xs font-mono leading-relaxed border transition-all ${
            feedback.type === 'success'
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
              : 'bg-red-500/10 border-red-500/30 text-red-300'
          }`}
        >
          <div className="flex items-center gap-2">
            <span>{feedback.type === 'success' ? '✓' : '⚠️'}</span>
            <span>{feedback.message}</span>
          </div>
        </div>
      )}

      {/* 1. PROFILE IDENTITY & PORTRAIT */}
      <Card variant="standard" className="bg-[#0D111A] border-white/10">
        <CardHeader className="p-6 pb-4 border-b border-white/5">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-bold text-slate-100 flex items-center gap-2">
              <span>👤</span>
              <span>Profile Identity & Portrait</span>
            </CardTitle>
            <span className="text-xs font-mono text-amber-500">Core Persona</span>
          </div>
        </CardHeader>

        <CardContent className="p-6 space-y-6">
          {/* Profile Image Management */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 p-4 rounded-2xl bg-[#131926] border border-white/5">
            <div className="relative w-28 h-32 rounded-xl overflow-hidden bg-[#080B11] border border-white/10 shadow-lg flex-shrink-0">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={profileImageUrl}
                alt="Profile Preview"
                className="w-full h-full object-cover object-top filter contrast-105"
              />
              {isUploadingImage && (
                <div className="absolute inset-0 bg-black/60 flex items-center justify-center text-xs text-amber-400 font-mono">
                  Uploading...
                </div>
              )}
            </div>

            <div className="space-y-2 flex-1">
              <h4 className="text-sm font-bold text-slate-200">Portrait Photo</h4>
              <p className="text-xs text-slate-400 font-mono leading-relaxed">
                Appears prominently in the Hero showcase, About card, and metadata. JPG, PNG, or WEBP (max 5MB).
              </p>
              <div className="flex flex-wrap items-center gap-2 pt-1">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleImageFileChange}
                  className="hidden"
                  id="profile-image-upload"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={isUploadingImage}
                  onClick={() => fileInputRef.current?.click()}
                  className="text-xs font-mono"
                >
                  {profileImageUrl ? 'Replace Image' : 'Upload Image'}
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsProfileMediaModalOpen(true)}
                  className="text-xs font-mono border-amber-500/30 text-amber-300 hover:bg-amber-500/10"
                >
                  📁 Select from Library
                </Button>

                {profileImageUrl !== '/images/profile.jpg' && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setProfileImageUrl('/images/profile.jpg');
                      markDirty();
                    }}
                    className="text-xs font-mono text-slate-400 hover:text-red-400"
                  >
                    Reset to Default
                  </Button>
                )}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <Input
              label="Full Name"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                markDirty();
              }}
              required
              helperText="The display name rendered in Hero and Header."
            />

            <Input
              label="Professional Title"
              value={professionalTitle}
              onChange={(e) => {
                setProfessionalTitle(e.target.value);
                markDirty();
              }}
              required
              helperText="Primary engineering domain (e.g. Machine Learning Engineer)."
            />
          </div>

          <Input
            label="Short Introduction / Subtitle"
            value={subtitle}
            onChange={(e) => {
              setSubtitle(e.target.value);
              markDirty();
            }}
            helperText="A concise mission statement or tag-line."
          />

          <Textarea
            label="Biography / About Introduction"
            rows={4}
            value={bio}
            onChange={(e) => {
              setBio(e.target.value);
              markDirty();
            }}
            helperText="Detailed introduction used across profile and narrative sections."
          />
        </CardContent>
      </Card>

      {/* 2. CONTACT INFORMATION */}
      <Card variant="standard" className="bg-[#0D111A] border-white/10">
        <CardHeader className="p-6 pb-4 border-b border-white/5">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-bold text-slate-100 flex items-center gap-2">
              <span>📍</span>
              <span>Contact Information</span>
            </CardTitle>
            <span className="text-xs font-mono text-slate-500">Inquiries & Location</span>
          </div>
        </CardHeader>

        <CardContent className="p-6 grid grid-cols-1 md:grid-cols-3 gap-5">
          <Input
            label="Email Address"
            type="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              markDirty();
            }}
            helperText="Public contact email."
          />

          <Input
            label="Phone Number"
            type="tel"
            value={phone}
            onChange={(e) => {
              setPhone(e.target.value);
              markDirty();
            }}
            helperText="Optional phone or WhatsApp contact."
          />

          <Input
            label="Location"
            value={location}
            onChange={(e) => {
              setLocation(e.target.value);
              markDirty();
            }}
            helperText="City and country of residence."
          />
        </CardContent>
      </Card>

      {/* 3. SOCIAL LINKS */}
      <Card variant="standard" className="bg-[#0D111A] border-white/10">
        <CardHeader className="p-6 pb-4 border-b border-white/5">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-bold text-slate-100 flex items-center gap-2">
              <span>🔗</span>
              <span>Social Links & Profiles</span>
            </CardTitle>
            <span className="text-xs font-mono text-slate-500">Public Channels</span>
          </div>
          <div className="mt-3 p-3 rounded-xl bg-[#131926] border border-white/5 flex items-center justify-between text-xs font-mono">
            <span className="text-slate-400">
              💡 For custom platforms (Kaggle, HuggingFace, etc.), reordering, and visibility:
            </span>
            <a
              href="/admin/contact?tab=social"
              className="text-amber-400 hover:text-amber-300 font-semibold underline ml-2"
            >
              Open Social CMS →
            </a>
          </div>
        </CardHeader>

        <CardContent className="p-6 grid grid-cols-1 md:grid-cols-2 gap-5">
          <Input
            label="LinkedIn URL"
            value={linkedin}
            onChange={(e) => {
              setLinkedin(e.target.value);
              markDirty();
            }}
            helperText="Link to your professional LinkedIn profile."
          />

          <Input
            label="GitHub URL"
            value={github}
            onChange={(e) => {
              setGithub(e.target.value);
              markDirty();
            }}
            helperText="Link to your GitHub profile and code repositories."
          />

          <Input
            label="X (Twitter) URL"
            value={xSocial}
            onChange={(e) => {
              setXSocial(e.target.value);
              markDirty();
            }}
            helperText="Link to your X profile."
          />

          <Input
            label="Direct Email Link"
            value={emailSocial}
            onChange={(e) => {
              setEmailSocial(e.target.value);
              markDirty();
            }}
            helperText="Protocol URL (e.g. mailto:name@example.com)."
          />
        </CardContent>
      </Card>

      {/* 4. HERO SECTION CONFIGURATION */}
      <Card variant="standard" className="bg-[#0D111A] border-white/10">
        <CardHeader className="p-6 pb-4 border-b border-white/5">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-bold text-slate-100 flex items-center gap-2">
              <span>⚡</span>
              <span>Hero Section Showcase</span>
            </CardTitle>
            <span className="text-xs font-mono text-amber-500">Public Landing</span>
          </div>
        </CardHeader>

        <CardContent className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <Input
              label="Hero Eyebrow / Greeting"
              value={greeting}
              onChange={(e) => {
                setGreeting(e.target.value);
                markDirty();
              }}
              helperText="Small monospace greeting above name (e.g. Hello, I'm)."
            />

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-mono font-medium text-slate-400">
                Hero Name & Title Source
              </label>
              <div className="p-3 rounded-xl bg-[#131926] border border-white/5 text-xs font-mono text-slate-300">
                Synchronized with Profile Identity: <strong className="text-amber-400">{name}</strong> — {professionalTitle}
              </div>
            </div>
          </div>

          <Textarea
            label="Hero Description / Narrative"
            rows={3}
            value={heroSummary}
            onChange={(e) => {
              setHeroSummary(e.target.value);
              markDirty();
            }}
            helperText="The high-impact technical paragraph rendered beneath your role in the Hero section."
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 p-4 rounded-2xl bg-[#131926] border border-white/5">
            <div className="space-y-4">
              <h5 className="text-xs font-bold font-mono text-amber-400 uppercase tracking-wider">
                Primary Call-to-Action
              </h5>
              <Input
                label="Button Label"
                value={primaryCtaLabel}
                onChange={(e) => {
                  setPrimaryCtaLabel(e.target.value);
                  markDirty();
                }}
              />
              <Input
                label="Target Anchor / URL"
                value={primaryCtaAnchor}
                onChange={(e) => {
                  setPrimaryCtaAnchor(e.target.value);
                  markDirty();
                }}
                helperText="Use section anchor (e.g. #projects) or external URL."
              />
            </div>

            <div className="space-y-4">
              <h5 className="text-xs font-bold font-mono text-slate-300 uppercase tracking-wider">
                Secondary Call-to-Action
              </h5>
              <Input
                label="Button Label"
                value={secondaryCtaLabel}
                onChange={(e) => {
                  setSecondaryCtaLabel(e.target.value);
                  markDirty();
                }}
              />
              <Input
                label="Target Anchor / URL"
                value={secondaryCtaAnchor}
                onChange={(e) => {
                  setSecondaryCtaAnchor(e.target.value);
                  markDirty();
                }}
                helperText="Use section anchor (e.g. #contact) or external URL."
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 5. RESUME / CV DOCUMENT */}
      <Card variant="standard" className="bg-[#0D111A] border-white/10">
        <CardHeader className="p-6 pb-4 border-b border-white/5">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-bold text-slate-100 flex items-center gap-2">
              <span>📄</span>
              <span>Curriculum Vitae / Resume</span>
            </CardTitle>
            <span className="text-xs font-mono text-slate-500">PDF Document</span>
          </div>
        </CardHeader>

        <CardContent className="p-6 space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-2xl bg-[#131926] border border-white/5">
            <div className="space-y-1">
              <div className="text-xs font-mono text-slate-400">Current Resume Link:</div>
              <div className="text-sm font-mono text-amber-400 break-all">
                {resumeUrl || 'None configured'}
              </div>
            </div>

            <div className="flex items-center gap-3">
              <input
                ref={docInputRef}
                type="file"
                accept="application/pdf"
                onChange={handleDocFileChange}
                className="hidden"
                id="resume-doc-upload"
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={isUploadingDoc}
                onClick={() => docInputRef.current?.click()}
                className="text-xs font-mono"
              >
                {isUploadingDoc ? 'Uploading...' : 'Upload New CV (PDF)'}
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsResumeMediaModalOpen(true)}
                className="text-xs font-mono border-amber-500/30 text-amber-300 hover:bg-amber-500/10"
              >
                📁 Select from Library
              </Button>
              {resumeUrl && (
                <a
                  href={resumeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs font-mono text-slate-400 hover:text-amber-400 underline"
                >
                  Preview ↗
                </a>
              )}
            </div>
          </div>

          <Input
            label="Or Enter Direct Resume URL"
            value={resumeUrl}
            onChange={(e) => {
              setResumeUrl(e.target.value);
              markDirty();
            }}
            helperText="Absolute URL or relative path (e.g. /documents/resume.pdf)."
          />
        </CardContent>
      </Card>

      {/* Bottom Sticky Save Bar */}
      <div className="sticky bottom-6 z-20 p-4 rounded-2xl bg-[#0D111A]/95 backdrop-blur-md border border-white/10 shadow-2xl flex items-center justify-between gap-4">
        <div className="text-xs font-mono text-slate-400">
          {isDirty ? (
            <span className="text-amber-400">⚠️ You have unsaved changes</span>
          ) : (
            <span className="text-emerald-400">✓ All changes saved to CMS</span>
          )}
        </div>

        <Button
          type="submit"
          variant="primary"
          size="md"
          disabled={!isDirty || isSaving}
          className="font-mono text-xs font-semibold px-6 min-h-[44px]"
        >
          {isSaving ? 'Saving Changes...' : 'Save Changes'}
        </Button>
      </div>

      {/* Media Selector Modals */}
      <MediaSelectorModal
        isOpen={isProfileMediaModalOpen}
        onClose={() => setIsProfileMediaModalOpen(false)}
        allowedTypes={['image']}
        title="Select Profile Photo"
        selectedUrl={profileImageUrl}
        onSelect={(m) => {
          setProfileImageUrl(m.public_url);
          markDirty();
        }}
      />

      <MediaSelectorModal
        isOpen={isResumeMediaModalOpen}
        onClose={() => setIsResumeMediaModalOpen(false)}
        allowedTypes={['document']}
        title="Select Resume Document"
        selectedUrl={resumeUrl}
        onSelect={(m) => {
          setResumeUrl(m.public_url);
          markDirty();
        }}
      />
    </form>
  );
};
