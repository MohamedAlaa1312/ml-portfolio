'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import type { Project } from '@/lib/supabase/types';
import { Button } from './Button';

export interface ProjectDetailsModalProps {
  project: Project | null;
  isOpen: boolean;
  onClose: () => void;
}

export const ProjectDetailsModal: React.FC<ProjectDetailsModalProps> = ({
  project,
  isOpen,
  onClose,
}) => {
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  // Extract all photos (thumbnail + gallery)
  const photos = useMemo(() => {
    if (!project) return [];
    const list: string[] = [];
    const thumb = project.thumbnail_url || project.thumbnail;
    if (thumb) list.push(thumb);
    if (Array.isArray(project.gallery_urls)) {
      project.gallery_urls.forEach((url) => {
        if (url && !list.includes(url)) {
          list.push(url);
        }
      });
    }
    return list;
  }, [project]);

  // Reset active image on project change or open
  useEffect(() => {
    setActiveImageIndex(0);
  }, [project?.id, isOpen]);

  // Next & Previous image handlers
  const handlePrev = useCallback(() => {
    if (photos.length <= 1) return;
    setActiveImageIndex((prev) => (prev === 0 ? photos.length - 1 : prev - 1));
  }, [photos.length]);

  const handleNext = useCallback(() => {
    if (photos.length <= 1) return;
    setActiveImageIndex((prev) => (prev === photos.length - 1 ? 0 : prev + 1));
  }, [photos.length]);

  // Keyboard navigation: Escape to close, Arrows for photo carousel
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowLeft') {
        handlePrev();
      } else if (e.key === 'ArrowRight') {
        handleNext();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = originalOverflow;
    };
  }, [isOpen, onClose, handlePrev, handleNext]);

  if (!isOpen || !project) return null;

  const currentPhoto = photos[activeImageIndex] || null;
  const descriptionText = project.full_description?.trim() || project.short_description?.trim() || '';

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="project-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 md:p-8 bg-black/85 backdrop-blur-md animate-in fade-in duration-200 overflow-y-auto"
    >
      {/* Clickable Backdrop */}
      <div
        className="fixed inset-0 -z-10"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal Dialog Card */}
      <div
        className="relative w-full max-w-4xl bg-[#0D1017] border border-white/15 rounded-2xl shadow-2xl overflow-hidden text-slate-100 max-h-[92vh] flex flex-col my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Top Header Bar */}
        <div className="flex items-center justify-between px-5 sm:px-6 py-4 border-b border-white/10 bg-[#080B11]/90 backdrop-blur shrink-0">
          <div className="flex items-center gap-2.5 min-w-0 pr-3">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse shrink-0" />
            <span className="text-xs font-mono uppercase tracking-widest text-amber-400 font-bold shrink-0">
              PROJECT SPECIFICATION
            </span>
            {project.featured && (
              <span className="hidden sm:inline-block px-2 py-0.5 rounded text-[10px] font-mono uppercase tracking-wider bg-amber-500/15 text-amber-300 border border-amber-500/30">
                ★ FEATURED
              </span>
            )}
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close project modal"
            className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-slate-400 hover:text-white flex items-center justify-center transition-colors font-mono text-sm"
          >
            ✕
          </button>
        </div>

        {/* Scrollable Modal Content */}
        <div className="overflow-y-auto p-5 sm:p-7 space-y-6 flex-1">
          {/* Main Visual Showcase / Photo Carousel */}
          {photos.length > 0 ? (
            <div className="space-y-3">
              <div className="relative aspect-[16/9] w-full rounded-xl overflow-hidden bg-[#06080D] border border-white/10 group select-none">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={currentPhoto!}
                  alt={`${project.title} - Preview ${activeImageIndex + 1}`}
                  className="w-full h-full object-cover filter contrast-[1.02] transition-transform duration-300"
                />

                {/* Photo Carousel Controls (if multiple photos) */}
                {photos.length > 1 && (
                  <>
                    <button
                      type="button"
                      onClick={handlePrev}
                      aria-label="Previous photo"
                      className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/70 hover:bg-black/90 text-white border border-white/20 flex items-center justify-center transition-all opacity-80 group-hover:opacity-100 hover:scale-105"
                    >
                      ‹
                    </button>
                    <button
                      type="button"
                      onClick={handleNext}
                      aria-label="Next photo"
                      className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/70 hover:bg-black/90 text-white border border-white/20 flex items-center justify-center transition-all opacity-80 group-hover:opacity-100 hover:scale-105"
                    >
                      ›
                    </button>

                    <div className="absolute bottom-3 right-3 px-2.5 py-1 rounded-md bg-black/75 backdrop-blur border border-white/10 text-[11px] font-mono text-slate-300">
                      {activeImageIndex + 1} / {photos.length}
                    </div>
                  </>
                )}
              </div>

              {/* Horizontal Thumbnails Reel (if multiple photos) */}
              {photos.length > 1 && (
                <div className="flex items-center gap-2.5 overflow-x-auto pb-1.5 pt-1">
                  {photos.map((photoUrl, idx) => {
                    const isActive = idx === activeImageIndex;
                    return (
                      <button
                        key={photoUrl + idx}
                        type="button"
                        onClick={() => setActiveImageIndex(idx)}
                        className={`relative aspect-[16/9] w-20 sm:w-24 rounded-lg overflow-hidden border transition-all shrink-0 ${
                          isActive
                            ? 'border-amber-400 ring-2 ring-amber-400/30 scale-[1.02]'
                            : 'border-white/15 opacity-60 hover:opacity-100 hover:border-white/30'
                        }`}
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={photoUrl}
                          alt={`Thumbnail ${idx + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          ) : (
            <div className="aspect-[16/9] w-full rounded-xl bg-[#080B11] border border-dashed border-white/15 flex items-center justify-center font-mono text-xs text-slate-500 uppercase tracking-wider">
              No Preview Graphic Available
            </div>
          )}

          {/* Title & Overview */}
          <div className="space-y-3 pt-1">
            <h2 id="project-modal-title" className="text-2xl sm:text-3xl font-bold tracking-tight text-white leading-tight">
              {project.title}
            </h2>

            {project.short_description && (
              <p className="text-sm sm:text-base text-amber-200/90 leading-relaxed font-mono">
                {project.short_description}
              </p>
            )}
          </div>

          {/* Full Detailed Description */}
          {descriptionText && (
            <div className="space-y-2 pt-2 border-t border-white/10">
              <h3 className="text-xs font-mono uppercase tracking-widest text-slate-400 font-bold">
                Detailed Implementation & Architecture
              </h3>
              <div className="text-xs sm:text-sm text-slate-300 leading-relaxed space-y-3 whitespace-pre-line font-sans">
                {descriptionText}
              </div>
            </div>
          )}

          {/* Technologies Stack */}
          {project.technologies && project.technologies.length > 0 && (
            <div className="space-y-2 pt-2 border-t border-white/10">
              <h3 className="text-xs font-mono uppercase tracking-widest text-slate-400 font-bold">
                Technologies, Libraries & Infrastructure
              </h3>
              <div className="flex flex-wrap gap-2 pt-1">
                {project.technologies.map((tech) => (
                  <span
                    key={tech}
                    className="px-2.5 py-1 rounded-md bg-[#161D2B] border border-white/10 text-xs font-mono text-slate-200"
                  >
                    {tech}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Modal Action Bar Footer */}
        <div className="px-5 sm:px-6 py-4 border-t border-white/10 bg-[#080B11]/90 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          <div className="text-[11px] font-mono text-slate-400 hidden sm:block">
            <span>Slug: #{project.slug}</span>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
            {project.github_url && (
              <a
                href={project.github_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-mono font-bold rounded-lg bg-white/5 hover:bg-white/10 border border-white/15 text-slate-200 hover:text-white transition-all w-full sm:w-auto"
              >
                <span>Code Repository</span>
                <span>↗</span>
              </a>
            )}

            {project.live_url && (
              <a
                href={project.live_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-mono font-bold rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 transition-all w-full sm:w-auto shadow-lg shadow-amber-500/20"
              >
                <span>Live Deployment</span>
                <span>↗</span>
              </a>
            )}

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onClose}
              className="text-xs font-mono"
            >
              Close
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
