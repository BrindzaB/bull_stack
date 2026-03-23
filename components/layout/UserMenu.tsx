"use client"

import { signOut } from "next-auth/react"
import { Session } from "next-auth"
import { LogOut } from "lucide-react"

interface Props {
    session: Session
}

export function UserMenu({ session }: Props) {
    return (
        <div className="flex items-center gap-4">
            <span className="hidden text-xs text-white/50 sm:block">{session.user?.email}</span>
            <button
                onClick={() => signOut({ callbackUrl: "/login"})}
                className="text-xs font-medium text-white/70 transition-colors hover:text-[#22d3ee]"
            >
                <LogOut className="text-[#22d3ee] hover:text-[#67e8f9]"/>
            </button>
        </div>
    )
}
