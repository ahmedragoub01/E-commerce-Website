"use client"

import type React from "react"

import { signIn, useSession } from "next-auth/react"
import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Separator } from "@/components/ui/separator"
import { FcGoogle } from "react-icons/fc"
import { FaFacebook } from "react-icons/fa"
import { motion } from "framer-motion"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [shake, setShake] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()
  const callbackUrl = searchParams.get("callbackUrl") || "/home"

  const { data: session, status } = useSession()

  useEffect(() => {
    if (status === "authenticated" && session) {
      setIsLoading(false)
      router.push(callbackUrl)
    }
  }, [session, status, router, callbackUrl])

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
        callbackUrl,
      })

      if (result?.error || result?.ok === false) {
        setError("Invalid email or password")
        setIsLoading(false)
        setShake(true)
        setTimeout(() => setShake(false), 500)
      }
      // If successful, the useEffect will handle the redirect
    } catch (error) {
      setError("An unexpected error occurred")
      setIsLoading(false)
      setShake(true)
      setTimeout(() => setShake(false), 500)
    }
  }

  if (status === "loading") {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin bg-indigo-600 rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="max-w-md mx-auto mt-10 p-6">
      <motion.div
        animate={shake ? { x: [-10, 10, -10, 10, -5, 5, -2, 2, 0] } : {}}
        transition={{ duration: 0.5 }}
      >
        <Card className={error ? "border-red-500 shadow-lg" : ""}>
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold text-center">Sign In</CardTitle>
            <CardDescription className="text-center">Enter your credentials to access your account</CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            {error && (
              <Alert variant="destructive" className="bg-red-50 border-red-500">
                <AlertDescription className="font-medium flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                  {error}
                </AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleEmailLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  required
                  className={error ? "border-red-500 focus:ring-red-500" : ""}
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Password</Label>
                  <Button variant="link" className="px-0 font-normal h-auto text-gray-600" asChild>
                    <a href="/forgot-password">Forgot password?</a>
                  </Button>
                </div>
                <Input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className={error ? "border-red-500 focus:ring-red-500" : ""}
                />
              </div>

              <Button 
                type="submit" 
                disabled={isLoading} 
                className="w-full bg-indigo-600 hover:bg-indigo-700 cursor-pointer transition-all duration-150 transform hover:scale-[1.02]"
              >
                {isLoading ? "Signing in..." : "Sign in with Email"}
              </Button>
            </form>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <Separator className="w-full" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="px-2 bg-white text-muted-foreground">Or continue with</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Button variant="outline" onClick={() => signIn("google", { callbackUrl })} className="flex items-center cursor-pointer justify-center gap-2 transition-all duration-100 transform hover:scale-[1.05] hover:bg-gray-50">
                <FcGoogle size={20} /> Google
              </Button>

              <Button variant="outline" onClick={() => signIn("facebook", { callbackUrl })} className="flex items-center cursor-pointer justify-center gap-2 transition-all duration-100 transform hover:scale-[1.05] hover:bg-gray-50">
                <FaFacebook size={20} className="text-blue-600" /> Facebook
              </Button>
            </div>
          </CardContent>

          <CardFooter className="flex flex-col">
            <div className="text-center text-sm">
              Don&apos;t have an account?{" "}
              <Button variant="link" className="px-0 font-normal h-auto text-indigo-600" asChild>
                <a href="/register">Sign up</a>
              </Button>
            </div>
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  )
}