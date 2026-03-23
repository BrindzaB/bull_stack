"use client"

import { useFormState, useFormStatus } from "react-dom"
import { registerAction } from "@/actions/auth"
import Link from "next/link"
import Image from "next/image"

function SubmitButton() {
  const { pending } = useFormStatus()
  return (
    <button
      type="submit"
      disabled={pending}
      className="btn-primary w-full"
    >
      {pending ? "Creating account..." : "Create account"}
    </button>
  )
}

export function RegisterForm() {
  const [state, formAction] = useFormState(registerAction, null)

  return (
    <div className="card w-full max-w-md p-8">
      <Image src="/logo.png" alt="BullStack" width={140} height={38} className="mb-5" />

      <h1 className="text-display-sm text-[#f8f5fd]">Create an account</h1>
      <p className="mt-1 text-sm text-white/55">Start tracking your portfolio today</p>

      <form action={formAction} className="mt-6 space-y-4">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-white/75 mb-1">
            Name
          </label>
          <input
            id="name"
            name="name"
            type="text"
            required
            autoComplete="name"
            className="input-base"
          />
          {state?.errors?.name && (
            <p className="text-xs text-down mt-1">{state.errors.name[0]}</p>
          )}
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-medium text-white/75 mb-1">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            autoComplete="email"
            className="input-base"
          />
          {state?.errors?.email && (
            <p className="text-xs text-down mt-1">{state.errors.email[0]}</p>
          )}
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-white/75 mb-1">
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            required
            autoComplete="new-password"
            className="input-base"
          />
          {state?.errors?.password && (
            <p className="text-xs text-down mt-1">{state.errors.password[0]}</p>
          )}
        </div>

        <SubmitButton />
      </form>

      <p className="mt-6 text-center text-xs text-white/50">
        Already have an account?{" "}
        <Link href="/login" className="font-medium text-[#22d3ee] hover:text-[#67e8f9] underline underline-offset-2">
          Sign in
        </Link>
      </p>
    </div>
  )
}
