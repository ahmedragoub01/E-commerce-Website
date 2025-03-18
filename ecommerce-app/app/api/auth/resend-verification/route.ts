import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import { sendVerificationEmail, generateVerificationToken } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const { email } = await req.json();

  if (!email) {
    return NextResponse.json({ error: "Email is required" }, { status: 400 });
  }

  await connectDB();

  const user = await User.findOne({ email });

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  if (user.emailVerified) {
    return NextResponse.json({ error: "Email already verified" }, { status: 400 });
  }

  user.verificationToken = generateVerificationToken();
  user.verificationTokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);
  await user.save();

  await sendVerificationEmail(user);

  return NextResponse.json({ message: "Verification email resent" }, { status: 200 });
}
