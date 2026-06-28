import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import axios from "axios";

// Server-side: use 127.0.0.1 to avoid Node 18 IPv6-first DNS resolution
const API = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1").replace(
  "localhost",
  "127.0.0.1"
);

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        try {
          const { data } = await axios.post(`${API}/auth/login`, {
            email: credentials?.email,
            password: credentials?.password,
          });
          const { data: profile } = await axios.get(`${API}/users/me`, {
            headers: { Authorization: `Bearer ${data.access_token}` },
          });
          return {
            id: profile.id,
            name: profile.name,
            email: profile.email,
            accessToken: data.access_token,
            refreshToken: data.refresh_token,
          };
        } catch {
          return null;
        }
      },
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async signIn({ account, user }) {
      if (account?.provider === "google" && account.id_token) {
        try {
          const { data } = await axios.post(`${API}/auth/google`, {
            credential: account.id_token,
          });
          (user as any).accessToken = data.access_token;
          (user as any).refreshToken = data.refresh_token;
        } catch {
          return false;
        }
      }
      return true;
    },
    async jwt({ token, user }) {
      if (user) {
        token.accessToken = (user as any).accessToken;
        token.refreshToken = (user as any).refreshToken;
      }
      return token;
    },
    async session({ session, token }) {
      session.accessToken = token.accessToken as string;
      session.refreshToken = token.refreshToken as string;
      return session;
    },
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  session: { strategy: "jwt" },
};
