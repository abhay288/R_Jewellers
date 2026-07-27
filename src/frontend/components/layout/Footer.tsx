import Link from "next/link";
import Image from "next/image";
import { MapPin, Phone, Mail } from "lucide-react";
import { FaFacebook, FaInstagram, FaYoutube, FaPinterest } from "react-icons/fa";
import CookiePreferencesLink from "@/frontend/components/cookie/CookiePreferencesLink";

const footerLinks = {
  collections: [
    { label: "Bridal Collection", href: "/shop?category=bridal-sets" },
    { label: "Festival Wear", href: "/shop?category=festival-collection" },
    { label: "Everyday Elegance", href: "/shop" },
    { label: "New Arrivals", href: "/shop" },
    { label: "Gift Finder", href: "/shop?category=gift-collection" },
    { label: "Limited Edition", href: "/shop?category=gift-collection" },
  ],
  care: [
    { label: "Contact Us", href: "/contact" },
    { label: "Shipping Policy", href: "/shipping" },
    { label: "Returns & Refunds", href: "/returns" },
    { label: "FAQ & Support", href: "/faq" },
    { label: "Track Order", href: "/track-order" },
    { label: "Cancellation Policy", href: "/cancellation" },
  ],
  legal: [
    { label: "Privacy Policy", href: "/privacy" },
    { label: "Terms & Conditions", href: "/terms" },
    { label: "Sitemap", href: "/sitemap.xml" },
  ],
};

