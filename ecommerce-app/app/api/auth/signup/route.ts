import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import { hashPassword, sendVerificationEmail, generateVerificationToken } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const { name, email, password } = await req.json();

    if (!name || !email || !password) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    await connectDB();

    const existingUser = await User.findOne({ email }).lean();
    if (existingUser) {
      return NextResponse.json({ error: "User already exists" }, { status: 409 });
    }

    const hashedPassword = await hashPassword(password);
    const newUser = await User.create({
      name,
      email,
      password: hashedPassword,
      role: "user",
      emailVerified: null,
      verificationToken: generateVerificationToken(),
      verificationTokenExpires: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
    });

    await sendVerificationEmail(newUser);

    return NextResponse.json({ message: "User created successfully. Please verify your email." }, { status: 201 });
  } catch (error: any) {
    console.error("Signup error:", error.message || error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
