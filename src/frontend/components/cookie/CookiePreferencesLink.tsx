"use client";

import React from "react";
import { useCookieConsent } from "@/frontend/context/CookieConsentContext";

export default function CookiePreferencesLink() {
  const { openModal } = useCookieConsent();

  return (
    <button
      onClick={openModal}
      type="button"
      className="text-[11px] font-light hover:text-[#C9A227] transition-colors duration-300 cursor-pointer"
      style={{ color: "rgba(245,237,216,0.25)" }}
    >
      Cookie Preferences
    </button>
  );
}
