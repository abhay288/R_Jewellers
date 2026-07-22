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
        token.role = (user as any).role || token.role || "user";
      }

      // 2. Determine role: ALWAYS check if email matches ADMIN_EMAIL or explicitly assigned role
      const emailLower = (user?.email || token?.email || "").toLowerCase().trim();
      if (emailLower === ADMIN_EMAIL) {
        token.role = "admin";
      }

      if (trigger === "update") {
        if (session?.name !== undefined) token.name = session.name;
        if (session?.phone !== undefined) token.phone = session.phone;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        (session.user as any).role = (token.role as string) || "user";
        (session.user as any).phone = (token.phone as string) || "";
      }
      return session;
    },
    async redirect({ url, baseUrl }) {
      // 1. Allow relative callback URLs (e.g. "/admin", "/checkout", "/account")
      if (url.startsWith("/")) return `${baseUrl}${url}`;
      
      // 2. Allow same-origin URLs or recognized domain targets
      try {
        const targetUrl = new URL(url);
        const baseUrlObj = new URL(baseUrl);
        if (
          targetUrl.origin === baseUrlObj.origin ||
          targetUrl.hostname.endsWith("radhikajewellers.store") ||
          targetUrl.hostname === "localhost" ||
          targetUrl.hostname.endsWith(".vercel.app")
        ) {
          return url;
        }
      } catch {
        // Fallback to baseUrl if parsing fails
      }
      return baseUrl;
    },
  },
  session: { strategy: "jwt" },
  secret: process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET,
  trustHost: true,
} satisfies NextAuthConfig;
