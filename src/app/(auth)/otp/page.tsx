"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";

export default function OTPPage() {
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const handleChange = (index: number, value: string) => {
    if (isNaN(Number(value))) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value !== "" && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    // Handle backspace
    if (e.key === "Backspace" && otp[index] === "" && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  return (
    <div className="max-w-md w-full mx-auto text-center animate-fade-in-up">
      <h1 className="text-4xl font-playfair font-bold mb-2">Verify Email</h1>
      <p className="text-muted-foreground mb-8">
        We've sent a 6-digit code to <span className="font-medium text-foreground">radhika@example.com</span>. Please enter it below.
      </p>

      <form className="space-y-8" onSubmit={(e) => e.preventDefault()}>
        <div className="flex justify-center gap-3 md:gap-4">
          {otp.map((digit, index) => (
            <input
              key={index}
              ref={(el) => { inputRefs.current[index] = el; }}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(e) => handleChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              className="w-12 h-14 md:w-14 md:h-16 text-center text-2xl font-bold bg-transparent border-b-2 border-border/50 focus:outline-none focus:border-primary transition-colors text-foreground"
            />
          ))}
        </div>

        <button 
          type="submit"
          className="w-full bg-primary text-primary-foreground py-4 rounded-full font-medium tracking-wider uppercase text-sm hover:opacity-90 transition-opacity"
        >
          Verify Code
        </button>
      </form>

      <div className="mt-8 text-center text-sm text-muted-foreground">
        Didn't receive the code?{" "}
        <button className="text-primary font-bold hover:underline">
          Resend
        </button>
      </div>
      
      <div className="mt-6 text-center">
        <Link href="/login" className="text-xs text-muted-foreground hover:text-foreground transition-colors underline underline-offset-4 uppercase tracking-wider">
          Back to Login
        </Link>
      </div>
    </div>
  );
}
