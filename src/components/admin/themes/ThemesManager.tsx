'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';

export interface AdminThemeItem {
  id: string;
  name: string;
  description: string;
  version: string;
  previewMetadata?: {
    thumbnailUrl?: string;
    tags?: string[];
    accentColorPreview?: string;
    author?: string;
    aestheticCategory?: string;
  };
  layout?: {
    containerMaxWidth: string;
    navPosition: string;
    sectionPadding: string;
    gridGap: string;
  };
  isValid: boolean;
  validationErrors?: string[];
  isAvailable: boolean;
  isActive: boolean;
  isDraft: boolean;
  state: 'active' | 'draft' | 'available' | 'unavailable';
}

interface ThemesManagerProps {
  initialActiveTheme: {
    id: string;
    name: string;
    description: string;
    version: string;
  };
  initialDraftTheme: {
    id: string;
    themeId: string;
    title: string;
    updatedAt: string;
  } | null;
  initialAvailableThemes: AdminThemeItem[];
}

export const ThemesManager: React.FC<ThemesManagerProps> = ({
  initialActiveTheme,
  initialDraftTheme,
  initialAvailableThemes,
}) => {
  const [activeTheme, setActiveTheme] = useState(initialActiveTheme);
  const [draftTheme, setDraftTheme] = useState(initialDraftTheme);
  const [availableThemes, setAvailableThemes] = useState(initialAvailableThemes);

  const [selectedThemeId, setSelectedThemeId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<{
    type: 'success' | 'error' | 'info';
    message: string;
  } | null>(null);

  // Modals state
  const [publishModalOpen, setPublishModalOpen] = useState(false);
  const [discardModalOpen, setDiscardModalOpen] = useState(false);
  const [targetPublishThemeId, setTargetPublishThemeId] = useState<string | null>(null);

  // Find theme helpers
  const getThemeById = (id: string) => availableThemes.find((t) => t.id === id);
  const activeThemeMeta = getThemeById(activeTheme.id);
  const draftThemeMeta = draftTheme ? getThemeById(draftTheme.themeId) : null;
  const targetPublishThemeMeta = targetPublishThemeId ? getThemeById(targetPublishThemeId) : null;

  // Has unsaved selection: user clicked a theme card but hasn't saved as draft yet
  const hasUnsavedSelection =
    selectedThemeId !== null &&
    selectedThemeId !== activeTheme.id &&
    (!draftTheme || selectedThemeId !== draftTheme.themeId);

  // --------------------------------------------------------------------------
  // ACTIONS
  // --------------------------------------------------------------------------

  // 1. Save Draft Theme
  const handleSaveDraft = async (themeId: string) => {
    setLoading(true);
    setFeedback(null);

    try {
      const res = await fetch('/api/admin/themes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'save_draft', themeId }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to save theme as draft.');
      }

      setDraftTheme({
        id: data.draftTheme.id,
        themeId: data.draftTheme.themeId,
        title: data.draftTheme.title,
        updatedAt: data.draftTheme.updatedAt,
      });

      // Update local state list
      setAvailableThemes((prev) =>
        prev.map((t) => ({
          ...t,
          isDraft: t.id === themeId,
          state: t.id === activeTheme.id ? 'active' : t.id === themeId ? 'draft' : t.state,
        }))
      );

      setSelectedThemeId(null);
      setFeedback({
        type: 'success',
        message: data.message || `Theme "${data.draftTheme.themeId}" saved as draft.`,
      });
    } catch (err: unknown) {
      setFeedback({
        type: 'error',
        message: err instanceof Error ? err.message : 'Failed to save theme draft.',
      });
    } finally {
      setLoading(false);
    }
  };

  // 2. Open Publish Confirmation Modal
  const handleOpenPublishModal = (themeId: string) => {
    setTargetPublishThemeId(themeId);
    setPublishModalOpen(true);
  };

  // 3. Confirm Publish Action
  const handleConfirmPublish = async () => {
    if (!targetPublishThemeId) return;
    setLoading(true);
    setFeedback(null);

    try {
      const res = await fetch('/api/admin/themes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'publish', themeId: targetPublishThemeId }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to publish theme.');
      }

      const publishedMeta = getThemeById(targetPublishThemeId);
      if (publishedMeta) {
        setActiveTheme({
          id: publishedMeta.id,
          name: publishedMeta.name,
          description: publishedMeta.description,
          version: publishedMeta.version,
        });
      }

      // Clear draft theme locally
      setDraftTheme(null);
      setSelectedThemeId(null);

      // Re-map available themes state
      setAvailableThemes((prev) =>
        prev.map((t) => {
          const isNowActive = t.id === targetPublishThemeId;
          return {
            ...t,
            isActive: isNowActive,
            isDraft: false,
            state: isNowActive ? 'active' : t.isValid ? 'available' : 'unavailable',
          };
        })
      );

      setPublishModalOpen(false);
      setTargetPublishThemeId(null);
      setFeedback({
        type: 'success',
        message: data.message || 'Theme published successfully to the live portfolio.',
      });
    } catch (err: unknown) {
      setFeedback({
        type: 'error',
        message: err instanceof Error ? err.message : 'Failed to publish theme.',
      });
    } finally {
      setLoading(false);
    }
  };

  // 4. Open Discard Modal
  const handleOpenDiscardModal = () => {
    setDiscardModalOpen(true);
  };

  // 5. Confirm Discard Action
  const handleConfirmDiscard = async () => {
    setLoading(true);
    setFeedback(null);

    try {
      const res = await fetch('/api/admin/themes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'discard' }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to discard draft.');
      }

      setDraftTheme(null);
      setSelectedThemeId(null);

      // Reset state for previous draft theme
      setAvailableThemes((prev) =>
        prev.map((t) => ({
          ...t,
          isDraft: false,
          state: t.id === activeTheme.id ? 'active' : t.isValid ? 'available' : 'unavailable',
        }))
      );

      setDiscardModalOpen(false);
      setFeedback({
        type: 'info',
        message: data.message || 'Theme draft discarded.',
      });
    } catch (err: unknown) {
      setFeedback({
        type: 'error',
        message: err instanceof Error ? err.message : 'Failed to discard draft.',
      });
    } finally {
      setLoading(false);
    }
  };

  // 6. Preview in new window
  const handlePreview = (themeId: string) => {
    window.open(`/admin/preview?theme=${encodeURIComponent(themeId)}`, '_blank');
  };

  return (
    <div className="space-y-8">
      {/* --------------------------------------------------------------------- */}
      {/* FEEDBACK TOAST / ALERT BANNER */}
      {/* --------------------------------------------------------------------- */}
      {feedback && (
        <div
          role="status"
          aria-live="polite"
          className={`p-4 rounded-xl text-xs font-mono flex items-center justify-between gap-4 animate-in fade-in duration-200 ${
            feedback.type === 'success'
              ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-300'
              : feedback.type === 'error'
              ? 'bg-rose-500/10 border border-rose-500/30 text-rose-300'
              : 'bg-blue-500/10 border border-blue-500/30 text-blue-300'
          }`}
        >
          <div className="flex items-center gap-2">
            <span>
              {feedback.type === 'success' ? '✓' : feedback.type === 'error' ? '✖' : 'ℹ'}
            </span>
            <span>{feedback.message}</span>
          </div>
          <button
            type="button"
            onClick={() => setFeedback(null)}
            className="text-white/60 hover:text-white cursor-pointer px-1 text-sm font-bold"
            aria-label="Dismiss feedback"
          >
            ✕
          </button>
        </div>
      )}

      {/* --------------------------------------------------------------------- */}
      {/* THEME STATUS SUMMARY COCKPIT */}
      {/* --------------------------------------------------------------------- */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
        {/* Active Public Theme Summary Card */}
        <div className="p-5 rounded-2xl bg-[#0D111A] border border-white/10 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-slate-400 uppercase tracking-wider text-[11px]">
              Current Public Theme
            </span>
            <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px] font-bold tracking-widest uppercase">
              ACTIVE IN PRODUCTION
            </span>
          </div>
          <div className="space-y-1">
            <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2 font-sans">
              <span>{activeTheme.name}</span>
              <span className="text-xs font-mono text-slate-400 font-normal">
                v{activeTheme.version}
              </span>
            </h3>
            <p className="text-slate-400 text-xs leading-relaxed font-sans line-clamp-2">
              {activeTheme.description}
            </p>
          </div>
          <div className="pt-2 flex items-center gap-3 text-[11px] text-slate-400">
            <span>ID: <code className="text-amber-400">{activeTheme.id}</code></span>
            <span>•</span>
            <button
              type="button"
              onClick={() => handlePreview(activeTheme.id)}
              className="text-amber-400 hover:text-amber-300 underline underline-offset-2 cursor-pointer flex items-center gap-1"
            >
              <span>Preview Live State</span>
              <span>↗</span>
            </button>
          </div>
        </div>

        {/* Draft Theme / Staged State Summary Card */}
        <div
          className={`p-5 rounded-2xl border space-y-3 transition-colors ${
            draftTheme
              ? 'bg-amber-500/10 border-amber-500/40'
              : 'bg-[#0D111A] border-white/10'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-slate-400 uppercase tracking-wider text-[11px]">
              Staged Draft Theme
            </span>
            {draftTheme ? (
              <span className="px-2 py-0.5 rounded-full bg-amber-500/30 text-amber-200 border border-amber-500/60 text-[10px] font-bold tracking-widest uppercase animate-pulse">
                UNPUBLISHED DRAFT
              </span>
            ) : (
              <span className="px-2 py-0.5 rounded-full bg-white/5 text-slate-400 text-[10px]">
                NO DRAFT STAGED
              </span>
            )}
          </div>

          {draftTheme ? (
            <>
              <div className="space-y-1">
                <h3 className="text-lg font-bold text-amber-300 flex items-center gap-2 font-sans">
                  <span>{draftThemeMeta?.name || draftTheme.title}</span>
                  {draftThemeMeta && (
                    <span className="text-xs font-mono text-amber-400/80 font-normal">
                      v{draftThemeMeta.version}
                    </span>
                  )}
                </h3>
                <p className="text-slate-300 text-xs leading-relaxed font-sans line-clamp-2">
                  Staged for review in Admin Preview. Public visitors continue seeing{' '}
                  <strong className="text-white">{activeTheme.name}</strong> until published.
                </p>
              </div>

              <div className="pt-2 flex flex-wrap items-center gap-2">
                <Button
                  type="button"
                  variant="primary"
                  size="sm"
                  onClick={() => handleOpenPublishModal(draftTheme.themeId)}
                  disabled={loading}
                  className="bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs"
                >
                  Publish Theme
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handlePreview(draftTheme.themeId)}
                  className="text-xs border-amber-500/30 text-amber-300 hover:text-white"
                >
                  Preview Draft ↗
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handleOpenDiscardModal}
                  disabled={loading}
                  className="text-xs text-rose-400 hover:text-rose-300 hover:bg-rose-500/10"
                >
                  Discard Draft
                </Button>
              </div>
            </>
          ) : (
            <div className="space-y-2 pt-1 text-slate-400 text-xs font-sans">
              <p>
                No theme draft is currently staged. Select any registered theme below to test in
                Preview before making it active for public visitors.
              </p>
              <p className="text-[11px] font-mono text-slate-500">
                Workflow: Select Theme → Save Draft → Preview → Publish
              </p>
            </div>
          )}
        </div>
      </div>

      {/* --------------------------------------------------------------------- */}
      {/* UNSAVED SELECTION PROMPT BANNER */}
      {/* --------------------------------------------------------------------- */}
      {hasUnsavedSelection && selectedThemeId && (
        <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs font-mono animate-in fade-in duration-150">
          <div className="flex items-center gap-3">
            <span className="text-xl">💡</span>
            <div>
              <span className="font-bold text-blue-300 block">
                Unsaved Theme Selection: {getThemeById(selectedThemeId)?.name || selectedThemeId}
              </span>
              <span className="text-slate-400 text-[11px]">
                Click &ldquo;Save as Draft&rdquo; to stage this theme for preview without affecting public visitors.
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Button
              type="button"
              variant="primary"
              size="sm"
              onClick={() => handleSaveDraft(selectedThemeId)}
              disabled={loading}
              className="bg-blue-500 hover:bg-blue-400 text-black font-bold text-xs"
            >
              {loading ? 'Saving...' : 'Save as Draft'}
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setSelectedThemeId(null)}
              className="text-xs border-white/20 text-slate-300"
            >
              Cancel
            </Button>
          </div>
        </div>
      )}

      {/* --------------------------------------------------------------------- */}
      {/* THEMES CATALOG GRID */}
      {/* --------------------------------------------------------------------- */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-100 font-mono flex items-center gap-2">
            <span>Available Themes in Registry</span>
            <span className="text-xs px-2 py-0.5 rounded bg-white/5 text-slate-400 font-normal">
              {availableThemes.length} Registered
            </span>
          </h2>
          <span className="text-xs font-mono text-slate-400 hidden sm:inline">
            Source of Truth: ThemeRegistry
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {availableThemes.map((theme) => {
            const isActive = theme.id === activeTheme.id;
            const isDraft = draftTheme?.themeId === theme.id;
            const isSelected = selectedThemeId === theme.id;
            const accentColor = theme.previewMetadata?.accentColorPreview || '#F59E0B';

            let cardBorder = 'border-white/10 hover:border-white/25';
            let badgeComponent = (
              <span className="px-2 py-0.5 rounded bg-white/5 text-slate-400 text-[10px] font-mono uppercase tracking-wider">
                AVAILABLE
              </span>
            );

            if (!theme.isValid) {
              cardBorder = 'border-rose-500/40 bg-rose-950/10';
              badgeComponent = (
                <span className="px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/40 text-[10px] font-mono uppercase tracking-wider font-bold">
                  UNAVAILABLE
                </span>
              );
            } else if (isActive) {
              cardBorder = 'border-emerald-500/60 bg-emerald-950/10 shadow-lg shadow-emerald-950/20';
              badgeComponent = (
                <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/50 text-[10px] font-mono uppercase tracking-wider font-bold">
                  ACTIVE
                </span>
              );
            } else if (isDraft) {
              cardBorder = 'border-amber-500/60 bg-amber-950/10 shadow-lg shadow-amber-950/20';
              badgeComponent = (
                <span className="px-2 py-0.5 rounded bg-amber-500/30 text-amber-200 border border-amber-500/60 text-[10px] font-mono uppercase tracking-wider font-bold">
                  STAGED DRAFT
                </span>
              );
            } else if (isSelected) {
              cardBorder = 'border-blue-500/60 bg-blue-950/10';
              badgeComponent = (
                <span className="px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-500/40 text-[10px] font-mono uppercase tracking-wider font-bold">
                  SELECTED
                </span>
              );
            }

            return (
              <div
                key={theme.id}
                className={`rounded-2xl bg-[#0D111A] border p-6 flex flex-col justify-between transition-all duration-200 group ${cardBorder}`}
              >
                {/* Header Strip & Theme Identification */}
                <div className="space-y-4">
                  <div className="flex items-start justify-between gap-3">
                    {/* Visual Color Swatch & Category */}
                    <div className="flex items-center gap-3">
                      <div
                        className="w-8 h-8 rounded-xl border border-white/20 flex items-center justify-center font-mono text-xs font-bold text-white shadow-sm"
                        style={{ backgroundColor: `${accentColor}25` }}
                      >
                        <span style={{ color: accentColor }}>
                          {theme.name.slice(0, 2).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block">
                          {theme.previewMetadata?.aestheticCategory || 'Technical'}
                        </span>
                        <span className="text-xs font-mono text-slate-300">
                          v{theme.version}
                        </span>
                      </div>
                    </div>

                    {badgeComponent}
                  </div>

                  {/* Title & Description */}
                  <div className="space-y-1.5">
                    <h3 className="text-lg font-bold text-slate-100 group-hover:text-white transition-colors">
                      {theme.name}
                    </h3>
                    <p className="text-xs text-slate-400 leading-relaxed min-h-[3rem] line-clamp-3">
                      {theme.description}
                    </p>
                  </div>

                  {/* Metadata Chips / Technical Tokens */}
                  <div className="pt-2 border-t border-white/5 space-y-2 text-[11px] font-mono">
                    <div className="flex items-center justify-between text-slate-400">
                      <span>ID</span>
                      <code className="text-slate-200">{theme.id}</code>
                    </div>

                    {theme.previewMetadata?.tags && theme.previewMetadata.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {theme.previewMetadata.tags.slice(0, 3).map((tag) => (
                          <span
                            key={tag}
                            className="px-1.5 py-0.5 rounded bg-white/5 text-slate-400 text-[10px]"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Validation Contract Badge */}
                    <div className="pt-2 flex items-center justify-between text-[10px]">
                      <span className="text-slate-500">Contract:</span>
                      {theme.isValid ? (
                        <span className="text-emerald-400 font-semibold flex items-center gap-1">
                          <span>✓</span>
                          <span>9 Renderers Valid</span>
                        </span>
                      ) : (
                        <span className="text-rose-400 font-semibold flex items-center gap-1">
                          <span>⚠</span>
                          <span>Contract Incomplete</span>
                        </span>
                      )}
                    </div>

                    {/* If validation errors exist, display them clearly */}
                    {!theme.isValid && theme.validationErrors && (
                      <div className="p-2 rounded bg-rose-500/10 border border-rose-500/20 text-rose-300 text-[10px] space-y-1">
                        {theme.validationErrors.map((err, i) => (
                          <div key={i}>• {err}</div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* ----------------------------------------------------------- */}
                {/* CARD ACTIONS */}
                {/* ----------------------------------------------------------- */}
                <div className="pt-6 mt-4 border-t border-white/10 flex items-center justify-between gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => handlePreview(theme.id)}
                    className="text-xs text-slate-300 hover:text-white border-white/15"
                    aria-label={`Preview ${theme.name}`}
                  >
                    Preview ↗
                  </Button>

                  {/* Contextual Action based on State */}
                  {isActive ? (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      disabled
                      className="text-xs opacity-60 border-emerald-500/40 text-emerald-300 cursor-not-allowed"
                    >
                      Active Theme
                    </Button>
                  ) : isDraft ? (
                    <div className="flex items-center gap-1.5">
                      <Button
                        type="button"
                        variant="primary"
                        size="sm"
                        onClick={() => handleOpenPublishModal(theme.id)}
                        disabled={loading}
                        className="text-xs bg-amber-500 hover:bg-amber-400 text-black font-bold"
                        aria-label={`Publish ${theme.name}`}
                      >
                        Publish
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={handleOpenDiscardModal}
                        disabled={loading}
                        className="text-xs text-rose-400 hover:bg-rose-500/10 px-2"
                        aria-label="Discard this draft theme"
                      >
                        ✕
                      </Button>
                    </div>
                  ) : !theme.isValid ? (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      disabled
                      className="text-xs opacity-50 border-rose-500/30 text-rose-400 cursor-not-allowed"
                    >
                      Unavailable
                    </Button>
                  ) : (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => handleSaveDraft(theme.id)}
                      disabled={loading}
                      className="text-xs bg-white/5 hover:bg-white/10 text-white border-white/20 font-semibold"
                      aria-label={`Select ${theme.name} as Draft`}
                    >
                      Select Theme
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* --------------------------------------------------------------------- */}
      {/* PUBLISH CONFIRMATION MODAL */}
      {/* --------------------------------------------------------------------- */}
      <Modal
        isOpen={publishModalOpen}
        onClose={() => setPublishModalOpen(false)}
        title="Publish Theme?"
        description="Activate new visual theme for the public portfolio."
      >
        <div className="space-y-4 text-xs font-mono text-slate-300">
          <p className="leading-relaxed font-sans text-sm text-slate-200">
            Are you sure you want to activate{' '}
            <strong className="text-white">
              {targetPublishThemeMeta?.name || targetPublishThemeId}
            </strong>{' '}
            as the live public theme?
          </p>

          <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-200 space-y-1">
            <span className="font-bold block text-[11px] uppercase tracking-wider">
              Presentation Only
            </span>
            <p className="text-[11px] leading-relaxed">
              This action modifies only the public presentation layer. All CMS data (Profile,
              Projects, Experience, Skills, Certifications, Contact, and Section order) will remain
              100% intact.
            </p>
          </div>

          <div className="pt-4 flex items-center justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setPublishModalOpen(false)}
              disabled={loading}
              className="text-xs border-white/20 text-slate-300"
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="primary"
              size="sm"
              onClick={handleConfirmPublish}
              disabled={loading}
              className="text-xs bg-amber-500 hover:bg-amber-400 text-black font-bold"
            >
              {loading ? 'Activating...' : 'Confirm & Publish'}
            </Button>
          </div>
        </div>
      </Modal>

      {/* --------------------------------------------------------------------- */}
      {/* DISCARD CONFIRMATION MODAL */}
      {/* --------------------------------------------------------------------- */}
      <Modal
        isOpen={discardModalOpen}
        onClose={() => setDiscardModalOpen(false)}
        title="Discard Draft Theme?"
        description="Remove unpublished theme selection."
      >
        <div className="space-y-4 text-xs font-mono text-slate-300">
          <p className="leading-relaxed font-sans text-sm text-slate-200">
            Are you sure you want to discard the unpublished theme selection for{' '}
            <strong className="text-white">
              {draftThemeMeta?.name || draftTheme?.title}
            </strong>?
          </p>

          <p className="text-[11px] text-slate-400 leading-relaxed">
            The public portfolio will remain on the currently published theme (
            <strong className="text-slate-200">{activeTheme.name}</strong>).
          </p>

          <div className="pt-4 flex items-center justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setDiscardModalOpen(false)}
              disabled={loading}
              className="text-xs border-white/20 text-slate-300"
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              size="sm"
              onClick={handleConfirmDiscard}
              disabled={loading}
              className="text-xs bg-rose-600 hover:bg-rose-500 text-white font-bold"
            >
              {loading ? 'Discarding...' : 'Discard Draft'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
