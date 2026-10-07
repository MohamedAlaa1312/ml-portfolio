'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { ContactForm } from './ContactForm';
import { SocialList } from './SocialList';
import { SocialFormModal } from './SocialFormModal';
import { SocialDeleteModal } from './SocialDeleteModal';
import { ContactPreview } from './ContactPreview';
import type { ContactContent, Section, SiteSettings, SocialLinkItem } from '@/lib/supabase/types';

interface ContactSocialManagerProps {
  initialSettings: SiteSettings | null;
  initialSection: Section | null;
  initialSocialLinks: SocialLinkItem[];
}

export const ContactSocialManager: React.FC<ContactSocialManagerProps> = ({
  initialSettings,
  initialSection,
  initialSocialLinks,
}) => {
  const searchParams = useSearchParams();
  const router = useRouter();

  // Active tab state (defaults to 'contact', switches to 'social' if ?tab=social)
  const [activeTab, setActiveTab] = useState<'contact' | 'social'>('contact');

  useEffect(() => {
    const tabParam = searchParams.get('tab');
    if (tabParam === 'social') {
      setActiveTab('social');
    } else if (tabParam === 'contact') {
      setActiveTab('contact');
    }
  }, [searchParams]);

  const handleTabChange = (tab: 'contact' | 'social') => {
    setActiveTab(tab);
    const params = new URLSearchParams(searchParams.toString());
    params.set('tab', tab);
    router.replace(`/admin/contact?${params.toString()}`, { scroll: false });
  };

  // Live Data State
  const [settings, setSettings] = useState<SiteSettings | null>(initialSettings);
  const [section, setSection] = useState<Section | null>(initialSection);
  const [socialLinks, setSocialLinks] = useState<SocialLinkItem[]>(initialSocialLinks);

  // Social Modal States
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingSocial, setEditingSocial] = useState<SocialLinkItem | null>(null);

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deletingSocial, setDeletingSocial] = useState<SocialLinkItem | null>(null);

  // Toast Feedback State
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const showToast = (type: 'success' | 'error', message: string) => {
    setToast({ type, message });
    setTimeout(() => {
      setToast(null);
    }, 4000);
  };

  // Refresh live data from server
  const refreshData = async () => {
    try {
      const res = await fetch('/api/admin/contact');
      const data = await res.json();
      if (data.success) {
        if (data.siteSettings) setSettings(data.siteSettings);
        if (data.contactSection) setSection(data.contactSection);
        if (data.socialLinks) setSocialLinks(data.socialLinks);
      }
    } catch (err) {
      console.warn('Failed to refresh contact data:', err);
    }
  };

  // --------------------------------------------------------------------------
  // SOCIAL CRUD HANDLERS
  // --------------------------------------------------------------------------
  const handleOpenAdd = () => {
    setEditingSocial(null);
    setIsFormModalOpen(true);
  };

  const handleOpenEdit = (item: SocialLinkItem) => {
    setEditingSocial(item);
    setIsFormModalOpen(true);
  };

  const handleOpenDelete = (item: SocialLinkItem) => {
    setDeletingSocial(item);
    setIsDeleteModalOpen(true);
  };

  const handleSaveSocial = async (linkPayload: Partial<SocialLinkItem>) => {
    const res = await fetch('/api/admin/social', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(linkPayload),
    });

    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.error || 'Failed to save social link.');
    }

    showToast('success', data.message || 'Social link saved successfully.');
    await refreshData();
  };

  const handleToggleEnabled = async (id: string, newEnabled: boolean) => {
    try {
      const res = await fetch(`/api/admin/social/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enabled: newEnabled }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to toggle visibility.');
      }

      showToast('success', data.message || 'Social link visibility updated.');
      await refreshData();
    } catch (err: unknown) {
      showToast('error', err instanceof Error ? err.message : 'Error updating link.');
    }
  };

  const handleDeleteSocial = async () => {
    if (!deletingSocial) return;

    const res = await fetch(`/api/admin/social/${deletingSocial.id}`, {
      method: 'DELETE',
    });

    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.error || 'Failed to delete social link.');
    }

    showToast('success', 'Social link deleted successfully.');
    await refreshData();
  };

  const handleMoveOrder = async (id: string, direction: 'up' | 'down') => {
    const sorted = [...socialLinks].sort((a, b) => a.display_order - b.display_order);
    const currentIndex = sorted.findIndex((item) => item.id === id);
    if (currentIndex === -1) return;

    const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    if (targetIndex < 0 || targetIndex >= sorted.length) return;

    // Swap items
    const temp = sorted[currentIndex];
    sorted[currentIndex] = sorted[targetIndex];
    sorted[targetIndex] = temp;

    const orderedIds = sorted.map((s) => s.id);

    try {
      const res = await fetch('/api/admin/social/reorder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderedIds }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to reorder links.');
      }

      showToast('success', 'Social link order updated.');
      if (data.socialLinks) {
        setSocialLinks(data.socialLinks);
      } else {
        await refreshData();
      }
    } catch (err: unknown) {
      showToast('error', err instanceof Error ? err.message : 'Error reordering.');
    }
  };

  const totalSocials = socialLinks.length;
  const activeSocials = socialLinks.filter((s) => s.enabled).length;

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Toast Announcement */}
      {toast && (
        <div
          role="status"
          aria-live="polite"
          className={`fixed bottom-6 right-6 z-50 p-4 rounded-xl shadow-2xl text-xs font-mono flex items-center gap-3 animate-fade-in ${
            toast.type === 'success'
              ? 'bg-[#0D111A] border border-emerald-500/40 text-emerald-400'
              : 'bg-[#0D111A] border border-red-500/40 text-red-400'
          }`}
        >
          <span>{toast.type === 'success' ? '✔' : '⚠️'}</span>
          <span>{toast.message}</span>
        </div>
      )}

      {/* Page Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-white/5">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-100 tracking-tight">
            Contact & Social Management
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Configure public direct communication channels, section copy, and social media connectivity without code.
          </p>
        </div>

        <a
          href="/#contact"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-mono text-slate-300 hover:text-amber-400 transition-colors self-start sm:self-auto min-h-[40px]"
        >
          <span>Preview Public Section</span>
          <span>↗</span>
        </a>
      </div>

      {/* Module Navigation Tabs */}
      <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-[#0D111A] border border-white/10 w-fit">
        <button
          type="button"
          onClick={() => handleTabChange('contact')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-mono transition-all min-h-[40px] ${
            activeTab === 'contact'
              ? 'bg-amber-500/15 text-amber-400 font-bold border border-amber-500/30 shadow-md'
              : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
          }`}
        >
          <span>✉️</span>
          <span>Contact Information</span>
        </button>

        <button
          type="button"
          onClick={() => handleTabChange('social')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-mono transition-all min-h-[40px] ${
            activeTab === 'social'
              ? 'bg-amber-500/15 text-amber-400 font-bold border border-amber-500/30 shadow-md'
              : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
          }`}
        >
          <span>🌐</span>
          <span>Social Links</span>
          <span className="px-1.5 py-0.2 rounded-md bg-white/10 text-[10px] text-slate-300 font-mono">
            {activeSocials}/{totalSocials}
          </span>
        </button>
      </div>

      {/* Main Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-start">
        {/* Active Tab Panel */}
        <div className="lg:col-span-8 space-y-6">
          {activeTab === 'contact' ? (
            <ContactForm
              initialSettings={settings}
              initialSection={section}
              onSaveSuccess={refreshData}
            />
          ) : (
            <SocialList
              links={socialLinks}
              onAddClick={handleOpenAdd}
              onEditClick={handleOpenEdit}
              onDeleteClick={handleOpenDelete}
              onToggleEnabled={handleToggleEnabled}
              onMoveOrder={handleMoveOrder}
            />
          )}
        </div>

        {/* Live Public Preview Panel */}
        <div className="lg:col-span-4 sticky top-6">
          <ContactPreview
            settings={settings}
            section={section}
            socialLinks={socialLinks}
          />
        </div>
      </div>

      {/* Reusable Social Form Modal (Create / Edit) */}
      <SocialFormModal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        onSave={handleSaveSocial}
        initialData={editingSocial}
        nextDisplayOrder={socialLinks.length + 1}
      />

      {/* Destructive Social Delete Modal */}
      <SocialDeleteModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDeleteSocial}
        itemTitle={deletingSocial?.label || deletingSocial?.platform}
      />
    </div>
  );
};
