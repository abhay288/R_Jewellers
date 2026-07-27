"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import {
  ConsentState,
  ConsentCategories,
  DEFAULT_CONSENT,
  ALL_CONSENT,
  REJECT_CONSENT,
  getConsentFromBrowser,
  setConsentInBrowser,
} from "@/shared/lib/cookieConsent";

interface CookieConsentContextType {
  consent: ConsentState;
  isBannerVisible: boolean;
  isModalOpen: boolean;
  hasHydrated: boolean;
  acceptAll: () => void;
  rejectNonEssential: () => void;
  savePreferences: (categories: ConsentCategories) => void;
  openModal: () => void;
  closeModal: () => void;
}

const CookieConsentContext = createContext<CookieConsentContextType | undefined>(undefined);

export function CookieConsentProvider({
  children,
  initialConsent,
}: {
  children: React.ReactNode;
  initialConsent?: ConsentState;
}) {
  const [consent, setConsent] = useState<ConsentState>(initialConsent || DEFAULT_CONSENT);
  const [hasHydrated, setHasHydrated] = useState(false);
  const [isBannerVisible, setIsBannerVisible] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    // Read actual consent on client mount to prevent hydration mismatch
    const clientConsent = getConsentFromBrowser();
    setConsent(clientConsent);
    setHasHydrated(true);

    if (!clientConsent.granted) {
      setIsBannerVisible(true);
    }
  }, []);

  const handleUpdateConsent = useCallback((categories: ConsentCategories) => {
    const updated = setConsentInBrowser(categories);
    setConsent(updated);
    setIsBannerVisible(false);
    setIsModalOpen(false);
  }, []);

  const acceptAll = useCallback(() => {
    handleUpdateConsent(ALL_CONSENT);
  }, [handleUpdateConsent]);

  const rejectNonEssential = useCallback(() => {
    handleUpdateConsent(REJECT_CONSENT);
  }, [handleUpdateConsent]);

  const savePreferences = useCallback(
    (categories: ConsentCategories) => {
      handleUpdateConsent(categories);
    },
    [handleUpdateConsent]
  );

  const openModal = useCallback(() => {
    setIsModalOpen(true);
  }, []);

  const closeModal = useCallback(() => {
    setIsModalOpen(false);
  }, []);

  return (
    <CookieConsentContext.Provider
      value={{
        consent,
        isBannerVisible,
        isModalOpen,
        hasHydrated,
        acceptAll,
        rejectNonEssential,
        savePreferences,
        openModal,
        closeModal,
      }}
    >
      {children}
    </CookieConsentContext.Provider>
  );
}

export function useCookieConsent() {
  const context = useContext(CookieConsentContext);
  if (!context) {
    throw new Error("useCookieConsent must be used within a CookieConsentProvider");
  }
  return context;
}
