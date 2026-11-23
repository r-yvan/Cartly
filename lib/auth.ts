import type { NextAuthOptions } from "next-auth";
import type { Adapter } from "next-auth/adapters";
import type { Provider } from "next-auth/providers/index";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import GitHubProvider from "next-auth/providers/github";
import { PrismaAdapter } from "@auth/prisma-adapter";
import bcrypt from "bcryptjs";
import prisma from "@/prisma/client";

const providers: Provider[] = [
  CredentialsProvider({
    id: "credentials",
    name: "Email & Password",
    credentials: {
      email: { label: "Email", type: "email" },
      password: { label: "Password", type: "password" },
    },
    async authorize(credentials) {
      const email = credentials?.email?.trim().toLowerCase();
      const password = credentials?.password;
      if (!email || !password) throw new Error("Enter your email and password");

      const user = await prisma.user.findUnique({ where: { email } });
      // Same message for both cases so the form can't be used to probe which emails exist.
      if (!user?.password || !(await bcrypt.compare(password, user.password))) {
        throw new Error("Incorrect email or password");
      }
      return { id: user.id, email: user.email, name: user.name, image: user.image, role: user.role };
    },
  }),
];

// OAuth providers are only registered when their credentials exist, so a
// missing key disables one button instead of breaking every sign-in.
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  providers.push(
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      // Google verifies email ownership, so linking to an existing
      // email/password account with the same address is safe.
      allowDangerousEmailAccountLinking: true,
    })
  );
}
if (process.env.GITHUB_ID && process.env.GITHUB_SECRET) {
  providers.push(
    GitHubProvider({
      clientId: process.env.GITHUB_ID,
      clientSecret: process.env.GITHUB_SECRET,
    })
  );
}

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma) as Adapter,
  providers,
  session: { strategy: "jwt" },
  secret: process.env.NEXTAUTH_SECRET,
  pages: { signIn: "/auth/signin", error: "/auth/error" },
  callbacks: {
    async jwt({ token, user }) {
      if (user) token.role = user.role ?? "USER";
      // Re-read the role so promotions (e.g. becoming a seller) apply
      // without forcing the user to sign out and back in.
      if (token.sub) {
        try {
          const dbUser = await prisma.user.findUnique({
            where: { id: token.sub },
            select: { role: true },
          });
          if (dbUser) token.role = dbUser.role;
        } catch {
          // Keep the last known role if the database is briefly unreachable.
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub!;
        session.user.role = token.role ?? "USER";
      }
      return session;
    },
  },
  events: {
    // Runs once when an OAuth sign-in creates a brand new user.
    async createUser({ user }) {
      const [firstName, ...rest] = (user.name ?? "").split(" ");
      await prisma.userProfile.create({
        data: {
          userId: user.id,
          firstName: firstName || null,
          lastName: rest.join(" ") || null,
          avatar: user.image ?? null,
        },
      });
    },
  },
};
