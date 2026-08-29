import { type NextAuthConfig } from "next-auth";

export const authConfig: NextAuthConfig = {
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60,
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  callbacks: {
    async session({ session, token }) {
      session.user.id = token.id as string;
      session.user.role = token.role as string as "USER" | "SUPER_ADMIN";
      session.user.image = (token.image as string | null) ?? null;
      return session;
    },
  },
  providers: [],
};
