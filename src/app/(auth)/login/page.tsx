"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Eye, EyeOff } from "lucide-react";

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="max-w-md w-full mx-auto"
    >
      <h1 className="text-4xl font-playfair font-bold mb-2">Welcome Back</h1>
      <p className="text-muted-foreground mb-8">Sign in to access your wishlist, orders, and exclusive offers.</p>

      <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
        <div className="space-y-2">
          <label className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Email Address</label>
          <input 
            type="email" 
            className="w-full bg-transparent border-b-2 border-border/50 px-0 py-3 focus:outline-none focus:border-primary transition-colors text-foreground" 
            placeholder="radhika@example.com"
          />
        </div>
        
        <div className="space-y-2 relative">
          <label className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Password</label>
          <div className="relative">
            <input 
              type={showPassword ? "text" : "password"} 
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
          className="w-full bg-primary text-primary-foreground py-4 rounded-full font-medium tracking-wider uppercase text-sm hover:opacity-90 transition-opacity mt-4"
        >
          Sign In
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
      
      <div className="mt-6 grid grid-cols-2 gap-4">
        <button className="flex items-center justify-center space-x-2 py-3 border border-border/50 rounded-full hover:bg-secondary/50 transition-colors">
          <svg className="w-5 h-5" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/><path fill="none" d="M1 1h22v22H1z"/></svg>
          <span className="text-sm font-medium">Google</span>
        </button>
        <button className="flex items-center justify-center space-x-2 py-3 border border-border/50 rounded-full hover:bg-secondary/50 transition-colors text-foreground">
          <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M17.05 20.28c-.98.95-2.05 1.8-3.08 1.8-1.08 0-1.57-.65-3.32-.65-1.78 0-2.3.65-3.35.65-1.02 0-2.12-.87-3.1-1.85-2.58-2.67-4.14-7.5-2.78-10.87.67-1.63 1.95-2.68 3.42-2.73 1.48-.05 2.92 1.03 3.82 1.03.9 0 2.65-1.32 4.43-1.12 1.9.2 3.35.98 4.28 2.37-3.62 2.22-2.98 6.95.53 8.3-1.05 2.05-2.13 3.42-3.85 5.07zM12.03 7.25c-.15-2.23 1.65-4.08 3.75-4.25.32 2.35-1.82 4.4-3.75 4.25z"/></svg>
          <span className="text-sm font-medium">Apple</span>
        </button>
      </div>
    </motion.div>
  );
}
