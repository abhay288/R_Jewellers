"use client";

export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react';
import { 
  Mail, 
  MailOpen, 
  User, 
  Clock, 
  Inbox, 
  AlertCircle, 
  Calendar, 
  ChevronLeft, 
  ChevronRight,
  X,
  MessageSquare,
  Megaphone,
  Sparkles,
  Loader2,
  Send
} from 'lucide-react';
import { cn } from '@/shared/lib/utils';

interface ContactMessage {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  subject: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

export default function AdminMessagesPage() {
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(null);

  // Broadcast Modal State
  const [isBroadcastOpen, setIsBroadcastOpen] = useState(false);
  const [broadcasting, setBroadcasting] = useState(false);
  const [broadcastStatus, setBroadcastStatus] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [broadcastForm, setBroadcastForm] = useState({
    title: '',
    message: '',
    type: 'promo' as 'promo' | 'order' | 'system' | 'account',
    link: '/shop',
    targetGroup: 'all' as 'all' | 'customers',
  });

  const handleBroadcastSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!broadcastForm.title || !broadcastForm.message) {
      return alert('Please fill in both the Title and Message content.');
    }

    setBroadcasting(true);
    setBroadcastStatus(null);
    try {
      const res = await fetch('/api/admin/notifications/broadcast', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(broadcastForm),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setBroadcastStatus({ type: 'success', text: data.message });
        setBroadcastForm({ title: '', message: '', type: 'promo', link: '/shop', targetGroup: 'all' });
      } else {
        setBroadcastStatus({ type: 'error', text: data.error || 'Failed to send broadcast notification.' });
      }
    } catch (err) {
      setBroadcastStatus({ type: 'error', text: 'Network error broadcasting notification.' });
    } finally {
      setBroadcasting(false);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, [page]);

