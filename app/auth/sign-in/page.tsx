"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"

const BACKEND_API_URL = process.env.NEXT_PUBLIC_BACKEND_API_URL;

export default function SignInPage() {
  const { toast } = useToast()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)

    try {
      const formBody = new URLSearchParams();
      formBody.append("username", email);
      formBody.append("password", password);

      const response = await fetch(`${BACKEND_API_URL}/auth/token`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: formBody.toString(),
      });

      if (response.ok) {
        const data = await response.json();
        localStorage.setItem("access_token", data.access_token); // Store the JWT
        toast({ title: "Signed in", description: "Welcome back!" });
        window.location.href = "/";
      } else {
        const errorData = await response.json();
        toast({ title: "Sign in failed", description: errorData.detail || "Invalid credentials", variant: "destructive" });
      }
    } catch (error: any) {
      toast({ title: "Error", description: error.message || "An unexpected error occurred", variant: "destructive" });
    }
    setLoading(false)
  }

  return (
    <div className="mx-auto max-w-sm px-4 py-10">
      <h1 className="text-2xl font-semibold mb-4 text-balance">Sign in</h1>
      <form onSubmit={onSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        <Button disabled={loading} className="w-full h-11 bg-blue-600 hover:bg-blue-700 text-white">
          {loading ? "Signing in..." : "Sign in"}
        </Button>
      </form>
      <p className="text-sm mt-4">
        No account?{" "}
        <Link href="/auth/sign-up" className="underline text-blue-600">
          Sign up
        </Link>
      </p>
    </div>
  )
}
