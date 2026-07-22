"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { signIn } from "next-auth/react";

export default function SignupPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    password: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const validatePassword = (pass: string) => {
    if (pass.length < 8) return "Password must be at least 8 characters long.";
    if (!/[A-Z]/.test(pass)) return "Password must contain at least one uppercase letter.";
    if (!/[a-z]/.test(pass)) return "Password must contain at least one lowercase letter.";
    if (!/[0-9]/.test(pass)) return "Password must contain at least one number.";
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    if (!formData.firstName || !formData.email || !formData.phone || !formData.password) {
      setError("Please fill in all required fields.");
      return;
    }

    if (formData.phone.trim().length < 10) {
      setError("Contact number must be at least 10 digits.");
      return;
    }

    const passError = validatePassword(formData.password);
    if (passError) {
      setError(passError);
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to create account.");
      }

      setSuccess(true);
      setTimeout(() => {
        router.push("/login");
      }, 2000);
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = () => {
    signIn("google", { callbackUrl: "/" });
  };

  return (
    <div className="max-w-md w-full mx-auto animate-fade-in-up">
      <h1 className="text-4xl font-playfair font-bold mb-2">Create Account</h1>
      <p className="text-muted-foreground mb-8">Join Radhika Jewellers to unlock exclusive collections and rewards.</p>

      {error && (
        <div className="bg-destructive/15 text-destructive p-4 rounded-xl text-sm border border-destructive/30 mb-6">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-500/15 text-green-600 dark:text-green-400 p-4 rounded-xl text-sm border border-green-500/30 mb-6">
          Account created successfully! Redirecting to login...
        </div>
      )}

      <form className="space-y-6" onSubmit={handleSubmit}>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground uppercase tracking-wider">First Name *</label>
            <input 
              type="text" 
              required
              value={formData.firstName}
              onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
              className="w-full bg-transparent border-b-2 border-border/50 px-0 py-3 focus:outline-none focus:border-primary transition-colors text-foreground text-sm" 
              placeholder="Radhika"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Last Name</label>
            <input 
              type="text" 
              value={formData.lastName}
              onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
              className="w-full bg-transparent border-b-2 border-border/50 px-0 py-3 focus:outline-none focus:border-primary transition-colors text-foreground text-sm" 
              placeholder="Sharma"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Email Address *</label>
          <input 
            type="email" 
            required
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            className="w-full bg-transparent border-b-2 border-border/50 px-0 py-3 focus:outline-none focus:border-primary transition-colors text-foreground text-sm" 
            placeholder="radhika@example.com"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Contact Number *</label>
          <input 
            type="tel" 
            required
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            className="w-full bg-transparent border-b-2 border-border/50 px-0 py-3 focus:outline-none focus:border-primary transition-colors text-foreground text-sm" 
            placeholder="+91 98765 43210"
          />
        </div>
        
        <div className="space-y-2 relative">
          <label className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Password *</label>
          <div className="relative">
            <input 
              type={showPassword ? "text" : "password"} 
              required
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="w-full bg-transparent border-b-2 border-border/50 px-0 py-3 focus:outline-none focus:border-primary transition-colors text-foreground text-sm pr-10" 
              placeholder="••••••••"
            />
            <button 
              type="button"
              className="absolute right-0 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
        </div>

        <button 
          type="submit"
          disabled={loading || success}
          className="w-full bg-primary text-primary-foreground py-4 rounded-full font-medium tracking-wider uppercase text-sm hover:opacity-90 transition-opacity mt-4 flex items-center justify-center disabled:opacity-50"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Creating Account...
            </>
          ) : (
            "Create Account"
          )}
        </button>
      </form>

      <div className="mt-8 text-center text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link href="/login" className="text-primary font-bold hover:underline">
          Sign In
        </Link>
      </div>
      
      {/* Social Login Divider */}
      <div className="mt-10 relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-border/50"></div>
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-2 bg-background text-muted-foreground uppercase tracking-wider text-xs">Or continue with</span>
        </div>
      </div>
      
      <div className="mt-6 grid grid-cols-1 gap-4">
        <button 
          onClick={handleGoogleSignIn}
          className="flex items-center justify-center space-x-2 py-3 border border-border/50 rounded-full hover:bg-secondary/50 transition-colors"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/><path fill="none" d="M1 1h22v22H1z"/></svg>
          <span className="text-sm font-medium">Google</span>
        </button>
      </div>
    </div>
  );
}
