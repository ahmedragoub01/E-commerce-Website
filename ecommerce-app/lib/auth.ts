import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { connectDB } from "./mongodb";
import User from "@/models/User";
import nodemailer from "nodemailer";
import crypto from "crypto";

// Function to hash password
export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

// Function to send email
export async function sendEmail(to: string, subject: string, html: string) {
  const transporter = nodemailer.createTransport({
    host: "sandbox.smtp.mailtrap.io",
    port: 587,
    secure: false,
    auth: {
      user: "1c83acb2b967d5",
      pass: "474dd9218064a9",
    },
  });

  return transporter.sendMail({
    from: "21financee@gmail.com",
    to,
    subject,
    html,
  });
}

// Function to create a verification token
export function generateVerificationToken() {
  return crypto.randomBytes(32).toString("hex");
}

// Function to send verification email
// Function to send verification email
export async function sendVerificationEmail(user: any) {
  // Don't generate a new token - use the one that's already set on the user
  const verificationUrl = `http://localhost:3000/api/auth/verify?token=${user.verificationToken}`;

  const html = `
    <p>Please click the link below to verify your email address:</p>
    <p><a href="${verificationUrl}">${verificationUrl}</a></p>
    <p>If you did not request this email, please ignore it.</p>
  `;

  await sendEmail(user.email, "Verify your email address", html);
}