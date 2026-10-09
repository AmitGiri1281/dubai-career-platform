import type { NextAuthConfig } from "next-auth";

export const authConfig = {
  providers: [],

  pages: {
    signIn: "/login",
    error: "/login",
  },

  session: {
    strategy: "jwt",
    maxAge: 60 * 60 * 24 * 7,
  },

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as { role?: string }).role;
      }

      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as
          | "USER"
          | "ADMIN"
          | "EDITOR";
      }

      return session;
    },

    authorized({ auth, request }) {
      const pathname = request.nextUrl.pathname;

      // Public routes
      if (!pathname.startsWith("/admin")) {
        return true;
      }

      // Admin route requires authentication
      if (!auth?.user) {
        return false;
      }

      const role = (auth.user as { role?: string }).role;

      // Only ADMIN and EDITOR can access admin
      return role === "ADMIN" || role === "EDITOR";
    },
  },
} satisfies NextAuthConfig;