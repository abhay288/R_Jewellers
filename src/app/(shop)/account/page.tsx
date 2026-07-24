"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Loader2, CheckCircle2, AlertCircle, User, Lock, Phone, Mail, ShieldCheck } from "lucide-react";

export default function ProfilePage() {
  const { data: session, update: updateSession } = useSession();

  const [loading, setLoading] = useState(false);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [profileSuccess, setProfileSuccess] = useState<string | null>(null);

  const [firstName, setFirstName] = useState(() => {
    const fullName = session?.user?.name || "";
    return fullName.split(" ")[0] || "";
  });
  const [lastName, setLastName] = useState(() => {
    const fullName = session?.user?.name || "";
    return fullName.split(" ").slice(1).join(" ") || "";
  });
  const [email, setEmail] = useState(() => session?.user?.email || "");
  const [phone, setPhone] = useState(() => (session?.user as any)?.phone || "");

  const [isSaving, setIsSaving] = useState(false);

  // Change password states
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [isUpdatingPwd, setIsUpdatingPwd] = useState(false);
  const [pwdError, setPwdError] = useState<string | null>(null);
  const [pwdSuccess, setPwdSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (session?.user) {
      if (!firstName && session.user.name) {
        const parts = session.user.name.split(" ");
        setFirstName(parts[0] || "");
        setLastName(parts.slice(1).join(" ") || "");
      }
      if (!email && session.user.email) setEmail(session.user.email);
      if (!phone && (session.user as any)?.phone) setPhone((session.user as any).phone);
    }
  }, [session]);

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

      setProfileSuccess("Profile details saved successfully!");
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
      <div className="flex flex-col items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-amber-500 mb-3" />
        <p className="text-xs text-muted-foreground uppercase tracking-widest font-semibold">Loading Profile Details...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      
      {/* Section Title */}
      <div className="border-b border-border/40 pb-4 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-playfair font-bold text-foreground">My Profile Settings</h2>
          <p className="text-xs text-muted-foreground mt-0.5">Manage your personal details and account security</p>
        </div>
        <span className="text-xs font-bold text-amber-500 bg-amber-500/10 border border-amber-500/30 px-3 py-1 rounded-full uppercase tracking-wider hidden sm:inline-block">
          Verified Account
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Personal Information Card */}
        <div className="bg-secondary/20 border border-border/40 rounded-3xl p-6 space-y-6">
          <div className="flex items-center space-x-2 text-foreground font-playfair font-bold text-lg border-b border-border/40 pb-3">
            <User className="w-5 h-5 text-amber-500" />
            <span>Personal Information</span>
          </div>

          {!phone.trim() && !profileSuccess && (
            <div className="flex items-start space-x-2 bg-amber-500/10 text-amber-600 dark:text-amber-400 p-3.5 rounded-2xl text-xs border border-amber-500/30">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>Please add your contact number for order tracking updates.</span>
            </div>
          )}

          {profileError && (
            <div className="flex items-center space-x-2 bg-destructive/15 text-destructive p-3.5 rounded-2xl text-xs border border-destructive/30">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{profileError}</span>
            </div>
          )}

          {profileSuccess && (
            <div className="flex items-center space-x-2 bg-green-500/15 text-green-600 dark:text-green-400 p-3.5 rounded-2xl text-xs border border-green-500/30">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{profileSuccess}</span>
            </div>
          )}

          <form onSubmit={handleSaveProfile} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase text-muted-foreground">First Name *</label>
                <input 
                  type="text" 
                  required
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="First Name" 
                  className="w-full bg-background border border-border/60 rounded-xl px-4 py-2.5 text-xs text-foreground focus:outline-none focus:border-amber-500" 
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase text-muted-foreground">Last Name</label>
                <input 
                  type="text" 
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="Last Name" 
                  className="w-full bg-background border border-border/60 rounded-xl px-4 py-2.5 text-xs text-foreground focus:outline-none focus:border-amber-500" 
                />
              </div>
            </div>
            
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase text-muted-foreground flex items-center justify-between">
                <span>Email Address</span>
                <span className="text-[10px] text-muted-foreground italic">(Cannot be changed)</span>
              </label>
              <div className="relative">
                <input 
                  type="email" 
                  value={email}
                  disabled 
                  className="w-full bg-secondary/50 border border-transparent rounded-xl px-4 py-2.5 text-xs text-muted-foreground cursor-not-allowed pr-10" 
                />
                <Mail className="w-4 h-4 text-muted-foreground absolute right-3 top-1/2 -translate-y-1/2 opacity-60" />
              </div>
            </div>
            
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase text-muted-foreground">Contact Number *</label>
              <div className="relative">
                <input 
                  type="tel" 
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91 98765 43210" 
                  className="w-full bg-background border border-border/60 rounded-xl px-4 py-2.5 text-xs text-foreground focus:outline-none focus:border-amber-500 pr-10" 
                />
                <Phone className="w-4 h-4 text-muted-foreground absolute right-3 top-1/2 -translate-y-1/2 opacity-60" />
              </div>
            </div>

            <div className="pt-2">
              <button 
                type="submit"
                disabled={isSaving}
                className="w-full sm:w-auto bg-amber-500 hover:bg-amber-400 text-black px-6 py-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-all shadow-md shadow-amber-500/20 disabled:opacity-50 flex items-center justify-center cursor-pointer"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Save Profile Changes"
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Change Password Card */}
        <div className="bg-secondary/20 border border-border/40 rounded-3xl p-6 space-y-6">
          <div className="flex items-center space-x-2 text-foreground font-playfair font-bold text-lg border-b border-border/40 pb-3">
            <Lock className="w-5 h-5 text-amber-500" />
            <span>Account Security</span>
          </div>

          {pwdError && (
            <div className="flex items-center space-x-2 bg-destructive/15 text-destructive p-3.5 rounded-2xl text-xs border border-destructive/30">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{pwdError}</span>
            </div>
          )}

          {pwdSuccess && (
            <div className="flex items-center space-x-2 bg-green-500/15 text-green-600 dark:text-green-400 p-3.5 rounded-2xl text-xs border border-green-500/30">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{pwdSuccess}</span>
            </div>
          )}

          <form onSubmit={handleUpdatePwd} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase text-muted-foreground">Current Password</label>
              <input 
                type="password" 
                required
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="••••••••" 
                className="w-full bg-background border border-border/60 rounded-xl px-4 py-2.5 text-xs text-foreground focus:outline-none focus:border-amber-500" 
              />
            </div>
            
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase text-muted-foreground">New Password</label>
              <input 
                type="password" 
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="••••••••" 
                className="w-full bg-background border border-border/60 rounded-xl px-4 py-2.5 text-xs text-foreground focus:outline-none focus:border-amber-500" 
              />
            </div>
            
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase text-muted-foreground">Confirm New Password</label>
              <input 
                type="password" 
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••" 
                className="w-full bg-background border border-border/60 rounded-xl px-4 py-2.5 text-xs text-foreground focus:outline-none focus:border-amber-500" 
              />
            </div>

            <div className="pt-2">
              <button 
                type="submit"
                disabled={isUpdatingPwd}
                className="w-full sm:w-auto bg-secondary border border-border/60 hover:border-amber-500 text-foreground hover:text-amber-500 px-6 py-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-all disabled:opacity-50 flex items-center justify-center cursor-pointer"
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
            </div>
          </form>
        </div>

      </div>

    </div>
  );
}
