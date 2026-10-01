import type { NextAuthConfig } from "next-auth";

const ADMIN_EMAIL = "radhikajewellers699@gmail.com";

export const authConfig = {
  providers: [], // We configure providers in auth.ts because credentials require Node.js APIs (bcrypt, mongodb)
  pages: {
    signIn: "/login",
    error: "/login",
  },
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      // 1. Ensure token.id is set
      if (user) {
        token.id = user.id || (user as any)._id?.toString() || token.sub;
        token.phone = (user as any).phone || token.phone || "";
      }

      // 2. Determine role: ALWAYS check if email matches ADMIN_EMAIL or explicitly assigned role
      const emailLower = (user?.email || token?.email || "").toLowerCase().trim();
      if (emailLower === ADMIN_EMAIL) {
        token.role = "admin";
      } else if (user && (user as any).role) {
        token.role = (user as any).role;
      } else if (!token.role) {
        token.role = "user";
      }

      if (trigger === "update") {
        if (session?.name !== undefined) token.name = session.name;
        if (session?.phone !== undefined) token.phone = session.phone;
      }
      return token;
    },
    async session({ session, token, user }) {
      const u = user || token;
      if (session.user) {
        if (u) {
          session.user.id = (u.id || (u as any)._id?.toString() || (u as any).sub) as string;
          (session.user as any).role = ((u as any).role as string) || "user";
          (session.user as any).phone = ((u as any).phone as string) || "";
        }
        if (session.user.email?.toLowerCase().trim() === ADMIN_EMAIL) {
          (session.user as any).role = "admin";
        }
      }
      return session;
    },
    async redirect({ url, baseUrl }) {
      // 1. Relative URLs
      if (url.startsWith("/")) {
        if (url === "/login" || url.startsWith("/login?") || url.startsWith("/api/auth")) {
          return `${baseUrl}/`;
        }
        return `${baseUrl}${url}`;
      }

      // 2. Full URLs
      try {
        const targetUrl = new URL(url);
        const baseUrlObj = new URL(baseUrl);

        // If redirect target is login page or callback, send to the root of that origin
        if (targetUrl.pathname === "/login" || targetUrl.pathname.startsWith("/login?") || targetUrl.pathname.includes("/api/auth")) {
          return `${targetUrl.origin}/`;
        }

        // Allow same-origin or trusted domains
        if (
          targetUrl.origin === baseUrlObj.origin ||
          targetUrl.hostname.endsWith("radhikajewellers.store") ||
          targetUrl.hostname === "localhost" ||
          targetUrl.hostname.endsWith(".vercel.app")
        ) {
          return url;
        }
      } catch {
        // Fallback to baseUrl
      }
      return `${baseUrl}/`;
    },
  },
  session: { strategy: "jwt" },
  secret: process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET,
  trustHost: true,
} satisfies NextAuthConfig;