export default function Footer() {
  return (
    <footer
      className="relative z-20 overflow-hidden"
      style={{ background: "#2C2820" }}
    >
      {/* Gold top rule */}
      <div
        className="h-px w-full"
        style={{ background: "linear-gradient(to right, transparent, rgba(201,162,39,0.5) 40%, rgba(201,162,39,0.5) 60%, transparent)" }}
      />

      {/* Large background watermark */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none overflow-hidden">
        <span
          className="font-playfair font-bold whitespace-nowrap"
          style={{
            fontSize: "clamp(5rem, 14vw, 12rem)",
            color: "rgba(201,162,39,0.04)",
            letterSpacing: "0.15em",
            lineHeight: 1,
          }}
        >
          RADHIKA JEWELLERS
        </span>
      </div>

      <div className="container mx-auto px-6 pt-16 pb-0">

        {/* ─── Main Grid ─── */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-16 pb-14 border-b" style={{ borderColor: "rgba(255,255,255,0.07)" }}>

          {/* Column 1 — Brand */}
          <div className="space-y-6">
            {/* Logo — CSS filter for dark bg, no card */}
            <Link href="/" className="inline-block">
              <Image
                src="/assets/logo.png"
                alt="Radhika Jewellers"
                width={150}
                height={55}
                className="object-contain max-h-14"
                style={{ width: "auto", height: "auto", filter: "brightness(0) invert(1) sepia(1) saturate(0.3) hue-rotate(5deg)", opacity: 0.85 }}
              />
            </Link>

            <p style={{ color: "rgba(245,237,216,0.5)" }} className="text-[13px] font-light leading-[1.9] max-w-55">
              Exquisite luxury artificial jewellery crafted to perfection — for every occasion that deserves to be remembered.
            </p>

            {/* Gold rule */}
            <div className="w-8 h-px" style={{ background: "rgba(201,162,39,0.5)" }} />

            {/* Socials */}
            <div className="flex items-center gap-3 pt-1">
              {[
                { href: "https://www.instagram.com/radhika_jeweller15", icon: FaInstagram, label: "Instagram" },
                { href: "#", icon: FaFacebook, label: "Facebook" },
                { href: "#", icon: FaPinterest, label: "Pinterest" },
                { href: "#", icon: FaYoutube, label: "YouTube" },
              ].map(({ href, icon: Icon, label }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  style={{ border: "1px solid rgba(255,255,255,0.1)", color: "rgba(245,237,216,0.4)" }}
                  className="w-9 h-9 flex items-center justify-center transition-all duration-300 hover:border-[#C9A227] hover:text-[#C9A227]"
                >
                  <Icon size={14} />
                </a>
              ))}
            </div>
          </div>

          {/* Column 2 — Collections */}
          <div>
            <h4
              className="font-playfair text-base font-bold mb-7"
              style={{ color: "#F5EDD8" }}
            >
              Collections
            </h4>
            <ul className="space-y-3.5">
              {footerLinks.collections.map(({ label, href }) => (
                <li key={label}>
                  <Link
                    href={href}
                    className="group flex items-center gap-2.5 text-[13px] font-light transition-colors duration-300"
                    style={{ color: "rgba(245,237,216,0.45)" }}
                  >
                    <span
                      className="inline-block w-0 h-px transition-all duration-300 group-hover:w-4"
                      style={{ background: "#C9A227" }}
                    />
                    <span className="group-hover:text-[#C9A227] transition-colors duration-300">{label}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3 — Customer Care */}
          <div>
            <h4
              className="font-playfair text-base font-bold mb-7"
              style={{ color: "#F5EDD8" }}
            >
              Customer Care
            </h4>
            <ul className="space-y-3.5">
              {footerLinks.care.map(({ label, href }) => (
                <li key={label}>
                  <Link
                    href={href}
                    className="group flex items-center gap-2.5 text-[13px] font-light transition-colors duration-300"
                    style={{ color: "rgba(245,237,216,0.45)" }}
                  >
                    <span
                      className="inline-block w-0 h-px transition-all duration-300 group-hover:w-4"
                      style={{ background: "#C9A227" }}
                    />
                    <span className="group-hover:text-[#C9A227] transition-colors duration-300">{label}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 4 — Contact Info */}
          <div>
            <h4
              className="font-playfair text-base font-bold mb-7"
              style={{ color: "#F5EDD8" }}
            >
              Contact & Address
            </h4>
            <ul className="space-y-5 mb-8">
              <li className="flex items-start gap-3">
                <MapPin size={14} className="shrink-0 mt-0.5" style={{ color: "#C9A227" }} />
                <span className="text-[13px] font-light leading-relaxed" style={{ color: "rgba(245,237,216,0.45)" }}>
                  51 khagender nath ganguly lane, 4th floor/flat no 402<br />near pumping iron gym, Nandi bagan<br />Howrah - 711106
                </span>
              </li>
              <li className="flex items-center gap-3">
                <Mail size={14} className="shrink-0" style={{ color: "#C9A227" }} />
                <a
                  href="mailto:radhikajewellers699@gmail.com"
                  className="text-[13px] font-light hover:text-[#C9A227] transition-colors duration-300"
                  style={{ color: "rgba(245,237,216,0.45)" }}
                >
                  radhikajewellers699@gmail.com
                </a>
              </li>
            </ul>

            {/* Support hours */}
            <div
              className="pt-6 border-t"
              style={{ borderColor: "rgba(255,255,255,0.07)" }}
            >
              <p
                className="text-[9px] uppercase tracking-[0.35em] font-bold mb-3"
                style={{ color: "rgba(201,162,39,0.5)" }}
              >
                Support Hours
              </p>
              <p className="text-[12px] font-light mb-1" style={{ color: "rgba(245,237,216,0.38)" }}>
                Mon – Sat &nbsp; 10:00 AM – 8:00 PM
              </p>
              <p className="text-[12px] font-light" style={{ color: "rgba(245,237,216,0.38)" }}>
                Sunday &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;11:00 AM – 6:00 PM
              </p>
            </div>
          </div>
        </div>

        {/* ─── Trust Bar ─── */}
        <div
          className="py-6 flex flex-col sm:flex-row items-center justify-between gap-5 border-b"
          style={{ borderColor: "rgba(255,255,255,0.07)" }}
        >
          <div className="flex flex-wrap items-center gap-8">
            <div className="flex items-center gap-3">
              <span
                className="text-[8px] uppercase tracking-[0.4em] font-bold"
                style={{ color: "rgba(245,237,216,0.25)" }}
              >
                Shipped via
              </span>
              <div className="flex items-center gap-3">
                {["BlueDart", "FedEx", "DHL", "Shiprocket"].map((name, i) => (
                  <span key={name} className="flex items-center gap-3">
                    {i > 0 && (
                      <span
                        className="w-px h-3"
                        style={{ background: "rgba(255,255,255,0.1)" }}
                      />
                    )}
                    <span
                      className="text-[11px] font-light tracking-wide"
                      style={{ color: "rgba(245,237,216,0.3)" }}
                    >
                      {name}
                    </span>
                  </span>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-3">
              <span
                className="text-[8px] uppercase tracking-[0.4em] font-bold"
                style={{ color: "rgba(245,237,216,0.25)" }}
              >
                Pay via
              </span>
              <div className="flex items-center gap-3">
                {["UPI", "Cards", "NetBanking", "Razorpay"].map((name, i) => (
                  <span key={name} className="flex items-center gap-3">
                    {i > 0 && (
                      <span
                        className="w-px h-3"
                        style={{ background: "rgba(255,255,255,0.1)" }}
                      />
                    )}
                    <span
                      className="text-[11px] font-light tracking-wide"
                      style={{ color: "rgba(245,237,216,0.3)" }}
                    >
                      {name}
                    </span>
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* SSL badge */}
          <div
            className="flex items-center gap-2 px-4 py-2 border"
            style={{ borderColor: "rgba(201,162,39,0.2)", background: "rgba(201,162,39,0.05)" }}
          >
            <div className="w-1.5 h-1.5 rounded-full bg-[#C9A227]" />
            <span
              className="text-[9px] uppercase tracking-[0.3em] font-bold"
              style={{ color: "rgba(201,162,39,0.6)" }}
            >
              SSL Secured
            </span>
          </div>
        </div>

        {/* ─── Copyright Bar ─── */}
        <div className="py-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <p
            className="text-[11px] font-light tracking-wide"
            style={{ color: "rgba(245,237,216,0.25)" }}
          >
            © {new Date().getFullYear()} Radhika Jewellers. All rights reserved.
          </p>

          <p
            className="text-[11px] font-light tracking-wider"
            style={{ color: "rgba(201,162,39,0.35)" }}
          >
            Crafted with ♦ in India
          </p>

          <div className="flex flex-wrap items-center gap-6">
            {footerLinks.legal.map(({ label, href }) => (
              <Link
                key={label}
                href={href}
                className="text-[11px] font-light hover:text-[#C9A227] transition-colors duration-300"
                style={{ color: "rgba(245,237,216,0.25)" }}
              >
                {label}
              </Link>
            ))}
            <CookiePreferencesLink />
          </div>
        </div>

      </div>
    </footer>
  );
}
