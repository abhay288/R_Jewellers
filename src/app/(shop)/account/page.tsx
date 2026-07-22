"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Loader2, CheckCircle2, AlertCircle } from "lucide-react";

export default function ProfilePage() {
  const { update: updateSession } = useSession();

  const [loading, setLoading] = useState(true);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [profileSuccess, setProfileSuccess] = useState<string | null>(null);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");

  const [isSaving, setIsSaving] = useState(false);

  // Change password states
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [isUpdatingPwd, setIsUpdatingPwd] = useState(false);
  const [pwdError, setPwdError] = useState<string | null>(null);
  const [pwdSuccess, setPwdSuccess] = useState<string | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const res = await fetch("/api/user/profile");
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to load profile");

        if (data.user) {
          setFirstName(data.user.firstName || "");
          setLastName(data.user.lastName || "");
          setEmail(data.user.email || "");
          setPhone(data.user.phone || "");
        }
      } catch (err: any) {
        setProfileError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileError(null);
    setProfileSuccess(null);

    if (!firstName.trim()) {
      setProfileError("First name is required.");
      return;
    }

    setIsSaving(true);
    try {
      const res = await fetch("/api/user/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ firstName, lastName, phone }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update profile.");

      setProfileSuccess("Profile updated successfully!");
      if (data.user) {
        await updateSession({ name: data.user.name, phone: data.user.phone || "" });
      }
      setTimeout(() => setProfileSuccess(null), 4000);
    } catch (err: any) {
      setProfileError(err.message || "An unexpected error occurred.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleUpdatePwd = async (e: React.FormEvent) => {
    e.preventDefault();
    setPwdError(null);
    setPwdSuccess(null);

    if (!currentPassword || !newPassword || !confirmPassword) {
      setPwdError("All password fields are required.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setPwdError("New password and confirm password do not match.");
      return;
    }

    setIsUpdatingPwd(true);
    try {
      const res = await fetch("/api/user/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword, confirmPassword }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update password.");

      setPwdSuccess("Password updated successfully!");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setTimeout(() => setPwdSuccess(null), 4000);
    } catch (err: any) {
      setPwdError(err.message || "Failed to update password.");
    } finally {
      setIsUpdatingPwd(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="animate-in fade-in duration-500">
      <h2 className="text-2xl font-playfair font-bold mb-6">My Profile</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Personal Info Form */}
        <div className="space-y-6">
          <h3 className="text-lg font-medium border-b border-border/50 pb-2">Personal Information</h3>
          
          {!phone.trim() && !profileSuccess && (
            <div className="flex items-center space-x-2 bg-amber-500/15 text-amber-600 dark:text-amber-400 p-3.5 rounded-xl text-sm border border-amber-500/30 animate-pulse">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>Please add your contact number to complete your profile.</span>
            </div>
          )}

          {profileError && (
            <div className="flex items-center space-x-2 bg-destructive/15 text-destructive p-3.5 rounded-xl text-sm border border-destructive/30">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{profileError}</span>
            </div>
          )}

          {profileSuccess && (
            <div className="flex items-center space-x-2 bg-green-500/15 text-green-600 dark:text-green-400 p-3.5 rounded-xl text-sm border border-green-500/30">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{profileSuccess}</span>
            </div>
          )}

          <form onSubmit={handleSaveProfile} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">First Name *</label>
                <input 
                  type="text" 
                  required
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="First Name" 
                  className="w-full bg-background border border-border/50 rounded-xl px-4 py-2.5 focus:outline-none focus:border-primary text-sm text-foreground" 
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">Last Name</label>
                <input 
                  type="text" 
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="Last Name" 
                  className="w-full bg-background border border-border/50 rounded-xl px-4 py-2.5 focus:outline-none focus:border-primary text-sm text-foreground" 
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">Email Address</label>
              <input 
                type="email" 
                value={email}
                disabled 
                className="w-full bg-secondary/50 border border-transparent rounded-xl px-4 py-2.5 text-muted-foreground cursor-not-allowed text-sm" 
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">Contact Number</label>
              <input 
                type="tel" 
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 98765 43210" 
                className="w-full bg-background border border-border/50 rounded-xl px-4 py-2.5 focus:outline-none focus:border-primary text-sm text-foreground" 
              />
            </div>

            <button 
              type="submit"
              disabled={isSaving}
              className="bg-primary text-primary-foreground px-6 py-3 rounded-full text-sm font-medium uppercase tracking-wider hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center"
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Changes"
              )}
            </button>
          </form>
        </div>

        {/* Change Password Form */}
        <div className="space-y-6">
          <h3 className="text-lg font-medium border-b border-border/50 pb-2">Change Password</h3>
          
          {pwdError && (
            <div className="flex items-center space-x-2 bg-destructive/15 text-destructive p-3.5 rounded-xl text-sm border border-destructive/30">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{pwdError}</span>
            </div>
          )}

          {pwdSuccess && (
            <div className="flex items-center space-x-2 bg-green-500/15 text-green-600 dark:text-green-400 p-3.5 rounded-xl text-sm border border-green-500/30">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{pwdSuccess}</span>
            </div>
          )}

          <form onSubmit={handleUpdatePwd} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">Current Password</label>
              <input 
                type="password" 
                required
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="••••••••" 
                className="w-full bg-background border border-border/50 rounded-xl px-4 py-2.5 focus:outline-none focus:border-primary text-sm text-foreground" 
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">New Password</label>
              <input 
                type="password" 
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="••••••••" 
                className="w-full bg-background border border-border/50 rounded-xl px-4 py-2.5 focus:outline-none focus:border-primary text-sm text-foreground" 
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">Confirm New Password</label>
              <input 
                type="password" 
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••" 
                className="w-full bg-background border border-border/50 rounded-xl px-4 py-2.5 focus:outline-none focus:border-primary text-sm text-foreground" 
              />
            </div>

            <button 
              type="submit"
              disabled={isUpdatingPwd}
              className="border border-primary text-primary px-6 py-3 rounded-full text-sm font-medium uppercase tracking-wider hover:bg-primary hover:text-primary-foreground transition-colors disabled:opacity-50 flex items-center justify-center"
            >
              {isUpdatingPwd ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Updating...
                </>
              ) : (
                "Update Password"
              )}
            </button>
          </form>
        </div>

      </div>
    </div>
  );
}
