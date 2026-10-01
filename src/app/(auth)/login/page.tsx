"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { Eye, EyeOff } from "lucide-react";
import { signIn } from "next-auth/react";
import { useSearchParams } from "next/navigation";

function getOAuthErrorMessage(errorCode: string | null) {
  if (!errorCode) return "";
  switch (errorCode) {
    case "OAuthAccountNotLinked":
      return "An account with this email already exists using password login. Please sign in with your email and password.";
    case "OAuthSignin":
    case "OAuthCallback":
      return "Unable to complete Google sign-in. Please ensure Google OAuth redirect URIs match this domain or try again.";
    case "AccessDenied":
      return "Sign-in was cancelled or access denied by Google.";
    case "Configuration":
      return "Authentication server configuration error. Please verify Google credentials in environment variables.";
    default:
      return `Authentication failed (${errorCode}). Please try again.`;
  }
}

function LoginForm() {
  const searchParams = useSearchParams();
  const rawCallbackUrl = searchParams.get("callbackUrl");
  const callbackUrl = rawCallbackUrl && !rawCallbackUrl.startsWith("/login") && !rawCallbackUrl.startsWith("/signup") ? rawCallbackUrl : "/";
  const urlError = searchParams.get("error");

  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const displayError = error || getOAuthErrorMessage(urlError);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    
    const res = await signIn("credentials", {
      redirect: false,
      email,
      password,
    });

    if (res?.error) {
      setError("Invalid email or password. Please try again.");
      setLoading(false);
    } else {
      const isAdminEmail = email.toLowerCase().trim() === "radhikajewellers699@gmail.com";
      const destination = callbackUrl === "/" && isAdminEmail ? "/admin" : callbackUrl;
      window.location.href = destination;
    }
  };

  const handleGoogleSignIn = async (e: React.MouseEvent) => {
    e.preventDefault();
    setLoading(true);
    await signIn("google", { callbackUrl });
  };

  return (
    <div className="max-w-md w-full mx-auto animate-fade-in-up">
      <h1 className="text-4xl font-playfair font-bold mb-2">Welcome Back</h1>
      <p className="text-muted-foreground mb-8">Sign in to access your wishlist, orders, and exclusive offers.</p>

      {displayError && (
        <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-xl text-sm border border-red-200 shadow-sm leading-relaxed">
          {displayError}
        </div>
      )}

      <form className="space-y-6" onSubmit={handleSignIn}>
        <div className="space-y-2">
          <label className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Email Address</label>
          <input 
            type="email" 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full bg-transparent border-b-2 border-border/50 px-0 py-3 focus:outline-none focus:border-primary transition-colors text-foreground" 
            placeholder="radhika@example.com"
          />
        </div>
        
        <div className="space-y-2 relative">
          <label className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Password</label>
          <div className="relative">
            <input 
              type={showPassword ? "text" : "password"} 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full bg-transparent border-b-2 border-border/50 px-0 py-3 focus:outline-none focus:border-primary transition-colors text-foreground" 
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

        <div className="flex items-center justify-between">
          <label className="flex items-center space-x-2 cursor-pointer">
            <input type="checkbox" className="w-4 h-4 rounded border-border text-primary focus:ring-primary accent-primary" />
            <span className="text-sm text-muted-foreground">Remember me</span>
          </label>
          <Link href="/forgot-password" className="text-sm text-primary font-medium hover:underline">
            Forgot Password?
          </Link>
        </div>

        <button 
          type="submit"
          disabled={loading || !email || !password}
          className="w-full bg-primary text-primary-foreground py-4 rounded-full font-medium tracking-wider uppercase text-sm hover:opacity-90 transition-opacity mt-4 disabled:opacity-50"
        >
          {loading ? "Signing In..." : "Sign In"}
        </button>
      </form>

      <div className="mt-8 text-center text-sm text-muted-foreground">
        Don't have an account?{" "}
        <Link href="/signup" className="text-primary font-bold hover:underline">
          Create Account
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
      
      <div className="mt-6 flex flex-col">
        <button 
          type="button"
          onClick={handleGoogleSignIn}
          className="flex items-center justify-center space-x-2 py-3 w-full border border-border/50 rounded-full hover:bg-secondary/50 transition-colors"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/><path fill="none" d="M1 1h22v22H1z"/></svg>
          <span className="text-sm font-medium">Continue with Google</span>
        </button>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
