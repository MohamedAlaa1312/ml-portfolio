'use client';

import React, { useState } from 'react';
import type { ContactMessage } from '@/lib/supabase/types';

interface MessagesInboxProps {
  initialMessages: ContactMessage[];
}

export const MessagesInbox: React.FC<MessagesInboxProps> = ({ initialMessages }) => {
  const [messages, setMessages] = useState<ContactMessage[]>(initialMessages);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');
  const [loading, setLoading] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const unreadCount = messages.filter((m) => !m.read).length;
  const filteredMessages = filter === 'unread' ? messages.filter((m) => !m.read) : messages;

  const refreshMessages = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/messages');
      const data = await res.json();
      if (data.success && Array.isArray(data.messages)) {
        setMessages(data.messages);
      }
    } catch (err) {
      console.warn('Failed to refresh messages:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleRead = async (id: string, currentRead: boolean) => {
    setActionLoadingId(id);
    const newRead = !currentRead;

    // Optimistic update
    setMessages((prev) =>
      prev.map((m) => (m.id === id ? { ...m, read: newRead } : m))
    );

    try {
      const res = await fetch(`/api/admin/messages/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ read: newRead }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to update message status');
      }
    } catch (err) {
      console.error(err);
      // Revert on failure
      setMessages((prev) =>
        prev.map((m) => (m.id === id ? { ...m, read: currentRead } : m))
      );
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleDelete = async (id: string) => {
    setActionLoadingId(id);

    try {
      const res = await fetch(`/api/admin/messages/${id}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to delete message');
      }
      setMessages((prev) => prev.filter((m) => m.id !== id));
      setDeletingId(null);
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoadingId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="bg-[#0D111A] border border-white/10 rounded-2xl p-6 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h3 className="text-lg font-bold text-slate-100">Visitor Inquiries & Messages</h3>
            {unreadCount > 0 && (
              <span className="px-2.5 py-0.5 rounded-full text-xs font-mono bg-amber-500/20 text-amber-400 border border-amber-500/40 font-semibold animate-pulse">
                {unreadCount} unread
              </span>
            )}
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Real incoming inquiries delivered securely through your portfolio&apos;s contact forms.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Filter Pills */}
          <div className="flex items-center p-1 rounded-xl bg-white/5 border border-white/10 text-xs font-mono">
            <button
              type="button"
              onClick={() => setFilter('all')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                filter === 'all'
                  ? 'bg-amber-500/20 text-amber-400 font-semibold border border-amber-500/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              All ({messages.length})
            </button>
            <button
              type="button"
              onClick={() => setFilter('unread')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                filter === 'unread'
                  ? 'bg-amber-500/20 text-amber-400 font-semibold border border-amber-500/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Unread ({unreadCount})
            </button>
          </div>

          <button
            type="button"
            onClick={refreshMessages}
            disabled={loading}
            className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-amber-400 text-xs font-mono transition-colors disabled:opacity-50"
            title="Refresh messages"
          >
            {loading ? '...' : '↻'}
          </button>
        </div>
      </div>

      {/* Message List */}
      {filteredMessages.length === 0 ? (
        <div className="bg-[#0D111A] border border-white/10 rounded-2xl p-12 text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 text-2xl mx-auto flex items-center justify-center">
            📥
          </div>
          <h4 className="text-base font-bold text-slate-200">
            {filter === 'unread' ? 'No Unread Messages' : 'No Inquiries Received Yet'}
          </h4>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            {filter === 'unread'
              ? 'All received inquiries have been marked as read.'
              : 'Messages sent via the public contact interface will appear here in real-time with instant email reply options.'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredMessages.map((msg) => {
            const isUnread = !msg.read;
            const dateFormatted = new Date(msg.created_at).toLocaleString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            });

            return (
              <div
                key={msg.id}
                className={`bg-[#0D111A] border rounded-2xl p-6 transition-all duration-200 ${
                  isUnread
                    ? 'border-amber-500/40 shadow-lg shadow-amber-500/5 bg-gradient-to-r from-amber-500/[0.04] to-transparent'
                    : 'border-white/10 hover:border-white/20'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 pb-4 border-b border-white/5">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-base font-bold text-slate-100">{msg.name}</span>
                      {isUnread ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-amber-500/20 text-amber-400 border border-amber-500/40 font-semibold uppercase tracking-wider">
                          New
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-white/5 text-slate-400 border border-white/10 uppercase tracking-wider">
                          Read
                        </span>
                      )}
                    </div>
                    <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400">
                      <a
                        href={`mailto:${msg.email}`}
                        className="text-amber-400 hover:text-amber-300 font-mono underline"
                      >
                        {msg.email}
                      </a>
                      {msg.subject && (
                        <>
                          <span className="text-white/20">•</span>
                          <span className="text-slate-300 font-medium">Subject: {msg.subject}</span>
                        </>
                      )}
                    </div>
                  </div>

                  <span className="text-xs font-mono text-slate-400 shrink-0">
                    {dateFormatted}
                  </span>
                </div>

                {/* Message Body */}
                <div className="my-4 p-4 rounded-xl bg-white/[0.03] border border-white/5">
                  <p className="text-sm text-slate-200 whitespace-pre-wrap leading-relaxed font-sans">
                    {msg.message}
                  </p>
                </div>

                {/* Action Bar */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      disabled={actionLoadingId === msg.id}
                      onClick={() => handleToggleRead(msg.id, Boolean(msg.read))}
                      className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-mono text-slate-300 hover:text-white transition-colors"
                    >
                      {msg.read ? 'Mark as Unread' : '✓ Mark as Read'}
                    </button>
                    <a
                      href={`mailto:${msg.email}?subject=${encodeURIComponent(`Re: Inquiry from ${msg.name}`)}&body=${encodeURIComponent(`Hi ${msg.name},\n\nThank you for reaching out via my portfolio.\n\nRegarding your message:\n> ${msg.message}\n\nBest regards,\nMohamed Alaa`)}`}
                      className="px-3 py-1.5 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 text-xs font-mono text-amber-400 hover:text-amber-300 transition-colors inline-flex items-center gap-1.5 font-semibold"
                    >
                      <span>✉️</span>
                      <span>Reply via Email</span>
                    </a>
                  </div>

                  <div>
                    {deletingId === msg.id ? (
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono text-red-400">Confirm deletion?</span>
                        <button
                          type="button"
                          onClick={() => handleDelete(msg.id)}
                          className="px-2.5 py-1 rounded-lg bg-red-500/20 hover:bg-red-500/30 border border-red-500/40 text-red-400 text-xs font-mono transition-colors"
                        >
                          Yes, Delete
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeletingId(null)}
                          className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 text-xs font-mono transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setDeletingId(msg.id)}
                        className="px-3 py-1.5 rounded-xl text-slate-400 hover:text-red-400 hover:bg-red-500/10 text-xs font-mono transition-colors"
                      >
                        🗑️ Delete
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
