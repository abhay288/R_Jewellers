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
      const email = message.user.email?.toLowerCase().trim();
      const ADMIN_EMAIL = "radhikajewellers699@gmail.com";
      if (email === ADMIN_EMAIL || message.user.role === "admin") {
        try {
          const { EmailService } = require("@/backend/services/EmailService");
          const emailService = new EmailService();
          await emailService.sendEmail(
            email,
            "Security Alert: Admin Login Detected",
            `
              <div style="font-family: sans-serif; padding: 20px; line-height: 1.6; color: #333;">
                <h2 style="color: #8c765c; border-bottom: 2px solid #8c765c; padding-bottom: 10px; font-family: serif;">Admin Login Detected</h2>
                <p>Hello,</p>
                <p>A new login session was established for your admin account: <strong>${email}</strong>.</p>
                <div style="background: #faf8f6; padding: 15px; border: 1px solid #e5dfd9; margin: 20px 0; border-radius: 6px;">
                  <strong>Login Details:</strong><br/>
                  • Time: ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })} IST<br/>
                  • Provider: ${message.account?.provider || 'credentials'}<br/>
                  • Status: Successful
                </div>
                <p>If this was not you, please secure your credentials immediately.</p>
                <p>With Warm Regards,<br/>Radhika Jewellers Security</p>
              </div>
            `
          );
        } catch (error) {
          console.error("[Email Alert Error] Failed to send admin login email alert:", error);
        }
      }
    },
    async createUser(message) {
      console.log(`[Auth.js Event] New user created in DB: ${message.user.email}`);
      try {
        await connectDB();
        const emailLower = (message.user.email || "").toLowerCase().trim();
        const ADMIN_EMAIL = "radhikajewellers699@gmail.com";
        const isAdmin = emailLower === ADMIN_EMAIL;

        await User.findByIdAndUpdate(message.user.id, {
          $set: {
            role: isAdmin ? "admin" : "user",
            emailVerified: new Date(),
            failedLoginAttempts: 0,
            notificationPreferences: {
              orderStatus: true,
              lowStock: true,
              newReturns: true,
              promotions: true,
            },
          },
          $addToSet: { providers: "google" }
        });
      } catch (err) {
        console.error("[Auth.js Event Error] Failed to set default user properties:", err);
      }
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

          // Safely check if user already exists without triggering duplicate key upsert races
          const existingUser = await User.findOne({ email: emailLower });

          if (existingUser) {
            existingUser.emailVerified = new Date();
            if (isAdmin) existingUser.role = "admin";
            if (!existingUser.providers?.includes("google")) {
              existingUser.providers = existingUser.providers || [];
              existingUser.providers.push("google");
            }
            await existingUser.save();

            (user as any).id = existingUser._id.toString();
            (user as any).role = existingUser.role;
            (user as any).phone = existingUser.phone || "";
          } else {
            // New user will be created safely by MongoDBAdapter without duplicate key collision
            (user as any).role = isAdmin ? "admin" : "user";
          }

          if (isAdmin) {
            return "/admin";
          }
        } catch (error: any) {
          console.error("[Auth.js Google OAuth Sync Error]:", error?.message || error);
        }
      }
      return true;
    },
  },
});
