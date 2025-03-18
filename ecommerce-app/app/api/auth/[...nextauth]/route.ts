import { NextAuthOptions } from "next-auth";
import { NextResponse } from "next/server";
import NextAuth from "next-auth/next";
import GoogleProvider from "next-auth/providers/google";
import FacebookProvider from "next-auth/providers/facebook";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";

console.log("route.ts");
export const authOptions: NextAuthOptions = {
    providers: [
      GoogleProvider({
        clientId: process.env.GOOGLE_CLIENT_ID as string,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
      }),
      FacebookProvider({
        clientId: process.env.FACEBOOK_CLIENT_ID as string,
        clientSecret: process.env.FACEBOOK_CLIENT_SECRET as string,
      }),
      CredentialsProvider({
        name: "Credentials",
        credentials: {
          email: { label: "Email", type: "email" },
          password: { label: "Password", type: "password" }
        },
        async authorize(credentials) {
          if (!credentials?.email || !credentials?.password) {
            return null;
          }
  
          await connectDB();
  
          const user = await User.findOne({ email: credentials.email });
          if (!user) {
            return null;
          }
  
          if (user.password) {
            const isPasswordValid = await bcrypt.compare(credentials.password, user.password);
            if (!isPasswordValid) {
              return null;
            }
  
            if (!user.emailVerified) {
              throw new Error("Email not verified");
            }
          }
  
          return {
            id: user._id.toString(),
            name: user.name,
            email: user.email,
            role: user.role,
            image: user.image,
          };
        }
      }),
    ],
    callbacks: {
      async signIn({ user, account, profile }) {
        if (account?.provider === "google" || account?.provider === "facebook") {
          await connectDB();
          
          const existingUser = await User.findOne({ email: user.email });
          
          if (existingUser) {
            if (!existingUser.image && user.image) {
              existingUser.image = user.image;
              await existingUser.save();
            }
            
            if (!existingUser.emailVerified) {
              existingUser.emailVerified = new Date();
              await existingUser.save();
            }
          } else {
            await User.create({
              name: user.name,
              email: user.email,
              image: user.image,
              emailVerified: new Date(),
              role: "user",
            });
          }
          
          return true;
        }
        
        return true;
      },
      async session({ session, token }) {
        if (token && session.user) {
          session.user.id = token.sub as string;
          
          await connectDB();
          const user = await User.findOne({ email: session.user.email });
          if (user) {
            session.user.role = user.role;
          }
        }
        return session;
      },
    },
    pages: {
      signIn: '/login',
      error: '/login',
    },
    session: {
      strategy: "jwt",
    },
    secret: process.env.NEXTAUTH_SECRET,
  };
  
  const handler = NextAuth(authOptions);
  
  export { handler as GET, handler as POST };  