"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, CheckCircle, AlertCircle } from "lucide-react";

export default function EmailVerificationPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [verificationStatus, setVerificationStatus] = useState<
    "loading" | "success" | "error"
  >("loading");
  const [message, setMessage] = useState<string>("");

  useEffect(() => {
    const token = searchParams.get("token");

    const verifyEmail = async () => {
      if (!token) {
        setVerificationStatus("error");
        setMessage("Invalid verification link");
        return;
      }

      try {
        const response = await fetch(`/api/auth/verify?token=${token}`, {
          method: "GET",
        });

        const result = await response.json();

        if (response.ok) {
          setVerificationStatus("success");
          setMessage(result.message || "Email verified successfully!");
        } else {
          setVerificationStatus("error");
          setMessage(result.error || "Verification failed");
        }
      } catch (error) {
        setVerificationStatus("error");
        setMessage("An unexpected error occurred");
      }
    };

    verifyEmail();
  }, [searchParams, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <Card>
          <CardHeader className="text-center">
            <CardTitle>
              {verificationStatus === "loading" && "Verifying Email"}
              {verificationStatus === "success" && "Email Verified"}
              {verificationStatus === "error" && "Verification Failed"}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-center">
            {verificationStatus === "loading" && (
              <div className="flex flex-col items-center space-y-4">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
                <p className="text-muted-foreground">Verifying your email...</p>
              </div>
            )}

            {verificationStatus === "success" && (
              <div className="space-y-4 bg-primary">
                <div className="flex justify-center">
                  <CheckCircle className="h-16 w-16 text-green-500" />
                </div>
                <p className="text-muted-foreground">{message}</p>
                <Button
                  onClick={() => router.push("/login")}
                  className="w-full bg-blue-500"
                  variant={"default"}
                >
                  Go to Login
                </Button>
              </div>
            )}

            {verificationStatus === "error" && (
              <div className="space-y-4">
                <div className="flex justify-center">
                  <AlertCircle className="h-16 w-16 text-destructive" />
                </div>
                <p className="text-destructive">{message}</p>
                <div className="space-y-2">
                  <Button
                    onClick={() => router.push("/login")}
                    variant="outline"
                    className="w-full"
                  >
                    Back to Login
                  </Button>
                  <Button
                    onClick={() => router.push("/resend-verification")}
                    className="w-full bg-blue-500 hover:bg-blue-600"
                    variant={"default"}
                  >
                    Resend Verification Email
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
