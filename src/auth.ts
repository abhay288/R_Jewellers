import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { MongoDBAdapter } from "@auth/mongodb-adapter";
import clientPromise from "@/shared/lib/mongodb-client";
import bcrypt from "bcryptjs";
import connectDB from "@/shared/lib/mongodb";
import User from "@/backend/models/User";
import { authConfig } from "./auth.config";

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
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
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
        };
      },
    }),
  ],
  callbacks: {
    ...authConfig.callbacks,
    async signIn({ user, account, profile }) {
      if (account?.provider === "google") {
        await connectDB();
        const ADMIN_EMAIL = "radhikajewellers699@gmail.com";
        const existingUser = await User.findOne({ email: user.email });

        if (!existingUser) {
          await User.create({
            email: user.email || "",
            name: user.name || "User",
            image: user.image || undefined,
            providers: ["google"],
            emailVerified: new Date(),
            role: user.email === ADMIN_EMAIL ? "admin" : "user",
          });
        } else {
          let updated = false;
          if (!existingUser.providers) {
            existingUser.providers = ["google"];
            updated = true;
          } else if (!existingUser.providers.includes("google")) {
            existingUser.providers.push("google");
            updated = true;
          }
          // Ensure admin account always has admin role
          if (user.email === ADMIN_EMAIL && existingUser.role !== "admin") {
            existingUser.role = "admin";
            updated = true;
          }
          if (updated) {
            await existingUser.save();
          }
        }

        // Propagate role to JWT user object so the jwt callback picks it up
        const dbUser = await User.findOne({ email: user.email }).select("role");
        if (dbUser) {
          (user as any).role = dbUser.role;
        }
      }
      return true;
    },
  },
});
