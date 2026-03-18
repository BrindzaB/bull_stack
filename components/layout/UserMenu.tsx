"use client"

import { signOut } from "next-auth/react"
import { Session } from "next-auth"

interface Props {
    session: Session
}

export function UserMenu({ session }: Props) {
    return (
        <div className="flex items-center gap-4">
            <span className="hidden text-xs text-white/70 sm:block">{session.user?.email}</span>
            <button
                onClick={() => signOut({ callbackUrl: "/login"})}
                className="text-xs font-medium text-white/80 transition-colors hover:text-white"
            >
                Sign out
            </button>
        </div>
    )
}
