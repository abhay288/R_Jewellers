"use client";

export const dynamic = "force-dynamic";

import { useState, useEffect } from 'react';

export default function AdminSettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Group settings by their functional category
  const [general, setGeneral] = useState({
    storeName: 'Radhika Jewellers',
    supportEmail: 'support@radhikajewellers.com',
    storeDescription: 'Premium artificial jewellery for every occasion.',
  });

  const [payment, setPayment] = useState({
    defaultCurrency: 'INR (₹)',
    taxRate: '8.5',
    freeShippingThreshold: '2000',
    shippingCharges: '100',
    razorpayKeyId: '',
    razorpayKeySecret: '',
  });

  const [smtp, setSmtp] = useState({
    smtpHost: '',
    smtpPort: '587',
    smtpUser: '',
    smtpPass: '',
    smtpFrom: 'no-reply@radhikajewellers.com',
  });

  const [firebaseSettings, setFirebaseSettings] = useState({
    firebaseApiKey: '',
    firebaseAuthDomain: '',
    firebaseProjectId: '',
    firebaseMessagingSenderId: '',
    firebaseAppId: '',
  });

  const [seo, setSeo] = useState({
    googleAnalyticsId: '',
    metaTitle: 'Radhika Jewellers - Premium Luxury Jewellery',
    metaDescription: 'Discover elegant handcrafted bridal, festival, and everyday jewellery.',
  });

  const [aiSettings, setAiSettings] = useState({
    geminiApiKey: '',
    enableAiRecommendations: 'true',
    enableVisualSearch: 'true',
  });

  useEffect(() => {
    async function fetchSettings() {
      try {
        const res = await fetch('/api/admin/settings');
        if (res.ok) {
          const data = await res.json();
          
          // Map database keys to their state objects
          if (data.storeName) setGeneral(prev => ({ ...prev, storeName: data.storeName, supportEmail: data.supportEmail || prev.supportEmail, storeDescription: data.storeDescription || prev.storeDescription }));
          if (data.defaultCurrency || data.razorpayKeyId) setPayment(prev => ({ ...prev, defaultCurrency: data.defaultCurrency || prev.defaultCurrency, taxRate: data.taxRate || prev.taxRate, freeShippingThreshold: data.freeShippingThreshold || prev.freeShippingThreshold, shippingCharges: data.shippingCharges || prev.shippingCharges, razorpayKeyId: data.razorpayKeyId || '', razorpayKeySecret: data.razorpayKeySecret || '' }));
          if (data.smtpHost) setSmtp(prev => ({ ...prev, smtpHost: data.smtpHost, smtpPort: data.smtpPort || prev.smtpPort, smtpUser: data.smtpUser || prev.smtpUser, smtpPass: data.smtpPass || prev.smtpPass, smtpFrom: data.smtpFrom || prev.smtpFrom }));
          if (data.firebaseApiKey) setFirebaseSettings(prev => ({ ...prev, firebaseApiKey: data.firebaseApiKey, firebaseAuthDomain: data.firebaseAuthDomain || prev.firebaseAuthDomain, firebaseProjectId: data.firebaseProjectId || prev.firebaseProjectId, firebaseMessagingSenderId: data.firebaseMessagingSenderId || prev.firebaseMessagingSenderId, firebaseAppId: data.firebaseAppId || prev.firebaseAppId }));
          if (data.googleAnalyticsId) setSeo(prev => ({ ...prev, googleAnalyticsId: data.googleAnalyticsId, metaTitle: data.metaTitle || prev.metaTitle, metaDescription: data.metaDescription || prev.metaDescription }));
          if (data.geminiApiKey) setAiSettings(prev => ({ ...prev, geminiApiKey: data.geminiApiKey, enableAiRecommendations: data.enableAiRecommendations || prev.enableAiRecommendations, enableVisualSearch: data.enableVisualSearch || prev.enableVisualSearch }));
        }
      } catch (err) {
        console.error('Failed to load settings:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchSettings();
  }, []);

  const handleSave = async (group: 'general' | 'payment' | 'shipping' | 'seo' | 'ai', data: Record<string, any>) => {
    setSaving(true);
    setMessage(null);
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ settings: data, group }),
      });
      if (res.ok) {
        setMessage({ type: 'success', text: `Settings saved successfully.` });
      } else {
        const errData = await res.json();
        setMessage({ type: 'error', text: errData.error || 'Failed to save settings.' });
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'A network error occurred while saving.' });
    } finally {
      setSaving(false);
      setTimeout(() => setMessage(null), 5000);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-100">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500 max-w-4xl pb-16">
      <div>
        <h1 className="text-3xl font-playfair font-bold text-foreground">Settings</h1>
        <p className="text-muted-foreground mt-1">Manage your store preferences, integration, and security configurations.</p>
      </div>

      {message && (
        <div className={`p-4 rounded-xl text-sm ${message.type === 'success' ? 'bg-green-500/15 text-green-600 dark:text-green-400 border border-green-500/30' : 'bg-destructive/15 text-destructive border border-destructive/30'}`}>
          {message.text}
        </div>
      )}

      {/* General Settings */}
      <div className="bg-card border border-border/50 rounded-2xl p-6 md:p-8 shadow-sm">
        <h2 className="text-xl font-bold font-playfair mb-6 border-b border-border/50 pb-2 text-primary">General Settings</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground">Store Name</label>
            <input 
              type="text" 
              value={general.storeName}
              onChange={(e) => setGeneral({ ...general, storeName: e.target.value })}
              className="w-full bg-background border border-border/50 rounded-xl px-4 py-2 focus:outline-none focus:border-primary text-sm" 
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground">Support Email</label>
            <input 
              type="email" 
              value={general.supportEmail}
              onChange={(e) => setGeneral({ ...general, supportEmail: e.target.value })}
              className="w-full bg-background border border-border/50 rounded-xl px-4 py-2 focus:outline-none focus:border-primary text-sm" 
            />
          </div>
          <div className="space-y-2 md:col-span-2">
            <label className="text-sm font-medium text-muted-foreground">Store Description</label>
            <textarea 
              rows={3} 
              value={general.storeDescription}
              onChange={(e) => setGeneral({ ...general, storeDescription: e.target.value })}
              className="w-full bg-background border border-border/50 rounded-xl px-4 py-2 focus:outline-none focus:border-primary resize-none text-sm" 
            />
          </div>
        </div>
        <div className="pt-4 flex justify-end">
          <button 
            onClick={() => handleSave('general', general)}
            disabled={saving}
            className="bg-primary text-primary-foreground px-6 py-2.5 rounded-xl text-xs font-semibold uppercase tracking-wider hover:opacity-90 transition-opacity shadow-md disabled:opacity-50"
          >
            Save General
          </button>
        </div>
      </div>

      {/* Payment & Shipping */}
      <div className="bg-card border border-border/50 rounded-2xl p-6 md:p-8 shadow-sm">
        <h2 className="text-xl font-bold font-playfair mb-6 border-b border-border/50 pb-2 text-primary">Payment & Shipping</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground">Default Currency</label>
            <select 
              value={payment.defaultCurrency}
              onChange={(e) => setPayment({ ...payment, defaultCurrency: e.target.value })}
              className="w-full bg-background border border-border/50 rounded-xl px-4 py-2.5 focus:outline-none focus:border-primary text-sm"
            >
              <option value="INR (₹)">INR (₹)</option>
              <option value="USD ($)">USD ($)</option>
              <option value="EUR (€)">EUR (€)</option>
              <option value="GBP (£)">GBP (£)</option>
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground">Tax Rate (%)</label>
            <input 
              type="number" 
              step="0.01"
              value={payment.taxRate}
              onChange={(e) => setPayment({ ...payment, taxRate: e.target.value })}
              className="w-full bg-background border border-border/50 rounded-xl px-4 py-2 focus:outline-none focus:border-primary text-sm" 
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground">Shipping Fee (₹)</label>
            <input 
              type="number" 
              value={payment.shippingCharges}
              onChange={(e) => setPayment({ ...payment, shippingCharges: e.target.value })}
              className="w-full bg-background border border-border/50 rounded-xl px-4 py-2 focus:outline-none focus:border-primary text-sm" 
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground">Free Shipping Threshold (₹)</label>
            <input 
              type="number" 
              value={payment.freeShippingThreshold}
              onChange={(e) => setPayment({ ...payment, freeShippingThreshold: e.target.value })}
              className="w-full bg-background border border-border/50 rounded-xl px-4 py-2 focus:outline-none focus:border-primary text-sm" 
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground">Razorpay Key ID (Live / Test)</label>
            <input 
              type="text" 
              placeholder="rzp_live_... or rzp_test_..."
              value={payment.razorpayKeyId}
              onChange={(e) => setPayment({ ...payment, razorpayKeyId: e.target.value })}
              className="w-full bg-background border border-border/50 rounded-xl px-4 py-2 focus:outline-none focus:border-primary text-sm font-mono" 
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground">Razorpay Key Secret</label>
            <input 
              type="password" 
              placeholder="••••••••••••••••"
              value={payment.razorpayKeySecret}
              onChange={(e) => setPayment({ ...payment, razorpayKeySecret: e.target.value })}
              className="w-full bg-background border border-border/50 rounded-xl px-4 py-2 focus:outline-none focus:border-primary text-sm font-mono" 
            />
          </div>
        </div>
        <div className="pt-4 flex justify-end">
          <button 
            onClick={() => handleSave('payment', payment)}
            disabled={saving}
            className="bg-primary text-primary-foreground px-6 py-2.5 rounded-xl text-xs font-semibold uppercase tracking-wider hover:opacity-90 transition-opacity shadow-md disabled:opacity-50"
          >
            Save Payment & Shipping
          </button>
        </div>
      </div>

      {/* SMTP Email Settings */}
      <div className="bg-card border border-border/50 rounded-2xl p-6 md:p-8 shadow-sm">
        <h2 className="text-xl font-bold font-playfair mb-6 border-b border-border/50 pb-2 text-primary">SMTP Credentials</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground">SMTP Host</label>
            <input 
              type="text" 
              placeholder="smtp.resend.com"
              value={smtp.smtpHost}
              onChange={(e) => setSmtp({ ...smtp, smtpHost: e.target.value })}
              className="w-full bg-background border border-border/50 rounded-xl px-4 py-2 focus:outline-none focus:border-primary text-sm" 
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground">SMTP Port</label>
            <input 
              type="text" 
              placeholder="587"
              value={smtp.smtpPort}
              onChange={(e) => setSmtp({ ...smtp, smtpPort: e.target.value })}
              className="w-full bg-background border border-border/50 rounded-xl px-4 py-2 focus:outline-none focus:border-primary text-sm" 
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground">SMTP Username</label>
            <input 
              type="text" 
              placeholder="resend"
              value={smtp.smtpUser}
              onChange={(e) => setSmtp({ ...smtp, smtpUser: e.target.value })}
              className="w-full bg-background border border-border/50 rounded-xl px-4 py-2 focus:outline-none focus:border-primary text-sm" 
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground">SMTP Password</label>
            <input 
              type="password" 
              placeholder="••••••••••••"
              value={smtp.smtpPass}
              onChange={(e) => setSmtp({ ...smtp, smtpPass: e.target.value })}
              className="w-full bg-background border border-border/50 rounded-xl px-4 py-2 focus:outline-none focus:border-primary text-sm" 
            />
          </div>
          <div className="space-y-2 md:col-span-2">
            <label className="text-sm font-medium text-muted-foreground">SMTP From Email</label>
            <input 
              type="email" 
              placeholder="onboarding@resend.dev"
              value={smtp.smtpFrom}
              onChange={(e) => setSmtp({ ...smtp, smtpFrom: e.target.value })}
              className="w-full bg-background border border-border/50 rounded-xl px-4 py-2 focus:outline-none focus:border-primary text-sm" 
            />
          </div>
        </div>
        <div className="pt-4 flex justify-end">
          <button 
            onClick={() => handleSave('payment', smtp)}
            disabled={saving}
            className="bg-primary text-primary-foreground px-6 py-2.5 rounded-xl text-xs font-semibold uppercase tracking-wider hover:opacity-90 transition-opacity shadow-md disabled:opacity-50"
          >
            Save SMTP Credentials
          </button>
        </div>
      </div>

      {/* Firebase Cloud Messaging & Integration */}
      <div className="bg-card border border-border/50 rounded-2xl p-6 md:p-8 shadow-sm">
        <h2 className="text-xl font-bold font-playfair mb-6 border-b border-border/50 pb-2 text-primary">Firebase Integration (Push Notifications)</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground">Firebase API Key</label>
            <input 
              type="text" 
              placeholder="AIzaSy..."
              value={firebaseSettings.firebaseApiKey}
              onChange={(e) => setFirebaseSettings({ ...firebaseSettings, firebaseApiKey: e.target.value })}
              className="w-full bg-background border border-border/50 rounded-xl px-4 py-2 focus:outline-none focus:border-primary text-sm" 
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground">Firebase Auth Domain</label>
            <input 
              type="text" 
              placeholder="project-id.firebaseapp.com"
              value={firebaseSettings.firebaseAuthDomain}
              onChange={(e) => setFirebaseSettings({ ...firebaseSettings, firebaseAuthDomain: e.target.value })}
              className="w-full bg-background border border-border/50 rounded-xl px-4 py-2 focus:outline-none focus:border-primary text-sm" 
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground">Firebase Project ID</label>
            <input 
              type="text" 
              placeholder="project-id"
              value={firebaseSettings.firebaseProjectId}
              onChange={(e) => setFirebaseSettings({ ...firebaseSettings, firebaseProjectId: e.target.value })}
              className="w-full bg-background border border-border/50 rounded-xl px-4 py-2 focus:outline-none focus:border-primary text-sm" 
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground">Firebase Messaging Sender ID</label>
            <input 
              type="text" 
              placeholder="1234567890"
              value={firebaseSettings.firebaseMessagingSenderId}
              onChange={(e) => setFirebaseSettings({ ...firebaseSettings, firebaseMessagingSenderId: e.target.value })}
              className="w-full bg-background border border-border/50 rounded-xl px-4 py-2 focus:outline-none focus:border-primary text-sm" 
            />
          </div>
          <div className="space-y-2 md:col-span-2">
            <label className="text-sm font-medium text-muted-foreground">Firebase App ID</label>
            <input 
              type="text" 
              placeholder="1:1234:web:abcd"
              value={firebaseSettings.firebaseAppId}
              onChange={(e) => setFirebaseSettings({ ...firebaseSettings, firebaseAppId: e.target.value })}
              className="w-full bg-background border border-border/50 rounded-xl px-4 py-2 focus:outline-none focus:border-primary text-sm" 
            />
          </div>
        </div>
        <div className="pt-4 flex justify-end">
          <button 
            onClick={() => handleSave('general', firebaseSettings)}
            disabled={saving}
            className="bg-primary text-primary-foreground px-6 py-2.5 rounded-xl text-xs font-semibold uppercase tracking-wider hover:opacity-90 transition-opacity shadow-md disabled:opacity-50"
          >
            Save Firebase Keys
          </button>
        </div>
      </div>

      {/* SEO & Analytics */}
      <div className="bg-card border border-border/50 rounded-2xl p-6 md:p-8 shadow-sm">
        <h2 className="text-xl font-bold font-playfair mb-6 border-b border-border/50 pb-2 text-primary">SEO & Analytics</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground">Google Analytics ID</label>
            <input 
              type="text" 
              placeholder="G-XXXXXX"
              value={seo.googleAnalyticsId}
              onChange={(e) => setSeo({ ...seo, googleAnalyticsId: e.target.value })}
              className="w-full bg-background border border-border/50 rounded-xl px-4 py-2 focus:outline-none focus:border-primary text-sm" 
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground">Default SEO Meta Title</label>
            <input 
              type="text" 
              value={seo.metaTitle}
              onChange={(e) => setSeo({ ...seo, metaTitle: e.target.value })}
              className="w-full bg-background border border-border/50 rounded-xl px-4 py-2 focus:outline-none focus:border-primary text-sm" 
            />
          </div>
          <div className="space-y-2 md:col-span-2">
            <label className="text-sm font-medium text-muted-foreground">Default SEO Meta Description</label>
            <textarea 
              rows={3} 
              value={seo.metaDescription}
              onChange={(e) => setSeo({ ...seo, metaDescription: e.target.value })}
              className="w-full bg-background border border-border/50 rounded-xl px-4 py-2 focus:outline-none focus:border-primary resize-none text-sm" 
            />
          </div>
        </div>
        <div className="pt-4 flex justify-end">
          <button 
            onClick={() => handleSave('seo', seo)}
            disabled={saving}
            className="bg-primary text-primary-foreground px-6 py-2.5 rounded-xl text-xs font-semibold uppercase tracking-wider hover:opacity-90 transition-opacity shadow-md disabled:opacity-50"
          >
            Save SEO Settings
          </button>
        </div>
      </div>

      {/* AI Settings */}
      <div className="bg-card border border-border/50 rounded-2xl p-6 md:p-8 shadow-sm">
        <h2 className="text-xl font-bold font-playfair mb-6 border-b border-border/50 pb-2 text-primary">Gemini AI Settings</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2 md:col-span-2">
            <label className="text-sm font-medium text-muted-foreground">Google Gemini API Key</label>
            <input 
              type="password" 
              placeholder="AIzaSy..."
              value={aiSettings.geminiApiKey}
              onChange={(e) => setAiSettings({ ...aiSettings, geminiApiKey: e.target.value })}
              className="w-full bg-background border border-border/50 rounded-xl px-4 py-2 focus:outline-none focus:border-primary text-sm" 
            />
            <p className="text-xs text-muted-foreground mt-1">Used to generate vector embeddings and execute multimodal visual image searches.</p>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground">AI Product Recommendations</label>
            <select 
              value={aiSettings.enableAiRecommendations}
              onChange={(e) => setAiSettings({ ...aiSettings, enableAiRecommendations: e.target.value })}
              className="w-full bg-background border border-border/50 rounded-xl px-4 py-2.5 focus:outline-none focus:border-primary text-sm"
            >
              <option value="true">Enabled (Embeddings + Cosine Similarity)</option>
              <option value="false">Disabled (Fallback to Standard Categories)</option>
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground">Visual Image Search</label>
            <select 
              value={aiSettings.enableVisualSearch}
              onChange={(e) => setAiSettings({ ...aiSettings, enableVisualSearch: e.target.value })}
              className="w-full bg-background border border-border/50 rounded-xl px-4 py-2.5 focus:outline-none focus:border-primary text-sm"
            >
              <option value="true">Enabled (Gemini-1.5-Flash Multimodal Analysis)</option>
              <option value="false">Disabled</option>
            </select>
          </div>
        </div>
        <div className="pt-4 flex justify-end">
          <button 
            onClick={() => handleSave('ai', aiSettings)}
            disabled={saving}
            className="bg-primary text-primary-foreground px-6 py-2.5 rounded-xl text-xs font-semibold uppercase tracking-wider hover:opacity-90 transition-opacity shadow-md disabled:opacity-50"
          >
            Save AI Settings
          </button>
        </div>
      </div>
    </div>
  );
}
