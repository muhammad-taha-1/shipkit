import { type NextAuthConfig } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import GitHub from "next-auth/providers/github";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { loginSchema } from "@/lib/validations";

export const authConfig: NextAuthConfig = {
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
      allowDangerousEmailAccountLinking: true,
    }),
    GitHub({
      clientId: process.env.AUTH_GITHUB_ID,
      clientSecret: process.env.AUTH_GITHUB_SECRET,
      allowDangerousEmailAccountLinking: true,
    }),
  ],
  session: {
    strategy: "jwt",
    maxAge: 60 * 60,
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === "credentials") {
        const dbUser = await db.user.findUnique({
          where: { id: user.id },
        });
        if (dbUser && !dbUser.emailVerified) return false;
      }
      return true;
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id!;
        token.role = user.role;

        const membership = await db.organizationMember.findFirst({
          where: { userId: user.id },
          orderBy: { createdAt: "desc" },
        });
        token.activeOrgId = membership?.organizationId ?? null;
      }
      return token;
    },
    async session({ session, token }) {
      session.user.id = token.id as string;
      session.user.role = token.role as import("@/generated/prisma/client").GlobalRole;
      session.user.activeOrgId = (token.activeOrgId as string) ?? null;
      return session;
    },
  },
};
