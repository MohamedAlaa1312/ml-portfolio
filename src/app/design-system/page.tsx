'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Button,
  TextLink,
  Badge,
  Tag,
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
  SectionHeading,
  Divider,
  MediaFrame,
  Input,
  Textarea,
  Select,
  Modal,
  LoadingSpinner,
  SkeletonText,
  SkeletonCard,
  EmptyState,
  ExperienceItem,
  IdentityFrame,
} from '@/components/ui';

export default function DesignSystemShowcasePage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [selectedTag, setSelectedTag] = useState('PyTorch');

  return (
    <div className="min-h-screen bg-[#080B11] text-slate-100 p-6 md:p-12 font-sans selection:bg-amber-500/30 selection:text-amber-200">
      <div className="max-w-7xl mx-auto space-y-16">
        {/* Header */}
        <header className="flex flex-wrap items-center justify-between gap-4 pb-8 border-b border-white/10">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse" />
              <span className="text-xs font-mono text-amber-500 tracking-wider uppercase">
                Phase 2 // Design System Foundations
              </span>
            </div>
            <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight text-slate-100">
              Visual System Showcase
            </h1>
            <p className="text-sm md:text-base text-slate-400 mt-2 max-w-2xl">
              Centralized tokens, accessible primitives, and identity foundations for a professional Machine Learning Engineer portfolio.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link href="/" className="px-4 py-2 text-xs font-mono rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10 transition-colors">
              ← Live Site
            </Link>
            <Link href="/admin/dashboard" className="px-4 py-2 text-xs font-mono rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 transition-colors">
              Admin Portal
            </Link>
          </div>
        </header>

        {/* 1. PERSONAL IDENTITY FOUNDATION (Section 5) */}
        <section className="space-y-6">
          <SectionHeading
            badge="Section 01 // Identity Foundation"
            title="Personal Identity Frame"
            subtitle="Prominently accommodates large profile portrait, bold name, clear ML Engineer title, and key CTAs without cinematic distractions."
          />
          <IdentityFrame
            name="Mohamed Alaa"
            title="Machine Learning Engineer"
            introduction="I design and build production-grade machine learning models, neural pipelines, and scalable data-driven systems. Passionate about applied AI and solving complex technical challenges."
            actions={
              <>
                <Button variant="primary" size="md">
                  View My Projects
                </Button>
                <Button variant="outline" size="md">
                  Get In Touch
                </Button>
              </>
            }
            socials={
              <div className="flex items-center gap-4 text-xs font-mono">
                <TextLink href="https://linkedin.com" isExternal variant="amber">
                  LinkedIn
                </TextLink>
                <span>•</span>
                <TextLink href="https://github.com" isExternal variant="amber">
                  GitHub
                </TextLink>
                <span>•</span>
                <TextLink href="mailto:mohamed@example.com" variant="amber">
                  Email
                </TextLink>
              </div>
            }
          />
        </section>

        {/* 2. COLOR TOKENS */}
        <section className="space-y-6">
          <SectionHeading
            badge="Section 02 // Atmosphere"
            title="Color Palette Tokens"
            subtitle="Curated dark palette: Dark Charcoal, Cold Blue-Gray, Burnt Orange, Antique Gold, Muted Crimson."
          />
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
            <div className="p-4 rounded-xl bg-[#080B11] border border-white/15 space-y-2">
              <div className="w-full h-12 rounded-lg bg-[#080B11] border border-white/20" />
              <p className="text-xs font-bold text-slate-100">Dark Charcoal</p>
              <p className="text-[10px] font-mono text-slate-400">#080B11 (Primary)</p>
            </div>
            <div className="p-4 rounded-xl bg-[#0D111A] border border-white/15 space-y-2">
              <div className="w-full h-12 rounded-lg bg-[#0D111A] border border-white/20" />
              <p className="text-xs font-bold text-slate-100">Cold Blue-Gray</p>
              <p className="text-[10px] font-mono text-slate-400">#0D111A (Secondary)</p>
            </div>
            <div className="p-4 rounded-xl bg-[#131926] border border-white/15 space-y-2">
              <div className="w-full h-12 rounded-lg bg-[#D97706]" />
              <p className="text-xs font-bold text-slate-100">Burnt Orange</p>
              <p className="text-[10px] font-mono text-slate-400">#D97706 (Accent)</p>
            </div>
            <div className="p-4 rounded-xl bg-[#131926] border border-white/15 space-y-2">
              <div className="w-full h-12 rounded-lg bg-[#F59E0B]" />
              <p className="text-xs font-bold text-slate-100">Antique Gold</p>
              <p className="text-[10px] font-mono text-slate-400">#F59E0B (Accent Gold)</p>
            </div>
            <div className="p-4 rounded-xl bg-[#131926] border border-white/15 space-y-2">
              <div className="w-full h-12 rounded-lg bg-[#DC2626]" />
              <p className="text-xs font-bold text-slate-100">Muted Crimson</p>
              <p className="text-[10px] font-mono text-slate-400">#DC2626 (Alert)</p>
            </div>
          </div>
        </section>

        {/* 3. BUTTON SYSTEM */}
        <section className="space-y-6">
          <SectionHeading
            badge="Section 03 // Interactions"
            title="Button System"
            subtitle="Variants, sizes, and states with accessible 44px min touch targets."
          />
          <div className="flex flex-wrap items-center gap-4 p-6 rounded-2xl bg-[#0D111A] border border-white/10">
            <Button variant="primary" size="md">
              Primary Button
            </Button>
            <Button variant="secondary" size="md">
              Secondary Button
            </Button>
            <Button variant="outline" size="md">
              Outline Button
            </Button>
            <Button variant="ghost" size="md">
              Ghost Button
            </Button>
            <Button variant="destructive" size="md">
              Destructive
            </Button>
            <Button variant="primary" size="md" isLoading>
              Loading State
            </Button>
            <Button variant="secondary" size="md" disabled>
              Disabled
            </Button>
          </div>
        </section>

        {/* 4. BADGES & TAGS */}
        <section className="space-y-6">
          <SectionHeading
            badge="Section 04 // Metadata"
            title="Badges & Tech Stack Tags"
            subtitle="Technical indicators and technology pills for categorizing models and tools."
          />
          <div className="space-y-4 p-6 rounded-2xl bg-[#0D111A] border border-white/10">
            <div className="flex flex-wrap gap-3 items-center">
              <Badge variant="default">Default</Badge>
              <Badge variant="accent" dot>Active Model</Badge>
              <Badge variant="gold" dot>Antique Gold</Badge>
              <Badge variant="crimson" dot>Deprecated</Badge>
              <Badge variant="success" dot>Production Ready</Badge>
              <Badge variant="outline">Telemetry</Badge>
            </div>
            <Divider variant="subtle" />
            <div className="flex flex-wrap gap-2 items-center">
              {['PyTorch', 'TensorFlow', 'Scikit-learn', 'FastAPI', 'Docker', 'Kubernetes'].map((tech) => (
                <Tag
                  key={tech}
                  interactive
                  active={selectedTag === tech}
                  onClick={() => setSelectedTag(tech)}
                >
                  {tech}
                </Tag>
              ))}
            </div>
          </div>
        </section>

        {/* 5. CARD SYSTEM */}
        <section className="space-y-6">
          <SectionHeading
            badge="Section 05 // Containers"
            title="Card Variants"
            subtitle="Standard, elevated, cinematic, translucent, and interactive cards."
          />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card variant="standard">
              <CardHeader>
                <CardTitle>Standard Card</CardTitle>
                <CardDescription>Clean baseline container with subtle border.</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-slate-400">Standard surface for general layout and forms.</p>
              </CardContent>
            </Card>

            <Card variant="cinematic">
              <CardHeader>
                <CardTitle>Cinematic Card</CardTitle>
                <CardDescription>Subtle vertical gradient and deep shadow.</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-slate-400">Reserved for featured highlights and major milestones.</p>
              </CardContent>
            </Card>

            <Card variant="interactive">
              <CardHeader>
                <CardTitle>Interactive Card</CardTitle>
                <CardDescription>Hover micro-interaction with amber border glow.</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-slate-400">Click or hover to experience smooth elevation.</p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* 6. EXPERIENCE FOUNDATION (Section 11) */}
        <section className="space-y-6">
          <SectionHeading
            badge="Section 06 // Career Architecture"
            title="Experience Timeline Primitive"
            subtitle="Structured experience panel communicating technical achievements, responsibilities, and toolsets."
          />
          <div className="p-8 rounded-2xl bg-[#0D111A] border border-white/10 max-w-3xl">
            <ExperienceItem
              company="Google"
              role="Machine Learning Engineer"
              employmentType="Full-time"
              location="Remote"
              startDate="Jan 2022"
              isCurrent
              description="Developed and deployed production-grade machine learning models serving high-throughput inference pipelines."
              responsibilities={[
                'Engineered distributed model training pipelines reducing latency by 40%.',
                'Collaborated with cross-functional teams to deploy real-time inference systems.',
              ]}
              achievements={['Latency reduction: 40%', 'Served 10M+ daily requests']}
              technologies={['Python', 'TensorFlow', 'Kubernetes', 'GCP']}
            />
          </div>
        </section>

        {/* 7. FORM SYSTEM */}
        <section className="space-y-6">
          <SectionHeading
            badge="Section 07 // Inputs & Controls"
            title="Form Components"
            subtitle="Accessible inputs, textareas, and select dropdowns with focus-visible rings."
          />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 rounded-2xl bg-[#0D111A] border border-white/10">
            <Input
              label="Admin Email"
              placeholder="admin@example.com"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              helperText="Your authorized administrator email address."
            />
            <Select
              label="Publication Status"
              options={[
                { value: 'draft', label: 'Draft (Internal Preview)' },
                { value: 'published', label: 'Published (Live on Site)' },
                { value: 'archived', label: 'Archived (Historical)' },
              ]}
              helperText="Determines live visibility."
            />
            <div className="md:col-span-2">
              <Textarea
                label="Project Description"
                placeholder="Describe your machine learning model architecture..."
                rows={3}
              />
            </div>
          </div>
        </section>

        {/* 8. MEDIA FRAMES & SKELETONS */}
        <section className="space-y-6">
          <SectionHeading
            badge="Section 08 // Media & States"
            title="Media Frames & Feedback"
            subtitle="Aspect ratios, fallback states, modal dialogs, and skeleton loaders."
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            <div>
              <p className="text-xs font-mono text-slate-400 mb-2">16:9 Aspect Frame</p>
              <MediaFrame alt="Model Architecture" aspectRatio="16/9" fallbackIcon="📊" />
            </div>
            <div>
              <p className="text-xs font-mono text-slate-400 mb-2">1:1 Square Frame</p>
              <MediaFrame alt="Certification Badge" aspectRatio="1/1" fallbackIcon="📜" />
            </div>
            <div>
              <p className="text-xs font-mono text-slate-400 mb-2">Card Skeleton</p>
              <SkeletonCard />
            </div>
            <div>
              <p className="text-xs font-mono text-slate-400 mb-2">Modal Dialog Trigger</p>
              <div className="h-full flex flex-col justify-center items-center p-4 rounded-2xl bg-[#0D111A] border border-white/10">
                <Button variant="outline" size="sm" onClick={() => setIsModalOpen(true)}>
                  Open Modal
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Modal Dialog Instance */}
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title="Accessible Modal Dialog"
          description="Keyboard-accessible with ESC key listener, focus trap, and background blur."
        >
          <p className="text-xs text-slate-400 leading-relaxed mb-6">
            This modal primitive is reusable across both Public dialogs and Admin CMS editors.
          </p>
          <div className="flex justify-end gap-3">
            <Button variant="ghost" size="sm" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" onClick={() => setIsModalOpen(false)}>
              Confirm
            </Button>
          </div>
        </Modal>

        {/* 9. EMPTY STATE */}
        <section className="space-y-6">
          <SectionHeading
            badge="Section 09 // Placeholders"
            title="Empty State Primitive"
            subtitle="Provides structured user guidance when content or query results are empty."
          />
          <EmptyState
            icon="🧠"
            title="No Machine Learning Experiments Active"
            description="Initialize a new model training pipeline or configure datasets from your administrative dashboard."
            actionLabel="Configure Pipeline"
            onAction={() => alert('Empty state action triggered')}
          />
        </section>
      </div>
    </div>
  );
}
