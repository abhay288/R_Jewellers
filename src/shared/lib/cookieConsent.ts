export interface ConsentCategories {
  necessary: boolean; // Always true
  analytics: boolean;
  marketing: boolean;
  personalization: boolean;
  functional: boolean;
}

export interface ConsentState {
  granted: boolean;
  categories: ConsentCategories;
  updatedAt: string;
  version: number;
}

export const CONSENT_COOKIE_NAME = "cookie_consent";
export const CONSENT_VERSION = 1;
export const CONSENT_EXPIRY_DAYS = 365;

export const DEFAULT_CONSENT: ConsentState = {
  granted: false,
  categories: {
    necessary: true,
    analytics: false,
    marketing: false,
    personalization: false,
    functional: false,
  },
  updatedAt: "",
  version: CONSENT_VERSION,
};

export const ALL_CONSENT: ConsentCategories = {
  necessary: true,
  analytics: true,
  marketing: true,
  personalization: true,
  functional: true,
};

export const REJECT_CONSENT: ConsentCategories = {
  necessary: true,
  analytics: false,
  marketing: false,
  personalization: false,
  functional: false,
};

/**
 * Server-safe helper to parse consent cookie string
 */
export function parseConsentCookie(cookieValue?: string | null): ConsentState {
  if (!cookieValue) return DEFAULT_CONSENT;
  try {
    const parsed = JSON.parse(decodeURIComponent(cookieValue));
    if (parsed && typeof parsed === "object" && parsed.categories) {
      return {
        granted: Boolean(parsed.granted),
        categories: {
          necessary: true, // Always locked to true
          analytics: Boolean(parsed.categories.analytics),
          marketing: Boolean(parsed.categories.marketing),
          personalization: Boolean(parsed.categories.personalization),
          functional: Boolean(parsed.categories.functional),
        },
        updatedAt: parsed.updatedAt || new Date().toISOString(),
        version: parsed.version || CONSENT_VERSION,
      };
    }
  } catch (e) {
    // Parsing error fallback
  }
  return DEFAULT_CONSENT;
}

/**
 * Browser helper to get consent from document.cookie
 */
export function getConsentFromBrowser(): ConsentState {
  if (typeof window === "undefined" || typeof document === "undefined") {
    return DEFAULT_CONSENT;
  }
  
  const cookies = document.cookie.split("; ");
  for (const cookie of cookies) {
    const [name, ...rest] = cookie.split("=");
    if (name === CONSENT_COOKIE_NAME) {
      return parseConsentCookie(rest.join("="));
    }
  }
  return DEFAULT_CONSENT;
}

/**
 * Browser helper to set consent cookie
 */
export function setConsentInBrowser(categories: ConsentCategories): ConsentState {
  if (typeof window === "undefined" || typeof document === "undefined") {
    return DEFAULT_CONSENT;
  }

  const newState: ConsentState = {
    granted: true,
    categories: {
      ...categories,
      necessary: true, // Enforce necessary
    },
    updatedAt: new Date().toISOString(),
    version: CONSENT_VERSION,
  };

  const expiresDate = new Date();
  expiresDate.setDate(expiresDate.getDate() + CONSENT_EXPIRY_DAYS);

  const serialized = encodeURIComponent(JSON.stringify(newState));
  const isSecure = window.location.protocol === "https:";
  
  document.cookie = `${CONSENT_COOKIE_NAME}=${serialized}; expires=${expiresDate.toUTCString()}; path=/; SameSite=Lax${
    isSecure ? "; Secure" : ""
  }`;

  // Dispatch custom window event so tracking scripts react immediately
  window.dispatchEvent(
    new CustomEvent("cookie_consent_updated", { detail: newState })
  );

  return newState;
}
