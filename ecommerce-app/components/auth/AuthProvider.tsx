"use client";

import React, { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import { FcGoogle } from "react-icons/fc";
import { FaFacebook } from "react-icons/fa";
import Link from "next/link";

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
import { Separator } from "@/components/ui/separator";

// Login validation schema
const loginSchema = z.object({
  email: z.string().email({ message: "Invalid email address" }),
  password: z.string().min(1, { message: "Password is required" }),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/home";

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await signIn("credentials", {
        ...data,
        redirect: false,
        callbackUrl,
      });

      if (result?.error) {
        setError("Invalid email or password");
        setIsLoading(false);
        return;
      }

      router.push(callbackUrl);
    } catch (error) {
      setError("An unexpected error occurred");
      setIsLoading(false);
    }
  };

  const handleSocialLogin = async (provider: "google" | "facebook") => {
    try {
      await signIn(provider, { callbackUrl });
    } catch (error) {
      setError(`${provider} login failed`);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="max-w-md mx-auto mt-10 p-6"
    >
      <Card>
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">
            Sign In
          </CardTitle>
          <CardDescription className="text-center">
            Enter your credentials to access your account
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {error && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative"
            >
              {error}
            </motion.div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                type="email"
                id="email"
                {...register("email")}
                placeholder="name@example.com"
                className={errors.email ? "border-red-500" : ""}
              />
              {errors.email && (
                <p className="text-xs text-red-500">{errors.email.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <Button
                  variant="link"
                  className="px-0 font-normal h-auto text-gray-600"
                  asChild
                >
                  <Link href="/forgot-password">Forgot password?</Link>
                </Button>
              </div>
              <Input
                type="password"
                id="password"
                {...register("password")}
                className={errors.password ? "border-red-500" : ""}
              />
              {errors.password && (
                <p className="text-xs text-red-500">
                  {errors.password.message}
                </p>
              )}
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="block mx-auto w-2/3 bg-blue-500 hover:bg-blue-600"
            >
              {isLoading ? "Signing in..." : "Sign in"}
            </Button>
          </form>

          <div className="relative my-4">
            <Separator />
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="px-2 text-muted-foreground text-xs uppercase">
                Or continue with
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Button
              variant="outline"
              onClick={() => handleSocialLogin("google")}
              className="flex items-center justify-center gap-2"
            >
              <FcGoogle size={20} /> Google
            </Button>

            <Button
              variant="outline"
              onClick={() => handleSocialLogin("facebook")}
              className="flex items-center justify-center gap-2"
            >
              <FaFacebook size={20} className="text-blue-600" /> Facebook
            </Button>
          </div>
        </CardContent>

        <CardFooter className="flex flex-col">
          <div className="text-center text-sm">
            Don't have an account?{" "}
            <Button
              variant="link"
              className="px-0 font-normal h-auto text-blue-500"
              asChild
            >
              <Link href="/signup">Sign up</Link>
            </Button>
          </div>
        </CardFooter>
      </Card>
    </motion.div>
  );
}
