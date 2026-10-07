'use client';

import React, { useState, useMemo } from 'react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { CertificationList } from './CertificationList';
import { CertificationForm } from './CertificationForm';
import type { Certification } from '@/lib/supabase/types';

interface CertificationsManagerProps {
  initialCertifications: Certification[];
}

export const CertificationsManager: React.FC<CertificationsManagerProps> = ({
  initialCertifications,
}) => {
  const [certifications, setCertifications] = useState<Certification[]>(initialCertifications);

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  // Modals
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingCert, setEditingCert] = useState<Certification | null>(null);
  const [deletingCert, setDeletingCert] = useState<Certification | null>(null);

  // Operation states
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isReordering, setIsReordering] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const showFeedback = (type: 'success' | 'error', message: string) => {
    setFeedback({ type, message });
    setTimeout(() => {
      setFeedback((current) => (current?.message === message ? null : current));
    }, 5000);
  };

  // Filtered certifications
  const filteredCertifications = useMemo(() => {
    return certifications.filter((c) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        q === '' ||
        c.title.toLowerCase().includes(q) ||
        c.issuer.toLowerCase().includes(q) ||
        (c.credential_id && c.credential_id.toLowerCase().includes(q)) ||
        (c.description && c.description.toLowerCase().includes(q));

      const matchesStatus =
        statusFilter === 'ALL' || c.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [certifications, searchQuery, statusFilter]);

  // Statistics
  const totalCount = certifications.length;
  const publishedCount = certifications.filter(
    (c) => c.status === 'published' && c.enabled !== false
  ).length;
  const draftCount = certifications.filter(
    (c) => c.status === 'draft' || c.enabled === false
  ).length;

  // ---------------------------------------------------------------------------
  // CRUD OPERATIONS
  // ---------------------------------------------------------------------------

  const handleSave = async (payload: Partial<Certification>) => {
    setIsSaving(true);
    setFeedback(null);

    try {
      const isEdit = Boolean(editingCert?.id);
      const url = isEdit
        ? `/api/admin/certifications/${editingCert!.id}`
        : '/api/admin/certifications';
      const method = isEdit ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to save certification.');
      }

      if (isEdit) {
        setCertifications((prev) =>
          prev.map((c) => (c.id === data.certification.id ? data.certification : c))
        );
        showFeedback(
          'success',
          `Certification "${data.certification.title}" updated successfully.`
        );
      } else {
        setCertifications((prev) => [...prev, data.certification]);
        showFeedback(
          'success',
          `Certification "${data.certification.title}" created successfully.`
        );
      }

      setIsFormOpen(false);
      setEditingCert(null);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Save failed';
      showFeedback('error', msg);
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggleEnabled = async (cert: Certification) => {
    try {
      const currentlyEnabled = cert.enabled ?? (cert.status === 'published');
      const nextEnabled = !currentlyEnabled;
      const nextStatus = nextEnabled ? 'published' : 'draft';

      setCertifications((prev) =>
        prev.map((c) =>
          c.id === cert.id ? { ...c, enabled: nextEnabled, status: nextStatus } : c
        )
      );

      const res = await fetch(`/api/admin/certifications/${cert.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enabled: nextEnabled, status: nextStatus }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to update visibility.');
      }

      showFeedback(
        'success',
        `Certification "${cert.title}" is now ${nextEnabled ? 'enabled' : 'disabled'}.`
      );
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Toggle failed';
      showFeedback('error', msg);
      setCertifications((prev) =>
        prev.map((c) => (c.id === cert.id ? cert : c))
      );
    }
  };

  const handleDelete = async () => {
    if (!deletingCert) return;
    setIsDeleting(true);
    setFeedback(null);

    try {
      const res = await fetch(`/api/admin/certifications/${deletingCert.id}`, {
        method: 'DELETE',
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to delete certification.');
      }

      setCertifications((prev) => prev.filter((c) => c.id !== deletingCert.id));
      showFeedback('success', `Certification "${deletingCert.title}" deleted.`);
      setDeletingCert(null);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Delete failed';
      showFeedback('error', msg);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleReorder = async (orderedIds: string[]) => {
    setIsReordering(true);
    try {
      setCertifications((prev) => {
        const copy = [...prev];
        orderedIds.forEach((id, index) => {
          const item = copy.find((c) => c.id === id);
          if (item) {
            item.display_order = index + 1;
          }
        });
        return copy.sort((a, b) => (a.display_order || 0) - (b.display_order || 0));
      });

      const res = await fetch('/api/admin/certifications/reorder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderedIds }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to save new order.');
      }

      showFeedback('success', 'Certification order updated.');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Reordering failed';
      showFeedback('error', msg);
    } finally {
      setIsReordering(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast Feedback */}
      {feedback && (
        <div
          role="status"
          className={`p-4 rounded-xl border font-mono text-xs flex items-center justify-between transition-all animate-fadeIn ${
            feedback.type === 'success'
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
              : 'bg-red-500/10 border-red-500/30 text-red-300'
          }`}
        >
          <span>{feedback.message}</span>
          <button
            type="button"
            onClick={() => setFeedback(null)}
            className="text-slate-400 hover:text-white ml-4 text-sm leading-none"
          >
            ✕
          </button>
        </div>
      )}

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-100 font-sans tracking-tight">
            Certifications
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl leading-relaxed">
            Manage the industry credentials, verified specializations, and professional certificates displayed in your public portfolio.
          </p>

          {/* Quick Stats Badges */}
          <div className="flex items-center gap-2 mt-3 flex-wrap">
            <Badge variant="accent" dot className="text-xs">
              {totalCount} Total Certifications
            </Badge>
            <Badge variant="success" dot className="text-xs">
              {publishedCount} Published
            </Badge>
            <Badge variant="default" dot className="text-xs">
              {draftCount} Draft / Hidden
            </Badge>
          </div>
        </div>

        {/* Primary CTA */}
        <Button
          variant="primary"
          onClick={() => {
            setEditingCert(null);
            setIsFormOpen(true);
          }}
          className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold self-start sm:self-center shrink-0 cursor-pointer shadow-lg shadow-amber-500/10"
        >
          + Add Certification
        </Button>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        <div className="flex-1">
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search certifications by title, issuer, credential ID, or description..."
            className="w-full text-xs font-sans"
          />
        </div>

        <div className="w-full sm:w-44">
          <Select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            options={[
              { value: 'ALL', label: 'All Statuses' },
              { value: 'published', label: 'Published' },
              { value: 'draft', label: 'Draft' },
              { value: 'archived', label: 'Archived' },
            ]}
          />
        </div>
      </div>

      {/* Certification List */}
      <CertificationList
        certifications={filteredCertifications}
        onEdit={(cert) => {
          setEditingCert(cert);
          setIsFormOpen(true);
        }}
        onDelete={(cert) => setDeletingCert(cert)}
        onToggleEnabled={handleToggleEnabled}
        onReorder={handleReorder}
        isReordering={isReordering}
      />

      {/* Modal: Create / Edit Certification */}
      <Modal
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setEditingCert(null);
        }}
        className="max-w-2xl max-h-[90vh] overflow-y-auto"
      >
        <CertificationForm
          initialData={editingCert}
          onSubmit={handleSave}
          onCancel={() => {
            setIsFormOpen(false);
            setEditingCert(null);
          }}
          isLoading={isSaving}
        />
      </Modal>

      {/* Modal: Delete Confirmation */}
      <Modal
        isOpen={Boolean(deletingCert)}
        onClose={() => setDeletingCert(null)}
        className="max-w-md"
      >
        <div className="space-y-4">
          <h3 className="text-lg font-bold text-slate-100">Delete Certification</h3>
          <p className="text-sm text-slate-300">
            Are you sure you want to delete <span className="font-semibold text-white">&quot;{deletingCert?.title}&quot;</span>?
          </p>
          <p className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 p-3 rounded-lg leading-relaxed">
            Warning: This action is permanent and will immediately remove this credential from both the CMS and public portfolio.
          </p>
          <div className="flex justify-end gap-3 pt-2">
            <Button
              variant="outline"
              onClick={() => setDeletingCert(null)}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              variant="outline"
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-red-500/20 border-red-500/40 text-red-300 hover:bg-red-500/30"
            >
              {isDeleting ? 'Deleting...' : 'Delete Certification'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
