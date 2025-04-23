"use client";

import React, { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Send, CheckCircle, AlertCircle } from "lucide-react";

export default function ResendVerificationPage() {
  const router = useRouter();
  const [email, setEmail] = useState<string>("");
  const [status, setStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");
  const [message, setMessage] = useState<string>("");

  const handleResendVerification = async (e: FormEvent) => {
    e.preventDefault();
    setStatus("loading");

    try {
      const response = await fetch("/api/auth/resend-verification", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const result = await response.json();

      if (response.ok) {
        setStatus("success");
        setMessage(result.message || "Verification email resent successfully!");
      } else {
        setStatus("error");
        setMessage(result.error || "Failed to resend verification email");
      }
    } catch (error) {
      setStatus("error");
      setMessage("An unexpected error occurred");
    }
  };

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
            <CardTitle>Resend Verification Email</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {status === "idle" && (
              <form onSubmit={handleResendVerification} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <Button
                  type="submit"
                  className="w-full bg-blue-500 hover:bg-blue-600"
                  variant={"default"}
                  disabled={!email}
                >
                  <Send className="mr-2 h-4 w-4" />
                  Resend Verification Email
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  variant={"outline"}
                  onClick={() => router.push("/login")}
                >
                  Back to Login
                </Button>
              </form>
            )}

            {status === "loading" && (
              <div className="flex flex-col items-center space-y-4">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
                <p className="text-muted-foreground">
                  Sending verification email...
                </p>
              </div>
            )}

            {status === "success" && (
              <div className="space-y-4 text-center">
                <div className="flex justify-center">
                  <CheckCircle className="h-16 w-16 text-green-500" />
                </div>
                <p className="text-muted-foreground">{message}</p>
                <Button
                  onClick={() => router.push("/login")}
                  className="w-full bg-blue-500 hover:bg-blue-600"
                  variant={"default"}
                >
                  Go to Login
                </Button>
              </div>
            )}

            {status === "error" && (
              <div className="space-y-4 text-center">
                <div className="flex justify-center">
                  <AlertCircle className="h-16 w-16 text-destructive" />
                </div>
                <p className="text-destructive">{message}</p>
                <div className="space-y-2">
                  <Button
                    onClick={() => setStatus("idle")}
                    variant="outline"
                    className="w-full"
                  >
                    Try Again
                  </Button>
                  <Button
                    onClick={() => router.push("/login")}
                    className="w-full bg-blue-500 hover:bg-blue-600"
                    variant={"default"}
                  >
                    Back to Login
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
