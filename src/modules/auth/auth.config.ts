import { type NextAuthConfig } from "next-auth";

export const authConfig: NextAuthConfig = {
  session: {
    strategy: "jwt",
    maxAge: 60 * 60,
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  callbacks: {
    async session({ session, token }) {
      session.user.id = token.id as string;
      session.user.role = token.role as string as "USER" | "SUPER_ADMIN";
      session.user.activeOrgId = (token.activeOrgId as string) ?? null;
      return session;
    },
  },
  providers: [],
};
