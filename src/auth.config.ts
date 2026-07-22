import type { NextAuthConfig } from "next-auth";

export const authConfig = {
  providers: [], // We configure providers in auth.ts because they require Node.js APIs (bcrypt, mongodb)
  pages: {
    signIn: "/login",
  },
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id || (user as any)._id?.toString() || token.sub;
        token.role = (user as any).role || "user";
        token.phone = (user as any).phone || "";
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
        (session.user as any).role = token.role as string;
        (session.user as any).phone = (token.phone as string) || "";
      }
      return session;
    },
    async redirect({ url, baseUrl }) {
      if (url.startsWith("/")) return `${baseUrl}${url}`;
      try {
        const targetUrl = new URL(url);
        const baseUrlObj = new URL(baseUrl);
        if (
          targetUrl.hostname.endsWith("radhikajewellers.store") ||
          targetUrl.origin === baseUrlObj.origin
        ) {
          return url;
        }
      } catch {
        // Fallback to baseUrl
      }
      return baseUrl;
    },
  },
  session: { strategy: "jwt" },
  secret: process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET,
  trustHost: true,
} satisfies NextAuthConfig;