  const fetchMessages = async () => {
    setIsLoading(true);
    setError('');
    try {
      const res = await fetch(`/api/admin/messages?page=${page}&limit=10`);
      if (!res.ok) {
        throw new Error('Failed to load contact messages');
      }
      const data = await res.json();
      setMessages(data.items);
      setTotal(data.total);
      setTotalPages(data.totalPages);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenMessage = async (msg: ContactMessage) => {
    setSelectedMessage(msg);
    if (!msg.isRead) {
      try {
        const res = await fetch(`/api/admin/messages/${msg._id}`, {
          method: 'PUT'
        });
        if (res.ok) {
          // Update local state to reflect it's read
          setMessages(prev => 
            prev.map(m => m._id === msg._id ? { ...m, isRead: true } : m)
          );
        }
      } catch (err) {
        console.error('Failed to mark message as read:', err);
      }
    }
  };

  const handleCloseMessage = () => {
    setSelectedMessage(null);
  };

  const unreadCount = messages.filter(m => !m.isRead).length;

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold font-playfair tracking-tight">Customer Inquiries & Communications</h1>
          <p className="text-sm text-muted-foreground mt-1">Read customer messages and broadcast push notifications to your store shoppers.</p>
        </div>
        <button
          onClick={() => {
            setBroadcastStatus(null);
            setIsBroadcastOpen(true);
          }}
          className="inline-flex items-center justify-center bg-amber-500 text-neutral-950 font-bold hover:bg-amber-400 px-5 py-2.5 rounded-xl text-xs uppercase tracking-wider transition-all shadow-md shadow-amber-500/20 cursor-pointer shrink-0"
        >
          <Megaphone className="w-4 h-4 mr-2" />
          📢 Broadcast Notification
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-card border border-border/50 p-6 rounded-2xl shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-primary/10 text-primary rounded-xl flex items-center justify-center">
            <Inbox className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground uppercase font-semibold tracking-wider">Total Messages</p>
            <h3 className="text-2xl font-bold mt-1">{total}</h3>
          </div>
        </div>

        <div className="bg-card border border-border/50 p-6 rounded-2xl shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-amber-500/10 text-amber-600 rounded-xl flex items-center justify-center">
            <Mail className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground uppercase font-semibold tracking-wider">Unread Inquiries</p>
            <h3 className="text-2xl font-bold mt-1 text-amber-600">{unreadCount}</h3>
          </div>
        </div>
      </div>

      {/* Message Table Card */}
      <div className="bg-card border border-border/50 rounded-2xl shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center animate-pulse text-muted-foreground">Loading inquiries...</div>
        ) : error ? (
          <div className="p-12 text-center text-destructive flex flex-col items-center gap-2">
            <AlertCircle className="w-8 h-8" />
            <p>{error}</p>
          </div>
        ) : messages.length === 0 ? (
          <div className="p-16 text-center text-muted-foreground flex flex-col items-center gap-3">
            <MessageSquare className="w-12 h-12 text-neutral-300" />
            <p className="font-medium">No messages received yet.</p>
            <p className="text-xs max-w-sm">Submissions from the store contact page will appear here.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-secondary/30 text-xs font-semibold uppercase tracking-wider text-muted-foreground border-b border-border/50">
                  <th className="py-4 px-6 w-12">Status</th>
                  <th className="py-4 px-6">Sender</th>
                  <th className="py-4 px-6">Subject</th>
                  <th className="py-4 px-6">Date</th>
                  <th className="py-4 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50 text-sm">
                {messages.map((msg) => (
                  <tr 
                    key={msg._id} 
                    className={`hover:bg-secondary/10 transition-colors ${!msg.isRead ? 'font-semibold bg-primary/2' : ''}`}
                  >
                    <td className="py-4 px-6 text-center">
                      {!msg.isRead ? (
                        <span className="inline-flex w-2.5 h-2.5 bg-amber-500 rounded-full animate-pulse" title="Unread" />
                      ) : (
                        <span title="Read">
                          <MailOpen className="w-4 h-4 text-muted-foreground" />
                        </span>
                      )}
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex flex-col">
                        <span>{msg.firstName} {msg.lastName}</span>
                        <span className="text-xs text-muted-foreground font-normal">{msg.email}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="max-w-md truncate">{msg.subject}</div>
                    </td>
                    <td className="py-4 px-6 text-muted-foreground text-xs font-normal">
                      {new Date(msg.createdAt).toLocaleString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </td>
                    <td className="py-4 px-6 text-right">
                      <button
                        onClick={() => handleOpenMessage(msg)}
                        className="text-xs px-3.5 py-1.5 bg-secondary hover:bg-primary hover:text-primary-foreground rounded-full transition-colors font-medium"
                      >
                        View Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Footer */}
        {totalPages > 1 && (
          <div className="p-4 bg-secondary/10 border-t border-border/50 flex justify-between items-center text-xs">
            <span className="text-muted-foreground">Showing Page {page} of {totalPages}</span>
            <div className="flex items-center gap-1">
              <button
                disabled={page === 1}
                onClick={() => setPage(prev => Math.max(1, prev - 1))}
                className="p-1.5 rounded-lg border border-border bg-background hover:bg-secondary disabled:opacity-50 transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                disabled={page === totalPages}
                onClick={() => setPage(prev => Math.min(totalPages, prev + 1))}
                className="p-1.5 rounded-lg border border-border bg-background hover:bg-secondary disabled:opacity-50 transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Luxury Message Detail Modal */}
      {selectedMessage && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh] animate-in fade-in zoom-in duration-200">
            {/* Modal Header */}
            <div className="p-6 border-b border-border/50 flex justify-between items-start bg-secondary/10">
              <div>
                <span className="text-xs uppercase bg-primary/10 text-primary px-3 py-1 rounded-full font-bold tracking-wider">
                  {selectedMessage.subject}
                </span>
                <h2 className="text-xl font-bold font-playfair mt-2.5">Message Details</h2>
              </div>
              <button 
                onClick={handleCloseMessage} 
                className="p-1.5 bg-background border border-border rounded-full hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-6 overflow-y-auto flex-1">
              {/* Sender Details Box */}
              <div className="bg-secondary/20 border border-border/30 p-4 rounded-2xl grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary/10 text-primary rounded-xl flex items-center justify-center shrink-0">
                    <User className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">From</p>
                    <p className="text-sm font-semibold">{selectedMessage.firstName} {selectedMessage.lastName}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary/10 text-primary rounded-xl flex items-center justify-center shrink-0">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Email Address</p>
                    <p className="text-sm font-semibold font-mono break-all">{selectedMessage.email}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 md:col-span-2">
                  <div className="w-10 h-10 bg-primary/10 text-primary rounded-xl flex items-center justify-center shrink-0">
                    <Calendar className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Date Sent</p>
                    <p className="text-sm font-semibold">
                      {new Date(selectedMessage.createdAt).toLocaleString('en-IN', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                </div>
              </div>

              {/* Message Content */}
              <div className="space-y-2">
                <h4 className="text-xs uppercase text-muted-foreground font-semibold tracking-wider">Message Content</h4>
                <div className="bg-background border border-border/50 p-5 rounded-2xl text-sm leading-relaxed text-neutral-800 whitespace-pre-wrap min-h-36">
                  {selectedMessage.message}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-border/50 bg-secondary/10 flex justify-end gap-3">
              <a 
                href={`mailto:${selectedMessage.email}?subject=RE: ${selectedMessage.subject}`}
                className="px-6 py-2 bg-primary text-primary-foreground rounded-full text-xs font-semibold tracking-wide uppercase hover:bg-primary/90 transition-colors flex items-center gap-2"
              >
                <Mail className="w-3.5 h-3.5" /> Reply via Email
              </a>
              <button
                onClick={handleCloseMessage}
                className="px-5 py-2 bg-background border border-border text-foreground hover:bg-secondary rounded-full text-xs font-semibold tracking-wide uppercase transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Broadcast Notification Modal */}
      {isBroadcastOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card border border-border/60 rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl space-y-6 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-border/50 pb-4">
              <div className="flex items-center space-x-2.5">
                <Megaphone className="w-5 h-5 text-amber-500" />
                <h2 className="text-xl font-playfair font-bold text-foreground">
                  Broadcast Push Notification
                </h2>
              </div>
              <button 
                onClick={() => setIsBroadcastOpen(false)}
                className="p-1.5 rounded-full hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {broadcastStatus && (
              <div className={cn(
                "p-4 rounded-2xl text-xs font-semibold flex items-center space-x-2.5 border",
                broadcastStatus.type === 'success' 
                  ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-500" 
                  : "bg-destructive/10 border-destructive/30 text-destructive"
              )}>
                {broadcastStatus.type === 'success' ? <Sparkles className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
                <span>{broadcastStatus.text}</span>
              </div>
            )}

            <form onSubmit={handleBroadcastSubmit} className="space-y-4 text-xs">
              <div className="space-y-1.5">
                <label className="font-bold text-muted-foreground uppercase tracking-wider text-[10px]">Target Audience</label>
                <select
                  value={broadcastForm.targetGroup}
                  onChange={(e) => setBroadcastForm({ ...broadcastForm, targetGroup: e.target.value as any })}
                  className="w-full bg-background border border-border/50 rounded-xl px-4 py-2.5 text-xs text-foreground focus:outline-none focus:border-amber-500"
                >
                  <option value="all">🌐 All Registered Users & Devices</option>
                  <option value="customers">🛍️ Customers Only (Role: User)</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-muted-foreground uppercase tracking-wider text-[10px]">Notification Type</label>
                <select
                  value={broadcastForm.type}
                  onChange={(e) => setBroadcastForm({ ...broadcastForm, type: e.target.value as any })}
                  className="w-full bg-background border border-border/50 rounded-xl px-4 py-2.5 text-xs text-foreground focus:outline-none focus:border-amber-500"
                >
                  <option value="promo">🎉 Promotional / Offer Announcement</option>
                  <option value="system">🔔 System / Store Announcement</option>
                  <option value="order">📦 Order Update</option>
                  <option value="account">👤 Account Alert</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-muted-foreground uppercase tracking-wider text-[10px]">Notification Title *</label>
                <input
                  required
                  type="text"
                  placeholder="e.g. ✨ Festive Gold & Kundan Sale Live!"
                  value={broadcastForm.title}
                  onChange={(e) => setBroadcastForm({ ...broadcastForm, title: e.target.value })}
                  className="w-full bg-background border border-border/50 rounded-xl px-4 py-2.5 text-xs text-foreground focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-muted-foreground uppercase tracking-wider text-[10px]">Notification Message / Body *</label>
                <textarea
                  required
                  rows={3}
                  placeholder="e.g. Enjoy up to 30% OFF on handcrafted bridal sets & bangles for a limited time!"
                  value={broadcastForm.message}
                  onChange={(e) => setBroadcastForm({ ...broadcastForm, message: e.target.value })}
                  className="w-full bg-background border border-border/50 rounded-xl px-4 py-2.5 text-xs text-foreground focus:outline-none focus:border-amber-500 resize-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-muted-foreground uppercase tracking-wider text-[10px]">Action Link URL</label>
                <input
                  type="text"
                  placeholder="e.g. /shop or /categories/kundan"
                  value={broadcastForm.link}
                  onChange={(e) => setBroadcastForm({ ...broadcastForm, link: e.target.value })}
                  className="w-full bg-background border border-border/50 rounded-xl px-4 py-2.5 text-xs font-mono text-foreground focus:outline-none focus:border-amber-500"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-3 pt-6 border-t border-border/50">
                <button
                  type="button"
                  onClick={() => setIsBroadcastOpen(false)}
                  className="flex-1 py-3 rounded-xl border border-border/60 font-bold text-xs hover:bg-secondary transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={broadcasting}
                  className="flex-1 bg-amber-500 text-neutral-950 py-3 rounded-xl font-bold text-xs uppercase tracking-wider hover:bg-amber-400 transition-colors shadow-md disabled:opacity-50 flex items-center justify-center space-x-2 cursor-pointer"
                >
                  {broadcasting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Sending Broadcast...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>Send Push Broadcast</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
