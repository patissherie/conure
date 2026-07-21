"use client"

import type React from "react"
import { useState } from "react"
import { User, Mail, Lock, Eye, EyeOff } from "lucide-react"
import { Button } from "@/src/components/ui/button"
import { HuddleLogo } from "@/src/components/huddle-logo"
import { supabase } from "@/lib/supabaseClient"

export function SignupCard() {
  const [fullName, setFullName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    if (password !== confirmPassword) {
      setError("Passwords don't match")
      return
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName },   // this becomes raw_user_meta_data -> used by your trigger
      },
    })

    if (error) {
      setError(error.message)
      return
    }

    // Since your trigger auto-creates the public.users row on signup,
    // nothing else to do here except redirect.
    window.location.href = "/dashboard"   // or wherever, once email confirmation is off
  }

  async function handleGoogleSignup() {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    })
    if (error) setError(error.message)
  }

  return (
    <div className="w-full max-w-md rounded-[24px] bg-card px-8 py-10 shadow-[0_24px_60px_-20px_rgba(61,43,36,0.35)]">
      {/* Logo + wordmark */}
      <div className="mb-7 flex items-center justify-center gap-3">
        <HuddleLogo className="h-10 w-10" />
        <span className="font-serif text-3xl font-bold tracking-tight text-foreground">Huddle</span>
      </div>

      <div className="mb-7 text-center">
        <h1 className="font-serif text-2xl font-bold text-foreground text-balance">Create your account</h1>
        <p className="mt-1 text-sm text-muted-foreground text-pretty">
          Start planning memorable hangouts with your friends.
        </p>
      </div>

      {/* Continue with Google */}
      <Button
        type="button"
        variant="outline"
        onClick={handleGoogleSignup}
        className="h-12 w-full gap-3 rounded-2xl border-border bg-card text-base font-semibold text-foreground hover:bg-accent"
      >
        <GoogleIcon className="h-5 w-5" />
        Continue with Google
      </Button>

      {/* Divider */}
      <div className="my-6 flex items-center gap-4">
        <span className="h-px flex-1 bg-border" />
        <span className="text-xs font-medium tracking-wide text-muted-foreground">or continue with email</span>
        <span className="h-px flex-1 bg-border" />
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Field
          id="fullName"
          label="Full Name"
          icon={<User className="h-5 w-5" />}
        >
          <input
            id="fullName"
            type="text"
            required
            autoComplete="name"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="Your Name"
            className={inputClass}
          />
        </Field>

        <Field
          id="email"
          label="Email Address"
          icon={<Mail className="h-5 w-5" />}
        >
          <input
            id="email"
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className={inputClass}
          />
        </Field>

        <Field
          id="password"
          label="Password"
          icon={<Lock className="h-5 w-5" />}
        >
          <input
            id="password"
            type={showPassword ? "text" : "password"}
            required
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Create a password"
            className={`${inputClass} pr-11`}
          />
          <PasswordToggle
            shown={showPassword}
            onToggle={() => setShowPassword((s) => !s)}
            label="password"
          />
        </Field>

        <Field
          id="confirmPassword"
          label="Confirm Password"
          icon={<Lock className="h-5 w-5" />}
        >
          <input
            id="confirmPassword"
            type={showConfirm ? "text" : "password"}
            required
            autoComplete="new-password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Re-enter your password"
            className={`${inputClass} pr-11`}
          />
          <PasswordToggle
            shown={showConfirm}
            onToggle={() => setShowConfirm((s) => !s)}
            label="confirm password"
          />
        </Field>

        {error && <p className="text-sm text-red-600">{error}</p>}
        <Button
          type="submit"
          className="mt-2 h-14 w-full rounded-2xl bg-primary text-base font-bold text-primary-foreground shadow-[0_10px_24px_-8px_rgba(232,96,76,0.6)] hover:bg-primary/90"
        >
          Sign Up
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        {"Already have an account? "}
        <a href="/" className="font-semibold text-primary hover:underline">
          Sign In
        </a>
      </p>
    </div>
  )
}

const inputClass =
  "h-12 w-full rounded-2xl border border-input bg-muted/40 pl-11 pr-4 text-base text-foreground outline-none transition placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/30"

function Field({
  id,
  label,
  icon,
  children,
}: {
  id: string
  label: string
  icon: React.ReactNode
  children: React.ReactNode
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-sm font-semibold text-foreground">
        {label}
      </label>
      <div className="relative">
        <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground">
          {icon}
        </span>
        {children}
      </div>
    </div>
  )
}

function PasswordToggle({
  shown,
  onToggle,
  label,
}: {
  shown: boolean
  onToggle: () => void
  label: string
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-label={shown ? `Hide ${label}` : `Show ${label}`}
      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground transition hover:text-foreground"
    >
      {shown ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
    </button>
  )
}

function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M23.52 12.27c0-.79-.07-1.54-.2-2.27H12v4.51h6.47a5.53 5.53 0 0 1-2.4 3.63v3h3.88c2.27-2.09 3.57-5.17 3.57-8.87Z"
      />
      <path
        fill="#34A853"
        d="M12 24c3.24 0 5.96-1.08 7.95-2.91l-3.88-3c-1.08.72-2.45 1.16-4.07 1.16-3.13 0-5.78-2.11-6.73-4.96H1.28v3.09A12 12 0 0 0 12 24Z"
      />
      <path
        fill="#FBBC05"
        d="M5.27 14.29A7.2 7.2 0 0 1 4.89 12c0-.8.14-1.57.38-2.29V6.62H1.28A12 12 0 0 0 0 12c0 1.94.47 3.77 1.28 5.38l3.99-3.09Z"
      />
      <path
        fill="#EA4335"
        d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0A12 12 0 0 0 1.28 6.62l3.99 3.09C6.22 6.86 8.87 4.75 12 4.75Z"
      />
    </svg>
  )
}
