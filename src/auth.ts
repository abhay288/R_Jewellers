import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { MongoDBAdapter } from "@auth/mongodb-adapter";
import clientPromise from "@/shared/lib/mongodb-client";
import bcrypt from "bcryptjs";
import connectDB from "@/shared/lib/mongodb";
import User from "@/backend/models/User";
import { authConfig } from "./auth.config";

const googleClientId = (process.env.GOOGLE_CLIENT_ID || "").trim();
const googleClientSecret = (process.env.GOOGLE_CLIENT_SECRET || "").trim();

export const {
  handlers: { GET, POST },
  auth,
  signIn,
  signOut,
} = NextAuth({
  ...authConfig,
  adapter: MongoDBAdapter(clientPromise),
  providers: [
    GoogleProvider({
      clientId: googleClientId,
      clientSecret: googleClientSecret,
      allowDangerousEmailAccountLinking: true,
    }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        await connectDB();

        const emailLower = (credentials.email as string).toLowerCase().trim();
        const user = await User.findOne({ email: emailLower }).select("+password +failedLoginAttempts +lockUntil");

        if (!user) return null;

        // Check if account is locked
        if (user.lockUntil && user.lockUntil > new Date()) {
          throw new Error('Account is temporarily locked. Please try again after 15 minutes.');
        }

        const isPasswordMatch = await bcrypt.compare(
          credentials.password as string,
          user.password || ""
        );

        if (!isPasswordMatch) {
          user.failedLoginAttempts = (user.failedLoginAttempts || 0) + 1;
          if (user.failedLoginAttempts >= 5) {
            user.lockUntil = new Date(Date.now() + 15 * 60 * 1000); // 15 mins
          }
          await user.save();
          
          if (user.failedLoginAttempts >= 5) {
            throw new Error('Too many failed attempts. Account locked for 15 minutes.');
          }
          throw new Error('Invalid email or password.');
        }

        // Reset counters on successful login
        if (user.failedLoginAttempts > 0 || user.lockUntil) {
          user.failedLoginAttempts = 0;
          user.lockUntil = undefined;
          await user.save();
        }

        return {
          id: user._id.toString(),
          email: user.email,
          name: user.name,
          role: user.role,
          phone: user.phone || "",
        };
      },
    }),
  ],
  events: {
    async signIn(message) {
      console.log(`[Auth.js Event] User signed in successfully: ${message.user.email} via ${message.account?.provider}`);
    },
    async createUser(message) {
      console.log(`[Auth.js Event] New user created in DB: ${message.user.email}`);
    },
    async linkAccount(message) {
      console.log(`[Auth.js Event] Google account linked to user: ${message.user.email}`);
    },
  },
  callbacks: {
    ...authConfig.callbacks,
    async signIn({ user, account }) {
      if (account?.provider === "google" && user.email) {
        if (!googleClientId || !googleClientSecret) {
          console.error("[Auth.js Error] GOOGLE_CLIENT_ID or GOOGLE_CLIENT_SECRET is missing in process.env");
        }
        try {
          await connectDB();
          const emailLower = user.email.toLowerCase().trim();
          const ADMIN_EMAIL = "radhikajewellers699@gmail.com";
          const isAdmin = emailLower === ADMIN_EMAIL;

          const updatedUser = await User.findOneAndUpdate(
            { email: emailLower },
            {
              $set: {
                ...(isAdmin ? { role: "admin" } : {}),
                emailVerified: new Date(),
              },
              $addToSet: { providers: "google" },
              $setOnInsert: {
                name: user.name || "User",
                image: user.image || undefined,
                role: isAdmin ? "admin" : "user",
                failedLoginAttempts: 0,
                notificationPreferences: {
                  orderStatus: true,
                  lowStock: true,
                  newReturns: true,
                  promotions: true,
                },
              },
            },
            { upsert: true, new: true, setDefaultsOnInsert: true }
          );

          if (updatedUser) {
            (user as any).id = updatedUser._id.toString();
            (user as any).role = updatedUser.role;
            (user as any).phone = updatedUser.phone || "";
          }
          if (isAdmin) {
            return "/admin";
          }
        } catch (error: any) {
          console.error("[Auth.js Google OAuth MongoDB Sync Error]:", error?.message || error);
        }
      }
      return true;
    },
  },
});
