"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"

const BACKEND_API_URL = process.env.NEXT_PUBLIC_BACKEND_API_URL;

export default function SignUpPage() {
  const { toast } = useToast()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch(`${BACKEND_API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contact: email, // Using 'contact' as the field for email in UserSchema
          password: password, // Send password for hashing on backend
          role: "VOLUNTEER", // Default role for new sign-ups
          consent_face_qr: false, // Default consent
        }),
      });

      if (response.ok) {
        toast({ title: "Signed up", description: "Account created successfully!" });
        window.location.href = "/auth/sign-in";
      } else {
        const errorData = await response.json();
        toast({ title: "Sign up failed", description: errorData.detail || "Registration failed", variant: "destructive" });
      }
    } catch (error: any) {
      toast({ title: "Error", description: error.message || "An unexpected error occurred", variant: "destructive" });
    }
    setLoading(false)
  }

  return (
    <div className="mx-auto max-w-sm px-4 py-10">
      <h1 className="text-2xl font-semibold mb-4 text-balance">Create account</h1>
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
          {loading ? "Signing up..." : "Sign up"}
        </Button>
      </form>
      <p className="text-sm mt-4">
        Already have an account?{" "}
        <Link href="/auth/sign-in" className="underline text-blue-600">
          Sign in
        </Link>
      </p>
    </div>
  )
}
