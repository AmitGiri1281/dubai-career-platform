import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";

import { prisma } from "@/lib/prisma";
import { loginSchema } from "@/lib/validations/user.schema";
import { authConfig } from "@/lib/auth.config";

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,

  providers: [
    Credentials({
      name: "Credentials",

      credentials: {
        email: {
          label: "Email",
          type: "email",
        },

        password: {
          label: "Password",
          type: "password",
        },
      },

      async authorize(credentials) {
        console.log("[AUTH] authorize called");

        const parsed = loginSchema.safeParse(credentials);

        if (!parsed.success) {
          console.log("[AUTH] Invalid credentials format");
          return null;
        }

        const email = parsed.data.email.toLowerCase().trim();
        const password = parsed.data.password;

        console.log("[AUTH] Looking for user:", email);

        const user = await prisma.user.findUnique({
          where: {
            email,
          },
        });

        if (!user) {
          console.log("[AUTH] User not found");
          return null;
        }

        if (!user.passwordHash) {
          console.log("[AUTH] User has no password hash");
          return null;
        }

        const passwordValid = await bcrypt.compare(
          password,
          user.passwordHash
        );

        if (!passwordValid) {
          console.log("[AUTH] Invalid password");
          return null;
        }

        console.log("[AUTH] Login successful:", user.email);
        console.log("[AUTH] Role:", user.role);

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
          role: user.role,
        };
      },
    }),
  ],
});