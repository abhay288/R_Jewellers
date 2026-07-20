"use client";

import { useState } from "react";

export default function ProfilePage() {
  const [isSaving, setIsSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  
  const [isUpdatingPwd, setIsUpdatingPwd] = useState(false);
  const [isPwdUpdated, setIsPwdUpdated] = useState(false);

  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 2000);
    }, 800);
  };

  const handleUpdatePwd = () => {
    setIsUpdatingPwd(true);
    setTimeout(() => {
      setIsUpdatingPwd(false);
      setIsPwdUpdated(true);
      setTimeout(() => setIsPwdUpdated(false), 2000);
    }, 800);
  };
  return (
    <div className="animate-in fade-in duration-500">
      <h2 className="text-2xl font-playfair font-bold mb-6">My Profile</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Personal Info */}
        <div className="space-y-6">
          <h3 className="text-lg font-medium border-b border-border/50 pb-2">Personal Information</h3>
          
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">First Name</label>
                <input type="text" placeholder="First Name" className="w-full bg-background border border-border/50 rounded-xl px-4 py-2 focus:outline-none focus:border-primary" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">Last Name</label>
                <input type="text" placeholder="Last Name" className="w-full bg-background border border-border/50 rounded-xl px-4 py-2 focus:outline-none focus:border-primary" />
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">Email Address</label>
              <input type="email" placeholder="email@example.com" disabled className="w-full bg-secondary/50 border border-transparent rounded-xl px-4 py-2 text-muted-foreground cursor-not-allowed" />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">Phone Number</label>
              <input type="tel" placeholder="+91 00000 00000" className="w-full bg-background border border-border/50 rounded-xl px-4 py-2 focus:outline-none focus:border-primary" />
            </div>

            <button 
              onClick={handleSave}
              disabled={isSaving || isSaved}
              className="bg-primary text-primary-foreground px-6 py-3 rounded-full text-sm font-medium uppercase tracking-wider hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {isSaving ? "Saving..." : isSaved ? "Saved!" : "Save Changes"}
            </button>
          </div>
        </div>

        {/* Change Password */}
        <div className="space-y-6">
          <h3 className="text-lg font-medium border-b border-border/50 pb-2">Change Password</h3>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">Current Password</label>
              <input type="password" placeholder="••••••••" className="w-full bg-background border border-border/50 rounded-xl px-4 py-2 focus:outline-none focus:border-primary" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">New Password</label>
              <input type="password" placeholder="••••••••" className="w-full bg-background border border-border/50 rounded-xl px-4 py-2 focus:outline-none focus:border-primary" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">Confirm New Password</label>
              <input type="password" placeholder="••••••••" className="w-full bg-background border border-border/50 rounded-xl px-4 py-2 focus:outline-none focus:border-primary" />
            </div>

            <button 
              onClick={handleUpdatePwd}
              disabled={isUpdatingPwd || isPwdUpdated}
              className="border border-primary text-primary px-6 py-3 rounded-full text-sm font-medium uppercase tracking-wider hover:bg-primary hover:text-primary-foreground transition-colors disabled:opacity-50"
            >
              {isUpdatingPwd ? "Updating..." : isPwdUpdated ? "Updated!" : "Update Password"}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
