"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useSearchParams, useRouter } from "next/navigation";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { getSession } from "next-auth/react";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

// Email validation schema
const resendSchema = z.object({
  email: z.string().email({ message: "Invalid email address" }),
});

type ResendFormData = z.infer<typeof resendSchema>;

export default function VerificationProvider() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [verificationStatus, setVerificationStatus] = useState<
    "idle" | "verifying" | "success" | "error"
  >("idle");
  const [statusMessage, setStatusMessage] = useState<string>("");
  const [isResending, setIsResending] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);

  // Check for user session and email verification status
  useEffect(() => {
    const checkSessionAndVerify = async () => {
      const session = await getSession();

      // If no session, redirect to login
      if (!session) {
        router.push("/login");
        return;
      }

      // Set user's email for resend functionality
      setUserEmail(session.user.email || null);

      // Check for verification token
      const token = searchParams.get("token");
      if (token) {
        verifyEmail(token);
      }
    };

    checkSessionAndVerify();
  }, [searchParams, router]);

  const verifyEmail = async (token: string) => {
    setVerificationStatus("verifying");
    try {
      const response = await fetch(`/api/auth/verify?token=${token}`);
      const result = await response.json();

      if (response.ok) {
        setVerificationStatus("success");
        setStatusMessage(result.message);
      } else {
        setVerificationStatus("error");
        setStatusMessage(result.error);
      }
    } catch (error) {
      setVerificationStatus("error");
      setStatusMessage("An unexpected error occurred");
    }
  };

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResendFormData>({
    resolver: zodResolver(resendSchema),
    defaultValues: {
      email: userEmail || undefined,
    },
  });

  const onResend = async (data: ResendFormData) => {
    setIsResending(true);
    setStatusMessage("");

    try {
      const response = await fetch("/api/auth/resend-verification", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (response.ok) {
        setStatusMessage(result.message);
      } else {
        setStatusMessage(result.error);
      }
    } catch (error) {
      setStatusMessage("An unexpected error occurred");
    } finally {
      setIsResending(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="max-w-md mx-auto p-6"
    >
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">
            {verificationStatus === "success"
              ? "Email Verified"
              : verificationStatus === "error"
              ? "Verification Error"
              : "Verify Your Email"}
          </CardTitle>
          <CardDescription className="text-center">
            {verificationStatus === "success"
              ? "Your email has been successfully verified"
              : "Please verify your email to continue"}
          </CardDescription>
        </CardHeader>

        <CardContent>
          {(verificationStatus === "idle" ||
            verificationStatus === "error") && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-4"
            >
              {statusMessage && (
                <div
                  className={`p-3 rounded ${
                    verificationStatus === "error"
                      ? "bg-red-100 text-red-700"
                      : "bg-yellow-100 text-yellow-700"
                  }`}
                >
                  {statusMessage}
                </div>
              )}

              <form onSubmit={handleSubmit(onResend)} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    {...register("email")}
                    placeholder="john@example.com"
                    disabled={!!userEmail}
                    className={errors.email ? "border-red-500" : ""}
                  />
                  {errors.email && (
                    <p className="text-xs text-red-500">
                      {errors.email.message}
                    </p>
                  )}
                </div>

                <Button
                  type="submit"
                  disabled={isResending}
                  className="w-full bg-blue-500 hover:bg-blue-600"
                >
                  {isResending ? "Resending..." : "Resend Verification Email"}
                </Button>
              </form>
            </motion.div>
          )}

          {verificationStatus === "success" && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center space-y-4"
            >
              <div className="mb-4 text-green-600 flex justify-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-16 w-16"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <p className="text-gray-600 mb-4">{statusMessage}</p>
              <Button
                onClick={() => router.push("/home")}
                className="w-full bg-blue-500 hover:bg-blue-600"
              >
                Go to Home
              </Button>
            </motion.div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
