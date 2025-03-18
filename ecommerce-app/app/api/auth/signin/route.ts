import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ error: "Missing credentials" }, { status: 400 });
    }

    await connectDB();

    const user = await User.findOne({ email });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return NextResponse.json({ error: "Invalid password" }, { status: 401 });
    }

    // If email is not verified yet
    if (!user.emailVerified) {
      // Check if verification token is still valid
      const isTokenValid = user.verificationToken && 
                          user.verificationTokenExpires && 
                          new Date(user.verificationTokenExpires) > new Date();
      
      if (isTokenValid) {
        return NextResponse.json({ 
          error: "Email not verified", 
          message: "Please check your email for the verification link",
          isVerificationPending: true 
        }, { status: 403 });
      } else {
        // If token expired, offer option to resend verification email
        return NextResponse.json({ 
          error: "Email not verified", 
          message: "Verification link expired",
          isVerificationExpired: true
        }, { status: 403 });
      }
    }

    // Don't return the password in the response
    const userResponse = {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      emailVerified: user.emailVerified
    };

    return NextResponse.json({ 
      message: "Sign-in successful", 
      user: userResponse 
    }, { status: 200 });
  } catch (error: any) {
    console.error("Signin error:", error.message || error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}