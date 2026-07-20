"use client";

import { useState } from "react";

export default function SettingsPage() {
  const [isSaving, setIsSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 2000);
    }, 800);
  };

  return (
    <div className="animate-in fade-in duration-500">
      <h2 className="text-2xl font-playfair font-bold mb-6">Account Settings</h2>
      
      <div className="space-y-10">
        
        {/* Notification Preferences */}
        <section className="space-y-6">
          <div className="border-b border-border/50 pb-2">
            <h3 className="text-lg font-medium">Notification Preferences</h3>
            <p className="text-sm text-muted-foreground mt-1">Manage how we communicate with you.</p>
          </div>
          
          <div className="space-y-4 max-w-2xl">
            {/* Toggle 1 */}
            <div className="flex items-center justify-between p-4 bg-background border border-border/50 rounded-xl">
              <div>
                <h4 className="font-medium text-sm text-foreground">Order Updates</h4>
                <p className="text-xs text-muted-foreground mt-1">Receive SMS and email notifications regarding your order status.</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" defaultChecked className="sr-only peer" />
                <div className="w-11 h-6 bg-secondary peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
              </label>
            </div>

            {/* Toggle 2 */}
            <div className="flex items-center justify-between p-4 bg-background border border-border/50 rounded-xl">
              <div>
                <h4 className="font-medium text-sm text-foreground">Exclusive Offers & Promotions</h4>
                <p className="text-xs text-muted-foreground mt-1">Get early access to sales and personalized discounts.</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" defaultChecked className="sr-only peer" />
                <div className="w-11 h-6 bg-secondary peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
              </label>
            </div>

            {/* Toggle 3 */}
            <div className="flex items-center justify-between p-4 bg-background border border-border/50 rounded-xl">
              <div>
                <h4 className="font-medium text-sm text-foreground">Newsletter</h4>
                <p className="text-xs text-muted-foreground mt-1">Weekly updates on new collections and jewelry care tips.</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" />
                <div className="w-11 h-6 bg-secondary peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
              </label>
            </div>
          </div>
        </section>

        {/* Privacy & Data */}
        <section className="space-y-6">
          <div className="border-b border-border/50 pb-2">
            <h3 className="text-lg font-medium">Privacy & Data</h3>
            <p className="text-sm text-muted-foreground mt-1">Control your personal data and sharing preferences.</p>
          </div>
          
          <div className="space-y-4 max-w-2xl">
            <div className="flex items-center justify-between p-4 bg-background border border-border/50 rounded-xl">
              <div>
                <h4 className="font-medium text-sm text-foreground">Analytics Data Sharing</h4>
                <p className="text-xs text-muted-foreground mt-1">Help us improve by sharing anonymous usage data.</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" defaultChecked className="sr-only peer" />
                <div className="w-11 h-6 bg-secondary peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
              </label>
            </div>
            
            <div>
              <button className="text-sm font-medium text-primary hover:underline hover:text-primary/80 transition-colors">
                Download my personal data
              </button>
            </div>
          </div>
        </section>

        {/* Danger Zone */}
        <section className="space-y-6 pt-4">
          <div className="border-b border-destructive/20 pb-2">
            <h3 className="text-lg font-medium text-destructive">Danger Zone</h3>
            <p className="text-sm text-muted-foreground mt-1">Irreversible account actions.</p>
          </div>
          
          <div className="p-4 border border-destructive/20 bg-destructive/5 rounded-xl max-w-2xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h4 className="font-medium text-sm text-foreground">Deactivate Account</h4>
                <p className="text-xs text-muted-foreground mt-1 max-w-md">Once you delete your account, there is no going back. Please be certain.</p>
              </div>
              <button className="shrink-0 bg-destructive/10 text-destructive border border-destructive/20 px-4 py-2 rounded-lg text-sm font-medium hover:bg-destructive hover:text-destructive-foreground transition-colors"
                onClick={() => alert("This action is disabled in the demo.")}
              >
                Deactivate Account
              </button>
            </div>
          </div>
        </section>
        
        <div className="pt-4 max-w-2xl flex justify-end">
          <button 
            onClick={handleSave}
            disabled={isSaving || isSaved}
            className="bg-primary text-primary-foreground px-8 py-3 rounded-full text-sm font-medium uppercase tracking-wider hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {isSaving ? "Saving..." : isSaved ? "Saved!" : "Save Preferences"}
          </button>
        </div>

      </div>
    </div>
  );
}
