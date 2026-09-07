import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import GitHub from "next-auth/providers/github";
import { PrismaAdapter } from "@auth/prisma-adapter";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { loginSchema } from "@/lib/validations";
import { authConfig } from "./auth.config";

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(db),
  ...authConfig,
  providers: [
    Credentials({
      credentials: {
        email: {},
        password: {},
      },
      async authorize(credentials) {
        const parsed = loginSchema.safeParse(credentials);
        if (!parsed.success) return null;

        const user = await db.user.findUnique({
          where: { email: parsed.data.email },
        });

        if (!user || !user.passwordHash) return null;

        const isValid = await bcrypt.compare(
          parsed.data.password,
          user.passwordHash,
        );

        if (!isValid) return null;

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          image: user.image,
          role: user.role,
        };
      },
    }),
    Google({
      clientId: process.env.AUTH_GOOGLE_ID,
      clientSecret: process.env.AUTH_GOOGLE_SECRET,
    }),
    GitHub({
      clientId: process.env.AUTH_GITHUB_ID,
      clientSecret: process.env.AUTH_GITHUB_SECRET,
    }),
  ],
  callbacks: {
    ...authConfig.callbacks,
    async signIn({ user, account }) {
      if (user.id) {
        const dbUser = await db.user.findUnique({
          where: { id: user.id },
          select: { emailVerified: true, bannedAt: true },
        });

        if (dbUser?.bannedAt) {
          throw new Error("ACCOUNT_BANNED");
        }

        if (
          account?.provider === "credentials" &&
          process.env.SKIP_EMAIL_VERIFICATION !== "true"
        ) {
          if (dbUser && !dbUser.emailVerified) {
            throw new Error("EMAIL_NOT_VERIFIED");
          }
        }
      }
      return true;
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id!;
        token.role = user.role as string;
      }
      const dbUser = await db.user.findUnique({
        where: { id: token.id as string },
        select: { image: true, role: true, bannedAt: true },
      });
      if (dbUser) {
        token.image = dbUser.image;
        token.role = dbUser.role;
        token.bannedAt = dbUser.bannedAt?.toISOString() ?? null;
      }
      return token;
    },
  },
});
