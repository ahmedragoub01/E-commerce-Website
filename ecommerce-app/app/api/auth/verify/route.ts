import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";

export async function GET(req: NextRequest) {
    const token = req.nextUrl.searchParams.get("token");
  
    if (!token) {
      return NextResponse.json({ error: "Missing token" }, { status: 400 });
    }
  
    try {
      await connectDB();
  
      const user = await User.findOne({
        verificationToken: token,
        verificationTokenExpires: { $gt: new Date() },
      });
  
      if (!user) {
        console.log("No user found with token:", token);
        return NextResponse.json({ error: "Token invalid or expired" }, { status: 400 });
      }
  
      // Mark the user as verified
      user.emailVerified = new Date();
      user.verificationToken = null;  // Use null instead of undefined
      user.verificationTokenExpires = null;  // Use null instead of undefined
  
      await user.save();
      
      console.log("User verified successfully:", user.email);
      return NextResponse.json({ message: "Email successfully verified!" }, { status: 200 });
    } catch (error) {
      console.error("Verification error:", error);
      return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
  }